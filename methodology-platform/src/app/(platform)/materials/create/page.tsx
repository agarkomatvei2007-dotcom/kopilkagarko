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
  Sparkles,
  Check,
  RefreshCw,
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

interface QuizQuestion {
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  difficulty: 'easy' | 'medium' | 'hard'
}

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

  // Quiz state
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([])
  const [quizTopic, setQuizTopic] = useState('')
  const [quizCount, setQuizCount] = useState('10')
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false)
  const [showQuizAnswers, setShowQuizAnswers] = useState(false)

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
    // Quiz translations
    quizTopic: language === 'ru' ? 'Тема для генерации вопросов' : 'Сұрақтар генерациялау тақырыбы',
    quizTopicPlaceholder: language === 'ru' ? 'Например: Квадратные уравнения' : 'Мысалы: Квадрат теңдеулер',
    quizCount: language === 'ru' ? 'Количество вопросов' : 'Сұрақтар саны',
    generateQuiz: language === 'ru' ? 'Сгенерировать тест' : 'Тест жасау',
    generatingQuiz: language === 'ru' ? 'Генерирую...' : 'Жасалуда...',
    regenerateQuiz: language === 'ru' ? 'Сгенерировать заново' : 'Қайта жасау',
    showAnswers: language === 'ru' ? 'Показать ответы' : 'Жауаптарды көрсету',
    hideAnswers: language === 'ru' ? 'Скрыть ответы' : 'Жауаптарды жасыру',
    quizGenerated: language === 'ru' ? 'Тест сгенерирован!' : 'Тест жасалды!',
    quizError: language === 'ru' ? 'Ошибка генерации теста' : 'Тест жасау қатесі',
    fillQuizTopic: language === 'ru' ? 'Введите тему для генерации' : 'Генерациялау тақырыбын енгізіңіз',
    selectSubjectFirst: language === 'ru' ? 'Сначала выберите предмет' : 'Алдымен пәнді таңдаңыз',
    correctAnswer: language === 'ru' ? 'Правильный ответ' : 'Дұрыс жауап',
    explanation: language === 'ru' ? 'Объяснение' : 'Түсіндірме',
    difficultyLabels: {
      easy: language === 'ru' ? 'Лёгкий' : 'Оңай',
      medium: language === 'ru' ? 'Средний' : 'Орташа',
      hard: language === 'ru' ? 'Сложный' : 'Қиын',
    },
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

  const handleGenerateQuiz = async () => {
    const subject = watch('subject')
    if (!subject) {
      toast({
        title: txt.error,
        description: txt.selectSubjectFirst,
        variant: 'destructive',
      })
      return
    }
    if (!quizTopic.trim()) {
      toast({
        title: txt.error,
        description: txt.fillQuizTopic,
        variant: 'destructive',
      })
      return
    }

    setIsGeneratingQuiz(true)
    setQuizQuestions([])

    try {
      const response = await fetch('/api/ai/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: quizTopic,
          subject,
          grade: selectedGrades[0] || 1,
          questionsCount: parseInt(quizCount),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate quiz')
      }

      setQuizQuestions(data.questions)
      toast({
        title: txt.quizGenerated,
        description: `${data.questions.length} ${language === 'ru' ? 'вопросов' : 'сұрақ'}`,
      })
    } catch (error) {
      console.error('Error generating quiz:', error)
      toast({
        title: txt.quizError,
        description: error instanceof Error ? error.message : txt.quizError,
        variant: 'destructive',
      })
    } finally {
      setIsGeneratingQuiz(false)
    }
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
      console.log('DEBUG: thumbnailFile =', thumbnailFile)
      if (thumbnailFile) {
        try {
          thumbnailUrl = await uploadThumbnail(tempId, thumbnailFile)
          console.log('DEBUG: thumbnailUrl =', thumbnailUrl)
        } catch (uploadError) {
          console.warn('Thumbnail upload failed:', uploadError)
        }
      }

      // Build content object without undefined values (Firebase doesn't support undefined)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const contentObj: Record<string, any> = {}

      // Add text content for text type
      if (data.type === 'text' && content) {
        contentObj.text = content
      }

      // Add video URL for video type
      if (data.type === 'video' && data.videoUrl) {
        contentObj.videoUrl = data.videoUrl
      }

      // Add quiz questions for quiz type
      if (data.type === 'quiz' && quizQuestions.length > 0) {
        contentObj.questions = quizQuestions
      }

      // Add files if any were uploaded
      if (uploadedFiles && uploadedFiles.length > 0) {
        contentObj.files = uploadedFiles
      }

      console.log('DEBUG: Creating material with thumbnail:', thumbnailUrl)
      const materialId = await createMaterial({
        title: data.title,
        description: data.description,
        type: data.type as MaterialType,
        content: contentObj,
        subject: data.subject,
        grades: selectedGrades.sort((a, b) => a - b),
        tags,
        difficulty: data.difficulty as MaterialDifficulty,
        duration: null,
        standards: [],
        thumbnail: thumbnailUrl ?? null,
        images: [],
        isPublic: data.isPublic,
        isPremium: false,
        price: null,
        allowDownload: data.allowDownload,
        authorId: user.id,
        authorName: user.displayName || (language === 'ru' ? 'Пользователь' : 'Пайдаланушы'),
        authorAvatar: user.avatar ?? null,
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

            {/* Quiz generator */}
            {selectedType === 'quiz' && (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{txt.quizTopic}</Label>
                    <Input
                      placeholder={txt.quizTopicPlaceholder}
                      value={quizTopic}
                      onChange={(e) => setQuizTopic(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{txt.quizCount}</Label>
                    <Select value={quizCount} onValueChange={setQuizCount}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="15">15</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={handleGenerateQuiz}
                  disabled={isGeneratingQuiz}
                  className="w-full"
                >
                  {isGeneratingQuiz ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {txt.generatingQuiz}
                    </>
                  ) : quizQuestions.length > 0 ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      {txt.regenerateQuiz}
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      {txt.generateQuiz}
                    </>
                  )}
                </Button>

                {/* Generated questions */}
                {quizQuestions.length > 0 && (
                  <div className="border rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">
                        {quizQuestions.length} {language === 'ru' ? 'вопросов' : 'сұрақ'}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowQuizAnswers(!showQuizAnswers)}
                      >
                        {showQuizAnswers ? txt.hideAnswers : txt.showAnswers}
                      </Button>
                    </div>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {quizQuestions.map((q, index) => (
                        <div key={index} className="border-b pb-3 last:border-0">
                          <div className="flex items-start gap-2 mb-2">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </span>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{q.question}</p>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                q.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                                q.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {txt.difficultyLabels[q.difficulty]}
                              </span>
                            </div>
                          </div>
                          <div className="ml-8 space-y-1">
                            {q.options.map((option, optIndex) => {
                              const isCorrect = optIndex === q.correctAnswer
                              const letter = String.fromCharCode(65 + optIndex)
                              return (
                                <div
                                  key={optIndex}
                                  className={`text-sm p-1.5 rounded ${
                                    showQuizAnswers && isCorrect ? 'bg-green-50 border border-green-200' : ''
                                  }`}
                                >
                                  <span className="font-medium mr-1">{letter})</span>
                                  {option}
                                  {showQuizAnswers && isCorrect && (
                                    <Check className="inline ml-1 h-3 w-3 text-green-600" />
                                  )}
                                </div>
                              )
                            })}
                            {showQuizAnswers && (
                              <p className="text-xs text-muted-foreground mt-2 p-2 bg-muted rounded">
                                {txt.explanation}: {q.explanation}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
