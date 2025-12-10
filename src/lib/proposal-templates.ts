/**
 * PRODUCTION PROPOSAL TEMPLATES
 *
 * Professional, structured templates for generating high-conversion proposals.
 * Each template includes mandatory sections, platform-specific variations,
 * and customizable variables for AI pipeline integration.
 *
 * Template Variables:
 * - {{client_name}} - Client's name or company
 * - {{project_name}} - Name of the project
 * - {{industry}} - Client's industry
 * - {{deliverables}} - List of project deliverables
 * - {{timeline}} - Project timeline/duration
 * - {{price}} - Project pricing/investment
 * - {{company_name}} - Your company name
 * - {{contact_email}} - Your contact email
 * - {{pain_points}} - Client's challenges/problems
 * - {{solution_overview}} - High-level solution description
 */

// ============================================================
// CORE STRUCTURAL TEMPLATE (ALL PLATFORMS)
// ============================================================

export const CORE_PROPOSAL_STRUCTURE = `
## MANDATORY STRUCTURE (strictly follow this order):

### 1. EXECUTIVE SUMMARY (3-5 sentences)
- Open with a confident statement addressing {{client_name}}'s primary objective
- Summarize the proposed solution for {{project_name}} in 1-2 sentences
- State the key business outcome or transformation they will achieve
- Mention timeline and investment range if appropriate
- End with your unique differentiator

### 2. PROJECT UNDERSTANDING (1-2 paragraphs)
- Demonstrate deep understanding of {{pain_points}}
- Reframe their challenge through a strategic lens they haven't considered
- Reference specific details from their request that show careful analysis
- Connect to broader {{industry}} trends or business outcomes
- Reveal the hidden opportunity beneath their stated needs

### 3. SCOPE OF WORK (structured list)
- Clear, actionable items organized by phase or category
- Each item tied to a specific outcome
- Use bullet points for scannability
- Include what IS and IS NOT included
- Reference {{industry}} best practices where relevant

### 4. DELIVERABLES (itemized breakdown)
{{deliverables}}

Format each deliverable as:
- **[Deliverable Name]**: Brief description of what client receives
- Include file formats, specifications, or standards where relevant
- Group by project phase if applicable

### 5. PROCESS & APPROACH (2-3 paragraphs)
- WHY your methodology works (not just WHAT you'll do)
- Mention specific frameworks, methodologies, or tools by name
- Tie each step to a measurable client outcome
- Include 1-2 risks you'll proactively mitigate
- Reference relevant {{industry}} experience
- Narrative flow—avoid bullet lists in this section

### 6. TIMELINE & MILESTONES
**Phase 1: [Discovery & Planning]** (Week 1-2)
- Key activities and deliverables
- Milestone: [Specific approval point]

**Phase 2: [Development/Execution]** (Week 3-6)
- Key activities and deliverables
- Milestone: [Specific approval point]

**Phase 3: [Refinement & Launch]** (Week 7-8)
- Key activities and deliverables
- Milestone: [Final delivery/launch]

Estimated Total Timeline: {{timeline}}

### 7. INVESTMENT & PRICING
**Project Investment: {{price}}**

For a project targeting [their stated goal], this investment includes:
- [Value item 1]
- [Value item 2]
- [Value item 3]

**Payment Structure:**
- 50% upon project initiation
- 50% upon final delivery

**Not Included (available as add-ons):**
- [Exclusion 1]
- [Exclusion 2]

### 8. WHY CHOOSE {{company_name}}
- **Relevant Experience**: [Specific metric or credential]
- **Proven Results**: [Quantified outcome from similar project]
- **Industry Expertise**: Deep understanding of {{industry}} challenges
- **Approach Differentiator**: What makes your method unique

Include 1-2 brief proof points:
"[Client/Project Name] → [Quantified Outcome]"
Brief context (1 sentence) + relevance to this project

### 9. TERMS & CONDITIONS (brief)
- Project scope limited to items listed in Deliverables section
- Changes to scope will be documented and may affect timeline/investment
- All work remains property of client upon final payment
- Confidentiality maintained throughout and after engagement

### 10. NEXT STEPS (Call to Action)
Ready to move forward? Here's what happens next:
1. **Reply to confirm** or schedule a brief call to discuss questions
2. **Sign the agreement** (attached/linked)
3. **Kickoff session** scheduled within 48 hours of confirmation

Contact: {{contact_email}}

---
*This proposal is valid for 14 days from the date of submission.*

## WRITING RULES (non-negotiable):

- Write in first person ("I've delivered 40+ projects in {{industry}}")
- Vary sentence length aggressively (3 words. Then 24 words analyzing complex trade-offs.)
- Use {{industry}}-specific terminology naturally
- Every claim needs a number or concrete example
- NO hedging language (eliminate "might," "could," "possibly")
- Read aloud test: if it sounds robotic, rewrite
- Replace generic phrases with specific, value-driven language
`

