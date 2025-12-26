'use client'

import Link from 'next/link'
import {
  BookOpen,
  Users,
  Sparkles,
  BarChart3,
  ArrowRight,
  Check,
  FileText,
  MessageCircle,
  FolderOpen,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import LanguageSwitcher from '@/components/shared/LanguageSwitcher'
import { useLanguage } from '@/hooks/useLanguage'

export default function LandingPage() {
  const { t, language } = useLanguage()

  const features = [
    {
      icon: FileText,
      title: language === 'ru' ? 'Материалы' : 'Материалдар',
      description: language === 'ru'
        ? 'Делитесь лекциями, презентациями и документами'
        : 'Дәрістер, презентациялар және құжаттармен бөлісіңіз',
    },
    {
      icon: Users,
      title: language === 'ru' ? 'Сообщество' : 'Қауымдастық',
      description: language === 'ru'
        ? 'Общайтесь с коллегами и обменивайтесь опытом'
        : 'Әріптестермен сөйлесіңіз және тәжірибемен алмасыңыз',
    },
    {
      icon: Sparkles,
      title: language === 'ru' ? 'AI-помощник' : 'AI-көмекші',
      description: language === 'ru'
        ? 'Генерируйте планы занятий с помощью ИИ'
        : 'AI көмегімен сабақ жоспарларын жасаңыз',
    },
    {
      icon: BarChart3,
      title: language === 'ru' ? 'Аналитика' : 'Аналитика',
      description: language === 'ru'
        ? 'Отслеживайте статистику ваших материалов'
        : 'Материалдарыңыздың статистикасын бақылаңыз',
    },
  ]

  const benefits = language === 'ru' ? [
    'Бесплатный доступ к материалам',
    'Удобный поиск по дисциплинам',
    'Система рекомендаций',
    'Создание коллекций',
  ] : [
    'Материалдарға тегін қол жеткізу',
    'Пәндер бойынша ыңғайлы іздеу',
    'Ұсыныс жүйесі',
    'Жинақтар құру',
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-neutral-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <BookOpen className="h-5 w-5" />
            <span className="font-semibold tracking-tight">
              {t.landing.title}
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-neutral-600">
                {t.nav.login}
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">
                {t.nav.register}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm text-neutral-500 mb-4 tracking-wide uppercase">
            {language === 'ru' ? 'Для преподавателей Казахстана' : 'Қазақстан оқытушыларына арналған'}
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-[1.1] mb-6">
            {language === 'ru' ? 'Платформа для обмена' : 'Оқу материалдарымен'}
            <br />
            <span className="text-neutral-400">
              {language === 'ru' ? 'учебными материалами' : 'алмасу платформасы'}
            </span>
          </h1>
          <p className="text-lg text-neutral-500 mb-10 max-w-xl mx-auto leading-relaxed">
            {language === 'ru'
              ? 'Делитесь методическими разработками с тысячами преподавателей. Бесплатно.'
              : 'Мыңдаған оқытушылармен әдістемелік әзірлемелермен бөлісіңіз. Тегін.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto px-8">
                {language === 'ru' ? 'Начать бесплатно' : 'Тегін бастау'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/explore">
              <Button variant="outline" size="lg" className="w-full sm:w-auto px-8">
                {language === 'ru' ? 'Смотреть материалы' : 'Материалдарды қарау'}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 border-y border-neutral-100">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-semibold tracking-tight">10K+</div>
              <div className="text-sm text-neutral-500 mt-1">
                {language === 'ru' ? 'Преподавателей' : 'Оқытушылар'}
              </div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-semibold tracking-tight">50K+</div>
              <div className="text-sm text-neutral-500 mt-1">
                {language === 'ru' ? 'Материалов' : 'Материалдар'}
              </div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-semibold tracking-tight">45</div>
              <div className="text-sm text-neutral-500 mt-1">
                {language === 'ru' ? 'Дисциплин' : 'Пәндер'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-4">
              {language === 'ru' ? 'Всё для вашей работы' : 'Жұмысыңызға қажеттінің бәрі'}
            </h2>
            <p className="text-neutral-500 max-w-lg mx-auto">
              {language === 'ru'
                ? 'Простые инструменты для преподавателей'
                : 'Оқытушыларға арналған қарапайым құралдар'}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {features.map((feature, i) => {
              const Icon = feature.icon
              return (
                <div
                  key={i}
                  className="group p-6 rounded-lg border border-neutral-100 hover:border-neutral-200 hover:shadow-sm transition-all duration-200"
                >
                  <Icon className="h-5 w-5 text-neutral-400 mb-4" strokeWidth={1.5} />
                  <h3 className="font-medium mb-2">{feature.title}</h3>
                  <p className="text-sm text-neutral-500 leading-relaxed">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 px-6 bg-neutral-50/50">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-4">
                {language === 'ru' ? 'Почему мы?' : 'Неге біз?'}
              </h2>
              <p className="text-neutral-500 mb-8 leading-relaxed">
                {language === 'ru'
                  ? 'Современная платформа для преподавателей, созданная с заботой о вашем времени.'
                  : 'Сіздің уақытыңызды ойлап жасалған оқытушыларға арналған заманауи платформа.'}
              </p>
              <ul className="space-y-3">
                {benefits.map((benefit, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="h-5 w-5 rounded-full bg-neutral-100 flex items-center justify-center flex-shrink-0">
                      <Check className="h-3 w-3 text-neutral-600" />
                    </div>
                    <span className="text-sm">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-lg border border-neutral-100 bg-white">
                <FolderOpen className="h-5 w-5 text-neutral-400 mb-3" strokeWidth={1.5} />
                <div className="text-2xl font-semibold mb-1">50K+</div>
                <div className="text-xs text-neutral-500">
                  {language === 'ru' ? 'Материалов' : 'Материалдар'}
                </div>
              </div>
              <div className="p-6 rounded-lg border border-neutral-100 bg-white">
                <Users className="h-5 w-5 text-neutral-400 mb-3" strokeWidth={1.5} />
                <div className="text-2xl font-semibold mb-1">10K+</div>
                <div className="text-xs text-neutral-500">
                  {language === 'ru' ? 'Преподавателей' : 'Оқытушылар'}
                </div>
              </div>
              <div className="p-6 rounded-lg border border-neutral-100 bg-white">
                <MessageCircle className="h-5 w-5 text-neutral-400 mb-3" strokeWidth={1.5} />
                <div className="text-2xl font-semibold mb-1">100+</div>
                <div className="text-xs text-neutral-500">
                  {language === 'ru' ? 'Сообществ' : 'Қауымдастықтар'}
                </div>
              </div>
              <div className="p-6 rounded-lg border border-neutral-100 bg-white">
                <Sparkles className="h-5 w-5 text-neutral-400 mb-3" strokeWidth={1.5} />
                <div className="text-2xl font-semibold mb-1">AI</div>
                <div className="text-xs text-neutral-500">
                  {language === 'ru' ? 'Ассистент' : 'Көмекші'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-4">
            {language === 'ru' ? 'Присоединяйтесь' : 'Қосылыңыз'}
          </h2>
          <p className="text-neutral-500 mb-8">
            {language === 'ru'
              ? 'Станьте частью сообщества преподавателей Казахстана'
              : 'Қазақстан оқытушылары қауымдастығының бөлігі болыңыз'}
          </p>
          <Link href="/register">
            <Button size="lg" className="px-8">
              {language === 'ru' ? 'Создать аккаунт' : 'Аккаунт жасау'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-100 py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="text-sm font-medium">{t.landing.title}</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-neutral-500">
              <Link href="/explore" className="hover:text-neutral-900 transition-colors">
                {t.nav.explore}
              </Link>
              <Link href="/communities" className="hover:text-neutral-900 transition-colors">
                {t.nav.communities}
              </Link>
              <Link href="/help" className="hover:text-neutral-900 transition-colors">
                {t.nav.help}
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-neutral-100 text-center text-xs text-neutral-400">
            &copy; {new Date().getFullYear()} {t.landing.title}
          </div>
        </div>
      </footer>
    </div>
  )
}
