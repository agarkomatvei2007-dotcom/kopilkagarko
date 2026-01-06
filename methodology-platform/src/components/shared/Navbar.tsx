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
    <header className="sticky top-0 z-50 w-full">
      <div className="glass border-b border-border/50">
        <div className="flex h-16 items-center gap-4 px-4 lg:px-6 max-w-screen-2xl mx-auto">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden rounded-xl hover:bg-primary/10 transition-colors"
            onClick={toggleMobileMenu}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Logo */}
          <Link href={isAuthenticated ? '/feed' : '/'} className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25 transition-all duration-300 group-hover:scale-105 group-hover:shadow-primary/40 group-hover:shadow-xl">
              <BookOpen className="h-5 w-5 text-white" />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="font-bold text-foreground group-hover:text-primary transition-colors whitespace-nowrap leading-tight">
                {t.landing.title}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium tracking-wide">
                Платформа для педагогов
              </span>
            </div>
          </Link>

          {/* Search bar */}
          {isAuthenticated && (
            <div className="flex-1 max-w-xl ml-4">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                <Input
                  placeholder={t.common.search}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearch}
                  className="pl-11 pr-4 h-11 bg-muted/50 border-0 rounded-xl focus:bg-background focus:ring-2 focus:ring-primary/20 focus:shadow-lg transition-all duration-200 placeholder:text-muted-foreground/70"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1 text-xs text-muted-foreground/50">
                  <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-medium">Enter</kbd>
                </div>
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
                    className="hidden sm:flex gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white rounded-xl shadow-lg shadow-primary/25 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] px-4"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="font-medium">{t.common.create}</span>
                  </Button>
                  <Button size="icon" variant="ghost" className="sm:hidden rounded-xl hover:bg-primary/10 hover:text-primary transition-colors">
                    <Plus className="h-5 w-5" />
                  </Button>
                </Link>

                {/* Messages */}
                <Link href="/messages">
                  <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/10 hover:text-primary transition-colors relative">
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
                    <Button variant="ghost" size="icon" className="ml-1 rounded-xl hover:bg-transparent group">
                      <Avatar className="h-9 w-9 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-200">
                        <AvatarImage src={user?.avatar || undefined} />
                        <AvatarFallback className="text-xs bg-gradient-to-br from-primary to-accent text-white font-semibold">
                          {user?.displayName ? getInitials(user.displayName) : 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-60 rounded-2xl shadow-2xl border-border/50 p-2">
                    <DropdownMenuLabel className="font-normal p-3 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl mb-2">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                          <AvatarImage src={user?.avatar || undefined} />
                          <AvatarFallback className="text-sm bg-gradient-to-br from-primary to-accent text-white font-semibold">
                            {user?.displayName ? getInitials(user.displayName) : 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <p className="text-sm font-semibold">{user?.displayName}</p>
                          <p className="text-xs text-primary font-medium">@{user?.username}</p>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer py-2.5 px-3 focus:bg-primary/10 focus:text-primary">
                      <Link href={`/profile/${user?.username}`}>
                        {t.nav.myProfile}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer py-2.5 px-3 focus:bg-primary/10 focus:text-primary">
                      <Link href="/my-materials">
                        {t.nav.myMaterials}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer py-2.5 px-3 focus:bg-primary/10 focus:text-primary">
                      <Link href="/analytics">
                        {t.nav.analytics}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer py-2.5 px-3 focus:bg-primary/10 focus:text-primary">
                      <Link href="/achievements">
                        {t.nav.achievements}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-2" />
                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer py-2.5 px-3 focus:bg-muted">
                      <Link href="/settings">
                        {t.nav.settings}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-2" />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive focus:bg-destructive/10 rounded-lg cursor-pointer py-2.5 px-3"
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
                  <Button variant="ghost" size="sm" className="rounded-xl hover:bg-primary/10 hover:text-primary transition-colors font-medium">{t.nav.login}</Button>
                </Link>
                <Link href="/register">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white rounded-xl shadow-lg shadow-primary/25 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] font-medium px-4"
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