// ============================================================
// INDUSTRY-SPECIFIC TEMPLATES
// ============================================================

export const INDUSTRY_TEMPLATES: Record<string, string> = {
  'web-development': `
## WEB DEVELOPMENT PROPOSAL TEMPLATE

**Mini Value Proposition:**
"We build websites that convert visitors into customers—not just digital brochures."

**Industry-Specific Sections:**

### Technical Approach
- Frontend framework selection rationale (React, Next.js, Vue, etc.)
- Performance optimization strategy (Core Web Vitals targets)
- SEO architecture from day one
- Mobile-first responsive implementation
- Accessibility compliance (WCAG 2.1 AA minimum)
- Security best practices (SSL, secure headers, input validation)

### Deliverables Checklist
- [ ] Responsive website (desktop, tablet, mobile)
- [ ] CMS integration with training documentation
- [ ] SEO foundation (meta tags, sitemap, schema markup)
- [ ] Performance optimization (target: 90+ Lighthouse score)
- [ ] Cross-browser testing (Chrome, Safari, Firefox, Edge)
- [ ] 30-day post-launch support period
- [ ] Source code and documentation handoff

### Timeline Framework
**Phase 1: Discovery & Strategy** (Week 1)
- Stakeholder interviews and requirements gathering
- Competitive analysis and sitemap planning
- Wireframes and information architecture
- Milestone: Approved wireframes and sitemap

**Phase 2: Design** (Week 2-3)
- Visual design concepts (2 directions)
- Design system and component library
- Responsive mockups for key pages
- Milestone: Approved final designs

**Phase 3: Development** (Week 4-6)
- Frontend development and CMS integration
- Content migration and optimization
- Performance and SEO implementation
- Milestone: Staging site for review

**Phase 4: Launch** (Week 7-8)
- Quality assurance and cross-browser testing
- Client training and documentation
- DNS migration and go-live
- Milestone: Successful launch

### Pricing Structure
- **Standard Website (5-10 pages)**: $5,000-$10,000
- **Custom Web Application**: $15,000-$50,000+
- **E-commerce Platform**: $10,000-$30,000
- **Ongoing Maintenance**: $500-$2,000/month
`,

  'marketing': `
## MARKETING & DIGITAL MARKETING PROPOSAL TEMPLATE

**Mini Value Proposition:**
"We don't just run campaigns—we build revenue engines that scale."

**Industry-Specific Sections:**

### Strategic Approach
- Market analysis and competitive positioning
- Customer journey mapping and touchpoint optimization
- Channel strategy with budget allocation rationale
- KPI framework tied to business outcomes
- Testing and optimization methodology

### Deliverables by Channel
**Content Marketing:**
- Content strategy and editorial calendar
- Blog posts, articles, and thought leadership pieces
- Lead magnets and downloadable assets
- Email nurture sequences

**Paid Advertising:**
- Campaign structure and audience targeting
- Ad creative development (copy + visuals)
- Landing page optimization
- Conversion tracking implementation

**Social Media:**
- Platform-specific content strategy
- Community management guidelines
- Influencer partnership framework
- Social listening and reporting

### Timeline Framework
**Phase 1: Audit & Strategy** (Week 1-2)
- Current state analysis and benchmarking
- Audience research and persona development
- Channel strategy and budget allocation
- Milestone: Approved marketing strategy

**Phase 2: Foundation** (Week 3-4)
- Tracking and attribution setup
- Content creation and asset development
- Campaign structure and creative production
- Milestone: Launch-ready campaigns

**Phase 3: Launch & Optimize** (Week 5-8)
- Campaign launch across channels
- Weekly performance monitoring
- A/B testing and optimization
- Milestone: Month 1 performance report

**Phase 4: Scale** (Ongoing)
- Winning strategy amplification
- New channel testing
- Quarterly strategy reviews

### Pricing Structure
- **Marketing Strategy Only**: $3,000-$8,000
- **Campaign Management (monthly)**: $2,500-$10,000
- **Full-Service Retainer**: $5,000-$25,000/month
- **Project-Based Campaigns**: $5,000-$50,000
`,

  'consulting': `
## CONSULTING & PROFESSIONAL SERVICES PROPOSAL TEMPLATE

**Mini Value Proposition:**
"We solve complex business problems with frameworks that create lasting change—not PowerPoint decks that collect dust."

**Industry-Specific Sections:**

### Engagement Approach
- Diagnostic methodology and assessment framework
- Stakeholder alignment and change management
- Implementation support vs. advisory continuum
- Knowledge transfer and capability building
- Success metrics and measurement approach

### Deliverables Framework
**Discovery Phase:**
- Stakeholder interview synthesis
- Current state assessment report
- Gap analysis and opportunity sizing
- Prioritized recommendation roadmap

**Strategy Development:**
- Strategic options with trade-off analysis
- Implementation playbook with detailed steps
- Resource requirements and timeline
- Risk assessment and mitigation plan

**Implementation Support:**
- Project management and coordination
- Weekly progress reviews and course corrections
- Stakeholder communication and change management
- Capability building and training

### Timeline Framework
**Phase 1: Diagnostic** (Week 1-2)
- Stakeholder interviews (8-12 key individuals)
- Data gathering and analysis
- Current state documentation
- Milestone: Diagnostic findings presentation

**Phase 2: Strategy Development** (Week 3-4)
- Solution design workshops
- Options analysis and recommendation development
- Implementation roadmap creation
- Milestone: Strategy recommendation approval

**Phase 3: Implementation Planning** (Week 5-6)
- Detailed implementation plan
- Resource allocation and governance
- Change management strategy
- Milestone: Implementation kickoff

**Phase 4: Execution Support** (Week 7-12)
- Weekly implementation support
- Issue resolution and course correction
- Progress tracking and reporting
- Milestone: Implementation complete

### Pricing Structure
- **Advisory Engagement (project)**: $15,000-$75,000
- **Implementation Support (monthly)**: $10,000-$50,000
- **Executive Coaching/Fractional**: $2,500-$15,000/month
- **Workshop Facilitation**: $5,000-$15,000/day
`,

  'design': `
## GRAPHIC DESIGN & BRANDING PROPOSAL TEMPLATE

**Mini Value Proposition:**
"We create visual identities that don't just look good—they build recognition, trust, and premium positioning."

**Industry-Specific Sections:**

### Creative Approach
- Brand strategy and positioning foundation
- Visual research and competitive analysis
- Design exploration and iteration process
- Stakeholder feedback integration methodology
- Brand consistency and scalability principles

### Deliverables by Project Type
**Brand Identity:**
- Logo design (primary + variations)
- Color palette with usage guidelines
- Typography system (primary + secondary)
- Brand style guide (print + digital)
- Brand asset library

**Marketing Collateral:**
- Business cards and stationery
- Presentation templates
- Social media templates
- Marketing materials (brochures, flyers)
- Trade show and event materials

**Digital Design:**
- Website UI design
- App interface design
- Email templates
- Digital ad creative
- Icon and illustration library

### Timeline Framework
**Phase 1: Discovery** (Week 1)
- Brand strategy session
- Creative brief development
- Competitive and visual research
- Milestone: Approved creative brief

**Phase 2: Exploration** (Week 2-3)
- Initial concept development (3 directions)
- Presentation and feedback
- Concept refinement
- Milestone: Approved design direction

**Phase 3: Development** (Week 4-5)
- Full identity system development
- Application to key touchpoints
- Style guide creation
- Milestone: Final identity approval

**Phase 4: Delivery** (Week 6)
- Final file preparation
- Asset library organization
- Brand guidelines documentation
- Milestone: Complete brand package delivery

### Pricing Structure
- **Logo Design Only**: $1,500-$5,000
- **Brand Identity Package**: $5,000-$25,000
- **Complete Rebrand**: $15,000-$75,000
- **Marketing Collateral Suite**: $3,000-$15,000
- **Ongoing Design Retainer**: $2,000-$10,000/month
`,

  'trades': `
## TRADES & HOME SERVICES PROPOSAL TEMPLATE

**Mini Value Proposition:**
"Licensed, insured, and committed to doing the job right the first time—with clear communication every step of the way."

**Industry-Specific Sections:**

### Service Approach
- Initial assessment and site evaluation
- Permit requirements and code compliance
- Material specifications and options
- Timeline with minimal disruption
- Warranty and guarantee terms
- Clean-up and final walkthrough process

### Deliverables by Trade
**General Contracting:**
- Detailed scope of work with specifications
- Material allowances and selections
- Subcontractor coordination
- Permit acquisition and inspections
- Progress photos and communication
- Final walkthrough and punch list resolution

**Specialty Trades (Plumbing, Electrical, HVAC):**
- Problem diagnosis and solution options
- Code-compliant installation/repair
- Required permits and inspections
- Equipment warranties and maintenance info
- Emergency service availability

**Landscaping & Outdoor:**
- Design concept and plant specifications
- Installation schedule and weather contingencies
- Irrigation and drainage solutions
- Maintenance recommendations
- Seasonal care instructions

### Timeline Framework
**Phase 1: Assessment & Planning** (Day 1-3)
- On-site evaluation
- Solution options and material selection
- Permit application (if required)
- Milestone: Approved scope and schedule

**Phase 2: Preparation** (Day 4-7)
- Material ordering and delivery
- Site preparation
- Utility coordination
- Milestone: Ready for installation

**Phase 3: Installation/Construction** (Varies by project)
- Work execution with daily updates
- Quality checkpoints
- Inspection coordination
- Milestone: Work complete

**Phase 4: Completion** (Final day)
- Final inspection and punch list
- Client walkthrough
- Clean-up and documentation
- Milestone: Client sign-off

### Pricing Structure
- **Small Repairs/Service Calls**: $150-$500
- **Mid-Size Projects**: $1,000-$10,000
- **Major Renovations**: $10,000-$100,000+
- **Maintenance Agreements**: $100-$500/month

### Trust Signals
- Licensed: [License #]
- Insured: [Coverage amount]
- Years in Business: [X years]
- Local References Available
- Satisfaction Guarantee
`,

  'software': `
## SOFTWARE DEVELOPMENT PROPOSAL TEMPLATE

**Mini Value Proposition:**
"We build software that solves real business problems—scalable, maintainable, and designed for the long term."

**Industry-Specific Sections:**

### Technical Approach
- Architecture design and technology selection rationale
- Development methodology (Agile/Scrum with sprint cadence)
- Code quality standards (testing, review, documentation)
- Security and compliance considerations
- Scalability and performance requirements
- Integration strategy with existing systems

### Deliverables Checklist
**Planning & Design:**
- [ ] Technical requirements specification
- [ ] System architecture documentation
- [ ] Database schema design
- [ ] API specification (OpenAPI/Swagger)
- [ ] UI/UX wireframes and prototypes

**Development:**
- [ ] Source code (version controlled)
- [ ] Automated test suite (unit, integration, e2e)
- [ ] CI/CD pipeline configuration
- [ ] Development and staging environments
- [ ] Technical documentation

**Delivery:**
- [ ] Production deployment
- [ ] Monitoring and alerting setup
- [ ] Admin dashboard and tools
- [ ] User documentation
- [ ] Knowledge transfer sessions

### Timeline Framework (Agile Sprints)
**Sprint 0: Foundation** (Week 1-2)
- Technical discovery and architecture
- Development environment setup
- Backlog refinement and sprint planning
- Milestone: Development-ready foundation

**Sprints 1-4: Core Development** (Week 3-10)
- Feature development in 2-week sprints
- Regular demos and feedback integration
- Continuous testing and code review
- Milestone: Feature-complete application

**Sprint 5: Hardening** (Week 11-12)
- Performance optimization
- Security audit and fixes
- User acceptance testing
- Milestone: Production-ready application

**Sprint 6: Launch** (Week 13-14)
- Production deployment
- Monitoring setup and validation
- Documentation and training
- Milestone: Successful launch

### Pricing Structure
- **MVP/Prototype**: $25,000-$75,000
- **Full Application**: $75,000-$300,000+
- **Enterprise Solution**: $200,000-$1M+
- **Ongoing Development (monthly)**: $15,000-$50,000
- **Maintenance & Support**: $3,000-$15,000/month
`,

  'photography': `
## PHOTOGRAPHY & VIDEOGRAPHY PROPOSAL TEMPLATE

**Mini Value Proposition:**
"We capture moments that tell your story—images that connect with your audience and elevate your brand."

**Industry-Specific Sections:**

### Creative Approach
- Pre-production planning and shot list development
- Location scouting and lighting strategy
- Art direction and styling coordination
- Post-production workflow and timeline
- Usage rights and licensing terms

### Deliverables by Project Type
**Commercial/Brand Photography:**
- High-resolution edited images
- Color correction and retouching
- Multiple aspect ratios for various uses
- Raw files (if included)
- Usage license documentation

**Event Photography:**
- Full event coverage
- Same-day preview images (optional)
- Online gallery for viewing and selection
- High-resolution downloads
- Print release

**Video Production:**
- Final edited video (multiple formats)
- Social media cutdowns
- B-roll and behind-the-scenes
- Motion graphics and titles
- Music licensing documentation

### Timeline Framework
**Phase 1: Pre-Production** (Week 1)
- Creative brief and concept development
- Shot list and mood board creation
- Location/talent/prop coordination
- Milestone: Approved production plan

**Phase 2: Production** (Shoot Day(s))
- On-location or studio capture
- Real-time direction and review
- Backup and file management
- Milestone: Capture complete

**Phase 3: Post-Production** (Week 2-3)
- Culling and selection
- Editing and retouching
- Client review and revisions
- Milestone: Final delivery

### Pricing Structure
- **Headshots/Portraits**: $250-$1,000
- **Brand Photography (half-day)**: $1,500-$3,500
- **Brand Photography (full-day)**: $3,000-$7,500
- **Event Coverage**: $2,000-$10,000
- **Video Production**: $5,000-$50,000+
- **Retainer/Ongoing**: $2,000-$10,000/month

### Usage Rights
- Standard: Web and social media use
- Extended: Print, advertising, packaging
- Exclusive: Full buyout and exclusivity
- Note: Usage scope affects pricing
`,

  'real-estate': `
## REAL ESTATE SERVICES PROPOSAL TEMPLATE

**Mini Value Proposition:**
"We don't just list properties—we create marketing strategies that attract qualified buyers and maximize your return."

**Industry-Specific Sections:**

### Service Approach
- Market analysis and pricing strategy
- Property preparation and staging guidance
- Multi-channel marketing plan
- Showing coordination and feedback
- Negotiation strategy and closing support

### Deliverables by Service
**Listing Services:**
- Comparative market analysis (CMA)
- Professional photography and virtual tour
- MLS listing and syndication
- Print and digital marketing materials
- Open house coordination
- Weekly status reports and market updates

**Buyer Representation:**
- Needs analysis and property matching
- Market education and guidance
- Showing coordination
- Offer strategy and negotiation
- Due diligence coordination
- Closing support

**Investment Analysis:**
- Property evaluation and ROI projections
- Market trend analysis
- Cash flow modeling
- Renovation cost estimates
- Exit strategy planning

### Timeline Framework
**Phase 1: Preparation** (Week 1-2)
- Property evaluation and pricing strategy
- Preparation recommendations
- Marketing plan development
- Milestone: Property market-ready

**Phase 2: Active Marketing** (Week 3-8)
- Listing launch and promotion
- Showing coordination
- Feedback collection and strategy adjustment
- Milestone: Accepted offer

**Phase 3: Under Contract** (Week 9-12)
- Inspection and appraisal coordination
- Negotiation and issue resolution
- Closing preparation
- Milestone: Successful closing

### Pricing Structure
- **Listing Commission**: [X]% of sale price
- **Buyer Agent Commission**: [X]% of purchase price
- **Flat Fee Listing**: $X,XXX
- **Consultation Only**: $XXX/hour
`,

  'general-business': `
## GENERAL BUSINESS SERVICES PROPOSAL TEMPLATE

**Mini Value Proposition:**
"We deliver results-focused solutions tailored to your specific business challenges—on time and on budget."

**Industry-Specific Sections:**

### Approach
- Discovery and requirements gathering
- Solution design and planning
- Implementation with regular checkpoints
- Quality assurance and delivery
- Post-delivery support and optimization

### Standard Deliverables
- Project kickoff documentation
- Progress reports and milestone updates
- Final deliverable(s) as specified
- Documentation and training (if applicable)
- Post-project support period

### Timeline Framework
**Phase 1: Discovery** (Week 1)
- Stakeholder interviews and requirements
- Current state analysis
- Solution approach development
- Milestone: Approved project plan

**Phase 2: Execution** (Week 2-X)
- Solution development/implementation
- Regular progress updates
- Stakeholder review points
- Milestone: Draft deliverable

**Phase 3: Delivery** (Final Week)
- Final review and refinements
- Quality assurance
- Documentation and handoff
- Milestone: Project complete

### Pricing Structure
- Pricing based on scope and complexity
- Fixed-price projects available for defined scope
- Time and materials for flexible engagements
- Retainer options for ongoing needs
`
}

