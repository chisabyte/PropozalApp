"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trophy, Copy, ArrowRight, Loader2 } from "lucide-react"
import Link from "next/link"
import { CloneProposalModal } from "@/components/proposals/clone-proposal-modal"

interface WinningProposal {
  id: string
  title: string
  platform: string | null
  project_value_actual: number | null
  won_at: string
  clone_count: number
}

export function ReuseWinners() {
  const [proposals, setProposals] = useState<WinningProposal[]>([])
  const [loading, setLoading] = useState(true)
  const [cloneModalOpen, setCloneModalOpen] = useState(false)
  const [selectedProposal, setSelectedProposal] = useState<WinningProposal | null>(null)

  useEffect(() => {
    fetchWinningProposals()
  }, [])

  const fetchWinningProposals = async () => {
    try {
      const response = await fetch("/api/proposals/winning")
      if (response.ok) {
        const data = await response.json()
        setProposals(data.proposals || [])
      }
    } catch (error) {
      console.error("Failed to fetch winning proposals:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleClone = (proposal: WinningProposal) => {
    setSelectedProposal(proposal)
    setCloneModalOpen(true)
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
    return null // Don't show if no winning proposals
  }

  return (
    <>
      <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500/5 to-teal-500/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-emerald-500" />
            <CardTitle className="text-lg">Reuse Your Winners</CardTitle>
          </div>
          <CardDescription>
            Clone your winning proposals to save time and replicate success
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {proposals.slice(0, 3).map((proposal) => (
              <div
                key={proposal.id}
                className="flex items-center gap-4 rounded-xl p-4 bg-background hover:bg-muted/50 transition-all group border border-transparent hover:border-emerald-500/20"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-emerald-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <Link 
                    href={`/dashboard/proposals/${proposal.id}`}
                    className="font-semibold truncate group-hover:text-primary transition-colors block"
                  >
                    {proposal.title}
                  </Link>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    {proposal.platform && (
                      <Badge variant="outline" className="text-xs">
                        {proposal.platform}
                      </Badge>
                    )}
                    {proposal.project_value_actual && (
                      <span className="text-emerald-600 font-medium">
                        Won ${(proposal.project_value_actual / 100).toLocaleString()}
                      </span>
                    )}
                    {proposal.clone_count > 0 && (
                      <span>Cloned {proposal.clone_count}x</span>
                    )}
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleClone(proposal)}
                  className="gap-1 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10"
                >
                  <Copy className="h-3 w-3" />
                  Clone
                </Button>
              </div>
            ))}
          </div>

          {proposals.length > 3 && (
            <div className="mt-4 text-center">
              <Button variant="ghost" size="sm" asChild className="gap-1">
                <Link href="/dashboard/proposals?status=won">
                  View all winning proposals
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            </div>
          )}

          <p className="text-xs text-muted-foreground mt-4 text-center">
            💡 Tip: Cloned proposals have a higher win rate because they use proven formulas
          </p>
        </CardContent>
      </Card>

      {/* Clone Modal */}
      {selectedProposal && (
        <CloneProposalModal
          open={cloneModalOpen}
          onOpenChange={setCloneModalOpen}
          proposalId={selectedProposal.id}
          proposalTitle={selectedProposal.title}
          isWon={true}
        />
      )}
    </>
  )
}
