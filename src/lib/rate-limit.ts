import { createServerClient } from "@/lib/db"

export async function checkRateLimit(userId: string, endpoint: string = 'generate_proposal', limit: number = 10, windowSeconds: number = 60) {
    const supabase = createServerClient()

    const windowStart = new Date(Date.now() - windowSeconds * 1000).toISOString()

    // Clean up old window data (basic maintenance, could be done via cron)
    // Or simpler: just upsert current window

    // Check current usage
    // We'll use a simplified sliding window approach: 
    // Store a "window_start" and 'count'. If window_start is old, reset.

    const { data: currentLimit } = await supabase
        .from('rate_limits')
        .select('*')
        .eq('user_id', userId)
        .eq('endpoint', endpoint)
        .single()

    if (!currentLimit) {
        // First request
        await supabase.from('rate_limits').insert({
            user_id: userId,
            endpoint,
            requests: 1,
            window_start: new Date().toISOString()
        })
        return { allowed: true, remaining: limit - 1 }
    }

    const now = new Date().getTime()
    const windowStartTime = new Date(currentLimit.window_start).getTime()

    if (now - windowStartTime > windowSeconds * 1000) {
        // New window
        await supabase.from('rate_limits').update({
            requests: 1,
            window_start: new Date().toISOString()
        }).eq('id', currentLimit.id)
        return { allowed: true, remaining: limit - 1 }
    }

    if (currentLimit.requests >= limit) {
        return { allowed: false, remaining: 0 }
    }

    // Increment
    await supabase.from('rate_limits').update({
        requests: currentLimit.requests + 1
    }).eq('id', currentLimit.id)

    return { allowed: true, remaining: limit - (currentLimit.requests + 1) }
}