// ============================================================
// PLATFORM-SPECIFIC OVERLAYS
// ============================================================

export const PLATFORM_TEMPLATES: Record<string, string> = {
  Upwork: `
## UPWORK OPTIMIZATION OVERLAY

**STRUCTURAL ADJUSTMENTS:**
- Opening Hook: CRITICAL—first 2 lines determine if they read more
  - Reference their job post by a specific requirement
  - Lead with a strategic insight or challenge they haven't mentioned

- Executive Summary: Compress to 2-3 sentences max (Upwork users scan fast)

- Proof Section: MUST include Upwork-style metrics
  - "5.0★ rating across 12 similar projects"
  - "Delivered [X] on-time with [Y] revisions accepted first-pass"

- Deliverables: Break into weekly milestones with escrow-friendly language
  - "Milestone 1 (Week 1): [Deliverable] → Escrow release: [Specific output]"

- CTA: Offer a technical discovery call OR free audit
  - "I'll draft a preliminary approach this week—share it by Friday with no obligation."

**TONE CALIBRATION:**
- Confidence level: 8/10 (assertive but not cocky)
- Formality: 6/10 (professional but conversational)
- Urgency: Moderate (imply selectivity about projects)

**LENGTH TARGET:** 450-550 words
`,

  Fiverr: `
## FIVERR OPTIMIZATION OVERLAY

**STRUCTURAL ADJUSTMENTS:**
- Opening Hook: Lead with speed + outcome
  - "I'll deliver [specific outcome] in [timeframe]—here's why that timeline is realistic:"

- Executive Summary: Skip—Fiverr buyers want deliverables, not strategy

- Approach: Compress to 1 paragraph focused on what they get

- Proof Section: Use Fiverr-style social proof
  - "1,200+ orders completed"
  - "4.9★ average with 98% repeat client rate"

- Deliverables: Itemized with package tiers
  - **Base Package:** [Items included]
  - **Available Add-Ons:** [Upsells]

- Investment: Show price-per-unit value
  - "$300 total ($60/page)—compare to agency rates at $200/page"

- CTA: Ultra-simple action
  - "Click 'Order Now' or message me with questions—I'll start your project today."

**TONE CALIBRATION:**
- Confidence level: 9/10 (Fiverr rewards bold claims)
- Formality: 4/10 (friendly, energetic)
- Urgency: High (imply limited availability)

**LENGTH TARGET:** 300-400 words
`,

  LinkedIn: `
## LINKEDIN OPTIMIZATION OVERLAY

**STRUCTURAL ADJUSTMENTS:**
- Opening Hook: Frame as a business case
  - "When [Industry Leader] faced [similar challenge], the decision came down to [strategic insight]."

- Project Understanding: Tie to business metrics (CAC, LTV, churn, revenue)
  - Translate technical requests into P&L impact

- Approach: Use consultant-level language
  - Reference frameworks by name (Jobs-to-be-Done, Blue Ocean, etc.)
  - Discuss trade-offs and recommendations

- Proof Section: Use executive-level metrics
  - "$2.4M ARR impact from 18% conversion lift"
  - "Reduced CAC by 34% through redesign"

- Deliverables: Frame as business outcomes, not tasks
  - **Phase 1 Outcome:** Validated strategy with 3 tested positioning variants
  - **Phase 2 Outcome:** Deployed solution targeting 15%+ lift

- Investment: Position as ROI, not cost
  - "For a $50K investment targeting a $500K revenue goal:"

- CTA: Strategic partnership framing
  - "Let's schedule a 30-minute strategic fit call—I'll come prepared with a preliminary hypothesis."

**TONE CALIBRATION:**
- Confidence level: 9/10 (you're a peer, not a vendor)
- Formality: 8/10 (executive-appropriate)
- Urgency: Low (imply selectivity)

**LENGTH TARGET:** 600-700 words
`,

  'Direct RFP': `
## DIRECT RFP OPTIMIZATION OVERLAY

**STRUCTURAL ADJUSTMENTS:**
- Add Executive Summary (BEFORE main content)
  - 3-5 bullet points: problem, solution, timeline, investment, differentiator

- Opening: More formal, reference RFP number if provided
  - "In response to RFP #[number] issued by {{client_name}}:"

- Project Understanding: Call this "Requirements Analysis"
  - Systematically address each stated requirement
  - Use numbered lists matching RFP requirement IDs

- Approach: Call this "Technical Approach & Methodology"
  - Include compliance statements if needed
  - Reference certifications/security requirements

- Proof Section: Call this "Relevant Experience & Case Studies"
  - Formal case study format
  - Include client references and contact info

- Deliverables: Call this "Scope of Work & Deliverables"
  - Gantt-style milestone descriptions
  - Include acceptance criteria for each deliverable

- Investment: Call this "Pricing & Payment Terms"
  - Detailed cost breakdown by phase
  - Payment schedule tied to milestones
  - Assumptions and exclusions section

- CTA: Call this "Next Steps"
  - Formal response timeline
  - Q&A process

**TONE CALIBRATION:**
- Confidence level: 7/10 (professional, not salesy)
- Formality: 9/10 (business formal)
- Urgency: None (comply with RFP timeline)

**LENGTH TARGET:** 700-900 words
`,

  'Email Outreach': `
## EMAIL OUTREACH OPTIMIZATION OVERLAY

**STRUCTURAL ADJUSTMENTS:**
- Opening Hook: This IS your email subject line energy
  - First sentence proves the subject line
  - "I analyzed {{client_name}}'s [X] and found a $47K/year inefficiency."

- Project Understanding: Skip or compress to 1 sentence

- Approach: Compress to 2-3 sentences max
  - Focus on the ONE differentiating thing you'll do

- Proof Section: ONE example only, 2 sentences
  - "[Client] saw [metric] in [timeframe]—similar to your situation."

- Deliverables: Skip entirely OR mention in 1 sentence

- Investment: Skip OR mention as range in 1 sentence
  - "Typical projects in this scope: $5-8K"

- CTA: Ultra-specific, low-friction
  - "Reply 'interested' and I'll send the full audit by Tuesday."

**TONE CALIBRATION:**
- Confidence level: 8/10 (assertive, not pushy)
- Formality: 5/10 (professional but human)
- Urgency: Moderate (imply limited bandwidth)

**LENGTH TARGET:** 200-300 words (STRICT—must be scannable)
`,

  'Agency Pitch': `
## AGENCY PITCH OPTIMIZATION OVERLAY

**STRUCTURAL ADJUSTMENTS:**
- Opening Hook: Lead with vision/transformation story
  - "The brands winning in {{industry}} don't optimize existing tactics—they redefine the category."

- Project Understanding: Call this "Market Opportunity Analysis"
  - Discuss competitive landscape
  - Identify white space/differentiation opportunity

- Approach: Call this "Strategic Positioning & Execution"
  - Lead with strategy, then tactics
  - Discuss brand narrative, not just marketing

- Proof Section: Call this "Transformation Case Studies"
  - Storytelling format (challenge → approach → outcome)
  - Multiple metrics per case study
  - Brand names if allowed

- Deliverables: Call this "Partnership Model & Deliverables"
  - Frame as ongoing partnership, not one-off project
  - Include retainer structure if relevant

- Investment: Call this "Investment & Expected ROI"
  - Show expected return on investment
  - Compare to industry benchmarks
  - Long-term value vs. short-term cost

- CTA: Call this "Let's Co-Create"
  - Propose collaborative kickoff workshop
  - "Let's schedule a 90-minute strategy workshop—we'll come with a preliminary framework."

**TONE CALIBRATION:**
- Confidence level: 10/10 (thought leadership)
- Formality: 7/10 (professional but creative)
- Urgency: Low (you're selective, in-demand)

**LENGTH TARGET:** 700-900 words
`,

  Thumbtack: `
## THUMBTACK OPTIMIZATION OVERLAY

**STRUCTURAL ADJUSTMENTS:**
- Opening Hook: Lead with local credibility
  - "I've completed 40+ projects in [City/Area] over the past 5 years."

- Project Understanding: Skip—Thumbtack users want service providers

- Approach: Focus on process transparency
  - "Here's how I work: [3-step process]"
  - Mention availability, response time, communication style

- Proof Section: Local social proof
  - "4.9★ rating from 78 local clients"
  - "Featured Thumbtack Pro since 2019"
  - Local licenses/certifications

- Deliverables: Service package format
  - **Standard Service:** [Items]
  - **Common Add-Ons:** [List]

- Investment: Clear pricing or quote process
  - "Typical range: $X-Y based on [variable]"
  - "Free on-site estimate within 24 hours"

- CTA: Focus on availability
  - "I have availability Thursday and Friday—reply with your preferred time."

**TONE CALIBRATION:**
- Confidence level: 7/10 (trustworthy, not flashy)
- Formality: 5/10 (friendly professional)
- Urgency: Moderate (emphasize availability)

**LENGTH TARGET:** 350-450 words
`,

  Houzz: `
## HOUZZ OPTIMIZATION OVERLAY

**STRUCTURAL ADJUSTMENTS:**
- Opening Hook: Lead with design understanding
  - "Your inspiration photos lean toward [style]—here's how I'd translate that into your space:"

- Project Understanding: Frame as design challenge/opportunity
  - Discuss aesthetic goals, not just functional requirements

- Approach: Design process walkthrough
  - Specific phases (concept → schematic → construction)
  - Collaboration points (material selection, mockups)

- Proof Section: Portfolio highlights with VISUAL emphasis
  - Reference Houzz portfolio by style tags
  - "See my [Modern Farmhouse] portfolio (12 projects, 200+ saves)"
  - Before/after metrics when possible

- Deliverables: Design deliverable focus
  - 3D renderings, mood boards, material palettes
  - Construction documents
  - Installation oversight

- Investment: Design fee + project cost structure
  - "Design fee: $X (covers all design phases)"
  - "Estimated total: $Y-Z (includes materials + labor)"

- CTA: Design consultation offer
  - "I'll create a preliminary mood board this week—share it to ensure we're aligned before any commitment."

**TONE CALIBRATION:**
- Confidence level: 8/10 (design authority)
- Formality: 6/10 (professional but creative)
- Urgency: Low (design is collaborative)

**LENGTH TARGET:** 450-550 words
`,

  Other: `
## GENERAL OPTIMIZATION OVERLAY

**STRUCTURAL ADJUSTMENTS:**
- Follow core structure exactly
- Match formality level to the original request
- Adjust length based on request complexity

**TONE CALIBRATION:**
- Confidence level: 7/10 (adaptable)
- Formality: 6/10 (professional default)
- Urgency: Low-moderate (context-dependent)

**LENGTH TARGET:** 500-600 words
`
}

