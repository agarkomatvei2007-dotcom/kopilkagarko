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
  Plus,
  Trash2,
  Edit3,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
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
  const [quizMode, setQuizMode] = useState<'auto' | 'manual'>('auto')
  const [quizSubject, setQuizSubject] = useState('')
  const [quizGrade, setQuizGrade] = useState('')

  // Manual question editing
  const [editingQuestion, setEditingQuestion] = useState<number | null>(null)
  const [newQuestion, setNewQuestion] = useState('')
  const [newOptions, setNewOptions] = useState(['', '', '', ''])
  const [newCorrectAnswer, setNewCorrectAnswer] = useState(0)
  const [newExplanation, setNewExplanation] = useState('')
  const [newDifficulty, setNewDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')

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
    // Quiz builder translations
    quizBuilder: language === 'ru' ? 'Конструктор теста' : 'Тест құрастырушы',
    autoGeneration: language === 'ru' ? 'ИИ-генерация' : 'ЖИ-генерация',
    manualCreation: language === 'ru' ? 'Создать вручную' : 'Қолмен жасау',
    testTitle: language === 'ru' ? 'Название теста' : 'Тест атауы',
    testTitlePlaceholder: language === 'ru' ? 'Например: Тест по квадратным уравнениям' : 'Мысалы: Квадрат теңдеулер бойынша тест',
    addQuestion: language === 'ru' ? 'Добавить вопрос' : 'Сұрақ қосу',
    questionText: language === 'ru' ? 'Текст вопроса' : 'Сұрақ мәтіні',
    questionPlaceholder: language === 'ru' ? 'Введите вопрос...' : 'Сұрақты енгізіңіз...',
    optionPlaceholder: language === 'ru' ? 'Вариант ответа' : 'Жауап нұсқасы',
    markCorrect: language === 'ru' ? 'Отметить как правильный' : 'Дұрыс деп белгілеу',
    explanationLabel: language === 'ru' ? 'Объяснение (опционально)' : 'Түсіндірме (міндетті емес)',
    explanationPlaceholder: language === 'ru' ? 'Почему этот ответ правильный...' : 'Неліктен бұл жауап дұрыс...',
    saveQuestion: language === 'ru' ? 'Сохранить вопрос' : 'Сұрақты сақтау',
    cancelEdit: language === 'ru' ? 'Отмена' : 'Болдырмау',
    editQuestion: language === 'ru' ? 'Редактировать' : 'Өңдеу',
    deleteQuestion: language === 'ru' ? 'Удалить' : 'Жою',
    noQuestions: language === 'ru' ? 'Пока нет вопросов. Добавьте первый вопрос!' : 'Әзірге сұрақтар жоқ. Бірінші сұрақты қосыңыз!',
    questionRequired: language === 'ru' ? 'Введите текст вопроса' : 'Сұрақ мәтінін енгізіңіз',
    optionsRequired: language === 'ru' ? 'Заполните все варианты ответа' : 'Барлық жауап нұсқаларын толтырыңыз',
    previewMode: language === 'ru' ? 'Предпросмотр' : 'Алдын ала қарау',
    questionsLabel: language === 'ru' ? 'вопросов' : 'сұрақ',
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

  // Manual question management
  const resetQuestionForm = () => {
    setNewQuestion('')
    setNewOptions(['', '', '', ''])
    setNewCorrectAnswer(0)
    setNewExplanation('')
    setNewDifficulty('medium')
    setEditingQuestion(null)
  }

  const handleAddOrUpdateQuestion = () => {
    if (!newQuestion.trim()) {
      toast({
        title: txt.error,
        description: txt.questionRequired,
        variant: 'destructive',
      })
      return
    }

    const filledOptions = newOptions.filter(o => o.trim())
    if (filledOptions.length < 2) {
      toast({
        title: txt.error,
        description: txt.optionsRequired,
        variant: 'destructive',
      })
      return
    }

    const question: QuizQuestion = {
      question: newQuestion.trim(),
      options: newOptions.map(o => o.trim()).filter(o => o),
      correctAnswer: newCorrectAnswer,
      explanation: newExplanation.trim(),
      difficulty: newDifficulty,
    }

    if (editingQuestion !== null) {
      // Update existing question
      setQuizQuestions(prev => prev.map((q, i) => i === editingQuestion ? question : q))
    } else {
      // Add new question
      setQuizQuestions(prev => [...prev, question])
    }

    resetQuestionForm()
  }

  const handleEditQuestion = (index: number) => {
    const q = quizQuestions[index]
    setNewQuestion(q.question)
    setNewOptions([...q.options, '', '', '', ''].slice(0, 4))
    setNewCorrectAnswer(q.correctAnswer)
    setNewExplanation(q.explanation)
    setNewDifficulty(q.difficulty)
    setEditingQuestion(index)
  }

  const handleDeleteQuestion = (index: number) => {
    setQuizQuestions(prev => prev.filter((_, i) => i !== index))
    if (editingQuestion === index) {
      resetQuestionForm()
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
      if (thumbnailFile) {
        try {
          thumbnailUrl = await uploadThumbnail(tempId, thumbnailFile)
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
        authorUsername: user.username,
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

            {/* Quiz Builder */}
            {selectedType === 'quiz' && (
              <div className="space-y-4">
                <Tabs value={quizMode} onValueChange={(v) => setQuizMode(v as 'auto' | 'manual')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="auto" className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      {txt.autoGeneration}
                    </TabsTrigger>
                    <TabsTrigger value="manual" className="flex items-center gap-2">
                      <Edit3 className="h-4 w-4" />
                      {txt.manualCreation}
                    </TabsTrigger>
                  </TabsList>

                  {/* AI Generation Tab */}
                  <TabsContent value="auto" className="space-y-4 mt-4">
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
                  </TabsContent>

                  {/* Manual Creation Tab */}
                  <TabsContent value="manual" className="space-y-4 mt-4">
                    {/* Question Form */}
                    <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
                      <div className="space-y-2">
                        <Label>{txt.questionText}</Label>
                        <Textarea
                          placeholder={txt.questionPlaceholder}
                          value={newQuestion}
                          onChange={(e) => setNewQuestion(e.target.value)}
                          rows={2}
                        />
                      </div>

                      <div className="space-y-3">
                        <Label>{txt.optionPlaceholder}</Label>
                        {newOptions.map((option, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <RadioGroup
                              value={newCorrectAnswer.toString()}
                              onValueChange={(v) => setNewCorrectAnswer(parseInt(v))}
                            >
                              <RadioGroupItem
                                value={index.toString()}
                                id={`option-${index}`}
                                className="mt-0"
                              />
                            </RadioGroup>
                            <span className="font-medium text-sm w-6">
                              {String.fromCharCode(65 + index)})
                            </span>
                            <Input
                              placeholder={`${txt.optionPlaceholder} ${String.fromCharCode(65 + index)}`}
                              value={option}
                              onChange={(e) => {
                                const newOpts = [...newOptions]
                                newOpts[index] = e.target.value
                                setNewOptions(newOpts)
                              }}
                              className="flex-1"
                            />
                          </div>
                        ))}
                        <p className="text-xs text-muted-foreground">{txt.markCorrect}</p>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>{txt.difficulty}</Label>
                          <Select value={newDifficulty} onValueChange={(v) => setNewDifficulty(v as 'easy' | 'medium' | 'hard')}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="easy">{txt.difficultyLabels.easy}</SelectItem>
                              <SelectItem value="medium">{txt.difficultyLabels.medium}</SelectItem>
                              <SelectItem value="hard">{txt.difficultyLabels.hard}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>{txt.explanationLabel}</Label>
                          <Input
                            placeholder={txt.explanationPlaceholder}
                            value={newExplanation}
                            onChange={(e) => setNewExplanation(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button type="button" onClick={handleAddOrUpdateQuestion} className="flex-1">
                          <Plus className="mr-2 h-4 w-4" />
                          {editingQuestion !== null ? txt.saveQuestion : txt.addQuestion}
                        </Button>
                        {editingQuestion !== null && (
                          <Button type="button" variant="outline" onClick={resetQuestionForm}>
                            {txt.cancelEdit}
                          </Button>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Questions List / Preview */}
                {quizQuestions.length > 0 && (
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-primary/5 p-3 flex justify-between items-center border-b">
                      <span className="font-medium">
                        {txt.previewMode}: {quizQuestions.length} {txt.questionsLabel}
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
                    <div className="divide-y max-h-[500px] overflow-y-auto">
                      {quizQuestions.map((q, index) => (
                        <div key={index} className="p-4 hover:bg-muted/30 transition-colors">
                          <div className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                              {index + 1}
                            </span>
                            <div className="flex-1">
                              <div className="flex items-start justify-between gap-2 mb-3">
                                <p className="font-medium">{q.question}</p>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    q.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                                    q.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-red-100 text-red-700'
                                  }`}>
                                    {txt.difficultyLabels[q.difficulty]}
                                  </span>
                                  {quizMode === 'manual' && (
                                    <>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEditQuestion(index)}
                                      >
                                        <Edit3 className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteQuestion(index)}
                                        className="text-destructive hover:text-destructive"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </div>
                              <div className="grid gap-2 sm:grid-cols-2">
                                {q.options.map((option, optIndex) => {
                                  const isCorrect = optIndex === q.correctAnswer
                                  const letter = String.fromCharCode(65 + optIndex)
                                  return (
                                    <div
                                      key={optIndex}
                                      className={`p-3 rounded-lg border-2 transition-colors ${
                                        showQuizAnswers && isCorrect
                                          ? 'bg-green-50 border-green-400 dark:bg-green-900/20'
                                          : 'border-muted hover:border-primary/30'
                                      }`}
                                    >
                                      <span className="font-bold mr-2">{letter}.</span>
                                      {option}
                                      {showQuizAnswers && isCorrect && (
                                        <Check className="inline ml-2 h-4 w-4 text-green-600" />
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                              {showQuizAnswers && q.explanation && (
                                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200">
                                  <p className="text-sm">
                                    <strong>{txt.explanation}:</strong> {q.explanation}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {quizQuestions.length === 0 && quizMode === 'manual' && (
                  <div className="text-center py-8 text-muted-foreground border rounded-lg border-dashed">
                    <HelpCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>{txt.noQuestions}</p>
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
