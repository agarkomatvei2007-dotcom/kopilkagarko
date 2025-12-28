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
import { useLanguage } from '@/hooks/useLanguage'
import { useToast } from '@/hooks/use-toast'
import { getNotifications, markAllNotificationsAsRead, markNotificationAsRead, deleteNotification } from '@/lib/firebase/firestore'
import type { Notification } from '@/types'

const notificationIcons: Record<string, React.ReactNode> = {
  like: <Heart className="h-4 w-4 text-red-500" />,
  comment: <MessageCircle className="h-4 w-4 text-blue-500" />,
  reply: <MessageCircle className="h-4 w-4 text-blue-500" />,
  follow: <UserPlus className="h-4 w-4 text-green-500" />,
  achievement: <Award className="h-4 w-4 text-yellow-500" />,
  material: <FileText className="h-4 w-4 text-purple-500" />,
}

export default function NotificationsPage() {
  const { user } = useAuth()
  const { language } = useLanguage()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('all')
  const [isLoading, setIsLoading] = useState(false)

  const txt = {
    ru: {
      title: 'Уведомления',
      loginRequired: 'Войдите, чтобы просматривать уведомления',
      markAllRead: 'Прочитать все',
      all: 'Все',
      unread: 'Непрочитанные',
      noNotifications: 'Нет уведомлений',
      noUnread: 'Нет непрочитанных уведомлений',
      allMarkedRead: 'Все уведомления отмечены как прочитанные',
      deleted: 'Уведомление удалено',
      goTo: 'Перейти',
      minutesAgo: 'мин. назад',
      hoursAgo: 'ч. назад',
      yesterday: 'Вчера',
      daysAgo: 'дн. назад',
      // Demo notifications
      newLike: 'Новый лайк',
      newComment: 'Новый комментарий',
      newFollower: 'Новый подписчик',
      newAchievement: 'Новое достижение!',
      likedMaterial: 'оценила ваш материал',
      commented: 'прокомментировал:',
      followedYou: 'подписалась на вас',
      gotAchievement: 'Вы получили достижение',
    },
    kk: {
      title: 'Хабарландырулар',
      loginRequired: 'Хабарландыруларды көру үшін кіріңіз',
      markAllRead: 'Барлығын оқу',
      all: 'Барлығы',
      unread: 'Оқылмағандар',
      noNotifications: 'Хабарландырулар жоқ',
      noUnread: 'Оқылмаған хабарландырулар жоқ',
      allMarkedRead: 'Барлық хабарландырулар оқылған деп белгіленді',
      deleted: 'Хабарландыру жойылды',
      goTo: 'Өту',
      minutesAgo: 'мин. бұрын',
      hoursAgo: 'сағ. бұрын',
      yesterday: 'Кеше',
      daysAgo: 'күн бұрын',
      // Demo notifications
      newLike: 'Жаңа ұнату',
      newComment: 'Жаңа пікір',
      newFollower: 'Жаңа жазылушы',
      newAchievement: 'Жаңа жетістік!',
      likedMaterial: 'материалыңызды бағалады',
      commented: 'пікір жазды:',
      followedYou: 'сізге жазылды',
      gotAchievement: 'Сіз жетістікке қол жеткіздіңіз',
    },
  }

  const text = txt[language]

  const [notifications, setNotifications] = useState<Notification[]>([])

  // Load notifications from Firebase
  useEffect(() => {
    const loadNotifications = async () => {
      if (!user) return

      setIsLoading(true)
      try {
        const userNotifications = await getNotifications(user.id, 50)
        setNotifications(userNotifications)
      } catch (error) {
        console.error('Error loading notifications:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadNotifications()
  }, [user])

  const unreadCount = notifications.filter(n => !n.isRead).length

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'unread') return !n.isRead
    return true
  })

  function formatTimeAgo(date: Date): string {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 60) return `${diffMins} ${text.minutesAgo}`
    if (diffHours < 24) return `${diffHours} ${text.hoursAgo}`
    if (diffDays === 1) return text.yesterday
    if (diffDays < 7) return `${diffDays} ${text.daysAgo}`
    return date.toLocaleDateString(language === 'kk' ? 'kk-KZ' : 'ru-RU')
  }

  const handleMarkAllRead = async () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })))
    toast({ title: text.allMarkedRead })

    if (user) {
      try {
        await markAllNotificationsAsRead(user.id)
      } catch (error) {
        console.error('Error marking notifications as read:', error)
      }
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    setNotifications(notifications.map(n =>
      n.id === notificationId ? { ...n, isRead: true } : n
    ))

    if (user) {
      try {
        await markNotificationAsRead(user.id, notificationId)
      } catch (error) {
        console.error('Error marking notification as read:', error)
      }
    }
  }

  const handleDelete = async (notificationId: string) => {
    setNotifications(notifications.filter(n => n.id !== notificationId))
    toast({ title: text.deleted })

    if (user) {
      try {
        await deleteNotification(user.id, notificationId)
      } catch (error) {
        console.error('Error deleting notification:', error)
      }
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto py-12 text-center">
        <Bell className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">{text.loginRequired}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Bell className="h-6 w-6" />
          <h1 className="text-2xl font-bold">{text.title}</h1>
          {unreadCount > 0 && (
            <Badge>{unreadCount}</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
              <CheckCheck className="h-4 w-4 mr-2" />
              {text.markAllRead}
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
          <TabsTrigger value="all">{text.all}</TabsTrigger>
          <TabsTrigger value="unread">
            {text.unread}
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
                  {activeTab === 'unread' ? text.noUnread : text.noNotifications}
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
                              {formatTimeAgo(notification.createdAt?.toDate ? notification.createdAt.toDate() : new Date())}
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
                              {text.goTo} →
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
