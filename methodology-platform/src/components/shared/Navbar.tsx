'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BookOpen,
  Search,
  Bell,
  Menu,
  Plus,
  MessageSquare,
  Home,
  Compass,
  Users,
  BookmarkIcon,
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
import { useUIStore } from '@/stores/uiStore'
import { getInitials } from '@/lib/utils'
import NotificationBell from './NotificationBell'

const navLinks = [
  { href: '/feed', label: 'Лента', icon: Home },
  { href: '/explore', label: 'Обзор', icon: Compass },
  { href: '/communities', label: 'Сообщества', icon: Users },
  { href: '/collections', label: 'Коллекции', icon: BookmarkIcon },
]

export default function Navbar() {
  const { user, signOut, isAuthenticated } = useAuth()
  const { toggleMobileMenu } = useUIStore()
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center gap-4 px-4">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={toggleMobileMenu}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Logo */}
        <Link href={isAuthenticated ? '/feed' : '/'} className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          <span className="hidden font-bold sm:inline-block">
            Методическая копилка
          </span>
        </Link>

        {/* Desktop navigation */}
        {isAuthenticated && (
          <nav className="hidden md:flex items-center gap-1 ml-4">
            {navLinks.map((link) => {
              const Icon = link.icon
              const isActive = pathname.startsWith(link.href)
              return (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant={isActive ? 'secondary' : 'ghost'}
                    size="sm"
                    className="gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Button>
                </Link>
              )
            })}
          </nav>
        )}

        {/* Search bar */}
        {isAuthenticated && (
          <div className="flex-1 max-w-md ml-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Поиск материалов..."
                className="pl-10"
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              {/* Create button */}
              <Link href="/materials/create">
                <Button size="sm" className="hidden sm:flex gap-2">
                  <Plus className="h-4 w-4" />
                  Создать
                </Button>
                <Button size="icon" variant="ghost" className="sm:hidden">
                  <Plus className="h-5 w-5" />
                </Button>
              </Link>

              {/* Messages */}
              <Link href="/messages">
                <Button variant="ghost" size="icon">
                  <MessageSquare className="h-5 w-5" />
                </Button>
              </Link>

              {/* Notifications */}
              <NotificationBell />

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar || undefined} />
                      <AvatarFallback>
                        {user?.displayName ? getInitials(user.displayName) : 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user?.displayName}</p>
                      <p className="text-xs text-muted-foreground">@{user?.username}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={`/profile/${user?.username}`}>
                      Мой профиль
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/materials">
                      Мои материалы
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/analytics">
                      Аналитика
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/achievements">
                      Достижения
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/settings">
                      Настройки
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={signOut}
                  >
                    Выйти
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">Войти</Button>
              </Link>
              <Link href="/register">
                <Button>Регистрация</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
