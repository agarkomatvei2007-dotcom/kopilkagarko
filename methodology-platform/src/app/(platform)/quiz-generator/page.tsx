'use client'

import { useState } from 'react'
import { Sparkles, Loader2, Copy, Download, Check, RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/hooks/useLanguage'
import { useToast } from '@/hooks/use-toast'
import { SUBJECTS, GRADES, GRADE_LABELS } from '@/types'
import { cn } from '@/lib/utils'

interface QuizQuestion {
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  difficulty: 'easy' | 'medium' | 'hard'
}

export default function QuizGeneratorPage() {
  const { user } = useAuth()
  const { language } = useLanguage()
  const { toast } = useToast()

  const [topic, setTopic] = useState('')
  const [subject, setSubject] = useState('')
  const [grade, setGrade] = useState('')
  const [questionsCount, setQuestionsCount] = useState('10')
  const [isLoading, setIsLoading] = useState(false)
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [showAnswers, setShowAnswers] = useState(false)
  const [copied, setCopied] = useState(false)

  const txt = language === 'ru' ? {
    title: 'Генератор тестов',
    subtitle: 'Создавайте тесты с помощью ИИ за секунды',
    topic: 'Тема теста',
    topicPlaceholder: 'Например: Квадратные уравнения',
    subject: 'Предмет',
    selectSubject: 'Выберите предмет',
    grade: 'Курс',
    selectGrade: 'Выберите курс',
    questionsCount: 'Количество вопросов',
    generate: 'Сгенерировать тест',
    generating: 'Генерирую...',
    regenerate: 'Сгенерировать заново',
    showAnswers: 'Показать ответы',
    hideAnswers: 'Скрыть ответы',
    copy: 'Копировать',
    copied: 'Скопировано!',
    download: 'Скачать',
    loginRequired: 'Войдите, чтобы использовать генератор тестов',
    question: 'Вопрос',
    correctAnswer: 'Правильный ответ',
    explanation: 'Объяснение',
    difficulty: {
      easy: 'Лёгкий',
      medium: 'Средний',
      hard: 'Сложный',
    },
    error: 'Ошибка при генерации теста',
    fillAllFields: 'Заполните все поля',
  } : {
    title: 'Тест генераторы',
    subtitle: 'ЖИ көмегімен тесттерді секундтарда жасаңыз',
    topic: 'Тест тақырыбы',
    topicPlaceholder: 'Мысалы: Квадрат теңдеулер',
    subject: 'Пән',
    selectSubject: 'Пәнді таңдаңыз',
    grade: 'Курс',
    selectGrade: 'Курсты таңдаңыз',
    questionsCount: 'Сұрақтар саны',
    generate: 'Тест жасау',
    generating: 'Жасалуда...',
    regenerate: 'Қайта жасау',
    showAnswers: 'Жауаптарды көрсету',
    hideAnswers: 'Жауаптарды жасыру',
    copy: 'Көшіру',
    copied: 'Көшірілді!',
    download: 'Жүктеу',
    loginRequired: 'Тест генераторын пайдалану үшін кіріңіз',
    question: 'Сұрақ',
    correctAnswer: 'Дұрыс жауап',
    explanation: 'Түсіндірме',
    difficulty: {
      easy: 'Оңай',
      medium: 'Орташа',
      hard: 'Қиын',
    },
    error: 'Тест жасау кезінде қате',
    fillAllFields: 'Барлық өрістерді толтырыңыз',
  }

  const handleGenerate = async () => {
    if (!topic || !subject || !grade) {
      toast({
        title: txt.error,
        description: txt.fillAllFields,
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)
    setQuestions([])

    try {
      const response = await fetch('/api/ai/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          subject,
          grade: parseInt(grade),
          questionsCount: parseInt(questionsCount),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate quiz')
      }

      setQuestions(data.questions)
    } catch (error) {
      console.error('Error generating quiz:', error)
      toast({
        title: txt.error,
        description: error instanceof Error ? error.message : txt.error,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = () => {
    const text = questions.map((q, i) => {
      let questionText = `${i + 1}. ${q.question}\n`
      q.options.forEach((opt, j) => {
        const letter = String.fromCharCode(65 + j)
        questionText += `   ${letter}) ${opt}\n`
      })
      if (showAnswers) {
        const correctLetter = String.fromCharCode(65 + q.correctAnswer)
        questionText += `   ${txt.correctAnswer}: ${correctLetter}\n`
        questionText += `   ${txt.explanation}: ${q.explanation}\n`
      }
      return questionText
    }).join('\n')

    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const text = questions.map((q, i) => {
      let questionText = `${i + 1}. ${q.question}\n`
      q.options.forEach((opt, j) => {
        const letter = String.fromCharCode(65 + j)
        questionText += `   ${letter}) ${opt}\n`
      })
      return questionText
    }).join('\n')

    const answersText = '\n\n--- ОТВЕТЫ ---\n\n' + questions.map((q, i) => {
      const correctLetter = String.fromCharCode(65 + q.correctAnswer)
      return `${i + 1}. ${correctLetter} - ${q.explanation}`
    }).join('\n')

    const blob = new Blob([text + answersText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `test_${topic.replace(/\s+/g, '_')}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">{txt.loginRequired}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          {txt.title}
        </h1>
        <p className="text-muted-foreground">{txt.subtitle}</p>
      </div>

      {/* Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">{txt.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>{txt.topic}</Label>
              <Input
                placeholder={txt.topicPlaceholder}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>{txt.subject}</Label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger>
                  <SelectValue placeholder={txt.selectSubject} />
                </SelectTrigger>
                <SelectContent>
                  {SUBJECTS.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{txt.grade}</Label>
              <Select value={grade} onValueChange={setGrade}>
                <SelectTrigger>
                  <SelectValue placeholder={txt.selectGrade} />
                </SelectTrigger>
                <SelectContent>
                  {GRADES.map((g) => (
                    <SelectItem key={g} value={g.toString()}>
                      {GRADE_LABELS[language][g]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{txt.questionsCount}</Label>
              <Select value={questionsCount} onValueChange={setQuestionsCount}>
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
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {txt.generating}
              </>
            ) : questions.length > 0 ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                {txt.regenerate}
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                {txt.generate}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {questions.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">
              {txt.question}: {questions.length}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAnswers(!showAnswers)}
              >
                {showAnswers ? txt.hideAnswers : txt.showAnswers}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
              >
                {copied ? (
                  <>
                    <Check className="mr-1 h-4 w-4" />
                    {txt.copied}
                  </>
                ) : (
                  <>
                    <Copy className="mr-1 h-4 w-4" />
                    {txt.copy}
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
              >
                <Download className="mr-1 h-4 w-4" />
                {txt.download}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {questions.map((q, index) => (
              <div key={index} className="border-b pb-4 last:border-0">
                <div className="flex items-start gap-3 mb-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium">{q.question}</p>
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full",
                      q.difficulty === 'easy' && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                      q.difficulty === 'medium' && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
                      q.difficulty === 'hard' && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    )}>
                      {txt.difficulty[q.difficulty]}
                    </span>
                  </div>
                </div>
                <div className="ml-11 space-y-2">
                  {q.options.map((option, optIndex) => {
                    const isCorrect = optIndex === q.correctAnswer
                    const letter = String.fromCharCode(65 + optIndex)
                    return (
                      <div
                        key={optIndex}
                        className={cn(
                          "p-2 rounded-lg border",
                          showAnswers && isCorrect && "bg-green-50 border-green-300 dark:bg-green-900/20 dark:border-green-800"
                        )}
                      >
                        <span className="font-medium mr-2">{letter})</span>
                        {option}
                        {showAnswers && isCorrect && (
                          <Check className="inline ml-2 h-4 w-4 text-green-600" />
                        )}
                      </div>
                    )
                  })}
                  {showAnswers && (
                    <div className="mt-3 p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        <strong>{txt.explanation}:</strong> {q.explanation}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
