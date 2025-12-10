"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, PartyPopper } from "lucide-react"
import confetti from "canvas-confetti"

interface MarkWonModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  proposalId: string
  originalProjectValue: number | null
  onSuccess: (data: {
    projectValueActual: number
    addToPortfolio: boolean
    winNotes: string
  }) => void
  onCancel: () => void
}

export function MarkWonModal({
  open,
  onOpenChange,
  proposalId,
  originalProjectValue,
  onSuccess,
  onCancel,
}: MarkWonModalProps) {
  const [projectValue, setProjectValue] = useState<string>("")
  const [addToPortfolio, setAddToPortfolio] = useState(true)
  const [winNotes, setWinNotes] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize project value from original when modal opens
  useEffect(() => {
    if (open && originalProjectValue) {
      // Convert from cents to dollars for display
      setProjectValue((originalProjectValue / 100).toString())
    }
  }, [open, originalProjectValue])

  const triggerConfetti = () => {
    // Fire confetti from both sides
    const count = 200
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 9999,
    }

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      })
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      origin: { x: 0.2, y: 0.7 },
    })
    fire(0.2, {
      spread: 60,
      origin: { x: 0.4, y: 0.7 },
    })
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
      origin: { x: 0.6, y: 0.7 },
    })
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
      origin: { x: 0.8, y: 0.7 },
    })
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
      origin: { x: 0.5, y: 0.7 },
    })
  }

  const handleSubmit = async () => {
    const valueNum = parseFloat(projectValue)
    if (isNaN(valueNum) || valueNum <= 0) {
      setError("Please enter a valid project value")
      return
    }

    setSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/proposals/${proposalId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "won",
          projectValueActual: Math.round(valueNum * 100), // Convert to cents
          addToPortfolio,
          winNotes,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update proposal")
      }

      // Trigger confetti animation
      triggerConfetti()

      // Call success callback
      onSuccess({
        projectValueActual: Math.round(valueNum * 100),
        addToPortfolio,
        winNotes,
      })

      // Reset form
      setProjectValue("")
      setAddToPortfolio(true)
      setWinNotes("")
      onOpenChange(false)
    } catch (err: any) {
      setError(err.message || "Something went wrong")
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setProjectValue("")
    setAddToPortfolio(true)
    setWinNotes("")
    setError(null)
    onCancel()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) handleCancel()
      else onOpenChange(isOpen)
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <PartyPopper className="h-6 w-6 text-yellow-500" />
            Congratulations on winning this project!
          </DialogTitle>
          <DialogDescription>
            Let's capture some details about your win to track your success.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="project-value">
              What was the final project value? <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                id="project-value"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={projectValue}
                onChange={(e) => setProjectValue(e.target.value)}
                className="pl-7"
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="add-portfolio"
              checked={addToPortfolio}
              onCheckedChange={(checked) => setAddToPortfolio(checked === true)}
            />
            <Label htmlFor="add-portfolio" className="text-sm font-normal cursor-pointer">
              Add this project to my portfolio
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="win-notes">
              Any notes about what made this proposal successful?
            </Label>
            <Textarea
              id="win-notes"
              placeholder="e.g., Client loved the personalized approach, quick response time helped..."
              value={winNotes}
              onChange={(e) => setWinNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving} className="gap-2">
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <PartyPopper className="h-4 w-4" />
                Save & Celebrate
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
