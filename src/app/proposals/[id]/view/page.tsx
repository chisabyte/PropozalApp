"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Download, Share2, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface Proposal {
  id: string
  title: string
  generated_proposal: string
  platform: string | null
  client_name: string | null
  created_at: string
  status: string
}

export default function ProposalViewPage() {
  const params = useParams()
  const [proposal, setProposal] = useState<Proposal | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewing, setViewing] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchProposal()
      trackView()
    }
  }, [params.id])

  const fetchProposal = async () => {
    try {
      const response = await fetch(`/api/proposals/${params.id}`)
      if (!response.ok) throw new Error("Failed to fetch proposal")
      const data = await response.json()
      setProposal(data)
    } catch (error) {
      console.error("Error fetching proposal:", error)
    } finally {
      setLoading(false)
    }
  }

  const trackView = async () => {
    try {
      await fetch(`/api/proposals/${params.id}/view`, {
        method: "POST",
      })
    } catch (error) {
      // Silent fail for tracking
    }
  }

  const handleDownloadPDF = async () => {
    try {
      const response = await fetch(`/api/proposals/${params.id}/export-pdf`, {
        method: "POST",
      })
      if (!response.ok) throw new Error("Failed to generate PDF")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${proposal?.title || "proposal"}.pdf`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error downloading PDF:", error)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: proposal?.title || "Proposal",
          text: "Check out this proposal",
          url: window.location.href,
        })
      } catch (error) {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert("Link copied to clipboard!")
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!proposal) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Proposal not found</h1>
          <Link href="/dashboard">
            <Button>Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/proposals">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold">{proposal.title}</h1>
                {proposal.platform && (
                  <Badge variant="outline" className="mt-1">
                    {proposal.platform}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
              <Button onClick={handleDownloadPDF}>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Proposal Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="shadow-lg">
          <CardContent className="p-8 md:p-12">
            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: proposal.generated_proposal }}
              style={{
                fontFamily: "'Inter', sans-serif",
                lineHeight: "1.7",
                color: "#1f2937",
              }}
            />
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Generated by ProposalForge • {new Date(proposal.created_at).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  )
}

