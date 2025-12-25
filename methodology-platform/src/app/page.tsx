import Link from 'next/link'
import {
  BookOpen,
  Users,
  Share2,
  Award,
  Sparkles,
  MessageSquare,
  TrendingUp,
  CheckCircle,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const features = [
  {
    icon: BookOpen,
    title: 'Учебные материалы',
    description: 'Создавайте и делитесь лекциями, презентациями, видео и документами',
  },
  {
    icon: Users,
    title: 'Сообщество учителей',
    description: 'Общайтесь с коллегами, обменивайтесь опытом и идеями',
  },
  {
    icon: Sparkles,
    title: 'AI-помощник',
    description: 'Используйте ИИ для генерации планов уроков и тестов',
  },
  {
    icon: Award,
    title: 'Геймификация',
    description: 'Зарабатывайте очки, получайте достижения и участвуйте в рейтингах',
  },
  {
    icon: MessageSquare,
    title: 'Чаты в реальном времени',
    description: 'Мгновенное общение с другими преподавателями',
  },
  {
    icon: TrendingUp,
    title: 'Аналитика',
    description: 'Отслеживайте просмотры и популярность ваших материалов',
  },
]

const benefits = [
  'Бесплатный доступ к тысячам материалов',
  'Удобный поиск по дисциплинам и курсам',
  'Возможность скачивания материалов',
  'Система рекомендаций на базе ИИ',
  'Создание собственных коллекций',
  'Подписка на любимых авторов',
]

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">Методическая копилка</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost">Войти</Button>
            </Link>
            <Link href="/register">
              <Button>Регистрация</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Платформа для обмена
            <br />
            <span className="text-primary">учебными материалами</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Делитесь лекциями, презентациями и методическими разработками
            с тысячами учителей по всей России
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="gap-2">
                Начать бесплатно
                <Share2 className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/explore">
              <Button size="lg" variant="outline">
                Посмотреть материалы
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Более 10 000 учителей уже с нами
          </p>
        </div>
      </section>

      {/* Features section */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Все что нужно для работы
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <Card key={feature.title}>
                  <CardContent className="pt-6">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Benefits section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">
                Почему выбирают нас?
              </h2>
              <p className="text-muted-foreground mb-8">
                Методическая копилка - это современная платформа для учителей,
                которая помогает находить качественные материалы и делиться
                своим опытом с коллегами.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl p-8 text-center">
              <div className="text-5xl font-bold text-primary mb-2">10 000+</div>
              <div className="text-muted-foreground mb-6">Активных учителей</div>
              <div className="text-5xl font-bold text-primary mb-2">50 000+</div>
              <div className="text-muted-foreground mb-6">Учебных материалов</div>
              <div className="text-5xl font-bold text-primary mb-2">28</div>
              <div className="text-muted-foreground">Предметных областей</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Присоединяйтесь к сообществу
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Зарегистрируйтесь бесплатно и начните делиться своими материалами
            или находить идеи для уроков
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary">
              Создать аккаунт
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-6 w-6 text-primary" />
                <span className="font-bold">Методическая копилка</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Платформа для обмена учебными материалами между учителями
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Платформа</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/explore" className="hover:text-primary">Обзор</Link></li>
                <li><Link href="/communities" className="hover:text-primary">Сообщества</Link></li>
                <li><Link href="/leaderboard" className="hover:text-primary">Рейтинг</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Поддержка</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/help" className="hover:text-primary">Помощь</Link></li>
                <li><Link href="/contact" className="hover:text-primary">Контакты</Link></li>
                <li><Link href="/faq" className="hover:text-primary">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Правовая информация</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-primary">Политика конфиденциальности</Link></li>
                <li><Link href="/terms" className="hover:text-primary">Условия использования</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Методическая копилка. Все права защищены.
          </div>
        </div>
      </footer>
    </div>
  )
}
