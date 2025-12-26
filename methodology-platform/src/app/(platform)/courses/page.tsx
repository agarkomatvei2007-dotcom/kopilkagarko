'use client'

import { useState } from 'react'
import { BookOpen, Plus, Clock, Users, Star, PlayCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/hooks/useLanguage'

// Placeholder data for demonstration
const sampleCourses = [
  {
    id: '1',
    title: 'Основы программирования на Python',
    titleKk: 'Python-да программалау негіздері',
    description: 'Полный курс по основам программирования для студентов 1-2 курса',
    descriptionKk: '1-2 курс студенттеріне арналған программалау негіздері бойынша толық курс',
    thumbnail: null,
    lessonsCount: 24,
    duration: '12',
    students: 156,
    rating: 4.8,
    progress: 0,
    author: 'Иванова М.А.',
    subject: 'Программирование',
    subjectKk: 'Программалау',
  },
  {
    id: '2',
    title: 'Базы данных: SQL и проектирование',
    titleKk: 'Деректер қоры: SQL және жобалау',
    description: 'Курс по проектированию и работе с базами данных',
    descriptionKk: 'Деректер қорын жобалау және онымен жұмыс істеу курсы',
    thumbnail: null,
    lessonsCount: 18,
    duration: '9',
    students: 89,
    rating: 4.6,
    progress: 45,
    author: 'Петрова Е.В.',
    subject: 'Базы данных',
    subjectKk: 'Деректер қоры',
  },
]

export default function CoursesPage() {
  const { user } = useAuth()
  const { language } = useLanguage()
  const [activeTab, setActiveTab] = useState('all')

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
    },
  }

  const text = txt[language]

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{text.title}</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          {text.createCourse}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">{text.allCourses}</TabsTrigger>
          <TabsTrigger value="my">{text.myCourses}</TabsTrigger>
          <TabsTrigger value="enrolled">{text.enrolled}</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sampleCourses.map((course) => (
              <Card key={course.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <Badge variant="outline">
                      {language === 'kk' ? course.subjectKk : course.subject}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg line-clamp-2">
                    {language === 'kk' ? course.titleKk : course.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {language === 'kk' ? course.descriptionKk : course.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <PlayCircle className="h-4 w-4" />
                      {course.lessonsCount} {text.lessons}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {course.duration} {text.hours}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="pt-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{course.students}</span>
                    <Star className="h-4 w-4 text-yellow-500 ml-2" />
                    <span>{course.rating}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{course.author}</span>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="my" className="mt-6">
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">{text.noCreated}</p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {text.createFirst}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="enrolled" className="mt-6">
          {sampleCourses.filter(c => c.progress > 0).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sampleCourses.filter(c => c.progress > 0).map((course) => (
                <Card key={course.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      <Badge variant="outline">
                        {language === 'kk' ? course.subjectKk : course.subject}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg line-clamp-2">
                      {language === 'kk' ? course.titleKk : course.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-muted-foreground mb-4">{course.author}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{text.progress}</span>
                        <span>{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} />
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button className="w-full">{text.continue}</Button>
                  </CardFooter>
                </Card>
              ))}
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
