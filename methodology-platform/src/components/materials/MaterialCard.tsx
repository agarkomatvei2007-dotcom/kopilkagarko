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
      <Card className="h-full overflow-hidden group card-lift border-0 glass-strong rounded-2xl">
        {/* Thumbnail */}
        <div className="relative aspect-video bg-muted overflow-hidden">
          {material.thumbnail && material.thumbnail.length > 0 && !imageError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={material.thumbnail}
              alt={material.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center gradient-mesh">
              <div className="w-20 h-20 rounded-2xl glass flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <div className="text-primary scale-150">{typeIcons[material.type]}</div>
              </div>
            </div>
          )}
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Type badge */}
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge variant="secondary" className="gap-1.5 glass-strong border-0 shadow-lg backdrop-blur-xl px-3 py-1.5 text-xs font-medium">
              {typeIcons[material.type]}
              {MATERIAL_TYPE_LABELS[material.type]}
            </Badge>
          </div>

          {/* Premium badge */}
          {material.isPremium && (
            <Badge className="absolute top-3 right-3 gradient-primary border-0 shadow-lg px-3 py-1.5 text-xs font-bold">
              PRO
            </Badge>
          )}

          {/* Difficulty badge - appears on hover */}
          <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
            <Badge
              className={`shadow-lg backdrop-blur-xl border-0 px-3 py-1.5 text-xs font-medium ${
                material.difficulty === 'easy'
                  ? 'bg-emerald-500/90'
                  : material.difficulty === 'medium'
                  ? 'bg-amber-500/90'
                  : 'bg-rose-500/90'
              } text-white`}
            >
              {DIFFICULTY_LABELS[material.difficulty]}
            </Badge>
          </div>

          {/* Quick stats on hover */}
          <div className="absolute bottom-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
            <div className="flex items-center gap-1.5 glass-strong backdrop-blur-xl rounded-full px-3 py-1.5 text-white text-xs font-medium">
              <Eye className="h-3.5 w-3.5" />
              {formatNumber(material.stats.views)}
            </div>
          </div>
        </div>

        <CardContent className="p-5 space-y-4">
          {/* Title and description */}
          <div>
            <h3 className="font-bold text-base line-clamp-2 group-hover:text-primary transition-colors duration-300 leading-snug">
              {material.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-2 leading-relaxed">
              {truncate(material.description, 100)}
            </p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 transition-colors">
              {material.subject}
            </Badge>
            {material.grades.length > 0 && (
              <Badge variant="outline" className="text-xs border-accent/30 text-accent bg-accent/5 hover:bg-accent/10 transition-colors">
                {material.grades.length === 1
                  ? `${material.grades[0]} курс`
                  : `${material.grades[0]}-${material.grades[material.grades.length - 1]} курс`}
              </Badge>
            )}
          </div>

          {/* Author */}
          {showAuthor && (
            <div
              className="flex items-center gap-3 p-2.5 -mx-2.5 rounded-xl hover:bg-muted/50 cursor-pointer transition-all duration-200 group/author"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                router.push(`/profile/${material.authorUsername || material.authorId}`)
              }}
            >
              <Avatar className="h-8 w-8 ring-2 ring-primary/20 group-hover/author:ring-primary/40 transition-all">
                <AvatarImage src={material.authorAvatar || undefined} />
                <AvatarFallback className="text-xs gradient-primary text-white font-semibold">
                  {getInitials(material.authorName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-foreground block truncate group-hover/author:text-primary transition-colors">
                  {material.authorName}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatRelativeTime(material.createdAt.toDate())}
                </span>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="px-5 pb-5 pt-0 flex items-center justify-between border-t border-border/30 pt-4">
          {/* Stats */}
          <div className="flex items-center gap-5 text-muted-foreground">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 text-sm font-medium transition-all duration-200 hover:scale-110 ${
                liked ? 'text-rose-500' : 'hover:text-rose-500'
              }`}
            >
              <Heart className={`h-4 w-4 transition-transform ${liked ? 'fill-current scale-110' : ''} ${isLikeLoading ? 'animate-pulse' : ''}`} />
              {formatNumber(likesCount)}
            </button>
            <span className="flex items-center gap-1.5 text-sm font-medium hover:text-primary transition-colors cursor-pointer">
              <MessageCircle className="h-4 w-4" />
              {formatNumber(material.stats.comments)}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-all"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-xl hover:bg-muted transition-all"
                  onClick={(e) => e.preventDefault()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl shadow-xl border-border/50 glass-strong">
                <DropdownMenuItem onClick={openCollectionDialog} className="rounded-lg cursor-pointer">
                  <FolderPlus className="h-4 w-4 mr-2 text-primary" />
                  {text.addToCollection}
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-lg cursor-pointer">
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
