'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  BarChart3,
  TrendingUp,
  Eye,
  Heart,
  MessageCircle,
  Users,
  FileText,
  BookOpen,
  Loader2,
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/hooks/useLanguage'
import { getMaterialsByAuthor, getUserCommunities } from '@/lib/firebase/firestore'
import type { Material } from '@/types'

export default function AnalyticsPage() {
  const { user } = useAuth()
  const { language } = useLanguage()

  const [materials, setMaterials] = useState<Material[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [communitiesCount, setCommunitiesCount] = useState(0)

  const txt = {
    ru: {
      title: 'Аналитика',
      loginRequired: 'Войдите, чтобы увидеть аналитику',
      totalViews: 'Всего просмотров',
      totalLikes: 'Всего лайков',
      materials: 'Материалов',
      followers: 'Подписчиков',
      perMonth: 'за месяц',
      published: 'Опубликовано',
      overview: 'Обзор',
      materialsTab: 'Материалы',
      audience: 'Аудитория',
      periodStats: 'Статистика по материалам',
      periodDesc: 'Распределение просмотров и лайков',
      popularMaterials: 'Популярные материалы',
      popularDesc: 'Ваши самые просматриваемые материалы',
      noMaterials: 'У вас пока нет опубликованных материалов',
      yourAudience: 'Ваша активность',
      audienceDesc: 'Ваше участие на платформе',
      bySubjects: 'По предметам',
      views: 'просмотров',
      likes: 'лайков',
      comments: 'комментариев',
      communities: 'Сообществ',
      level: 'Уровень',
      points: 'Очков опыта',
      materialsBreakdown: 'Материалы по типам',
      viewsBreakdown: 'Просмотры по материалам',
      topMaterials: 'Топ материалов',
    },
    kk: {
      title: 'Аналитика',
      loginRequired: 'Аналитиканы көру үшін кіріңіз',
      totalViews: 'Барлық көрулер',
      totalLikes: 'Барлық ұнатулар',
      materials: 'Материалдар',
      followers: 'Жазылушылар',
      perMonth: 'ай ішінде',
      published: 'Жарияланған',
      overview: 'Шолу',
      materialsTab: 'Материалдар',
      audience: 'Аудитория',
      periodStats: 'Материалдар статистикасы',
      periodDesc: 'Көрулер мен ұнатулардың таралуы',
      popularMaterials: 'Танымал материалдар',
      popularDesc: 'Ең көп қаралған материалдарыңыз',
      noMaterials: 'Сізде әлі жарияланған материалдар жоқ',
      yourAudience: 'Сіздің белсенділігіңіз',
      audienceDesc: 'Платформадағы қатысуыңыз',
      bySubjects: 'Пәндер бойынша',
      views: 'көру',
      likes: 'ұнату',
      comments: 'пікір',
      communities: 'Қауымдастықтар',
      level: 'Деңгей',
      points: 'Тәжірибе ұпайлары',
      materialsBreakdown: 'Түрлері бойынша материалдар',
      viewsBreakdown: 'Материалдар бойынша көрулер',
      topMaterials: 'Үздік материалдар',
    },
  }

  const text = txt[language]

  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setIsLoading(false)
        return
      }

      try {
        // Load user's materials
        const { materials: userMaterials } = await getMaterialsByAuthor(user.id, undefined, 50)
        setMaterials(userMaterials)

        // Load communities count
        const communities = await getUserCommunities(user.id)
        setCommunitiesCount(communities.length)
      } catch (error) {
        console.error('Error loading analytics:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [user])

  if (!user) {
    return (
      <div className="container mx-auto py-12 text-center">
        <p>{text.loginRequired}</p>
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

  const stats = {
    totalViews: user.stats?.totalViews || 0,
    totalLikes: user.stats?.totalLikes || 0,
    totalMaterials: user.stats?.materialsCount || 0,
    totalFollowers: user.stats?.followersCount || 0,
  }

  // Calculate materials by type
  const materialsByType: Record<string, number> = {}
  materials.forEach(m => {
    materialsByType[m.type] = (materialsByType[m.type] || 0) + 1
  })

  // Calculate materials by subject
  const materialsBySubject: Record<string, { count: number; views: number; likes: number }> = {}
  materials.forEach(m => {
    if (!materialsBySubject[m.subject]) {
      materialsBySubject[m.subject] = { count: 0, views: 0, likes: 0 }
    }
    materialsBySubject[m.subject].count++
    materialsBySubject[m.subject].views += m.stats?.views || 0
    materialsBySubject[m.subject].likes += m.stats?.likes || 0
  })

  // Sort materials by views for popular list
  const popularMaterials = [...materials]
    .sort((a, b) => (b.stats?.views || 0) - (a.stats?.views || 0))
    .slice(0, 5)

  // Max views for scaling the bars
  const maxViews = Math.max(...materials.map(m => m.stats?.views || 0), 1)

  // Material type labels
  const typeLabels: Record<string, string> = {
    text: language === 'ru' ? 'Текст' : 'Мәтін',
    video: language === 'ru' ? 'Видео' : 'Бейне',
    presentation: language === 'ru' ? 'Презентация' : 'Презентация',
    document: language === 'ru' ? 'Документ' : 'Құжат',
    audio: language === 'ru' ? 'Аудио' : 'Аудио',
    quiz: language === 'ru' ? 'Тест' : 'Тест',
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="h-6 w-6" />
        <h1 className="text-2xl font-bold">{text.title}</h1>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{text.totalViews}</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1 text-green-500" />
              {stats.totalMaterials > 0 ? Math.round(stats.totalViews / stats.totalMaterials) : 0} на материал
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{text.totalLikes}</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLikes.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalViews > 0 ? ((stats.totalLikes / stats.totalViews) * 100).toFixed(1) : 0}% конверсия
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
              {text.published}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{text.followers}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFollowers}</div>
            <p className="text-xs text-muted-foreground">
              {text.level} {user.level}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">{text.overview}</TabsTrigger>
          <TabsTrigger value="materials">{text.materialsTab}</TabsTrigger>
          <TabsTrigger value="audience">{text.audience}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Materials by Type */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{text.materialsBreakdown}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.keys(materialsByType).length > 0 ? (
                  Object.entries(materialsByType).map(([type, count]) => (
                    <div key={type} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{typeLabels[type] || type}</span>
                        <span className="text-muted-foreground">{count}</span>
                      </div>
                      <Progress
                        value={(count / stats.totalMaterials) * 100}
                        className="h-2"
                      />
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    {text.noMaterials}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Materials by Subject */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{text.bySubjects}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.keys(materialsBySubject).length > 0 ? (
                  Object.entries(materialsBySubject)
                    .sort((a, b) => b[1].views - a[1].views)
                    .slice(0, 5)
                    .map(([subject, data]) => (
                      <div key={subject} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="truncate max-w-[200px]">{subject}</span>
                          <span className="text-muted-foreground">
                            {data.views} {text.views}
                          </span>
                        </div>
                        <Progress
                          value={(data.views / maxViews) * 100}
                          className="h-2"
                        />
                      </div>
                    ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    {text.noMaterials}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Views Chart */}
          <Card>
            <CardHeader>
              <CardTitle>{text.viewsBreakdown}</CardTitle>
              <CardDescription>{text.periodDesc}</CardDescription>
            </CardHeader>
            <CardContent>
              {materials.length > 0 ? (
                <div className="space-y-3">
                  {popularMaterials.map((material) => (
                    <div key={material.id} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <Link
                          href={`/materials/${material.id}`}
                          className="truncate max-w-[60%] hover:text-primary"
                        >
                          {material.title}
                        </Link>
                        <div className="flex items-center gap-4 text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {material.stats?.views || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {material.stats?.likes || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" />
                            {material.stats?.comments || 0}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1 h-6">
                        <div
                          className="bg-blue-500 rounded-sm"
                          style={{ width: `${((material.stats?.views || 0) / maxViews) * 100}%` }}
                          title={`${material.stats?.views || 0} ${text.views}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>{text.noMaterials}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="materials" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{text.topMaterials}</CardTitle>
              <CardDescription>{text.popularDesc}</CardDescription>
            </CardHeader>
            <CardContent>
              {materials.length > 0 ? (
                <div className="space-y-4">
                  {popularMaterials.map((material, index) => (
                    <Link
                      key={material.id}
                      href={`/materials/${material.id}`}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{material.title}</p>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <Badge variant="outline">{material.subject}</Badge>
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {material.stats?.views || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {material.stats?.likes || 0}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{text.noMaterials}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audience" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{text.yourAudience}</CardTitle>
              <CardDescription>{text.audienceDesc}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{text.followers}</span>
                  </div>
                  <p className="text-2xl font-bold">{stats.totalFollowers}</p>
                </div>

                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{text.communities}</span>
                  </div>
                  <p className="text-2xl font-bold">{communitiesCount}</p>
                </div>

                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{text.points}</span>
                  </div>
                  <p className="text-2xl font-bold">{user.points}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Level Progress */}
          <Card>
            <CardHeader>
              <CardTitle>{text.level} {user.level}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>{user.points} XP</span>
                  <span className="text-muted-foreground">{user.level * 100} XP</span>
                </div>
                <Progress value={(user.points % 100)} className="h-3" />
                <p className="text-sm text-muted-foreground text-center">
                  {100 - (user.points % 100)} XP до уровня {user.level + 1}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
