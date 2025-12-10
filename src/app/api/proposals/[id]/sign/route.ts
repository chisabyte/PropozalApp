import { getSupabaseAdmin } from "@/lib/db";
import { NextRequest, NextResponse } from 'next/server';
import { SignProposalRequest } from '@/types';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseAdmin();
    const body: SignProposalRequest = await request.json();

    // Validation
    if (!body.name?.trim()) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    if (!body.email?.trim() || !body.email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    if (!body.agreed_to_terms) {
      return NextResponse.json(
        { error: 'You must agree to the terms' },
        { status: 400 }
      );
    }

    // Fetch the proposal
    const { data: proposal, error: fetchError } = await supabase
      .from('proposals')
      .select('*')
      .eq('id', params.id)
      .single();

    if (fetchError || !proposal) {
      return NextResponse.json(
        { error: 'Proposal not found' },
        { status: 404 }
      );
    }

    // Check if already signed
    if (proposal.signed_status === 'signed') {
      return NextResponse.json(
        { error: 'This proposal has already been signed' },
        { status: 400 }
      );
    }

    // Check if expired
    if (proposal.expires_at && new Date(proposal.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'This proposal has expired' },
        { status: 400 }
      );
    }

    // Get IP address from request
    const ip = 
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown';

    // Get user agent
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Update proposal with signature data
    const { data: updatedProposal, error: updateError } = await supabase
      .from('proposals')
      .update({
        signed_at: new Date().toISOString(),
        signed_by_name: body.name.trim(),
        signed_by_email: body.email.trim(),
        signed_ip: ip,
        signed_user_agent: userAgent,
        signed_signature_image: body.signature_image || null,
        signed_status: 'signed',
      })
      .eq('id', params.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating proposal:', updateError);
      return NextResponse.json(
        { error: 'Failed to save signature' },
        { status: 500 }
      );
    }

    // Track analytics event (if you have an analytics table or service)
    try {
        // Example: Log to a hypothetical audit log or simply console for now
        console.log(`Proposal ${params.id} signed by ${body.name} (${body.email})`);
    } catch (analyticsError) {
      console.error('Analytics error:', analyticsError);
      // Don't fail the request if analytics fails
    }

    return NextResponse.json({
      success: true,
      proposal: updatedProposal,
    });
  } catch (error) {
    console.error('Error signing proposal:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
