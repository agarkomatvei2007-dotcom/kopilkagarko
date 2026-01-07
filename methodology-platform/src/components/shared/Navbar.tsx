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
      <div className="glass-strong border-b border-white/20 dark:border-white/10 shadow-lg">
        <div className="flex h-16 items-center gap-4 px-4 lg:px-6 max-w-screen-2xl mx-auto">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden rounded-xl hover:bg-white/20 hover:glow-accent transition-all"
            onClick={toggleMobileMenu}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Logo */}
          <Link href={isAuthenticated ? '/feed' : '/'} className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="w-10 h-10 rounded-2xl gradient-primary flex items-center justify-center shadow-lg glow animate-pulse-glow transition-transform group-hover:scale-110 group-hover:rotate-3">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <span className="hidden sm:inline-block font-bold gradient-text text-lg whitespace-nowrap">
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
                  className="pl-10 h-11 glass border-white/30 dark:border-white/10 rounded-2xl focus:bg-white/90 dark:focus:bg-white/10 focus:ring-2 focus:ring-primary/30 focus:border-primary/50 focus:glow transition-all placeholder:text-muted-foreground/70"
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
                    className="hidden sm:flex gap-1.5 btn-cyber rounded-2xl font-semibold"
                  >
                    <Plus className="h-4 w-4" />
                    {t.common.create}
                  </Button>
                  <Button size="icon" variant="ghost" className="sm:hidden rounded-xl glass hover:glow-accent transition-all">
                    <Plus className="h-5 w-5" />
                  </Button>
                </Link>

                {/* Messages */}
                <Link href="/messages">
                  <Button variant="ghost" size="icon" className="rounded-xl glass-subtle hover:glass hover:glow-accent transition-all">
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
                    <Button variant="ghost" size="icon" className="ml-1 rounded-xl hover:scale-105 transition-transform">
                      <Avatar className="h-9 w-9 ring-2 ring-primary/30 shadow-lg glow-accent">
                        <AvatarImage src={user?.avatar || undefined} />
                        <AvatarFallback className="text-xs gradient-primary text-white font-bold">
                          {user?.displayName ? getInitials(user.displayName) : 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 rounded-2xl shadow-2xl glass-strong border-white/20 dark:border-white/10">
                    <DropdownMenuLabel className="font-normal py-3 px-4">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-bold">{user?.displayName}</p>
                        <p className="text-xs gradient-text font-medium">@{user?.username}</p>
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
                  <Button variant="ghost" size="sm" className="rounded-xl glass-subtle hover:glass hover:glow-accent transition-all font-medium">{t.nav.login}</Button>
                </Link>
                <Link href="/register">
                  <Button
                    size="sm"
                    className="btn-cyber rounded-2xl font-semibold"
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
