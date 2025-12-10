"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Lightbulb, TrendingUp, AlertTriangle, Target, CheckCircle } from "lucide-react"
import { ProposalInsights } from "@/lib/proposal-insights"

interface ProposalInsightsProps {
  proposalId: string
  proposalContent: string
  rfpText: string
  platform: string
}

export function ProposalInsightsComponent({ proposalId, proposalContent, rfpText, platform }: ProposalInsightsProps) {
  const [insights, setInsights] = useState<ProposalInsights | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateInsights = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/proposals/${proposalId}/insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposalContent,
          rfpText,
          platform
        })
      })

      if (!response.ok) throw new Error('Failed to generate insights')

      const data = await response.json()
      setInsights(data)
    } catch (err: any) {
      setError(err.message || 'Failed to generate insights')
    } finally {
      setLoading(false)
    }
  }

  if (insights) {
    return (
      <Card className="border-2 border-teal/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-teal" />
            Proposal Insights
          </CardTitle>
          <CardDescription>
            AI analysis of your proposal's strengths and opportunities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Win Probability */}
          <div className="flex items-center justify-between p-4 bg-teal/10 rounded-lg">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-teal" />
              <span className="font-medium">Win Probability</span>
            </div>
            <div className="text-2xl font-bold text-teal">
              {insights.winProbability}%
            </div>
          </div>

          {/* Overall Assessment */}
          <div>
            <h4 className="font-semibold mb-2">Overall Assessment</h4>
            <p className="text-sm text-muted-foreground">{insights.overallAssessment}</p>
          </div>

          {/* Strengths */}
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              Strengths
            </h4>
            <ul className="space-y-1">
              {insights.strengths.map((strength, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-emerald-600 mt-1">•</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Weaknesses */}
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              Areas for Improvement
            </h4>
            <ul className="space-y-1">
              {insights.weaknesses.map((weakness, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-amber-600 mt-1">•</span>
                  <span>{weakness}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Hidden Needs */}
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              Hidden Client Needs
            </h4>
            <ul className="space-y-1">
              {insights.hiddenNeeds.map((need, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>{need}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recommendations */}
          <div>
            <h4 className="font-semibold mb-2">Recommendations</h4>
            <ul className="space-y-1">
              {insights.recommendations.map((rec, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-teal mt-1">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Proposal Insights
        </CardTitle>
        <CardDescription>
          Get AI-powered analysis of why your proposal will win
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
            {error}
          </div>
        )}
        <Button
          onClick={generateInsights}
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Insights...
            </>
          ) : (
            <>
              <Lightbulb className="mr-2 h-4 w-4" />
              Generate Insights
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

