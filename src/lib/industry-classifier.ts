/**
 * Industry Classifier Module
 * 
 * Reliable AI-powered industry classification that extracts industry
 * DIRECTLY from the user's project description, not from portfolio items.
 * 
 * Classification priority: Description (70%) > Portfolio context (30%)
 */

import { openai } from './openai'
import { HELPER_MODEL, MODEL_TEMPERATURES } from '@/config/ai'

// ============================================================
// TYPES
// ============================================================

export type IndustryType = 
  | 'saas'
  | 'web-development'
  | 'e-commerce'
  | 'marketing'
  | 'logistics'
  | 'construction'
  | 'ai-tools'
  | 'mobile-apps'
  | 'portfolio-sites'
  | 'consulting'
  | 'healthcare'
  | 'finance'
  | 'education'
  | 'real-estate'
  | 'general-business'

export interface ClassifiedProject {
  industry: IndustryType
  industryLabel: string
  projectType: string
  coreRequirements: string[]
  techStack: string[]
  timeline: string | null
  deliverables: string[]
  confidence: number
  reasoning: string
}

// ============================================================
// INDUSTRY KEYWORDS (for fallback classification)
// ============================================================

const INDUSTRY_KEYWORDS: Record<IndustryType, string[]> = {
  'saas': [
    'saas', 'software as a service', 'subscription', 'mvp', 'minimum viable product',
    'dashboard', 'user auth', 'authentication', 'onboarding', 'trial', 'freemium',
    'recurring revenue', 'mrr', 'arr', 'churn', 'activation', 'product-led',
    'b2b software', 'b2c software', 'web app', 'application', 'platform',
    'user management', 'admin panel', 'tenant', 'multi-tenant', 'api',
    'integrations', 'webhooks', 'billing', 'stripe', 'payments'
  ],
  'web-development': [
    'website', 'web design', 'landing page', 'homepage', 'responsive',
    'frontend', 'backend', 'full-stack', 'react', 'next.js', 'vue', 'angular',
    'wordpress', 'webflow', 'squarespace', 'html', 'css', 'javascript',
    'redesign', 'rebuild', 'revamp', 'modern website', 'business website',
    'company website', 'corporate site', 'brochure site'
  ],
  'e-commerce': [
    'e-commerce', 'ecommerce', 'online store', 'shop', 'shopify', 'woocommerce',
    'magento', 'product catalog', 'shopping cart', 'checkout', 'inventory',
    'order management', 'payment gateway', 'product pages', 'collections',
    'dropshipping', 'fulfillment', 'sku', 'variants', 'merchandise'
  ],
  'marketing': [
    'marketing', 'seo', 'ppc', 'advertising', 'ads', 'google ads', 'facebook ads',
    'social media', 'content marketing', 'email marketing', 'lead generation',
    'conversion rate', 'analytics', 'branding', 'brand identity', 'copywriting',
    'campaign', 'funnel', 'landing page optimization', 'a/b testing'
  ],
  'logistics': [
    'logistics', 'freight', 'shipping', 'transport', 'trucking', 'delivery',
    'fleet', 'dispatch', 'route', 'tracking', 'warehouse', 'supply chain',
    'carrier', 'load', 'shipment', 'last-mile', 'distribution', '3pl', 'ltl', 'ftl'
  ],
  'construction': [
    'construction', 'contractor', 'builder', 'remodel', 'renovation', 'roofing',
    'plumbing', 'electrical', 'hvac', 'landscaping', 'painting', 'flooring',
    'general contractor', 'home improvement', 'trades', 'handyman', 'carpentry',
    'masonry', 'concrete', 'framing', 'drywall'
  ],
  'ai-tools': [
    'ai', 'artificial intelligence', 'machine learning', 'ml', 'gpt', 'openai',
    'chatbot', 'llm', 'large language model', 'neural network', 'deep learning',
    'nlp', 'natural language', 'computer vision', 'automation', 'ai-powered',
    'intelligent', 'predictive', 'recommendation engine', 'ai assistant'
  ],
  'mobile-apps': [
    'mobile app', 'ios', 'android', 'react native', 'flutter', 'swift',
    'kotlin', 'app store', 'play store', 'native app', 'hybrid app',
    'mobile development', 'push notifications', 'mobile-first', 'app development'
  ],
  'portfolio-sites': [
    'portfolio', 'personal website', 'personal brand', 'freelancer site',
    'creative portfolio', 'photographer', 'designer portfolio', 'artist',
    'showcase', 'gallery', 'work samples', 'resume site', 'cv website'
  ],
  'consulting': [
    'consulting', 'consultant', 'advisory', 'strategy', 'coach', 'coaching',
    'business consulting', 'management consulting', 'professional services',
    'thought leadership', 'expertise', 'advisory services'
  ],
  'healthcare': [
    'healthcare', 'medical', 'health', 'clinic', 'hospital', 'patient',
    'telemedicine', 'telehealth', 'hipaa', 'ehr', 'emr', 'wellness',
    'fitness', 'mental health', 'therapy', 'dental', 'pharmacy'
  ],
  'finance': [
    'finance', 'fintech', 'banking', 'investment', 'trading', 'crypto',
    'blockchain', 'wallet', 'payment', 'insurance', 'lending', 'mortgage',
    'accounting', 'bookkeeping', 'tax', 'financial services'
  ],
  'education': [
    'education', 'edtech', 'learning', 'course', 'lms', 'e-learning',
    'training', 'school', 'university', 'student', 'teacher', 'tutoring',
    'curriculum', 'certification', 'online course'
  ],
  'real-estate': [
    'real estate', 'property', 'listing', 'mls', 'realtor', 'broker',
    'rental', 'apartment', 'housing', 'commercial property', 'residential',
    'property management', 'real estate agent'
  ],
  'general-business': [
    'business', 'company', 'corporate', 'enterprise', 'organization',
    'professional', 'services', 'solutions', 'firm', 'agency'
  ]
}

