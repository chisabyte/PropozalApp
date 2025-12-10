import OpenAI from 'openai'

// Centralized OpenAI configuration with proper key cleaning for project keys
function getCleanApiKey(): string {
  const apiKey = process.env.OPENAI_API_KEY
  
  if (!apiKey) {
    throw new Error('OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable.')
  }
  
  // Remove all whitespace, newlines, and potential hidden characters
  let cleanKey = apiKey.replace(/[\s\n\r\t]/g, '')
  
  // Handle project keys (sk-proj-...) which can be longer and have special formatting
  if (cleanKey.startsWith('sk-proj-')) {
    // Project keys need special handling - ensure no line breaks or special chars
    cleanKey = cleanKey.replace(/[\r\n]+/g, '').trim()
    
    // Additional validation for project keys
    if (!cleanKey.match(/^sk-proj-[A-Za-z0-9_-]+$/)) {
      console.warn('OpenAI project key may have invalid characters')
    }
  } else if (!cleanKey.startsWith('sk-')) {
    throw new Error('Invalid OpenAI API key format. API key should start with "sk-" or "sk-proj-"')
  }
  
  return cleanKey
}

// Custom fetch to handle OpenAI project keys properly
const customFetch = async (url: RequestInfo, options?: RequestInit): Promise<Response> => {
  // Ensure the Authorization header is properly formatted
  if (options?.headers) {
    const headers = new Headers(options.headers)
    const authHeader = headers.get('Authorization')
    
    if (authHeader) {
      // Clean the auth header to remove any problematic characters
      const cleanAuth = authHeader.replace(/[\s\n\r\t]/g, '')
      headers.set('Authorization', cleanAuth)
    }
    
    options.headers = headers
  }
  
  return fetch(url, options)
}

// Create a single OpenAI instance that can be reused with custom fetch
export const openaiClient = new OpenAI({
  apiKey: getCleanApiKey(),
  fetch: customFetch,
})

// Export the clean key for any other uses
export const cleanOpenAIKey = getCleanApiKey()
