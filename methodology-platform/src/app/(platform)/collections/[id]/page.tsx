'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Folder, Lock, Globe, MoreVertical, Trash2, Edit, Eye, Heart } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'
import { getCollection, getMaterial, removeFromCollection } from '@/lib/firebase/firestore'
import { GRADE_LABELS } from '@/types'
import type { Collection, Material } from '@/types'

export default function CollectionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const collectionId = params.id as string

  const [collection, setCollection] = useState<Collection | null>(null)
  const [materials, setMaterials] = useState<Material[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false)
  const [materialToRemove, setMaterialToRemove] = useState<string | null>(null)

  useEffect(() => {
    loadCollection()
  }, [collectionId])

  const loadCollection = async () => {
    try {
      const data = await getCollection(collectionId)
      if (!data) {
        toast({ title: 'Коллекция не найдена', variant: 'destructive' })
        router.push('/collections')
        return
      }

      setCollection(data)

      // Load materials in collection
      const materialPromises = data.materialIds.map(id => getMaterial(id))
      const materialResults = await Promise.all(materialPromises)
      setMaterials(materialResults.filter((m): m is Material => m !== null))
    } catch (error) {
      console.error('Error loading collection:', error)
      toast({ title: 'Ошибка загрузки', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveMaterial = async () => {
    if (!materialToRemove || !collection) return

    try {
      await removeFromCollection(collectionId, materialToRemove)
      setMaterials(materials.filter(m => m.id !== materialToRemove))
      setCollection({
        ...collection,
        materialIds: collection.materialIds.filter(id => id !== materialToRemove),
        materialsCount: collection.materialsCount - 1,
      })
      toast({ title: 'Материал удалён из коллекции' })
    } catch (error) {
      console.error('Error removing material:', error)
      toast({ title: 'Ошибка', variant: 'destructive' })
    } finally {
      setRemoveDialogOpen(false)
      setMaterialToRemove(null)
    }
  }

  const isOwner = user && collection && user.id === collection.ownerId

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!collection) {
    return null
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/collections">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Folder className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">{collection.name}</h1>
            {collection.isPublic ? (
              <Globe className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Lock className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          {collection.description && (
            <p className="text-muted-foreground mt-1">{collection.description}</p>
          )}
        </div>
        {isOwner && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit className="h-4 w-4 mr-2" />
                Редактировать
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Удалить
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="flex items-center gap-4 mb-6">
        <Avatar className="h-8 w-8">
          <AvatarFallback>{collection.ownerName[0]}</AvatarFallback>
        </Avatar>
        <span className="text-sm text-muted-foreground">{collection.ownerName}</span>
        <Badge variant="secondary">{collection.materialsCount} материал(ов)</Badge>
      </div>

      {materials.length === 0 ? (
        <div className="text-center py-12">
          <Folder className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">В этой коллекции пока нет материалов</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {materials.map((material) => (
            <Card key={material.id} className="relative">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <Badge variant="outline">{material.subject}</Badge>
                  {isOwner && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => {
                            setMaterialToRemove(material.id)
                            setRemoveDialogOpen(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Убрать из коллекции
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <Link href={`/materials/${material.id}`}>
                  <h3 className="font-semibold line-clamp-2 mb-2 hover:text-primary">
                    {material.title}
                  </h3>
                </Link>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {material.description}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {material.grades.slice(0, 3).map((grade) => (
                    <Badge key={grade} variant="outline" className="text-xs">
                      {GRADE_LABELS[grade]}
                    </Badge>
                  ))}
                  {material.grades.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{material.grades.length - 3}
                    </Badge>
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-2 flex items-center justify-between text-muted-foreground text-sm">
                <div className="flex items-center gap-2">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={material.authorAvatar || undefined} />
                    <AvatarFallback className="text-xs">{material.authorName[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs">{material.authorName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {material.stats.views}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    {material.stats.likes}
                  </span>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Убрать из коллекции?</AlertDialogTitle>
            <AlertDialogDescription>
              Материал будет удалён из этой коллекции, но останется на платформе.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveMaterial}>
              Убрать
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
