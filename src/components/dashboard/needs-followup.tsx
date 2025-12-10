"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Eye, MessageSquare, ArrowRight, Loader2 } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

interface FollowUpProposal {
  id: string
  title: string
  platform: string | null
  status: string
  lastViewedAt: string | null
  daysSinceView: number
  viewCount: number
  reason?: string
}

export function NeedsFollowUp() {
  const [proposals, setProposals] = useState<FollowUpProposal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFollowUpProposals()
  }, [])

  const fetchFollowUpProposals = async () => {
    try {
      const response = await fetch("/api/proposals/needs-followup")
      if (response.ok) {
        const data = await response.json()
        setProposals(data.proposals || [])
      }
    } catch (error) {
      console.error("Failed to fetch follow-up proposals:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (proposals.length === 0) {
    return null // Don't show section if no proposals need follow-up
  }

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-500/5 to-yellow-500/5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-amber-500" />
          <CardTitle className="text-lg">Needs Follow-Up</CardTitle>
        </div>
        <CardDescription>
          Proposals pending response - time to check in!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {proposals.slice(0, 3).map((proposal) => (
            <div
              key={proposal.id}
              className="flex items-center gap-4 rounded-xl p-4 bg-background border border-transparent hover:border-amber-500/20 transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <Link 
                  href={`/dashboard/proposals/${proposal.id}`}
                  className="font-semibold truncate hover:text-primary transition-colors block"
                >
                  {proposal.title}
                </Link>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {proposal.reason === "sent" ? (
                      <>
                        <Clock className="h-3 w-3 mr-1" />
                        Sent {proposal.daysSinceView} days ago
                      </>
                    ) : (
                      <>
                        <Eye className="h-3 w-3 mr-1" />
                        Viewed {proposal.daysSinceView} days ago
                      </>
                    )}
                  </Badge>
                  {proposal.platform && (
                    <span className="text-xs text-muted-foreground">{proposal.platform}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  asChild
                  className="gap-1 text-amber-600 border-amber-500/30 hover:bg-amber-500/10"
                >
                  <Link href={`/dashboard/proposals/${proposal.id}`}>
                    <MessageSquare className="h-3 w-3" />
                    Follow Up
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        {proposals.length > 0 && (
          <p className="text-xs text-muted-foreground mt-4 text-center">
            💡 Tip: Following up within 48 hours of a view increases win rate by 40%
          </p>
        )}
      </CardContent>
    </Card>
  )
}
