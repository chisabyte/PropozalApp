import OpenAI from 'openai'

// Centralized OpenAI configuration with proper key cleaning
function getCleanApiKey(): string {
  const apiKey = process.env.OPENAI_API_KEY
  
  if (!apiKey) {
    throw new Error('OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable.')
  }
  
  // Remove all whitespace, newlines, and potential hidden characters
  const cleanKey = apiKey.replace(/[\s\n\r\t]/g, '')
  
  if (!cleanKey.startsWith('sk-')) {
    throw new Error('Invalid OpenAI API key format. API key should start with "sk-"')
  }
  
  return cleanKey
}

// Create a single OpenAI instance that can be reused
export const openaiClient = new OpenAI({
  apiKey: getCleanApiKey(),
})

// Export the clean key for any other uses
export const cleanOpenAIKey = getCleanApiKey()
