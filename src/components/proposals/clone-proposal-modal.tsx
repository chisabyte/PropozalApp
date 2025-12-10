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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Copy, Loader2, Sparkles, FileText, Layers } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface CloneProposalModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  proposalId: string
  proposalTitle: string
  isWon?: boolean
}

type CloneType = "structure_and_portfolio" | "structure_only" | "full_clone"

export function CloneProposalModal({
  open,
  onOpenChange,
  proposalId,
  proposalTitle,
  isWon = false,
}: CloneProposalModalProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [cloneType, setCloneType] = useState<CloneType>("structure_and_portfolio")
  const [markAsTemplate, setMarkAsTemplate] = useState(false)
  const [newTitle, setNewTitle] = useState(`${proposalTitle} - Copy`)
  const [cloning, setCloning] = useState(false)

  const handleClone = async () => {
    if (!newTitle.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for the cloned proposal",
        variant: "destructive",
      })
      return
    }

    setCloning(true)

    try {
      const response = await fetch(`/api/proposals/${proposalId}/clone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clone_type: cloneType,
          mark_as_template: markAsTemplate,
          new_title: newTitle.trim(),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to clone proposal")
      }

      const data = await response.json()

      toast({
        title: "✓ Proposal cloned!",
        description: markAsTemplate 
          ? "Original saved as template. Opening your new proposal..."
          : "Opening your new proposal...",
      })

      onOpenChange(false)
      router.push(`/dashboard/proposals/${data.proposal.id}`)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to clone proposal",
        variant: "destructive",
      })
    } finally {
      setCloning(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="h-5 w-5" />
            Clone this proposal?
          </DialogTitle>
          <DialogDescription>
            Create a copy to use for a similar project
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Clone Type Selection */}
          <div className="space-y-3">
            <Label>What to clone</Label>
            <RadioGroup
              value={cloneType}
              onValueChange={(value) => setCloneType(value as CloneType)}
              className="space-y-3"
            >
              <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="structure_and_portfolio" id="structure_and_portfolio" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="structure_and_portfolio" className="font-medium cursor-pointer flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Clone structure & portfolio matches
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Recommended</span>
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Keep the same tone, platform, and portfolio items
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="structure_only" id="structure_only" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="structure_only" className="font-medium cursor-pointer flex items-center gap-2">
                    <Layers className="h-4 w-4 text-blue-500" />
                    Clone structure only
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Keep tone and platform, but I'll select different portfolio items
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="full_clone" id="full_clone" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="full_clone" className="font-medium cursor-pointer flex items-center gap-2">
                    <FileText className="h-4 w-4 text-amber-500" />
                    Full clone (exact copy)
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Duplicate everything including the RFP text
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Mark as Template */}
          <div className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50 border">
            <Checkbox
              id="mark-template"
              checked={markAsTemplate}
              onCheckedChange={(checked) => setMarkAsTemplate(checked === true)}
              className="mt-0.5"
            />
            <div>
              <Label htmlFor="mark-template" className="font-medium cursor-pointer">
                🎯 Mark original as template
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Save original proposal as a reusable template
              </p>
            </div>
          </div>

          {/* New Title */}
          <div className="space-y-2">
            <Label htmlFor="new-title">
              New proposal title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="new-title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Enter a title for the cloned proposal"
            />
          </div>

          {/* Winning proposal hint */}
          {isWon && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-sm">
              <p className="font-medium text-emerald-700">🏆 This is a winning proposal!</p>
              <p className="text-emerald-600 mt-1">
                Cloning winning proposals helps you replicate success. Consider marking it as a template.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={cloning}>
            Cancel
          </Button>
          <Button onClick={handleClone} disabled={cloning} className="gap-2">
            {cloning ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Cloning...
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Clone Proposal
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
