'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-sm border-b border-neutral-100">
      <div className="flex h-14 items-center gap-4 px-4 max-w-screen-2xl mx-auto">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={toggleMobileMenu}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Logo */}
        <Link href={isAuthenticated ? '/feed' : '/'} className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          <span className="hidden sm:inline-block font-semibold text-sm">
            {t.landing.title}
          </span>
        </Link>

        {/* Search bar */}
        {isAuthenticated && (
          <div className="flex-1 max-w-md ml-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <Input
                placeholder={t.common.search}
                className="pl-9 h-9 bg-neutral-50 border-0 focus:bg-white focus:ring-1 focus:ring-neutral-200"
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
                <Button size="sm" className="hidden sm:flex gap-1.5">
                  <Plus className="h-4 w-4" />
                  {t.common.create}
                </Button>
                <Button size="icon" variant="ghost" className="sm:hidden">
                  <Plus className="h-5 w-5" />
                </Button>
              </Link>

              {/* Messages */}
              <Link href="/messages">
                <Button variant="ghost" size="icon">
                  <MessageSquare className="h-5 w-5 text-neutral-600" />
                </Button>
              </Link>

              {/* Notifications */}
              <NotificationBell />

              {/* Language switcher */}
              <LanguageSwitcher />

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="ml-1">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={user?.avatar || undefined} />
                      <AvatarFallback className="text-xs bg-neutral-100">
                        {user?.displayName ? getInitials(user.displayName) : 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user?.displayName}</p>
                      <p className="text-xs text-neutral-500">@{user?.username}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={`/profile/${user?.username}`}>
                      {t.nav.myProfile}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/my-materials">
                      {t.nav.myMaterials}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/analytics">
                      {t.nav.analytics}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/achievements">
                      {t.nav.achievements}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/settings">
                      {t.nav.settings}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600"
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
                <Button variant="ghost" size="sm">{t.nav.login}</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">{t.nav.register}</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
