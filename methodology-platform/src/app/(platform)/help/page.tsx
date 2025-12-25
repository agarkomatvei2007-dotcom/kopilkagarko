'use client'

import { useState } from 'react'
import {
  HelpCircle,
  Book,
  MessageCircle,
  Mail,
  ChevronDown,
  Search,
  FileText,
  Users,
  Shield,
  Zap,
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const faqItems = [
  {
    question: 'Как создать материал?',
    answer: 'Нажмите кнопку "+ Создать" в верхнем меню или боковой панели. Заполните форму, выберите тип материала, добавьте описание, прикрепите файлы и нажмите "Опубликовать".',
  },
  {
    question: 'Как заработать очки и повысить уровень?',
    answer: 'Очки начисляются за активность: публикацию материалов (+10), получение лайков (+5), комментарии (+3), ежедневный вход (+1). Уровень повышается каждые 100 очков.',
  },
  {
    question: 'Как сохранить материал в коллекцию?',
    answer: 'Откройте материал и нажмите кнопку "Сохранить". Выберите существующую коллекцию или создайте новую.',
  },
  {
    question: 'Можно ли скачать материалы других авторов?',
    answer: 'Скачивание доступно только если автор разрешил это при публикации. Кнопка скачивания появится рядом с прикреплёнными файлами.',
  },
  {
    question: 'Как подписаться на автора?',
    answer: 'Перейдите на страницу профиля автора и нажмите кнопку "Подписаться". Вы будете получать уведомления о новых материалах.',
  },
  {
    question: 'Как создать курс?',
    answer: 'Перейдите в раздел "Курсы" и нажмите "Создать курс". Добавьте название, описание и последовательно создайте уроки из ваших материалов.',
  },
  {
    question: 'Как вступить в сообщество?',
    answer: 'Перейдите в раздел "Сообщества", найдите интересующее вас сообщество и нажмите "Вступить". В публичные сообщества можно вступить сразу.',
  },
  {
    question: 'Как изменить настройки приватности?',
    answer: 'Перейдите в "Настройки" → "Приватность". Там можно скрыть профиль, email и настроить видимость ваших материалов по умолчанию.',
  },
]

const categories = [
  {
    icon: FileText,
    title: 'Материалы',
    description: 'Создание, редактирование и публикация',
  },
  {
    icon: Users,
    title: 'Сообщество',
    description: 'Подписки, сообщества, общение',
  },
  {
    icon: Shield,
    title: 'Аккаунт',
    description: 'Настройки профиля и безопасность',
  },
  {
    icon: Zap,
    title: 'Функции',
    description: 'Курсы, коллекции, достижения',
  },
]

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredFaq = faqItems.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      <div className="text-center mb-8">
        <HelpCircle className="h-12 w-12 mx-auto mb-4 text-primary" />
        <h1 className="text-2xl font-bold mb-2">Центр помощи</h1>
        <p className="text-muted-foreground">
          Найдите ответы на вопросы или свяжитесь с нами
        </p>
      </div>

      {/* Search */}
      <div className="flex gap-2 mb-8 max-w-md mx-auto">
        <Input
          placeholder="Поиск по вопросам..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button variant="outline">
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {categories.map((category) => {
          const Icon = category.icon
          return (
            <Card key={category.title} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-6 text-center">
                <Icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h3 className="font-medium">{category.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{category.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* FAQ */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Book className="h-5 w-5" />
            Часто задаваемые вопросы
          </CardTitle>
          <CardDescription>
            Ответы на популярные вопросы пользователей
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {filteredFaq.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          {filteredFaq.length === 0 && (
            <p className="text-center text-muted-foreground py-4">
              Ничего не найдено. Попробуйте изменить запрос.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Contact */}
      <Card>
        <CardHeader>
          <CardTitle>Не нашли ответ?</CardTitle>
          <CardDescription>Свяжитесь с нами любым удобным способом</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
              <MessageCircle className="h-6 w-6" />
              <span>Написать в чат</span>
              <span className="text-xs text-muted-foreground">Обычно отвечаем за час</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
              <Mail className="h-6 w-6" />
              <span>Отправить email</span>
              <span className="text-xs text-muted-foreground">support@kopilka.ru</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
