"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import { Loader2, Save, Download, Trash2, RotateCw, Check, Copy, Mail } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

import { QualityScoreBadge } from "@/components/quality-score-badge"
import { MarkWonModal } from "@/components/proposals/mark-won-modal"
import { MarkLostModal } from "@/components/proposals/mark-lost-modal"
import { EngagementMetrics } from "@/components/proposals/engagement-metrics"
import { ShareProposalModal } from "@/components/proposals/share-proposal-modal"
import { ExpirySettings } from "@/components/proposals/expiry-settings"
import { CountdownTimer } from "@/components/proposals/countdown-timer"
import { CloneProposalModal } from "@/components/proposals/clone-proposal-modal"
import { FollowUpGeneratorModal } from "@/components/proposals/follow-up-generator-modal"

interface Proposal {
  id: string
  title: string
  rfp_text: string
  generated_proposal: string
  status: string
  platform: string | null
  project_value: number | null
  quality_score: number | null
  quality_analysis: {
    strengths?: string[]
    weaknesses?: string[]
    suggestions?: string[]
    criteria?: {
      clarity: number
      relevance: number
      industryAlignment: number
      toneAccuracy: number
      differentiatorStrength: number
      structure: number
      platformFit: number
    }
  } | null
  sent_at: string | null
  won_at: string | null
  extracted_requirements: string | null
  created_at: string
  updated_at: string
  // Expiry fields
  expires_at: string | null
  expired_action: string | null
  expiry_message: string | null
  // Clone/template fields
  is_template: boolean
  cloned_from_id: string | null
  clone_count: number
  // Follow-up fields
  last_follow_up_at: string | null
  follow_up_count: number
  client_name: string | null
}

