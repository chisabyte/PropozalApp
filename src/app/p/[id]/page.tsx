import { getSupabaseAdmin } from "@/lib/db"
import { notFound, redirect } from "next/navigation"
import Image from "next/image"
import { EngagementTracker } from "@/components/proposals/engagement-tracker"
import ProposalViewer from '@/components/proposals/ProposalViewer'
import SignaturePanel from '@/components/proposals/SignaturePanel'
import { Proposal } from '@/types'

interface Props {
  params: { id: string };
}

// Extend Proposal type to include the joined users data
interface ProposalWithUser extends Proposal {
  users?: {
    full_name: string | null;
    company_name: string | null;
    email: string;
  };
}

async function getProposal(id: string): Promise<ProposalWithUser | null> {
  const supabase = getSupabaseAdmin()
  
  const { data, error } = await supabase
    .from("proposals")
    .select("*, users(full_name, company_name, email)")
    .eq("id", id)
    .single()

  if (error) return null
  return data as ProposalWithUser
}

function isExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false
  return new Date(expiresAt) < new Date()
}

export default async function PublicProposalPage({ params }: Props) {
  const proposal = await getProposal(params.id)

  if (!proposal) {
    notFound()
  }

  const expired = isExpired(proposal.expires_at)
  // Check signed status from the proposal record
  const signed = proposal.signed_status === 'signed'

  // Handle redirect action for expired proposals if configured
  if (expired && proposal.expired_action === "redirect") {
      redirect("/")
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <EngagementTracker proposalId={proposal.id} />
      
      {/* Header Banner */}
      <div className="relative w-full h-40 md:h-56 lg:h-64 overflow-hidden" data-section="header">
          <Image
              src="/images/propozzy/Public Proposal Header Banner.296Z.png"
              alt="Proposal Header"
              fill
              className="object-cover object-center"
              priority
              sizes="100vw"
          />
      </div>

      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header Info */}
         <div className="bg-white border-b sticky top-0 z-10 px-4 py-4 shadow-sm mb-8 rounded-lg" data-section="title">
            <div className="container mx-auto max-w-4xl flex items-center justify-between">
                <div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Proposal For</div>
                    <h1 className="text-xl font-bold">{proposal.title}</h1>
                </div>
                <div className="text-right">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Prepared By</div>
                    <div className="font-medium">{proposal.users?.full_name || "Consultant"}</div>
                    {proposal.users?.company_name && <div className="text-sm text-muted-foreground">{proposal.users.company_name}</div>}
                </div>
            </div>
        </div>

        {/* Status Banners */}
        {expired && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-red-800 font-semibold">This proposal has expired</h3>
                <p className="text-red-700 text-sm">
                  Expired on {new Date(proposal.expires_at!).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {signed && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-green-800 font-semibold">Signed & Accepted</h3>
                <p className="text-green-700 text-sm">
                  Signed by {proposal.signed_by_name} on {new Date(proposal.signed_at!).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Proposal Content */}
        <ProposalViewer proposal={proposal} />

        {/* Signature Panel */}
        {!expired && !signed && (
          <div className="mt-8">
            <SignaturePanel proposalId={proposal.id} />
          </div>
        )}
        
        {/* Footer */}
        <div className="mt-12 text-center text-slate-500 text-sm" data-section="footer">
            Powered by <span className="font-bold text-slate-700">Propozzy</span>
        </div>
      </div>
    </div>
  )
}
