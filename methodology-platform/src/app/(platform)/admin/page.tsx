'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Shield,
  Users,
  FileText,
  Settings,
  BarChart3,
  Trash2,
  Ban,
  CheckCircle,
  Eye,
  Search,
  AlertTriangle,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/hooks/useLanguage'
import { useToast } from '@/hooks/use-toast'
import {
  getAdminStatsExtended,
  getUsers,
  getActivities,
  getLatestMaterials,
  deleteMaterial,
  deleteUser,
  banUser,
  toggleMaterialVisibility,
  getPlatformSettings,
  updatePlatformSettings,
  type PlatformSettings,
} from '@/lib/firebase/firestore'
import { Loader2, EyeOff, UserX, Mail, Calendar, Award } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { User, Activity, Material } from '@/types'

// Admin emails - add your admin emails here
const ADMIN_EMAILS = ['admin@kopilka.ru', 'agarkomatvei2007@gmail.com']

interface AdminStats {
  totalUsers: number
  totalMaterials: number
  usersThisWeek: number
  materialsThisWeek: number
}

interface UserData {
  id: string
  email: string
  displayName: string
  avatar: string | null
  createdAt: Date
  isBanned: boolean
  materialsCount: number
}

export default function AdminPage() {
  const { user, firebaseUser } = useAuth()
  const { language } = useLanguage()
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<{ type: string; id: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalMaterials: 0,
    usersThisWeek: 0,
    materialsThisWeek: 0,
  })
  const [users, setUsers] = useState<User[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [userDetailsOpen, setUserDetailsOpen] = useState(false)
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>({
    allowRegistration: true,
    requireModeration: false,
    emailNotifications: true,
  })
  const [savingSettings, setSavingSettings] = useState(false)

  const txt = {
    ru: {
      title: 'Админ-панель',
      accessDenied: 'Доступ запрещён',
      noAccess: 'У вас нет прав для просмотра этой страницы',
      users: 'Пользователей',
      materials: 'Материалов',
      reports: 'Жалоб',
      activeToday: 'Активных сегодня',
      perWeek: 'за неделю',
      pending: 'Ожидают рассмотрения',
      usersOnline: 'Пользователей онлайн',
      overview: 'Обзор',
      usersTab: 'Пользователи',
      materialsTab: 'Материалы',
      reportsTab: 'Жалобы',
      settings: 'Настройки',
      lastActivity: 'Последняя активность',
      recentActions: 'Недавние действия пользователей',
      publishedMaterial: 'опубликовала материал',
      registered: 'зарегистрировался',
      leftComment: 'оставила комментарий',
      minutesAgo: 'минут назад',
      needsAttention: 'Требует внимания',
      moderationItems: 'Элементы требующие модерации',
      review: 'Рассмотреть',
      noAttention: 'Нет элементов требующих внимания',
      userManagement: 'Управление пользователями платформы',
      searchUsers: 'Поиск пользователей...',
      user: 'Пользователь',
      email: 'Email',
      regDate: 'Дата регистрации',
      materialsCount: 'Материалов',
      status: 'Статус',
      actions: 'Действия',
      banned: 'Заблокирован',
      active: 'Активен',
      viewProfile: 'Просмотр профиля',
      ban: 'Заблокировать',
      unban: 'Разблокировать',
      delete: 'Удалить',
      materialsModeration: 'Модерация и управление материалами',
      materialsListHere: 'Здесь будет список всех материалов с возможностью модерации',
      reportsReview: 'Рассмотрение жалоб пользователей',
      type: 'Тип',
      object: 'Объект',
      reason: 'Причина',
      from: 'От кого',
      statusLabel: 'Статус',
      material: 'Материал',
      userType: 'Пользователь',
      comment: 'Комментарий',
      pendingStatus: 'Ожидает',
      resolved: 'Решено',
      dismissed: 'Отклонено',
      accept: 'Принять',
      reject: 'Отклонить',
      noReports: 'Нет активных жалоб',
      platformSettings: 'Настройки платформы',
      globalSettings: 'Глобальные настройки и конфигурация',
      userRegistration: 'Регистрация новых пользователей',
      allowRegistration: 'Разрешить регистрацию на платформе',
      enabled: 'Включено',
      disabled: 'Отключено',
      materialsModSettings: 'Модерация материалов',
      checkBeforePublish: 'Проверять материалы перед публикацией',
      emailNotifications: 'Email уведомления',
      sendEmailNotifications: 'Отправлять email уведомления пользователям',
      deleteItem: 'Удалить элемент?',
      deleteWarning: 'Это действие нельзя отменить. Элемент будет удалён навсегда.',
      cancel: 'Отмена',
      deleted: 'Удалено',
      deletedSuccess: 'Элемент успешно удалён',
      userBanned: 'Пользователь заблокирован',
      userBannedDesc: 'Пользователь больше не может войти в систему',
      reportResolved: 'Жалоба обработана',
      reportDismissed: 'Жалоба отклонена',
    },
    kk: {
      title: 'Әкімші панелі',
      accessDenied: 'Кіруге тыйым салынған',
      noAccess: 'Сізде бұл бетті қарау құқығы жоқ',
      users: 'Пайдаланушылар',
      materials: 'Материалдар',
      reports: 'Шағымдар',
      activeToday: 'Бүгін белсенді',
      perWeek: 'апта ішінде',
      pending: 'Қарауды күтуде',
      usersOnline: 'Желідегі пайдаланушылар',
      overview: 'Шолу',
      usersTab: 'Пайдаланушылар',
      materialsTab: 'Материалдар',
      reportsTab: 'Шағымдар',
      settings: 'Параметрлер',
      lastActivity: 'Соңғы белсенділік',
      recentActions: 'Пайдаланушылардың соңғы әрекеттері',
      publishedMaterial: 'материал жариялады',
      registered: 'тіркелді',
      leftComment: 'пікір қалдырды',
      minutesAgo: 'минут бұрын',
      needsAttention: 'Назар аударуды қажет етеді',
      moderationItems: 'Модерацияны қажет ететін элементтер',
      review: 'Қарау',
      noAttention: 'Назар аударатын элементтер жоқ',
      userManagement: 'Платформа пайдаланушыларын басқару',
      searchUsers: 'Пайдаланушыларды іздеу...',
      user: 'Пайдаланушы',
      email: 'Email',
      regDate: 'Тіркелу күні',
      materialsCount: 'Материалдар',
      status: 'Күй',
      actions: 'Әрекеттер',
      banned: 'Бұғатталған',
      active: 'Белсенді',
      viewProfile: 'Профильді қарау',
      ban: 'Бұғаттау',
      unban: 'Бұғаттан шығару',
      delete: 'Жою',
      materialsModeration: 'Материалдарды модерациялау және басқару',
      materialsListHere: 'Мұнда модерациялау мүмкіндігі бар барлық материалдар тізімі болады',
      reportsReview: 'Пайдаланушы шағымдарын қарау',
      type: 'Түрі',
      object: 'Нысан',
      reason: 'Себебі',
      from: 'Кімнен',
      statusLabel: 'Күй',
      material: 'Материал',
      userType: 'Пайдаланушы',
      comment: 'Пікір',
      pendingStatus: 'Күтуде',
      resolved: 'Шешілді',
      dismissed: 'Қабылданбады',
      accept: 'Қабылдау',
      reject: 'Қабылдамау',
      noReports: 'Белсенді шағымдар жоқ',
      platformSettings: 'Платформа параметрлері',
      globalSettings: 'Жаһандық параметрлер мен конфигурация',
      userRegistration: 'Жаңа пайдаланушыларды тіркеу',
      allowRegistration: 'Платформаға тіркелуге рұқсат беру',
      enabled: 'Қосулы',
      disabled: 'Өшірулі',
      materialsModSettings: 'Материалдарды модерациялау',
      checkBeforePublish: 'Жарияланар алдында материалдарды тексеру',
      emailNotifications: 'Email хабарландырулар',
      sendEmailNotifications: 'Пайдаланушыларға email хабарландыру жіберу',
      deleteItem: 'Элементті жою керек пе?',
      deleteWarning: 'Бұл әрекетті қайтару мүмкін емес. Элемент мәңгілікке жойылады.',
      cancel: 'Болдырмау',
      deleted: 'Жойылды',
      deletedSuccess: 'Элемент сәтті жойылды',
      userBanned: 'Пайдаланушы бұғатталды',
      userBannedDesc: 'Пайдаланушы енді жүйеге кіре алмайды',
      reportResolved: 'Шағым өңделді',
      reportDismissed: 'Шағым қабылданбады',
    },
  }

  const text = txt[language]

  // Check if user is admin
  const isAdmin = firebaseUser?.email && ADMIN_EMAILS.includes(firebaseUser.email)

  useEffect(() => {
    if (!isAdmin && user) {
      router.push('/feed')
    }
  }, [isAdmin, user, router])

  useEffect(() => {
    const loadAdminData = async () => {
      if (!isAdmin) return

      try {
        // Load stats with weekly counts
        const adminStats = await getAdminStatsExtended()
        setStats({
          totalUsers: adminStats.usersCount,
          totalMaterials: adminStats.materialsCount,
          usersThisWeek: adminStats.usersThisWeek,
          materialsThisWeek: adminStats.materialsThisWeek,
        })

        // Load platform settings
        const settings = await getPlatformSettings()
        setPlatformSettings(settings)

        // Load users
        const allUsers = await getUsers('createdAt', 50)
        setUsers(allUsers)

        // Load activities
        const recentActivities = await getActivities(10)
        setActivities(recentActivities)

        // Load materials
        const { materials: allMaterials } = await getLatestMaterials(undefined, 50)
        setMaterials(allMaterials)
      } catch (error) {
        console.error('Error loading admin data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadAdminData()
  }, [isAdmin])

  if (!isAdmin) {
    return (
      <div className="container mx-auto py-12 text-center">
        <Shield className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">{text.accessDenied}</h1>
        <p className="text-muted-foreground">
          {text.noAccess}
        </p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const handleDeleteItem = async () => {
    if (!selectedItem) return

    try {
      if (selectedItem.type === 'material') {
        await deleteMaterial(selectedItem.id)
        setMaterials(materials.filter(m => m.id !== selectedItem.id))
      } else if (selectedItem.type === 'user') {
        await deleteUser(selectedItem.id)
        setUsers(users.filter(u => u.id !== selectedItem.id))
      }
      toast({
        title: text.deleted,
        description: text.deletedSuccess,
      })
    } catch (error) {
      console.error('Error deleting item:', error)
      toast({
        title: language === 'ru' ? 'Ошибка' : 'Қате',
        description: language === 'ru' ? 'Не удалось удалить' : 'Жою мүмкін болмады',
        variant: 'destructive',
      })
    }
    setDeleteDialogOpen(false)
    setSelectedItem(null)
  }

  const handleBanUser = async (userId: string) => {
    try {
      await banUser(userId, true)
      setUsers(users.map(u => u.id === userId ? { ...u, isBanned: true } : u))
      toast({
        title: text.userBanned,
        description: text.userBannedDesc,
      })
    } catch (error) {
      console.error('Error banning user:', error)
      toast({
        title: language === 'ru' ? 'Ошибка' : 'Қате',
        description: language === 'ru' ? 'Не удалось заблокировать пользователя' : 'Пайдаланушыны бұғаттау мүмкін болмады',
        variant: 'destructive',
      })
    }
  }

  const handleUnbanUser = async (userId: string) => {
    try {
      await banUser(userId, false)
      setUsers(users.map(u => u.id === userId ? { ...u, isBanned: false } : u))
      toast({
        title: language === 'ru' ? 'Пользователь разблокирован' : 'Пайдаланушы бұғаттан шығарылды',
      })
    } catch (error) {
      console.error('Error unbanning user:', error)
      toast({
        title: language === 'ru' ? 'Ошибка' : 'Қате',
        variant: 'destructive',
      })
    }
  }

  const handleToggleVisibility = async (materialId: string) => {
    try {
      const newVisibility = await toggleMaterialVisibility(materialId)
      setMaterials(materials.map(m => m.id === materialId ? { ...m, isPublic: newVisibility } : m))
      toast({
        title: newVisibility
          ? (language === 'ru' ? 'Материал опубликован' : 'Материал жарияланды')
          : (language === 'ru' ? 'Материал скрыт' : 'Материал жасырылды'),
      })
    } catch (error) {
      console.error('Error toggling visibility:', error)
      toast({
        title: language === 'ru' ? 'Ошибка' : 'Қате',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteMaterial = async (materialId: string) => {
    try {
      await deleteMaterial(materialId)
      setMaterials(materials.filter(m => m.id !== materialId))
      toast({
        title: text.deleted,
        description: text.deletedSuccess,
      })
    } catch (error) {
      console.error('Error deleting material:', error)
    }
  }

  const handleToggleSetting = async (key: keyof PlatformSettings) => {
    setSavingSettings(true)
    try {
      const newValue = !platformSettings[key]
      await updatePlatformSettings({ [key]: newValue })
      setPlatformSettings(prev => ({ ...prev, [key]: newValue }))
      toast({
        title: language === 'ru' ? 'Настройки сохранены' : 'Параметрлер сақталды',
      })
    } catch (error) {
      console.error('Error updating settings:', error)
      toast({
        title: language === 'ru' ? 'Ошибка сохранения' : 'Сақтау қатесі',
        variant: 'destructive',
      })
    } finally {
      setSavingSettings(false)
    }
  }

  const formatActivityText = (activity: Activity) => {
    switch (activity.type) {
      case 'material_published':
        return language === 'ru' ? 'опубликовал(а) материал' : 'материал жариялады'
      case 'user_followed':
        return language === 'ru' ? 'подписался(-ась)' : 'жазылды'
      default:
        return activity.type
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return language === 'ru' ? 'только что' : 'жаңа ғана'
    if (diffMins < 60) return `${diffMins} ${text.minutesAgo}`

    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return language === 'ru' ? `${diffHours} ч. назад` : `${diffHours} сағ. бұрын`

    const diffDays = Math.floor(diffHours / 24)
    return language === 'ru' ? `${diffDays} дн. назад` : `${diffDays} күн бұрын`
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">{text.title}</h1>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{text.users}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.usersThisWeek > 0 ? `+${stats.usersThisWeek}` : '0'} {text.perWeek}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{text.materials}</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMaterials}</div>
            <p className="text-xs text-muted-foreground">
              {stats.materialsThisWeek > 0 ? `+${stats.materialsThisWeek}` : '0'} {text.perWeek}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{language === 'ru' ? 'Активность' : 'Белсенділік'}</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activities.length}</div>
            <p className="text-xs text-muted-foreground">
              {language === 'ru' ? 'недавних действий' : 'соңғы әрекеттер'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{language === 'ru' ? 'Всего материалов' : 'Барлық материалдар'}</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{materials.length}</div>
            <p className="text-xs text-muted-foreground">
              {language === 'ru' ? 'в системе' : 'жүйеде'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">{text.overview}</TabsTrigger>
          <TabsTrigger value="users">{text.usersTab}</TabsTrigger>
          <TabsTrigger value="materials">{text.materialsTab}</TabsTrigger>
          <TabsTrigger value="settings">{text.settings}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>{text.lastActivity}</CardTitle>
                <CardDescription>{text.recentActions}</CardDescription>
              </CardHeader>
              <CardContent>
                {activities.length > 0 ? (
                  <div className="space-y-4">
                    {activities.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={activity.actorAvatar || undefined} />
                          <AvatarFallback>{activity.actorName?.[0] || '?'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {activity.actorName} {formatActivityText(activity)}
                            {activity.materialTitle && ` "${activity.materialTitle}"`}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {activity.createdAt && formatTimeAgo(activity.createdAt.toDate())}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    {language === 'ru' ? 'Нет активности' : 'Белсенділік жоқ'}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  {text.needsAttention}
                </CardTitle>
                <CardDescription>{text.moderationItems}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-4">
                  {text.noAttention}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{text.usersTab}</CardTitle>
                  <CardDescription>{text.userManagement}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder={text.searchUsers}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64"
                  />
                  <Button variant="outline" size="icon">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{text.user}</TableHead>
                    <TableHead>{text.email}</TableHead>
                    <TableHead>{text.regDate}</TableHead>
                    <TableHead>{text.materialsCount}</TableHead>
                    <TableHead>{text.status}</TableHead>
                    <TableHead>{text.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users
                    .filter(u =>
                      u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      u.email.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={u.avatar || undefined} />
                            <AvatarFallback>{u.displayName[0]}</AvatarFallback>
                          </Avatar>
                          {u.displayName}
                        </div>
                      </TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>{u.createdAt?.toDate().toLocaleDateString(language === 'kk' ? 'kk-KZ' : 'ru-RU')}</TableCell>
                      <TableCell>{u.stats?.materialsCount || 0}</TableCell>
                      <TableCell>
                        {(u as any).isBanned ? (
                          <Badge variant="destructive">{text.banned}</Badge>
                        ) : (
                          <Badge variant="outline">{text.active}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              {text.actions}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => {
                              setSelectedUser(u)
                              setUserDetailsOpen(true)
                            }}>
                              <Eye className="h-4 w-4 mr-2" />
                              {text.viewProfile}
                            </DropdownMenuItem>
                            {(u as any).isBanned ? (
                              <DropdownMenuItem onClick={() => handleUnbanUser(u.id)}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                {text.unban}
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleBanUser(u.id)}>
                                <Ban className="h-4 w-4 mr-2" />
                                {text.ban}
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => {
                                setSelectedItem({ type: 'user', id: u.id })
                                setDeleteDialogOpen(true)
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              {text.delete}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="materials" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{text.materialsTab}</CardTitle>
              <CardDescription>{text.materialsModeration}</CardDescription>
            </CardHeader>
            <CardContent>
              {materials.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{language === 'ru' ? 'Название' : 'Атауы'}</TableHead>
                      <TableHead>{language === 'ru' ? 'Автор' : 'Автор'}</TableHead>
                      <TableHead>{language === 'ru' ? 'Предмет' : 'Пән'}</TableHead>
                      <TableHead>{language === 'ru' ? 'Дата' : 'Күні'}</TableHead>
                      <TableHead>{language === 'ru' ? 'Просмотры' : 'Көрулер'}</TableHead>
                      <TableHead>{text.actions}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {materials.map((material) => (
                      <TableRow key={material.id}>
                        <TableCell className="font-medium max-w-[200px] truncate">
                          {material.title}
                        </TableCell>
                        <TableCell>{material.authorName}</TableCell>
                        <TableCell>{material.subject}</TableCell>
                        <TableCell>
                          {material.createdAt?.toDate().toLocaleDateString(language === 'kk' ? 'kk-KZ' : 'ru-RU')}
                        </TableCell>
                        <TableCell>{material.stats?.views || 0}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                {text.actions}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => router.push(`/materials/${material.id}`)}>
                                <Eye className="h-4 w-4 mr-2" />
                                {language === 'ru' ? 'Просмотр' : 'Қарау'}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleVisibility(material.id)}>
                                {material.isPublic ? (
                                  <>
                                    <EyeOff className="h-4 w-4 mr-2" />
                                    {language === 'ru' ? 'Скрыть' : 'Жасыру'}
                                  </>
                                ) : (
                                  <>
                                    <Eye className="h-4 w-4 mr-2" />
                                    {language === 'ru' ? 'Опубликовать' : 'Жариялау'}
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => {
                                  setSelectedItem({ type: 'material', id: material.id })
                                  setDeleteDialogOpen(true)
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                {text.delete}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  {language === 'ru' ? 'Нет материалов' : 'Материалдар жоқ'}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{text.platformSettings}</CardTitle>
              <CardDescription>{text.globalSettings}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded">
                <div>
                  <h4 className="font-medium">{text.userRegistration}</h4>
                  <p className="text-sm text-muted-foreground">{text.allowRegistration}</p>
                </div>
                <Switch
                  checked={platformSettings.allowRegistration}
                  onCheckedChange={() => handleToggleSetting('allowRegistration')}
                  disabled={savingSettings}
                />
              </div>
              <div className="flex items-center justify-between p-4 border rounded">
                <div>
                  <h4 className="font-medium">{text.materialsModSettings}</h4>
                  <p className="text-sm text-muted-foreground">{text.checkBeforePublish}</p>
                </div>
                <Switch
                  checked={platformSettings.requireModeration}
                  onCheckedChange={() => handleToggleSetting('requireModeration')}
                  disabled={savingSettings}
                />
              </div>
              <div className="flex items-center justify-between p-4 border rounded">
                <div>
                  <h4 className="font-medium">{text.emailNotifications}</h4>
                  <p className="text-sm text-muted-foreground">{text.sendEmailNotifications}</p>
                </div>
                <Switch
                  checked={platformSettings.emailNotifications}
                  onCheckedChange={() => handleToggleSetting('emailNotifications')}
                  disabled={savingSettings}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{text.deleteItem}</AlertDialogTitle>
            <AlertDialogDescription>
              {text.deleteWarning}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{text.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteItem} className="bg-destructive">
              {text.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* User Details Modal */}
      <Dialog open={userDetailsOpen} onOpenChange={setUserDetailsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedUser && (
                <>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedUser.avatar || undefined} />
                    <AvatarFallback>{selectedUser.displayName?.[0] || '?'}</AvatarFallback>
                  </Avatar>
                  {selectedUser.displayName}
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {language === 'ru' ? 'Подробная информация о пользователе' : 'Пайдаланушы туралы толық ақпарат'}
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    Email
                  </p>
                  <p className="text-sm font-medium">{selectedUser.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Username</p>
                  <p className="text-sm font-medium">@{selectedUser.username}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {language === 'ru' ? 'Регистрация' : 'Тіркелу'}
                  </p>
                  <p className="text-sm font-medium">
                    {selectedUser.createdAt?.toDate().toLocaleDateString(language === 'kk' ? 'kk-KZ' : 'ru-RU')}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Award className="h-3 w-3" />
                    {language === 'ru' ? 'Уровень' : 'Деңгей'}
                  </p>
                  <p className="text-sm font-medium">{selectedUser.level || 1} ({selectedUser.points || 0} {language === 'ru' ? 'очков' : 'ұпай'})</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-lg font-bold">{selectedUser.stats?.materialsCount || 0}</p>
                  <p className="text-xs text-muted-foreground">{language === 'ru' ? 'Материалов' : 'Материалдар'}</p>
                </div>
                <div>
                  <p className="text-lg font-bold">{selectedUser.stats?.followersCount || 0}</p>
                  <p className="text-xs text-muted-foreground">{language === 'ru' ? 'Подписчиков' : 'Жазылушылар'}</p>
                </div>
                <div>
                  <p className="text-lg font-bold">{selectedUser.stats?.totalViews || 0}</p>
                  <p className="text-xs text-muted-foreground">{language === 'ru' ? 'Просмотров' : 'Көрулер'}</p>
                </div>
              </div>

              {selectedUser.bio && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">{language === 'ru' ? 'О себе' : 'Өзі туралы'}</p>
                  <p className="text-sm">{selectedUser.bio}</p>
                </div>
              )}

              {selectedUser.subjects && selectedUser.subjects.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">{language === 'ru' ? 'Предметы' : 'Пәндер'}</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedUser.subjects.map((subject, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">{subject}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setUserDetailsOpen(false)
                    router.push(`/profile/${selectedUser.username || selectedUser.id}`)
                  }}
                >
                  {language === 'ru' ? 'Открыть профиль' : 'Профильді ашу'}
                </Button>
                {selectedUser.isBanned ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleUnbanUser(selectedUser.id)
                      setUserDetailsOpen(false)
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {text.unban}
                  </Button>
                ) : (
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleBanUser(selectedUser.id)
                      setUserDetailsOpen(false)
                    }}
                  >
                    <Ban className="h-4 w-4 mr-2" />
                    {text.ban}
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
