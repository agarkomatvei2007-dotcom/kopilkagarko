'use client'

import Link from 'next/link'
import {
  BookOpen,
  Users,
  ArrowRight,
  Heart,
  Download,
  Star,
  MessageCircle,
  CheckCircle2,
  Sparkles,
  FileText,
  Video,
  Presentation,
  Bot,
  Clock,
  Award,
  TrendingUp,
  Quote,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import LanguageSwitcher from '@/components/shared/LanguageSwitcher'
import { useLanguage } from '@/hooks/useLanguage'

export default function LandingPage() {
  const { t, language } = useLanguage()

  const testimonials = language === 'ru' ? [
    {
      name: 'Айжан Калиева',
      role: 'Учитель математики',
      avatar: 'АК',
      text: 'Раньше тратила выходные на подготовку. Теперь нахожу материалы за 5 минут!',
    },
    {
      name: 'Болат Сериков',
      role: 'Учитель физики',
      avatar: 'БС',
      text: 'Мои материалы скачали 2000+ раз. Приятно помогать коллегам по всей стране.',
    },
    {
      name: 'Гульнара Ахметова',
      role: 'Начальные классы',
      avatar: 'ГА',
      text: 'Это как Pinterest для учителей! Уже привела сюда весь наш педсовет.',
    },
  ] : [
    {
      name: 'Айжан Қалиева',
      role: 'Математика мұғалімі',
      avatar: 'АҚ',
      text: 'Бұрын демалыс күндерді дайындалуға жұмсайтынмын. Енді материалдарды 5 минутта табамын!',
    },
    {
      name: 'Болат Серіков',
      role: 'Физика мұғалімі',
      avatar: 'БС',
      text: 'Менің материалдарымды 2000+ рет жүктеп алды. Әріптестерге көмектесу қуанышты.',
    },
    {
      name: 'Гүлнара Ахметова',
      role: 'Бастауыш сынып',
      avatar: 'ГА',
      text: 'Бұл мұғалімдерге арналған Pinterest сияқты! Барлық әріптестерімді әкелдім.',
    },
  ]

  const materials = [
    {
      type: language === 'ru' ? 'Презентация' : 'Презентация',
      title: language === 'ru' ? 'Алгебра 7 класс' : 'Алгебра 7 сынып',
      author: 'Айгуль Н.',
      downloads: 1240,
      icon: Presentation,
      bg: 'bg-emerald-500',
    },
    {
      type: language === 'ru' ? 'Видеоурок' : 'Бейнесабақ',
      title: language === 'ru' ? 'Опыты по физике' : 'Физика тәжірибелері',
      author: 'Серик М.',
      downloads: 890,
      icon: Video,
      bg: 'bg-orange-500',
    },
    {
      type: language === 'ru' ? 'Документ' : 'Құжат',
      title: language === 'ru' ? 'КТП История' : 'КТЖ Тарих',
      author: 'Дана К.',
      downloads: 2100,
      icon: FileText,
      bg: 'bg-blue-500',
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg text-gray-900">
              {t.landing.title}
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link href="/login">
              <Button variant="ghost" size="sm">
                {t.nav.login}
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white">
                {t.nav.register}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium mb-8">
              <Sparkles className="h-4 w-4" />
              {language === 'ru' ? '10 000+ учителей уже с нами' : '10 000+ мұғалім бізбен бірге'}
            </div>

            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 leading-tight mb-6">
              {language === 'ru' ? (
                <>
                  Место, где учителя
                  <br />
                  <span className="text-emerald-500">помогают друг другу</span>
                </>
              ) : (
                <>
                  Мұғалімдер бір-біріне
                  <br />
                  <span className="text-emerald-500">көмектесетін орын</span>
                </>
              )}
            </h1>

            <p className="text-xl text-gray-600 mb-10 max-w-2xl">
              {language === 'ru'
                ? 'Делитесь материалами, находите готовые уроки, экономьте время на подготовку. Бесплатно.'
                : 'Материалдармен бөлісіңіз, дайын сабақтарды табыңыз, дайындыққа уақыт үнемдеңіз. Тегін.'}
            </p>

            <div className="flex flex-wrap gap-4 mb-12">
              <Link href="/register">
                <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white h-12 px-8 text-base">
                  {language === 'ru' ? 'Начать бесплатно' : 'Тегін бастау'}
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <Link href="/explore">
                <Button size="lg" variant="outline" className="h-12 px-8 text-base border-gray-200">
                  {language === 'ru' ? 'Смотреть материалы' : 'Материалдарды қарау'}
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-12">
              <div>
                <div className="text-3xl font-bold text-gray-900">10K+</div>
                <div className="text-gray-500">{language === 'ru' ? 'Учителей' : 'Мұғалім'}</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">50K+</div>
                <div className="text-gray-500">{language === 'ru' ? 'Материалов' : 'Материал'}</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">1M+</div>
                <div className="text-gray-500">{language === 'ru' ? 'Скачиваний' : 'Жүктеу'}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {language === 'ru' ? 'Почему учителя выбирают нас' : 'Мұғалімдер неге бізді таңдайды'}
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              {language === 'ru'
                ? 'Мы создали платформу, которая экономит ваше время'
                : 'Біз сіздің уақытыңызды үнемдейтін платформа жасадық'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Clock,
                title: language === 'ru' ? 'Экономия времени' : 'Уақыт үнемдеу',
                desc: language === 'ru' ? 'Готовые материалы вместо часов подготовки' : 'Дайындық орнына дайын материалдар',
                color: 'text-emerald-600 bg-emerald-100',
              },
              {
                icon: TrendingUp,
                title: language === 'ru' ? 'Развитие' : 'Даму',
                desc: language === 'ru' ? 'Учитесь у лучших преподавателей' : 'Үздік оқытушылардан үйреніңіз',
                color: 'text-orange-600 bg-orange-100',
              },
              {
                icon: Heart,
                title: language === 'ru' ? 'Обмен опытом' : 'Тәжірибе алмасу',
                desc: language === 'ru' ? 'Делитесь и помогайте коллегам' : 'Бөлісіңіз және әріптестерге көмектесіңіз',
                color: 'text-pink-600 bg-pink-100',
              },
              {
                icon: Award,
                title: language === 'ru' ? 'Признание' : 'Мойындау',
                desc: language === 'ru' ? 'Рейтинги и благодарности' : 'Рейтингтер мен алғыстар',
                color: 'text-blue-600 bg-blue-100',
              },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center mb-4`}>
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Materials */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                {language === 'ru' ? 'Популярные материалы' : 'Танымал материалдар'}
              </h2>
              <p className="text-gray-600">
                {language === 'ru' ? 'То, что скачивают прямо сейчас' : 'Қазір жүктеп жатқандар'}
              </p>
            </div>
            <Link href="/explore">
              <Button variant="outline" className="border-gray-200">
                {language === 'ru' ? 'Все материалы' : 'Барлық материалдар'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {materials.map((material, i) => {
              const Icon = material.icon
              return (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                  <div className={`${material.bg} h-40 flex items-center justify-center`}>
                    <Icon className="h-16 w-16 text-white/80" />
                  </div>
                  <div className="p-6">
                    <div className="text-sm text-gray-500 mb-1">{material.type}</div>
                    <h3 className="font-semibold text-lg text-gray-900 mb-3">{material.title}</h3>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{material.author}</span>
                      <span className="flex items-center gap-1 text-gray-500">
                        <Download className="h-4 w-4" />
                        {material.downloads}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {language === 'ru' ? 'Что говорят учителя' : 'Мұғалімдер не айтады'}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100">
                <Quote className="h-8 w-8 text-emerald-200 mb-4" />
                <p className="text-gray-700 mb-6">{item.text}</p>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-emerald-100 text-emerald-700 text-sm font-medium">
                      {item.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-gray-900">{item.name}</div>
                    <div className="text-sm text-gray-500">{item.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gray-900 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-medium mb-6">
                <Bot className="h-4 w-4" />
                {language === 'ru' ? 'Новинка' : 'Жаңалық'}
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                {language === 'ru' ? 'ИИ-помощник для учителя' : 'Мұғалімге AI-көмекші'}
              </h2>
              <p className="text-gray-400 text-lg mb-8">
                {language === 'ru'
                  ? 'Умный ассистент поможет составить план урока, придумать задания и ответит на вопросы'
                  : 'Ақылды көмекші сабақ жоспарын құруға, тапсырмалар ойлап табуға көмектеседі'}
              </p>
              <div className="space-y-3 mb-8">
                {[
                  language === 'ru' ? 'Генерация идей для уроков' : 'Сабаққа идеялар генерациясы',
                  language === 'ru' ? 'Помощь с планами и КТП' : 'Жоспарлар мен КТЖ көмек',
                  language === 'ru' ? 'Ответы на вопросы' : 'Сұрақтарға жауаптар',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-gray-300">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    {item}
                  </div>
                ))}
              </div>
              <Link href="/ai-assistant">
                <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white h-12 px-8">
                  {language === 'ru' ? 'Попробовать' : 'Қолданып көру'}
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            </div>
            <div className="flex-1 max-w-md">
              <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-white font-medium">
                    {language === 'ru' ? 'ИИ-ассистент' : 'AI-көмекші'}
                  </div>
                </div>
                <div className="bg-gray-700/50 rounded-xl p-4 text-gray-300 text-sm mb-4">
                  {language === 'ru'
                    ? 'Привет! Я помогу с планированием уроков. Что вас интересует?'
                    : 'Сәлем! Сабақтарды жоспарлауға көмектесемін. Сізді не қызықтырады?'}
                </div>
                <div className="flex gap-2">
                  <div className="bg-emerald-500/20 text-emerald-400 rounded-lg px-3 py-2 text-sm">
                    {language === 'ru' ? 'План урока' : 'Сабақ жоспары'}
                  </div>
                  <div className="bg-orange-500/20 text-orange-400 rounded-lg px-3 py-2 text-sm">
                    {language === 'ru' ? 'Идеи' : 'Идеялар'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-emerald-500">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            {language === 'ru' ? 'Готовы присоединиться?' : 'Қосылуға дайынсыз ба?'}
          </h2>
          <p className="text-emerald-100 text-xl mb-10">
            {language === 'ru'
              ? 'Регистрация бесплатна и займёт 30 секунд'
              : 'Тіркелу тегін және 30 секунд алады'}
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-white text-emerald-600 hover:bg-emerald-50 h-14 px-12 text-lg">
              {language === 'ru' ? 'Создать аккаунт' : 'Аккаунт жасау'}
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold text-gray-900">{t.landing.title}</span>
            </div>
            <div className="flex gap-8 text-sm text-gray-500">
              <Link href="/explore" className="hover:text-gray-900">{t.nav.explore}</Link>
              <Link href="/communities" className="hover:text-gray-900">{t.nav.communities}</Link>
              <Link href="/help" className="hover:text-gray-900">{t.nav.help}</Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-100 text-center text-sm text-gray-400">
            &copy; {new Date().getFullYear()} {t.landing.title}
          </div>
        </div>
      </footer>
    </div>
  )
}
