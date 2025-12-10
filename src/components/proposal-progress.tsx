"use client"

import { useState, useEffect, useCallback } from "react"
import { Check, Sparkles, Search, Briefcase, PenTool, Rocket } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProposalProgressProps {
  isFinished: boolean
}

interface Step {
  id: number
  label: string
  description: string
  completedText: string
  icon: React.ElementType
  color: string
}

const STEPS: Step[] = [
  { 
    id: 1, 
    label: "Analyzing requirements", 
    description: "Extracting key details from the RFP...",
    completedText: "Found 5 key requirements",
    icon: Search,
    color: "teal"
  },
  { 
    id: 2, 
    label: "Matching portfolio", 
    description: "Finding your most relevant experience...",
    completedText: "Matched 3 relevant projects",
    icon: Briefcase,
    color: "blue"
  },
  { 
    id: 3, 
    label: "Crafting proposal", 
    description: "Writing your personalized proposal...",
    completedText: "Generated winning content",
    icon: PenTool,
    color: "purple"
  },
  { 
    id: 4, 
    label: "Finalizing", 
    description: "Polishing and formatting...",
    completedText: "Ready to review!",
    icon: Rocket,
    color: "emerald"
  },
]

const TIPS = [
  "AI matches your portfolio projects to the RFP requirements",
  "Each proposal is uniquely tailored to the client's needs",
  "Your tone preferences are applied automatically",
  "Proposals include relevant experience from your portfolio",
]

const STEP_INTERVAL_MS = 2500

