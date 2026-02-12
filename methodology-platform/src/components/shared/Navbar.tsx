'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
import { ThemeToggle } from './ThemeToggle'

export default function Navbar() {
  const { user, signOut, isAuthenticated } = useAuth()
  const { t } = useLanguage()
  const { toggleMobileMenu } = useUIStore()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      router.push(`/feed?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="flex h-16 items-center gap-4 px-4 lg:px-6 max-w-screen-2xl mx-auto">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden rounded-lg hover:bg-muted transition-colors"
          onClick={toggleMobileMenu}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Logo */}
        <Link href={isAuthenticated ? '/feed' : '/'} className="flex items-center gap-2.5 group flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center transition-transform group-hover:scale-105">
            <BookOpen className="h-4 w-4 text-white" />
          </div>
          <span className="hidden sm:inline-block font-bold text-foreground text-base">
            {t.landing.title}
          </span>
        </Link>

        {/* Search bar */}
        {isAuthenticated && (
          <div className="flex-1 max-w-lg ml-4">
            <div className="relative group">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
              <Input
                placeholder={t.common.search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                className="pl-10 h-10 rounded-lg border-border focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
              />
            </div>
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          {isAuthenticated ? (
            <>
              {/* Create button */}
              <Link href="/materials/create">
                <Button
                  size="sm"
                  className="hidden sm:flex gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium"
                >
                  <Plus className="h-4 w-4" />
                  {t.common.create}
                </Button>
                <Button size="icon" variant="ghost" className="sm:hidden rounded-lg hover:bg-muted transition-colors">
                  <Plus className="h-5 w-5" />
                </Button>
              </Link>

              {/* Messages */}
              <Link href="/messages">
                <Button variant="ghost" size="icon" className="rounded-lg hover:bg-muted transition-colors">
                  <MessageSquare className="h-5 w-5" />
                </Button>
              </Link>

              {/* Notifications */}
              <NotificationBell />

              {/* Language switcher */}
              <LanguageSwitcher />

              {/* Theme toggle */}
              <ThemeToggle />

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="ml-1 rounded-lg hover:bg-muted transition-colors">
                    <Avatar className="h-8 w-8 ring-2 ring-border">
                      <AvatarImage src={user?.avatar || undefined} />
                      <AvatarFallback className="bg-emerald-600 text-white text-xs font-semibold">
                        {user?.displayName ? getInitials(user.displayName) : 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-lg border-border">
                  <DropdownMenuLabel className="font-normal py-3 px-4">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold">{user?.displayName}</p>
                      <p className="text-xs text-muted-foreground">@{user?.username}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
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
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                    <Link href="/settings" className="py-2">
                      {t.nav.settings}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive rounded-lg cursor-pointer py-2"
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
              <ThemeToggle />
              <Link href="/login">
                <Button variant="ghost" size="sm" className="rounded-lg font-medium text-muted-foreground hover:text-foreground">{t.nav.login}</Button>
              </Link>
              <Link href="/register">
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium"
                >
                  {t.nav.register}
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
