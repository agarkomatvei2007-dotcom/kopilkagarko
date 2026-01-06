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
      <Card className="h-full overflow-hidden group modern-card border-0 bg-card/80 backdrop-blur-sm">
        {/* Thumbnail */}
        <div className="relative aspect-video bg-muted overflow-hidden img-zoom">
          {material.thumbnail && material.thumbnail.length > 0 && !imageError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={material.thumbnail}
              alt={material.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/30 via-accent/20 to-primary/10">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-primary">
                {typeIcons[material.type]}
              </div>
            </div>
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <div className="absolute top-3 left-3 flex gap-2">
            <Badge variant="secondary" className="gap-1.5 bg-white/90 dark:bg-black/70 backdrop-blur-md border-0 shadow-lg px-2.5 py-1">
              {typeIcons[material.type]}
              <span className="font-medium">{MATERIAL_TYPE_LABELS[material.type]}</span>
            </Badge>
          </div>
          {material.isPremium && (
            <Badge className="absolute top-3 right-3 bg-gradient-to-r from-amber-500 to-orange-500 border-0 shadow-lg px-3 py-1">
              <span className="font-semibold">PRO</span>
            </Badge>
          )}

          {/* Difficulty indicator */}
          <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
            <Badge
              variant="secondary"
              className={`backdrop-blur-md border-0 shadow-lg px-2.5 py-1 ${
                material.difficulty === 'easy' ? 'bg-green-500/90 text-white' :
                material.difficulty === 'medium' ? 'bg-amber-500/90 text-white' :
                'bg-red-500/90 text-white'
              }`}
            >
              {DIFFICULTY_LABELS[material.difficulty]}
            </Badge>
          </div>
        </div>

        <CardContent className="p-4 space-y-3">
          {/* Title and description */}
          <div>
            <h3 className="font-semibold text-base line-clamp-2 group-hover:text-primary transition-colors duration-200">
              {material.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1.5 leading-relaxed">
              {truncate(material.description, 100)}
            </p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="outline" className="text-xs bg-primary/5 border-primary/20 text-primary hover:bg-primary/10 transition-colors">
              {material.subject}
            </Badge>
            {material.grades.length > 0 && (
              <Badge variant="outline" className="text-xs bg-accent/5 border-accent/20 text-accent hover:bg-accent/10 transition-colors">
                {material.grades.length === 1
                  ? `${material.grades[0]} курс`
                  : `${material.grades[0]}-${material.grades[material.grades.length - 1]} курс`}
              </Badge>
            )}
          </div>

          {/* Author */}
          {showAuthor && (
            <div
              className="flex items-center gap-2.5 p-2 -mx-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors duration-200"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                router.push(`/profile/${material.authorUsername || material.authorId}`)
              }}
            >
              <Avatar className="h-7 w-7 ring-2 ring-primary/10">
                <AvatarImage src={material.authorAvatar || undefined} />
                <AvatarFallback className="text-xs bg-gradient-to-br from-primary to-accent text-white font-medium">
                  {getInitials(material.authorName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-foreground truncate block">
                  {material.authorName}
                </span>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {formatRelativeTime(material.createdAt.toDate())}
              </span>
            </div>
          )}
        </CardContent>

        <CardFooter className="px-4 pb-4 pt-0 flex items-center justify-between border-t border-border/50 pt-3 mt-auto">
          {/* Stats */}
          <div className="flex items-center gap-4 text-muted-foreground">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 text-sm transition-all duration-200 hover:scale-105 ${
                liked ? 'text-red-500' : 'hover:text-red-500'
              }`}
            >
              <Heart className={`h-4 w-4 transition-transform ${liked ? 'fill-current scale-110' : ''} ${isLikeLoading ? 'animate-pulse' : ''}`} />
              <span className="font-medium">{formatNumber(likesCount)}</span>
            </button>
            <span className="flex items-center gap-1.5 text-sm hover:text-primary transition-colors">
              <MessageCircle className="h-4 w-4" />
              <span className="font-medium">{formatNumber(material.stats.comments)}</span>
            </span>
            <span className="flex items-center gap-1.5 text-sm">
              <Eye className="h-4 w-4" />
              <span className="font-medium">{formatNumber(material.stats.views)}</span>
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg hover:bg-muted transition-colors"
                  onClick={(e) => e.preventDefault()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl border-border/50">
                <DropdownMenuItem onClick={openCollectionDialog} className="rounded-lg cursor-pointer">
                  <FolderPlus className="h-4 w-4 mr-2 text-primary" />
                  {text.addToCollection}
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-lg cursor-pointer">
                  <Download className="h-4 w-4 mr-2 text-muted-foreground" />
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
