import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin"
import { getSupabaseAdmin } from "@/lib/db"
import { z } from "zod"

const UpdateSessionSchema = z.object({
  resolved: z.boolean().optional(),
  admin_notes: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
})

// Get single feedback session
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await requireAdmin()

    const supabase = getSupabaseAdmin()

    // Get session
    const { data: session, error: sessionError } = await supabase
      .from('feedback_sessions')
      .select('*')
      .eq('id', params.id)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // Get messages
    const { data: messages, error: messagesError } = await supabase
      .from('feedback_messages')
      .select('*')
      .eq('session_id', params.id)
      .order('created_at', { ascending: true })

    if (messagesError) {
      console.error('Error fetching messages:', messagesError)
      throw messagesError
    }

    return NextResponse.json({
      session,
      messages: messages || [],
    })
  } catch (error: any) {
    console.error('Feedback detail error:', error)

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

// Update feedback session
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await requireAdmin()

    const body = await req.json()
    const updates = UpdateSessionSchema.parse(body)

    const supabase = getSupabaseAdmin()

    const updateData: any = { ...updates }
    if (updates.resolved !== undefined) {
      updateData.resolved_at = updates.resolved ? new Date().toISOString() : null
      updateData.resolved_by = updates.resolved ? userId : null
    }

    const { data, error } = await supabase
      .from('feedback_sessions')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating session:', error)
      throw error
    }

    return NextResponse.json({ success: true, session: data })
  } catch (error: any) {
    console.error('Update feedback error:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    if (error.message === 'Unauthorized' || error.message === 'Forbidden - Admin access required') {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Failed to update feedback' },
      { status: 500 }
    )
  }
}

