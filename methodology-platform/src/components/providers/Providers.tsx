'use client'

import { ReactNode } from 'react'
import { ThemeProvider } from 'next-themes'
import { LanguageProvider } from '@/hooks/useLanguage'
import { CommandPalette } from '@/components/shared/CommandPalette'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <LanguageProvider>
        {children}
        <CommandPalette />
      </LanguageProvider>
    </ThemeProvider>
  )
}
