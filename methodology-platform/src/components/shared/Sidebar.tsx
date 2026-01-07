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
          'w-full justify-start gap-3 h-12 font-medium rounded-2xl transition-all duration-300 group relative overflow-hidden',
          isActive
            ? 'glass-strong text-primary glow-accent'
            : 'hover:glass hover:scale-[1.02] text-muted-foreground hover:text-primary'
        )}
      >
        {isActive && (
          <div className="absolute inset-0 gradient-primary opacity-10" />
        )}
        <div className={cn(
          'p-2 rounded-xl transition-all duration-300 relative z-10',
          isActive
            ? 'gradient-primary text-white shadow-lg glow'
            : 'bg-primary/10 text-primary group-hover:bg-primary/20 group-hover:scale-110'
        )}>
          <Icon className="h-4 w-4" strokeWidth={2} />
        </div>
        <span className="relative z-10">{label}</span>
        {isActive && (
          <div className="ml-auto w-2 h-2 rounded-full gradient-primary animate-pulse-glow relative z-10" />
        )}
      </Button>
    </Link>
  )

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-white/20 dark:border-white/10 glass h-[calc(100vh-4rem)] sticky top-16">
      <ScrollArea className="flex-1 py-6">
        <nav className="space-y-1.5 px-3">
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

        <div className="my-6 mx-4 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

        <nav className="space-y-1.5 px-3">
          <p className="px-3 text-[11px] font-bold gradient-text uppercase tracking-wider mb-3 flex items-center gap-2">
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

        <div className="my-6 mx-4 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

        <nav className="space-y-1.5 px-3">
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
        <div className="border-t border-white/20 dark:border-white/10 p-4">
          <div className="glass-strong rounded-2xl p-4 border border-white/20 dark:border-white/10 card-lift relative overflow-hidden">
            {/* Decorative background */}
            <div className="absolute inset-0 gradient-mesh opacity-30" />

            <div className="flex items-center gap-3 mb-3 relative z-10">
              <div className="p-2.5 rounded-xl gradient-primary shadow-lg glow animate-pulse-glow">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="text-sm font-bold text-foreground">
                  {language === 'ru' ? 'Уровень' : 'Деңгей'} {user.level}
                </div>
                <div className="text-xs gradient-text font-semibold">
                  {user.points} XP
                </div>
              </div>
            </div>
            <div className="relative z-10">
              <div className="h-2.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full gradient-primary rounded-full transition-all duration-500 glow"
                  style={{ width: `${levelProgress}%` }}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center relative z-10">
              {100 - levelProgress}% {language === 'ru' ? 'до следующего уровня' : 'келесі деңгейге дейін'}
            </p>
          </div>
        </div>
      )}
    </aside>
  )
}
