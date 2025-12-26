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
  ArrowRight,
  Play,
  Star,
  Zap,
  Shield,
  Globe,
  Heart,
  GraduationCap,
  FileText,
  Video,
  Image as ImageIcon,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Users,
      title: language === 'ru' ? 'Сообщество' : 'Қауымдастық',
      description: language === 'ru'
        ? 'Общайтесь с коллегами, обменивайтесь опытом и идеями'
        : 'Әріптестермен сөйлесіңіз, тәжірибе мен идеялармен алмасыңыз',
      color: 'from-violet-500 to-purple-500',
    },
    {
      icon: Sparkles,
      title: language === 'ru' ? 'AI-помощник' : 'AI-көмекші',
      description: language === 'ru'
        ? 'Используйте ИИ для генерации планов занятий и тестов'
        : 'Сабақ жоспарлары мен тесттерді жасау үшін AI пайдаланыңыз',
      color: 'from-amber-500 to-orange-500',
    },
    {
      icon: Award,
      title: language === 'ru' ? 'Геймификация' : 'Геймификация',
      description: language === 'ru'
        ? 'Зарабатывайте очки и получайте достижения'
        : 'Ұпай жинаңыз және жетістіктер алыңыз',
      color: 'from-emerald-500 to-green-500',
    },
    {
      icon: MessageSquare,
      title: language === 'ru' ? 'Чаты' : 'Чаттар',
      description: language === 'ru'
        ? 'Мгновенное общение с преподавателями'
        : 'Оқытушылармен лезде сөйлесу',
      color: 'from-pink-500 to-rose-500',
    },
    {
      icon: TrendingUp,
      title: language === 'ru' ? 'Аналитика' : 'Аналитика',
      description: language === 'ru'
        ? 'Отслеживайте популярность материалов'
        : 'Материалдардың танымалдығын бақылаңыз',
      color: 'from-indigo-500 to-blue-500',
    },
  ]

  const benefits = language === 'ru' ? [
    'Бесплатный доступ к тысячам материалов',
    'Удобный поиск по дисциплинам',
    'Скачивание материалов',
    'ИИ-рекомендации',
    'Создание коллекций',
    'Подписка на авторов',
  ] : [
    'Мыңдаған материалдарға тегін қол жеткізу',
    'Пәндер бойынша ыңғайлы іздеу',
    'Материалдарды жүктеп алу',
    'AI ұсыныстары',
    'Жинақтар құру',
    'Авторларға жазылу',
  ]

  const howItWorks = language === 'ru' ? [
    { step: 1, title: 'Регистрация', description: 'Создайте бесплатный аккаунт за 1 минуту' },
    { step: 2, title: 'Загрузка', description: 'Делитесь своими материалами с сообществом' },
    { step: 3, title: 'Поиск', description: 'Находите качественные материалы коллег' },
    { step: 4, title: 'Развитие', description: 'Зарабатывайте баллы и повышайте рейтинг' },
  ] : [
    { step: 1, title: 'Тіркелу', description: '1 минутта тегін аккаунт жасаңыз' },
    { step: 2, title: 'Жүктеу', description: 'Материалдарыңызбен қауымдастықпен бөлісіңіз' },
    { step: 3, title: 'Іздеу', description: 'Әріптестердің сапалы материалдарын табыңыз' },
    { step: 4, title: 'Даму', description: 'Ұпай жинаңыз және рейтингіңізді арттырыңыз' },
  ]

  const testimonials = language === 'ru' ? [
    { name: 'Айгуль Н.', role: 'Преподаватель информатики', text: 'Платформа сэкономила мне часы подготовки к занятиям!', rating: 5 },
    { name: 'Серик М.', role: 'Преподаватель математики', text: 'Отличное сообщество и качественные материалы.', rating: 5 },
    { name: 'Дана К.', role: 'Преподаватель языков', text: 'ИИ-ассистент очень помогает в работе.', rating: 5 },
  ] : [
    { name: 'Айгүл Н.', role: 'Информатика оқытушысы', text: 'Платформа сабаққа дайындалу уақытымды үнемдеді!', rating: 5 },
    { name: 'Серік М.', role: 'Математика оқытушысы', text: 'Тамаша қауымдастық және сапалы материалдар.', rating: 5 },
    { name: 'Дана К.', role: 'Тіл оқытушысы', text: 'AI-көмекші жұмыста өте көмектеседі.', rating: 5 },
  ]

  const materialTypes = [
    { icon: FileText, label: language === 'ru' ? 'Документы' : 'Құжаттар', count: '15 000+' },
    { icon: Video, label: language === 'ru' ? 'Видео' : 'Видео', count: '5 000+' },
    { icon: ImageIcon, label: language === 'ru' ? 'Презентации' : 'Презентациялар', count: '20 000+' },
    { icon: BookOpen, label: language === 'ru' ? 'Лекции' : 'Дәрістер', count: '10 000+' },
  ]

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              {t.landing.title}
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link href="/login">
              <Button variant="ghost" className="font-medium">{t.nav.login}</Button>
            </Link>
            <Link href="/register">
              <Button className="btn-gradient text-white font-medium shadow-lg">
                {t.nav.register}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <section className="relative pt-32 pb-20 px-4 gradient-mesh min-h-[90vh] flex items-center">
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/10 rounded-full blur-3xl" />

        <div className="container mx-auto relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium bg-white/80 backdrop-blur-sm shadow-soft">
              <Sparkles className="h-4 w-4 mr-2 text-amber-500" />
              {language === 'ru' ? 'Более 10 000 преподавателей' : '10 000+ оқытушы'}
            </Badge>

            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              {language === 'ru' ? 'Платформа для' : 'Оқу материалдарымен'}
              <br />
              <span className="text-gradient">
                {language === 'ru' ? 'обмена знаниями' : 'алмасу платформасы'}
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              {language === 'ru'
                ? 'Делитесь лекциями, презентациями и методическими разработками с тысячами преподавателей Казахстана'
                : 'Қазақстанның мыңдаған оқытушыларымен дәрістер, презентациялар және әдістемелік әзірлемелермен бөлісіңіз'}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/register">
                <Button size="lg" className="btn-gradient text-white text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all">
                  {language === 'ru' ? 'Начать бесплатно' : 'Тегін бастау'}
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <Link href="/explore">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-white/50 backdrop-blur-sm hover:bg-white/80 transition-all">
                  <Play className="h-5 w-5 mr-2" />
                  {language === 'ru' ? 'Смотреть материалы' : 'Материалдарды қарау'}
                </Button>
              </Link>
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap justify-center gap-8 md:gap-16">
              {[
                { value: '10 000+', label: language === 'ru' ? 'Преподавателей' : 'Оқытушылар' },
                { value: '50 000+', label: language === 'ru' ? 'Материалов' : 'Материалдар' },
                { value: '45', label: language === 'ru' ? 'Дисциплин' : 'Пәндер' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-gradient">{stat.value}</div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Material Types */}
      <section className="py-16 px-4 bg-gradient-to-b from-white to-muted/30">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {materialTypes.map((type, i) => {
              const Icon = type.icon
              return (
                <Card key={i} className="glass-card hover-lift cursor-pointer border-0">
                  <CardContent className="p-6 text-center">
                    <div className="h-14 w-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                      <Icon className="h-7 w-7 text-primary" />
                    </div>
                    <div className="text-2xl font-bold text-primary mb-1">{type.count}</div>
                    <div className="text-muted-foreground">{type.label}</div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 px-4 py-2">
              <Zap className="h-4 w-4 mr-2 text-amber-500" />
              {language === 'ru' ? 'Возможности' : 'Мүмкіндіктер'}
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              {language === 'ru' ? 'Все для вашей работы' : 'Жұмысыңызға қажеттінің бәрі'}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {language === 'ru'
                ? 'Современные инструменты для преподавателей'
                : 'Оқытушыларға арналған заманауи құралдар'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon
              return (
                <Card key={i} className="group glass-card hover-lift border-0 overflow-hidden">
                  <CardContent className="p-8">
                    <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-4 bg-gradient-to-b from-muted/30 to-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 px-4 py-2">
              <GraduationCap className="h-4 w-4 mr-2 text-primary" />
              {language === 'ru' ? 'Как это работает' : 'Бұл қалай жұмыс істейді'}
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              {language === 'ru' ? 'Начните за 4 шага' : '4 қадаммен бастаңыз'}
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {howItWorks.map((item, i) => (
              <div key={i} className="relative text-center group">
                <div className="h-20 w-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-3xl font-bold text-white shadow-xl group-hover:scale-110 transition-transform">
                  {item.step}
                </div>
                {i < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/50 to-primary/10" />
                )}
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits section */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge variant="secondary" className="mb-4 px-4 py-2">
                <Shield className="h-4 w-4 mr-2 text-emerald-500" />
                {language === 'ru' ? 'Преимущества' : 'Артықшылықтар'}
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                {language === 'ru' ? 'Почему выбирают нас?' : 'Неге бізді таңдайды?'}
              </h2>
              <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
                {language === 'ru'
                  ? 'Методическая копилка - это современная платформа для преподавателей, которая помогает находить качественные материалы.'
                  : 'Әдістемелік қоржын - бұл оқытушыларға сапалы материалдарды табуға көмектесетін заманауи платформа.'}
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, i) => (
                  <li key={i} className="flex items-center gap-4 group">
                    <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                    </div>
                    <span className="text-lg">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-3xl blur-3xl" />
              <Card className="relative glass-card border-0 overflow-hidden">
                <CardContent className="p-10">
                  <div className="space-y-8">
                    <div className="text-center">
                      <div className="text-6xl font-bold text-gradient mb-2">10 000+</div>
                      <div className="text-muted-foreground text-lg">
                        {language === 'ru' ? 'Активных преподавателей' : 'Белсенді оқытушылар'}
                      </div>
                    </div>
                    <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                    <div className="text-center">
                      <div className="text-6xl font-bold text-gradient mb-2">50 000+</div>
                      <div className="text-muted-foreground text-lg">
                        {language === 'ru' ? 'Учебных материалов' : 'Оқу материалдары'}
                      </div>
                    </div>
                    <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                    <div className="text-center">
                      <div className="text-6xl font-bold text-gradient mb-2">98%</div>
                      <div className="text-muted-foreground text-lg">
                        {language === 'ru' ? 'Довольных пользователей' : 'Қанағаттанған пайдаланушылар'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 bg-gradient-to-b from-white to-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 px-4 py-2">
              <Heart className="h-4 w-4 mr-2 text-rose-500" />
              {language === 'ru' ? 'Отзывы' : 'Пікірлер'}
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              {language === 'ru' ? 'Что говорят преподаватели' : 'Оқытушылар не дейді'}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <Card key={i} className="glass-card hover-lift border-0">
                <CardContent className="p-8">
                  <div className="flex gap-1 mb-6">
                    {[...Array(testimonial.rating)].map((_, j) => (
                      <Star key={j} className="h-5 w-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-lg mb-6 leading-relaxed">"{testimonial.text}"</p>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 border-2 border-primary/20">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-blue-600 text-white font-medium">
                        {testimonial.name.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-blue-600 to-purple-600" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.05\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />

        <div className="container mx-auto relative text-center text-white">
          <Globe className="h-16 w-16 mx-auto mb-8 opacity-80" />
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {language === 'ru' ? 'Присоединяйтесь сегодня' : 'Бүгін қосылыңыз'}
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-xl mx-auto">
            {language === 'ru'
              ? 'Станьте частью крупнейшего сообщества преподавателей Казахстана'
              : 'Қазақстанның ең үлкен оқытушылар қауымдастығының бөлігі болыңыз'}
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 text-lg px-10 py-6 shadow-xl">
              {language === 'ru' ? 'Создать аккаунт бесплатно' : 'Тегін аккаунт жасау'}
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-xl">{t.landing.title}</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                {language === 'ru'
                  ? 'Платформа для обмена учебными материалами между преподавателями Казахстана'
                  : 'Қазақстан оқытушылары арасында оқу материалдарымен алмасу платформасы'}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-6 text-lg">
                {language === 'ru' ? 'Платформа' : 'Платформа'}
              </h4>
              <ul className="space-y-3 text-slate-400">
                <li><Link href="/explore" className="hover:text-white transition-colors">{t.nav.explore}</Link></li>
                <li><Link href="/communities" className="hover:text-white transition-colors">{t.nav.communities}</Link></li>
                <li><Link href="/leaderboard" className="hover:text-white transition-colors">
                  {language === 'ru' ? 'Рейтинг' : 'Рейтинг'}
                </Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-6 text-lg">
                {language === 'ru' ? 'Поддержка' : 'Қолдау'}
              </h4>
              <ul className="space-y-3 text-slate-400">
                <li><Link href="/help" className="hover:text-white transition-colors">{t.nav.help}</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">
                  {language === 'ru' ? 'Контакты' : 'Байланыс'}
                </Link></li>
                <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-6 text-lg">
                {language === 'ru' ? 'Правовая информация' : 'Құқықтық ақпарат'}
              </h4>
              <ul className="space-y-3 text-slate-400">
                <li><Link href="/privacy" className="hover:text-white transition-colors">
                  {language === 'ru' ? 'Конфиденциальность' : 'Құпиялылық'}
                </Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">
                  {language === 'ru' ? 'Условия использования' : 'Пайдалану шарттары'}
                </Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-slate-500">
            &copy; {new Date().getFullYear()} {t.landing.title}. {language === 'ru' ? 'Все права защищены.' : 'Барлық құқықтар қорғалған.'}
          </div>
        </div>
      </footer>
    </div>
  )
}
