/**
 * Industry Intelligence Module
 * 
 * Comprehensive industry-specific knowledge blocks for proposal generation.
 * Each block contains terminology, KPIs, UX needs, SEO needs, and pain points.
 */

export interface IndustryIntelligence {
  name: string
  terminology: string[]
  kpis: string[]
  uxNeeds: string[]
  seoNeeds: string[]
  painPoints: string[]
  conversionPrinciples: string[]
  technicalRequirements: string[]
}

export const INDUSTRY_INTELLIGENCE: Record<string, IndustryIntelligence> = {
  logistics: {
    name: 'Logistics & Transportation',
    terminology: [
      'dispatch workflow',
      'freight visibility',
      'route optimization',
      'ETA accuracy',
      'cost-per-mile analysis',
      'shipment lifecycle',
      'order-to-delivery flow',
      'capacity planning',
      'last-mile delivery',
      'carrier management',
      'load optimization',
      'fleet tracking',
      'proof of delivery',
      'real-time tracking',
      'supply chain visibility',
    ],
    kpis: [
      'lead-to-conversion rate',
      'on-time delivery %',
      'quote request speed',
      'contact-form abandonment rate',
      'mobile visitor bounce rate',
      'average response time',
      'cost per acquisition',
      'customer lifetime value',
      'service area coverage',
      'repeat customer rate',
    ],
    uxNeeds: [
      'fast quote request system',
      'mobile-first service pages',
      'route/service-area maps',
      'multi-step lead forms',
      'real-time shipment tracking',
      'instant rate calculator',
      'service area lookup',
      'fleet/equipment showcase',
      'customer portal access',
      'live chat for urgent inquiries',
    ],
    seoNeeds: [
      'local ranking for "[city] logistics services"',
      'schema markup for transportation services',
      'service-area structured data',
      'local business schema',
      'FAQ schema for common questions',
      'review schema integration',
      'geo-targeted landing pages',
      'industry-specific keyword optimization',
    ],
    painPoints: [
      'outdated websites that hurt credibility',
      'poor mobile experience losing mobile-first customers',
      'unclear service offerings confusing prospects',
      'slow page load speeds killing conversions',
      'no easy way to request quotes online',
      'competitors outranking in local search',
      'manual quote processes wasting staff time',
      'no visibility into website performance',
      'inconsistent branding across touchpoints',
    ],
    conversionPrinciples: [
      'prominent quote request CTAs above fold',
      'trust signals: years in business, fleet size, certifications',
      'social proof: client logos, testimonials, case studies',
      'clear service area communication',
      'urgency: same-day quotes, 24/7 availability',
      'risk reversal: guarantees, insurance info',
    ],
    technicalRequirements: [
      'sub-3-second page load times',
      '90+ Lighthouse performance score',
      'mobile-first responsive design',
      'CRM integration for lead capture',
      'quote request form with validation',
      'Google Maps API for service areas',
      'SSL and security compliance',
    ],
  },

  construction: {
    name: 'Construction & Trades',
    terminology: [
      'project gallery',
      'before/after showcases',
      'service area mapping',
      'quote estimation',
      'project timeline',
      'permit compliance',
      'material specifications',
      'subcontractor coordination',
      'job site documentation',
      'warranty coverage',
    ],
    kpis: [
      'quote request conversion rate',
      'average project value',
      'customer acquisition cost',
      'portfolio engagement rate',
      'local search ranking',
      'review generation rate',
      'repeat customer percentage',
      'referral rate',
    ],
    uxNeeds: [
      'high-quality project galleries',
      'before/after image sliders',
      'service area maps',
      'easy quote request forms',
      'project type filtering',
      'testimonial showcases',
      'certification/license display',
      'financing options presentation',
    ],
    seoNeeds: [
      'local SEO for "[city] [service] contractor"',
      'project schema markup',
      'local business structured data',
      'service-specific landing pages',
      'geo-targeted content',
      'review aggregation schema',
    ],
    painPoints: [
      'portfolio photos not showcasing work quality',
      'hard to communicate service areas clearly',
      'competitors winning local search rankings',
      'no system for online quote requests',
      'website doesn\'t reflect professionalism',
      'difficult to update project galleries',
      'missing trust signals and certifications',
    ],
    conversionPrinciples: [
      'visual proof of quality work',
      'trust signals: licenses, insurance, warranties',
      'local credibility: years serving area',
      'easy contact methods: click-to-call, forms',
      'financing options prominently displayed',
      'emergency/urgent service availability',
    ],
    technicalRequirements: [
      'image optimization for fast loading',
      'mobile-responsive galleries',
      'form integration with CRM',
      'Google Business Profile optimization',
      'schema markup implementation',
      'fast hosting for image-heavy pages',
    ],
  },

  'web-agency': {
    name: 'Web Development Agency',
    terminology: [
      'conversion optimization',
      'user experience design',
      'responsive development',
      'headless CMS',
      'JAMstack architecture',
      'Core Web Vitals',
      'A/B testing',
      'analytics implementation',
      'SEO architecture',
      'performance optimization',
    ],
    kpis: [
      'client acquisition cost',
      'project profitability',
      'client retention rate',
      'average project value',
      'referral rate',
      'portfolio conversion rate',
      'proposal win rate',
      'time to project completion',
    ],
    uxNeeds: [
      'stunning portfolio showcase',
      'case study presentations',
      'service package clarity',
      'easy project inquiry forms',
      'team/expertise showcase',
      'process visualization',
      'client testimonials',
      'results/metrics display',
    ],
    seoNeeds: [
      'service-specific landing pages',
      'case study content optimization',
      'industry expertise demonstration',
      'local and national targeting',
      'thought leadership content',
      'portfolio SEO optimization',
    ],
    painPoints: [
      'portfolio not converting visitors to leads',
      'unclear service offerings and pricing',
      'difficulty demonstrating ROI to clients',
      'competition from offshore agencies',
      'inconsistent project pipeline',
      'hard to differentiate from competitors',
    ],
    conversionPrinciples: [
      'results-focused case studies',
      'clear pricing/package options',
      'social proof from recognizable clients',
      'expertise demonstration through content',
      'easy consultation booking',
      'risk reversal: guarantees, revisions',
    ],
    technicalRequirements: [
      'blazing-fast performance (practice what you preach)',
      'cutting-edge design and UX',
      'perfect mobile experience',
      'accessibility compliance',
      'modern tech stack showcase',
    ],
  },

  consulting: {
    name: 'Business Consulting',
    terminology: [
      'strategic advisory',
      'business transformation',
      'operational efficiency',
      'change management',
      'stakeholder alignment',
      'ROI analysis',
      'process optimization',
      'market positioning',
      'competitive analysis',
      'growth strategy',
    ],
    kpis: [
      'consultation booking rate',
      'client engagement length',
      'average contract value',
      'referral rate',
      'thought leadership reach',
      'content engagement',
      'speaking engagement inquiries',
      'retainer conversion rate',
    ],
    uxNeeds: [
      'authority-building design',
      'thought leadership content',
      'case study presentations',
      'easy consultation booking',
      'service clarity',
      'credential showcase',
      'speaking/media features',
      'resource library access',
    ],
    seoNeeds: [
      'thought leadership content strategy',
      'industry expertise keywords',
      'local business consulting terms',
      'case study optimization',
      'FAQ content for common questions',
      'personal brand optimization',
    ],
    painPoints: [
      'difficulty establishing thought leadership online',
      'unclear service offerings confusing prospects',
      'no system for booking consultations',
      'lack of social proof and testimonials',
      'content not demonstrating expertise',
      'website doesn\'t reflect premium positioning',
    ],
    conversionPrinciples: [
      'authority positioning through credentials',
      'results-focused case studies',
      'easy consultation scheduling',
      'thought leadership content',
      'premium design reflecting premium services',
      'clear methodology/framework presentation',
    ],
    technicalRequirements: [
      'calendar integration for bookings',
      'content management for thought leadership',
      'email capture for lead nurturing',
      'CRM integration',
      'professional, polished design',
    ],
  },

  marketing: {
    name: 'Marketing Agency',
    terminology: [
      'conversion funnel',
      'lead generation',
      'brand positioning',
      'customer journey mapping',
      'A/B testing',
      'attribution modeling',
      'content strategy',
      'paid media optimization',
      'organic growth',
      'retention marketing',
    ],
    kpis: [
      'client ROI delivery',
      'campaign performance',
      'lead quality score',
      'client retention rate',
      'average contract value',
      'referral rate',
      'case study conversion',
      'proposal win rate',
    ],
    uxNeeds: [
      'results-driven portfolio',
      'case study showcases with metrics',
      'service package clarity',
      'easy inquiry/audit request',
      'team expertise showcase',
      'client logo display',
      'resource/tool offerings',
      'blog/content hub',
    ],
    seoNeeds: [
      'service-specific landing pages',
      'industry vertical targeting',
      'case study content optimization',
      'thought leadership blog',
      'local and national targeting',
      'competitive keyword strategy',
    ],
    painPoints: [
      'difficulty proving ROI to prospects',
      'inconsistent brand messaging',
      'competition from in-house teams',
      'commoditization of services',
      'long sales cycles',
      'portfolio not demonstrating results',
    ],
    conversionPrinciples: [
      'metrics-driven case studies',
      'clear service packages and pricing',
      'social proof from known brands',
      'free audit/consultation offers',
      'thought leadership positioning',
      'results guarantees where possible',
    ],
    technicalRequirements: [
      'fast, modern website (showcase capabilities)',
      'analytics and tracking implementation',
      'CRM and marketing automation',
      'content management system',
      'form and lead capture optimization',
    ],
  },

  saas: {
    name: 'SaaS / Software Product',
    terminology: [
      'product-market fit',
      'user onboarding',
      'activation rate',
      'churn reduction',
      'feature adoption',
      'freemium conversion',
      'customer success',
      'product analytics',
      'growth loops',
      'viral coefficient',
      'MVP development',
      'user authentication',
      'dashboard interface',
      'admin panel',
      'user management',
      'subscription billing',
      'API integration',
      'data visualization',
      'real-time updates',
      'role-based access',
    ],
    kpis: [
      'trial-to-paid conversion',
      'monthly recurring revenue',
      'customer acquisition cost',
      'lifetime value',
      'churn rate',
      'activation rate',
      'feature adoption',
      'NPS score',
      'time to value',
      'user engagement rate',
    ],
    uxNeeds: [
      'clear value proposition',
      'product demo/screenshots',
      'pricing transparency',
      'easy trial signup',
      'feature comparison',
      'integration showcase',
      'customer testimonials',
      'security/compliance badges',
      'intuitive dashboard design',
      'seamless onboarding flow',
      'responsive web application',
      'data-rich visualizations',
    ],
    seoNeeds: [
      'product category keywords',
      'competitor comparison pages',
      'integration partner pages',
      'use case landing pages',
      'feature-specific content',
      'thought leadership blog',
    ],
    painPoints: [
      'low trial-to-paid conversion',
      'unclear value proposition',
      'complex onboarding losing users',
      'pricing page not converting',
      'competitors outranking for key terms',
      'lack of social proof',
      'slow time-to-market for MVP',
      'poor user experience in dashboard',
      'authentication/security concerns',
      'scalability challenges',
    ],
    conversionPrinciples: [
      'clear, immediate value proposition',
      'frictionless trial signup',
      'social proof from known companies',
      'transparent pricing',
      'security and compliance trust signals',
      'product demo accessibility',
      'conversion-optimized landing page',
      'trust-building UI/UX',
    ],
    technicalRequirements: [
      'blazing-fast performance',
      'A/B testing infrastructure',
      'analytics and tracking',
      'CRM integration',
      'email automation',
      'payment processing',
      'secure authentication (OAuth, JWT)',
      'responsive dashboard design',
      'API-first architecture',
      'real-time data sync',
    ],
  },
}

