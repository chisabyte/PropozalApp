import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin"
import { getSupabaseAdmin } from "@/lib/db"
import { z } from "zod"

const FeedbackFilterSchema = z.object({
  category: z.enum(['bug', 'feature_request', 'complaint', 'praise', 'question', 'unclear', 'all']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent', 'all']).optional(),
  resolved: z.enum(['true', 'false', 'all']).optional(),
  sentiment: z.enum(['positive', 'neutral', 'negative', 'all']).optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
})

export async function GET(req: Request) {
  try {
    // Verify admin access
    await requireAdmin()

    // Parse query parameters
    const { searchParams } = new URL(req.url)
    const filters = FeedbackFilterSchema.parse({
      category: searchParams.get('category') || 'all',
      priority: searchParams.get('priority') || 'all',
      resolved: searchParams.get('resolved') || 'all',
      sentiment: searchParams.get('sentiment') || 'all',
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
    })

    const supabase = getSupabaseAdmin()
    let query = supabase
      .from('feedback_sessions')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    // Apply filters
    if (filters.category && filters.category !== 'all') {
      query = query.eq('category', filters.category)
    }
    if (filters.priority && filters.priority !== 'all') {
      query = query.eq('priority', filters.priority)
    }
    if (filters.resolved && filters.resolved !== 'all') {
      query = query.eq('resolved', filters.resolved === 'true')
    }
    if (filters.sentiment && filters.sentiment !== 'all') {
      query = query.eq('sentiment', filters.sentiment)
    }

    // Pagination
    query = query.range(filters.offset || 0, (filters.offset || 0) + (filters.limit || 50) - 1)

    const { data: sessions, error, count } = await query

    if (error) {
      console.error('Error fetching feedback sessions:', error)
      throw error
    }

    // Get message counts for each session
    const sessionsWithCounts = await Promise.all(
      (sessions || []).map(async (session) => {
        const { count: messageCount } = await supabase
          .from('feedback_messages')
          .select('id', { count: 'exact', head: true })
          .eq('session_id', session.id)

        return {
          ...session,
          messageCount: messageCount || 0,
        }
      })
    )

    return NextResponse.json({
      sessions: sessionsWithCounts,
      total: count,
      limit: filters.limit,
      offset: filters.offset,
    })
  } catch (error: any) {
    console.error('Admin feedback fetch error:', error)
    
    if (error.message === 'Unauthorized' || error.message === 'Forbidden - Admin access required') {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Failed to fetch feedback' },
      { status: 500 }
    )
  }
}

