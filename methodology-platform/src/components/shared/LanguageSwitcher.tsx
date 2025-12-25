'use client'

import { Languages } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useLanguage, languageNames } from '@/hooks/useLanguage'
import { Language } from '@/lib/i18n/translations'

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  const languages: Language[] = ['ru', 'kk']

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <span className="text-lg">{languageNames[language].flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang}
            onClick={() => setLanguage(lang)}
            className={language === lang ? 'bg-accent' : ''}
          >
            <span className="mr-2 text-lg">{languageNames[lang].flag}</span>
            {languageNames[lang].native}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
