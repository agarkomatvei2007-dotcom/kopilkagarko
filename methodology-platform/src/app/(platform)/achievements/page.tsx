'use client'

import { useState, useEffect } from 'react'
import { Award, Lock, Loader2 } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/hooks/useAuth'
import { getAchievements, getUserAchievements } from '@/lib/firebase/firestore'
import { formatDate } from '@/lib/utils'
import type { Achievement, UserAchievement } from '@/types'

export default function AchievementsPage() {
  const { user } = useAuth()
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadAchievements = async () => {
      if (!user) return

      const [allAchievements, userAchs] = await Promise.all([
        getAchievements(),
        getUserAchievements(user.id),
      ])

      setAchievements(allAchievements)
      setUserAchievements(userAchs)
      setIsLoading(false)
    }

    loadAchievements()
  }, [user])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const unlockedIds = userAchievements.map((ua) => ua.achievementId)
  const unlockedCount = userAchievements.length
  const totalCount = achievements.length
  const progress = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0

  const getProgressValue = (achievement: Achievement): number => {
    if (!user) return 0

    switch (achievement.condition.type) {
      case 'materials_count':
        return Math.min(100, (user.stats.materialsCount / achievement.condition.value) * 100)
      case 'likes_received':
        return Math.min(100, (user.stats.totalLikes / achievement.condition.value) * 100)
      case 'followers_count':
        return Math.min(100, (user.stats.followersCount / achievement.condition.value) * 100)
      case 'views_count':
        return Math.min(100, (user.stats.totalViews / achievement.condition.value) * 100)
      default:
        return 0
    }
  }

  const getCurrentValue = (achievement: Achievement): number => {
    if (!user) return 0

    switch (achievement.condition.type) {
      case 'materials_count':
        return user.stats.materialsCount
      case 'likes_received':
        return user.stats.totalLikes
      case 'followers_count':
        return user.stats.followersCount
      case 'views_count':
        return user.stats.totalViews
      default:
        return 0
    }
  }

  return (
    <div className="container mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Award className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold">Достижения</h1>
      </div>

      {/* Progress */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Прогресс достижений</span>
            <span className="text-muted-foreground">
              {unlockedCount} / {totalCount}
            </span>
          </div>
          <Progress value={progress} className="h-3" />
          <p className="text-sm text-muted-foreground mt-2">
            Вы открыли {Math.round(progress)}% всех достижений
          </p>
        </CardContent>
      </Card>

      {/* Achievements grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map((achievement) => {
          const isUnlocked = unlockedIds.includes(achievement.id)
          const userAchievement = userAchievements.find(
            (ua) => ua.achievementId === achievement.id
          )
          const progressValue = getProgressValue(achievement)
          const currentValue = getCurrentValue(achievement)

          return (
            <Card
              key={achievement.id}
              className={`transition-all ${
                isUnlocked
                  ? 'border-primary bg-primary/5'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div
                    className={`h-14 w-14 rounded-full flex items-center justify-center text-3xl shrink-0 ${
                      isUnlocked ? 'bg-primary/20' : 'bg-muted'
                    }`}
                  >
                    {isUnlocked ? (
                      achievement.icon
                    ) : (
                      <Lock className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{achievement.name}</h3>
                      <Badge variant={isUnlocked ? 'default' : 'secondary'}>
                        +{achievement.points}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {achievement.description}
                    </p>

                    {isUnlocked && userAchievement ? (
                      <p className="text-xs text-primary">
                        Получено {formatDate(userAchievement.unlockedAt.toDate())}
                      </p>
                    ) : (
                      <div>
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Прогресс</span>
                          <span>
                            {currentValue} / {achievement.condition.value}
                          </span>
                        </div>
                        <Progress value={progressValue} className="h-1.5" />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {achievements.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          Достижения еще не настроены
        </div>
      )}
    </div>
  )
}