export function ProposalProgress({ isFinished }: ProposalProgressProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [tipIndex, setTipIndex] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)

  // Step progression
  useEffect(() => {
    if (isFinished) {
      setCurrentStep(STEPS.length)
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)
      return
    }

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= STEPS.length) return prev
        return prev + 1
      })
    }, STEP_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [isFinished])

  // Tip rotation
  useEffect(() => {
    if (isFinished) return
    const tipInterval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % TIPS.length)
    }, 4000)
    return () => clearInterval(tipInterval)
  }, [isFinished])

  // Elapsed time counter
  useEffect(() => {
    if (isFinished) return
    const timeInterval = setInterval(() => {
      setElapsedTime((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(timeInterval)
  }, [isFinished])

  const getStepStatus = (stepId: number): "completed" | "current" | "pending" => {
    if (isFinished) return "completed"
    if (stepId < currentStep) return "completed"
    if (stepId === currentStep) return "current"
    return "pending"
  }

  const progressPercentage = isFinished 
    ? 100 
    : Math.min(((currentStep - 1) / STEPS.length) * 100 + (100 / STEPS.length) * 0.6, 95)

  return (
    <div className="flex flex-col items-center justify-center py-8 px-4">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-10px`,
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            >
              <div 
                className="w-3 h-3 rotate-45"
                style={{
                  backgroundColor: ['#14b8a6', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899'][Math.floor(Math.random() * 5)]
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Main Card */}
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className={cn(
          "text-center mb-8 transition-all duration-500",
          isFinished ? "animate-bounce-once" : ""
        )}>
          <div className={cn(
            "inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 transition-all duration-500",
            isFinished 
              ? "bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/30" 
              : "bg-gradient-to-br from-primary to-teal-500 shadow-lg shadow-primary/30 animate-pulse"
          )}>
            {isFinished ? (
              <Check className="h-10 w-10 text-white animate-scale-in" />
            ) : (
              <Sparkles className="h-10 w-10 text-white animate-sparkle" />
            )}
          </div>
          <h2 className={cn(
            "text-2xl font-bold mb-2 transition-all duration-500",
            isFinished 
              ? "bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent" 
              : "bg-gradient-to-r from-primary to-teal-500 bg-clip-text text-transparent"
          )}>
            {isFinished ? "🎉 Proposal Ready!" : "Generating Your Proposal"}
          </h2>
          <p className="text-muted-foreground">
            {isFinished 
              ? "Your personalized proposal has been created" 
              : `Working on it... ${elapsedTime}s`}
          </p>
        </div>

        {/* Timeline */}
        <div className="relative mb-8">
          {/* Connecting Line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-muted" />
          <div 
            className="absolute left-6 top-0 w-0.5 bg-gradient-to-b from-teal-500 to-emerald-500 transition-all duration-700 ease-out"
            style={{ height: `${progressPercentage}%` }}
          />

          {/* Steps */}
          <div className="space-y-4">
            {STEPS.map((step, index) => {
              const status = getStepStatus(step.id)
              const Icon = step.icon
              
              return (
                <div
                  key={step.id}
                  className={cn(
                    "relative flex items-start gap-4 pl-0 transition-all duration-500",
                    status === "pending" && "opacity-50",
                    status === "current" && "animate-fade-in-up"
                  )}
                  style={{
                    animationDelay: status === "current" ? "0ms" : `${index * 100}ms`
                  }}
                >
                  {/* Step Circle */}
                  <div className={cn(
                    "relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all duration-500",
                    status === "completed" && "bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-500/20 scale-100",
                    status === "current" && "bg-gradient-to-br from-primary to-teal-500 text-white shadow-lg shadow-primary/30 scale-110 animate-glow",
                    status === "pending" && "bg-muted text-muted-foreground"
                  )}>
                    {status === "completed" ? (
                      <Check className="h-5 w-5 animate-scale-in" />
                    ) : (
                      <Icon className={cn("h-5 w-5", status === "current" && "animate-pulse")} />
                    )}
                  </div>

                  {/* Step Content */}
                  <div className={cn(
                    "flex-1 pt-1 transition-all duration-300",
                    status === "current" && "translate-x-1"
                  )}>
                    <div className="flex items-center gap-2">
                      <p className={cn(
                        "font-semibold transition-colors duration-300",
                        status === "completed" && "text-emerald-600",
                        status === "current" && "text-foreground",
                        status === "pending" && "text-muted-foreground"
                      )}>
                        {step.label}
                      </p>
                      {status === "current" && (
                        <span className="flex gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                        </span>
                      )}
                    </div>
                    <p className={cn(
                      "text-sm transition-colors duration-300",
                      status === "completed" && "text-emerald-600/70",
                      status === "current" && "text-muted-foreground",
                      status === "pending" && "text-muted-foreground/50"
                    )}>
                      {status === "completed" ? step.completedText : step.description}
                    </p>
                  </div>

                  {/* Step Badge */}
                  <div className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 mt-1",
                    status === "completed" && "bg-emerald-100 text-emerald-700",
                    status === "current" && "bg-primary/10 text-primary ring-2 ring-primary/30 ring-offset-2",
                    status === "pending" && "bg-muted text-muted-foreground"
                  )}>
                    {status === "completed" ? "✓" : index + 1}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full transition-all duration-700 ease-out relative overflow-hidden",
                isFinished 
                  ? "bg-gradient-to-r from-emerald-400 to-teal-500" 
                  : "bg-gradient-to-r from-primary to-teal-500"
              )}
              style={{ width: `${progressPercentage}%` }}
            >
              {/* Shimmer effect */}
              {!isFinished && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
              )}
            </div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>Step {Math.min(currentStep, STEPS.length)} of {STEPS.length}</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
        </div>

        {/* Rotating Tips */}
        {!isFinished && (
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary/5 to-teal-500/5 border border-primary/10 p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-lg">💡</span>
              </div>
              <div className="flex-1 min-h-[40px]">
                <p className="text-sm font-medium text-primary mb-0.5">Did you know?</p>
                <p 
                  key={tipIndex} 
                  className="text-sm text-muted-foreground animate-fade-in"
                >
                  {TIPS[tipIndex]}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {isFinished && (
          <div className="rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 p-4 text-center animate-fade-in-up">
            <p className="text-sm text-emerald-700 font-medium">
              ✨ Your proposal is ready for review. Make any edits and send it to win the project!
            </p>
          </div>
        )}
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes confetti {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes sparkle {
          0%, 100% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.1) rotate(5deg); }
        }
        @keyframes scale-in {
          0% { transform: scale(0); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(20, 184, 166, 0.3); }
          50% { box-shadow: 0 0 30px rgba(20, 184, 166, 0.5); }
        }
        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce-once {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-confetti { animation: confetti linear forwards; }
        .animate-shimmer { animation: shimmer 2s infinite; }
        .animate-sparkle { animation: sparkle 2s ease-in-out infinite; }
        .animate-scale-in { animation: scale-in 0.4s ease-out forwards; }
        .animate-glow { animation: glow 2s ease-in-out infinite; }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
        .animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards; }
        .animate-bounce-once { animation: bounce-once 0.5s ease-out; }
      `}</style>
    </div>
  )
}

