"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { onboardingStep1Schema, onboardingStep2Schema, onboardingStep3Schema } from "@/lib/validations"
import { Loader2, Building2, Briefcase, Sparkles, Check, Plus, Trash2 } from "lucide-react"

const INDUSTRIES = [
  { value: "Web Development", icon: "💻" },
  { value: "Marketing", icon: "📈" },
  { value: "Construction", icon: "🏗️" },
  { value: "Consulting", icon: "💼" },
  { value: "Design", icon: "🎨" },
  { value: "Other", icon: "🔧" },
]

const TONE_OPTIONS = [
  { value: "Professional & Formal", icon: "👔", description: "Corporate and business-focused" },
  { value: "Friendly & Conversational", icon: "😊", description: "Warm and approachable" },
  { value: "Technical & Detailed", icon: "🔧", description: "In-depth and precise" },
  { value: "Creative & Bold", icon: "🎨", description: "Unique and memorable" },
]

const STEPS = [
  { id: 1, title: "Your Business", icon: Building2 },
  { id: 2, title: "Portfolio", icon: Briefcase },
  { id: 3, title: "Preferences", icon: Sparkles },
]

interface PortfolioItem {
  title: string
  description: string
  tags: string[]
}

export default function OnboardingPage() {
  const { user, isLoaded } = useUser()
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [checkingUser, setCheckingUser] = useState(true)

  // Check if user already completed onboarding (only on mount, not during submission)
  useEffect(() => {
    const checkUser = async () => {
      if (!isLoaded || !user || loading) {
        // Don't check if we're currently submitting
        if (!loading) {
          setCheckingUser(false)
        }
        return
      }

      try {
        const response = await fetch("/api/user/profile")
        if (response.ok) {
          const userData = await response.json()
          // If user has industry set, they've completed onboarding
          if (userData.industry) {
            window.location.href = "/dashboard"
            return
          }
        }
      } catch (error) {
        // User doesn't exist yet, continue with onboarding
        console.log("User not found, continuing onboarding")
      } finally {
        if (!loading) {
          setCheckingUser(false)
        }
      }
    }

    // Only check on initial load, not during submission
    if (!loading) {
      checkUser()
    }
  }, [isLoaded, user]) // Removed loading from dependencies to prevent re-checking during submission

  // Step 1 data
  const [companyName, setCompanyName] = useState("")
  const [industry, setIndustry] = useState<string>("")

  // Step 2 data
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([
    { title: "", description: "", tags: [] },
    { title: "", description: "", tags: [] },
  ])

  // Step 3 data
  const [tonePreference, setTonePreference] = useState<string>("")

  const updatePortfolioItem = (index: number, field: keyof PortfolioItem, value: string | string[]) => {
    const updated = [...portfolioItems]
    updated[index] = { ...updated[index], [field]: value }
    setPortfolioItems(updated)
  }

  const addPortfolioItem = () => {
    setPortfolioItems([...portfolioItems, { title: "", description: "", tags: [] }])
  }

  const removePortfolioItem = (index: number) => {
    if (portfolioItems.length > 2) {
      setPortfolioItems(portfolioItems.filter((_, i) => i !== index))
    }
  }

  const handleStep1Submit = async () => {
    try {
      const validated = onboardingStep1Schema.parse({ companyName, industry })
      setStep(2)
    } catch (error: any) {
      toast({
        title: "Validation Error",
        description: error.errors?.[0]?.message || "Please fill in all required fields",
        variant: "destructive",
      })
    }
  }

  const handleStep2Submit = async () => {
    try {
      // Filter out empty portfolio items before validation
      const validPortfolioItems = portfolioItems.filter(
        (item) => item.title.trim() && item.description.trim()
      )

      if (validPortfolioItems.length < 2) {
        toast({
          title: "Validation Error",
          description: "Please add at least 2 portfolio items with both title and description",
          variant: "destructive",
        })
        return
      }

      // Ensure each item has at least 10 characters in description
      const itemsWithValidDescription = validPortfolioItems.filter(
        (item) => item.description.trim().length >= 10
      )

      if (itemsWithValidDescription.length < 2) {
        toast({
          title: "Validation Error",
          description: "Each portfolio item description must be at least 10 characters long",
          variant: "destructive",
        })
        return
      }

      // Ensure tags array exists (can be empty)
      const itemsWithTags = itemsWithValidDescription.map(item => ({
        ...item,
        tags: item.tags || []
      }))

      const validated = onboardingStep2Schema.parse({ portfolioItems: itemsWithTags })
      setStep(3)
    } catch (error: any) {
      console.error("Step 2 validation error:", error)
      toast({
        title: "Validation Error",
        description: error.errors?.[0]?.message || error.message || "Please add at least 2 portfolio items with title and description (min 10 characters)",
        variant: "destructive",
      })
    }
  }

  const handleStep3Submit = async () => {
    try {
      const validated = onboardingStep3Schema.parse({ tonePreference })
      setLoading(true)

      // Filter out empty portfolio items before submitting
      const validPortfolioItems = portfolioItems.filter(
        (item) => item.title.trim() && item.description.trim() && item.description.trim().length >= 10
      )

      if (validPortfolioItems.length < 2) {
        setLoading(false)
        toast({
          title: "Validation Error",
          description: "Please add at least 2 portfolio items with title and description (min 10 characters)",
          variant: "destructive",
        })
        // Go back to step 2 if validation fails
        setStep(2)
        return
      }

      // Ensure tags array exists (can be empty)
      const itemsWithTags = validPortfolioItems.map(item => ({
        ...item,
        tags: item.tags || []
      }))

      // Submit all onboarding data
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          industry,
          portfolioItems: itemsWithTags,
          tonePreference,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || errorData.message || "Failed to complete onboarding")
      }

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Welcome!",
          description: "Your account has been set up successfully.",
        })

        // Wait a moment for the toast to show, then redirect
        setTimeout(() => {
          // Use full page navigation to ensure Clerk auth state is synced
          window.location.href = "/dashboard"
        }, 500)
      } else {
        throw new Error("Onboarding completed but response was not successful")
      }
    } catch (error: any) {
      console.error("Step 3 submission error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to complete onboarding",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  if (checkingUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-teal-500 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <p className="text-muted-foreground">Setting up your experience...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30">
      <div className="container mx-auto px-4 py-8 lg:py-16">
        {/* Progress Steps */}
        <div className="max-w-md mx-auto mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((s, index) => {
              const StepIcon = s.icon
              const isCompleted = step > s.id
              const isCurrent = step === s.id
              
              return (
                <div key={s.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      isCompleted 
                        ? "bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-500/20" 
                        : isCurrent 
                          ? "bg-gradient-to-br from-primary to-teal-500 text-white shadow-lg shadow-primary/20 scale-110" 
                          : "bg-muted text-muted-foreground"
                    }`}>
                      {isCompleted ? <Check className="h-5 w-5" /> : <StepIcon className="h-5 w-5" />}
                    </div>
                    <span className={`text-xs mt-2 font-medium ${isCurrent ? "text-primary" : "text-muted-foreground"}`}>
                      {s.title}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={`w-16 sm:w-24 h-1 mx-2 rounded-full transition-all duration-500 ${
                      step > s.id ? "bg-gradient-to-r from-emerald-400 to-teal-500" : "bg-muted"
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="w-full max-w-5xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Illustration */}
          <div className="hidden lg:flex relative h-[450px] items-center justify-center">
            <Image
              src="/images/propozzy/Onboarding Illustration.011Z.png"
              alt="Welcome to Propozzy"
              fill
              className="object-contain"
              sizes="(max-width: 1024px) 0vw, 50vw"
              priority
            />
          </div>

          {/* Form Card */}
          <Card className="w-full border-0 shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl bg-gradient-to-r from-primary to-teal-600 bg-clip-text text-transparent">
                {step === 1 && "Tell us about your business"}
                {step === 2 && "Showcase your best work"}
                {step === 3 && "Set your preferences"}
              </CardTitle>
              <CardDescription className="text-base">
                {step === 1 && "This helps us personalize your proposals"}
                {step === 2 && "AI uses these to highlight relevant experience"}
                {step === 3 && "Choose how your proposals should sound"}
              </CardDescription>
            </CardHeader>
            <CardContent>
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="companyName" className="text-sm font-medium">Company Name (Optional)</Label>
                <Input
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Acme Inc."
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">What industry are you in? *</Label>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  {INDUSTRIES.map((ind) => (
                    <div
                      key={ind.value}
                      onClick={() => setIndustry(ind.value)}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all hover:border-primary/50 ${
                        industry === ind.value 
                          ? "border-primary bg-primary/5" 
                          : "border-muted"
                      }`}
                    >
                      <span className="text-2xl">{ind.icon}</span>
                      <span className="font-medium text-sm">{ind.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Button onClick={handleStep1Submit} className="w-full shadow-lg shadow-primary/25" size="lg">
                Continue →
              </Button>
            </div>
          )}

          {/* Step 2: Portfolio Setup */}
          {step === 2 && (
            <div className="space-y-6">
              <p className="text-sm text-muted-foreground">
                Add 2-3 of your best projects to help AI personalize proposals
              </p>
              {portfolioItems.map((item, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Project {index + 1}</h3>
                        {portfolioItems.length > 2 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removePortfolioItem(index)}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                      <div>
                        <Label>Project Title</Label>
                        <Input
                          value={item.title}
                          onChange={(e) =>
                            updatePortfolioItem(index, "title", e.target.value)
                          }
                          placeholder="E-commerce Site for Fashion Brand"
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label>Description (2-3 sentences)</Label>
                        <Textarea
                          value={item.description}
                          onChange={(e) =>
                            updatePortfolioItem(index, "description", e.target.value)
                          }
                          placeholder="Built a modern e-commerce platform with React and Node.js..."
                          className="mt-2"
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label>Tags (comma-separated)</Label>
                        <Input
                          value={item.tags.join(", ")}
                          onChange={(e) => {
                            const tags = e.target.value
                              .split(",")
                              .map((t) => t.trim())
                              .filter(Boolean)
                            updatePortfolioItem(index, "tags", tags)
                          }}
                          placeholder="React, E-commerce, B2B"
                          className="mt-2"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button variant="outline" onClick={addPortfolioItem}>
                Add Another Project
              </Button>
              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button onClick={handleStep2Submit} className="flex-1">
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Tone Preferences */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <Label className="text-sm font-medium">How should your proposals sound?</Label>
                <div className="grid gap-3 mt-3">
                  {TONE_OPTIONS.map((tone) => (
                    <div
                      key={tone.value}
                      onClick={() => setTonePreference(tone.value)}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all hover:border-primary/50 ${
                        tonePreference === tone.value 
                          ? "border-primary bg-primary/5" 
                          : "border-muted"
                      }`}
                    >
                      <span className="text-2xl">{tone.icon}</span>
                      <div className="flex-1">
                        <p className="font-medium">{tone.value}</p>
                        <p className="text-sm text-muted-foreground">{tone.description}</p>
                      </div>
                      {tonePreference === tone.value && (
                        <Check className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  ← Back
                </Button>
                <Button onClick={handleStep3Submit} disabled={loading} className="flex-1 shadow-lg shadow-primary/25" size="lg">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    "Complete Setup 🚀"
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

