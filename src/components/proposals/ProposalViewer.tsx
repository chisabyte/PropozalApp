import React from 'react';
import { Proposal } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';

interface Props {
  proposal: Proposal;
}

export default function ProposalViewer({ proposal }: Props) {
  const proposalContent = proposal.generated_proposal || "";
  const sections = parseProposalSections(proposalContent);

  const handleDownloadPDF = () => {
    window.open(`/api/proposals/${proposal.id}/pdf`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex justify-end">
        <Button onClick={handleDownloadPDF} variant="outline" className="gap-2">
            <FileDown className="h-4 w-4" />
            Download PDF
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-lg border p-8 md:p-12 min-h-[60vh]">
          <div className="prose prose-slate max-w-none font-medium leading-relaxed">
              {sections.map((section, index) => (
                  <div 
                      key={index} 
                      data-section={section.name}
                      className="mb-6"
                  >
                      {section.isHeading ? (
                          <h2 className="text-xl font-bold text-slate-800 mb-3">{section.content}</h2>
                      ) : (
                          <div className="whitespace-pre-wrap">{section.content}</div>
                      )}
                  </div>
              ))}
          </div>
      </div>

      {/* Signature Details (if signed) */}
      {proposal.signed_status === 'signed' && proposal.signed_at && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Signature Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-8">
                {proposal.signed_signature_image && (
                <div className="p-4 bg-white rounded border border-green-200 inline-block">
                    <img 
                    src={proposal.signed_signature_image} 
                    alt="Signature" 
                    className="h-16 object-contain"
                    />
                </div>
                )}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm flex-1">
                <div>
                    <p className="text-gray-600 font-semibold text-xs uppercase tracking-wider">Signed By</p>
                    <p className="text-green-900 font-medium">{proposal.signed_by_name}</p>
                </div>
                <div>
                    <p className="text-gray-600 font-semibold text-xs uppercase tracking-wider">Email</p>
                    <p className="text-green-900 font-medium">{proposal.signed_by_email}</p>
                </div>
                <div>
                    <p className="text-gray-600 font-semibold text-xs uppercase tracking-wider">Date & Time</p>
                    <p className="text-green-900 font-medium">
                    {new Date(proposal.signed_at).toLocaleString()}
                    </p>
                </div>
                <div>
                    <p className="text-gray-600 font-semibold text-xs uppercase tracking-wider">IP Address</p>
                    <p className="text-green-900 font-medium font-mono">
                    {proposal.signed_ip}
                    </p>
                </div>
                </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-green-200 text-xs text-green-700">
                This proposal was electronically signed and accepted on {new Date(proposal.signed_at).toLocaleDateString()}.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function parseProposalSections(content: string): Array<{ name: string; content: string; isHeading: boolean }> {
    if (!content) return [{ name: "content", content: "", isHeading: false }]
    
    const lines = content.split("\n")
    const sections: Array<{ name: string; content: string; isHeading: boolean }> = []
    let currentSection = { name: "introduction", content: "", isHeading: false }
    let sectionIndex = 0

    for (const line of lines) {
        // Check if line looks like a heading (starts with # or is all caps or ends with :)
        const isHeading = /^#+\s/.test(line) || 
                          /^[A-Z][A-Z\s]+:?$/.test(line.trim()) ||
                          /^[A-Z][a-zA-Z\s]+:$/.test(line.trim())

        if (isHeading && line.trim()) {
            // Save current section if it has content
            if (currentSection.content.trim()) {
                sections.push(currentSection)
            }
            
            // Start new section
            sectionIndex++
            const sectionName = line.replace(/^#+\s*/, "").replace(/:$/, "").trim().toLowerCase().replace(/\s+/g, "-") || `section-${sectionIndex}`
            sections.push({ 
                name: sectionName, 
                content: line.replace(/^#+\s*/, ""), 
                isHeading: true 
            })
            currentSection = { name: `${sectionName}-content`, content: "", isHeading: false }
        } else {
            currentSection.content += line + "\n"
        }
    }

    // Add final section
    if (currentSection.content.trim()) {
        sections.push(currentSection)
    }

    // If no sections were created, return the whole content as one section
    if (sections.length === 0) {
        return [{ name: "content", content, isHeading: false }]
    }

    return sections
}
