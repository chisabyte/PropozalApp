"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { Loader2, HeartHandshake } from "lucide-react"

const LOSS_REASONS = [
  { value: "price_too_high", label: "Price was too high" },
  { value: "went_with_someone_else", label: "Client went with someone else" },
  { value: "project_cancelled", label: "Client cancelled the project" },
  { value: "response_too_slow", label: "Response time was too slow" },
  { value: "proposal_mismatch", label: "Proposal didn't match their needs" },
  { value: "other", label: "Other" },
] as const

type LossReasonValue = typeof LOSS_REASONS[number]["value"]

interface MarkLostModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  proposalId: string
  onSuccess: (data: { lostReason: string }) => void
  onSkip: () => void
}

export function MarkLostModal({
  open,
  onOpenChange,
  proposalId,
  onSuccess,
  onSkip,
}: MarkLostModalProps) {
  const [selectedReason, setSelectedReason] = useState<LossReasonValue | "">("")
  const [otherReason, setOtherReason] = useState("")
  const [additionalNotes, setAdditionalNotes] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    setSaving(true)
    setError(null)

    try {
      // Build the lost reason string
      let lostReason = ""
      if (selectedReason === "other") {
        lostReason = otherReason || "Other (no details provided)"
      } else if (selectedReason) {
        const reasonLabel = LOSS_REASONS.find(r => r.value === selectedReason)?.label || selectedReason
        lostReason = reasonLabel
      }

      if (additionalNotes) {
        lostReason += ` | Notes: ${additionalNotes}`
      }

      const response = await fetch(`/api/proposals/${proposalId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "lost",
          lostReason: lostReason || null,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update proposal")
      }

      // Call success callback
      onSuccess({ lostReason })

      // Reset form
      resetForm()
      onOpenChange(false)
    } catch (err: any) {
      setError(err.message || "Something went wrong")
    } finally {
      setSaving(false)
    }
  }

  const handleSkip = async () => {
    setSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/proposals/${proposalId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "lost",
          lostReason: null,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update proposal")
      }

      onSkip()
      resetForm()
      onOpenChange(false)
    } catch (err: any) {
      setError(err.message || "Something went wrong")
    } finally {
      setSaving(false)
    }
  }

  const resetForm = () => {
    setSelectedReason("")
    setOtherReason("")
    setAdditionalNotes("")
    setError(null)
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      resetForm()
    }
    onOpenChange(isOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <HeartHandshake className="h-6 w-6 text-blue-500" />
            Help us learn
          </DialogTitle>
          <DialogDescription>
            Why did this proposal not win? Your feedback helps improve future proposals.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <Label>What happened?</Label>
            <RadioGroup
              value={selectedReason}
              onValueChange={(value) => setSelectedReason(value as LossReasonValue)}
              className="space-y-2"
            >
              {LOSS_REASONS.map((reason) => (
                <div key={reason.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={reason.value} id={reason.value} />
                  <Label htmlFor={reason.value} className="font-normal cursor-pointer">
                    {reason.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            {selectedReason === "other" && (
              <Input
                placeholder="Please specify..."
                value={otherReason}
                onChange={(e) => setOtherReason(e.target.value)}
                className="mt-2"
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="additional-notes">Any additional notes?</Label>
            <Textarea
              id="additional-notes"
              placeholder="Optional: Share any other details that might help..."
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              rows={3}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="ghost"
            onClick={handleSkip}
            disabled={saving}
            className="sm:mr-auto"
          >
            Skip
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Feedback"
            )}
          </Button>
        </DialogFooter>

        {/* Empathetic message shown after successful submission */}
      </DialogContent>
    </Dialog>
  )
}