// Industry labels for display
const INDUSTRY_LABELS: Record<IndustryType, string> = {
  'saas': 'SaaS / Software Product',
  'web-development': 'Web Development',
  'e-commerce': 'E-Commerce',
  'marketing': 'Marketing Agency',
  'logistics': 'Logistics & Transportation',
  'construction': 'Construction & Trades',
  'ai-tools': 'AI Tools & Automation',
  'mobile-apps': 'Mobile App Development',
  'portfolio-sites': 'Portfolio & Personal Sites',
  'consulting': 'Business Consulting',
  'healthcare': 'Healthcare & Wellness',
  'finance': 'Finance & Fintech',
  'education': 'Education & E-Learning',
  'real-estate': 'Real Estate',
  'general-business': 'General Business'
}

// ============================================================
// AI-POWERED CLASSIFICATION
// ============================================================

/**
 * Classify project industry using AI analysis of the description
 * This is the primary classification method
 */
export async function classifyProjectIndustry(
  projectDescription: string,
  portfolioContext?: string
): Promise<ClassifiedProject> {
  if (!openai) {
    // Fallback to keyword-based classification
    return fallbackClassification(projectDescription)
  }

  const prompt = `Analyze this project request and classify it accurately.

PROJECT DESCRIPTION (PRIMARY - weight 70%):
"""
${projectDescription}
"""

${portfolioContext ? `PORTFOLIO CONTEXT (SECONDARY - weight 30%):
"""
${portfolioContext}
"""` : ''}

CRITICAL RULES:
1. Classification must be based PRIMARILY on the project description (70% weight)
2. Portfolio context is only for additional context (30% weight)
3. NEVER classify as "construction" or "trades" unless the description EXPLICITLY mentions construction, contracting, remodeling, roofing, plumbing, electrical, HVAC, or similar trade work
4. SaaS/software projects include: MVP, dashboard, web app, platform, user auth, subscription, admin panel
5. Be specific - don't default to generic categories

CLASSIFICATION OPTIONS:
- saas: SaaS products, web apps, platforms, MVPs, dashboards, subscription software
- web-development: Websites, landing pages, corporate sites, redesigns
- e-commerce: Online stores, Shopify, product catalogs, shopping carts
- marketing: Marketing agencies, SEO, PPC, social media, lead generation
- logistics: Freight, shipping, trucking, delivery, fleet management
- construction: ONLY if explicitly about construction, contractors, trades, remodeling
- ai-tools: AI-powered tools, chatbots, ML applications, automation
- mobile-apps: iOS, Android, React Native, Flutter apps
- portfolio-sites: Personal portfolios, creative showcases, freelancer sites
- consulting: Business consulting, coaching, advisory services
- healthcare: Medical, clinics, telehealth, wellness
- finance: Fintech, banking, payments, investment
- education: E-learning, courses, LMS, training
- real-estate: Property listings, realtor sites, rentals
- general-business: Generic business sites that don't fit other categories

Return JSON with this exact structure:
{
  "industry": "one of the options above",
  "industryLabel": "human-readable industry name",
  "projectType": "specific type of project (e.g., 'SaaS MVP', 'E-commerce Store', 'Landing Page')",
  "coreRequirements": ["requirement 1", "requirement 2", ...],
  "techStack": ["technology 1", "technology 2", ...],
  "timeline": "extracted timeline or null",
  "deliverables": ["deliverable 1", "deliverable 2", ...],
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation of why this classification was chosen"
}`

  try {
    const response = await openai.chat.completions.create({
      model: HELPER_MODEL,
      messages: [
        {
          role: 'system',
          content: `You are an expert project classifier. You MUST classify based on the actual project description, not assumptions. 
          
CRITICAL: Never classify as "construction" unless the text explicitly mentions construction, contracting, building, remodeling, roofing, plumbing, electrical, HVAC, or similar trade work.

For software/tech projects, always prefer: saas, web-development, ai-tools, mobile-apps, or e-commerce.`
        },
        { role: 'user', content: prompt }
      ],
      temperature: MODEL_TEMPERATURES.helper,
      max_tokens: 1000,
      response_format: { type: 'json_object' }
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      return fallbackClassification(projectDescription)
    }

    const result = JSON.parse(content) as ClassifiedProject
    
    // Validate the industry is a valid type
    if (!INDUSTRY_LABELS[result.industry as IndustryType]) {
      result.industry = 'general-business'
      result.industryLabel = INDUSTRY_LABELS['general-business']
    }
    
    return result
  } catch (error) {
    console.error('Industry classification error:', error)
    return fallbackClassification(projectDescription)
  }
}

// ============================================================
// FALLBACK KEYWORD-BASED CLASSIFICATION
// ============================================================

/**
 * Fallback classification using keyword matching
 * Used when AI classification fails
 */
function fallbackClassification(projectDescription: string): ClassifiedProject {
  const text = projectDescription.toLowerCase()
  
  // Score each industry based on keyword matches
  const scores: Record<IndustryType, number> = {} as Record<IndustryType, number>
  
  for (const [industry, keywords] of Object.entries(INDUSTRY_KEYWORDS)) {
    scores[industry as IndustryType] = 0
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        // Weight by keyword specificity (longer keywords = more specific)
        scores[industry as IndustryType] += keyword.length > 5 ? 3 : 1
      }
    }
  }
  
  // CRITICAL: Penalize construction if no explicit construction keywords
  const hasExplicitConstruction = [
    'construction', 'contractor', 'remodel', 'renovation', 'roofing',
    'plumbing', 'electrical', 'hvac', 'landscaping', 'builder', 'trades'
  ].some(kw => text.includes(kw))
  
  if (!hasExplicitConstruction) {
    scores['construction'] = 0
  }
  
  // Find highest scoring industry
  let bestIndustry: IndustryType = 'general-business'
  let bestScore = 0
  
  for (const [industry, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score
      bestIndustry = industry as IndustryType
    }
  }
  
  // If no clear winner, default to web-development for tech-related, general-business otherwise
  if (bestScore < 3) {
    const techKeywords = ['website', 'web', 'app', 'software', 'platform', 'dashboard', 'mvp', 'landing']
    const hasTechKeywords = techKeywords.some(kw => text.includes(kw))
    bestIndustry = hasTechKeywords ? 'web-development' : 'general-business'
  }
  
  return {
    industry: bestIndustry,
    industryLabel: INDUSTRY_LABELS[bestIndustry],
    projectType: extractProjectType(text),
    coreRequirements: extractRequirements(text),
    techStack: extractTechStack(text),
    timeline: extractTimeline(text),
    deliverables: extractDeliverables(text),
    confidence: bestScore > 10 ? 0.9 : bestScore > 5 ? 0.7 : 0.5,
    reasoning: `Keyword-based classification with ${bestScore} matching keywords`
  }
}

