import OpenAI from 'openai'

// Centralized OpenAI configuration with proper key cleaning for project keys
function getCleanApiKey(): string {
  const apiKey = process.env.OPENAI_API_KEY
  
  if (!apiKey) {
    throw new Error('OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable.')
  }
  
  // Aggressive cleaning - remove ALL non-alphanumeric characters except hyphens and underscores
  let cleanKey = apiKey
    .replace(/[\s\n\r\t]/g, '') // Remove whitespace
    .replace(/[\r\n]/g, '')     // Remove line breaks
    .replace(/[^A-Za-z0-9_-]/g, '') // Remove any other special chars except allowed ones
    .trim()
  
  // Handle project keys (sk-proj-...) which can be longer and have special formatting
  if (cleanKey.startsWith('sk-proj-')) {
    // Additional cleaning for project keys
    cleanKey = cleanKey.replace(/[^A-Za-z0-9_-]/g, '')
    
    // Basic validation
    if (cleanKey.length < 20) {
      throw new Error('OpenAI project key appears to be too short after cleaning')
    }
  } else if (!cleanKey.startsWith('sk-')) {
    throw new Error('Invalid OpenAI API key format. API key should start with "sk-" or "sk-proj-"')
  }
  
  return cleanKey
}

// Custom fetch to handle OpenAI project keys properly
const customFetch = async (url: RequestInfo, options?: RequestInit): Promise<Response> => {
  // Create a clean options object
  const cleanOptions: RequestInit = {
    ...options,
    headers: {}
  }
  
  // Copy all headers except Authorization
  if (options?.headers) {
    const originalHeaders = options.headers as Record<string, string>
    Object.keys(originalHeaders).forEach(key => {
      if (key.toLowerCase() !== 'authorization') {
        cleanOptions.headers![key] = originalHeaders[key]
      }
    })
  }
  
  // Build a completely clean Authorization header
  const cleanKey = getCleanApiKey()
  cleanOptions.headers!['Authorization'] = `Bearer ${cleanKey}`
  
  // Ensure Content-Type is set if there's a body
  if (options?.body && !cleanOptions.headers!['Content-Type']) {
    cleanOptions.headers!['Content-Type'] = 'application/json'
  }
  
  return fetch(url, cleanOptions)
}

// Create a single OpenAI instance that can be reused with custom fetch
export const openaiClient = new OpenAI({
  apiKey: getCleanApiKey(),
  fetch: customFetch,
})

// Export the clean key for any other uses
export const cleanOpenAIKey = getCleanApiKey()
