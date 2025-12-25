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

// Placeholder data for demonstration
const sampleCommunities = [
  {
    id: '1',
    name: 'Преподаватели информатики СПО',
    description: 'Сообщество для обмена опытом преподавания информатики и ИТ-дисциплин в колледжах',
    members: 1234,
    posts: 567,
    isPublic: true,
    subject: 'Информатика',
    avatar: null,
  },
  {
    id: '2',
    name: 'Экономические дисциплины',
    description: 'Методические разработки по экономике, бухучёту и менеджменту',
    members: 2341,
    posts: 891,
    isPublic: true,
    subject: 'Экономика организации',
    avatar: null,
  },
  {
    id: '3',
    name: 'Демонстрационный экзамен',
    description: 'Подготовка студентов к демонстрационному экзамену по стандартам WorldSkills',
    members: 3456,
    posts: 1234,
    isPublic: true,
    subject: 'Другое',
    avatar: null,
  },
  {
    id: '4',
    name: 'Программирование и веб-разработка',
    description: 'Методики преподавания программирования в СПО',
    members: 876,
    posts: 234,
    isPublic: true,
    subject: 'Программирование',
    avatar: null,
  },
]

export default function CommunitiesPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('discover')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredCommunities = sampleCommunities.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Сообщества</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Создать сообщество
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="discover">Обзор</TabsTrigger>
          <TabsTrigger value="joined">Мои сообщества</TabsTrigger>
          <TabsTrigger value="managed">Я управляю</TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="mt-6">
          <div className="flex gap-2 mb-6">
            <Input
              placeholder="Поиск сообществ..."
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
                        {community.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {community.name}
                        {community.isPublic ? (
                          <Globe className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        )}
                      </CardTitle>
                      <Badge variant="outline" className="mt-1">{community.subject}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <CardDescription className="line-clamp-2">
                    {community.description}
                  </CardDescription>
                </CardContent>
                <CardFooter className="pt-2 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {community.members.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      {community.posts}
                    </span>
                  </div>
                  <Button size="sm">Вступить</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="joined" className="mt-6">
          <div className="text-center py-12">
            <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Вы ещё не вступили ни в одно сообщество</p>
            <Button variant="outline" onClick={() => setActiveTab('discover')}>
              Найти сообщества
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="managed" className="mt-6">
          <div className="text-center py-12">
            <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Вы ещё не создали ни одного сообщества</p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Создать сообщество
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
