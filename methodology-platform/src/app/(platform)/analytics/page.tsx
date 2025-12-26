'use client'

import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Eye, Heart, MessageCircle, Download, Users, FileText } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/hooks/useLanguage'

export default function AnalyticsPage() {
  const { user } = useAuth()
  const { language } = useLanguage()

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
      periodStats: 'Статистика за период',
      periodDesc: 'Просмотры и взаимодействия с вашим контентом',
      chartPlaceholder: 'График будет доступен после накопления данных',
      popularMaterials: 'Популярные материалы',
      popularDesc: 'Ваши самые просматриваемые материалы',
      noMaterials: 'У вас пока нет опубликованных материалов',
      statsHere: 'Статистика по материалам появится здесь',
      yourAudience: 'Ваша аудитория',
      audienceDesc: 'Информация о ваших подписчиках',
      bySubjects: 'По предметам',
      byRegions: 'По регионам',
      dataAvailable: 'Данные будут доступны после получения подписчиков',
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
      periodStats: 'Кезең статистикасы',
      periodDesc: 'Контентіңізбен көрулер мен өзара әрекеттесулер',
      chartPlaceholder: 'Деректер жинақталғаннан кейін график қолжетімді болады',
      popularMaterials: 'Танымал материалдар',
      popularDesc: 'Ең көп қаралған материалдарыңыз',
      noMaterials: 'Сізде әлі жарияланған материалдар жоқ',
      statsHere: 'Материалдар статистикасы осында пайда болады',
      yourAudience: 'Сіздің аудиторияңыз',
      audienceDesc: 'Жазылушыларыңыз туралы ақпарат',
      bySubjects: 'Пәндер бойынша',
      byRegions: 'Аймақтар бойынша',
      dataAvailable: 'Жазылушылар алғаннан кейін деректер қолжетімді болады',
    },
  }

  const text = txt[language]

  if (!user) {
    return (
      <div className="container mx-auto py-12 text-center">
        <p>{text.loginRequired}</p>
      </div>
    )
  }

  const stats = {
    totalViews: user.stats?.totalViews || 0,
    totalLikes: user.stats?.totalLikes || 0,
    totalMaterials: user.stats?.materialsCount || 0,
    totalFollowers: user.stats?.followersCount || 0,
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
              +12% {text.perMonth}
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
              <TrendingUp className="h-3 w-3 inline mr-1 text-green-500" />
              +8% {text.perMonth}
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
              <TrendingUp className="h-3 w-3 inline mr-1 text-green-500" />
              +5 {text.perMonth}
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
          <Card>
            <CardHeader>
              <CardTitle>{text.periodStats}</CardTitle>
              <CardDescription>{text.periodDesc}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>{text.chartPlaceholder}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="materials" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{text.popularMaterials}</CardTitle>
              <CardDescription>{text.popularDesc}</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.totalMaterials === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{text.noMaterials}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {text.statsHere}
                  </p>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">{text.bySubjects}</h4>
                  <div className="text-sm text-muted-foreground">
                    {text.dataAvailable}
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">{text.byRegions}</h4>
                  <div className="text-sm text-muted-foreground">
                    {text.dataAvailable}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
