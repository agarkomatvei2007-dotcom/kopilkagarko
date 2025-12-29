'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  Calendar,
  MapPin,
  Link as LinkIcon,
  Award,
  Users,
  FileText,
  Eye,
  Heart,
  Settings,
  MessageSquare,
  Loader2,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import MaterialCard from '@/components/materials/MaterialCard'
import { useAuth } from '@/hooks/useAuth'
import {
  getUser,
  getUserByUsername,
  getMaterialsByAuthor,
  isFollowing,
  followUser,
  unfollowUser,
  getUserAchievements,
  getAchievements,
} from '@/lib/firebase/firestore'
import { formatDate, formatNumber, getInitials, calculateLevelProgress } from '@/lib/utils'
import type { User, Material, Achievement, UserAchievement } from '@/types'

export default function ProfilePage() {
  const params = useParams()
  const router = useRouter()
  const username = params.username as string
  const { user: currentUser } = useAuth()

  const [profile, setProfile] = useState<User | null>(null)
  const [materials, setMaterials] = useState<Material[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [following, setFollowing] = useState(false)

  useEffect(() => {
    const loadProfile = async () => {
      // Try to get user by username first, then by ID
      let userData = await getUserByUsername(username)
      if (!userData) {
        userData = await getUser(username)
      }

      if (userData) {
        setProfile(userData)

        // Load materials
        const { materials: userMaterials } = await getMaterialsByAuthor(userData.id, undefined, 20)
        setMaterials(userMaterials)

        // Load achievements
        const allAchievements = await getAchievements()
        const userAchs = await getUserAchievements(userData.id)
        setAchievements(allAchievements)
        setUserAchievements(userAchs)

        // Check if following
        if (currentUser && currentUser.id !== userData.id) {
          const isFollowingUser = await isFollowing(currentUser.id, userData.id)
          setFollowing(isFollowingUser)
        }
      }

      setIsLoading(false)
    }

    loadProfile()
  }, [username, currentUser])

  const handleFollow = async () => {
    if (!currentUser || !profile) return
    if (following) {
      await unfollowUser(currentUser.id, profile.id)
      setFollowing(false)
      setProfile({
        ...profile,
        stats: {
          ...profile.stats,
          followersCount: profile.stats.followersCount - 1,
        },
      })
    } else {
      await followUser(currentUser.id, profile.id)
      setFollowing(true)
      setProfile({
        ...profile,
        stats: {
          ...profile.stats,
          followersCount: profile.stats.followersCount + 1,
        },
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="container mx-auto py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Пользователь не найден</h1>
      </div>
    )
  }

  const isOwnProfile = currentUser?.id === profile.id
  const levelProgress = calculateLevelProgress(profile.points)

  return (
    <div className="container mx-auto py-6 px-4">
      {/* Profile header */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <Avatar className="h-24 w-24 md:h-32 md:w-32">
              <AvatarImage src={profile.avatar || undefined} />
              <AvatarFallback className="text-2xl">
                {getInitials(profile.displayName)}
              </AvatarFallback>
            </Avatar>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <h1 className="text-2xl font-bold">{profile.displayName}</h1>
                  <p className="text-muted-foreground">@{profile.username}</p>
                </div>

                {isOwnProfile ? (
                  <Button variant="outline" onClick={() => router.push('/settings')}>
                    <Settings className="h-4 w-4 mr-2" />
                    Редактировать
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant={following ? 'outline' : 'default'}
                      onClick={handleFollow}
                    >
                      {following ? 'Отписаться' : 'Подписаться'}
                    </Button>
                    <Button variant="outline">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Написать
                    </Button>
                  </div>
                )}
              </div>

              {/* Bio */}
              {profile.bio && (
                <p className="mt-4 text-muted-foreground">{profile.bio}</p>
              )}

              {/* Meta */}
              <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                {profile.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {profile.location.city}, {profile.location.country}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  На платформе с {formatDate(profile.createdAt.toDate())}
                </span>
              </div>

              {/* Subjects & grades */}
              {(profile.subjects.length > 0 || profile.grades.length > 0) && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {profile.subjects.map((subject) => (
                    <Badge key={subject} variant="secondary">
                      {subject}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Stats */}
              <div className="flex gap-6 mt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">{formatNumber(profile.stats.materialsCount)}</div>
                  <div className="text-sm text-muted-foreground">материалов</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{formatNumber(profile.stats.followersCount)}</div>
                  <div className="text-sm text-muted-foreground">подписчиков</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{formatNumber(profile.stats.followingCount)}</div>
                  <div className="text-sm text-muted-foreground">подписок</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{formatNumber(profile.stats.totalViews)}</div>
                  <div className="text-sm text-muted-foreground">просмотров</div>
                </div>
              </div>
            </div>
          </div>

          {/* Level progress */}
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                <span className="font-semibold">Уровень {profile.level}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {profile.points} очков
              </span>
            </div>
            <Progress value={levelProgress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {100 - levelProgress} очков до следующего уровня
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Content tabs */}
      <Tabs defaultValue="materials">
        <TabsList className="mb-6">
          <TabsTrigger value="materials" className="gap-2">
            <FileText className="h-4 w-4" />
            Материалы ({materials.length})
          </TabsTrigger>
          <TabsTrigger value="achievements" className="gap-2">
            <Award className="h-4 w-4" />
            Достижения ({userAchievements.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="materials">
          {materials.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Пользователь еще не опубликовал материалы
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {materials.map((material) => (
                <MaterialCard key={material.id} material={material} showAuthor={false} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="achievements">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => {
              const isUnlocked = userAchievements.some(
                (ua) => ua.achievementId === achievement.id
              )
              return (
                <Card
                  key={achievement.id}
                  className={!isUnlocked ? 'opacity-50' : ''}
                >
                  <CardContent className="pt-6 flex items-center gap-4">
                    <div
                      className={`h-12 w-12 rounded-full flex items-center justify-center text-2xl ${
                        isUnlocked ? 'bg-primary/20' : 'bg-muted'
                      }`}
                    >
                      {achievement.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold">{achievement.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {achievement.description}
                      </p>
                      <p className="text-xs text-primary mt-1">
                        +{achievement.points} очков
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
