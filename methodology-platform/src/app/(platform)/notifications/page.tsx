'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Bell,
  Heart,
  MessageCircle,
  UserPlus,
  Award,
  FileText,
  Check,
  CheckCheck,
  Trash2,
  Settings,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'
import { getNotifications, markAllNotificationsAsRead } from '@/lib/firebase/firestore'
import type { Notification } from '@/types'

const notificationIcons: Record<string, React.ReactNode> = {
  like: <Heart className="h-4 w-4 text-red-500" />,
  comment: <MessageCircle className="h-4 w-4 text-blue-500" />,
  reply: <MessageCircle className="h-4 w-4 text-blue-500" />,
  follow: <UserPlus className="h-4 w-4 text-green-500" />,
  achievement: <Award className="h-4 w-4 text-yellow-500" />,
  material: <FileText className="h-4 w-4 text-purple-500" />,
}

// Demo notifications
const demoNotifications = [
  {
    id: '1',
    type: 'like',
    title: 'Новый лайк',
    message: 'Иванова М.А. оценила ваш материал "Основы Python"',
    actorId: '1',
    actorName: 'Иванова М.А.',
    actorAvatar: null,
    materialId: '1',
    link: '/materials/1',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
  },
  {
    id: '2',
    type: 'comment',
    title: 'Новый комментарий',
    message: 'Петров И.В. прокомментировал: "Отличный материал!"',
    actorId: '2',
    actorName: 'Петров И.В.',
    actorAvatar: null,
    materialId: '1',
    link: '/materials/1',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
  },
  {
    id: '3',
    type: 'follow',
    title: 'Новый подписчик',
    message: 'Сидорова Е.К. подписалась на вас',
    actorId: '3',
    actorName: 'Сидорова Е.К.',
    actorAvatar: null,
    materialId: null,
    link: '/profile/sidorova',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
  },
  {
    id: '4',
    type: 'achievement',
    title: 'Новое достижение!',
    message: 'Вы получили достижение "Первые 10 материалов"',
    actorId: null,
    actorName: null,
    actorAvatar: null,
    materialId: null,
    link: '/achievements',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
  },
  {
    id: '5',
    type: 'like',
    title: 'Новый лайк',
    message: 'Козлов А.П. оценил ваш материал "Базы данных SQL"',
    actorId: '4',
    actorName: 'Козлов А.П.',
    actorAvatar: null,
    materialId: '2',
    link: '/materials/2',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
  },
]

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 60) return `${diffMins} мин. назад`
  if (diffHours < 24) return `${diffHours} ч. назад`
  if (diffDays === 1) return 'Вчера'
  if (diffDays < 7) return `${diffDays} дн. назад`
  return date.toLocaleDateString('ru-RU')
}

export default function NotificationsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [notifications, setNotifications] = useState(demoNotifications)
  const [activeTab, setActiveTab] = useState('all')
  const [isLoading, setIsLoading] = useState(false)

  const unreadCount = notifications.filter(n => !n.isRead).length

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'unread') return !n.isRead
    return true
  })

  const handleMarkAllRead = async () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })))
    toast({ title: 'Все уведомления отмечены как прочитанные' })

    if (user) {
      try {
        await markAllNotificationsAsRead(user.id)
      } catch (error) {
        console.error('Error marking notifications as read:', error)
      }
    }
  }

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(notifications.map(n =>
      n.id === notificationId ? { ...n, isRead: true } : n
    ))
  }

  const handleDelete = (notificationId: string) => {
    setNotifications(notifications.filter(n => n.id !== notificationId))
    toast({ title: 'Уведомление удалено' })
  }

  if (!user) {
    return (
      <div className="container mx-auto py-12 text-center">
        <Bell className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Войдите, чтобы просматривать уведомления</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Bell className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Уведомления</h1>
          {unreadCount > 0 && (
            <Badge>{unreadCount}</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
              <CheckCheck className="h-4 w-4 mr-2" />
              Прочитать все
            </Button>
          )}
          <Link href="/settings">
            <Button variant="ghost" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">Все</TabsTrigger>
          <TabsTrigger value="unread">
            Непрочитанные
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-2">{unreadCount}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {activeTab === 'unread' ? 'Нет непрочитанных уведомлений' : 'Нет уведомлений'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredNotifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`transition-colors ${!notification.isRead ? 'bg-primary/5 border-primary/20' : ''}`}
                >
                  <CardContent className="py-4">
                    <div className="flex items-start gap-4">
                      {notification.actorAvatar || notification.actorName ? (
                        <Avatar>
                          <AvatarImage src={notification.actorAvatar || undefined} />
                          <AvatarFallback>
                            {notification.actorName?.[0] || '?'}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                          {notificationIcons[notification.type] || <Bell className="h-4 w-4" />}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium flex items-center gap-2">
                              {notification.title}
                              {!notification.isRead && (
                                <span className="w-2 h-2 rounded-full bg-primary" />
                              )}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatTimeAgo(notification.createdAt)}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            {!notification.isRead && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleMarkAsRead(notification.id)}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => handleDelete(notification.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        {notification.link && (
                          <Link href={notification.link}>
                            <Button variant="link" className="h-auto p-0 mt-2">
                              Перейти →
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
