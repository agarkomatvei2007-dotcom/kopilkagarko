'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { translations, Language, TranslationKeys } from '@/lib/i18n/translations'

type LanguageContextType = {
  language: Language
  setLanguage: (lang: Language) => void
  t: TranslationKeys
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const LANGUAGE_STORAGE_KEY = 'kopilka-language'

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ru')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Load saved language from localStorage
    const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language | null
    if (savedLanguage && (savedLanguage === 'ru' || savedLanguage === 'kk')) {
      setLanguageState(savedLanguage)
    }
    setMounted(true)
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang)
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <LanguageContext.Provider value={{ language: 'ru', setLanguage, t: translations.ru }}>
        {children}
      </LanguageContext.Provider>
    )
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

// Helper component for language names
export const languageNames: Record<Language, { native: string; flag: string }> = {
  ru: { native: 'Русский', flag: '🇷🇺' },
  kk: { native: 'Қазақша', flag: '🇰🇿' },
}
