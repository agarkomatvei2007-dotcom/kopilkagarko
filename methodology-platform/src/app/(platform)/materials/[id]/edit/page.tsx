'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import RichTextEditor from '@/components/editor/RichTextEditor'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'
import { getMaterial, updateMaterial } from '@/lib/firebase/firestore'
import { SUBJECTS, GRADES, GRADE_LABELS, MaterialType, MaterialDifficulty } from '@/types'
import type { Material } from '@/types'

const difficulties = [
  { value: 'easy', label: 'Легкий' },
  { value: 'medium', label: 'Средний' },
  { value: 'hard', label: 'Сложный' },
]

const materialSchema = z.object({
  title: z.string().min(5, 'Название должно быть не менее 5 символов'),
  description: z.string().min(20, 'Описание должно быть не менее 20 символов'),
  subject: z.string().min(1, 'Выберите предмет'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  videoUrl: z.string().url().optional().or(z.literal('')),
  isPublic: z.boolean(),
  allowDownload: z.boolean(),
})

type MaterialFormData = z.infer<typeof materialSchema>

export default function EditMaterialPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const { toast } = useToast()
  const materialId = params.id as string

  const [material, setMaterial] = useState<Material | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedGrades, setSelectedGrades] = useState<number[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<MaterialFormData>({
    resolver: zodResolver(materialSchema),
  })

  useEffect(() => {
    loadMaterial()
  }, [materialId])

  const loadMaterial = async () => {
    try {
      const data = await getMaterial(materialId)
      if (!data) {
        toast({ title: 'Материал не найден', variant: 'destructive' })
        router.push('/my-materials')
        return
      }

      if (user && data.authorId !== user.id) {
        toast({ title: 'Нет доступа', variant: 'destructive' })
        router.push('/my-materials')
        return
      }

      setMaterial(data)
      setValue('title', data.title)
      setValue('description', data.description)
      setValue('subject', data.subject)
      setValue('difficulty', data.difficulty)
      setValue('isPublic', data.isPublic)
      setValue('allowDownload', data.allowDownload)
      setValue('videoUrl', data.content.videoUrl || '')
      setSelectedGrades(data.grades)
      setTags(data.tags)
      setContent(data.content.text || '')
    } catch (error) {
      console.error('Error loading material:', error)
      toast({ title: 'Ошибка загрузки', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGradeToggle = (grade: number) => {
    setSelectedGrades((prev) =>
      prev.includes(grade) ? prev.filter((g) => g !== grade) : [...prev, grade]
    )
  }

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase()
    if (tag && !tags.includes(tag) && tags.length < 10) {
      setTags([...tags, tag])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  const onSubmit = async (data: MaterialFormData) => {
    if (!user || !material) return
    if (selectedGrades.length === 0) {
      toast({
        title: 'Ошибка',
        description: 'Выберите хотя бы один курс',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)

    try {
      await updateMaterial(materialId, {
        title: data.title,
        description: data.description,
        subject: data.subject,
        grades: selectedGrades.sort((a, b) => a - b),
        tags,
        difficulty: data.difficulty as MaterialDifficulty,
        content: {
          ...material.content,
          text: material.type === 'text' ? content : material.content.text,
          videoUrl: material.type === 'video' ? (data.videoUrl || undefined) : material.content.videoUrl,
        },
        isPublic: data.isPublic,
        allowDownload: data.allowDownload,
      })

      toast({
        title: 'Сохранено!',
        description: 'Изменения успешно сохранены',
      })

      router.push(`/materials/${materialId}`)
    } catch (error) {
      console.error('Error updating material:', error)
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить изменения',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!material) {
    return null
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/materials/${materialId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Редактирование материала</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Основная информация</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Название</Label>
              <Input id="title" {...register('title')} />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea id="description" rows={4} {...register('description')} />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Предмет</Label>
                <Select
                  defaultValue={material.subject}
                  onValueChange={(value) => setValue('subject', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBJECTS.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Сложность</Label>
                <Select
                  defaultValue={material.difficulty}
                  onValueChange={(value) => setValue('difficulty', value as MaterialDifficulty)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {difficulties.map((diff) => (
                      <SelectItem key={diff.value} value={diff.value}>
                        {diff.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Классы</Label>
              <div className="flex flex-wrap gap-2">
                {GRADES.map((grade) => (
                  <button
                    key={grade}
                    type="button"
                    onClick={() => handleGradeToggle(grade)}
                    className={`px-3 py-1 rounded-full border text-sm transition-colors ${
                      selectedGrades.includes(grade)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-muted hover:border-primary/50'
                    }`}
                  >
                    {GRADE_LABELS[grade]}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Теги</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Добавить тег..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                />
                <Button type="button" variant="secondary" onClick={handleAddTag}>
                  Добавить
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button type="button" onClick={() => handleRemoveTag(tag)}>
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {material.type === 'text' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Содержимое</CardTitle>
            </CardHeader>
            <CardContent>
              <RichTextEditor content={content} onChange={setContent} />
            </CardContent>
          </Card>
        )}

        {material.type === 'video' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Видео</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="videoUrl">Ссылка на видео (YouTube)</Label>
                <Input id="videoUrl" {...register('videoUrl')} />
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Настройки</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Публичный материал</Label>
                <p className="text-sm text-muted-foreground">
                  Материал будет виден всем пользователям
                </p>
              </div>
              <Switch
                defaultChecked={material.isPublic}
                onCheckedChange={(checked) => setValue('isPublic', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Разрешить скачивание</Label>
                <p className="text-sm text-muted-foreground">
                  Пользователи смогут скачивать файлы
                </p>
              </div>
              <Switch
                defaultChecked={material.allowDownload}
                onCheckedChange={(checked) => setValue('allowDownload', checked)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()}>
            Отмена
          </Button>
          <Button type="submit" className="flex-1" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Сохранить
          </Button>
        </div>
      </form>
    </div>
  )
}
