'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface SectionRegenerateButtonProps {
  proposalId: string
  section: string
  onRegenerate: (newContent: string) => void
}

export function SectionRegenerateButton({ 
  proposalId, 
  section, 
  onRegenerate 
}: SectionRegenerateButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [instruction, setInstruction] = useState('')
  const { toast } = useToast()

  const handleRegenerate = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/proposals/${proposalId}/regenerate-section`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          section,
          instruction: instruction || undefined
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to regenerate section')
      }

      toast({
        title: 'Success',
        description: `${section.replace('_', ' ')} regenerated!`,
      })
      onRegenerate(data.content)
      setIsOpen(false)
      setInstruction('')
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 gap-1">
          <RefreshCw className="h-3 w-3" />
          Regenerate
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Regenerate {section.replace('_', ' ')}</DialogTitle>
          <DialogDescription>
            Rewrite this section with fresh content. Optionally provide specific instructions.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="instruction">Instructions (optional)</Label>
            <Textarea
              id="instruction"
              placeholder="e.g., 'make it more data-driven', 'add humor', 'focus on ROI'"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleRegenerate}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Regenerating...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Regenerate Section
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

