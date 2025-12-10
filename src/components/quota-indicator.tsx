"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowUpRight } from "lucide-react"

interface QuotaIndicatorProps {
    used: number
    limit: number
    plan: string
}

export function QuotaIndicator({ used, limit, plan }: QuotaIndicatorProps) {
    const percentage = limit > 0 ? Math.min((used / limit) * 100, 100) : 0
    const remaining = Math.max(0, limit - used)
    const isNearLimit = percentage >= 66
    const isAtLimit = used >= limit

    const planLabel = plan.charAt(0).toUpperCase() + plan.slice(1)

    // Upgrade message based on plan
    const upgradeMessage = plan === 'free'
        ? 'Upgrade to Starter for 100/month'
        : plan === 'starter'
            ? 'Upgrade to Pro for 300/month'
            : null

    return (
        <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                    {planLabel} Plan Usage
                </span>
                <span className={`text-sm ${isAtLimit ? 'text-red-600 font-semibold' : 'text-muted-foreground'}`}>
                    {used}/{limit} proposals
                </span>
            </div>

            <Progress
                value={percentage}
                className={`h-2 ${isAtLimit ? 'bg-red-100' : isNearLimit ? 'bg-amber-100' : ''}`}
            />

            <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                    {remaining > 0
                        ? `${remaining} remaining this month`
                        : 'Limit reached'}
                </span>

                {upgradeMessage && (isNearLimit || isAtLimit) && (
                    <Button variant="link" size="sm" className="h-auto p-0 text-xs" asChild>
                        <Link href="/pricing">
                            {upgradeMessage}
                            <ArrowUpRight className="h-3 w-3 ml-1" />
                        </Link>
                    </Button>
                )}
            </div>
        </div>
    )
}
