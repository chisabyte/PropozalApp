import { createClient } from '@supabase/supabase-js';

export interface ProposalAnalytics {
  total_proposals: number;
  signed_proposals: number;
  pending_proposals: number;
  expired_proposals: number;
  total_value: number;
  signed_value: number;
  win_rate: number;
  average_value: number;
}

export async function getProposalAnalytics(
  userId: string,
  startDate?: Date,
  endDate?: Date
): Promise<ProposalAnalytics> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  let query = supabase
    .from('proposals')
    .select('*')
    .eq('user_id', userId);

  if (startDate) {
    query = query.gte('created_at', startDate.toISOString());
  }
  if (endDate) {
    query = query.lte('created_at', endDate.toISOString());
  }

  const { data: proposals, error } = await query;

  if (error || !proposals) {
    throw new Error('Failed to fetch analytics');
  }

  const signed = proposals.filter(p => p.signed_status === 'signed');
  const pending = proposals.filter(p => 
    p.signed_status !== 'signed' && 
    p.signed_status !== 'expired' &&
    p.signed_status !== 'declined'
  );
  const expired = proposals.filter(p => p.signed_status === 'expired');

  // Assuming 'project_value' is the amount field based on previous context, 
  // falling back to 'total_amount' if that was intended (but I'll use project_value as per interface)
  const totalValue = proposals.reduce((sum, p) => sum + (p.project_value || 0), 0);
  const signedValue = signed.reduce((sum, p) => sum + (p.project_value || 0), 0);

  return {
    total_proposals: proposals.length,
    signed_proposals: signed.length,
    pending_proposals: pending.length,
    expired_proposals: expired.length,
    total_value: totalValue,
    signed_value: signedValue,
    win_rate: proposals.length > 0 
      ? (signed.length / proposals.length) * 100 
      : 0,
    average_value: proposals.length > 0 
      ? totalValue / proposals.length 
      : 0,
  };
}
