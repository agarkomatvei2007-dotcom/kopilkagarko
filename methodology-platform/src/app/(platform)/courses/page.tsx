'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BookOpen, Plus, Clock, Users, Star, PlayCircle, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/hooks/useLanguage'
import { getCourses, getUserEnrolledCourses, getEnrollmentData, type EnrollmentData } from '@/lib/firebase/firestore'
import type { Course } from '@/types'

interface CourseWithProgress extends Course {
  enrollmentProgress?: number
  completedLessons?: number
}

export default function CoursesPage() {
  const { user } = useAuth()
  const { language } = useLanguage()
  const [activeTab, setActiveTab] = useState('all')
  const [allCourses, setAllCourses] = useState<Course[]>([])
  const [myCourses, setMyCourses] = useState<Course[]>([])
  const [enrolledCourses, setEnrolledCourses] = useState<CourseWithProgress[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const txt = {
    ru: {
      title: 'Курсы',
      createCourse: 'Создать курс',
      allCourses: 'Все курсы',
      myCourses: 'Мои курсы',
      enrolled: 'Я изучаю',
      lessons: 'уроков',
      hours: 'часов',
      noCreated: 'Вы ещё не создали ни одного курса',
      createFirst: 'Создать первый курс',
      noEnrolled: 'Вы ещё не записались ни на один курс',
      viewCourses: 'Посмотреть доступные курсы',
      progress: 'Прогресс',
      continue: 'Продолжить',
      noCourses: 'Курсов пока нет',
      noCoursesDescription: 'Станьте первым, кто создаст курс на платформе',
      students: 'студентов',
      enroll: 'Записаться',
    },
    kk: {
      title: 'Курстар',
      createCourse: 'Курс жасау',
      allCourses: 'Барлық курстар',
      myCourses: 'Менің курстарым',
      enrolled: 'Мен оқып жатырмын',
      lessons: 'сабақ',
      hours: 'сағат',
      noCreated: 'Сіз әлі бірде-бір курс жасаған жоқсыз',
      createFirst: 'Алғашқы курсты жасау',
      noEnrolled: 'Сіз әлі бірде-бір курсқа жазылған жоқсыз',
      viewCourses: 'Қолжетімді курстарды қарау',
      progress: 'Прогресс',
      continue: 'Жалғастыру',
      noCourses: 'Курстар әлі жоқ',
      noCoursesDescription: 'Платформада алғашқы курсты жасаңыз',
      students: 'студент',
      enroll: 'Жазылу',
    },
  }

  const text = txt[language]

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const courses = await getCourses({}, 50)
        setAllCourses(courses)

        if (user) {
          // Filter my courses (where I'm the instructor)
          setMyCourses(courses.filter(c => c.instructorId === user.id))
          // Get enrolled courses with progress
          const enrolled = await getUserEnrolledCourses(user.id)
          const enrolledWithProgress: CourseWithProgress[] = await Promise.all(
            enrolled.map(async (course) => {
              const enrollment = await getEnrollmentData(course.id, user.id)
              return {
                ...course,
                enrollmentProgress: enrollment?.progress || 0,
                completedLessons: enrollment?.completedLessons?.length || 0,
              }
            })
          )
          setEnrolledCourses(enrolledWithProgress)
        }
      } catch (error) {
        console.error('Error loading courses:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadCourses()
  }, [user])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const renderCourseCard = (course: CourseWithProgress, showProgress = false) => (
    <Link href={`/courses/${course.id}`} key={course.id}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <Badge variant="outline">{course.subject}</Badge>
          </div>
          <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
        </CardHeader>
        <CardContent className="pb-2">
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {course.description}
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <PlayCircle className="h-4 w-4" />
              {course.lessonsCount} {text.lessons}
            </span>
          </div>
          {showProgress && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>{text.progress}</span>
                <span>{course.enrollmentProgress || 0}%</span>
              </div>
              <Progress value={course.enrollmentProgress || 0} />
              <p className="text-xs text-muted-foreground">
                {course.completedLessons || 0} / {course.lessonsCount} {text.lessons}
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="pt-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{course.stats.enrollments} {text.students}</span>
            {course.stats.rating > 0 && (
              <>
                <Star className="h-4 w-4 text-yellow-500 ml-2" />
                <span>{course.stats.rating.toFixed(1)}</span>
              </>
            )}
          </div>
          <span className="text-sm text-muted-foreground">{course.instructorName}</span>
        </CardFooter>
      </Card>
    </Link>
  )

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{text.title}</h1>
        <Link href="/courses/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {text.createCourse}
          </Button>
        </Link>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">{text.allCourses}</TabsTrigger>
          <TabsTrigger value="my">{text.myCourses}</TabsTrigger>
          <TabsTrigger value="enrolled">{text.enrolled}</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {allCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allCourses.map((course) => renderCourseCard(course))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="font-medium mb-2">{text.noCourses}</p>
              <p className="text-muted-foreground mb-4">{text.noCoursesDescription}</p>
              <Link href="/courses/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  {text.createFirst}
                </Button>
              </Link>
            </div>
          )}
        </TabsContent>

        <TabsContent value="my" className="mt-6">
          {myCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myCourses.map((course) => renderCourseCard(course))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">{text.noCreated}</p>
              <Link href="/courses/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  {text.createFirst}
                </Button>
              </Link>
            </div>
          )}
        </TabsContent>

        <TabsContent value="enrolled" className="mt-6">
          {enrolledCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {enrolledCourses.map((course) => renderCourseCard(course, true))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">{text.noEnrolled}</p>
              <Button variant="outline" onClick={() => setActiveTab('all')}>
                {text.viewCourses}
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
