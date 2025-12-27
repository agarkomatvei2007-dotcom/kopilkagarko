'use client'

import Link from 'next/link'
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
    <header className="sticky top-0 z-50 w-full">
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="flex h-16 items-center gap-4 px-4 lg:px-6 max-w-screen-2xl mx-auto">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden rounded-xl hover:bg-emerald-50"
            onClick={toggleMobileMenu}
          >
            <Menu className="h-5 w-5 text-gray-600" />
          </Button>

          {/* Logo */}
          <Link href={isAuthenticated ? '/feed' : '/'} className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 transition-transform group-hover:scale-105">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <span className="hidden sm:inline-block font-bold text-gray-900 group-hover:text-emerald-600 transition-colors whitespace-nowrap">
              {t.landing.title}
            </span>
          </Link>

          {/* Search bar */}
          {isAuthenticated && (
            <div className="flex-1 max-w-lg ml-4">
              <div className="relative group">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                <Input
                  placeholder={t.common.search}
                  className="pl-10 h-10 bg-gray-50 border-0 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
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
                  <Button
                    size="sm"
                    className="hidden sm:flex gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Plus className="h-4 w-4" />
                    {t.common.create}
                  </Button>
                  <Button size="icon" variant="ghost" className="sm:hidden rounded-xl hover:bg-emerald-50">
                    <Plus className="h-5 w-5 text-gray-600" />
                  </Button>
                </Link>

                {/* Messages */}
                <Link href="/messages">
                  <Button variant="ghost" size="icon" className="rounded-xl hover:bg-emerald-50 transition-colors">
                    <MessageSquare className="h-5 w-5 text-gray-600" />
                  </Button>
                </Link>

                {/* Notifications */}
                <NotificationBell />

                {/* Language switcher */}
                <LanguageSwitcher />

                {/* User menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="ml-1 rounded-xl hover:bg-emerald-50">
                      <Avatar className="h-8 w-8 ring-2 ring-emerald-100">
                        <AvatarImage src={user?.avatar || undefined} />
                        <AvatarFallback className="text-xs bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-medium">
                          {user?.displayName ? getInitials(user.displayName) : 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 rounded-xl border-emerald-100 shadow-xl">
                    <DropdownMenuLabel className="font-normal py-3">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-semibold text-gray-900">{user?.displayName}</p>
                        <p className="text-xs text-emerald-600">@{user?.username}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer hover:bg-emerald-50 focus:bg-emerald-50">
                      <Link href={`/profile/${user?.username}`} className="py-2">
                        {t.nav.myProfile}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer hover:bg-emerald-50 focus:bg-emerald-50">
                      <Link href="/my-materials" className="py-2">
                        {t.nav.myMaterials}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer hover:bg-emerald-50 focus:bg-emerald-50">
                      <Link href="/analytics" className="py-2">
                        {t.nav.analytics}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer hover:bg-emerald-50 focus:bg-emerald-50">
                      <Link href="/achievements" className="py-2">
                        {t.nav.achievements}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer hover:bg-emerald-50 focus:bg-emerald-50">
                      <Link href="/settings" className="py-2">
                        {t.nav.settings}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
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
                  <Button variant="ghost" size="sm" className="rounded-xl hover:bg-emerald-50">{t.nav.login}</Button>
                </Link>
                <Link href="/register">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {t.nav.register}
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
