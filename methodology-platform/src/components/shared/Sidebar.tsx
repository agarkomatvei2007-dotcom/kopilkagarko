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
          'w-full justify-start gap-3 h-11 font-medium rounded-lg transition-colors',
          isActive
            ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
        )}
      >
        <div className={cn(
          'p-1.5 rounded-lg transition-colors',
          isActive
            ? 'bg-emerald-600 text-white'
            : 'bg-muted text-muted-foreground'
        )}>
          <Icon className="h-4 w-4" strokeWidth={2} />
        </div>
        <span>{label}</span>
        {isActive && (
          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-600" />
        )}
      </Button>
    </Link>
  )

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-background h-[calc(100vh-4rem)] sticky top-16">
      <ScrollArea className="flex-1 py-5">
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

        <div className="my-5 mx-4 h-px bg-border" />

        <nav className="space-y-1 px-3">
          <p className="px-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
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

        <div className="my-5 mx-4 h-px bg-border" />

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
            <div className="my-5 mx-4 h-px bg-border" />
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
        <div className="border-t border-border p-4">
          <div className="surface rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-emerald-600 text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">
                  {language === 'ru' ? 'Уровень' : 'Деңгей'} {user.level}
                </div>
                <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  {user.points} XP
                </div>
              </div>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                style={{ width: `${levelProgress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              {100 - levelProgress}% {language === 'ru' ? 'до следующего уровня' : 'келесі деңгейге дейін'}
            </p>
          </div>
        </div>
      )}
    </aside>
  )
}
