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
          'w-full justify-start gap-3 h-11 font-medium rounded-xl transition-all',
          isActive
            ? 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 hover:from-emerald-100 hover:to-teal-100'
            : 'text-gray-600 hover:text-emerald-700 hover:bg-emerald-50'
        )}
      >
        <div className={cn(
          'p-1.5 rounded-lg',
          isActive ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm' : 'bg-emerald-100 text-emerald-600'
        )}>
          <Icon className="h-4 w-4" strokeWidth={2} />
        </div>
        {label}
        {isActive && (
          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500" />
        )}
      </Button>
    </Link>
  )

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-gray-100 bg-white h-[calc(100vh-4rem)] sticky top-16">
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

        <div className="my-6 mx-4 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

        <nav className="space-y-1 px-3">
          <p className="px-3 text-[11px] font-semibold text-emerald-600 uppercase tracking-wider mb-3 flex items-center gap-2">
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

        <div className="my-6 mx-4 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

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
            <div className="my-6 mx-4 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
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
        <div className="border-t border-gray-100 p-4">
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold text-emerald-800">
                  {language === 'ru' ? 'Уровень' : 'Деңгей'} {user.level}
                </div>
                <div className="text-xs text-emerald-600">
                  {user.points} XP
                </div>
              </div>
            </div>
            <div className="relative">
              <Progress value={levelProgress} className="h-2 bg-emerald-100" />
            </div>
            <p className="text-xs text-emerald-600 mt-2 text-center">
              {100 - levelProgress}% {language === 'ru' ? 'до следующего уровня' : 'келесі деңгейге дейін'}
            </p>
          </div>
        </div>
      )}
    </aside>
  )
}
