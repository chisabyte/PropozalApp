/**
 * Multi-Language Proposal Generation
 * Feature 12: Multi-Language Support
 */

export type SupportedLanguage = 'en' | 'es' | 'pt' | 'ar' | 'id' | 'hi'

export const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  en: 'English',
  es: 'Spanish',
  pt: 'Portuguese',
  ar: 'Arabic',
  id: 'Indonesian',
  hi: 'Hindi'
}

export function getLanguageInstruction(language: SupportedLanguage): string {
  const instructions: Record<SupportedLanguage, string> = {
    en: 'Write in English. Use professional, clear language.',
    es: 'Escribe en español. Usa un lenguaje profesional y claro. Mantén el tono apropiado para propuestas de negocio.',
    pt: 'Escreva em português. Use linguagem profissional e clara. Mantenha o tom apropriado para propostas de negócios.',
    ar: 'اكتب بالعربية. استخدم لغة احترافية وواضحة. حافظ على النبرة المناسبة لعروض العمل.',
    id: 'Tulis dalam bahasa Indonesia. Gunakan bahasa profesional dan jelas. Pertahankan nada yang sesuai untuk proposal bisnis.',
    hi: 'हिंदी में लिखें। पेशेवर और स्पष्ट भाषा का उपयोग करें। व्यावसायिक प्रस्तावों के लिए उपयुक्त स्वर बनाए रखें।'
  }

  return instructions[language] || instructions.en
}

export function addLanguageContextToPrompt(
  basePrompt: string,
  language: SupportedLanguage
): string {
  if (language === 'en') return basePrompt

  const instruction = getLanguageInstruction(language)
  return `${basePrompt}

## LANGUAGE REQUIREMENT
${instruction}

IMPORTANT: Generate the ENTIRE proposal in ${LANGUAGE_NAMES[language]}. All content, headings, and text must be in ${LANGUAGE_NAMES[language]}, not English.`
}

