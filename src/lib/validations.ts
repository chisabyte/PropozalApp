import { z } from "zod"

export const onboardingStep1Schema = z.object({
  companyName: z.string().optional(),
  industry: z.enum([
    "Web Development",
    "Marketing",
    "Construction",
    "Consulting",
    "Design",
    "Other"
  ]),
})

export const portfolioItemSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000, "Description must be less than 1000 characters"),
  tags: z.array(z.string()).optional().default([]), // Tags are optional
})

export const onboardingStep2Schema = z.object({
  portfolioItems: z.array(portfolioItemSchema).min(2, "At least 2 portfolio items are required"),
})

export const tonePreferenceSchema = z.enum([
  "Professional & Formal",
  "Friendly & Conversational",
  "Technical & Detailed",
  "Creative & Bold",
])

export const onboardingStep3Schema = z.object({
  tonePreference: tonePreferenceSchema,
})

export const generateProposalSchema = z.object({
  rfpText: z.string().min(50, "RFP text must be at least 50 characters"),
  platform: z.enum(["Upwork", "Fiverr", "LinkedIn", "Thumbtack", "Houzz", "Direct RFP", "Email Outreach", "Agency Pitch", "Other"]),
  projectValue: z.number().positive().optional(),
  proposalTitle: z.string().min(1, "Proposal title is required"),
  style: z.enum(["modern_clean", "corporate", "minimalist", "creative_agency", "startup_pitch", "technical"]).optional().default("modern_clean"),
  language: z.enum(["en", "es", "pt", "ar", "id", "hi"]).optional().default("en"),
  includePricing: z.boolean().optional().default(false),
})

export const updateProposalSchema = z.object({
  content: z.string().min(1),
  title: z.string().min(1).optional(),
  status: z.enum(["draft", "final", "submitted"]).optional(),
})

export const regenerateProposalSchema = z.object({
  tone: z.enum(["more_formal", "same", "more_casual"]).optional(),
  length: z.enum(["shorter", "same", "longer"]).optional(),
})

