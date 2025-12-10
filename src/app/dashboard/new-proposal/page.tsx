"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, ArrowLeft, LayoutTemplate, Sparkles, FileText, CheckCircle2 } from "lucide-react"
import { ProposalProgress } from "@/components/proposal-progress"
import { TemplateBrowser } from "@/components/proposals/template-browser"
import { ProposalTemplate } from "@/config/templates"

const PLATFORMS = ["Upwork", "Fiverr", "LinkedIn", "Thumbtack", "Houzz", "Direct RFP", "Email Outreach", "Agency Pitch", "Other"]

const PROPOSAL_STYLES = [
  { value: "modern_clean", label: "Modern Clean", description: "Sleek, contemporary design with clear sections" },
  { value: "corporate", label: "Corporate", description: "Professional, formal business style" },
  { value: "minimalist", label: "Minimalist", description: "Simple, focused, no-nonsense approach" },
  { value: "creative_agency", label: "Creative Agency", description: "Bold, innovative, design-forward" },
  { value: "startup_pitch", label: "Startup Pitch", description: "Energetic, growth-focused, dynamic" },
  { value: "technical", label: "Technical", description: "Detailed, precise, engineering-focused" },
]

export default function NewProposalPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  // Flow State
  const [step, setStep] = useState<1 | 2>(1)
  const [showTemplateBrowser, setShowTemplateBrowser] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<ProposalTemplate | null>(null)
  
  // Generation State
  const [isGenerating, setIsGenerating] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const [proposalId, setProposalId] = useState<string>("")

  const [formData, setFormData] = useState({
    rfpText: "",
    platform: "",
    projectValue: "",
    proposalTitle: "",
    style: "modern_clean",
    language: "en",
    includePricing: false,
  })

  // Handle redirect after generation is complete
  useEffect(() => {
    if (isFinished && proposalId) {
      // Small delay to show the "Proposal Ready" state before redirecting
      const redirectTimer = setTimeout(() => {
        router.push(`/dashboard/proposals/${proposalId}`)
      }, 1500)
      
      return () => clearTimeout(redirectTimer)
    }
  }, [isFinished, proposalId, router])

  const handleTemplateSelect = (template: ProposalTemplate) => {
    setSelectedTemplate(template)
    setFormData(prev => ({
      ...prev,
      proposalTitle: template.name, // Auto-fill title
      // Auto-select platform if it's a perfect match
      platform: template.platform_fit.length > 0 ? 
        PLATFORMS.find(p => p.toLowerCase() === template.platform_fit[0].toLowerCase()) || prev.platform 
        : prev.platform
    }))
    setShowTemplateBrowser(false)
    setStep(2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.rfpText.length < 50) {
      toast({
        title: "Validation Error",
        description: "RFP text must be at least 50 characters",
        variant: "destructive",
      })
      return
    }

    if (!formData.platform) {
      toast({
        title: "Validation Error",
        description: "Please select a platform",
        variant: "destructive",
      })
      return
    }

    // Start generation
    setIsGenerating(true)
    setIsFinished(false)

    try {
      const response = await fetch("/api/generate-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rfpText: formData.rfpText,
          platform: formData.platform,
          projectValue: formData.projectValue ? parseInt(formData.projectValue) : undefined,
          proposalTitle: formData.proposalTitle || "New Proposal",
          style: formData.style,
          language: formData.language,
          includePricing: formData.includePricing,
          templateId: selectedTemplate?.id // Pass template ID if selected
        }),
      })

      // Try to parse response body
      let data
      try {
        const text = await response.text()
        data = text ? JSON.parse(text) : {}
      } catch (parseError) {
        console.error("Failed to parse response:", parseError)
        throw new Error("Server error - please try again")
      }

      if (!response.ok) {
        // Handle redirect to onboarding if needed
        if (data.redirect) {
          toast({
            title: "Setup Required",
            description: data.error || "Please complete onboarding first",
          })
          router.push(data.redirect)
          return
        }
        throw new Error(data.error || "Failed to generate proposal")
      }
      setProposalId(data.proposalId)
      
      // Mark as finished - this triggers the success state in ProposalProgress
      setIsFinished(true)
      
      toast({
        title: "Success!",
        description: "Proposal generated successfully. Redirecting...",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate proposal",
        variant: "destructive",
      })
      // Reset state on error
      setIsGenerating(false)
      setIsFinished(false)
    }
  }

  // Show the progress UI while generating or just finished
  if (isGenerating || isFinished) {
    return (
      <div className="mx-auto max-w-2xl">
        <ProposalProgress isFinished={isFinished} />
        
        {/* Cancel button (only show while generating, not when finished) */}
        {isGenerating && !isFinished && (
          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              Please wait while we craft your elite proposal...
            </p>
          </div>
        )}
        
        {/* Redirect message when finished */}
        {isFinished && (
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground animate-pulse">
              Redirecting to your proposal...
            </p>
          </div>
        )}
      </div>
    )
  }

  // STEP 1: Choose Method (Scratch vs Template)
  if (step === 1 && !showTemplateBrowser) {
    return (
      <div className="mx-auto max-w-5xl space-y-12 py-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-teal-600 bg-clip-text text-transparent">
            How would you like to start?
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose a starting point for your proposal. Both options use our advanced AI engine.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Start from Scratch Option */}
          <Card className="relative overflow-hidden group hover:border-primary/50 transition-all cursor-pointer" onClick={() => setStep(2)}>
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
            <CardHeader className="text-center pt-12 pb-6">
              <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Sparkles className="h-10 w-10 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Start from Scratch</CardTitle>
              <CardDescription className="text-base mt-2">
                Let AI analyze your RFP and generate a completely custom structure and proposal.
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-8 text-center">
              <Button size="lg" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                Generate with AI
              </Button>
              <ul className="mt-6 space-y-2 text-sm text-left max-w-xs mx-auto">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" /> Custom structure analysis
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" /> Full flexibility
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" /> Best for unique projects
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Use Template Option */}
          <Card className="relative overflow-hidden group hover:border-primary/50 transition-all cursor-pointer" onClick={() => setShowTemplateBrowser(true)}>
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
            <CardHeader className="text-center pt-12 pb-6">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <LayoutTemplate className="h-10 w-10 text-emerald-600" />
              </div>
              <CardTitle className="text-2xl">Start with Template</CardTitle>
              <CardDescription className="text-base mt-2">
                Choose a proven, industry-specific structure and let AI fill in the details.
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-8 text-center">
              <Button size="lg" variant="outline" className="w-full border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 dark:border-emerald-800 dark:hover:bg-emerald-950/30">
                Browse Templates
              </Button>
              <ul className="mt-6 space-y-2 text-sm text-left max-w-xs mx-auto">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" /> Proven winning structures
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" /> Industry-specific formats
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" /> Consistent branding
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // STEP 1.5: Template Browser
  if (step === 1 && showTemplateBrowser) {
    return (
      <div className="mx-auto max-w-6xl space-y-8 pb-12">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setShowTemplateBrowser(false)}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <h1 className="text-3xl font-bold">Select a Template</h1>
        </div>
        <TemplateBrowser onSelect={handleTemplateSelect} />
      </div>
    )
  }

  // STEP 2: Proposal Details (Form)
  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="sm" className="-ml-3 h-8" onClick={() => setStep(1)}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Method
            </Button>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-teal-600 bg-clip-text text-transparent">
            {selectedTemplate ? `Customize "${selectedTemplate.name}"` : "Create New Proposal"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {selectedTemplate 
              ? "AI will adapt this template structure to your specific RFP details."
              : "Paste your RFP and let AI craft a winning proposal from scratch."}
          </p>
        </div>
        {selectedTemplate && (
          <div className="hidden sm:flex flex-col items-end">
            <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Using Template</div>
            <div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-full">
              <LayoutTemplate className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">{selectedTemplate.name}</span>
            </div>
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Job Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="rfpText" className="text-sm font-medium">RFP / Job Posting Text *</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Paste the complete job description for best results
              </p>
              <Textarea
                id="rfpText"
                value={formData.rfpText}
                onChange={(e) =>
                  setFormData({ ...formData, rfpText: e.target.value })
                }
                placeholder="Paste the complete job posting or RFP text here...

Example: 'We're looking for an experienced web developer to build a modern e-commerce platform. The project includes...'"
                className="min-h-[200px] resize-none"
                required
              />
              <div className="flex justify-between mt-2">
                <p className="text-xs text-muted-foreground">
                  The more detail you provide, the better your proposal
                </p>
                <p className={`text-xs font-medium ${formData.rfpText.length >= 50 ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                  {formData.rfpText.length} / 50 min
                </p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <Label htmlFor="platform" className="text-sm font-medium">Platform *</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Where did you find this opportunity?
                </p>
                <Select
                  value={formData.platform}
                  onValueChange={(value) =>
                    setFormData({ ...formData, platform: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {PLATFORMS.map((platform) => (
                      <SelectItem key={platform} value={platform}>
                        {platform}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="projectValue" className="text-sm font-medium">Estimated Value ($)</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Optional - helps tailor the proposal
                </p>
                <Input
                  id="projectValue"
                  type="number"
                  value={formData.projectValue}
                  onChange={(e) =>
                    setFormData({ ...formData, projectValue: e.target.value })
                  }
                  placeholder="5000"
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <Label htmlFor="style" className="text-sm font-medium">Proposal Style</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Choose the visual and formatting style
                </p>
                <Select
                  value={formData.style}
                  onValueChange={(value) =>
                    setFormData({ ...formData, style: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROPOSAL_STYLES.map((style) => (
                      <SelectItem key={style.value} value={style.value}>
                        <div>
                          <div className="font-medium">{style.label}</div>
                          <div className="text-xs text-muted-foreground">{style.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="language" className="text-sm font-medium">Language</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Generate proposal in selected language
                </p>
                <Select
                  value={formData.language}
                  onValueChange={(value) =>
                    setFormData({ ...formData, language: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="pt">Portuguese</SelectItem>
                    <SelectItem value="ar">Arabic</SelectItem>
                    <SelectItem value="id">Indonesian</SelectItem>
                    <SelectItem value="hi">Hindi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="includePricing"
                checked={formData.includePricing}
                onChange={(e) =>
                  setFormData({ ...formData, includePricing: e.target.checked })
                }
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="includePricing" className="text-sm font-medium cursor-pointer">
                Include AI-Generated Pricing Table & Timeline
              </Label>
            </div>

            <div>
              <Label htmlFor="proposalTitle" className="text-sm font-medium">Proposal Title</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Leave empty to auto-generate from RFP
              </p>
              <Input
                id="proposalTitle"
                value={formData.proposalTitle}
                onChange={(e) =>
                  setFormData({ ...formData, proposalTitle: e.target.value })
                }
                placeholder="E.g., 'E-commerce Platform Development Proposal'"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tip Card */}
        <Card className="bg-gradient-to-r from-primary/5 to-teal-500/5 border-primary/20">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl flex-shrink-0">
              💡
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Pro tip</p>
              <p className="text-sm text-muted-foreground">
                Include the client's specific requirements and pain points for a more targeted proposal.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isGenerating} 
            size="lg"
            className="shadow-lg shadow-primary/25 gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                {selectedTemplate ? "Generate with Template" : "Generate Proposal"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

