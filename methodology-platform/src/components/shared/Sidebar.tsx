'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
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
  Zap,
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

  const NavLink = ({ href, label, icon: Icon, isActive, index }: { href: string; label: string; icon: React.ElementType; isActive: boolean; index: number }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link href={href}>
        <motion.div whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}>
          <Button
            variant="ghost"
            className={cn(
              'w-full justify-start gap-3 h-11 font-medium rounded-xl transition-all',
              isActive
                ? 'bg-neutral-100 text-neutral-900'
                : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
            )}
          >
            <div className={cn(
              'p-1.5 rounded-lg transition-colors',
              isActive ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-500'
            )}>
              <Icon className="h-4 w-4" strokeWidth={2} />
            </div>
            {label}
            {isActive && (
              <motion.div
                className="ml-auto w-1.5 h-1.5 rounded-full bg-neutral-900"
                layoutId="activeIndicator"
              />
            )}
          </Button>
        </motion.div>
      </Link>
    </motion.div>
  )

  return (
    <motion.aside
      className="hidden lg:flex flex-col w-64 border-r border-neutral-100 bg-white h-[calc(100vh-4rem)] sticky top-16"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <ScrollArea className="flex-1 py-6">
        <nav className="space-y-1 px-3">
          {mainNavItems.map((item, i) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              isActive={pathname.startsWith(item.href)}
              index={i}
            />
          ))}
        </nav>

        <div className="my-6 mx-4 h-px bg-neutral-100" />

        <nav className="space-y-1 px-3">
          <p className="px-3 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Users className="h-3.5 w-3.5" />
            {language === 'ru' ? 'Сообщество' : 'Қауымдастық'}
          </p>
          {socialNavItems.map((item, i) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              isActive={pathname.startsWith(item.href)}
              index={i + mainNavItems.length}
            />
          ))}
        </nav>

        <div className="my-6 mx-4 h-px bg-neutral-100" />

        <nav className="space-y-1 px-3">
          {bottomNavItems.map((item, i) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              isActive={pathname.startsWith(item.href)}
              index={i + mainNavItems.length + socialNavItems.length}
            />
          ))}
        </nav>

        {/* Admin Panel Link */}
        {isAdmin && (
          <>
            <div className="my-6 mx-4 h-px bg-neutral-100" />
            <nav className="space-y-1 px-3">
              <NavLink
                href="/admin"
                label={t.nav.adminPanel}
                icon={Shield}
                isActive={pathname.startsWith('/admin')}
                index={0}
              />
            </nav>
          </>
        )}
      </ScrollArea>

      {/* Level progress */}
      {user && (
        <motion.div
          className="border-t border-neutral-100 p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-neutral-900">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold text-neutral-900">
                  {language === 'ru' ? 'Уровень' : 'Деңгей'} {user.level}
                </div>
                <div className="text-xs text-neutral-500">
                  {user.points} XP
                </div>
              </div>
            </div>
            <Progress value={levelProgress} className="h-2 bg-neutral-200" />
            <p className="text-xs text-neutral-400 mt-2 text-center">
              {100 - levelProgress}% {language === 'ru' ? 'до следующего уровня' : 'келесі деңгейге дейін'}
            </p>
          </div>
        </motion.div>
      )}
    </motion.aside>
  )
}
