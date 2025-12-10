import { createServerClient } from "@/lib/db"
import { getPlanQuota, PlanType } from "@/lib/stripe"

interface QuotaCheckResult {
    allowed: boolean
    remaining: number
    used: number
    limit: number
    plan: PlanType
    message?: string
}

/**
 * Check if a user can generate a proposal based on their plan quota.
 * Returns allowed/denied status with quota details.
 */
export async function canGenerateProposal(userId: string): Promise<QuotaCheckResult> {
    const supabase = createServerClient()

    // Get user's plan
    const { data: user } = await supabase
        .from('users')
        .select('plan, proposal_quota_monthly')
        .eq('id', userId)
        .single()

    const plan = (user?.plan as PlanType) || 'free'
    const limit = user?.proposal_quota_monthly ?? getPlanQuota(plan)

    // Get current month's start
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    // Get usage for current month
    const { data: usage } = await supabase
        .from('usage_tracking')
        .select('proposals_generated')
        .eq('user_id', userId)
        .gte('period_start', monthStart)
        .order('period_start', { ascending: false })
        .limit(1)
        .single()

    const used = usage?.proposals_generated ?? 0
    const remaining = Math.max(0, limit - used)

    if (used >= limit) {
        const planMessages: Record<PlanType, string> = {
            free: `You've reached your 3 free proposals for this month. Upgrade to Starter for 100 proposals/month.`,
            starter: `You've reached your 100 proposals for this month. Upgrade to Pro for 300 proposals/month.`,
            pro: `You've reached your 300 proposals for this month. Please contact support for higher limits.`,
        }

        return {
            allowed: false,
            remaining: 0,
            used,
            limit,
            plan,
            message: planMessages[plan],
        }
    }

    return {
        allowed: true,
        remaining,
        used,
        limit,
        plan,
    }
}

/**
 * Increment usage count after successful proposal generation.
 */
export async function incrementProposalUsage(userId: string): Promise<void> {
    const supabase = createServerClient()

    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

    // Try to update existing usage record for this month
    const { data: existing } = await supabase
        .from('usage_tracking')
        .select('id, proposals_generated')
        .eq('user_id', userId)
        .gte('period_start', monthStart.toISOString())
        .single()

    if (existing) {
        // Increment existing record
        await supabase
            .from('usage_tracking')
            .update({ proposals_generated: (existing.proposals_generated || 0) + 1 })
            .eq('id', existing.id)
    } else {
        // Create new usage record for this month
        await supabase
            .from('usage_tracking')
            .insert({
                user_id: userId,
                period_start: monthStart.toISOString(),
                period_end: monthEnd.toISOString(),
                proposals_generated: 1,
            })
    }
}

/**
 * Get the current usage stats for display in the dashboard.
 */
export async function getUsageStats(userId: string): Promise<{ used: number; limit: number; plan: PlanType }> {
    const result = await canGenerateProposal(userId)
    return {
        used: result.used,
        limit: result.limit,
        plan: result.plan,
    }
}
