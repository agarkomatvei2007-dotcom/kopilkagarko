'use client'

import { useState, useEffect } from 'react'
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
  Loader2,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/hooks/useLanguage'
import { useToast } from '@/hooks/use-toast'
import {
  getCommunity,
  getCommunityPosts,
  joinCommunity,
  leaveCommunity,
  isCommunityMember,
  createCommunityPost,
  getUser,
} from '@/lib/firebase/firestore'
import type { Community, CommunityPost } from '@/lib/firebase/firestore'
import { getInitials, formatRelativeTime } from '@/lib/utils'
import type { User } from '@/types'

export default function CommunityDetailPage() {
  const params = useParams()
  const { user } = useAuth()
  const { language } = useLanguage()
  const { toast } = useToast()

  const [community, setCommunity] = useState<Community | null>(null)
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [owner, setOwner] = useState<User | null>(null)
  const [isMember, setIsMember] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isJoining, setIsJoining] = useState(false)
  const [isPosting, setIsPosting] = useState(false)
  const [newPost, setNewPost] = useState('')

  const txt = {
    ru: {
      back: 'Назад к сообществам',
      members: 'участников',
      posts: 'записей',
      join: 'Вступить',
      leave: 'Выйти',
      joined: 'Вы вступили в сообщество!',
      left: 'Вы покинули сообщество',
      postsTab: 'Записи',
      materialsTab: 'Материалы',
      membersTab: 'Участники',
      writeSomething: 'Напишите что-нибудь...',
      publish: 'Опубликовать',
      published: 'Запись опубликована!',
      share: 'Поделиться',
      admin: 'Администратор',
      rules: 'Правила сообщества',
      noRules: 'Правила не установлены',
      materialsPlaceholder: 'Материалы сообщества появятся здесь',
      membersPlaceholder: 'Список участников появится здесь',
      notFound: 'Сообщество не найдено',
      noPosts: 'Записей пока нет',
      beFirst: 'Станьте первым, кто напишет!',
      loginToJoin: 'Войдите, чтобы вступить',
      loginToPost: 'Войдите, чтобы писать',
    },
    kk: {
      back: 'Қауымдастықтарға оралу',
      members: 'мүше',
      posts: 'жазба',
      join: 'Қосылу',
      leave: 'Шығу',
      joined: 'Сіз қауымдастыққа қосылдыңыз!',
      left: 'Сіз қауымдастықтан шықтыңыз',
      postsTab: 'Жазбалар',
      materialsTab: 'Материалдар',
      membersTab: 'Мүшелер',
      writeSomething: 'Бірдеңе жазыңыз...',
      publish: 'Жариялау',
      published: 'Жазба жарияланды!',
      share: 'Бөлісу',
      admin: 'Әкімші',
      rules: 'Қауымдастық ережелері',
      noRules: 'Ережелер белгіленбеген',
      materialsPlaceholder: 'Қауымдастық материалдары осында пайда болады',
      membersPlaceholder: 'Мүшелер тізімі осында пайда болады',
      notFound: 'Қауымдастық табылмады',
      noPosts: 'Жазбалар әлі жоқ',
      beFirst: 'Бірінші болып жазыңыз!',
      loginToJoin: 'Қосылу үшін кіріңіз',
      loginToPost: 'Жазу үшін кіріңіз',
    },
  }

  const text = txt[language]

  useEffect(() => {
    const loadCommunity = async () => {
      if (!params.id) return

      try {
        const communityId = params.id as string
        const communityData = await getCommunity(communityId)

        if (!communityData) {
          setIsLoading(false)
          return
        }

        setCommunity(communityData)

        // Load posts
        const communityPosts = await getCommunityPosts(communityId)
        setPosts(communityPosts)

        // Load owner info
        if (communityData.ownerId) {
          const ownerData = await getUser(communityData.ownerId)
          setOwner(ownerData)
        }

        // Check if user is member
        if (user) {
          const member = await isCommunityMember(communityId, user.id)
          setIsMember(member)
        }
      } catch (error) {
        console.error('Error loading community:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadCommunity()
  }, [params.id, user])

  const handleJoin = async () => {
    if (!user) {
      toast({ title: text.loginToJoin, variant: 'destructive' })
      return
    }
    if (!community) return

    setIsJoining(true)
    try {
      await joinCommunity(community.id, user.id)
      setIsMember(true)
      setCommunity(prev => prev ? { ...prev, membersCount: prev.membersCount + 1 } : null)
      toast({ title: text.joined })
    } catch (error) {
      console.error('Error joining:', error)
    } finally {
      setIsJoining(false)
    }
  }

  const handleLeave = async () => {
    if (!user || !community) return

    setIsJoining(true)
    try {
      await leaveCommunity(community.id, user.id)
      setIsMember(false)
      setCommunity(prev => prev ? { ...prev, membersCount: Math.max(0, prev.membersCount - 1) } : null)
      toast({ title: text.left })
    } catch (error) {
      console.error('Error leaving:', error)
    } finally {
      setIsJoining(false)
    }
  }

  const handleCreatePost = async () => {
    if (!user) {
      toast({ title: text.loginToPost, variant: 'destructive' })
      return
    }
    if (!newPost.trim() || !community) return

    setIsPosting(true)
    try {
      await createCommunityPost(community.id, {
        authorId: user.id,
        authorName: user.displayName,
        authorAvatar: user.avatar,
        content: newPost.trim(),
        images: [],
      })

      // Reload posts
      const updatedPosts = await getCommunityPosts(community.id)
      setPosts(updatedPosts)
      setCommunity(prev => prev ? { ...prev, postsCount: prev.postsCount + 1 } : null)

      setNewPost('')
      toast({ title: text.published })
    } catch (error) {
      console.error('Error creating post:', error)
    } finally {
      setIsPosting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!community) {
    return (
      <div className="container mx-auto py-6 px-4">
        <Link href="/communities">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {text.back}
          </Button>
        </Link>
        <div className="text-center py-12">
          <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">{text.notFound}</p>
        </div>
      </div>
    )
  }

  const isOwner = user?.id === community.ownerId

  return (
    <div className="container mx-auto py-6 px-4">
      <Link href="/communities">
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {text.back}
        </Button>
      </Link>

      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-6 mb-6">
        <div className="flex flex-col md:flex-row items-start gap-4">
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
                {community.membersCount.toLocaleString()} {text.members}
              </span>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                {community.postsCount} {text.posts}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            {isOwner ? (
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            ) : isMember ? (
              <Button variant="outline" onClick={handleLeave} disabled={isJoining}>
                {isJoining ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <UserMinus className="h-4 w-4 mr-2" />
                )}
                {text.leave}
              </Button>
            ) : (
              <Button onClick={handleJoin} disabled={isJoining}>
                {isJoining ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <UserPlus className="h-4 w-4 mr-2" />
                )}
                {text.join}
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
              <TabsTrigger value="posts">{text.postsTab}</TabsTrigger>
              <TabsTrigger value="materials">{text.materialsTab}</TabsTrigger>
              <TabsTrigger value="members">{text.membersTab}</TabsTrigger>
            </TabsList>

            <TabsContent value="posts" className="space-y-4">
              {/* Create post */}
              {isMember && (
                <Card>
                  <CardContent className="pt-4">
                    <Textarea
                      placeholder={text.writeSomething}
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                      className="mb-2"
                    />
                    <div className="flex justify-end">
                      <Button
                        onClick={handleCreatePost}
                        disabled={!newPost.trim() || isPosting}
                      >
                        {isPosting ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Send className="h-4 w-4 mr-2" />
                        )}
                        {text.publish}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Posts list */}
              {posts.length > 0 ? (
                posts.map((post) => (
                  <Card key={post.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <Link
                          href={`/profile/${post.authorId}`}
                          className="flex items-center gap-3 hover:opacity-80"
                        >
                          <Avatar>
                            <AvatarImage src={post.authorAvatar || undefined} />
                            <AvatarFallback>{getInitials(post.authorName)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{post.authorName}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatRelativeTime(post.createdAt.toDate())}
                            </p>
                          </div>
                        </Link>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-4 whitespace-pre-wrap">{post.content}</p>
                      {post.images && post.images.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          {post.images.map((img, idx) => (
                            <img
                              key={idx}
                              src={img}
                              alt=""
                              className="rounded-lg object-cover w-full h-48"
                            />
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm">
                          <Heart className="h-4 w-4 mr-1" />
                          {post.likes}
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          {post.comments}
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share2 className="h-4 w-4 mr-1" />
                          {text.share}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="font-medium">{text.noPosts}</p>
                    <p className="text-sm">{text.beFirst}</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="materials">
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{text.materialsPlaceholder}</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="members">
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{text.membersPlaceholder}</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{text.admin}</CardTitle>
            </CardHeader>
            <CardContent>
              <Link
                href={`/profile/${community.ownerId}`}
                className="flex items-center gap-2 hover:opacity-80"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={owner?.avatar || undefined} />
                  <AvatarFallback>{getInitials(community.ownerName)}</AvatarFallback>
                </Avatar>
                <span className="text-sm">{community.ownerName}</span>
              </Link>
            </CardContent>
          </Card>

          {community.tags && community.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{text.rules}</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2 text-sm">
                  {community.tags.map((tag, index) => (
                    <li key={index}>
                      <Badge variant="secondary">{tag}</Badge>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
