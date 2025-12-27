'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  BookOpen,
  PlayCircle,
  Clock,
  Users,
  Star,
  CheckCircle,
  Lock,
  ChevronDown,
  ChevronRight,
  Loader2,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/hooks/useLanguage'
import { useToast } from '@/hooks/use-toast'
import { getCourse, getCourseLessons, enrollInCourse, isEnrolledInCourse, getUser, getEnrollmentData, type EnrollmentData } from '@/lib/firebase/firestore'
import { getInitials } from '@/lib/utils'
import type { Course, Lesson, User } from '@/types'

export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { language } = useLanguage()
  const { toast } = useToast()

  const [course, setCourse] = useState<Course | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [instructor, setInstructor] = useState<User | null>(null)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [enrollmentData, setEnrollmentData] = useState<EnrollmentData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEnrolling, setIsEnrolling] = useState(false)
  const [openModules, setOpenModules] = useState<string[]>([])

  const txt = {
    ru: {
      back: 'Назад к курсам',
      courseContent: 'Содержание курса',
      lessons: 'уроков',
      yourProgress: 'Ваш прогресс',
      lessonsCompleted: 'уроков завершено',
      completed: 'завершено',
      continueLearn: 'Продолжить обучение',
      free: 'Бесплатно',
      enroll: 'Записаться на курс',
      freeAccess: 'Бесплатный доступ ко всем материалам',
      courseIncludes: 'Этот курс включает',
      videoLessons: 'видеоуроков',
      videoTime: 'видео',
      practicalTasks: 'Практические задания',
      certificate: 'Сертификат по окончании',
      students: 'студентов',
      reviews: 'отзывов',
      notFound: 'Курс не найден',
      enrolled: 'Вы успешно записались на курс',
      loginToEnroll: 'Войдите, чтобы записаться на курс',
    },
    kk: {
      back: 'Курстарға оралу',
      courseContent: 'Курс мазмұны',
      lessons: 'сабақ',
      yourProgress: 'Сіздің прогресіңіз',
      lessonsCompleted: 'сабақ аяқталды',
      completed: 'аяқталды',
      continueLearn: 'Оқуды жалғастыру',
      free: 'Тегін',
      enroll: 'Курсқа жазылу',
      freeAccess: 'Барлық материалдарға тегін қол жеткізу',
      courseIncludes: 'Бұл курс қамтиды',
      videoLessons: 'бейнесабақ',
      videoTime: 'бейне',
      practicalTasks: 'Практикалық тапсырмалар',
      certificate: 'Аяқтағаннан кейін сертификат',
      students: 'студент',
      reviews: 'пікір',
      notFound: 'Курс табылмады',
      enrolled: 'Сіз курсқа сәтті жазылдыңыз',
      loginToEnroll: 'Курсқа жазылу үшін кіріңіз',
    },
  }

  const text = txt[language]

  useEffect(() => {
    const loadCourse = async () => {
      if (!params.id) return

      try {
        const courseId = params.id as string
        const courseData = await getCourse(courseId)

        if (!courseData) {
          setIsLoading(false)
          return
        }

        setCourse(courseData)

        // Load lessons
        const courseLessons = await getCourseLessons(courseId)
        setLessons(courseLessons)

        // Open first module by default
        if (courseLessons.length > 0) {
          setOpenModules(['module-0'])
        }

        // Load instructor info
        if (courseData.instructorId) {
          const instructorData = await getUser(courseData.instructorId)
          setInstructor(instructorData)
        }

        // Check if user is enrolled and get progress
        if (user) {
          const enrolled = await isEnrolledInCourse(courseId, user.id)
          setIsEnrolled(enrolled)

          if (enrolled) {
            const enrollment = await getEnrollmentData(courseId, user.id)
            setEnrollmentData(enrollment)
          }
        }
      } catch (error) {
        console.error('Error loading course:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadCourse()
  }, [params.id, user])

  const handleEnroll = async () => {
    if (!user) {
      toast({ title: text.loginToEnroll, variant: 'destructive' })
      return
    }

    if (!course) return

    setIsEnrolling(true)
    try {
      await enrollInCourse(course.id, user.id)
      setIsEnrolled(true)
      // Get enrollment data after enrolling
      const enrollment = await getEnrollmentData(course.id, user.id)
      setEnrollmentData(enrollment)
      toast({ title: text.enrolled })
    } catch (error) {
      console.error('Error enrolling:', error)
    } finally {
      setIsEnrolling(false)
    }
  }

  const toggleModule = (moduleId: string) => {
    setOpenModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    )
  }

  // Group lessons into modules (for now, all lessons in one module)
  const modules = lessons.length > 0 ? [{
    id: 'module-0',
    title: text.courseContent,
    lessons: lessons,
  }] : []

  const totalLessons = lessons.length
  const completedLessons = enrollmentData?.completedLessons?.length || 0
  const progress = enrollmentData?.progress || 0

  // Find the next lesson to continue
  const nextLesson = lessons.find(lesson => !enrollmentData?.completedLessons?.includes(lesson.id))

  const handleContinueLearning = () => {
    if (nextLesson && course) {
      router.push(`/courses/${course.id}/lessons/${nextLesson.id}`)
    } else if (lessons.length > 0 && course) {
      // All completed, go to first lesson
      router.push(`/courses/${course.id}/lessons/${lessons[0].id}`)
    }
  }

  const handleLessonClick = (lesson: Lesson) => {
    if (!course) return
    if (isEnrolled) {
      router.push(`/courses/${course.id}/lessons/${lesson.id}`)
    }
  }

  const isLessonComplete = (lessonId: string) => {
    return enrollmentData?.completedLessons?.includes(lessonId) || false
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="container mx-auto py-6 px-4">
        <Link href="/courses">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {text.back}
          </Button>
        </Link>
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">{text.notFound}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <Link href="/courses">
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {text.back}
        </Button>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">{course.subject}</Badge>
              {course.grades.length > 0 && (
                <Badge variant="secondary">
                  {course.grades.length === 1
                    ? `${course.grades[0]} курс`
                    : `${course.grades[0]}-${course.grades[course.grades.length - 1]} курс`}
                </Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
            <p className="text-muted-foreground">{course.description}</p>
          </div>

          <div className="flex items-center gap-6 text-sm">
            <Link href={`/profile/${course.instructorId}`} className="flex items-center gap-2 hover:opacity-80">
              <Avatar className="h-10 w-10">
                <AvatarImage src={instructor?.avatar || undefined} />
                <AvatarFallback>{getInitials(course.instructorName)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{course.instructorName}</p>
                {instructor?.school && (
                  <p className="text-xs text-muted-foreground">{instructor.school}</p>
                )}
              </div>
            </Link>
          </div>

          <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <PlayCircle className="h-4 w-4" />
              {course.lessonsCount} {text.lessons}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {course.stats.enrollments} {text.students}
            </span>
            {course.stats.rating > 0 && (
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500" />
                {course.stats.rating.toFixed(1)} ({course.stats.reviews} {text.reviews})
              </span>
            )}
          </div>

          <Separator />

          {/* Course content */}
          <div>
            <h2 className="text-xl font-semibold mb-4">{text.courseContent}</h2>
            {modules.length > 0 ? (
              <div className="space-y-2">
                {modules.map((module) => (
                  <Collapsible
                    key={module.id}
                    open={openModules.includes(module.id)}
                    onOpenChange={() => toggleModule(module.id)}
                  >
                    <Card>
                      <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {openModules.includes(module.id) ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                              <CardTitle className="text-base">{module.title}</CardTitle>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {module.lessons.length} {text.lessons}
                            </span>
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <CardContent className="pt-0">
                          <div className="space-y-2">
                            {module.lessons.map((lesson, index) => (
                              <div
                                key={lesson.id}
                                onClick={() => handleLessonClick(lesson)}
                                className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                                  isEnrolled
                                    ? 'cursor-pointer hover:bg-muted/50'
                                    : index === 0
                                      ? 'cursor-pointer hover:bg-muted/50'
                                      : ''
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  {isEnrolled ? (
                                    isLessonComplete(lesson.id) ? (
                                      <CheckCircle className="h-5 w-5 text-green-500" />
                                    ) : (
                                      <PlayCircle className="h-5 w-5 text-primary" />
                                    )
                                  ) : index === 0 ? (
                                    <PlayCircle className="h-5 w-5 text-primary" />
                                  ) : (
                                    <Lock className="h-5 w-5 text-muted-foreground" />
                                  )}
                                  <span className={isLessonComplete(lesson.id) ? 'text-muted-foreground' : ''}>
                                    {lesson.title}
                                  </span>
                                  {!isEnrolled && index === 0 && (
                                    <Badge variant="outline" className="text-xs">
                                      {text.free}
                                    </Badge>
                                  )}
                                  {isLessonComplete(lesson.id) && (
                                    <Badge variant="secondary" className="text-xs">
                                      {text.completed}
                                    </Badge>
                                  )}
                                </div>
                                <span className="text-sm text-muted-foreground">
                                  {lesson.duration} мин
                                </span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <PlayCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Уроки ещё не добавлены</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card className="sticky top-20">
            <CardHeader>
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <BookOpen className="h-16 w-16 text-muted-foreground" />
                )}
              </div>
              {isEnrolled ? (
                <>
                  <CardTitle className="text-lg">{text.yourProgress}</CardTitle>
                  <CardDescription>
                    {completedLessons} из {totalLessons} {text.lessonsCompleted}
                  </CardDescription>
                </>
              ) : (
                <CardTitle className="text-2xl">{text.free}</CardTitle>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {isEnrolled ? (
                <>
                  <Progress value={progress} className="h-2" />
                  <p className="text-sm text-center text-muted-foreground">{progress}% {text.completed}</p>
                  <Button className="w-full" onClick={handleContinueLearning}>
                    {text.continueLearn}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleEnroll}
                    disabled={isEnrolling}
                  >
                    {isEnrolling ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    {text.enroll}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    {text.freeAccess}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{text.courseIncludes}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <PlayCircle className="h-4 w-4 text-muted-foreground" />
                  {course.lessonsCount} {text.videoLessons}
                </li>
                <li className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  {text.practicalTasks}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  {text.certificate}
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
