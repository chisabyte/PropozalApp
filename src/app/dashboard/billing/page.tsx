import { getCurrentUser } from "@/lib/auth"
import { getSupabaseAdmin } from "@/lib/db"
import { getUsageStats } from "@/lib/plan-quota"
import { getPlanQuota, PLANS } from "@/lib/stripe"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

import { redirect } from "next/navigation"

export default async function BillingPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect("/onboarding")
  }

  // Use admin client to bypass RLS (we verify ownership with user_id check)
  const supabase = getSupabaseAdmin()

  // Get subscription (use maybeSingle to handle missing data)
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle()

  // Get usage stats
  const usageStats = await getUsageStats(user.id)
  const proposalsUsed = usageStats.used
  const proposalsLimit = usageStats.limit
  const userPlan = subscription?.plan_id || user.plan || "free"
  
  // Get display name and price for the plan
  const getPlanDisplayName = (plan: string) => {
    switch (plan) {
      case "pro": return "Pro"
      case "starter": return "Starter"
      default: return "Free"
    }
  }
  
  const getPlanPrice = (plan: string) => {
    switch (plan) {
      case "pro": return PLANS.pro.priceMonthly
      case "starter": return PLANS.starter.priceMonthly
      default: return 0
    }
  }

  const planGradients: Record<string, string> = {
    free: "from-slate-500 to-slate-600",
    starter: "from-teal-500 to-emerald-600",
    pro: "from-purple-500 to-pink-600",
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-teal-600 bg-clip-text text-transparent">
          Billing & Subscription
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your subscription and billing information
        </p>
      </div>

      {/* Current Plan Card */}
      <Card className="relative overflow-hidden border-0 shadow-lg">
        <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${planGradients[userPlan] || planGradients.free}`} />
        <CardHeader className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Current Plan</CardTitle>
              <CardDescription>
                You're on the <span className="font-semibold text-foreground">{getPlanDisplayName(userPlan)}</span> plan
              </CardDescription>
            </div>
            {userPlan === "pro" && (
              <div className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold">
                PRO
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="p-4 rounded-xl bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">Monthly Price</p>
              <p className="text-3xl font-bold tracking-tight">
                ${getPlanPrice(userPlan)}
                <span className="text-lg font-normal text-muted-foreground">/month</span>
              </p>
            </div>
            <div className="p-4 rounded-xl bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">Usage This Month</p>
              <p className="text-3xl font-bold tracking-tight">
                {proposalsUsed}
                <span className="text-lg font-normal text-muted-foreground"> / {proposalsLimit}</span>
              </p>
              <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${planGradients[userPlan] || planGradients.free} transition-all`}
                  style={{ width: `${Math.min((proposalsUsed / proposalsLimit) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 pt-2">
            {userPlan === "free" && (
              <Button asChild className="shadow-lg shadow-primary/25">
                <Link href="/pricing">
                  Upgrade to Starter →
                </Link>
              </Button>
            )}
            {userPlan === "starter" && (
              <Button asChild className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg">
                <Link href="/pricing">
                  Upgrade to Pro →
                </Link>
              </Button>
            )}
            {userPlan !== "free" && (
              <Button variant="outline" asChild>
                <Link href="/api/create-customer-portal">Manage Subscription</Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ROI Messaging */}
      {userPlan !== "pro" && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-500/10 to-emerald-500/10 border-teal-500/20">
          <CardContent className="py-8">
            <div className="max-w-2xl mx-auto text-center space-y-4">
              <h3 className="text-2xl font-bold">Pro users win 3× more proposals</h3>
              <p className="text-muted-foreground">
                Unlimited proposals → faster client acquisition. One winning proposal pays for months of Propozzy.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Usage Forecast */}
      {userPlan !== "pro" && proposalsUsed > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Usage Forecast</CardTitle>
            <CardDescription>Based on your current usage rate</CardDescription>
          </CardHeader>
          <CardContent>
            {(() => {
              const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
              const currentDay = new Date().getDate()
              const dailyRate = proposalsUsed / currentDay
              const projectedUsage = Math.round(dailyRate * daysInMonth)
              const limitHitDay = proposalsLimit > 0 ? Math.round(proposalsLimit / dailyRate) : null
              
              return (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-1">Projected Monthly Usage</p>
                    <p className="text-2xl font-bold">{projectedUsage} proposals</p>
                  </div>
                  {limitHitDay && limitHitDay <= daysInMonth && (
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                      <p className="text-sm font-medium text-amber-700">
                        ⚠️ At your current usage rate, you will hit your limit on the {limitHitDay}{limitHitDay === 1 ? 'st' : limitHitDay === 2 ? 'nd' : limitHitDay === 3 ? 'rd' : 'th'} of each month.
                      </p>
                    </div>
                  )}
                </div>
              )
            })()}
          </CardContent>
        </Card>
      )}

      {/* Feature Comparison Table */}
      {userPlan !== "pro" && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Plan Comparison</CardTitle>
            <CardDescription>Compare features across all plans</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold">Feature</th>
                    <th className="text-center p-3 font-semibold">Free</th>
                    <th className="text-center p-3 font-semibold bg-teal-500/10">Starter</th>
                    <th className="text-center p-3 font-semibold bg-purple-500/10">Pro</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: "Proposals per month", free: "3", starter: "100", pro: "300" },
                    { feature: "AI-powered generation", free: "✓", starter: "✓", pro: "✓" },
                    { feature: "Portfolio matching", free: "✓", starter: "✓", pro: "✓" },
                    { feature: "Proposal score access", free: "✓", starter: "✓", pro: "✓" },
                    { feature: "PDF export", free: "—", starter: "✓", pro: "✓" },
                    { feature: "Pricing table generation", free: "—", starter: "✓", pro: "✓" },
                    { feature: "Analytics dashboard", free: "—", starter: "—", pro: "✓" },
                    { feature: "Semantic search", free: "—", starter: "—", pro: "✓" },
                    { feature: "AI ecosystem tools", free: "—", starter: "✓", pro: "✓" },
                  ].map((row, i) => (
                    <tr key={i} className="border-b">
                      <td className="p-3 font-medium">{row.feature}</td>
                      <td className="p-3 text-center">{row.free}</td>
                      <td className="p-3 text-center bg-teal-500/5">{row.starter}</td>
                      <td className="p-3 text-center bg-purple-500/5">{row.pro}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Billing History */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Billing History</CardTitle>
          <CardDescription>
            View your past invoices and payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3 text-2xl">
              📄
            </div>
            <p className="text-sm text-muted-foreground">
              Billing history will be available after your first payment.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