// ============================================================
// HELPER EXTRACTION FUNCTIONS
// ============================================================

function extractProjectType(text: string): string {
  const patterns: [RegExp, string][] = [
    [/saas\s*(mvp|product|platform)?/i, 'SaaS Product'],
    [/mvp/i, 'MVP Development'],
    [/dashboard/i, 'Dashboard Application'],
    [/landing\s*page/i, 'Landing Page'],
    [/e-?commerce|online\s*store|shop/i, 'E-Commerce Store'],
    [/mobile\s*app/i, 'Mobile Application'],
    [/web\s*app/i, 'Web Application'],
    [/website|site/i, 'Website'],
    [/portfolio/i, 'Portfolio Site'],
    [/redesign/i, 'Website Redesign'],
  ]
  
  for (const [pattern, type] of patterns) {
    if (pattern.test(text)) {
      return type
    }
  }
  
  return 'Web Project'
}

function extractRequirements(text: string): string[] {
  const requirements: string[] = []
  
  const patterns = [
    { pattern: /auth|login|signup|sign-?up/i, req: 'User authentication' },
    { pattern: /dashboard/i, req: 'Dashboard interface' },
    { pattern: /payment|stripe|billing/i, req: 'Payment integration' },
    { pattern: /responsive|mobile/i, req: 'Responsive design' },
    { pattern: /seo/i, req: 'SEO optimization' },
    { pattern: /api|integration/i, req: 'API integration' },
    { pattern: /database|db/i, req: 'Database design' },
    { pattern: /admin|cms/i, req: 'Admin panel/CMS' },
    { pattern: /email|notification/i, req: 'Email notifications' },
    { pattern: /analytics/i, req: 'Analytics tracking' },
  ]
  
  for (const { pattern, req } of patterns) {
    if (pattern.test(text)) {
      requirements.push(req)
    }
  }
  
  return requirements.length > 0 ? requirements : ['Custom development']
}

