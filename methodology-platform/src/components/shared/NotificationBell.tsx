'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Bell, Heart, MessageCircle, UserPlus, Award, AtSign } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAuth } from '@/hooks/useAuth'
import { getNotifications, getUnreadNotificationsCount, markNotificationAsRead, markAllNotificationsAsRead } from '@/lib/firebase/firestore'
import { formatRelativeTime, getInitials } from '@/lib/utils'
import type { Notification, NotificationType } from '@/types'

const notificationIcons: Record<NotificationType, React.ReactNode> = {
  like: <Heart className="h-4 w-4 text-red-500" />,
  comment: <MessageCircle className="h-4 w-4 text-blue-500" />,
  reply: <MessageCircle className="h-4 w-4 text-blue-500" />,
  follow: <UserPlus className="h-4 w-4 text-green-500" />,
  mention: <AtSign className="h-4 w-4 text-purple-500" />,
  achievement: <Award className="h-4 w-4 text-yellow-500" />,
}

export default function NotificationBell() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!user) return

    const fetchNotifications = async () => {
      const [notifs, count] = await Promise.all([
        getNotifications(user.id, 10),
        getUnreadNotificationsCount(user.id),
      ])
      setNotifications(notifs)
      setUnreadCount(count)
    }

    fetchNotifications()

    // Refresh every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [user])

  const handleNotificationClick = async (notification: Notification) => {
    if (!user || notification.isRead) return
    await markNotificationAsRead(user.id, notification.id)
    setNotifications(prev =>
      prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const handleMarkAllAsRead = async () => {
    if (!user) return
    await markAllNotificationsAsRead(user.id)
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    setUnreadCount(0)
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Уведомления</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs text-primary"
              onClick={handleMarkAllAsRead}
            >
              Прочитать все
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Нет уведомлений
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                asChild
                className={`cursor-pointer p-3 ${!notification.isRead ? 'bg-muted/50' : ''}`}
              >
                <Link
                  href={notification.link || '#'}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex gap-3 w-full">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={notification.actorAvatar || undefined} />
                        <AvatarFallback>
                          {notification.actorName ? getInitials(notification.actorName) : '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 rounded-full bg-background p-0.5">
                        {notificationIcons[notification.type]}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">
                        {notification.title}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatRelativeTime(notification.createdAt.toDate())}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <div className="w-2 h-2 rounded-full bg-primary self-center" />
                    )}
                  </div>
                </Link>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="justify-center">
          <Link href="/notifications" className="text-primary">
            Все уведомления
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
