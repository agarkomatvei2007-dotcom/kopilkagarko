'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  PlayCircle,
  Clock,
  BookOpen,
  Loader2,
  FileText,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/hooks/useLanguage'
import { useToast } from '@/hooks/use-toast'
import {
  getCourse,
  getCourseLessons,
  getLesson,
  isEnrolledInCourse,
  getEnrollmentData,
  markLessonComplete,
  type EnrollmentData,
} from '@/lib/firebase/firestore'
import type { Course, Lesson } from '@/types'

export default function LessonPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { language } = useLanguage()
  const { toast } = useToast()

  const [course, setCourse] = useState<Course | null>(null)
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [allLessons, setAllLessons] = useState<Lesson[]>([])
  const [enrollmentData, setEnrollmentData] = useState<EnrollmentData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCompleting, setIsCompleting] = useState(false)

  const txt = {
    ru: {
      backToCourse: 'К курсу',
      lessonCompleted: 'Урок завершён',
      markComplete: 'Отметить как пройденный',
      nextLesson: 'Следующий урок',
      prevLesson: 'Предыдущий урок',
      courseProgress: 'Прогресс курса',
      lessonsOf: 'из',
      completed: 'завершено',
      notEnrolled: 'Вы не записаны на этот курс',
      enrollNow: 'Записаться на курс',
      notFound: 'Урок не найден',
      minutes: 'мин',
      lessonCompleteToast: 'Урок успешно пройден!',
    },
    kk: {
      backToCourse: 'Курсқа',
      lessonCompleted: 'Сабақ аяқталды',
      markComplete: 'Аяқталды деп белгілеу',
      nextLesson: 'Келесі сабақ',
      prevLesson: 'Алдыңғы сабақ',
      courseProgress: 'Курс прогресі',
      lessonsOf: 'ішінен',
      completed: 'аяқталды',
      notEnrolled: 'Сіз бұл курсқа жазылмағансыз',
      enrollNow: 'Курсқа жазылу',
      notFound: 'Сабақ табылмады',
      minutes: 'мин',
      lessonCompleteToast: 'Сабақ сәтті аяқталды!',
    },
  }

  const text = txt[language]

  const courseId = params.id as string
  const lessonId = params.lessonId as string

  useEffect(() => {
    const loadData = async () => {
      if (!courseId || !lessonId) return

      try {
        // Load course
        const courseData = await getCourse(courseId)
        if (!courseData) {
          setIsLoading(false)
          return
        }
        setCourse(courseData)

        // Load all lessons
        const lessons = await getCourseLessons(courseId)
        setAllLessons(lessons)

        // Load current lesson
        const lessonData = await getLesson(courseId, lessonId)
        setLesson(lessonData)

        // Check enrollment and load progress
        if (user) {
          const enrolled = await isEnrolledInCourse(courseId, user.id)
          if (enrolled) {
            const enrollment = await getEnrollmentData(courseId, user.id)
            setEnrollmentData(enrollment)
          }
        }
      } catch (error) {
        console.error('Error loading lesson:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [courseId, lessonId, user])

  const handleMarkComplete = async () => {
    if (!user || !lesson) return

    setIsCompleting(true)
    try {
      await markLessonComplete(courseId, lessonId, user.id)
      // Refresh enrollment data
      const enrollment = await getEnrollmentData(courseId, user.id)
      setEnrollmentData(enrollment)
      toast({ title: text.lessonCompleteToast })
    } catch (error) {
      console.error('Error completing lesson:', error)
    } finally {
      setIsCompleting(false)
    }
  }

  const isLessonCompleted = enrollmentData?.completedLessons?.includes(lessonId) || false

  // Find current, previous and next lessons
  const currentIndex = allLessons.findIndex(l => l.id === lessonId)
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null

  const completedCount = enrollmentData?.completedLessons?.length || 0
  const totalLessons = allLessons.length
  const progress = enrollmentData?.progress || 0

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!course || !lesson) {
    return (
      <div className="container mx-auto py-6 px-4">
        <Link href={`/courses/${courseId}`}>
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {text.backToCourse}
          </Button>
        </Link>
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">{text.notFound}</p>
        </div>
      </div>
    )
  }

  // Check if user is enrolled
  if (!enrollmentData && user) {
    return (
      <div className="container mx-auto py-6 px-4">
        <Link href={`/courses/${courseId}`}>
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {text.backToCourse}
          </Button>
        </Link>
        <Card className="max-w-md mx-auto">
          <CardContent className="py-8 text-center">
            <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">{text.notEnrolled}</p>
            <Button onClick={() => router.push(`/courses/${courseId}`)}>
              {text.enrollNow}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link href={`/courses/${courseId}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {text.backToCourse}
          </Button>
        </Link>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{completedCount} {text.lessonsOf} {totalLessons} {text.completed}</span>
          <Progress value={progress} className="w-24 h-2" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main content */}
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">{course.subject}</Badge>
                <Badge variant="secondary">
                  <Clock className="h-3 w-3 mr-1" />
                  {lesson.duration} {text.minutes}
                </Badge>
                {isLessonCompleted && (
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {text.lessonCompleted}
                  </Badge>
                )}
              </div>
              <CardTitle className="text-2xl">{lesson.title}</CardTitle>
              {lesson.description && (
                <p className="text-muted-foreground">{lesson.description}</p>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Lesson content based on type */}
              {lesson.content.type === 'video' && lesson.content.videoUrl && (
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  <iframe
                    src={lesson.content.videoUrl}
                    className="w-full h-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                </div>
              )}

              {lesson.content.type === 'text' && lesson.content.text && (
                <div className="prose prose-lg max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: lesson.content.text }} />
                </div>
              )}

              {lesson.content.type === 'quiz' && lesson.content.quiz && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <FileText className="h-5 w-5" />
                    <span>Тест: {lesson.content.quiz.questions.length} вопросов</span>
                  </div>
                  {/* Quiz implementation would go here */}
                </div>
              )}

              <Separator />

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                {!isLessonCompleted && (
                  <Button
                    onClick={handleMarkComplete}
                    disabled={isCompleting}
                    className="flex-1"
                  >
                    {isCompleting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    {text.markComplete}
                  </Button>
                )}

                {nextLesson && (
                  <Button
                    variant={isLessonCompleted ? "default" : "outline"}
                    onClick={() => router.push(`/courses/${courseId}/lessons/${nextLesson.id}`)}
                    className="flex-1"
                  >
                    {text.nextLesson}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Lessons list */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{text.courseProgress}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-muted-foreground text-center">
                {progress}% {text.completed}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{course.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 max-h-[400px] overflow-y-auto">
              {allLessons.map((l, index) => {
                const isComplete = enrollmentData?.completedLessons?.includes(l.id) || false
                const isCurrent = l.id === lessonId

                return (
                  <div
                    key={l.id}
                    onClick={() => router.push(`/courses/${courseId}/lessons/${l.id}`)}
                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                      isCurrent
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-muted'
                    }`}
                  >
                    {isComplete ? (
                      <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                    ) : (
                      <PlayCircle className={`h-4 w-4 shrink-0 ${isCurrent ? 'text-primary' : 'text-muted-foreground'}`} />
                    )}
                    <span className={`text-sm truncate ${isComplete ? 'text-muted-foreground' : ''}`}>
                      {index + 1}. {l.title}
                    </span>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex gap-2">
            {prevLesson && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => router.push(`/courses/${courseId}/lessons/${prevLesson.id}`)}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                {text.prevLesson}
              </Button>
            )}
            {nextLesson && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => router.push(`/courses/${courseId}/lessons/${nextLesson.id}`)}
              >
                {text.nextLesson}
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
