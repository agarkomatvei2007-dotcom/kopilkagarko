'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Users, Plus, MessageSquare, Globe, Lock, Search, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/hooks/useLanguage'
import { useToast } from '@/hooks/use-toast'
import { getCommunities, getUserCommunities, joinCommunity, leaveCommunity, isCommunityMember } from '@/lib/firebase/firestore'
import type { Community } from '@/lib/firebase/firestore'

export default function CommunitiesPage() {
  const { user } = useAuth()
  const { language } = useLanguage()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('discover')
  const [searchQuery, setSearchQuery] = useState('')
  const [allCommunities, setAllCommunities] = useState<Community[]>([])
  const [myCommunities, setMyCommunities] = useState<Community[]>([])
  const [managedCommunities, setManagedCommunities] = useState<Community[]>([])
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [joiningId, setJoiningId] = useState<string | null>(null)

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
      leave: 'Выйти',
      noJoined: 'Вы ещё не вступили ни в одно сообщество',
      findCommunities: 'Найти сообщества',
      noManaged: 'Вы ещё не создали ни одного сообщества',
      noCommunities: 'Сообществ пока нет',
      noCommunitiesDescription: 'Станьте первым, кто создаст сообщество',
      joined: 'Вы вступили в сообщество',
      left: 'Вы вышли из сообщества',
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
      leave: 'Шығу',
      noJoined: 'Сіз әлі бірде-бір қауымдастыққа қосылған жоқсыз',
      findCommunities: 'Қауымдастықтарды табу',
      noManaged: 'Сіз әлі бірде-бір қауымдастық құрған жоқсыз',
      noCommunities: 'Қауымдастықтар әлі жоқ',
      noCommunitiesDescription: 'Алғашқы қауымдастықты құрыңыз',
      joined: 'Сіз қауымдастыққа қосылдыңыз',
      left: 'Сіз қауымдастықтан шықтыңыз',
    },
  }

  const text = txt[language]

  useEffect(() => {
    const loadCommunities = async () => {
      try {
        const communities = await getCommunities({}, 50)
        setAllCommunities(communities)

        if (user) {
          // Get communities where user is a member
          const userCommunities = await getUserCommunities(user.id)
          setMyCommunities(userCommunities)
          setJoinedIds(new Set(userCommunities.map(c => c.id)))

          // Get communities where user is the owner
          setManagedCommunities(communities.filter(c => c.ownerId === user.id))
        }
      } catch (error) {
        console.error('Error loading communities:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadCommunities()
  }, [user])

  const handleJoin = async (communityId: string) => {
    if (!user) return
    setJoiningId(communityId)

    try {
      await joinCommunity(communityId, user.id)
      setJoinedIds(prev => new Set([...prev, communityId]))

      // Update communities list
      const community = allCommunities.find(c => c.id === communityId)
      if (community) {
        setMyCommunities(prev => [...prev, community])
        setAllCommunities(prev =>
          prev.map(c => c.id === communityId ? { ...c, membersCount: c.membersCount + 1 } : c)
        )
      }

      toast({ title: text.joined })
    } catch (error) {
      console.error('Error joining community:', error)
    } finally {
      setJoiningId(null)
    }
  }

  const handleLeave = async (communityId: string) => {
    if (!user) return
    setJoiningId(communityId)

    try {
      await leaveCommunity(communityId, user.id)
      setJoinedIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(communityId)
        return newSet
      })
      setMyCommunities(prev => prev.filter(c => c.id !== communityId))
      setAllCommunities(prev =>
        prev.map(c => c.id === communityId ? { ...c, membersCount: Math.max(0, c.membersCount - 1) } : c)
      )
      toast({ title: text.left })
    } catch (error) {
      console.error('Error leaving community:', error)
    } finally {
      setJoiningId(null)
    }
  }

  const filteredCommunities = allCommunities.filter(c => {
    return c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           c.description.toLowerCase().includes(searchQuery.toLowerCase())
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const renderCommunityCard = (community: Community, showJoinButton = true) => {
    const isJoined = joinedIds.has(community.id)
    const isOwner = user?.id === community.ownerId

    return (
      <Card key={community.id} className="hover:shadow-md transition-shadow">
        <Link href={`/communities/${community.id}`}>
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
                <Badge variant="outline" className="mt-1">
                  {community.subject}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-2">
            <CardDescription className="line-clamp-2">
              {community.description}
            </CardDescription>
          </CardContent>
        </Link>
        <CardFooter className="pt-2 flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {community.membersCount.toLocaleString()} {text.members}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              {community.postsCount} {text.posts}
            </span>
          </div>
          {showJoinButton && !isOwner && (
            <Button
              size="sm"
              variant={isJoined ? 'outline' : 'default'}
              onClick={(e) => {
                e.preventDefault()
                isJoined ? handleLeave(community.id) : handleJoin(community.id)
              }}
              disabled={joiningId === community.id}
            >
              {joiningId === community.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isJoined ? (
                text.leave
              ) : (
                text.join
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{text.title}</h1>
        <Link href="/communities/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {text.createCommunity}
          </Button>
        </Link>
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

          {filteredCommunities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCommunities.map((community) => renderCommunityCard(community))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="font-medium mb-2">{text.noCommunities}</p>
              <p className="text-muted-foreground mb-4">{text.noCommunitiesDescription}</p>
              <Link href="/communities/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  {text.createCommunity}
                </Button>
              </Link>
            </div>
          )}
        </TabsContent>

        <TabsContent value="joined" className="mt-6">
          {myCommunities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myCommunities.map((community) => renderCommunityCard(community))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">{text.noJoined}</p>
              <Button variant="outline" onClick={() => setActiveTab('discover')}>
                {text.findCommunities}
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="managed" className="mt-6">
          {managedCommunities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {managedCommunities.map((community) => renderCommunityCard(community, false))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">{text.noManaged}</p>
              <Link href="/communities/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  {text.createCommunity}
                </Button>
              </Link>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
