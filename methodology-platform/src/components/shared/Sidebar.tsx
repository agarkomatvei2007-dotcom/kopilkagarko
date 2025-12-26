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
    { href: '/ai-assistant', label: language === 'ru' ? 'ИИ-ассистент' : 'ЖИ-көмекші', icon: Bot },
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

  const NavLink = ({ href, label, icon: Icon, isActive }: { href: string; label: string; icon: React.ElementType; isActive: boolean }) => (
    <Link href={href}>
      <Button
        variant="ghost"
        className={cn(
          'w-full justify-start gap-3 h-9 font-normal',
          isActive ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-600 hover:text-neutral-900'
        )}
      >
        <Icon className="h-4 w-4" strokeWidth={1.5} />
        {label}
      </Button>
    </Link>
  )

  return (
    <aside className="hidden lg:flex flex-col w-56 border-r border-neutral-100 bg-white h-[calc(100vh-3.5rem)] sticky top-14">
      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-0.5 px-2">
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

        <div className="my-4 mx-3 h-px bg-neutral-100" />

        <nav className="space-y-0.5 px-2">
          <p className="px-3 text-[10px] font-medium text-neutral-400 uppercase tracking-wider mb-2">
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

        <div className="my-4 mx-3 h-px bg-neutral-100" />

        <nav className="space-y-0.5 px-2">
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
            <div className="my-4 mx-3 h-px bg-neutral-100" />
            <nav className="space-y-0.5 px-2">
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
        <div className="border-t border-neutral-100 p-4">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-neutral-600">
              {language === 'ru' ? 'Уровень' : 'Деңгей'} {user.level}
            </span>
            <span className="text-neutral-400">
              {user.points} XP
            </span>
          </div>
          <Progress value={levelProgress} className="h-1" />
        </div>
      )}
    </aside>
  )
}
