'use client'

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
import LanguageSwitcher from '@/components/shared/LanguageSwitcher'
import { useLanguage } from '@/hooks/useLanguage'

export default function LandingPage() {
  const { t, language } = useLanguage()

  const features = [
    {
      icon: BookOpen,
      title: language === 'ru' ? 'Учебные материалы' : 'Оқу материалдары',
      description: language === 'ru'
        ? 'Создавайте и делитесь лекциями, презентациями, видео и документами'
        : 'Дәрістер, презентациялар, видео және құжаттармен бөлісіңіз',
    },
    {
      icon: Users,
      title: language === 'ru' ? 'Сообщество преподавателей' : 'Оқытушылар қауымдастығы',
      description: language === 'ru'
        ? 'Общайтесь с коллегами, обменивайтесь опытом и идеями'
        : 'Әріптестермен сөйлесіңіз, тәжірибе мен идеялармен алмасыңыз',
    },
    {
      icon: Sparkles,
      title: language === 'ru' ? 'AI-помощник' : 'AI-көмекші',
      description: language === 'ru'
        ? 'Используйте ИИ для генерации планов занятий и тестов'
        : 'Сабақ жоспарлары мен тесттерді жасау үшін AI пайдаланыңыз',
    },
    {
      icon: Award,
      title: language === 'ru' ? 'Геймификация' : 'Геймификация',
      description: language === 'ru'
        ? 'Зарабатывайте очки, получайте достижения и участвуйте в рейтингах'
        : 'Ұпай жинаңыз, жетістіктер алыңыз және рейтингтерге қатысыңыз',
    },
    {
      icon: MessageSquare,
      title: language === 'ru' ? 'Чаты в реальном времени' : 'Нақты уақыттағы чаттар',
      description: language === 'ru'
        ? 'Мгновенное общение с другими преподавателями'
        : 'Басқа оқытушылармен лезде сөйлесу',
    },
    {
      icon: TrendingUp,
      title: language === 'ru' ? 'Аналитика' : 'Аналитика',
      description: language === 'ru'
        ? 'Отслеживайте просмотры и популярность ваших материалов'
        : 'Материалдарыңыздың көрілімдері мен танымалдығын бақылаңыз',
    },
  ]

  const benefits = language === 'ru' ? [
    'Бесплатный доступ к тысячам материалов',
    'Удобный поиск по дисциплинам и курсам',
    'Возможность скачивания материалов',
    'Система рекомендаций на базе ИИ',
    'Создание собственных коллекций',
    'Подписка на любимых авторов',
  ] : [
    'Мыңдаған материалдарға тегін қол жеткізу',
    'Пәндер мен курстар бойынша ыңғайлы іздеу',
    'Материалдарды жүктеп алу мүмкіндігі',
    'AI негізіндегі ұсыныс жүйесі',
    'Өз жинақтарыңызды құру',
    'Сүйікті авторларға жазылу',
  ]

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">{t.landing.title}</span>
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Link href="/login">
              <Button variant="ghost">{t.nav.login}</Button>
            </Link>
            <Link href="/register">
              <Button>{t.nav.register}</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {language === 'ru' ? 'Платформа для обмена' : 'Оқу материалдарымен'}
            <br />
            <span className="text-primary">
              {language === 'ru' ? 'учебными материалами' : 'алмасу платформасы'}
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {language === 'ru'
              ? 'Делитесь лекциями, презентациями и методическими разработками с тысячами преподавателей'
              : 'Мыңдаған оқытушылармен дәрістер, презентациялар және әдістемелік әзірлемелермен бөлісіңіз'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="gap-2">
                {language === 'ru' ? 'Начать бесплатно' : 'Тегін бастау'}
                <Share2 className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/explore">
              <Button size="lg" variant="outline">
                {language === 'ru' ? 'Посмотреть материалы' : 'Материалдарды қарау'}
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            {language === 'ru'
              ? 'Более 10 000 преподавателей уже с нами'
              : '10 000-нан астам оқытушы бізбен бірге'}
          </p>
        </div>
      </section>

      {/* Features section */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            {language === 'ru' ? 'Все что нужно для работы' : 'Жұмысқа қажеттінің бәрі'}
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
                {language === 'ru' ? 'Почему выбирают нас?' : 'Неге бізді таңдайды?'}
              </h2>
              <p className="text-muted-foreground mb-8">
                {language === 'ru'
                  ? 'Методическая копилка - это современная платформа для преподавателей, которая помогает находить качественные материалы и делиться своим опытом с коллегами.'
                  : 'Әдістемелік қоржын - бұл оқытушыларға сапалы материалдарды табуға және әріптестермен тәжірибесімен бөлісуге көмектесетін заманауи платформа.'}
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
              <div className="text-muted-foreground mb-6">
                {language === 'ru' ? 'Активных преподавателей' : 'Белсенді оқытушылар'}
              </div>
              <div className="text-5xl font-bold text-primary mb-2">50 000+</div>
              <div className="text-muted-foreground mb-6">
                {language === 'ru' ? 'Учебных материалов' : 'Оқу материалдары'}
              </div>
              <div className="text-5xl font-bold text-primary mb-2">45</div>
              <div className="text-muted-foreground">
                {language === 'ru' ? 'Дисциплин' : 'Пәндер'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            {language === 'ru' ? 'Присоединяйтесь к сообществу' : 'Қауымдастыққа қосылыңыз'}
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            {language === 'ru'
              ? 'Зарегистрируйтесь бесплатно и начните делиться своими материалами или находить идеи для занятий'
              : 'Тегін тіркеліңіз және материалдарыңызбен бөлісуді немесе сабақтарға идея табуды бастаңыз'}
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary">
              {language === 'ru' ? 'Создать аккаунт' : 'Аккаунт жасау'}
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
                <span className="font-bold">{t.landing.title}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {language === 'ru'
                  ? 'Платформа для обмена учебными материалами между преподавателями'
                  : 'Оқытушылар арасында оқу материалдарымен алмасу платформасы'}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">
                {language === 'ru' ? 'Платформа' : 'Платформа'}
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/explore" className="hover:text-primary">{t.nav.explore}</Link></li>
                <li><Link href="/communities" className="hover:text-primary">{t.nav.communities}</Link></li>
                <li><Link href="/leaderboard" className="hover:text-primary">
                  {language === 'ru' ? 'Рейтинг' : 'Рейтинг'}
                </Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">
                {language === 'ru' ? 'Поддержка' : 'Қолдау'}
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/help" className="hover:text-primary">{t.nav.help}</Link></li>
                <li><Link href="/contact" className="hover:text-primary">
                  {language === 'ru' ? 'Контакты' : 'Байланыс'}
                </Link></li>
                <li><Link href="/faq" className="hover:text-primary">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">
                {language === 'ru' ? 'Правовая информация' : 'Құқықтық ақпарат'}
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-primary">
                  {language === 'ru' ? 'Политика конфиденциальности' : 'Құпиялылық саясаты'}
                </Link></li>
                <li><Link href="/terms" className="hover:text-primary">
                  {language === 'ru' ? 'Условия использования' : 'Пайдалану шарттары'}
                </Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} {t.landing.title}. {language === 'ru' ? 'Все права защищены.' : 'Барлық құқықтар қорғалған.'}
          </div>
        </div>
      </footer>
    </div>
  )
}