// ============================================================
// TONE ADJUSTMENT OVERLAYS
// ============================================================

export const TONE_ADJUSTMENTS: Record<string, string> = {
  more_formal: `
**TONE SHIFT: MORE FORMAL**
- Replace contractions with full words ("you're" → "you are")
- Use passive voice where appropriate ("We recommend" → "It is recommended")
- Eliminate casual language ("Here's the thing" → "The key consideration is")
- Use more technical/industry jargon
- Longer, more complex sentence structures
- Reference academic or industry research where relevant
`,

  more_casual: `
**TONE SHIFT: MORE CASUAL**
- Use contractions freely ("you are" → "you're")
- Active voice everywhere ("It is recommended" → "I recommend")
- Conversational transitions ("Here's the thing:", "Bottom line:")
- Shorter, punchier sentences
- More personality and voice
- Direct address to reader ("You're probably wondering...")
`
}

// ============================================================
// LENGTH ADJUSTMENT OVERLAYS
// ============================================================

export const LENGTH_ADJUSTMENTS: Record<string, string> = {
  shorter: `
**LENGTH: SHORTER (300-450 words)**
- Executive Summary: 1-2 sentences only
- Project Understanding: Skip OR 1 sentence
- Approach: 1 paragraph max
- Proof Section: 1 example, 2-3 sentences
- Deliverables: High-level only (no sub-bullets)
- Investment: 1 sentence OR skip
- CTA: 1 sentence

**WRITING EFFICIENCY RULES:**
- Eliminate all transitional phrases
- Use fragments where appropriate
- Combine related ideas into single sentences
- Cut any sentence that doesn't advance the pitch
`,

  longer: `
**LENGTH: LONGER (800-1000 words)**
- Executive Summary: 4-5 sentences with specific context
- Project Understanding: 2 paragraphs (current state + future state)
- Approach: 3-4 paragraphs with methodology details
- Proof Section: 2-3 case studies with full context
- Deliverables: Detailed breakdown with acceptance criteria
- Investment: Full cost breakdown with options
- CTA: Multi-step engagement process

**WRITING EXPANSION RULES:**
- Add supporting details and examples
- Include risk mitigation strategies
- Discuss alternative approaches and why you chose yours
- Provide more quantified proof points
- Elaborate on team/capabilities
`
}

