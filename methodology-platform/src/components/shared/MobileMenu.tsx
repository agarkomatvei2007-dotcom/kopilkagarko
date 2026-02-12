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
  X,
  MessageSquare,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/hooks/useLanguage'
import { useUIStore } from '@/stores/uiStore'
import { getInitials, cn } from '@/lib/utils'

export default function MobileMenu() {
  const { user } = useAuth()
  const { t, language } = useLanguage()
  const { mobileMenuOpen, setMobileMenuOpen } = useUIStore()
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

  const isAdmin = user?.isAdmin === true

  const handleLinkClick = () => {
    setMobileMenuOpen(false)
  }

  const NavLink = ({ href, label, icon: Icon, isActive }: { href: string; label: string; icon: React.ElementType; isActive: boolean }) => (
    <Link href={href} onClick={handleLinkClick}>
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
          'p-1.5 rounded-lg',
          isActive ? 'bg-emerald-600 text-white' : 'bg-muted text-muted-foreground'
        )}>
          <Icon className="h-4 w-4" strokeWidth={2} />
        </div>
        {label}
      </Button>
    </Link>
  )

  if (!mobileMenuOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 lg:hidden"
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Menu */}
      <div className="fixed inset-y-0 left-0 w-72 bg-background border-r border-border z-50 lg:hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.avatar || undefined} />
              <AvatarFallback className="bg-emerald-600 text-white font-semibold">
                {user?.displayName ? getInitials(user.displayName) : 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">{user?.displayName}</p>
              <p className="text-xs text-muted-foreground">@{user?.username}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-4">
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

          <div className="my-4 mx-4 h-px bg-border" />

          <nav className="space-y-1 px-3">
            <p className="px-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
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

          <div className="my-4 mx-4 h-px bg-border" />

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

          {isAdmin && (
            <>
              <div className="my-4 mx-4 h-px bg-border" />
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

        {/* Profile link */}
        <div className="border-t border-border p-4">
          <Link href={`/profile/${user?.username}`} onClick={handleLinkClick}>
            <Button variant="outline" className="w-full rounded-lg">
              {language === 'ru' ? 'Мой профиль' : 'Менің профилім'}
            </Button>
          </Link>
        </div>
      </div>
    </>
  )
}
