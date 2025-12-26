'use client'

import { useState, useEffect } from 'react'
import { collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '@/lib/firebase/config'
import { Loader2, Filter } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import MaterialCard from '@/components/materials/MaterialCard'
import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/hooks/useLanguage'
import { getFollowing } from '@/lib/firebase/firestore'
import type { Material } from '@/types'

export default function FeedPage() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [materials, setMaterials] = useState<Material[]>([])
  const [followingMaterials, setFollowingMaterials] = useState<Material[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    if (!isFirebaseConfigured || !db) {
      setIsLoading(false)
      return
    }

    const q = query(
      collection(db, 'materials'),
      where('isPublic', '==', true),
      orderBy('createdAt', 'desc'),
      limit(50)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Material))
      setMaterials(data)
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (!user || !isFirebaseConfigured || !db) return

    const database = db

    const loadFollowingMaterials = async () => {
      try {
        const following = await getFollowing(user.id)
        if (following.length === 0) {
          setFollowingMaterials([])
          return
        }

        const q = query(
          collection(database, 'materials'),
          where('authorId', 'in', following.slice(0, 10)),
          where('isPublic', '==', true),
          orderBy('createdAt', 'desc'),
          limit(30)
        )

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Material))
          setFollowingMaterials(data)
        })

        return () => unsubscribe()
      } catch (error) {
        console.error('Error loading following materials:', error)
      }
    }

    loadFollowingMaterials()
  }, [user])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t.pages.feed.title}</h1>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="h-4 w-4" />
          {t.pages.feed.filters}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">{t.pages.feed.allMaterials}</TabsTrigger>
          <TabsTrigger value="following">{t.pages.feed.following}</TabsTrigger>
          <TabsTrigger value="popular">{t.pages.feed.popular}</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {materials.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {t.pages.feed.noMaterials}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {materials.map((material) => (
                <MaterialCard key={material.id} material={material} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="following">
          {followingMaterials.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="mb-2">{t.pages.feed.noFollowing}</p>
              <p className="text-sm">{t.pages.feed.noFollowingHint}</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {followingMaterials.map((material) => (
                <MaterialCard key={material.id} material={material} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="popular">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...materials]
              .sort((a, b) => b.stats.likes - a.stats.likes)
              .map((material) => (
                <MaterialCard key={material.id} material={material} />
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
