"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Sparkles, FileText } from "lucide-react"
import Link from "next/link"

interface Proposal {
  id: string
  title: string
  created_at: string
}

export default function StyleTrainingPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)
  const [training, setTraining] = useState(false)
  const [selectedProposals, setSelectedProposals] = useState<string[]>([])
  const [profileName, setProfileName] = useState("")

  useEffect(() => {
    fetchProposals()
  }, [])

  const fetchProposals = async () => {
    try {
      const response = await fetch("/api/proposals")
      if (!response.ok) throw new Error("Failed to fetch proposals")
      const data = await response.json()
      setProposals(data)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load proposals",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleToggleProposal = (id: string) => {
    if (selectedProposals.includes(id)) {
      setSelectedProposals(selectedProposals.filter(p => p !== id))
    } else {
      if (selectedProposals.length < 3) {
        setSelectedProposals([...selectedProposals, id])
      } else {
        toast({
          title: "Limit Reached",
          description: "Please select 2-3 proposals maximum",
          variant: "destructive",
        })
      }
    }
  }

  const handleTrain = async () => {
    if (selectedProposals.length < 2) {
      toast({
        title: "Validation Error",
        description: "Please select at least 2 proposals",
        variant: "destructive",
      })
      return
    }

    if (!profileName.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a profile name",
        variant: "destructive",
      })
      return
    }

    setTraining(true)
    try {
      const response = await fetch("/api/settings/style-training", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proposalIds: selectedProposals,
          profileName: profileName.trim(),
        }),
      })

      if (!response.ok) throw new Error("Failed to train style profile")

      toast({
        title: "Success",
        description: "Writing style profile created successfully!",
      })

      router.push("/dashboard/settings")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to train style profile",
        variant: "destructive",
      })
    } finally {
      setTraining(false)
    }
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-teal-600 bg-clip-text text-transparent">
          Writing Style Training
        </h1>
        <p className="text-muted-foreground mt-1">
          Train AI to write proposals in your personal style
        </p>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">How It Works</CardTitle>
          <CardDescription>
            Select 2-3 of your best past proposals. AI will analyze your writing patterns and create a personalized style profile.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="profileName" className="text-sm font-medium">Profile Name</Label>
            <Input
              id="profileName"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              placeholder="My Writing Style"
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Give your style profile a name
            </p>
          </div>

          <div>
            <Label className="text-sm font-medium mb-3 block">
              Select Proposals ({selectedProposals.length}/3)
            </Label>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : proposals.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-muted-foreground mb-4">No proposals found</p>
                <Button asChild>
                  <Link href="/dashboard/new-proposal">Create Your First Proposal</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {proposals.map((proposal) => {
                  const isSelected = selectedProposals.includes(proposal.id)
                  return (
                    <div
                      key={proposal.id}
                      onClick={() => handleToggleProposal(proposal.id)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        isSelected
                          ? "border-teal-500 bg-teal-500/10"
                          : "border-muted hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          isSelected ? "border-teal-500 bg-teal-500" : "border-muted"
                        }`}>
                          {isSelected && <span className="text-white text-xs">✓</span>}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{proposal.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(proposal.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <Button
            onClick={handleTrain}
            disabled={training || selectedProposals.length < 2 || !profileName.trim()}
            className="w-full shadow-lg shadow-primary/25"
            size="lg"
          >
            {training ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Training AI...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Train Writing Style
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

