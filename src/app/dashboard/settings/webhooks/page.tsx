"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Webhook, Check, AlertCircle, RefreshCw, ExternalLink, Activity, Info } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface WebhookSettings {
  id: string
  webhook_url: string
  enabled: boolean
  events: string[]
  secret: string
}

interface WebhookDelivery {
  id: string
  event_type: string
  response_status: number
  delivered_at: string
  failed: boolean
  payload: any
  response_body: string
}

export default function WebhookSettingsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [settings, setSettings] = useState<WebhookSettings | null>(null)
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([])
  const [selectedDelivery, setSelectedDelivery] = useState<WebhookDelivery | null>(null)
  
  // Form state
  const [webhookUrl, setWebhookUrl] = useState("")
  const [enabled, setEnabled] = useState(true)
  const [selectedEvents, setSelectedEvents] = useState<string[]>([])

  const eventTypes = [
    { id: "proposal.created", label: "Proposal Created" },
    { id: "proposal.sent", label: "Proposal Sent" },
    { id: "proposal.viewed", label: "Proposal Viewed" },
    { id: "proposal.won", label: "Proposal Won" },
    { id: "proposal.lost", label: "Proposal Lost" },
  ]

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings/webhooks")
      if (response.ok) {
        const data = await response.json()
        if (data.settings) {
          setSettings(data.settings)
          setWebhookUrl(data.settings.webhook_url || "")
          setEnabled(data.settings.enabled)
          setSelectedEvents(data.settings.events || [])
        }
        if (data.deliveries) {
          setDeliveries(data.deliveries)
        }
      }
    } catch (error) {
      console.error("Failed to fetch webhook settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/settings/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          webhook_url: webhookUrl,
          events: selectedEvents,
          enabled
        })
      })

      if (!response.ok) throw new Error("Failed to save settings")

      const updatedSettings = await response.json()
      setSettings(updatedSettings)
      
      toast({
        title: "Settings saved",
        description: "Your webhook configuration has been updated.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save webhook settings.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleTest = async () => {
    if (!webhookUrl) {
      toast({
        title: "Missing URL",
        description: "Please enter a webhook URL first.",
        variant: "destructive",
      })
      return
    }

    setTesting(true)
    try {
      const response = await fetch("/api/settings/webhooks/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          webhook_url: webhookUrl,
          secret: settings?.secret
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "✓ Test Successful",
          description: `Received status ${data.status} from webhook endpoint.`,
        })
      } else {
        toast({
          title: "✗ Test Failed",
          description: `Error: ${data.error || `Status ${data.status}`}`,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send test webhook.",
        variant: "destructive",
      })
    } finally {
      setTesting(false)
    }
  }

  const toggleEvent = (eventId: string) => {
    if (selectedEvents.includes(eventId)) {
      setSelectedEvents(selectedEvents.filter(id => id !== eventId))
    } else {
      setSelectedEvents([...selectedEvents, eventId])
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            🔗 Webhook Integrations
          </h1>
          <p className="text-muted-foreground mt-1">
            Connect Propozzy to 5,000+ apps with Zapier or Make
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/settings/webhooks/docs">
            <Info className="mr-2 h-4 w-4" />
            Documentation
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
              <CardDescription>
                Webhooks let you automatically send data to other tools when events happen.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="url">Webhook URL</Label>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="enabled" 
                      checked={enabled}
                      onCheckedChange={setEnabled}
                    />
                    <Label htmlFor="enabled">Enabled</Label>
                  </div>
                </div>
                <Input
                  id="url"
                  placeholder="https://hooks.zapier.com/hooks/catch/..."
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Get this URL from Zapier, Make, or your custom endpoint.
                </p>
              </div>

              {settings?.secret && (
                <div className="space-y-2">
                  <Label>Signing Secret</Label>
                  <div className="flex items-center gap-2">
                    <code className="bg-muted px-2 py-1 rounded text-xs font-mono flex-1 truncate">
                      {settings.secret}
                    </code>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(settings.secret)
                        toast({ description: "Secret copied to clipboard" })
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Use this secret to verify signatures (X-Propozzy-Signature).
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <Label>Send events for:</Label>
                <div className="grid gap-2">
                  {eventTypes.map((event) => (
                    <div key={event.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={event.id}
                        checked={selectedEvents.includes(event.id)}
                        onCheckedChange={() => toggleEvent(event.id)}
                      />
                      <Label htmlFor={event.id} className="font-normal cursor-pointer">
                        {event.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t px-6 py-4">
              <Button variant="outline" onClick={handleTest} disabled={testing || !webhookUrl}>
                {testing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Activity className="mr-2 h-4 w-4" />}
                Test Webhook
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                Save Settings
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Deliveries</CardTitle>
              <CardDescription>
                Log of recent webhook attempts and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {deliveries.length > 0 ? (
                <div className="rounded-md border">
                  <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 p-4 border-b font-medium text-sm text-muted-foreground">
                    <div>Status</div>
                    <div>Event</div>
                    <div>Time</div>
                    <div></div>
                  </div>
                  {deliveries.map((delivery) => (
                    <div 
                      key={delivery.id} 
                      className="grid grid-cols-[auto_1fr_auto_auto] gap-4 p-4 border-b last:border-0 items-center hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedDelivery(delivery)}
                    >
                      <div>
                        {delivery.failed ? (
                          <div className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="h-4 w-4" />
                            <span className="text-xs font-medium">{delivery.response_status}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-green-600">
                            <Check className="h-4 w-4" />
                            <span className="text-xs font-medium">{delivery.response_status}</span>
                          </div>
                        )}
                      </div>
                      <div className="font-medium text-sm">
                        {delivery.event_type}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(delivery.delivered_at).toLocaleString()}
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No webhook deliveries yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20 border-indigo-100 dark:border-indigo-900">
            <CardHeader>
              <CardTitle className="text-lg">Quick Start</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Use with Zapier</h4>
                <p className="text-xs text-muted-foreground">
                  Create a "Webhooks by Zapier" trigger and choose "Catch Hook" to get your URL.
                </p>
                <Button variant="outline" size="sm" className="w-full text-xs" asChild>
                  <a href="https://zapier.com/apps/webhooks/integrations" target="_blank" rel="noopener noreferrer">
                    Open Zapier <ExternalLink className="ml-2 h-3 w-3" />
                  </a>
                </Button>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Use with Make</h4>
                <p className="text-xs text-muted-foreground">
                  Add a "Webhooks &gt; Custom webhook" module to generate your unique URL.
                </p>
                <Button variant="outline" size="sm" className="w-full text-xs" asChild>
                  <a href="https://www.make.com/en/help/tools/webhooks" target="_blank" rel="noopener noreferrer">
                    Open Make <ExternalLink className="ml-2 h-3 w-3" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={!!selectedDelivery} onOpenChange={(open) => !open && setSelectedDelivery(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Webhook className="h-5 w-5" />
              Delivery Details
            </DialogTitle>
            <DialogDescription>
              {selectedDelivery?.event_type} • {selectedDelivery && new Date(selectedDelivery.delivered_at).toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          
          {selectedDelivery && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/50 border">
                  <span className="text-xs font-medium text-muted-foreground uppercase">Status</span>
                  <div className={`mt-1 font-bold ${selectedDelivery.failed ? "text-red-600" : "text-green-600"}`}>
                    {selectedDelivery.response_status} {selectedDelivery.failed ? "Failed" : "Success"}
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 border">
                  <span className="text-xs font-medium text-muted-foreground uppercase">ID</span>
                  <div className="mt-1 font-mono text-xs truncate">
                    {selectedDelivery.id}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Request Payload</Label>
                <div className="bg-slate-950 text-slate-50 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-xs font-mono">
                    {JSON.stringify(selectedDelivery.payload, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Response Body</Label>
                <div className="bg-muted p-4 rounded-lg overflow-x-auto border">
                  <pre className="text-xs font-mono whitespace-pre-wrap">
                    {selectedDelivery.response_body || "(No response body)"}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
