'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Shield,
  Users,
  FileText,
  Flag,
  Settings,
  BarChart3,
  Trash2,
  Ban,
  CheckCircle,
  XCircle,
  Eye,
  Search,
  AlertTriangle,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
import { useToast } from '@/hooks/use-toast'

// Admin emails - add your admin emails here
const ADMIN_EMAILS = ['admin@kopilka.ru', 'agarkomatvei2007@gmail.com']

interface AdminStats {
  totalUsers: number
  totalMaterials: number
  totalReports: number
  activeToday: number
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

interface ReportData {
  id: string
  type: 'material' | 'user' | 'comment'
  targetId: string
  targetTitle: string
  reason: string
  reporterName: string
  createdAt: Date
  status: 'pending' | 'resolved' | 'dismissed'
}

export default function AdminPage() {
  const { user, firebaseUser } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<{ type: string; id: string } | null>(null)

  // Check if user is admin
  const isAdmin = firebaseUser?.email && ADMIN_EMAILS.includes(firebaseUser.email)

  // Mock data for demonstration
  const [stats] = useState<AdminStats>({
    totalUsers: 156,
    totalMaterials: 423,
    totalReports: 12,
    activeToday: 45,
  })

  const [users] = useState<UserData[]>([
    {
      id: '1',
      email: 'user1@example.com',
      displayName: 'Иванова М.А.',
      avatar: null,
      createdAt: new Date('2024-01-15'),
      isBanned: false,
      materialsCount: 15,
    },
    {
      id: '2',
      email: 'user2@example.com',
      displayName: 'Петров И.В.',
      avatar: null,
      createdAt: new Date('2024-02-20'),
      isBanned: false,
      materialsCount: 8,
    },
  ])

  const [reports] = useState<ReportData[]>([
    {
      id: '1',
      type: 'material',
      targetId: 'mat1',
      targetTitle: 'Спамовый материал',
      reason: 'Нарушение правил сообщества',
      reporterName: 'Сидоров К.',
      createdAt: new Date(),
      status: 'pending',
    },
  ])

  useEffect(() => {
    if (!isAdmin && user) {
      router.push('/feed')
    }
  }, [isAdmin, user, router])

  if (!isAdmin) {
    return (
      <div className="container mx-auto py-12 text-center">
        <Shield className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Доступ запрещён</h1>
        <p className="text-muted-foreground">
          У вас нет прав для просмотра этой страницы
        </p>
      </div>
    )
  }

  const handleDeleteItem = () => {
    if (!selectedItem) return
    toast({
      title: 'Удалено',
      description: 'Элемент успешно удалён',
    })
    setDeleteDialogOpen(false)
    setSelectedItem(null)
  }

  const handleBanUser = (userId: string) => {
    toast({
      title: 'Пользователь заблокирован',
      description: 'Пользователь больше не может войти в систему',
    })
  }

  const handleResolveReport = (reportId: string, action: 'resolve' | 'dismiss') => {
    toast({
      title: action === 'resolve' ? 'Жалоба обработана' : 'Жалоба отклонена',
    })
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Админ-панель</h1>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Пользователей</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">+12 за неделю</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Материалов</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMaterials}</div>
            <p className="text-xs text-muted-foreground">+34 за неделю</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Жалоб</CardTitle>
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReports}</div>
            <p className="text-xs text-muted-foreground">Ожидают рассмотрения</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Активных сегодня</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeToday}</div>
            <p className="text-xs text-muted-foreground">Пользователей онлайн</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="users">Пользователи</TabsTrigger>
          <TabsTrigger value="materials">Материалы</TabsTrigger>
          <TabsTrigger value="reports">Жалобы</TabsTrigger>
          <TabsTrigger value="settings">Настройки</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Последняя активность</CardTitle>
                <CardDescription>Недавние действия пользователей</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>И</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Иванова М.А. опубликовала материал</p>
                      <p className="text-xs text-muted-foreground">5 минут назад</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>П</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Петров И.В. зарегистрировался</p>
                      <p className="text-xs text-muted-foreground">15 минут назад</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>С</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Сидорова Е.К. оставила комментарий</p>
                      <p className="text-xs text-muted-foreground">30 минут назад</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  Требует внимания
                </CardTitle>
                <CardDescription>Элементы требующие модерации</CardDescription>
              </CardHeader>
              <CardContent>
                {reports.filter(r => r.status === 'pending').length > 0 ? (
                  <div className="space-y-2">
                    {reports.filter(r => r.status === 'pending').map(report => (
                      <div key={report.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <p className="text-sm font-medium">{report.targetTitle}</p>
                          <p className="text-xs text-muted-foreground">{report.reason}</p>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => setActiveTab('reports')}>
                          Рассмотреть
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    Нет элементов требующих внимания
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Пользователи</CardTitle>
                  <CardDescription>Управление пользователями платформы</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Поиск пользователей..."
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
                    <TableHead>Пользователь</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Дата регистрации</TableHead>
                    <TableHead>Материалов</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar || undefined} />
                            <AvatarFallback>{user.displayName[0]}</AvatarFallback>
                          </Avatar>
                          {user.displayName}
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.createdAt.toLocaleDateString('ru-RU')}</TableCell>
                      <TableCell>{user.materialsCount}</TableCell>
                      <TableCell>
                        {user.isBanned ? (
                          <Badge variant="destructive">Заблокирован</Badge>
                        ) : (
                          <Badge variant="outline">Активен</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              Действия
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              Просмотр профиля
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleBanUser(user.id)}>
                              <Ban className="h-4 w-4 mr-2" />
                              {user.isBanned ? 'Разблокировать' : 'Заблокировать'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => {
                                setSelectedItem({ type: 'user', id: user.id })
                                setDeleteDialogOpen(true)
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Удалить
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
              <CardTitle>Материалы</CardTitle>
              <CardDescription>Модерация и управление материалами</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">
                Здесь будет список всех материалов с возможностью модерации
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Жалобы</CardTitle>
              <CardDescription>Рассмотрение жалоб пользователей</CardDescription>
            </CardHeader>
            <CardContent>
              {reports.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Тип</TableHead>
                      <TableHead>Объект</TableHead>
                      <TableHead>Причина</TableHead>
                      <TableHead>От кого</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>
                          <Badge variant="outline">
                            {report.type === 'material' ? 'Материал' :
                             report.type === 'user' ? 'Пользователь' : 'Комментарий'}
                          </Badge>
                        </TableCell>
                        <TableCell>{report.targetTitle}</TableCell>
                        <TableCell>{report.reason}</TableCell>
                        <TableCell>{report.reporterName}</TableCell>
                        <TableCell>
                          {report.status === 'pending' ? (
                            <Badge variant="secondary">Ожидает</Badge>
                          ) : report.status === 'resolved' ? (
                            <Badge variant="default">Решено</Badge>
                          ) : (
                            <Badge variant="outline">Отклонено</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {report.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleResolveReport(report.id, 'resolve')}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Принять
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleResolveReport(report.id, 'dismiss')}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Отклонить
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Нет активных жалоб
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Настройки платформы</CardTitle>
              <CardDescription>Глобальные настройки и конфигурация</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded">
                <div>
                  <h4 className="font-medium">Регистрация новых пользователей</h4>
                  <p className="text-sm text-muted-foreground">Разрешить регистрацию на платформе</p>
                </div>
                <Badge variant="default">Включено</Badge>
              </div>
              <div className="flex items-center justify-between p-4 border rounded">
                <div>
                  <h4 className="font-medium">Модерация материалов</h4>
                  <p className="text-sm text-muted-foreground">Проверять материалы перед публикацией</p>
                </div>
                <Badge variant="secondary">Отключено</Badge>
              </div>
              <div className="flex items-center justify-between p-4 border rounded">
                <div>
                  <h4 className="font-medium">Email уведомления</h4>
                  <p className="text-sm text-muted-foreground">Отправлять email уведомления пользователям</p>
                </div>
                <Badge variant="default">Включено</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить элемент?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Элемент будет удалён навсегда.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteItem} className="bg-destructive">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
