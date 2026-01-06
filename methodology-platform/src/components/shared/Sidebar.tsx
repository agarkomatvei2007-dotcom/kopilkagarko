'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  FolderOpen,
  BookmarkIcon,
  Users,
  Trophy,
  BarChart3,
  Settings,
  HelpCircle,
  Shield,
  Bot,
  Sparkles,
  MessageSquare,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/hooks/useLanguage'
import { useUIStore } from '@/stores/uiStore'
import { calculateLevelProgress, cn } from '@/lib/utils'

export default function Sidebar() {
  const { user } = useAuth()
  const { t, language } = useLanguage()
  const { sidebarOpen } = useUIStore()
  const pathname = usePathname()

  const mainNavItems = [
    { href: '/feed', label: t.nav.feed, icon: Home },
    { href: '/ai-assistant', label: language === 'ru' ? 'ИИ-ассистент' : 'ЖИ-көмекші', icon: Bot },
    { href: '/my-materials', label: t.nav.myMaterials, icon: FolderOpen },
    { href: '/collections', label: t.nav.collections, icon: BookmarkIcon },
  ]

  const socialNavItems = [
    { href: '/communities', label: t.nav.communities, icon: Users },
    { href: '/messages', label: language === 'ru' ? 'Сообщения' : 'Хабарламалар', icon: MessageSquare },
    { href: '/leaderboard', label: language === 'ru' ? 'Рейтинг' : 'Рейтинг', icon: Trophy },
  ]

  const bottomNavItems = [
    { href: '/analytics', label: t.nav.analytics, icon: BarChart3 },
    { href: '/settings', label: t.nav.settings, icon: Settings },
    { href: '/help', label: t.nav.help, icon: HelpCircle },
  ]

  if (!sidebarOpen) return null

  const levelProgress = user ? calculateLevelProgress(user.points) : 0
  const isAdmin = user?.isAdmin === true

  const NavLink = ({ href, label, icon: Icon, isActive }: { href: string; label: string; icon: React.ElementType; isActive: boolean }) => (
    <Link href={href}>
      <Button
        variant="ghost"
        className={cn(
          'w-full justify-start gap-3 h-11 font-medium rounded-xl transition-all duration-200 group relative overflow-hidden',
          isActive
            ? 'bg-gradient-to-r from-primary/15 to-accent/10 text-primary hover:from-primary/20 hover:to-accent/15 shadow-sm'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
        )}
      >
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-gradient-to-b from-primary to-accent" />
        )}
        <div className={cn(
          'p-1.5 rounded-lg transition-all duration-200',
          isActive
            ? 'bg-gradient-to-br from-primary to-accent text-white shadow-md shadow-primary/25'
            : 'bg-muted group-hover:bg-primary/10 text-muted-foreground group-hover:text-primary'
        )}>
          <Icon className="h-4 w-4" strokeWidth={2} />
        </div>
        <span className={cn(
          'transition-colors duration-200',
          isActive ? 'font-semibold' : ''
        )}>
          {label}
        </span>
        {isActive && (
          <div className="ml-auto flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          </div>
        )}
      </Button>
    </Link>
  )

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-border/50 bg-background/80 backdrop-blur-xl h-[calc(100vh-4rem)] sticky top-16">
      <ScrollArea className="flex-1 py-6">
        <nav className="space-y-1 px-3">
          {mainNavItems.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              isActive={pathname.startsWith(item.href)}
            />
          ))}
        </nav>

        <div className="my-6 mx-4 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        <nav className="space-y-1 px-3">
          <p className="px-3 text-[11px] font-semibold text-primary uppercase tracking-wider mb-3 flex items-center gap-2">
            <Users className="h-3.5 w-3.5" />
            {language === 'ru' ? 'Сообщество' : 'Қауымдастық'}
          </p>
          {socialNavItems.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              isActive={pathname.startsWith(item.href)}
            />
          ))}
        </nav>

        <div className="my-6 mx-4 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        <nav className="space-y-1 px-3">
          {bottomNavItems.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              isActive={pathname.startsWith(item.href)}
            />
          ))}
        </nav>

        {/* Admin Panel Link */}
        {isAdmin && (
          <>
            <div className="my-6 mx-4 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            <nav className="space-y-1 px-3">
              <NavLink
                href="/admin"
                label={t.nav.adminPanel}
                icon={Shield}
                isActive={pathname.startsWith('/admin')}
              />
            </nav>
          </>
        )}
      </ScrollArea>

      {/* Level progress */}
      {user && (
        <div className="border-t border-border/50 p-4">
          <div className="relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5 border border-primary/10">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-accent/20 to-transparent rounded-full blur-xl" />

            <div className="relative flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-foreground flex items-center gap-2">
                  {language === 'ru' ? 'Уровень' : 'Деңгей'}
                  <span className="text-lg gradient-text">{user.level}</span>
                </div>
                <div className="text-xs font-medium text-primary">
                  {user.points.toLocaleString()} XP
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="h-2.5 bg-muted/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${levelProgress}%` }}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3 text-center font-medium">
              <span className="text-primary">{Math.round(100 - levelProgress)}%</span> {language === 'ru' ? 'до следующего уровня' : 'келесі деңгейге дейін'}
            </p>
          </div>
        </div>
      )}
    </aside>
  )
}
