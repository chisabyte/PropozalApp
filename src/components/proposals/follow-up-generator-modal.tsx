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
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Mail, Loader2, Copy, Check, Sparkles } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface FollowUpGeneratorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  proposalId: string
  proposalTitle: string
  clientName?: string | null
  hasBeenViewed?: boolean
}

type FollowUpTone = 
  | "friendly_checkin"
  | "professional_reminder"
  | "value_reinforcement"
  | "urgent"
  | "casual"

const TONE_OPTIONS: { value: FollowUpTone; label: string; description: string }[] = [
  { value: "friendly_checkin", label: "Friendly check-in", description: "Warm and approachable" },
  { value: "professional_reminder", label: "Professional reminder", description: "Formal and business-like" },
  { value: "value_reinforcement", label: "Value reinforcement", description: "Highlight benefits and value" },
  { value: "urgent", label: "Urgent/time-sensitive", description: "Create urgency without pressure" },
  { value: "casual", label: "Casual/conversational", description: "Relaxed and personable" },
]

export function FollowUpGeneratorModal({
  open,
  onOpenChange,
  proposalId,
  proposalTitle,
  clientName,
  hasBeenViewed = false,
}: FollowUpGeneratorModalProps) {
  const { toast } = useToast()
  const [tone, setTone] = useState<FollowUpTone>("friendly_checkin")
  const [mentionEngagement, setMentionEngagement] = useState(hasBeenViewed ? "yes" : "no")
  const [offerQuestions, setOfferQuestions] = useState(true)
  const [offerCall, setOfferCall] = useState(false)
  const [mentionAvailability, setMentionAvailability] = useState(false)
  const [mentionTimeline, setMentionTimeline] = useState(false)
  const [additionalContext, setAdditionalContext] = useState("")
  const [generating, setGenerating] = useState(false)
  const [generatedSubject, setGeneratedSubject] = useState("")
  const [generatedBody, setGeneratedBody] = useState("")
  const [followupId, setFollowupId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [showResult, setShowResult] = useState(false)

  const handleGenerate = async () => {
    setGenerating(true)
    
    // Only clear if we're not already showing results (fresh generation)
    if (!showResult) {
      setGeneratedSubject("")
      setGeneratedBody("")
    }

    try {
      const response = await fetch(`/api/proposals/${proposalId}/generate-follow-up`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tone,
          mention_engagement: mentionEngagement === "yes",
          offer_questions: offerQuestions,
          offer_call: offerCall,
          mention_availability: mentionAvailability,
          mention_timeline: mentionTimeline,
          additional_context: additionalContext,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to generate follow-up")
      }

      const data = await response.json()
      setGeneratedSubject(data.subject)
      setGeneratedBody(data.body)
      setFollowupId(data.followup_id)
      setShowResult(true)

      toast({
        title: "✨ Follow-up generated!",
        description: "Review and copy the message below",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate follow-up",
        variant: "destructive",
      })
    } finally {
      setGenerating(false)
    }
  }

  const handleCopy = async () => {
    const fullMessage = `Subject: ${generatedSubject}\n\n${generatedBody}`
    await navigator.clipboard.writeText(fullMessage)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast({
      title: "✓ Copied!",
      description: "Subject and message copied to clipboard",
    })
  }

  const handleSendEmail = async () => {
    const subject = encodeURIComponent(generatedSubject)
    const body = encodeURIComponent(generatedBody)
    
    // Mark follow-up as sent
    if (followupId) {
      try {
        await fetch(`/api/proposals/${proposalId}/generate-follow-up`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ followup_id: followupId }),
        })
      } catch (error) {
        console.error("Failed to mark follow-up as sent:", error)
      }
    }
    
    window.location.href = `mailto:?subject=${subject}&body=${body}`
  }

  const resetForm = () => {
    setGeneratedSubject("")
    setGeneratedBody("")
    setFollowupId(null)
    setCopied(false)
    setShowResult(false)
  }
  
  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) resetForm()
      onOpenChange(open)
    }}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Generate Follow-Up Message
          </DialogTitle>
          <DialogDescription>
            Let AI write a professional follow-up for "{proposalTitle}"
          </DialogDescription>
        </DialogHeader>

        {!showResult ? (
          <div className="space-y-6 py-4">
            {/* Tone Selection */}
            <div className="space-y-2">
              <Label>Follow-up tone</Label>
              <Select value={tone} onValueChange={(value) => setTone(value as FollowUpTone)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TONE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex flex-col">
                        <span>{option.label}</span>
                        <span className="text-xs text-muted-foreground">{option.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Mention Engagement */}
            {hasBeenViewed && (
              <div className="space-y-2">
                <Label>Mention engagement?</Label>
                <RadioGroup
                  value={mentionEngagement}
                  onValueChange={setMentionEngagement}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="mention-yes" />
                    <Label htmlFor="mention-yes" className="font-normal cursor-pointer">
                      Yes, mention they viewed the proposal
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="mention-no" />
                    <Label htmlFor="mention-no" className="font-normal cursor-pointer">
                      No, general follow-up
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            {/* Options Checkboxes */}
            <div className="space-y-3">
              <Label>Include in message</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="offer-questions"
                    checked={offerQuestions}
                    onCheckedChange={(checked) => setOfferQuestions(checked === true)}
                  />
                  <Label htmlFor="offer-questions" className="font-normal cursor-pointer text-sm">
                    Offer to answer questions
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="offer-call"
                    checked={offerCall}
                    onCheckedChange={(checked) => setOfferCall(checked === true)}
                  />
                  <Label htmlFor="offer-call" className="font-normal cursor-pointer text-sm">
                    Offer a quick call
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="mention-availability"
                    checked={mentionAvailability}
                    onCheckedChange={(checked) => setMentionAvailability(checked === true)}
                  />
                  <Label htmlFor="mention-availability" className="font-normal cursor-pointer text-sm">
                    Mention limited availability
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="mention-timeline"
                    checked={mentionTimeline}
                    onCheckedChange={(checked) => setMentionTimeline(checked === true)}
                  />
                  <Label htmlFor="mention-timeline" className="font-normal cursor-pointer text-sm">
                    Include project timeline reminder
                  </Label>
                </div>
              </div>
            </div>

            {/* Additional Context */}
            <div className="space-y-2">
              <Label htmlFor="additional-context">Additional context (optional)</Label>
              <Textarea
                id="additional-context"
                placeholder="e.g. I have 2 spots left this month, mentioned in our previous call..."
                value={additionalContext}
                onChange={(e) => setAdditionalContext(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {/* Generated Message */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Generated follow-up</Label>
                <Button variant="ghost" size="sm" onClick={() => setShowResult(false)}>
                  ← Back to options
                </Button>
              </div>
              
              <div className="space-y-3 border rounded-md p-4 bg-muted/20 relative">
                {generating && (
                  <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-md">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                )}
                <div className="space-y-1">
                  <Label htmlFor="subject" className="text-xs text-muted-foreground">Subject Line</Label>
                  <Input 
                    id="subject"
                    value={generatedSubject} 
                    onChange={(e) => setGeneratedSubject(e.target.value)}
                    className="font-medium"
                    disabled={generating}
                  />
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="body" className="text-xs text-muted-foreground">Message Body</Label>
                  <Textarea
                    id="body"
                    value={generatedBody}
                    onChange={(e) => setGeneratedBody(e.target.value)}
                    rows={12}
                    className="font-mono text-sm resize-none"
                    disabled={generating}
                  />
                </div>
              </div>

              <p className="text-xs text-muted-foreground mt-2">
                Feel free to edit the subject or message before sending
              </p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <Button onClick={handleGenerate} variant="outline" disabled={generating} className="gap-2">
                <Sparkles className="h-4 w-4" />
                Regenerate
              </Button>
              <Button onClick={handleCopy} variant="outline" disabled={generating} className="gap-2">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied!" : "Copy"}
              </Button>
              <Button onClick={handleSendEmail} disabled={generating} className="gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Button>
            </div>
          </div>
        )}

        <DialogFooter>
          {!showResult ? (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={generating}>
                Cancel
              </Button>
              <Button onClick={handleGenerate} disabled={generating} className="gap-2">
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate Follow-Up
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Done
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
