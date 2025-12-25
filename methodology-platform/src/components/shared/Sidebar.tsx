'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Compass,
  FolderOpen,
  BookmarkIcon,
  Users,
  Trophy,
  BarChart3,
  Settings,
  HelpCircle,
  GraduationCap,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAuth } from '@/hooks/useAuth'
import { useUIStore } from '@/stores/uiStore'
import { calculateLevelProgress, cn } from '@/lib/utils'

const mainNavItems = [
  { href: '/feed', label: 'Лента', icon: Home },
  { href: '/explore', label: 'Обзор', icon: Compass },
  { href: '/my-materials', label: 'Мои материалы', icon: FolderOpen },
  { href: '/collections', label: 'Коллекции', icon: BookmarkIcon },
  { href: '/courses', label: 'Курсы', icon: GraduationCap },
]

const socialNavItems = [
  { href: '/communities', label: 'Сообщества', icon: Users },
  { href: '/leaderboard', label: 'Рейтинг', icon: Trophy },
]

const bottomNavItems = [
  { href: '/analytics', label: 'Аналитика', icon: BarChart3 },
  { href: '/settings', label: 'Настройки', icon: Settings },
  { href: '/help', label: 'Помощь', icon: HelpCircle },
]

export default function Sidebar() {
  const { user } = useAuth()
  const { sidebarOpen } = useUIStore()
  const pathname = usePathname()

  if (!sidebarOpen) return null

  const levelProgress = user ? calculateLevelProgress(user.points) : 0

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r bg-background h-[calc(100vh-4rem)] sticky top-16">
      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-1 px-3">
          {mainNavItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname.startsWith(item.href)
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start gap-3',
                    isActive && 'font-semibold'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            )
          })}
        </nav>

        <Separator className="my-4" />

        <nav className="space-y-1 px-3">
          <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Социальное
          </p>
          {socialNavItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname.startsWith(item.href)
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start gap-3',
                    isActive && 'font-semibold'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            )
          })}
        </nav>

        <Separator className="my-4" />

        <nav className="space-y-1 px-3">
          {bottomNavItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname.startsWith(item.href)
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start gap-3',
                    isActive && 'font-semibold'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      {/* Level progress */}
      {user && (
        <div className="border-t p-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-medium">Уровень {user.level}</span>
            <span className="text-muted-foreground">{user.points} очков</span>
          </div>
          <Progress value={levelProgress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {100 - levelProgress} очков до следующего уровня
          </p>
        </div>
      )}
    </aside>
  )
}