// ============================================================
// TEMPLATE VARIABLES REFERENCE
// ============================================================

export const TEMPLATE_VARIABLES = {
  client_name: '{{client_name}}',
  project_name: '{{project_name}}',
  industry: '{{industry}}',
  deliverables: '{{deliverables}}',
  timeline: '{{timeline}}',
  price: '{{price}}',
  company_name: '{{company_name}}',
  contact_email: '{{contact_email}}',
  pain_points: '{{pain_points}}',
  solution_overview: '{{solution_overview}}'
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Builds a complete proposal prompt by combining templates
 */
export function buildProposalPrompt(
  platform: string,
  industry?: string,
  toneAdjustment?: 'more_formal' | 'same' | 'more_casual',
  lengthAdjustment?: 'shorter' | 'same' | 'longer'
): string {
  let prompt = CORE_PROPOSAL_STRUCTURE

  // Add industry-specific template if available
  if (industry && INDUSTRY_TEMPLATES[industry]) {
    prompt += '\n\n' + INDUSTRY_TEMPLATES[industry]
  }

  // Add platform overlay
  const platformOverlay = PLATFORM_TEMPLATES[platform] || PLATFORM_TEMPLATES.Other
  prompt += '\n\n' + platformOverlay

  // Add tone adjustment
  if (toneAdjustment && toneAdjustment !== 'same') {
    prompt += '\n\n' + TONE_ADJUSTMENTS[toneAdjustment]
  }

  // Add length adjustment
  if (lengthAdjustment && lengthAdjustment !== 'same') {
    prompt += '\n\n' + LENGTH_ADJUSTMENTS[lengthAdjustment]
  }

  return prompt
}

/**
 * Replaces template variables with actual values
 */
export function fillTemplateVariables(
  template: string,
  variables: Partial<Record<keyof typeof TEMPLATE_VARIABLES, string>>
): string {
  let filled = template

  Object.entries(variables).forEach(([key, value]) => {
    if (value) {
      const placeholder = `{{${key}}}`
      filled = filled.replace(new RegExp(placeholder, 'g'), value)
    }
  })

  return filled
}

/**
 * Gets industry template by key or returns general template
 */
export function getIndustryTemplate(industryKey: string): string {
  return INDUSTRY_TEMPLATES[industryKey] || INDUSTRY_TEMPLATES['general-business']
}

/**
 * Gets platform template by key or returns Other template
 */
export function getPlatformTemplate(platform: string): string {
  return PLATFORM_TEMPLATES[platform] || PLATFORM_TEMPLATES.Other
}

/**
 * Lists all available industry templates
 */
export function getAvailableIndustries(): string[] {
  return Object.keys(INDUSTRY_TEMPLATES)
}

/**
 * Lists all available platforms
 */
export function getAvailablePlatforms(): string[] {
  return Object.keys(PLATFORM_TEMPLATES)
}
