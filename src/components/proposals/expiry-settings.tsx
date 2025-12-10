"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Clock, Loader2, Check, Calendar } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { format, addDays } from "date-fns"

interface ExpirySettingsProps {
  proposalId: string
  currentExpiresAt: string | null
  currentExpiredAction: string | null
  currentExpiryMessage: string | null
  onUpdate?: (data: {
    expiresAt: string | null
    expiredAction: string
    expiryMessage: string | null
  }) => void
}

type ExpiryPreset = "3days" | "7days" | "14days" | "30days" | "custom" | "none"

export function ExpirySettings({
  proposalId,
  currentExpiresAt,
  currentExpiredAction,
  currentExpiryMessage,
  onUpdate,
}: ExpirySettingsProps) {
  const { toast } = useToast()
  const [enabled, setEnabled] = useState(!!currentExpiresAt)
  const [preset, setPreset] = useState<ExpiryPreset>(() => {
    if (!currentExpiresAt) return "none"
    // Try to determine preset from current expiry
    return "custom"
  })
  const [customDate, setCustomDate] = useState<string>(() => {
    if (currentExpiresAt) {
      return format(new Date(currentExpiresAt), "yyyy-MM-dd")
    }
    return format(addDays(new Date(), 7), "yyyy-MM-dd")
  })
  const [expiredAction, setExpiredAction] = useState(currentExpiredAction || "show_message")
  const [expiryMessage, setExpiryMessage] = useState(currentExpiryMessage || "")
  const [saving, setSaving] = useState(false)

  // Calculate expiry date based on preset
  const calculateExpiryDate = (): Date | null => {
    if (!enabled) return null

    const now = new Date()
    switch (preset) {
      case "3days":
        return addDays(now, 3)
      case "7days":
        return addDays(now, 7)
      case "14days":
        return addDays(now, 14)
      case "30days":
        return addDays(now, 30)
      case "custom":
        return new Date(customDate)
      default:
        return null
    }
  }

  const handleSave = async () => {
    setSaving(true)

    try {
      const expiryDate = calculateExpiryDate()

      const response = await fetch(`/api/proposals/${proposalId}/expiry`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expiresAt: expiryDate?.toISOString() || null,
          expiredAction: enabled ? expiredAction : "show_message",
          expiryMessage: enabled && expiryMessage ? expiryMessage : null,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update expiry settings")
      }

      const data = await response.json()

      toast({
        title: enabled ? "✓ Expiry date set" : "✓ Expiry removed",
        description: enabled && expiryDate
          ? `Proposal will expire on ${format(expiryDate, "PPP")}`
          : "Proposal will not expire",
      })

      onUpdate?.({
        expiresAt: expiryDate?.toISOString() || null,
        expiredAction,
        expiryMessage: expiryMessage || null,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update expiry settings",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = (checked: boolean) => {
    setEnabled(checked)
    if (checked && preset === "none") {
      setPreset("7days") // Default to 7 days when enabling
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-500" />
            <CardTitle className="text-base">Expiry Settings</CardTitle>
          </div>
          <Switch
            checked={enabled}
            onCheckedChange={handleToggle}
          />
        </div>
        <CardDescription>
          Create urgency by setting an expiry date
        </CardDescription>
      </CardHeader>

      {enabled && (
        <CardContent className="space-y-4">
          {/* Expiry Duration Presets */}
          <div className="space-y-2">
            <Label>Expires in</Label>
            <RadioGroup
              value={preset}
              onValueChange={(value) => setPreset(value as ExpiryPreset)}
              className="grid grid-cols-2 gap-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="3days" id="3days" />
                <Label htmlFor="3days" className="font-normal cursor-pointer">3 days</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="7days" id="7days" />
                <Label htmlFor="7days" className="font-normal cursor-pointer">
                  7 days <span className="text-xs text-muted-foreground">(recommended)</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="14days" id="14days" />
                <Label htmlFor="14days" className="font-normal cursor-pointer">14 days</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="30days" id="30days" />
                <Label htmlFor="30days" className="font-normal cursor-pointer">30 days</Label>
              </div>
              <div className="flex items-center space-x-2 col-span-2">
                <RadioGroupItem value="custom" id="custom" />
                <Label htmlFor="custom" className="font-normal cursor-pointer">Custom date</Label>
              </div>
            </RadioGroup>

            {preset === "custom" && (
              <div className="mt-2">
                <Input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  min={format(new Date(), "yyyy-MM-dd")}
                  className="w-full"
                />
              </div>
            )}
          </div>

          {/* Expired Action */}
          <div className="space-y-2">
            <Label>When expired</Label>
            <Select value={expiredAction} onValueChange={setExpiredAction}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="show_message">Show expiry message</SelectItem>
                <SelectItem value="hide">Hide proposal completely</SelectItem>
                <SelectItem value="redirect">Redirect to contact page</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Custom Expiry Message */}
          {expiredAction === "show_message" && (
            <div className="space-y-2">
              <Label>Custom expiry message (optional)</Label>
              <Textarea
                placeholder="This proposal has expired. Please contact me for updated pricing."
                value={expiryMessage}
                onChange={(e) => setExpiryMessage(e.target.value)}
                rows={3}
              />
            </div>
          )}

          {/* Preview */}
          {preset !== "none" && (
            <div className="p-3 rounded-lg bg-muted/50 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  Expires on{" "}
                  <span className="font-medium">
                    {calculateExpiryDate() && format(calculateExpiryDate()!, "PPP 'at' p")}
                  </span>
                </span>
              </div>
            </div>
          )}

          {/* Save Button */}
          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Save Expiry Settings
              </>
            )}
          </Button>
        </CardContent>
      )}

      {!enabled && (
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Enable expiry to create urgency and encourage faster responses from clients.
          </p>
        </CardContent>
      )}
    </Card>
  )
}
