'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Trophy, Medal, Star, Loader2 } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/hooks/useLanguage'
import { getLeaderboard } from '@/lib/firebase/firestore'
import { formatNumber, getInitials } from '@/lib/utils'
import type { User } from '@/types'

const rankColors = ['text-yellow-500', 'text-gray-400', 'text-amber-600']
const rankIcons = [Trophy, Medal, Medal]

export default function LeaderboardPage() {
  const { user: currentUser } = useAuth()
  const { language } = useLanguage()
  const [pointsLeaders, setPointsLeaders] = useState<User[]>([])
  const [materialsLeaders, setMaterialsLeaders] = useState<User[]>([])
  const [likesLeaders, setLikesLeaders] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const txt = {
    ru: {
      title: 'Рейтинг',
      byPoints: 'По очкам',
      byMaterials: 'По материалам',
      byLikes: 'По лайкам',
      you: 'Вы',
      points: 'очков',
      materials: 'материалов',
      likes: 'лайков',
      level: 'Ур.',
    },
    kk: {
      title: 'Рейтинг',
      byPoints: 'Ұпай бойынша',
      byMaterials: 'Материалдар бойынша',
      byLikes: 'Ұнатулар бойынша',
      you: 'Сіз',
      points: 'ұпай',
      materials: 'материал',
      likes: 'ұнату',
      level: 'Дең.',
    },
  }

  const text = txt[language]

  useEffect(() => {
    const loadLeaderboards = async () => {
      const [points, materials, likes] = await Promise.all([
        getLeaderboard('points', 20),
        getLeaderboard('materials', 20),
        getLeaderboard('likes', 20),
      ])
      setPointsLeaders(points)
      setMaterialsLeaders(materials)
      setLikesLeaders(likes)
      setIsLoading(false)
    }

    loadLeaderboards()
  }, [])

  const renderLeaderboard = (leaders: User[], valueField: 'points' | 'materialsCount' | 'totalLikes') => (
    <div className="space-y-2">
      {leaders.map((leader, index) => {
        const isCurrentUser = currentUser?.id === leader.id
        const RankIcon = index < 3 ? rankIcons[index] : null

        let value: number
        let label: string
        switch (valueField) {
          case 'points':
            value = leader.points
            label = text.points
            break
          case 'materialsCount':
            value = leader.stats.materialsCount
            label = text.materials
            break
          case 'totalLikes':
            value = leader.stats.totalLikes
            label = text.likes
            break
        }

        return (
          <Link key={leader.id} href={`/profile/${leader.username}`}>
            <Card
              className={`hover:shadow-md transition-shadow ${
                isCurrentUser ? 'border-primary bg-primary/5' : ''
              }`}
            >
              <CardContent className="p-4 flex items-center gap-4">
                {/* Rank */}
                <div className="w-8 flex justify-center">
                  {RankIcon ? (
                    <RankIcon className={`h-6 w-6 ${rankColors[index]}`} />
                  ) : (
                    <span className="text-lg font-bold text-muted-foreground">
                      {index + 1}
                    </span>
                  )}
                </div>

                {/* Avatar */}
                <Avatar className="h-10 w-10">
                  <AvatarImage src={leader.avatar || undefined} />
                  <AvatarFallback>{getInitials(leader.displayName)}</AvatarFallback>
                </Avatar>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{leader.displayName}</span>
                    {isCurrentUser && <Badge variant="secondary">{text.you}</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">@{leader.username}</p>
                </div>

                {/* Value */}
                <div className="text-right">
                  <div className="font-bold text-lg">{formatNumber(value)}</div>
                  <div className="text-xs text-muted-foreground">{label}</div>
                </div>

                {/* Level badge */}
                <Badge variant="outline" className="ml-2">
                  {text.level} {leader.level}
                </Badge>
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold">{text.title}</h1>
      </div>

      <Tabs defaultValue="points">
        <TabsList className="mb-6">
          <TabsTrigger value="points" className="gap-2">
            <Star className="h-4 w-4" />
            {text.byPoints}
          </TabsTrigger>
          <TabsTrigger value="materials" className="gap-2">
            {text.byMaterials}
          </TabsTrigger>
          <TabsTrigger value="likes" className="gap-2">
            {text.byLikes}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="points">
          {renderLeaderboard(pointsLeaders, 'points')}
        </TabsContent>

        <TabsContent value="materials">
          {renderLeaderboard(materialsLeaders, 'materialsCount')}
        </TabsContent>

        <TabsContent value="likes">
          {renderLeaderboard(likesLeaders, 'totalLikes')}
        </TabsContent>
      </Tabs>
    </div>
  )
}
