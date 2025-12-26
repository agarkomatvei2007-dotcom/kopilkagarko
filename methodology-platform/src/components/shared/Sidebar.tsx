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
  Shield,
  Bot,
  Sparkles,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/hooks/useLanguage'
import { useUIStore } from '@/stores/uiStore'
import { calculateLevelProgress, cn } from '@/lib/utils'

// Admin emails list
const ADMIN_EMAILS = ['admin@kopilka.ru', 'agarkomatvei2007@gmail.com']

export default function Sidebar() {
  const { user, firebaseUser } = useAuth()
  const { t, language } = useLanguage()
  const { sidebarOpen } = useUIStore()
  const pathname = usePathname()

  const mainNavItems = [
    { href: '/feed', label: t.nav.feed, icon: Home },
    { href: '/explore', label: t.nav.explore, icon: Compass },
    { href: '/ai-assistant', label: language === 'ru' ? 'ИИ-ассистент' : 'ЖИ-көмекші', icon: Bot, highlight: true },
    { href: '/my-materials', label: t.nav.myMaterials, icon: FolderOpen },
    { href: '/collections', label: t.nav.collections, icon: BookmarkIcon },
    { href: '/courses', label: t.nav.courses, icon: GraduationCap },
  ]

  const socialNavItems = [
    { href: '/communities', label: t.nav.communities, icon: Users },
    { href: '/leaderboard', label: language === 'ru' ? 'Рейтинг' : 'Рейтинг', icon: Trophy },
  ]

  const bottomNavItems = [
    { href: '/analytics', label: t.nav.analytics, icon: BarChart3 },
    { href: '/settings', label: t.nav.settings, icon: Settings },
    { href: '/help', label: t.nav.help, icon: HelpCircle },
  ]

  if (!sidebarOpen) return null

  const levelProgress = user ? calculateLevelProgress(user.points) : 0
  const isAdmin = firebaseUser?.email && ADMIN_EMAILS.includes(firebaseUser.email)

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r bg-gradient-to-b from-background to-muted/20 h-[calc(100vh-4rem)] sticky top-16">
      <ScrollArea className="flex-1 py-6">
        <nav className="space-y-1 px-3">
          {mainNavItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname.startsWith(item.href)
            const isHighlight = 'highlight' in item && item.highlight

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start gap-3 h-11 rounded-xl transition-all',
                    isActive && 'bg-primary/10 text-primary font-semibold shadow-sm',
                    isHighlight && !isActive && 'text-primary hover:bg-primary/5'
                  )}
                >
                  <div className={cn(
                    "h-8 w-8 rounded-lg flex items-center justify-center transition-all",
                    isActive ? "bg-primary text-white shadow-md" : "bg-muted",
                    isHighlight && !isActive && "bg-primary/10"
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="flex-1 text-left">{item.label}</span>
                  {isHighlight && (
                    <Sparkles className="h-3 w-3 text-amber-500" />
                  )}
                </Button>
              </Link>
            )
          })}
        </nav>

        <div className="my-6 mx-4 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        <nav className="space-y-1 px-3">
          <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            {language === 'ru' ? 'Сообщество' : 'Қауымдастық'}
          </p>
          {socialNavItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname.startsWith(item.href)
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start gap-3 h-11 rounded-xl transition-all',
                    isActive && 'bg-primary/10 text-primary font-semibold shadow-sm'
                  )}
                >
                  <div className={cn(
                    "h-8 w-8 rounded-lg flex items-center justify-center transition-all",
                    isActive ? "bg-primary text-white shadow-md" : "bg-muted"
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  {item.label}
                </Button>
              </Link>
            )
          })}
        </nav>

        <div className="my-6 mx-4 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        <nav className="space-y-1 px-3">
          {bottomNavItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname.startsWith(item.href)
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start gap-3 h-11 rounded-xl transition-all',
                    isActive && 'bg-primary/10 text-primary font-semibold shadow-sm'
                  )}
                >
                  <div className={cn(
                    "h-8 w-8 rounded-lg flex items-center justify-center transition-all",
                    isActive ? "bg-primary text-white shadow-md" : "bg-muted"
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  {item.label}
                </Button>
              </Link>
            )
          })}
        </nav>

        {/* Admin Panel Link */}
        {isAdmin && (
          <>
            <div className="my-6 mx-4 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            <nav className="space-y-1 px-3">
              <Link href="/admin">
                <Button
                  variant={pathname.startsWith('/admin') ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start gap-3 h-11 rounded-xl transition-all',
                    pathname.startsWith('/admin')
                      ? 'bg-primary/10 text-primary font-semibold shadow-sm'
                      : 'text-primary hover:bg-primary/5'
                  )}
                >
                  <div className={cn(
                    "h-8 w-8 rounded-lg flex items-center justify-center transition-all",
                    pathname.startsWith('/admin')
                      ? "bg-primary text-white shadow-md"
                      : "bg-primary/10"
                  )}>
                    <Shield className="h-4 w-4" />
                  </div>
                  {t.nav.adminPanel}
                </Button>
              </Link>
            </nav>
          </>
        )}
      </ScrollArea>

      {/* Level progress */}
      {user && (
        <div className="border-t p-4 bg-gradient-to-r from-primary/5 to-purple-500/5">
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center justify-between text-sm mb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
                  {user.level}
                </div>
                <span className="font-semibold">
                  {language === 'ru' ? 'Уровень' : 'Деңгей'}
                </span>
              </div>
              <span className="text-muted-foreground font-medium">
                {user.points} {language === 'ru' ? 'XP' : 'XP'}
              </span>
            </div>
            <Progress value={levelProgress} className="h-2 bg-muted" />
            <p className="text-xs text-muted-foreground mt-2 text-center">
              {100 - levelProgress}% {language === 'ru' ? 'до следующего уровня' : 'келесі деңгейге дейін'}
            </p>
          </div>
        </div>
      )}
    </aside>
  )
}
