'use client'

import { ReactNode } from 'react'
import { LanguageProvider } from '@/hooks/useLanguage'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      {children}
    </LanguageProvider>
  )
}
