import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, FileCode, Shield, RefreshCw } from "lucide-react"

export default function WebhookDocsPage() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-bold mb-2">Webhook Documentation</h1>
        <p className="text-muted-foreground">
          Everything you need to integrate Propozzy with your external systems.
        </p>
      </div>

      <div className="grid gap-8">
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Overview</h2>
          <Card>
            <CardContent className="pt-6">
              <p className="leading-7">
                Webhooks allow you to subscribe to events happening in Propozzy. When one of these events is triggered, we'll send an HTTP POST payload to the webhook's configured URL. Webhooks can be used to update an external issue tracker, trigger CI builds, update a backup mirror, or deploy to your production server.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Event Types</h2>
          <div className="grid gap-4">
            <EventCard 
              type="proposal.created"
              description="Triggered when a new proposal draft is created."
              payload={{
                event: "proposal.created",
                timestamp: "2024-12-10T10:30:00Z",
                data: {
                  proposal_id: "uuid",
                  title: "Website Redesign",
                  platform: "upwork",
                  status: "draft",
                  project_value: 5000
                }
              }}
            />
            <EventCard 
              type="proposal.sent"
              description="Triggered when a proposal status changes to 'sent' or 'submitted'."
              payload={{
                event: "proposal.sent",
                timestamp: "2024-12-10T11:00:00Z",
                data: {
                  proposal_id: "uuid",
                  title: "Website Redesign",
                  status: "sent",
                  sent_at: "2024-12-10T11:00:00Z"
                }
              }}
            />
            <EventCard 
              type="proposal.viewed"
              description="Triggered when a client views the proposal link."
              payload={{
                event: "proposal.viewed",
                timestamp: "2024-12-10T14:30:00Z",
                data: {
                  proposal_id: "uuid",
                  title: "Website Redesign",
                  view_count: 3,
                  last_viewed_at: "2024-12-10T14:30:00Z"
                }
              }}
            />
            <EventCard 
              type="proposal.won"
              description="Triggered when a proposal is marked as won."
              payload={{
                event: "proposal.won",
                timestamp: "2024-12-12T09:00:00Z",
                data: {
                  proposal_id: "uuid",
                  title: "Website Redesign",
                  status: "won",
                  won_at: "2024-12-12T09:00:00Z",
                  project_value_actual: 5500
                }
              }}
            />
            <EventCard 
              type="proposal.lost"
              description="Triggered when a proposal is marked as lost."
              payload={{
                event: "proposal.lost",
                timestamp: "2024-12-13T10:00:00Z",
                data: {
                  proposal_id: "uuid",
                  title: "Website Redesign",
                  status: "lost",
                  lost_reason: "Price too high"
                }
              }}
            />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Security & Verification</h2>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                HMAC Signatures
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Propozzy includes an <code>X-Propozzy-Signature</code> header in every webhook request. This allows you to verify that the request genuinely came from us and hasn't been tampered with.
              </p>
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-4 flex gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
                <div>
                  <h4 className="font-semibold text-amber-900 dark:text-amber-100">Verification Algorithm</h4>
                  <div className="font-mono text-xs mt-1 text-amber-800 dark:text-amber-200">
                    signature = hmac_sha256(request_body, signing_secret)
                  </div>
                </div>
              </div>
              <div className="bg-slate-950 text-slate-50 p-4 rounded-lg overflow-x-auto">
                <pre className="text-xs font-mono">
{`const crypto = require('crypto');

function verifySignature(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(JSON.stringify(payload)).digest('hex');
  return signature === digest;
}`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Retry Policy</h2>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Automatic Retries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                If your endpoint returns a status code other than 2xx, or if the request times out, we will attempt to deliver the webhook up to 3 times with exponential backoff.
              </p>
              <ul className="list-disc list-inside mt-4 space-y-1 text-sm text-muted-foreground">
                <li>Attempt 1: Immediate</li>
                <li>Attempt 2: 1 second later</li>
                <li>Attempt 3: 5 seconds later</li>
              </ul>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}

function EventCard({ type, description, payload }: { type: string, description: string, payload: any }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="font-mono text-sm text-blue-600">{type}</CardTitle>
          <Badge variant="outline">Event</Badge>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-slate-950 text-slate-50 p-4 rounded-lg overflow-x-auto mt-2">
          <pre className="text-xs font-mono">
            {JSON.stringify(payload, null, 2)}
          </pre>
        </div>
      </CardContent>
    </Card>
  )
}
