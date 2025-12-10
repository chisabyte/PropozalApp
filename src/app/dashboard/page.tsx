import { getCurrentUser } from "@/lib/auth"
import { getSupabaseAdmin } from "@/lib/db"
import { getUsageStats } from "@/lib/plan-quota"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { formatRelativeTime } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Eye, Download, Trash2, FileText, Clock, CreditCard, FilePlus, Target, TrendingUp, DollarSign, Trophy } from "lucide-react"
import { SmartInsights } from "@/components/dashboard/smart-insights"
import { HotProposals } from "@/components/dashboard/hot-proposals"
import { NeedsFollowUp } from "@/components/dashboard/needs-followup"
import { ReuseWinners } from "@/components/dashboard/reuse-winners"
import { PlatformPerformance } from "@/components/dashboard/platform-performance"
import { AskAIAdvisor } from "@/components/dashboard/ask-ai-advisor"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    // User doesn't exist in database, redirect to onboarding
    redirect("/onboarding")
  }

  // Use admin client to bypass RLS (we verify ownership with user_id check)
  const supabase = getSupabaseAdmin()

  // Get subscription and usage (use maybeSingle to handle missing data)
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle()

  // P1.5: Get actual plan-based quota (reads from user's plan column)
  const usageStats = await getUsageStats(user.id)
  const proposalsUsed = usageStats.used
  const proposalsLimit = usageStats.limit
  const userPlan = usageStats.plan

  // Get recent proposals
  const { data: proposals } = await supabase
    .from("proposals")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5)

  // Get draft count
  const { count: draftCount } = await supabase
    .from("proposals")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "draft")

  // Get win/loss stats
  const { count: wonCount } = await supabase
    .from("proposals")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "won")

  const { count: lostCount } = await supabase
    .from("proposals")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "lost")

  const { count: sentCount } = await supabase
    .from("proposals")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .in("status", ["sent", "submitted"])

  // Calculate win rate
  const winRate = (wonCount || 0) + (lostCount || 0) > 0
    ? Math.round(((wonCount || 0) / ((wonCount || 0) + (lostCount || 0))) * 100)
    : 0

  // Get average project value
  const { data: proposalsWithValue } = await supabase
    .from("proposals")
    .select("project_value")
    .eq("user_id", user.id)
    .not("project_value", "is", null)

  const avgProjectValue = proposalsWithValue && proposalsWithValue.length > 0
    ? Math.round(proposalsWithValue.reduce((sum, p) => sum + ((p.project_value || 0) / 100), 0) / proposalsWithValue.length)
    : 0

  const totalProjectValue = proposalsWithValue && proposalsWithValue.length > 0
    ? Math.round(proposalsWithValue.reduce((sum, p) => sum + ((p.project_value || 0) / 100), 0))
    : 0

  // Get proposal count trend (last 6 months for sparkline)
  const now = new Date()
  const monthlyCounts: number[] = []
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthStr = date.toISOString().slice(0, 7)
    const { count } = await supabase
      .from("proposals")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", `${monthStr}-01`)
      .lt("created_at", `${monthStr}-32`)
    monthlyCounts.push(count || 0)
  }

  // Calculate success rate (won / (won + lost + declined))
  const { count: declinedCount } = await supabase
    .from("proposals")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "declined")

  const successRate = (wonCount || 0) + (lostCount || 0) + (declinedCount || 0) > 0
    ? Math.round(((wonCount || 0) / ((wonCount || 0) + (lostCount || 0) + (declinedCount || 0))) * 100)
    : 0

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-teal-600 bg-clip-text text-transparent">
            Welcome back, {user.full_name || "there"}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your proposals today.
          </p>
        </div>
        <Button asChild size="lg" className="gap-2 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all">
          <Link href="/dashboard/new-proposal">
            <FilePlus className="h-4 w-4" />
            New Proposal
          </Link>
        </Button>
      </div>

      {/* Quick Stats - Professional gradient cards with dual metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-emerald-500" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-5">
            <CardTitle className="text-sm font-medium text-muted-foreground">Win Rate</CardTitle>
            <div className="p-2 rounded-lg bg-teal-500/10">
              <Target className="h-5 w-5 text-teal-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">
              {winRate}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {wonCount || 0} won / {lostCount || 0} lost
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-5">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Proposals</CardTitle>
            <div className="p-2 rounded-lg bg-blue-500/10">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">
              {proposalsUsed}
              <span className="text-lg text-muted-foreground font-normal"> / {proposalsLimit}</span>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all"
                style={{ width: `${Math.min((proposalsUsed / proposalsLimit) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {draftCount || 0} drafts, {sentCount || 0} sent
            </p>
            {/* Mini sparkline trend */}
            <div className="mt-2 h-8 flex items-end gap-0.5">
              {monthlyCounts.map((count, i) => {
                const maxCount = Math.max(...monthlyCounts, 1)
                return (
                  <div
                    key={i}
                    className="flex-1 bg-blue-500/30 rounded-t"
                    style={{ height: `${(count / maxCount) * 100}%` }}
                  />
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-5">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Project Value</CardTitle>
            <div className="p-2 rounded-lg bg-amber-500/10">
              <DollarSign className="h-5 w-5 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">
              ${avgProjectValue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total: ${totalProjectValue.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-5">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Success Rate</CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <span className="text-xs text-muted-foreground cursor-help">ℹ️</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Won / (Won + Lost + Declined)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Trophy className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">
              {successRate}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Based on closed proposals
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Smart Insights Panel */}
      <SmartInsights />

      {/* Platform Performance */}
      <PlatformPerformance />

      {/* Hot Proposals & Needs Follow-Up */}
      <div className="grid gap-6 lg:grid-cols-2">
        <HotProposals />
        <NeedsFollowUp />
      </div>

      {/* Reuse Your Winners */}
      <ReuseWinners />

      {/* AI Advisor Floating Button */}
      <AskAIAdvisor />

      {/* CTA Panel for 0 sent proposals */}
      {sentCount === 0 && proposalsUsed > 0 && (
        <Card className="border-2 border-teal/30 bg-gradient-to-br from-teal-500/10 to-emerald-500/10">
          <CardContent className="py-8 text-center">
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-teal-500/20 flex items-center justify-center mx-auto text-3xl">
                🚀
              </div>
              <h3 className="text-xl font-bold">Start Tracking Performance</h3>
              <p className="text-muted-foreground">
                Create and send your first proposal to start tracking your win rate and performance metrics.
              </p>
              <Button asChild size="lg" className="mt-4 shadow-lg shadow-teal/25">
                <Link href="/dashboard/new-proposal">
                  <FilePlus className="mr-2 h-4 w-4" />
                  Create a Proposal to Start Tracking
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Proposals - Professional styling */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Recent Proposals</CardTitle>
            <CardDescription>Your latest proposal activity</CardDescription>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/proposals">View All</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {proposals && proposals.length > 0 ? (
            <div className="space-y-3">
              {proposals.map((proposal) => {
                const statusConfig: Record<string, { bg: string; text: string; icon: string }> = {
                  won: { bg: "bg-emerald-500/10", text: "text-emerald-600", icon: "🏆" },
                  lost: { bg: "bg-red-500/10", text: "text-red-600", icon: "❌" },
                  sent: { bg: "bg-blue-500/10", text: "text-blue-600", icon: "📤" },
                  draft: { bg: "bg-slate-500/10", text: "text-slate-600", icon: "📝" },
                  final: { bg: "bg-purple-500/10", text: "text-purple-600", icon: "✅" },
                  declined: { bg: "bg-orange-500/10", text: "text-orange-600", icon: "🚫" },
                }
                const config = statusConfig[proposal.status] || { bg: "bg-slate-500/10", text: "text-slate-600", icon: "📄" }
                
                return (
                  <Link
                    key={proposal.id}
                    href={`/dashboard/proposals/${proposal.id}`}
                    className="flex items-center gap-4 rounded-xl p-4 hover:bg-muted/50 transition-all group border border-transparent hover:border-muted"
                  >
                    <div className={`w-12 h-12 rounded-xl ${config.bg} flex items-center justify-center text-xl flex-shrink-0`}>
                      {config.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                        {proposal.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        {proposal.platform && (
                          <span className="text-xs text-muted-foreground">{proposal.platform}</span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          • {formatRelativeTime(proposal.created_at)}
                        </span>
                      </div>
                    </div>
                    <Badge className={`${config.bg} ${config.text} border-0 capitalize`}>
                      {proposal.status}
                    </Badge>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4 text-3xl">
                📝
              </div>
              <h3 className="font-semibold text-lg mb-2">No proposals yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first AI-powered proposal in minutes
              </p>
              <Button asChild>
                <Link href="/dashboard/new-proposal">
                  <FilePlus className="h-4 w-4 mr-2" />
                  Create Your First Proposal
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick tip card */}
      <Card className="bg-gradient-to-r from-primary/5 to-teal-500/5 border-primary/20">
        <CardContent className="flex items-center gap-4 py-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl flex-shrink-0">
            💡
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Pro tip</p>
            <p className="text-sm text-muted-foreground">
              Add portfolio items to get more personalized proposals that highlight your relevant experience.
            </p>
          </div>
          <Button asChild variant="outline" size="sm" className="flex-shrink-0">
            <Link href="/dashboard/portfolio">Add Portfolio</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

