'use client'

import { Badge } from '@/components/ui/badge'
import { Brain } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface ComplexityBadgeProps {
  score: number // 1-10
  recommendedLength: 'shorter' | 'same' | 'longer'
  reasoning: string
}

export function ComplexityBadge({ 
  score, 
  recommendedLength, 
  reasoning 
}: ComplexityBadgeProps) {
  const getColor = () => {
    if (score <= 3) return 'bg-green-100 text-green-800 border-green-300'
    if (score <= 6) return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    return 'bg-red-100 text-red-800 border-red-300'
  }

  const getLabel = () => {
    if (score <= 3) return 'Simple'
    if (score <= 6) return 'Moderate'
    return 'Complex'
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Badge variant="outline" className={getColor()}>
            <Brain className="mr-1 h-3 w-3" />
            {getLabel()} ({score}/10)
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="font-semibold mb-1">Complexity Analysis</p>
          <p className="text-xs mb-2">{reasoning}</p>
          <p className="text-xs">
            <strong>Recommended:</strong> {recommendedLength} format
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

