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
import { useLanguage } from '@/hooks/useLanguage'

export default function HelpPage() {
  const { language } = useLanguage()
  const [searchQuery, setSearchQuery] = useState('')

  const txt = {
    ru: {
      title: 'Центр помощи',
      subtitle: 'Найдите ответы на вопросы или свяжитесь с нами',
      searchPlaceholder: 'Поиск по вопросам...',
      materials: 'Материалы',
      materialsDesc: 'Создание, редактирование и публикация',
      community: 'Сообщество',
      communityDesc: 'Подписки, сообщества, общение',
      account: 'Аккаунт',
      accountDesc: 'Настройки профиля и безопасность',
      features: 'Функции',
      featuresDesc: 'Курсы, коллекции, достижения',
      faq: 'Часто задаваемые вопросы',
      faqDesc: 'Ответы на популярные вопросы пользователей',
      noResults: 'Ничего не найдено. Попробуйте изменить запрос.',
      notFound: 'Не нашли ответ?',
      contactUs: 'Свяжитесь с нами любым удобным способом',
      writeChat: 'Написать в чат',
      usuallyReply: 'Обычно отвечаем за час',
      sendEmail: 'Отправить email',
      faqItems: [
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
      ],
    },
    kk: {
      title: 'Көмек орталығы',
      subtitle: 'Сұрақтарға жауап табыңыз немесе бізбен байланысыңыз',
      searchPlaceholder: 'Сұрақтар бойынша іздеу...',
      materials: 'Материалдар',
      materialsDesc: 'Жасау, өңдеу және жариялау',
      community: 'Қауымдастық',
      communityDesc: 'Жазылымдар, қауымдастықтар, қарым-қатынас',
      account: 'Аккаунт',
      accountDesc: 'Профиль параметрлері және қауіпсіздік',
      features: 'Функциялар',
      featuresDesc: 'Курстар, жинақтар, жетістіктер',
      faq: 'Жиі қойылатын сұрақтар',
      faqDesc: 'Пайдаланушылардың танымал сұрақтарына жауаптар',
      noResults: 'Ештеңе табылмады. Сұрауды өзгертіп көріңіз.',
      notFound: 'Жауап таппадыңыз ба?',
      contactUs: 'Кез келген ыңғайлы тәсілмен бізбен байланысыңыз',
      writeChat: 'Чатқа жазу',
      usuallyReply: 'Әдетте бір сағат ішінде жауап береміз',
      sendEmail: 'Email жіберу',
      faqItems: [
        {
          question: 'Материалды қалай жасауға болады?',
          answer: 'Жоғарғы мәзірде немесе бүйірлік панельде "+ Жасау" түймесін басыңыз. Форманы толтырыңыз, материал түрін таңдаңыз, сипаттама қосыңыз, файлдарды тіркеңіз және "Жариялау" түймесін басыңыз.',
        },
        {
          question: 'Ұпай қалай жинап, деңгейді қалай көтеруге болады?',
          answer: 'Белсенділік үшін ұпайлар беріледі: материалдар жариялау (+10), ұнатулар алу (+5), пікірлер (+3), күнделікті кіру (+1). Әр 100 ұпай үшін деңгей көтеріледі.',
        },
        {
          question: 'Материалды жинаққа қалай сақтауға болады?',
          answer: 'Материалды ашып, "Сақтау" түймесін басыңыз. Бар жинақты таңдаңыз немесе жаңасын жасаңыз.',
        },
        {
          question: 'Басқа авторлардың материалдарын жүктеп алуға бола ма?',
          answer: 'Жүктеп алу тек автор жариялау кезінде рұқсат берген жағдайда қолжетімді. Жүктеп алу түймесі тіркелген файлдардың жанында пайда болады.',
        },
        {
          question: 'Авторға қалай жазылуға болады?',
          answer: 'Автордың профиль бетіне өтіп, "Жазылу" түймесін басыңыз. Жаңа материалдар туралы хабарландырулар аласыз.',
        },
        {
          question: 'Курсты қалай жасауға болады?',
          answer: '"Курстар" бөліміне өтіп, "Курс жасау" түймесін басыңыз. Атауы мен сипаттамасын қосыңыз және материалдарыңыздан сабақтарды кезекпен жасаңыз.',
        },
        {
          question: 'Қауымдастыққа қалай қосылуға болады?',
          answer: '"Қауымдастықтар" бөліміне өтіп, қызықтыратын қауымдастықты тауып, "Қосылу" түймесін басыңыз. Ашық қауымдастықтарға бірден қосылуға болады.',
        },
        {
          question: 'Құпиялылық параметрлерін қалай өзгертуге болады?',
          answer: '"Параметрлер" → "Құпиялылық" бөліміне өтіңіз. Онда профильді, email-ды жасыруға және материалдардың көрінуін әдепкі бойынша баптауға болады.',
        },
      ],
    },
  }

  const text = txt[language]

  const categories = [
    {
      icon: FileText,
      title: text.materials,
      description: text.materialsDesc,
    },
    {
      icon: Users,
      title: text.community,
      description: text.communityDesc,
    },
    {
      icon: Shield,
      title: text.account,
      description: text.accountDesc,
    },
    {
      icon: Zap,
      title: text.features,
      description: text.featuresDesc,
    },
  ]

  const filteredFaq = text.faqItems.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      <div className="text-center mb-8">
        <HelpCircle className="h-12 w-12 mx-auto mb-4 text-primary" />
        <h1 className="text-2xl font-bold mb-2">{text.title}</h1>
        <p className="text-muted-foreground">
          {text.subtitle}
        </p>
      </div>

      {/* Search */}
      <div className="flex gap-2 mb-8 max-w-md mx-auto">
        <Input
          placeholder={text.searchPlaceholder}
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
            {text.faq}
          </CardTitle>
          <CardDescription>
            {text.faqDesc}
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
              {text.noResults}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Contact */}
      <Card>
        <CardHeader>
          <CardTitle>{text.notFound}</CardTitle>
          <CardDescription>{text.contactUs}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
              <MessageCircle className="h-6 w-6" />
              <span>{text.writeChat}</span>
              <span className="text-xs text-muted-foreground">{text.usuallyReply}</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
              <Mail className="h-6 w-6" />
              <span>{text.sendEmail}</span>
              <span className="text-xs text-muted-foreground">support@kopilka.kz</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
