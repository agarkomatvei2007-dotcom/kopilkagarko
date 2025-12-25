'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Loader2,
  Upload,
  FileText,
  Video,
  FileImage,
  FileAudio,
  HelpCircle,
  X,
} from 'lucide-react'

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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import RichTextEditor from '@/components/editor/RichTextEditor'
import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/hooks/useLanguage'
import { useToast } from '@/hooks/use-toast'
import { createMaterial } from '@/lib/firebase/firestore'
import { uploadMaterialFile, uploadThumbnail } from '@/lib/firebase/storage'
import { SUBJECTS, GRADES, GRADE_LABELS, MaterialType, MaterialDifficulty } from '@/types'

const materialSchema = z.object({
  title: z.string().min(5, 'Название должно быть не менее 5 символов'),
  description: z.string().min(20, 'Описание должно быть не менее 20 символов'),
  type: z.enum(['text', 'video', 'presentation', 'document', 'audio', 'quiz']),
  subject: z.string().min(1, 'Выберите предмет'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  videoUrl: z.string().url().optional().or(z.literal('')),
  isPublic: z.boolean(),
  allowDownload: z.boolean(),
})

type MaterialFormData = z.infer<typeof materialSchema>

export default function CreateMaterialPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { language } = useLanguage()
  const { toast } = useToast()

  const [selectedGrades, setSelectedGrades] = useState<number[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [content, setContent] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Translations
  const txt = {
    pageTitle: language === 'ru' ? 'Создание материала' : 'Материал жасау',
    materialType: language === 'ru' ? 'Тип материала' : 'Материал түрі',
    types: {
      text: language === 'ru' ? 'Текст' : 'Мәтін',
      video: language === 'ru' ? 'Видео' : 'Видео',
      presentation: language === 'ru' ? 'Презентация' : 'Презентация',
      document: language === 'ru' ? 'Документ' : 'Құжат',
      audio: language === 'ru' ? 'Аудио' : 'Аудио',
      quiz: language === 'ru' ? 'Тест' : 'Тест',
    },
    basicInfo: language === 'ru' ? 'Основная информация' : 'Негізгі ақпарат',
    title: language === 'ru' ? 'Название' : 'Атауы',
    titlePlaceholder: language === 'ru' ? 'Введите название материала' : 'Материал атауын енгізіңіз',
    description: language === 'ru' ? 'Описание' : 'Сипаттамасы',
    descriptionPlaceholder: language === 'ru' ? 'Опишите ваш материал...' : 'Материалыңызды сипаттаңыз...',
    subject: language === 'ru' ? 'Дисциплина' : 'Пән',
    selectSubject: language === 'ru' ? 'Выберите дисциплину' : 'Пәнді таңдаңыз',
    difficulty: language === 'ru' ? 'Сложность' : 'Қиындығы',
    difficulties: {
      easy: language === 'ru' ? 'Легкий' : 'Жеңіл',
      medium: language === 'ru' ? 'Средний' : 'Орташа',
      hard: language === 'ru' ? 'Сложный' : 'Қиын',
    },
    courses: language === 'ru' ? 'Курсы' : 'Курстар',
    tags: language === 'ru' ? 'Теги' : 'Тегтер',
    addTag: language === 'ru' ? 'Добавить тег...' : 'Тег қосу...',
    add: language === 'ru' ? 'Добавить' : 'Қосу',
    content: language === 'ru' ? 'Содержимое' : 'Мазмұны',
    textContent: language === 'ru' ? 'Текст материала' : 'Материал мәтіні',
    videoUrl: language === 'ru' ? 'Ссылка на видео (YouTube)' : 'Видео сілтемесі (YouTube)',
    files: language === 'ru' ? 'Файлы' : 'Файлдар',
    uploadFiles: language === 'ru' ? 'Нажмите для загрузки или перетащите файлы' : 'Жүктеу үшін басыңыз немесе файлдарды сүйреңіз',
    fileTypes: 'PDF, DOC, DOCX, PPT, PPTX (100MB)',
    thumbnail: language === 'ru' ? 'Обложка (опционально)' : 'Мұқаба (міндетті емес)',
    uploadThumbnail: language === 'ru' ? 'Загрузить обложку' : 'Мұқаба жүктеу',
    settings: language === 'ru' ? 'Настройки' : 'Параметрлер',
    publicMaterial: language === 'ru' ? 'Публичный материал' : 'Жалпыға қолжетімді',
    publicDesc: language === 'ru' ? 'Материал будет виден всем пользователям' : 'Материал барлық пайдаланушыларға көрінеді',
    allowDownload: language === 'ru' ? 'Разрешить скачивание' : 'Жүктеуге рұқсат беру',
    downloadDesc: language === 'ru' ? 'Пользователи смогут скачивать файлы' : 'Пайдаланушылар файлдарды жүктей алады',
    cancel: language === 'ru' ? 'Отмена' : 'Болдырмау',
    publish: language === 'ru' ? 'Опубликовать' : 'Жариялау',
    error: language === 'ru' ? 'Ошибка' : 'Қате',
    selectCourse: language === 'ru' ? 'Выберите хотя бы один курс' : 'Кем дегенде бір курсты таңдаңыз',
    success: language === 'ru' ? 'Материал создан!' : 'Материал жасалды!',
    successDesc: language === 'ru' ? 'Ваш материал успешно опубликован' : 'Материалыңыз сәтті жарияланды',
    createError: language === 'ru' ? 'Не удалось создать материал' : 'Материал жасау мүмкін болмады',
  }

  const materialTypes = [
    { value: 'text', label: txt.types.text, icon: FileText },
    { value: 'video', label: txt.types.video, icon: Video },
    { value: 'presentation', label: txt.types.presentation, icon: FileImage },
    { value: 'document', label: txt.types.document, icon: FileText },
    { value: 'audio', label: txt.types.audio, icon: FileAudio },
    { value: 'quiz', label: txt.types.quiz, icon: HelpCircle },
  ]

  const difficulties = [
    { value: 'easy', label: txt.difficulties.easy },
    { value: 'medium', label: txt.difficulties.medium },
    { value: 'hard', label: txt.difficulties.hard },
  ]

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<MaterialFormData>({
    resolver: zodResolver(materialSchema),
    defaultValues: {
      type: 'text',
      difficulty: 'medium',
      isPublic: true,
      allowDownload: true,
    },
  })

  const selectedType = watch('type')

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

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || [])
    setFiles((prev) => [...prev, ...newFiles])
  }

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const onSubmit = async (data: MaterialFormData) => {
    if (!user) return
    if (selectedGrades.length === 0) {
      toast({
        title: txt.error,
        description: txt.selectCourse,
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)

    try {
      const tempId = `temp_${Date.now()}`

      let uploadedFiles: Awaited<ReturnType<typeof uploadMaterialFile>>[] = []
      if (files.length > 0) {
        try {
          uploadedFiles = await Promise.all(
            files.map((file) => uploadMaterialFile(user.id, tempId, file))
          )
        } catch (uploadError) {
          console.warn('File upload failed:', uploadError)
        }
      }

      let thumbnailUrl = null
      if (thumbnailFile) {
        try {
          thumbnailUrl = await uploadThumbnail(tempId, thumbnailFile)
        } catch (uploadError) {
          console.warn('Thumbnail upload failed:', uploadError)
        }
      }

      const materialId = await createMaterial({
        title: data.title,
        description: data.description,
        type: data.type as MaterialType,
        content: {
          text: data.type === 'text' ? content : null,
          videoUrl: data.type === 'video' ? (data.videoUrl || null) : null,
          files: uploadedFiles,
        },
        subject: data.subject,
        grades: selectedGrades.sort((a, b) => a - b),
        tags,
        difficulty: data.difficulty as MaterialDifficulty,
        duration: null,
        standards: [],
        thumbnail: thumbnailUrl,
        images: [],
        isPublic: data.isPublic,
        isPremium: false,
        price: null,
        allowDownload: data.allowDownload,
        authorId: user.id,
        authorName: user.displayName || (language === 'ru' ? 'Пользователь' : 'Пайдаланушы'),
        authorAvatar: user.avatar || null,
        aiGenerated: false,
        aiTags: [],
      })

      toast({
        title: txt.success,
        description: txt.successDesc,
      })

      router.push(`/materials/${materialId}`)
    } catch (error) {
      console.error('Error creating material:', error)
      toast({
        title: txt.error,
        description: error instanceof Error ? error.message : txt.createError,
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">{txt.pageTitle}</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Material type */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{txt.materialType}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {materialTypes.map((type) => {
                const Icon = type.icon
                const isSelected = selectedType === type.value
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setValue('type', type.value as MaterialType)}
                    className={`p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-colors ${
                      isSelected
                        ? 'border-primary bg-primary/10'
                        : 'border-muted hover:border-primary/50'
                    }`}
                  >
                    <Icon className={`h-6 w-6 ${isSelected ? 'text-primary' : ''}`} />
                    <span className="text-sm font-medium">{type.label}</span>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Basic info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{txt.basicInfo}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">{txt.title}</Label>
              <Input
                id="title"
                placeholder={txt.titlePlaceholder}
                {...register('title')}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{txt.description}</Label>
              <Textarea
                id="description"
                placeholder={txt.descriptionPlaceholder}
                rows={4}
                {...register('description')}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{txt.subject}</Label>
                <Select onValueChange={(value) => setValue('subject', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={txt.selectSubject} />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBJECTS.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.subject && (
                  <p className="text-sm text-destructive">{errors.subject.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>{txt.difficulty}</Label>
                <Select
                  defaultValue="medium"
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

            {/* Grades */}
            <div className="space-y-2">
              <Label>{txt.courses}</Label>
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

            {/* Tags */}
            <div className="space-y-2">
              <Label>{txt.tags}</Label>
              <div className="flex gap-2">
                <Input
                  placeholder={txt.addTag}
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                />
                <Button type="button" variant="secondary" onClick={handleAddTag}>
                  {txt.add}
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button type="button" onClick={() => handleRemoveTag(tag)}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{txt.content}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedType === 'text' && (
              <div className="space-y-2">
                <Label>{txt.textContent}</Label>
                <RichTextEditor content={content} onChange={setContent} />
              </div>
            )}

            {selectedType === 'video' && (
              <div className="space-y-2">
                <Label htmlFor="videoUrl">{txt.videoUrl}</Label>
                <Input
                  id="videoUrl"
                  placeholder="https://youtube.com/watch?v=..."
                  {...register('videoUrl')}
                />
              </div>
            )}

            {/* File upload */}
            <div className="space-y-2">
              <Label>{txt.files}</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <input
                  type="file"
                  multiple
                  className="hidden"
                  id="file-upload"
                  onChange={handleFilesChange}
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {txt.uploadFiles}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {txt.fileTypes}
                  </span>
                </label>
              </div>
              {files.length > 0 && (
                <div className="space-y-2 mt-4">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-muted rounded"
                    >
                      <span className="text-sm truncate">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnail */}
            <div className="space-y-2">
              <Label>{txt.thumbnail}</Label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="thumbnail-upload"
                  onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                />
                <label htmlFor="thumbnail-upload" className="cursor-pointer">
                  {thumbnailFile ? (
                    <span className="text-sm">{thumbnailFile.name}</span>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      {txt.uploadThumbnail}
                    </span>
                  )}
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{txt.settings}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>{txt.publicMaterial}</Label>
                <p className="text-sm text-muted-foreground">
                  {txt.publicDesc}
                </p>
              </div>
              <Switch
                defaultChecked={true}
                onCheckedChange={(checked) => setValue('isPublic', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>{txt.allowDownload}</Label>
                <p className="text-sm text-muted-foreground">
                  {txt.downloadDesc}
                </p>
              </div>
              <Switch
                defaultChecked={true}
                onCheckedChange={(checked) => setValue('allowDownload', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => router.back()}
          >
            {txt.cancel}
          </Button>
          <Button type="submit" className="flex-1" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {txt.publish}
          </Button>
        </div>
      </form>
    </div>
  )
}
