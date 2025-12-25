'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Users,
  Globe,
  Lock,
  MessageSquare,
  Settings,
  UserPlus,
  UserMinus,
  MoreVertical,
  Heart,
  Share2,
  Send,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'

// Demo community data
const communityData = {
  id: '1',
  name: 'Учителя математики',
  description: 'Сообщество для обмена опытом преподавания математики. Делимся методиками, обсуждаем сложные темы, помогаем друг другу с материалами.',
  avatar: null,
  coverImage: null,
  membersCount: 1234,
  postsCount: 567,
  isPublic: true,
  subject: 'Математика',
  createdAt: '2024-01-15',
  admins: [
    { id: '1', name: 'Иванова М.А.', avatar: null },
  ],
  rules: [
    'Уважайте других участников',
    'Публикуйте только релевантный контент',
    'Не размещайте рекламу без согласования',
    'Указывайте источники при использовании чужих материалов',
  ],
}

const posts = [
  {
    id: '1',
    author: { id: '1', name: 'Иванова М.А.', avatar: null },
    content: 'Коллеги, поделитесь опытом: как вы объясняете дроби пятиклассникам? Какие визуальные материалы используете?',
    createdAt: '2 часа назад',
    likes: 24,
    comments: 12,
    liked: false,
  },
  {
    id: '2',
    author: { id: '2', name: 'Петров И.В.', avatar: null },
    content: 'Нашёл отличную интерактивную доску для геометрии. Делюсь ссылкой в комментариях!',
    createdAt: '5 часов назад',
    likes: 45,
    comments: 8,
    liked: true,
  },
  {
    id: '3',
    author: { id: '3', name: 'Сидорова Е.К.', avatar: null },
    content: 'Провела открытый урок по теории вероятностей. Дети были в восторге! Готова поделиться презентацией и планом урока.',
    createdAt: 'Вчера',
    likes: 67,
    comments: 23,
    liked: false,
  },
]

export default function CommunityDetailPage() {
  const params = useParams()
  const { user } = useAuth()
  const { toast } = useToast()
  const [isMember, setIsMember] = useState(false)
  const [newPost, setNewPost] = useState('')
  const [localPosts, setLocalPosts] = useState(posts)

  const community = communityData

  const handleJoin = () => {
    setIsMember(true)
    toast({ title: 'Вы вступили в сообщество!' })
  }

  const handleLeave = () => {
    setIsMember(false)
    toast({ title: 'Вы покинули сообщество' })
  }

  const handleLike = (postId: string) => {
    setLocalPosts(localPosts.map(post =>
      post.id === postId
        ? { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 }
        : post
    ))
  }

  const handleCreatePost = () => {
    if (!newPost.trim()) return

    const post = {
      id: Date.now().toString(),
      author: { id: user?.id || '', name: user?.displayName || 'Вы', avatar: user?.avatar || null },
      content: newPost,
      createdAt: 'Только что',
      likes: 0,
      comments: 0,
      liked: false,
    }

    setLocalPosts([post, ...localPosts])
    setNewPost('')
    toast({ title: 'Запись опубликована!' })
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <Link href="/communities">
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад к сообществам
        </Button>
      </Link>

      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-6 mb-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={community.avatar || undefined} />
            <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
              {community.name[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold">{community.name}</h1>
              {community.isPublic ? (
                <Globe className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Lock className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <p className="text-muted-foreground mb-3">{community.description}</p>
            <div className="flex flex-wrap items-center gap-4">
              <Badge variant="outline">{community.subject}</Badge>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Users className="h-4 w-4" />
                {community.membersCount.toLocaleString()} участников
              </span>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                {community.postsCount} записей
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            {isMember ? (
              <>
                <Button variant="outline" onClick={handleLeave}>
                  <UserMinus className="h-4 w-4 mr-2" />
                  Выйти
                </Button>
                <Button variant="outline" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button onClick={handleJoin}>
                <UserPlus className="h-4 w-4 mr-2" />
                Вступить
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="posts">
            <TabsList className="mb-4">
              <TabsTrigger value="posts">Записи</TabsTrigger>
              <TabsTrigger value="materials">Материалы</TabsTrigger>
              <TabsTrigger value="members">Участники</TabsTrigger>
            </TabsList>

            <TabsContent value="posts" className="space-y-4">
              {/* Create post */}
              {isMember && (
                <Card>
                  <CardContent className="pt-4">
                    <Textarea
                      placeholder="Напишите что-нибудь..."
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                      className="mb-2"
                    />
                    <div className="flex justify-end">
                      <Button onClick={handleCreatePost} disabled={!newPost.trim()}>
                        <Send className="h-4 w-4 mr-2" />
                        Опубликовать
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Posts list */}
              {localPosts.map((post) => (
                <Card key={post.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={post.author.avatar || undefined} />
                          <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{post.author.name}</p>
                          <p className="text-xs text-muted-foreground">{post.createdAt}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">{post.content}</p>
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLike(post.id)}
                        className={post.liked ? 'text-red-500' : ''}
                      >
                        <Heart className={`h-4 w-4 mr-1 ${post.liked ? 'fill-current' : ''}`} />
                        {post.likes}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        {post.comments}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Share2 className="h-4 w-4 mr-1" />
                        Поделиться
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="materials">
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Материалы сообщества появятся здесь</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="members">
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Список участников появится здесь</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Администраторы</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {community.admins.map((admin) => (
                  <div key={admin.id} className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={admin.avatar || undefined} />
                      <AvatarFallback>{admin.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{admin.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Правила сообщества</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2 text-sm">
                {community.rules.map((rule, index) => (
                  <li key={index} className="flex gap-2">
                    <span className="text-muted-foreground">{index + 1}.</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