function extractTechStack(text: string): string[] {
  const stack: string[] = []
  
  const techPatterns = [
    { pattern: /react/i, tech: 'React' },
    { pattern: /next\.?js/i, tech: 'Next.js' },
    { pattern: /vue/i, tech: 'Vue.js' },
    { pattern: /angular/i, tech: 'Angular' },
    { pattern: /node/i, tech: 'Node.js' },
    { pattern: /python/i, tech: 'Python' },
    { pattern: /typescript|ts/i, tech: 'TypeScript' },
    { pattern: /tailwind/i, tech: 'Tailwind CSS' },
    { pattern: /wordpress/i, tech: 'WordPress' },
    { pattern: /shopify/i, tech: 'Shopify' },
    { pattern: /webflow/i, tech: 'Webflow' },
    { pattern: /supabase/i, tech: 'Supabase' },
    { pattern: /firebase/i, tech: 'Firebase' },
    { pattern: /postgres|postgresql/i, tech: 'PostgreSQL' },
    { pattern: /mongodb/i, tech: 'MongoDB' },
    { pattern: /stripe/i, tech: 'Stripe' },
    { pattern: /aws/i, tech: 'AWS' },
    { pattern: /vercel/i, tech: 'Vercel' },
  ]
  
  for (const { pattern, tech } of techPatterns) {
    if (pattern.test(text)) {
      stack.push(tech)
    }
  }
  
  return stack
}

function extractTimeline(text: string): string | null {
  const patterns = [
    /(\d+)\s*(week|wk)s?/i,
    /(\d+)\s*(month)s?/i,
    /(\d+)\s*(day)s?/i,
    /asap|urgent|immediately/i,
    /deadline[:\s]+([^\n.]+)/i,
  ]
  
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      return match[0]
    }
  }
  
  return null
}

function extractDeliverables(text: string): string[] {
  const deliverables: string[] = []
  
  const patterns = [
    { pattern: /landing\s*page/i, del: 'Landing page' },
    { pattern: /dashboard/i, del: 'Dashboard' },
    { pattern: /admin\s*panel/i, del: 'Admin panel' },
    { pattern: /mobile\s*app/i, del: 'Mobile app' },
    { pattern: /api/i, del: 'API' },
    { pattern: /database/i, del: 'Database' },
    { pattern: /design|ui|ux/i, del: 'UI/UX design' },
    { pattern: /logo|branding/i, del: 'Branding assets' },
    { pattern: /documentation|docs/i, del: 'Documentation' },
  ]
  
  for (const { pattern, del } of patterns) {
    if (pattern.test(text)) {
      deliverables.push(del)
    }
  }
  
  return deliverables.length > 0 ? deliverables : ['Project deliverables']
}

// ============================================================
// EXPORTS
// ============================================================

export { INDUSTRY_LABELS, INDUSTRY_KEYWORDS }

