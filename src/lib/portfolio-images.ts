/**
 * Generate industry-appropriate image URLs for portfolio items
 * Uses Unsplash Source API with specific, tested keywords for each industry
 */

// Industry-specific keywords for Unsplash Source API
// Using specific, single-word keywords that Unsplash recognizes
const INDUSTRY_IMAGE_KEYWORDS: Record<string, string> = {
  "SaaS": "technology",
  "eCommerce": "shopping",
  "Web Development": "coding",
  "Mobile App Development": "smartphone",
  "UX Design": "interface",
  "UI Design": "design",
  "Branding": "brand",
  "Marketing": "marketing",
  "Construction": "construction",
  "Logistics": "warehouse",
  "Healthcare": "medical",
  "Finance": "banking",
  "Education": "education",
  "Real Estate": "house",
  "Other": "business",
}

// Alternative keywords for better matching (fallback)
const INDUSTRY_ALT_KEYWORDS: Record<string, string[]> = {
  "SaaS": ["technology", "dashboard", "analytics"],
  "eCommerce": ["online-shopping", "retail", "store"],
  "Web Development": ["programming", "developer", "computer"],
  "Mobile App Development": ["mobile", "iphone", "app"],
  "UX Design": ["user-experience", "wireframe", "design"],
  "UI Design": ["visual-design", "interface", "design"],
  "Branding": ["brand", "identity", "marketing"],
  "Marketing": ["advertising", "digital", "strategy"],
  "Construction": ["building", "architecture", "construction-site"],
  "Logistics": ["shipping", "transport", "delivery"],
  "Healthcare": ["hospital", "doctor", "medicine"],
  "Finance": ["money", "financial", "investment"],
  "Education": ["learning", "school", "university"],
  "Real Estate": ["property", "architecture", "building"],
  "Other": ["office", "professional", "work"],
}

/**
 * Get image keyword for an industry
 * Returns industry-specific keyword or "Other" as fallback
 */
export function getIndustryImageKeyword(industry: string | null | undefined): string {
  if (!industry) return INDUSTRY_IMAGE_KEYWORDS["Other"]
  return INDUSTRY_IMAGE_KEYWORDS[industry] || INDUSTRY_IMAGE_KEYWORDS["Other"]
}

/**
 * Generate image URL using Unsplash Source API
 * Uses industry keywords to get relevant images
 */
export function generatePortfolioImageUrl(
  industry: string | null | undefined,
  width: number = 800,
  height: number = 600
): string {
  const keyword = getIndustryImageKeyword(industry)
  const randomId = Math.floor(Math.random() * 10000)
  // Unsplash Source API format
  return `https://source.unsplash.com/${width}x${height}/?${keyword}&sig=${randomId}`
}

/**
 * Generate a more specific image URL based on title and industry
 * Uses industry-specific keywords with Unsplash Source API
 * Note: Unsplash Source API keyword search has limitations
 * For better results, consider using the official Unsplash API with an API key
 */
export function generateSmartImageUrl(
  title: string | null | undefined,
  industry: string | null | undefined,
  width: number = 800,
  height: number = 600
): string {
  // Get industry-specific keyword
  const keyword = getIndustryImageKeyword(industry)
  
  // Create a consistent identifier based on industry and title
  // Same industry will get similar images, different titles add variety
  const hash = (industry || "other").split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const titleHash = (title || "").split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const uniqueId = hash + titleHash + Math.floor(Math.random() * 10000)
  
  // Use Unsplash Source API
  // Format: https://source.unsplash.com/WIDTHxHEIGHT/?KEYWORD
  // Note: The keyword search may not always return relevant images
  // This is a limitation of the free Unsplash Source API
  return `https://source.unsplash.com/${width}x${height}/?${keyword}&sig=${uniqueId}`
}

