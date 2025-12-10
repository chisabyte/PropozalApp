'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { FlaskConical, Loader2, Copy, Check } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'

interface ABTestModalProps {
  proposalId: string
  onSelectVariation: (content: string, variant: 'A' | 'B') => void
}

export function ABTestModal({ proposalId, onSelectVariation }: ABTestModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [variations, setVariations] = useState<any[]>([])
  const [copiedVariant, setCopiedVariant] = useState<string | null>(null)
  const { toast } = useToast()

  const handleGenerate = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/proposals/${proposalId}/ab-test`, {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate variations')
      }

      setVariations(data.variations)
      toast({
        title: 'Success',
        description: 'Generated 2 proposal variations!',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
      setIsOpen(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async (content: string, variant: string) => {
    await navigator.clipboard.writeText(content)
    setCopiedVariant(variant)
    setTimeout(() => setCopiedVariant(null), 2000)
    toast({
      title: 'Copied',
      description: 'Copied to clipboard!',
    })
  }

  const handleSelect = (variation: any) => {
    onSelectVariation(variation.proposal, variation.variant)
    setIsOpen(false)
    toast({
      title: 'Success',
      description: `Variant ${variation.variant} applied!`,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FlaskConical className="mr-2 h-4 w-4" />
          A/B Test
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>A/B Test Variations</DialogTitle>
          <DialogDescription>
            Generate two different approaches to compare and choose the best one
          </DialogDescription>
        </DialogHeader>

        {!isLoading && variations.length === 0 && (
          <div className="text-center py-8">
            <Button onClick={handleGenerate}>
              <FlaskConical className="mr-2 h-4 w-4" />
              Generate Variations
            </Button>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              Generating 2 variations with different approaches...
            </p>
          </div>
        )}

        {variations.length > 0 && (
          <Tabs defaultValue="A" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="A">
                Variant A
                <Badge variant="secondary" className="ml-2">
                  Data-Driven
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="B">
                Variant B
                <Badge variant="secondary" className="ml-2">
                  Strategic
                </Badge>
              </TabsTrigger>
            </TabsList>

            {variations.map((variation) => (
              <TabsContent key={variation.variant} value={variation.variant}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Hook Strategy:</p>
                      <p className="text-sm text-muted-foreground">
                        {variation.differentiatingFactor}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(variation.proposal, variation.variant)}
                      >
                        {copiedVariant === variation.variant ? (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="mr-2 h-4 w-4" />
                            Copy
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => handleSelect(variation)}
                      >
                        Use This Version
                      </Button>
                    </div>
                  </div>

                  <div className="prose prose-sm max-w-none p-4 bg-muted rounded-lg max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap">{variation.proposal}</pre>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  )
}

