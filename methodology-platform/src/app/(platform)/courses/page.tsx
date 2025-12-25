'use client'

import { useState } from 'react'
import { BookOpen, Plus, Clock, Users, Star, PlayCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/hooks/useAuth'

// Placeholder data for demonstration
const sampleCourses = [
  {
    id: '1',
    title: 'Основы математики для 5 класса',
    description: 'Полный курс по математике для пятиклассников',
    thumbnail: null,
    lessonsCount: 24,
    duration: '12 часов',
    students: 156,
    rating: 4.8,
    progress: 0,
    author: 'Иванова М.А.',
    subject: 'Математика',
  },
  {
    id: '2',
    title: 'Русский язык: орфография',
    description: 'Углубленный курс по орфографии русского языка',
    thumbnail: null,
    lessonsCount: 18,
    duration: '9 часов',
    students: 89,
    rating: 4.6,
    progress: 45,
    author: 'Петрова Е.В.',
    subject: 'Русский язык',
  },
]

export default function CoursesPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('all')

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Курсы</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Создать курс
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">Все курсы</TabsTrigger>
          <TabsTrigger value="my">Мои курсы</TabsTrigger>
          <TabsTrigger value="enrolled">Я изучаю</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sampleCourses.map((course) => (
              <Card key={course.id} className="hover:shadow-md transition-shadow cursor-pointer">
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
                      {course.lessonsCount} уроков
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {course.duration}
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
            <p className="text-muted-foreground mb-4">Вы ещё не создали ни одного курса</p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Создать первый курс
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
                      <Badge variant="outline">{course.subject}</Badge>
                    </div>
                    <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-muted-foreground mb-4">{course.author}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Прогресс</span>
                        <span>{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} />
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button className="w-full">Продолжить</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">Вы ещё не записались ни на один курс</p>
              <Button variant="outline" onClick={() => setActiveTab('all')}>
                Посмотреть доступные курсы
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
