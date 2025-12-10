"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Clock, Copy, XCircle, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface ExpiredProposalActionsProps {
  proposalId: string
  proposalTitle: string
}

export function ExpiredProposalActions({
  proposalId,
  proposalTitle,
}: ExpiredProposalActionsProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [extending, setExtending] = useState(false)
  const [cloning, setCloning] = useState(false)
  const [markingLost, setMarkingLost] = useState(false)

  const handleExtend = async () => {
    setExtending(true)
    try {
      // Calculate new expiry date (7 days from now)
      const newExpiryDate = new Date()
      newExpiryDate.setDate(newExpiryDate.getDate() + 7)

      const response = await fetch(`/api/proposals/${proposalId}/expiry`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expiresAt: newExpiryDate.toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to extend expiry")
      }

      // Also update status back to sent if it was expired
      await fetch(`/api/proposals/${proposalId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "sent" }),
      })

      toast({
        title: "✓ Expiry extended",
        description: `Proposal will now expire on ${newExpiryDate.toLocaleDateString()}`,
      })

      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to extend expiry",
        variant: "destructive",
      })
    } finally {
      setExtending(false)
    }
  }

  const handleClone = async () => {
    setCloning(true)
    try {
      const response = await fetch(`/api/proposals/${proposalId}/clone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      if (!response.ok) {
        throw new Error("Failed to clone proposal")
      }

      const data = await response.json()

      toast({
        title: "✓ Proposal cloned",
        description: "Opening the new proposal...",
      })

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

  const handleMarkLost = async () => {
    setMarkingLost(true)
    try {
      const response = await fetch(`/api/proposals/${proposalId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "lost",
          lostReason: "Proposal expired without response",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update status")
      }

      toast({
        title: "Status updated",
        description: "Proposal marked as lost",
      })

      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      })
    } finally {
      setMarkingLost(false)
    }
  }

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleExtend}
              disabled={extending}
              className="h-8 w-8"
            >
              {extending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Clock className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Extend +7 days</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClone}
              disabled={cloning}
              className="h-8 w-8"
            >
              {cloning ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Clone & Resend</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleMarkLost}
              disabled={markingLost}
              className="h-8 w-8 text-muted-foreground hover:text-red-600"
            >
              {markingLost ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Mark as Lost</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
