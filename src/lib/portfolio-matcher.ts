export interface PortfolioItemInput {
  id?: string // Optional UUID for portfolio items
  title: string
  description: string
  tags: string[]
}

export interface MatchedPortfolioItem extends PortfolioItemInput {
  relevanceScore: number
  matchedKeywords: string[]
  descriptionScore: number // Score from RFP description matching (70% weight)
  portfolioScore: number // Score from portfolio item matching (30% weight)
}

/**
 * Match portfolio items to RFP requirements based on keywords, tags, and descriptions
 * 
 * WEIGHTING: Description keywords (70%) > Portfolio matching (30%)
 * This ensures the RFP description is the primary driver of relevance,
 * not the user's portfolio items.
 */
export function matchPortfolioToRFP(
  portfolioItems: PortfolioItemInput[],
  rfpText: string,
  extractedSkills: string[] = []
): MatchedPortfolioItem[] {
  // Extract keywords from RFP (PRIMARY - 70% weight)
  const rfpKeywords = extractKeywords(rfpText.toLowerCase())
  const allKeywords = [...rfpKeywords, ...extractedSkills.map(s => s.toLowerCase())]

  // Score each portfolio item
  const scored = portfolioItems.map((item) => {
    const itemText = `${item.title} ${item.description} ${(item.tags || []).join(' ')}`.toLowerCase()
    const matchedKeywords: string[] = []
    let descriptionScore = 0 // Score from RFP description matching
    let portfolioScore = 0 // Score from portfolio item attributes

    // PRIMARY: Check for RFP keyword matches in portfolio (70% weight)
    rfpKeywords.forEach((keyword) => {
      if (itemText.includes(keyword)) {
        matchedKeywords.push(keyword)
        descriptionScore += 3 // RFP keyword match is worth 3 points (higher weight)
      }
    })

    // SECONDARY: Check extracted skills matches (30% weight)
    extractedSkills.forEach((skill) => {
      const skillLower = skill.toLowerCase()
      if (itemText.includes(skillLower)) {
        if (!matchedKeywords.includes(skillLower)) {
          matchedKeywords.push(skillLower)
        }
        portfolioScore += 1 // Skill match is worth 1 point (lower weight)
      }
    })

    // SECONDARY: Check tag matches (30% weight)
    item.tags?.forEach((tag) => {
      const tagLower = tag.toLowerCase()
      rfpKeywords.forEach((keyword) => {
        if (tagLower.includes(keyword) || keyword.includes(tagLower)) {
          if (!matchedKeywords.includes(keyword)) {
            matchedKeywords.push(keyword)
          }
          portfolioScore += 2 // Tag match is worth 2 points
        }
      })
    })

    // SECONDARY: Title matches (30% weight)
    const titleLower = item.title.toLowerCase()
    rfpKeywords.forEach((keyword) => {
      if (titleLower.includes(keyword)) {
        if (!matchedKeywords.includes(keyword)) {
          matchedKeywords.push(keyword)
        }
        portfolioScore += 2 // Title match is worth 2 points
      }
    })

    // Calculate weighted total score: Description (70%) + Portfolio (30%)
    const totalScore = (descriptionScore * 0.7) + (portfolioScore * 0.3)

    return {
      ...item,
      relevanceScore: totalScore,
      descriptionScore,
      portfolioScore,
      matchedKeywords: [...new Set(matchedKeywords)], // Remove duplicates
    }
  })

  // Sort by relevance score (highest first)
  return scored.sort((a, b) => b.relevanceScore - a.relevanceScore)
}

/**
 * Extract keywords from text (simple implementation)
 */
function extractKeywords(text: string): string[] {
  // Common stop words to ignore
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does',
    'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can', 'this', 'that',
    'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us',
    'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their', 'what', 'which', 'who', 'whom',
    'whose', 'where', 'when', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more',
    'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than',
    'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now',
  ])

  // Extract words (2+ characters, alphanumeric)
  const words = text.match(/\b[a-z]{2,}\b/gi) || []
  
  // Filter out stop words and return unique keywords
  const keywords = words
    .map((w) => w.toLowerCase())
    .filter((w) => !stopWords.has(w))
    .filter((w) => w.length >= 3) // At least 3 characters

  // Return top 20 most common keywords
  const frequency: Record<string, number> = {}
  keywords.forEach((word) => {
    frequency[word] = (frequency[word] || 0) + 1
  })

  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word]) => word)
}

/**
 * Get top N most relevant portfolio items
 */
export function getTopPortfolioMatches(
  portfolioItems: PortfolioItemInput[],
  rfpText: string,
  extractedSkills: string[] = [],
  topN: number = 3
): PortfolioItemInput[] {
  const matched = matchPortfolioToRFP(portfolioItems, rfpText, extractedSkills)
  return matched.slice(0, topN).map(({ relevanceScore, matchedKeywords, ...item }) => item)
}

