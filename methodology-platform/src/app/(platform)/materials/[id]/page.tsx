'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  Heart,
  MessageCircle,
  Eye,
  Download,
  Bookmark,
  Share2,
  Calendar,
  Clock,
  ArrowLeft,
  MoreHorizontal,
  Loader2,
  Send,
  FileText,
  Video,
  FileImage,
  FileAudio,
  HelpCircle,
  Check,
  X,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'
import {
  getMaterial,
  incrementMaterialViews,
  toggleLike,
  isLikedByUser,
  addComment,
  getComments,
  isFollowing,
  followUser,
  unfollowUser,
} from '@/lib/firebase/firestore'
import { formatDate, formatNumber, getInitials } from '@/lib/utils'
import type { Material, Comment, MaterialType } from '@/types'
import { MATERIAL_TYPE_LABELS, DIFFICULTY_LABELS, GRADE_LABELS } from '@/types'

const typeIcons: Record<MaterialType, React.ReactNode> = {
  text: <FileText className="h-5 w-5" />,
  video: <Video className="h-5 w-5" />,
  presentation: <FileImage className="h-5 w-5" />,
  document: <FileText className="h-5 w-5" />,
  audio: <FileAudio className="h-5 w-5" />,
  quiz: <HelpCircle className="h-5 w-5" />,
}

