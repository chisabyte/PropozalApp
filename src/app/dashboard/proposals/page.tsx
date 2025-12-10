import { getCurrentUser } from "@/lib/auth"
import { getSupabaseAdmin } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"
import { formatRelativeTime } from "@/lib/utils"
import { Plus, Search, Sparkles, ArrowUpDown, FileText } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProposalActions } from "@/components/proposal-actions"
import { QualityScoreBadge } from "@/components/quality-score-badge"
import { ProposalFilters } from "@/components/proposals/proposal-filters"

import { ExpiredProposalActions } from "@/components/proposals/expired-proposal-actions"
import { TemplatesSection } from "@/components/proposals/templates-section"

const STATUS_CONFIG: Record<string, { bg: string; text: string; icon: string }> = {
  won: { bg: "bg-emerald-500/10", text: "text-emerald-600", icon: "🏆" },
  lost: { bg: "bg-red-500/10", text: "text-red-600", icon: "❌" },
  sent: { bg: "bg-blue-500/10", text: "text-blue-600", icon: "📤" },
  draft: { bg: "bg-slate-500/10", text: "text-slate-600", icon: "📝" },
  final: { bg: "bg-purple-500/10", text: "text-purple-600", icon: "✅" },
  declined: { bg: "bg-orange-500/10", text: "text-orange-600", icon: "🚫" },
  expired: { bg: "bg-gray-500/10", text: "text-gray-600", icon: "⏰" },
}

// Helper to check if proposal is expired
function isProposalExpired(proposal: any): boolean {
  if (!proposal.expires_at) return false
  return new Date() > new Date(proposal.expires_at)
}

export default async function ProposalsPage({
  searchParams,
}: {
  searchParams: { sort?: string; platform?: string; status?: string }
}) {
  const user = await getCurrentUser()
  
  if (!user) {
    return <div>Loading...</div>
  }

  const supabase = getSupabaseAdmin()

  let query = supabase
    .from("proposals")
    .select("*")
    .eq("user_id", user.id)

  // Apply filters
  if (searchParams?.platform && searchParams.platform !== "all") {
    query = query.eq("platform", searchParams.platform)
  }

  if (searchParams?.status && searchParams.status !== "all") {
    query = query.eq("status", searchParams.status)
  }

  // Apply sorting
  const sortBy = searchParams?.sort || "newest"
  switch (sortBy) {
    case "score":
      query = query.order("quality_score", { ascending: false, nullsLast: true })
      break
    case "value":
      query = query.order("project_value", { ascending: false, nullsLast: true })
      break
    case "platform":
      query = query.order("platform", { ascending: true })
      break
    case "newest":
    default:
      query = query.order("created_at", { ascending: false })
      break
  }

  const { data: proposals } = await query

  // Calculate stats
  const stats = {
    total: proposals?.length || 0,
    drafts: proposals?.filter(p => p.status === "draft").length || 0,
    sent: proposals?.filter(p => p.status === "sent").length || 0,
    won: proposals?.filter(p => p.status === "won").length || 0,
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-teal-600 bg-clip-text text-transparent">
            All Proposals
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and track all your proposals
          </p>
        </div>
        <Button asChild className="shadow-lg shadow-primary/25 gap-2">
          <Link href="/dashboard/new-proposal">
            <Sparkles className="h-4 w-4" />
            Create New Proposal
          </Link>
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total", value: stats.total, icon: "📊", color: "from-blue-500 to-indigo-500" },
          { label: "Drafts", value: stats.drafts, icon: "📝", color: "from-slate-500 to-slate-600" },
          { label: "Sent", value: stats.sent, icon: "📤", color: "from-amber-500 to-orange-500" },
          { label: "Won", value: stats.won, icon: "🏆", color: "from-emerald-500 to-teal-500" },
        ].map((stat) => (
          <Card key={stat.label} className="relative overflow-hidden border-0 shadow-md">
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color}`} />
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
                <span className="text-2xl">{stat.icon}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* My Templates */}
      <TemplatesSection />

      {/* Filters and Sorting */}
      <ProposalFilters />

      {/* Proposals List */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Proposals</CardTitle>
            <CardDescription>
              {proposals?.length || 0} total proposals
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {proposals && proposals.length > 0 ? (
            <div className="space-y-3">
              {proposals.map((proposal) => {
                const config = STATUS_CONFIG[proposal.status] || STATUS_CONFIG.draft
                return (
                  <div
                    key={proposal.id}
                    className="flex items-center gap-4 rounded-xl p-4 hover:bg-muted/50 transition-all group border border-transparent hover:border-muted"
                  >
                    <div className={`w-12 h-12 rounded-xl ${config.bg} flex items-center justify-center text-xl flex-shrink-0`}>
                      {config.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2">
                        <div className="mt-1 flex-shrink-0">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/dashboard/proposals/${proposal.id}`}
                            className="font-semibold hover:text-primary transition-colors truncate block"
                          >
                            {proposal.title}
                          </Link>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {proposal.platform && (
                              <Badge variant="outline" className="text-xs">
                                {proposal.platform}
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {formatRelativeTime(proposal.created_at)}
                            </span>
                            {proposal.quality_score !== null && proposal.quality_score !== undefined && (
                              <QualityScoreBadge 
                                score={proposal.quality_score} 
                                className="text-xs"
                                showLabel={true}
                              />
                            )}
                            {proposal.win_probability !== null && proposal.win_probability !== undefined && (
                              <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-600 border-blue-500/20">
                                Win: {Math.round(proposal.win_probability)}%
                              </Badge>
                            )}
                            {proposal.project_value && (
                              <span className="text-xs text-emerald-600 font-medium">
                                ${(proposal.project_value / 100).toLocaleString()}
                              </span>
                            )}
                            {/* Expiry indicator */}
                            {proposal.expires_at && (
                              isProposalExpired(proposal) ? (
                                <Badge variant="outline" className="text-xs bg-gray-500/10 text-gray-600 border-gray-500/20">
                                  ⏰ Expired
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/20">
                                  ⏰ Expires {formatRelativeTime(proposal.expires_at)}
                                </Badge>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <Badge className={`${config.bg} ${config.text} border-0 capitalize hidden sm:flex`}>
                      {proposal.status}
                    </Badge>
                    {isProposalExpired(proposal) ? (
                      <ExpiredProposalActions
                        proposalId={proposal.id}
                        proposalTitle={proposal.title}
                      />
                    ) : (
                      <ProposalActions 
                        proposalId={proposal.id} 
                        proposalTitle={proposal.title} 
                      />
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="py-16 text-center">
              <div className="max-w-md mx-auto space-y-6">
                <div className="relative h-48 md:h-64 w-full mx-auto">
                  <Image
                    src="/images/propozzy/Empty Proposals State.290Z.png"
                    alt="No proposals yet"
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 400px"
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">No proposals yet</h3>
                  <p className="text-muted-foreground">
                    Create your first AI-powered proposal in minutes
                  </p>
                </div>
                <Button asChild size="lg" className="shadow-lg shadow-primary/25">
                  <Link href="/dashboard/new-proposal">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Create Your First Proposal
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

