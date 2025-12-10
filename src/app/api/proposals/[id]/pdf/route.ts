import { getSupabaseAdmin } from "@/lib/db";
import { NextRequest, NextResponse } from 'next/server';
import { generateProposalPDF } from '@/lib/pdf/generateProposalPDF';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = getSupabaseAdmin();
  
  const { data: proposal, error } = await supabase
    .from('proposals')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !proposal) {
    return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
  }

  try {
    const pdfBlob = await generateProposalPDF(proposal);
    
    // Convert Blob to ArrayBuffer for the Response
    const arrayBuffer = await pdfBlob.arrayBuffer();
    
    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="proposal-${proposal.id.slice(0, 8)}.pdf"`,
      },
    });
  } catch (err) {
    console.error('Error generating PDF:', err);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
