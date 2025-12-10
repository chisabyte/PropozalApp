"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Flame, Eye, Clock, ArrowRight, Loader2 } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

interface HotProposal {
  id: string
  title: string
  platform: string | null
  status: string
  uniqueSessions: number
  totalTimeSpent: number
  avgScrollDepth: number
  lastViewedAt: string | null
}

export function HotProposals() {
  const [proposals, setProposals] = useState<HotProposal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHotProposals()
  }, [])

  const fetchHotProposals = async () => {
    try {
      const response = await fetch("/api/proposals/hot")
      if (response.ok) {
        const data = await response.json()
        setProposals(data.proposals || [])
      }
    } catch (error) {
      console.error("Failed to fetch hot proposals:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    return `${minutes}m`
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
    return null // Don't show section if no hot proposals
  }

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500/5 to-red-500/5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          <CardTitle className="text-lg">Hot Proposals</CardTitle>
        </div>
        <CardDescription>
          Top proposals by engagement in the last 7 days
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {proposals.slice(0, 3).map((proposal) => (
            <Link
              key={proposal.id}
              href={`/dashboard/proposals/${proposal.id}`}
              className="flex items-center gap-4 rounded-xl p-4 bg-background hover:bg-muted/50 transition-all group border border-transparent hover:border-orange-500/20"
            >
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Flame className="h-5 w-5 text-orange-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                  {proposal.title}
                </h3>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {proposal.uniqueSessions} views
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTime(proposal.totalTimeSpent)} avg
                  </span>
                  <span>{proposal.avgScrollDepth}% read</span>
                </div>
              </div>
              <div className="text-right">
                {proposal.lastViewedAt && (
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(proposal.lastViewedAt), { addSuffix: true })}
                  </p>
                )}
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors ml-auto mt-1" />
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