export default function MaterialPage() {
  const params = useParams()
  const materialId = params.id as string
  const { user } = useAuth()
  const { toast } = useToast()

  const [material, setMaterial] = useState<Material | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [following, setFollowing] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [quizScore, setQuizScore] = useState(0)

  useEffect(() => {
    const loadMaterial = async () => {
      const data = await getMaterial(materialId)
      if (data) {
        setMaterial(data)
        // Increment views
        await incrementMaterialViews(materialId)
      }
      setIsLoading(false)
    }

    const loadComments = async () => {
      const data = await getComments(materialId)
      setComments(data)
    }

    loadMaterial()
    loadComments()
  }, [materialId])

  useEffect(() => {
    if (user && material) {
      isLikedByUser(materialId, user.id).then(setLiked)
      isFollowing(user.id, material.authorId).then(setFollowing)
    }
  }, [user, material, materialId])

  const handleLike = async () => {
    if (!user || !material) return
    const isNowLiked = await toggleLike(materialId, user.id)
    setLiked(isNowLiked)
    setMaterial({
      ...material,
      stats: {
        ...material.stats,
        likes: isNowLiked ? material.stats.likes + 1 : material.stats.likes - 1,
      },
    })
  }

  const handleFollow = async () => {
    if (!user || !material) return
    if (following) {
      await unfollowUser(user.id, material.authorId)
      setFollowing(false)
    } else {
      await followUser(user.id, material.authorId)
      setFollowing(true)
    }
  }

  const handleComment = async () => {
    if (!user || !newComment.trim()) return
    setIsSubmitting(true)
    try {
      await addComment(materialId, {
        authorId: user.id,
        authorName: user.displayName,
        authorAvatar: user.avatar,
        content: newComment.trim(),
      })
      setNewComment('')
      const updatedComments = await getComments(materialId)
      setComments(updatedComments)
      toast({
        title: 'Комментарий добавлен',
      })
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить комментарий',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      await navigator.share({
        title: material?.title,
        url,
      })
    } else {
      await navigator.clipboard.writeText(url)
      toast({ title: 'Ссылка скопирована' })
    }
  }

  const handleSelectAnswer = (questionIndex: number, optionIndex: number) => {
    if (quizSubmitted) return
    setSelectedAnswers(prev => ({ ...prev, [questionIndex]: optionIndex }))
  }

  const handleSubmitQuiz = () => {
    if (!material?.content.questions) return

    let correct = 0
    material.content.questions.forEach((q: { correctAnswer: number }, index: number) => {
      if (selectedAnswers[index] === q.correctAnswer) {
        correct++
      }
    })

    setQuizScore(correct)
    setQuizSubmitted(true)
    toast({
      title: 'Тест завершён!',
      description: `Правильных ответов: ${correct} из ${material.content.questions.length}`,
    })
  }

  const handleResetQuiz = () => {
    setSelectedAnswers({})
    setQuizSubmitted(false)
    setQuizScore(0)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!material) {
    return (
      <div className="container mx-auto py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Материал не найден</h1>
        <Link href="/feed">
          <Button>Вернуться к ленте</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      {/* Back button */}
      <Link href="/feed" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" />
        Назад к ленте
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="secondary" className="gap-1">
            {typeIcons[material.type]}
            {MATERIAL_TYPE_LABELS[material.type]}
          </Badge>
          <Badge variant="outline">{material.subject}</Badge>
          <Badge variant="outline">{DIFFICULTY_LABELS[material.difficulty]}</Badge>
          {material.isPremium && <Badge>PRO</Badge>}
        </div>

        <h1 className="text-3xl font-bold mb-4">{material.title}</h1>

        {/* Author info */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <Link href={`/profile/${material.authorId}`} className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={material.authorAvatar || undefined} />
              <AvatarFallback>{getInitials(material.authorName)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{material.authorName}</p>
              <p className="text-sm text-muted-foreground">
                {formatDate(material.publishedAt.toDate())}
              </p>
            </div>
          </Link>

          {user && user.id !== material.authorId && (
            <Button
              variant={following ? 'outline' : 'default'}
              onClick={handleFollow}
            >
              {following ? 'Отписаться' : 'Подписаться'}
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          {/* Thumbnail */}
          {material.thumbnail && (
            <div className="relative aspect-video mb-6 rounded-lg overflow-hidden">
              <Image
                src={material.thumbnail}
                alt={material.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Video embed */}
          {material.type === 'video' && material.content.videoUrl && (
            <div className="aspect-video mb-6">
              <iframe
                src={material.content.videoUrl.replace('watch?v=', 'embed/')}
                className="w-full h-full rounded-lg"
                allowFullScreen
              />
            </div>
          )}

          {/* Text content */}
          {material.content.text && (
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: material.content.text }}
            />
          )}

          {/* Quiz content */}
          {material.type === 'quiz' && material.content.questions && material.content.questions.length > 0 && (
            <div className="space-y-6">
              {/* Quiz header with score */}
              {quizSubmitted && (
                <div className={`p-4 rounded-lg border-2 ${
                  quizScore === material.content.questions.length
                    ? 'bg-green-50 border-green-400'
                    : quizScore >= material.content.questions.length / 2
                      ? 'bg-yellow-50 border-yellow-400'
                      : 'bg-red-50 border-red-400'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-lg">Результат: {quizScore} из {material.content.questions.length}</h3>
                      <p className="text-sm text-muted-foreground">
                        {Math.round((quizScore / material.content.questions.length) * 100)}% правильных ответов
                      </p>
                    </div>
                    <Button onClick={handleResetQuiz} variant="outline">
                      Пройти заново
                    </Button>
                  </div>
                </div>
              )}

              {/* Questions */}
              {material.content.questions.map((question: {
                question: string
                options: string[]
                correctAnswer: number
                explanation?: string
                difficulty?: string
              }, qIndex: number) => {
                const isAnswered = selectedAnswers[qIndex] !== undefined
                const isCorrect = quizSubmitted && selectedAnswers[qIndex] === question.correctAnswer
                const isWrong = quizSubmitted && isAnswered && selectedAnswers[qIndex] !== question.correctAnswer

                return (
                  <div key={qIndex} className="border rounded-lg p-4">
                    <div className="flex items-start gap-3 mb-4">
                      <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                        quizSubmitted
                          ? isCorrect ? 'bg-green-500' : isWrong ? 'bg-red-500' : 'bg-gray-400'
                          : 'bg-primary'
                      }`}>
                        {quizSubmitted ? (isCorrect ? <Check className="h-5 w-5" /> : isWrong ? <X className="h-5 w-5" /> : qIndex + 1) : qIndex + 1}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium text-lg">{question.question}</p>
                        {question.difficulty && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            question.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                            question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {question.difficulty === 'easy' ? 'Лёгкий' : question.difficulty === 'medium' ? 'Средний' : 'Сложный'}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2 ml-11">
                      {question.options.map((option: string, oIndex: number) => {
                        const isSelected = selectedAnswers[qIndex] === oIndex
                        const isCorrectOption = question.correctAnswer === oIndex
                        const showCorrect = quizSubmitted && isCorrectOption
                        const showWrong = quizSubmitted && isSelected && !isCorrectOption

                        return (
                          <button
                            key={oIndex}
                            type="button"
                            onClick={() => handleSelectAnswer(qIndex, oIndex)}
                            disabled={quizSubmitted}
                            className={`p-3 rounded-lg border-2 text-left transition-all ${
                              showCorrect
                                ? 'bg-green-50 border-green-400'
                                : showWrong
                                  ? 'bg-red-50 border-red-400'
                                  : isSelected
                                    ? 'bg-primary/10 border-primary'
                                    : 'border-muted hover:border-primary/50'
                            } ${quizSubmitted ? 'cursor-default' : 'cursor-pointer'}`}
                          >
                            <span className="font-bold mr-2">{String.fromCharCode(65 + oIndex)}.</span>
                            {option}
                            {showCorrect && <Check className="inline ml-2 h-4 w-4 text-green-600" />}
                            {showWrong && <X className="inline ml-2 h-4 w-4 text-red-600" />}
                          </button>
                        )
                      })}
                    </div>

                    {quizSubmitted && question.explanation && (
                      <div className="mt-3 ml-11 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm"><strong>Объяснение:</strong> {question.explanation}</p>
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Submit button */}
              {!quizSubmitted && (
                <Button
                  onClick={handleSubmitQuiz}
                  className="w-full"
                  disabled={Object.keys(selectedAnswers).length < material.content.questions.length}
                >
                  Завершить тест ({Object.keys(selectedAnswers).length}/{material.content.questions.length} ответов)
                </Button>
              )}
            </div>
          )}

          {/* Files */}
          {material.content.files && material.content.files.length > 0 && (
            <div className="mt-6 space-y-4">
              <h3 className="font-semibold mb-3">Прикрепленные файлы</h3>
              {material.content.files.map((file, index) => {
                const fileName = file.name?.toLowerCase() || ''
                const fileUrl = file.url || ''
                const isVideo = fileName.match(/\.(mp4|webm|ogg|mov|avi)$/) || fileUrl.includes('video')
                const isPdf = fileName.match(/\.pdf$/) || fileUrl.includes('.pdf')
                const isAudio = fileName.match(/\.(mp3|wav|ogg|m4a)$/)
                const isImage = fileName.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)

                return (
                  <div key={index} className="space-y-2">
                    {/* Video player */}
                    {isVideo && (
                      <div className="aspect-video rounded-lg overflow-hidden bg-black">
                        <video
                          src={fileUrl}
                          controls
                          className="w-full h-full"
                          preload="metadata"
                        >
                          Ваш браузер не поддерживает видео
                        </video>
                      </div>
                    )}

                    {/* PDF viewer */}
                    {isPdf && (
                      <div className="aspect-[4/3] rounded-lg overflow-hidden border">
                        <iframe
                          src={`${fileUrl}#view=FitH`}
                          className="w-full h-full"
                          title={file.name}
                        />
                      </div>
                    )}

                    {/* Audio player */}
                    {isAudio && (
                      <div className="p-4 bg-muted rounded-lg">
                        <audio src={fileUrl} controls className="w-full">
                          Ваш браузер не поддерживает аудио
                        </audio>
                      </div>
                    )}

                    {/* Image preview */}
                    {isImage && (
                      <div className="rounded-lg overflow-hidden">
                        <img src={fileUrl} alt={file.name} className="max-w-full h-auto" />
                      </div>
                    )}

                    {/* File info and download */}
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        {isVideo ? <Video className="h-5 w-5 text-muted-foreground" /> :
                         isPdf ? <FileText className="h-5 w-5 text-red-500" /> :
                         isAudio ? <FileAudio className="h-5 w-5 text-muted-foreground" /> :
                         isImage ? <FileImage className="h-5 w-5 text-muted-foreground" /> :
                         <FileText className="h-5 w-5 text-muted-foreground" />}
                        <span className="text-sm">{file.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {isPdf && (
                          <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              Открыть
                            </Button>
                          </a>
                        )}
                        {material.allowDownload && (
                          <a href={fileUrl} download target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Description */}
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Описание</h3>
            <p className="text-muted-foreground">{material.description}</p>
          </div>

          {/* Tags and grades */}
          <div className="mt-6 flex flex-wrap gap-2">
            {material.grades.map((grade) => (
              <Badge key={grade} variant="outline">
                {GRADE_LABELS[grade as keyof typeof GRADE_LABELS]}
              </Badge>
            ))}
            {material.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                #{tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-6">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 ${liked ? 'text-red-500' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Heart className={`h-5 w-5 ${liked ? 'fill-current' : ''}`} />
            <span>{formatNumber(material.stats.likes)}</span>
          </button>
          <span className="flex items-center gap-2 text-muted-foreground">
            <MessageCircle className="h-5 w-5" />
            {formatNumber(material.stats.comments)}
          </span>
          <span className="flex items-center gap-2 text-muted-foreground">
            <Eye className="h-5 w-5" />
            {formatNumber(material.stats.views)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Поделиться
          </Button>
          <Button variant="outline" size="sm">
            <Bookmark className="h-4 w-4 mr-2" />
            Сохранить
          </Button>
        </div>
      </div>

      {/* Comments */}
      <Card>
        <CardHeader>
          <CardTitle>Комментарии ({comments.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* New comment */}
          {user && (
            <div className="flex gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatar || undefined} />
                <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Textarea
                  placeholder="Напишите комментарий..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <Button
                  size="sm"
                  onClick={handleComment}
                  disabled={!newComment.trim() || isSubmitting}
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Send className="h-4 w-4 mr-2" />
                  Отправить
                </Button>
              </div>
            </div>
          )}

          <Separator />

          {/* Comments list */}
          {comments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Пока нет комментариев. Будьте первым!
            </p>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.authorAvatar || undefined} />
                    <AvatarFallback>{getInitials(comment.authorName)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{comment.authorName}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(comment.createdAt.toDate())}
                      </span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