/**
 * Get the best matching industry intelligence based on classified industry
 * 
 * CRITICAL RULE: NEVER return construction intelligence unless the RFP text
 * EXPLICITLY mentions construction, contracting, trades, remodeling, etc.
 */
export function getIndustryIntelligence(
  industry: string,
  projectType?: string | null,
  rfpText?: string
): IndustryIntelligence {
  const searchText = `${industry} ${projectType || ''} ${rfpText || ''}`.toLowerCase()
  
  // CRITICAL: Check for EXPLICIT construction keywords before ever returning construction
  const hasExplicitConstructionKeywords = [
    'construction', 'contractor', 'remodel', 'renovation', 'roofing',
    'plumbing', 'electrical', 'hvac', 'landscaping', 'builder', 'trades',
    'handyman', 'carpentry', 'masonry', 'concrete', 'framing', 'drywall',
    'home improvement', 'general contractor'
  ].some(keyword => searchText.includes(keyword))
  
  // If industry is explicitly set to construction but no explicit keywords, DON'T use construction
  if (industry.toLowerCase().includes('construction') && !hasExplicitConstructionKeywords) {
    // Override to web-agency or saas based on context
    if (searchText.includes('saas') || searchText.includes('mvp') || 
        searchText.includes('dashboard') || searchText.includes('software') ||
        searchText.includes('platform') || searchText.includes('app')) {
      return INDUSTRY_INTELLIGENCE.saas
    }
    return INDUSTRY_INTELLIGENCE['web-agency']
  }
  
  // Check for SaaS/software FIRST (highest priority for tech projects)
  if (searchText.includes('saas') || searchText.includes('mvp') ||
      searchText.includes('dashboard') || searchText.includes('software') ||
      searchText.includes('platform') || searchText.includes('web app') ||
      searchText.includes('application') || searchText.includes('startup') ||
      searchText.includes('subscription') || searchText.includes('user auth') ||
      searchText.includes('authentication') || searchText.includes('admin panel')) {
    return INDUSTRY_INTELLIGENCE.saas
  }
  
  // Check for logistics
  if (searchText.includes('logistics') || searchText.includes('freight') || 
      searchText.includes('shipping') || searchText.includes('transport') ||
      searchText.includes('trucking') || searchText.includes('delivery') ||
      searchText.includes('fleet') || searchText.includes('dispatch')) {
    return INDUSTRY_INTELLIGENCE.logistics
  }
  
  // Only return construction if EXPLICIT keywords are present
  if (hasExplicitConstructionKeywords) {
    return INDUSTRY_INTELLIGENCE.construction
  }
  
  // Check for web agency/development
  if (searchText.includes('web dev') || searchText.includes('web design') ||
      searchText.includes('agency') || searchText.includes('development agency') ||
      searchText.includes('digital agency') || searchText.includes('website') ||
      searchText.includes('landing page') || searchText.includes('redesign')) {
    return INDUSTRY_INTELLIGENCE['web-agency']
  }
  
  // Check for consulting
  if (searchText.includes('consult') || searchText.includes('advisory') ||
      searchText.includes('strategy') || searchText.includes('coach')) {
    return INDUSTRY_INTELLIGENCE.consulting
  }
  
  // Check for marketing
  if (searchText.includes('marketing') || searchText.includes('advertising') ||
      searchText.includes('seo') || searchText.includes('ppc') ||
      searchText.includes('social media') || searchText.includes('branding')) {
    return INDUSTRY_INTELLIGENCE.marketing
  }
  
  // Default to web agency for general web projects (NOT construction)
  return INDUSTRY_INTELLIGENCE['web-agency']
}

/**
 * Format industry intelligence for prompt injection
 */
export function formatIndustryContext(intel: IndustryIntelligence): string {
  return `
## INDUSTRY INTELLIGENCE: ${intel.name}

### Key Terminology (use naturally)
${intel.terminology.slice(0, 10).join(', ')}

### Critical KPIs This Client Cares About
${intel.kpis.slice(0, 6).map(k => `- ${k}`).join('\n')}

### UX Requirements for This Industry
${intel.uxNeeds.slice(0, 6).map(u => `- ${u}`).join('\n')}

### SEO Priorities
${intel.seoNeeds.slice(0, 4).map(s => `- ${s}`).join('\n')}

### Common Pain Points to Address
${intel.painPoints.slice(0, 5).map(p => `- ${p}`).join('\n')}

### Conversion Principles That Work
${intel.conversionPrinciples.slice(0, 4).map(c => `- ${c}`).join('\n')}

### Technical Requirements to Mention
${intel.technicalRequirements.slice(0, 4).map(t => `- ${t}`).join('\n')}
`
}

