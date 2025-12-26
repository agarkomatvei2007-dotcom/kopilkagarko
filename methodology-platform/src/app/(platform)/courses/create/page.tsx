'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Plus, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/hooks/useLanguage'
import { useToast } from '@/hooks/use-toast'
import { createCourse, addLesson } from '@/lib/firebase/firestore'
import { SUBJECTS, GRADES } from '@/types'

interface LessonDraft {
  id: string
  title: string
  description: string
  duration: number
}

export default function CreateCoursePage() {
  const router = useRouter()
  const { user } = useAuth()
  const { language } = useLanguage()
  const { toast } = useToast()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [subject, setSubject] = useState('')
  const [selectedGrades, setSelectedGrades] = useState<number[]>([])
  const [lessons, setLessons] = useState<LessonDraft[]>([])

  const txt = {
    ru: {
      back: 'Назад к курсам',
      title: 'Создание курса',
      subtitle: 'Создайте новый курс для студентов',
      courseTitle: 'Название курса',
      courseTitlePlaceholder: 'Введите название курса',
      courseDescription: 'Описание',
      courseDescriptionPlaceholder: 'Опишите содержание и цели курса',
      subject: 'Дисциплина',
      selectSubject: 'Выберите дисциплину',
      grades: 'Курсы обучения',
      lessonsSection: 'Уроки',
      addLesson: 'Добавить урок',
      lessonTitle: 'Название урока',
      lessonTitlePlaceholder: 'Введите название урока',
      lessonDescription: 'Описание урока',
      lessonDescriptionPlaceholder: 'Краткое описание урока',
      duration: 'Длительность (мин)',
      create: 'Создать курс',
      creating: 'Создание...',
      success: 'Курс успешно создан!',
      error: 'Ошибка при создании курса',
      loginRequired: 'Войдите, чтобы создать курс',
      fillRequired: 'Заполните обязательные поля',
    },
    kk: {
      back: 'Курстарға оралу',
      title: 'Курс құру',
      subtitle: 'Студенттер үшін жаңа курс жасаңыз',
      courseTitle: 'Курс атауы',
      courseTitlePlaceholder: 'Курс атауын енгізіңіз',
      courseDescription: 'Сипаттама',
      courseDescriptionPlaceholder: 'Курс мазмұны мен мақсаттарын сипаттаңыз',
      subject: 'Пән',
      selectSubject: 'Пәнді таңдаңыз',
      grades: 'Оқу курстары',
      lessonsSection: 'Сабақтар',
      addLesson: 'Сабақ қосу',
      lessonTitle: 'Сабақ атауы',
      lessonTitlePlaceholder: 'Сабақ атауын енгізіңіз',
      lessonDescription: 'Сабақ сипаттамасы',
      lessonDescriptionPlaceholder: 'Сабақтың қысқаша сипаттамасы',
      duration: 'Ұзақтығы (мин)',
      create: 'Курс құру',
      creating: 'Құрылуда...',
      success: 'Курс сәтті құрылды!',
      error: 'Курс құру кезінде қате',
      loginRequired: 'Курс құру үшін кіріңіз',
      fillRequired: 'Міндетті өрістерді толтырыңыз',
    },
  }

  const text = txt[language]

  const handleAddLesson = () => {
    setLessons([
      ...lessons,
      {
        id: Date.now().toString(),
        title: '',
        description: '',
        duration: 15,
      },
    ])
  }

  const handleRemoveLesson = (id: string) => {
    setLessons(lessons.filter((l) => l.id !== id))
  }

  const handleLessonChange = (id: string, field: keyof LessonDraft, value: string | number) => {
    setLessons(
      lessons.map((l) => (l.id === id ? { ...l, [field]: value } : l))
    )
  }

  const toggleGrade = (grade: number) => {
    setSelectedGrades((prev) =>
      prev.includes(grade)
        ? prev.filter((g) => g !== grade)
        : [...prev, grade].sort()
    )
  }

  const handleSubmit = async () => {
    if (!user) {
      toast({ title: text.loginRequired, variant: 'destructive' })
      return
    }

    if (!title.trim() || !description.trim() || !subject) {
      toast({ title: text.fillRequired, variant: 'destructive' })
      return
    }

    setIsSubmitting(true)
    try {
      // Create the course
      const courseId = await createCourse({
        title: title.trim(),
        description: description.trim(),
        instructorId: user.id,
        instructorName: user.displayName,
        subject,
        grades: selectedGrades,
        thumbnail: null,
        price: null,
      })

      // Add lessons
      for (let i = 0; i < lessons.length; i++) {
        const lesson = lessons[i]
        if (lesson.title.trim()) {
          await addLesson(courseId, {
            title: lesson.title.trim(),
            description: lesson.description.trim(),
            order: i + 1,
            content: { type: 'text', text: '' },
            duration: lesson.duration,
          })
        }
      }

      toast({ title: text.success })
      router.push(`/courses/${courseId}`)
    } catch (error) {
      console.error('Error creating course:', error)
      toast({ title: text.error, variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-3xl">
      <Link href="/courses">
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {text.back}
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>{text.title}</CardTitle>
          <CardDescription>{text.subtitle}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">{text.courseTitle} *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={text.courseTitlePlaceholder}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{text.courseDescription} *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={text.courseDescriptionPlaceholder}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>{text.subject} *</Label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger>
                  <SelectValue placeholder={text.selectSubject} />
                </SelectTrigger>
                <SelectContent>
                  {SUBJECTS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{text.grades}</Label>
              <div className="flex gap-2">
                {GRADES.map((grade) => (
                  <Button
                    key={grade}
                    type="button"
                    variant={selectedGrades.includes(grade) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleGrade(grade)}
                  >
                    {grade} курс
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Lessons */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base">{text.lessonsSection}</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddLesson}
              >
                <Plus className="h-4 w-4 mr-2" />
                {text.addLesson}
              </Button>
            </div>

            {lessons.map((lesson, index) => (
              <Card key={lesson.id} className="bg-muted/50">
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {text.lessonsSection} {index + 1}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveLesson(lesson.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Input
                      placeholder={text.lessonTitlePlaceholder}
                      value={lesson.title}
                      onChange={(e) =>
                        handleLessonChange(lesson.id, 'title', e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      placeholder={text.lessonDescriptionPlaceholder}
                      value={lesson.description}
                      onChange={(e) =>
                        handleLessonChange(lesson.id, 'description', e.target.value)
                      }
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">{text.duration}:</Label>
                    <Input
                      type="number"
                      className="w-24"
                      value={lesson.duration}
                      onChange={(e) =>
                        handleLessonChange(lesson.id, 'duration', parseInt(e.target.value) || 0)
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Submit */}
          <Button
            className="w-full"
            size="lg"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {text.creating}
              </>
            ) : (
              text.create
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
