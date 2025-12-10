export interface ProposalTemplate {
  id: string
  name: string
  category: string
  description: string
  industry: string
  platform_fit: string[]
  tone_hint: string
  default_sections: Record<string, string>
  thumbnail_url: string
}

export const PROPOSAL_TEMPLATES: ProposalTemplate[] = [
  {
    id: "web-dev-full-stack",
    name: "Full-Stack Web Development",
    category: "development",
    description: "For building custom web applications with complex requirements",
    industry: "tech",
    platform_fit: ["upwork", "direct_rfp", "linkedin"],
    tone_hint: "professional_technical",
    default_sections: {
      opening: "Address client's technical challenges and business goals",
      approach: "Outline tech stack (React, Node, etc.) and development methodology",
      timeline: "Break down into sprints/phases (Discovery, Dev, QA, Launch)",
      deliverables: "List specific features, source code, hosting setup, documentation",
      investment: "Show pricing breakdown by development phase",
      cta: "Suggest a technical kick-off call to discuss architecture"
    },
    thumbnail_url: "/templates/web-dev.svg"
  },
  {
    id: "brand-identity-design",
    name: "Brand Identity & Logo Design",
    category: "design",
    description: "For branding and visual identity projects",
    industry: "design",
    platform_fit: ["fiverr", "upwork", "thumbtack"],
    tone_hint: "creative_enthusiastic",
    default_sections: {
      opening: "Connect emotionally with their brand vision and target audience",
      discovery: "Explain brand discovery process (mood boards, research)",
      deliverables: "Logo variations, brand guidelines, color palette, typography, source files",
      portfolio: "Show 3-4 relevant past brand transformations",
      investment: "3 packages: Basic (Logo), Standard (Brand Kit), Premium (Full Identity)",
      cta: "Book a creative discovery call"
    },
    thumbnail_url: "/templates/brand-design.svg"
  },
  {
    id: "seo-content-marketing",
    name: "SEO & Content Marketing",
    category: "marketing",
    description: "For content strategy and SEO ranking projects",
    industry: "marketing",
    platform_fit: ["upwork", "linkedin", "direct_rfp"],
    tone_hint: "confident_results_driven",
    default_sections: {
      opening: "Address current traffic/ranking challenges and growth potential",
      audit: "Offer initial SEO audit insights (quick wins)",
      strategy: "Explain content strategy approach (keywords, clusters, distribution)",
      deliverables: "Number of articles, keyword research doc, backlink strategy",
      results: "Show past ranking improvements and traffic growth case studies",
      investment: "Monthly retainer structure or project-based fee",
      cta: "Start with a free mini-audit"
    },
    thumbnail_url: "/templates/seo-marketing.svg"
  },
  {
    id: "mobile-app-dev",
    name: "Mobile App Development",
    category: "development",
    description: "For iOS and Android mobile applications",
    industry: "tech",
    platform_fit: ["upwork", "toptal", "direct_rfp"],
    tone_hint: "technical_innovative",
    default_sections: {
      opening: "Validate the app idea and market fit",
      solution: "Native vs Cross-platform approach (React Native/Flutter)",
      ux_ui: "User journey mapping and interface design phase",
      development: "Frontend, Backend API, and Database structure",
      testing: "QA, Beta testing, and App Store submission process",
      investment: "Milestone-based payments tied to deliverables",
      cta: "Schedule a feasibility discussion"
    },
    thumbnail_url: "/templates/mobile-app.svg"
  },
  {
    id: "social-media-management",
    name: "Social Media Management",
    category: "marketing",
    description: "Monthly retainer for social media growth",
    industry: "marketing",
    platform_fit: ["upwork", "linkedin", "fiverr"],
    tone_hint: "energetic_relatable",
    default_sections: {
      opening: "Identify current brand voice and engagement gaps",
      strategy: "Content pillars, posting schedule, and platform selection",
      content_creation: "Visuals, captions, and hashtag strategy",
      community: "Engagement management (replying to comments/DMs)",
      analytics: "Monthly reporting metrics (Reach, Engagement, Conversion)",
      investment: "Monthly retainer packages (Starter, Growth, Dominance)",
      cta: "Let's audit your current profile"
    },
    thumbnail_url: "/templates/social-media.svg"
  },
  {
    id: "ecommerce-setup",
    name: "E-commerce Store Setup",
    category: "development",
    description: "Shopify, WooCommerce, or custom store setup",
    industry: "retail",
    platform_fit: ["upwork", "shopify_experts", "direct_rfp"],
    tone_hint: "commercial_direct",
    default_sections: {
      opening: "Focus on sales goals and customer experience",
      platform: "Recommendation (Shopify/WooCommerce) and theme selection",
      setup: "Product import, payment gateways, shipping zones",
      design: "Customization for conversion optimization (CRO)",
      launch: "Testing, training, and launch support",
      investment: "Project fee + optional maintenance retainer",
      cta: "Discuss your store requirements"
    },
    thumbnail_url: "/templates/ecommerce.svg"
  },
  {
    id: "ui-ux-design",
    name: "UI/UX Design Project",
    category: "design",
    description: "User interface and experience design for web/mobile",
    industry: "design",
    platform_fit: ["dribbble", "behance", "upwork"],
    tone_hint: "empathetic_modern",
    default_sections: {
      opening: "User-centric problem statement",
      research: "User personas, competitive analysis, user flows",
      wireframing: "Low-fidelity sketches and information architecture",
      visual_design: "High-fidelity mockups and interactive prototypes",
      handoff: "Developer-ready assets (Figma) and design system",
      investment: "Phase-based pricing",
      cta: "View similar design case studies"
    },
    thumbnail_url: "/templates/ui-ux.svg"
  },
  {
    id: "copywriting-sales",
    name: "Sales Copywriting",
    category: "marketing",
    description: "High-conversion copy for landing pages or emails",
    industry: "marketing",
    platform_fit: ["upwork", "direct_rfp", "linkedin"],
    tone_hint: "persuasive_psychological",
    default_sections: {
      opening: "Highlight the conversion/revenue gap",
      methodology: "Research-based copywriting approach (customer voice)",
      deliverables: "Landing page, email sequence, or ad copy drafts",
      revisions: "Collaboration process and revision rounds",
      guarantee: "Satisfaction guarantee or conversion goals",
      investment: "Flat fee per asset or project",
      cta: "Discuss your conversion goals"
    },
    thumbnail_url: "/templates/copywriting.svg"
  },
  {
    id: "video-production",
    name: "Video Production & Editing",
    category: "creative",
    description: "Corporate, promotional, or social video content",
    industry: "media",
    platform_fit: ["upwork", "fiverr", "production_hub"],
    tone_hint: "visual_storyteller",
    default_sections: {
      opening: "Visual concept and storytelling hook",
      pre_production: "Scripting, storyboarding, logistics",
      production: "Filming equipment, crew, location",
      post_production: "Editing, color grading, sound design, motion graphics",
      delivery: "Final formats and aspect ratios",
      investment: "Day rate or per-video pricing",
      cta: "Review reel and discuss concept"
    },
    thumbnail_url: "/templates/video.svg"
  },
  {
    id: "business-consulting",
    name: "Business Consulting",
    category: "consulting",
    description: "Strategy, operations, or management consulting",
    industry: "business",
    platform_fit: ["linkedin", "catalant", "direct_rfp"],
    tone_hint: "executive_authoritative",
    default_sections: {
      opening: "Strategic diagnosis of the business problem",
      methodology: "Framework or model used for analysis",
      roadmap: "Phased implementation plan",
      outcomes: "Projected ROI and business impact metrics",
      credentials: "Consultant bio and relevant industry experience",
      investment: "Retainer or project milestones",
      cta: "Schedule an executive briefing"
    },
    thumbnail_url: "/templates/consulting.svg"
  }
]
