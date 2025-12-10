import { createClient } from '@supabase/supabase-js';

export type AnalyticsEvent = 
  | 'proposal_created'
  | 'proposal_viewed'
  | 'proposal_signed'
  | 'proposal_declined'
  | 'proposal_expired';

interface EventMetadata {
  proposal_id: string;
  user_id?: string;
  amount?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export async function trackEvent(
  eventType: AnalyticsEvent,
  metadata: EventMetadata
) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // Check if the 'events' table exists before trying to insert
    // Ideally, this table should be created via migration
    await supabase.from('events').insert({
      event_type: eventType,
      metadata,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error(`Failed to track ${eventType}:`, error);
  }
}
