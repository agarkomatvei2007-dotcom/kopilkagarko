'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Search,
  Menu,
  Plus,
  MessageSquare,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/hooks/useLanguage'
import { useUIStore } from '@/stores/uiStore'
import { getInitials } from '@/lib/utils'
import NotificationBell from './NotificationBell'
import LanguageSwitcher from './LanguageSwitcher'

export default function Navbar() {
  const { user, signOut, isAuthenticated } = useAuth()
  const { t } = useLanguage()
  const { toggleMobileMenu } = useUIStore()

  return (
    <motion.header
      className="sticky top-0 z-50 w-full"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-white/90 backdrop-blur-xl border-b border-neutral-100">
        <div className="flex h-16 items-center gap-4 px-4 lg:px-6 max-w-screen-2xl mx-auto">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden rounded-xl hover:bg-neutral-100"
            onClick={toggleMobileMenu}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Logo */}
          <Link href={isAuthenticated ? '/feed' : '/'} className="flex items-center gap-2.5 group">
            <motion.div
              className="w-9 h-9 rounded-xl bg-neutral-900 flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <BookOpen className="h-5 w-5 text-white" />
            </motion.div>
            <span className="hidden sm:inline-block font-semibold text-neutral-900 group-hover:text-neutral-600 transition-colors">
              {t.landing.title}
            </span>
          </Link>

          {/* Search bar */}
          {isAuthenticated && (
            <div className="flex-1 max-w-lg ml-4">
              <div className="relative group">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 group-focus-within:text-neutral-900 transition-colors" />
                <Input
                  placeholder={t.common.search}
                  className="pl-10 h-10 bg-neutral-50 border-0 rounded-xl focus:bg-white focus:ring-2 focus:ring-neutral-200 transition-all"
                />
              </div>
            </div>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Actions */}
          <div className="flex items-center gap-1">
            {isAuthenticated ? (
              <>
                {/* Create button */}
                <Link href="/materials/create">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      size="sm"
                      className="hidden sm:flex gap-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-full px-4"
                    >
                      <Plus className="h-4 w-4" />
                      {t.common.create}
                    </Button>
                  </motion.div>
                  <Button size="icon" variant="ghost" className="sm:hidden rounded-xl hover:bg-neutral-100">
                    <Plus className="h-5 w-5" />
                  </Button>
                </Link>

                {/* Messages */}
                <Link href="/messages">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="ghost" size="icon" className="rounded-xl hover:bg-neutral-100">
                      <MessageSquare className="h-5 w-5 text-neutral-600" />
                    </Button>
                  </motion.div>
                </Link>

                {/* Notifications */}
                <NotificationBell />

                {/* Language switcher */}
                <LanguageSwitcher />

                {/* User menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button variant="ghost" size="icon" className="ml-1 rounded-xl">
                        <Avatar className="h-8 w-8 ring-2 ring-neutral-100">
                          <AvatarImage src={user?.avatar || undefined} />
                          <AvatarFallback className="text-xs bg-neutral-900 text-white font-medium">
                            {user?.displayName ? getInitials(user.displayName) : 'U'}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </motion.div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 rounded-xl border-neutral-200 shadow-xl">
                    <DropdownMenuLabel className="font-normal py-3">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-semibold text-neutral-900">{user?.displayName}</p>
                        <p className="text-xs text-neutral-500">@{user?.username}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-neutral-100" />
                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                      <Link href={`/profile/${user?.username}`} className="py-2">
                        {t.nav.myProfile}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                      <Link href="/my-materials" className="py-2">
                        {t.nav.myMaterials}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                      <Link href="/analytics" className="py-2">
                        {t.nav.analytics}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                      <Link href="/achievements" className="py-2">
                        {t.nav.achievements}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-neutral-100" />
                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                      <Link href="/settings" className="py-2">
                        {t.nav.settings}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-neutral-100" />
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-600 focus:bg-red-50 rounded-lg cursor-pointer py-2"
                      onClick={signOut}
                    >
                      {t.nav.logout}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <LanguageSwitcher />
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="rounded-full text-neutral-600 hover:text-neutral-900">{t.nav.login}</Button>
                </Link>
                <Link href="/register">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      size="sm"
                      className="bg-neutral-900 hover:bg-neutral-800 text-white rounded-full px-5"
                    >
                      {t.nav.register}
                    </Button>
                  </motion.div>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  )
}
