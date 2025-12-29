'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Heart,
  MessageCircle,
  Eye,
  Download,
  FolderPlus,
  Share2,
  MoreHorizontal,
  FileText,
  Video,
  FileImage,
  FileAudio,
  HelpCircle,
  Check,
  Plus,
  Loader2,
} from 'lucide-react'

import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/hooks/useLanguage'
import { useToast } from '@/hooks/use-toast'
import { toggleLike, isLikedByUser, getUserCollections, addToCollection } from '@/lib/firebase/firestore'
import { formatNumber, formatRelativeTime, getInitials, truncate } from '@/lib/utils'
import type { Material, MaterialType, Collection } from '@/types'
import { MATERIAL_TYPE_LABELS, DIFFICULTY_LABELS } from '@/types'

const typeIcons: Record<MaterialType, React.ReactNode> = {
  text: <FileText className="h-4 w-4" />,
  video: <Video className="h-4 w-4" />,
  presentation: <FileImage className="h-4 w-4" />,
  document: <FileText className="h-4 w-4" />,
  audio: <FileAudio className="h-4 w-4" />,
  quiz: <HelpCircle className="h-4 w-4" />,
}

interface MaterialCardProps {
  material: Material
  showAuthor?: boolean
}

export default function MaterialCard({ material, showAuthor = true }: MaterialCardProps) {
  const { user } = useAuth()
  const { language } = useLanguage()
  const { toast } = useToast()
  const router = useRouter()
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(material.stats.likes)
  const [isLikeLoading, setIsLikeLoading] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [collectionDialogOpen, setCollectionDialogOpen] = useState(false)
  const [collections, setCollections] = useState<Collection[]>([])
  const [collectionsLoading, setCollectionsLoading] = useState(false)
  const [addingToCollection, setAddingToCollection] = useState<string | null>(null)

  const txt = {
    ru: {
      addToCollection: 'В коллекцию',
      selectCollection: 'Выберите коллекцию',
      selectCollectionDesc: 'Добавить материал в одну из ваших коллекций',
      noCollections: 'У вас нет коллекций',
      createFirst: 'Создайте первую коллекцию в разделе "Коллекции"',
      added: 'Добавлено в коллекцию',
      alreadyInCollection: 'Уже в коллекции',
      error: 'Ошибка',
      download: 'Скачать',
    },
    kk: {
      addToCollection: 'Жинаққа',
      selectCollection: 'Жинақты таңдаңыз',
      selectCollectionDesc: 'Материалды жинақтарыңыздың біріне қосу',
      noCollections: 'Сізде жинақтар жоқ',
      createFirst: '"Жинақтар" бөлімінде алғашқы жинақты жасаңыз',
      added: 'Жинаққа қосылды',
      alreadyInCollection: 'Жинақта бар',
      error: 'Қате',
      download: 'Жүктеу',
    },
  }
  const text = txt[language]

  // Check if user liked this material
  useEffect(() => {
    if (user) {
      isLikedByUser(material.id, user.id).then(setLiked)
    }
  }, [user, material.id])

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!user || isLikeLoading) return

    setIsLikeLoading(true)
    try {
      const isNowLiked = await toggleLike(material.id, user.id)
      setLiked(isNowLiked)
      setLikesCount(prev => isNowLiked ? prev + 1 : prev - 1)
    } finally {
      setIsLikeLoading(false)
    }
  }

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const url = `${window.location.origin}/materials/${material.id}`
    try {
      if (navigator.share) {
        await navigator.share({
          title: material.title,
          text: material.description,
          url,
        })
      } else {
        await navigator.clipboard.writeText(url)
        toast({ title: language === 'ru' ? 'Ссылка скопирована' : 'Сілтеме көшірілді' })
      }
    } catch (error) {
      // User cancelled share or error occurred
      console.log('Share cancelled or failed')
    }
  }

  const openCollectionDialog = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) return

    setCollectionDialogOpen(true)
    setCollectionsLoading(true)
    try {
      const userCollections = await getUserCollections(user.id)
      setCollections(userCollections)
    } catch (error) {
      console.error('Error loading collections:', error)
    } finally {
      setCollectionsLoading(false)
    }
  }

  const handleAddToCollection = async (collectionId: string) => {
    if (!user) return

    const collection = collections.find(c => c.id === collectionId)
    if (collection?.materialIds?.includes(material.id)) {
      toast({ title: text.alreadyInCollection })
      return
    }

    setAddingToCollection(collectionId)
    try {
      await addToCollection(collectionId, material.id)
      setCollections(collections.map(c =>
        c.id === collectionId
          ? { ...c, materialIds: [...(c.materialIds || []), material.id], materialsCount: (c.materialsCount || 0) + 1 }
          : c
      ))
      toast({ title: text.added })
    } catch (error) {
      console.error('Error adding to collection:', error)
      toast({ title: text.error, variant: 'destructive' })
    } finally {
      setAddingToCollection(null)
    }
  }

  return (
    <Link href={`/materials/${material.id}`}>
      <Card className="h-full hover:shadow-md transition-shadow overflow-hidden group">
        {/* Thumbnail */}
        <div className="relative aspect-video bg-muted">
          {material.thumbnail && material.thumbnail.length > 0 && !imageError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={material.thumbnail}
              alt={material.title}
              className="absolute inset-0 w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
              {typeIcons[material.type]}
            </div>
          )}
          <div className="absolute top-2 left-2 flex gap-2">
            <Badge variant="secondary" className="gap-1">
              {typeIcons[material.type]}
              {MATERIAL_TYPE_LABELS[material.type]}
            </Badge>
          </div>
          {material.isPremium && (
            <Badge className="absolute top-2 right-2" variant="default">
              PRO
            </Badge>
          )}
        </div>

        <CardContent className="p-4">
          {/* Title and description */}
          <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors mb-1">
            {material.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {truncate(material.description, 100)}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-3">
            <Badge variant="outline" className="text-xs">
              {material.subject}
            </Badge>
            {material.grades.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {material.grades.length === 1
                  ? `${material.grades[0]} курс`
                  : `${material.grades[0]}-${material.grades[material.grades.length - 1]} курс`}
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              {DIFFICULTY_LABELS[material.difficulty]}
            </Badge>
          </div>

          {/* Author */}
          {showAuthor && (
            <div
              className="flex items-center gap-2 hover:opacity-80 cursor-pointer"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                router.push(`/profile/${material.authorUsername || material.authorId}`)
              }}
            >
              <Avatar className="h-6 w-6">
                <AvatarImage src={material.authorAvatar || undefined} />
                <AvatarFallback className="text-xs">
                  {getInitials(material.authorName)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">
                {material.authorName}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatRelativeTime(material.createdAt.toDate())}
              </span>
            </div>
          )}
        </CardContent>

        <CardFooter className="p-4 pt-0 flex items-center justify-between">
          {/* Stats */}
          <div className="flex items-center gap-4 text-muted-foreground">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 text-sm hover:text-primary transition-colors ${
                liked ? 'text-red-500' : ''
              }`}
            >
              <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
              {formatNumber(likesCount)}
            </button>
            <span className="flex items-center gap-1 text-sm">
              <MessageCircle className="h-4 w-4" />
              {formatNumber(material.stats.comments)}
            </span>
            <span className="flex items-center gap-1 text-sm">
              <Eye className="h-4 w-4" />
              {formatNumber(material.stats.views)}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => e.preventDefault()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={openCollectionDialog}>
                  <FolderPlus className="h-4 w-4 mr-2" />
                  {text.addToCollection}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="h-4 w-4 mr-2" />
                  {text.download}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardFooter>
      </Card>

      {/* Collection Dialog */}
      <Dialog open={collectionDialogOpen} onOpenChange={setCollectionDialogOpen}>
        <DialogContent className="sm:max-w-md" onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>{text.selectCollection}</DialogTitle>
            <DialogDescription>{text.selectCollectionDesc}</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {collectionsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : collections.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>{text.noCollections}</p>
                <p className="text-sm mt-1">{text.createFirst}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {collections.map((collection) => {
                  const isInCollection = collection.materialIds?.includes(material.id)
                  const isAdding = addingToCollection === collection.id
                  return (
                    <button
                      key={collection.id}
                      onClick={() => handleAddToCollection(collection.id)}
                      disabled={isAdding || isInCollection}
                      className="w-full flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors disabled:opacity-50"
                    >
                      <div className="flex items-center gap-3">
                        <FolderPlus className="h-5 w-5 text-primary" />
                        <div className="text-left">
                          <p className="font-medium">{collection.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {collection.materialsCount || 0} {language === 'ru' ? 'материалов' : 'материал'}
                          </p>
                        </div>
                      </div>
                      {isAdding ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : isInCollection ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : (
                        <Plus className="h-5 w-5" />
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Link>
  )
}