export default function ProposalEditorPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [proposal, setProposal] = useState<Proposal | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [regenerateDialogOpen, setRegenerateDialogOpen] = useState(false)
  const [toneAdjustment, setToneAdjustment] = useState<"more_formal" | "same" | "more_casual">("same")
  const [lengthAdjustment, setLengthAdjustment] = useState<"shorter" | "same" | "longer">("same")
  
  // Win/Loss modal states
  const [showWonModal, setShowWonModal] = useState(false)
  const [showLostModal, setShowLostModal] = useState(false)
  const [pendingStatus, setPendingStatus] = useState<string | null>(null)
  
  // Share modal state
  const [showShareModal, setShowShareModal] = useState(false)
  
  // Clone modal state
  const [showCloneModal, setShowCloneModal] = useState(false)
  
  // Follow-up modal state
  const [showFollowUpModal, setShowFollowUpModal] = useState(false)
  const [hasBeenViewed, setHasBeenViewed] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Start editing your proposal...",
      }),
    ],
    content: "",
  })

  useEffect(() => {
    fetchProposal()
  }, [params.id])

  useEffect(() => {
    if (editor && proposal?.generated_proposal) {
      editor.commands.setContent(proposal.generated_proposal)
    }
  }, [editor, proposal])

  const fetchProposal = async () => {
    try {
      const response = await fetch(`/api/proposals/${params.id}`)
      if (!response.ok) throw new Error("Failed to fetch proposal")
      
      const data = await response.json()
      setProposal(data)
      if (typeof data.has_been_viewed === 'boolean') {
        setHasBeenViewed(data.has_been_viewed)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load proposal",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!editor || !proposal) return

    setSaving(true)
    try {
      const response = await fetch(`/api/proposals/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: editor.getHTML(),
          title: proposal.title,
        }),
      })

      if (!response.ok) throw new Error("Failed to save")

      toast({
        title: "Saved",
        description: "Proposal saved successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save proposal",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleRegenerate = async () => {
    if (!proposal) return

    setRegenerating(true)
    try {
      const response = await fetch(`/api/proposals/${params.id}/regenerate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tone: toneAdjustment,
          length: lengthAdjustment,
        }),
      })

      if (!response.ok) throw new Error("Failed to regenerate")

      const data = await response.json()
      if (editor) {
        editor.commands.setContent(data.content)
      }
      
      setProposal({ ...proposal, generated_proposal: data.content })
      setRegenerateDialogOpen(false)
      
      toast({
        title: "Regenerated",
        description: "Proposal regenerated successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to regenerate proposal",
        variant: "destructive",
      })
    } finally {
      setRegenerating(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this proposal?")) return

    try {
      const response = await fetch(`/api/proposals/${params.id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete")

      toast({
        title: "Deleted",
        description: "Proposal deleted successfully",
      })
      router.push("/dashboard/proposals")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete proposal",
        variant: "destructive",
      })
    }
  }

  const handleDownloadPDF = () => {
    if (!editor || !proposal) return

    // Create a new window with just the proposal content for printing
    const printWindow = window.open("", "_blank")
    if (!printWindow) {
      toast({
        title: "Error",
        description: "Please allow popups to download PDF",
        variant: "destructive",
      })
      return
    }

    const content = editor.getHTML()
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${proposal.title}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #1a1a1a;
              padding: 40px 60px;
              max-width: 800px;
              margin: 0 auto;
            }
            h1 {
              font-size: 24px;
              margin-bottom: 8px;
              color: #0f172a;
            }
            .meta {
              font-size: 12px;
              color: #64748b;
              margin-bottom: 32px;
              padding-bottom: 16px;
              border-bottom: 1px solid #e2e8f0;
            }
            .content {
              font-size: 14px;
            }
            .content h1, .content h2, .content h3 {
              margin-top: 24px;
              margin-bottom: 12px;
            }
            .content h1 { font-size: 20px; }
            .content h2 { font-size: 18px; }
            .content h3 { font-size: 16px; }
            .content p {
              margin-bottom: 12px;
            }
            .content ul, .content ol {
              margin-bottom: 12px;
              padding-left: 24px;
            }
            .content li {
              margin-bottom: 4px;
            }
            .footer {
              margin-top: 48px;
              padding-top: 16px;
              border-top: 1px solid #e2e8f0;
              font-size: 11px;
              color: #94a3b8;
              text-align: center;
            }
            @media print {
              body { padding: 20px 40px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>${proposal.title}</h1>
          <div class="meta">
            ${proposal.platform ? `Platform: ${proposal.platform} • ` : ""}
            Created: ${new Date(proposal.created_at).toLocaleDateString()}
          </div>
          <div class="content">
            ${content}
          </div>
          <div class="footer">
            Generated with Propozzy
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()

    toast({
      title: "Print Dialog Opened",
      description: "Select 'Save as PDF' in the print dialog to download",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!proposal) {
    return <div>Proposal not found</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Input
            value={proposal.title}
            onChange={(e) => setProposal({ ...proposal, title: e.target.value })}
            className="text-2xl font-bold border-none shadow-none focus-visible:ring-0"
          />
          <Badge variant={proposal.status === "final" ? "default" : "secondary"}>
            {proposal.status}
          </Badge>
          {proposal.platform && (
            <Badge variant="outline">{proposal.platform}</Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
          <Dialog open={regenerateDialogOpen} onOpenChange={setRegenerateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <RotateCw className="mr-2 h-4 w-4" />
                Regenerate
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Regenerate Proposal</DialogTitle>
                <DialogDescription>
                  Adjust the tone and length of your proposal
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div>
                  <Label>Tone</Label>
                  <RadioGroup
                    value={toneAdjustment}
                    onValueChange={(value: any) => setToneAdjustment(value)}
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="more_formal" id="more_formal" />
                      <Label htmlFor="more_formal">More Formal</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="same" id="same" />
                      <Label htmlFor="same">Same</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="more_casual" id="more_casual" />
                      <Label htmlFor="more_casual">More Casual</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div>
                  <Label>Length</Label>
                  <RadioGroup
                    value={lengthAdjustment}
                    onValueChange={(value: any) => setLengthAdjustment(value)}
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="shorter" id="shorter" />
                      <Label htmlFor="shorter">Shorter</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="same" id="same_length" />
                      <Label htmlFor="same_length">Same</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="longer" id="longer" />
                      <Label htmlFor="longer">Longer</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setRegenerateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleRegenerate} disabled={regenerating}>
                  {regenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Regenerating...
                    </>
                  ) : (
                    "Regenerate"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save"}
          </Button>
          <Button variant="outline" onClick={handleDownloadPDF}>
            <Download className="mr-2 h-4 w-4" />
            PDF
          </Button>
          <Button variant="outline" onClick={() => setShowCloneModal(true)}>
            <Copy className="mr-2 h-4 w-4" />
            Clone
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Template/Clone info badges */}
      {(proposal.is_template || proposal.cloned_from_id || proposal.clone_count > 0) && (
        <div className="flex items-center gap-2 flex-wrap">
          {proposal.is_template && (
            <Badge variant="secondary" className="gap-1">
              📌 Template
            </Badge>
          )}
          {proposal.cloned_from_id && (
            <Badge variant="outline" className="gap-1">
              🔗 Cloned from another proposal
            </Badge>
          )}
          {proposal.clone_count > 0 && (
            <Badge variant="outline" className="gap-1">
              📋 Used as template {proposal.clone_count} time{proposal.clone_count > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[35%_65%]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Original RFP</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-[400px] overflow-y-auto whitespace-pre-wrap text-sm text-muted-foreground">
                {proposal.rfp_text}
              </div>
            </CardContent>
          </Card>

          {/* Extracted RFP Data */}
          {proposal.extracted_requirements && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Extracted Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {JSON.parse(proposal.extracted_requirements || '[]').map((req: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                      <span>{req}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Status Tracking */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <select
                  value={proposal.status}
                  onChange={async (e) => {
                    const newStatus = e.target.value
                    
                    // Intercept won/lost status changes to show modals
                    if (newStatus === "won") {
                      setPendingStatus("won")
                      setShowWonModal(true)
                      return
                    }
                    
                    if (newStatus === "lost") {
                      setPendingStatus("lost")
                      setShowLostModal(true)
                      return
                    }
                    
                    // For other statuses, update directly
                    try {
                      const response = await fetch(`/api/proposals/${proposal.id}/status`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: newStatus }),
                      })
                      if (response.ok) {
                        setProposal({ ...proposal, status: newStatus })
                        toast({
                          title: "Status updated",
                          description: `Proposal marked as ${newStatus}`,
                        })
                      }
                    } catch (error) {
                      toast({
                        title: "Error",
                        description: "Failed to update status",
                        variant: "destructive",
                      })
                    }
                  }}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="won">Won</option>
                  <option value="lost">Lost</option>
                  <option value="declined">Declined</option>
                </select>
                {proposal.sent_at && (
                  <p className="text-xs text-muted-foreground">
                    Sent: {new Date(proposal.sent_at).toLocaleDateString()}
                  </p>
                )}
                {proposal.won_at && (
                  <p className="text-xs text-green-600 font-medium">
                    Won: {new Date(proposal.won_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Client Engagement Metrics */}
          <EngagementMetrics 
            proposalId={proposal.id} 
            onShareClick={() => setShowShareModal(true)}
          />

          {/* Follow-Up Button - Show for sent proposals */}
          {proposal.status === "sent" && (
            <Card className="bg-gradient-to-br from-blue-500/5 to-indigo-500/5 border-blue-500/20">
              <CardContent className="pt-6">
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto">
                    <Mail className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Need to follow up?</h3>
                    <p className="text-sm text-muted-foreground">
                      Generate a professional follow-up message
                    </p>
                  </div>
                  <Button 
                    onClick={() => setShowFollowUpModal(true)}
                    className="w-full gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    Generate Follow-Up
                  </Button>
                  {proposal.follow_up_count > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {proposal.follow_up_count} follow-up{proposal.follow_up_count > 1 ? 's' : ''} sent
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Expiry Settings */}
          <ExpirySettings
            proposalId={proposal.id}
            currentExpiresAt={proposal.expires_at}
            currentExpiredAction={proposal.expired_action}
            currentExpiryMessage={proposal.expiry_message}
            onUpdate={(data) => {
              setProposal({
                ...proposal,
                expires_at: data.expiresAt,
                expired_action: data.expiredAction,
                expiry_message: data.expiryMessage,
              })
            }}
          />

          {/* Show current expiry status if set */}
          {proposal.expires_at && (
            <div className="flex items-center gap-2">
              <CountdownTimer expiresAt={proposal.expires_at} size="sm" />
            </div>
          )}

          {/* Quality Score */}
          {proposal.quality_score !== null && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <span>Quality Score</span>
                  <QualityScoreBadge score={proposal.quality_score} />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {proposal.quality_analysis?.strengths && proposal.quality_analysis.strengths.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2 text-green-600 flex items-center gap-1">
                        <span>✅</span> Strengths
                      </h4>
                      <ul className="space-y-1.5 text-sm">
                        {proposal.quality_analysis.strengths.map((strength, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-green-500 mt-0.5">•</span>
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {proposal.quality_analysis?.weaknesses && proposal.quality_analysis.weaknesses.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2 text-amber-600 flex items-center gap-1">
                        <span>⚠️</span> Areas for Improvement
                      </h4>
                      <ul className="space-y-1.5 text-sm">
                        {proposal.quality_analysis.weaknesses.map((weakness, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-amber-500 mt-0.5">•</span>
                            <span>{weakness}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {proposal.quality_analysis?.suggestions && proposal.quality_analysis.suggestions.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2 text-blue-600 flex items-center gap-1">
                        <span>💡</span> Suggestions
                      </h4>
                      <ul className="space-y-1.5 text-sm">
                        {proposal.quality_analysis.suggestions.map((suggestion, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-blue-500 mt-0.5">•</span>
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {proposal.quality_analysis?.criteria && (
                    <div className="pt-2 border-t">
                      <h4 className="text-sm font-medium mb-3 text-muted-foreground">Evaluation Criteria</h4>
                      <div className="space-y-2 text-sm">
                        {Object.entries(proposal.quality_analysis.criteria).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between">
                            <span className="capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            <div className="flex items-center gap-2 w-32">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    value >= 8 ? 'bg-green-500' : 
                                    value >= 6 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${(value / 10) * 100}%` }}
                                />
                              </div>
                              <span className="text-xs font-medium w-4 text-right">{value}/10</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Proposal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none min-h-[600px]">
              <EditorContent editor={editor} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mark as Won Modal */}
      <MarkWonModal
        open={showWonModal}
        onOpenChange={setShowWonModal}
        proposalId={proposal.id}
        originalProjectValue={proposal.project_value}
        onSuccess={(data) => {
          setProposal({ 
            ...proposal, 
            status: "won",
            won_at: new Date().toISOString(),
          })
          toast({
            title: "🎉 Another win!",
            description: data.addToPortfolio 
              ? "We'll remind you to add this to your portfolio" 
              : `You've earned $${(data.projectValueActual / 100).toLocaleString()}!`,
          })
          setPendingStatus(null)
        }}
        onCancel={() => {
          setPendingStatus(null)
        }}
      />

      {/* Mark as Lost Modal */}
      <MarkLostModal
        open={showLostModal}
        onOpenChange={setShowLostModal}
        proposalId={proposal.id}
        onSuccess={() => {
          setProposal({ ...proposal, status: "lost" })
          toast({
            title: "Feedback saved",
            description: "Thanks for the feedback. Let's win the next one! 💪",
          })
          setPendingStatus(null)
        }}
        onSkip={() => {
          setProposal({ ...proposal, status: "lost" })
          toast({
            title: "Status updated",
            description: "Proposal marked as lost. Let's win the next one! 💪",
          })
          setPendingStatus(null)
        }}
      />

      {/* Share Proposal Modal */}
      <ShareProposalModal
        open={showShareModal}
        onOpenChange={setShowShareModal}
        proposalId={proposal.id}
        proposalTitle={proposal.title}
        onShare={(method) => {
          toast({
            title: "Link shared!",
            description: `Proposal shared via ${method}. You'll be notified when they view it.`,
          })
        }}
      />

      {/* Clone Proposal Modal */}
      <CloneProposalModal
        open={showCloneModal}
        onOpenChange={setShowCloneModal}
        proposalId={proposal.id}
        proposalTitle={proposal.title}
        isWon={proposal.status === "won"}
      />

      {/* Follow-Up Generator Modal */}
      <FollowUpGeneratorModal
        open={showFollowUpModal}
        onOpenChange={setShowFollowUpModal}
        proposalId={proposal.id}
        proposalTitle={proposal.title}
        clientName={proposal.client_name}
        hasBeenViewed={hasBeenViewed}
      />
    </div>
  )
}
