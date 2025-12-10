'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { SectionRegenerateButton } from './section-regenerate-button'
import { ABTestModal } from './ab-test-modal'
import { Sparkles } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface EnhancedProposalEditorProps {
  proposalId: string
  initialContent: string
  onContentChange: (content: string) => void
}

export function EnhancedProposalEditor({
  proposalId,
  initialContent,
  onContentChange
}: EnhancedProposalEditorProps) {
  const [content, setContent] = useState(initialContent)
  const [isOptimizingCTA, setIsOptimizingCTA] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setContent(initialContent)
  }, [initialContent])

  const sections = [
    { name: 'opening_hook', label: 'Opening Hook' },
    { name: 'problem_reframe', label: 'Problem Reframe' },
    { name: 'approach', label: 'Your Approach' },
    { name: 'proof', label: 'Proof' },
    { name: 'deliverables', label: 'Deliverables' },
    { name: 'investment', label: 'Investment' },
    { name: 'cta', label: 'Call to Action' }
  ]

  const handleSectionRegenerate = (newContent: string) => {
    setContent(newContent)
    onContentChange(newContent)
  }

  const handleVariationSelect = (newContent: string) => {
    setContent(newContent)
    onContentChange(newContent)
  }

  const handleOptimizeCTA = async () => {
    setIsOptimizingCTA(true)
    try {
      const response = await fetch(`/api/proposals/${proposalId}/optimize-cta`, {
        method: 'POST'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to optimize CTA')
      }

      setContent(data.content)
      onContentChange(data.content)
      toast({
        title: 'Success',
        description: 'CTA optimized successfully!',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setIsOptimizingCTA(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">AI Tools</span>
        </div>
        <div className="flex gap-2">
          <ABTestModal 
            proposalId={proposalId}
            onSelectVariation={handleVariationSelect}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleOptimizeCTA}
            disabled={isOptimizingCTA}
          >
            {isOptimizingCTA ? 'Optimizing...' : 'Optimize CTA'}
          </Button>
        </div>
      </div>

      {/* Section Regeneration Controls */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {sections.map((section) => (
          <div key={section.name} className="text-sm">
            <SectionRegenerateButton
              proposalId={proposalId}
              section={section.name}
              onRegenerate={handleSectionRegenerate}
            />
          </div>
        ))}
      </div>

      {/* Content Display/Editor */}
      <div className="prose max-w-none p-6 bg-white rounded-lg border">
        <pre className="whitespace-pre-wrap">{content}</pre>
      </div>
    </div>
  )
}

