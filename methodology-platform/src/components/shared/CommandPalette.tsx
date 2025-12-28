'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  Home,
  FolderOpen,
  BookmarkIcon,
  Users,
  Trophy,
  BarChart3,
  Settings,
  HelpCircle,
  GraduationCap,
  Bot,
  Plus,
  FileText,
  User,
} from 'lucide-react'

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { useLanguage } from '@/hooks/useLanguage'
import { useAuth } from '@/hooks/useAuth'

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { language } = useLanguage()
  const { isAuthenticated } = useAuth()

  const text = {
    ru: {
      searchPlaceholder: 'Поиск по платформе...',
      noResults: 'Ничего не найдено.',
      navigation: 'Навигация',
      actions: 'Действия',
      feed: 'Лента',
      myMaterials: 'Мои материалы',
      collections: 'Коллекции',
      courses: 'Курсы',
      communities: 'Сообщества',
      leaderboard: 'Рейтинг',
      analytics: 'Аналитика',
      settings: 'Настройки',
      help: 'Помощь',
      aiAssistant: 'ИИ-ассистент',
      createMaterial: 'Создать материал',
      createCourse: 'Создать курс',
      myProfile: 'Мой профиль',
    },
    kk: {
      searchPlaceholder: 'Платформа бойынша іздеу...',
      noResults: 'Ештеңе табылмады.',
      navigation: 'Навигация',
      actions: 'Әрекеттер',
      feed: 'Лента',
      myMaterials: 'Менің материалдарым',
      collections: 'Жинақтар',
      courses: 'Курстар',
      communities: 'Қауымдастықтар',
      leaderboard: 'Рейтинг',
      analytics: 'Аналитика',
      settings: 'Баптаулар',
      help: 'Көмек',
      aiAssistant: 'ЖИ-көмекші',
      createMaterial: 'Материал жасау',
      createCourse: 'Курс жасау',
      myProfile: 'Менің профилім',
    },
  }

  const t = text[language]

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const runCommand = useCallback((command: () => void) => {
    setOpen(false)
    command()
  }, [])

  const navigationItems = [
    { icon: Home, label: t.feed, href: '/feed' },
    { icon: FolderOpen, label: t.myMaterials, href: '/my-materials' },
    { icon: BookmarkIcon, label: t.collections, href: '/collections' },
    { icon: GraduationCap, label: t.courses, href: '/courses' },
    { icon: Users, label: t.communities, href: '/communities' },
    { icon: Trophy, label: t.leaderboard, href: '/leaderboard' },
    { icon: BarChart3, label: t.analytics, href: '/analytics' },
    { icon: Bot, label: t.aiAssistant, href: '/ai-assistant' },
    { icon: Settings, label: t.settings, href: '/settings' },
    { icon: HelpCircle, label: t.help, href: '/help' },
  ]

  const actionItems = [
    { icon: Plus, label: t.createMaterial, href: '/materials/create' },
    { icon: Plus, label: t.createCourse, href: '/courses/create' },
    { icon: User, label: t.myProfile, href: '/profile/me' },
  ]

  if (!isAuthenticated) return null

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder={t.searchPlaceholder} />
      <CommandList>
        <CommandEmpty>{t.noResults}</CommandEmpty>

        <CommandGroup heading={t.navigation}>
          {navigationItems.map((item) => (
            <CommandItem
              key={item.href}
              onSelect={() => runCommand(() => router.push(item.href))}
            >
              <item.icon className="mr-2 h-4 w-4" />
              <span>{item.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading={t.actions}>
          {actionItems.map((item) => (
            <CommandItem
              key={item.href}
              onSelect={() => runCommand(() => router.push(item.href))}
            >
              <item.icon className="mr-2 h-4 w-4" />
              <span>{item.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
