'use client'

import { useState } from 'react'
import { Users, Plus, MessageSquare, Globe, Lock, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/hooks/useLanguage'

// Placeholder data for demonstration
const sampleCommunities = [
  {
    id: '1',
    name: 'Преподаватели информатики СПО',
    nameKk: 'Колледж информатика оқытушылары',
    description: 'Сообщество для обмена опытом преподавания информатики и ИТ-дисциплин в колледжах',
    descriptionKk: 'Колледждерде информатика және IT пәндерін оқыту тәжірибесімен алмасу қауымдастығы',
    members: 1234,
    posts: 567,
    isPublic: true,
    subject: 'Информатика',
    subjectKk: 'Информатика',
    avatar: null,
  },
  {
    id: '2',
    name: 'Экономические дисциплины',
    nameKk: 'Экономикалық пәндер',
    description: 'Методические разработки по экономике, бухучёту и менеджменту',
    descriptionKk: 'Экономика, бухгалтерлік есеп және менеджмент бойынша әдістемелік әзірлемелер',
    members: 2341,
    posts: 891,
    isPublic: true,
    subject: 'Экономика организации',
    subjectKk: 'Ұйым экономикасы',
    avatar: null,
  },
  {
    id: '3',
    name: 'Демонстрационный экзамен',
    nameKk: 'Демонстрациялық емтихан',
    description: 'Подготовка студентов к демонстрационному экзамену по стандартам WorldSkills',
    descriptionKk: 'WorldSkills стандарттары бойынша демонстрациялық емтиханға студенттерді дайындау',
    members: 3456,
    posts: 1234,
    isPublic: true,
    subject: 'Другое',
    subjectKk: 'Басқа',
    avatar: null,
  },
  {
    id: '4',
    name: 'Программирование и веб-разработка',
    nameKk: 'Программалау және веб-әзірлеу',
    description: 'Методики преподавания программирования в СПО',
    descriptionKk: 'Колледжде программалауды оқыту әдістемелері',
    members: 876,
    posts: 234,
    isPublic: true,
    subject: 'Программирование',
    subjectKk: 'Программалау',
    avatar: null,
  },
]

export default function CommunitiesPage() {
  const { user } = useAuth()
  const { language } = useLanguage()
  const [activeTab, setActiveTab] = useState('discover')
  const [searchQuery, setSearchQuery] = useState('')

  const txt = {
    ru: {
      title: 'Сообщества',
      createCommunity: 'Создать сообщество',
      discover: 'Обзор',
      myCommunities: 'Мои сообщества',
      managed: 'Я управляю',
      searchPlaceholder: 'Поиск сообществ...',
      members: 'участников',
      posts: 'публикаций',
      join: 'Вступить',
      noJoined: 'Вы ещё не вступили ни в одно сообщество',
      findCommunities: 'Найти сообщества',
      noManaged: 'Вы ещё не создали ни одного сообщества',
    },
    kk: {
      title: 'Қауымдастықтар',
      createCommunity: 'Қауымдастық құру',
      discover: 'Шолу',
      myCommunities: 'Менің қауымдастықтарым',
      managed: 'Мен басқарамын',
      searchPlaceholder: 'Қауымдастықтарды іздеу...',
      members: 'мүше',
      posts: 'жариялым',
      join: 'Қосылу',
      noJoined: 'Сіз әлі бірде-бір қауымдастыққа қосылған жоқсыз',
      findCommunities: 'Қауымдастықтарды табу',
      noManaged: 'Сіз әлі бірде-бір қауымдастық құрған жоқсыз',
    },
  }

  const text = txt[language]

  const filteredCommunities = sampleCommunities.filter(c => {
    const name = language === 'kk' ? c.nameKk : c.name
    const desc = language === 'kk' ? c.descriptionKk : c.description
    return name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           desc.toLowerCase().includes(searchQuery.toLowerCase())
  })

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{text.title}</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          {text.createCommunity}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="discover">{text.discover}</TabsTrigger>
          <TabsTrigger value="joined">{text.myCommunities}</TabsTrigger>
          <TabsTrigger value="managed">{text.managed}</TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="mt-6">
          <div className="flex gap-2 mb-6">
            <Input
              placeholder={text.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
            <Button variant="outline">
              <Search className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCommunities.map((community) => (
              <Card key={community.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={community.avatar || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {(language === 'kk' ? community.nameKk : community.name)[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {language === 'kk' ? community.nameKk : community.name}
                        {community.isPublic ? (
                          <Globe className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        )}
                      </CardTitle>
                      <Badge variant="outline" className="mt-1">
                        {language === 'kk' ? community.subjectKk : community.subject}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <CardDescription className="line-clamp-2">
                    {language === 'kk' ? community.descriptionKk : community.description}
                  </CardDescription>
                </CardContent>
                <CardFooter className="pt-2 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {community.members.toLocaleString()} {text.members}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      {community.posts} {text.posts}
                    </span>
                  </div>
                  <Button size="sm">{text.join}</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="joined" className="mt-6">
          <div className="text-center py-12">
            <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">{text.noJoined}</p>
            <Button variant="outline" onClick={() => setActiveTab('discover')}>
              {text.findCommunities}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="managed" className="mt-6">
          <div className="text-center py-12">
            <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">{text.noManaged}</p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {text.createCommunity}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
