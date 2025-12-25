'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
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

// Demo course data
const courseData = {
  id: '1',
  title: 'Основы математики для 5 класса',
  description: 'Полный курс по математике для пятиклассников. Включает теорию, практику и проверочные задания по всем основным темам программы.',
  thumbnail: null,
  author: {
    id: '1',
    name: 'Иванова Мария Александровна',
    avatar: null,
    title: 'Учитель математики высшей категории',
  },
  subject: 'Математика',
  duration: '12 часов',
  lessonsCount: 24,
  studentsCount: 156,
  rating: 4.8,
  reviewsCount: 42,
  modules: [
    {
      id: '1',
      title: 'Введение в курс',
      lessons: [
        { id: '1', title: 'Добро пожаловать на курс', duration: '5 мин', completed: true, free: true },
        { id: '2', title: 'Как проходить курс', duration: '8 мин', completed: true, free: true },
      ],
    },
    {
      id: '2',
      title: 'Натуральные числа',
      lessons: [
        { id: '3', title: 'Понятие натурального числа', duration: '15 мин', completed: true, free: false },
        { id: '4', title: 'Сложение и вычитание', duration: '20 мин', completed: false, free: false },
        { id: '5', title: 'Умножение и деление', duration: '25 мин', completed: false, free: false },
        { id: '6', title: 'Практические задания', duration: '30 мин', completed: false, free: false },
      ],
    },
    {
      id: '3',
      title: 'Дроби',
      lessons: [
        { id: '7', title: 'Обыкновенные дроби', duration: '20 мин', completed: false, free: false },
        { id: '8', title: 'Десятичные дроби', duration: '25 мин', completed: false, free: false },
        { id: '9', title: 'Действия с дробями', duration: '30 мин', completed: false, free: false },
      ],
    },
  ],
}

export default function CourseDetailPage() {
  const params = useParams()
  const { user } = useAuth()
  const [openModules, setOpenModules] = useState<string[]>(['1', '2'])
  const [isEnrolled, setIsEnrolled] = useState(false)

  const course = courseData
  const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0)
  const completedLessons = course.modules.reduce(
    (sum, m) => sum + m.lessons.filter(l => l.completed).length,
    0
  )
  const progress = Math.round((completedLessons / totalLessons) * 100)

  const toggleModule = (moduleId: string) => {
    setOpenModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    )
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <Link href="/courses">
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад к курсам
        </Button>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">{course.subject}</Badge>
              <Badge variant="secondary">5 класс</Badge>
            </div>
            <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
            <p className="text-muted-foreground">{course.description}</p>
          </div>

          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Avatar className="h-10 w-10">
                <AvatarImage src={course.author.avatar || undefined} />
                <AvatarFallback>{course.author.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{course.author.name}</p>
                <p className="text-xs text-muted-foreground">{course.author.title}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <PlayCircle className="h-4 w-4" />
              {course.lessonsCount} уроков
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {course.duration}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {course.studentsCount} учеников
            </span>
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500" />
              {course.rating} ({course.reviewsCount} отзывов)
            </span>
          </div>

          <Separator />

          {/* Course content */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Содержание курса</h2>
            <div className="space-y-2">
              {course.modules.map((module) => (
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
                            {module.lessons.length} уроков
                          </span>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          {module.lessons.map((lesson) => (
                            <div
                              key={lesson.id}
                              className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                {lesson.completed ? (
                                  <CheckCircle className="h-5 w-5 text-green-500" />
                                ) : lesson.free || isEnrolled ? (
                                  <PlayCircle className="h-5 w-5 text-primary" />
                                ) : (
                                  <Lock className="h-5 w-5 text-muted-foreground" />
                                )}
                                <span className={lesson.completed ? 'text-muted-foreground' : ''}>
                                  {lesson.title}
                                </span>
                                {lesson.free && !isEnrolled && (
                                  <Badge variant="outline" className="text-xs">
                                    Бесплатно
                                  </Badge>
                                )}
                              </div>
                              <span className="text-sm text-muted-foreground">{lesson.duration}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card className="sticky top-20">
            <CardHeader>
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="h-16 w-16 text-muted-foreground" />
              </div>
              {isEnrolled ? (
                <>
                  <CardTitle className="text-lg">Ваш прогресс</CardTitle>
                  <CardDescription>
                    {completedLessons} из {totalLessons} уроков завершено
                  </CardDescription>
                </>
              ) : (
                <CardTitle className="text-2xl">Бесплатно</CardTitle>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {isEnrolled ? (
                <>
                  <Progress value={progress} className="h-2" />
                  <p className="text-sm text-center text-muted-foreground">{progress}% завершено</p>
                  <Button className="w-full">Продолжить обучение</Button>
                </>
              ) : (
                <>
                  <Button className="w-full" size="lg" onClick={() => setIsEnrolled(true)}>
                    Записаться на курс
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Бесплатный доступ ко всем материалам
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Этот курс включает</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <PlayCircle className="h-4 w-4 text-muted-foreground" />
                  {course.lessonsCount} видеоуроков
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  {course.duration} видео
                </li>
                <li className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  Практические задания
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  Сертификат по окончании
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
