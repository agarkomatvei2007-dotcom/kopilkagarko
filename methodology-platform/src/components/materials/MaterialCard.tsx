'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  Heart,
  MessageCircle,
  Eye,
  Download,
  Bookmark,
  Share2,
  MoreHorizontal,
  FileText,
  Video,
  FileImage,
  FileAudio,
  HelpCircle,
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
import { useAuth } from '@/hooks/useAuth'
import { toggleLike, isLikedByUser } from '@/lib/firebase/firestore'
import { formatNumber, formatRelativeTime, getInitials, truncate } from '@/lib/utils'
import type { Material, MaterialType } from '@/types'
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
  const router = useRouter()
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(material.stats.likes)
  const [isLikeLoading, setIsLikeLoading] = useState(false)

  // Check if user liked this material
  useState(() => {
    if (user) {
      isLikedByUser(material.id, user.id).then(setLiked)
    }
  })

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
    const url = `${window.location.origin}/materials/${material.id}`
    if (navigator.share) {
      await navigator.share({
        title: material.title,
        text: material.description,
        url,
      })
    } else {
      await navigator.clipboard.writeText(url)
    }
  }

  return (
    <Link href={`/materials/${material.id}`}>
      <Card className="h-full hover:shadow-md transition-shadow overflow-hidden group">
        {/* Thumbnail */}
        <div className="relative aspect-video bg-muted">
          {material.thumbnail ? (
            <Image
              src={material.thumbnail}
              alt={material.title}
              fill
              className="object-cover"
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
                router.push(`/profile/${material.authorId}`)
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
                <DropdownMenuItem>
                  <Bookmark className="h-4 w-4 mr-2" />
                  Сохранить
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="h-4 w-4 mr-2" />
                  Скачать
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
