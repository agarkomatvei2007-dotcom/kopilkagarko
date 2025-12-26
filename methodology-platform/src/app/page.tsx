'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  BookOpen,
  Users,
  Sparkles,
  ArrowRight,
  Heart,
  Download,
  Star,
  MessageCircle,
  Quote,
  Smile,
  Coffee,
  ThumbsUp,
  Upload,
  Bell,
  Zap,
  CheckCircle,
  Clock,
  TrendingUp,
  Award,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import LanguageSwitcher from '@/components/shared/LanguageSwitcher'
import { useLanguage } from '@/hooks/useLanguage'

// Simulated live activity for animation
const activities = [
  { user: 'Айгуль', action: 'upload', item: 'Презентация по алгебре', time: '2 мин' },
  { user: 'Серик', action: 'download', item: 'Видеоурок физики', time: '5 мин' },
  { user: 'Дана', action: 'like', item: 'КТП по истории', time: '8 мин' },
  { user: 'Мадина', action: 'comment', item: 'Урок английского', time: '12 мин' },
  { user: 'Ержан', action: 'upload', item: 'Тесты по информатике', time: '15 мин' },
]

export default function LandingPage() {
  const { t, language } = useLanguage()
  const [currentActivity, setCurrentActivity] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    const interval = setInterval(() => {
      setCurrentActivity((prev) => (prev + 1) % activities.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const testimonials = language === 'ru' ? [
    {
      name: 'Айжан Калиева',
      role: 'Учитель математики, 15 лет стажа',
      avatar: 'АК',
      text: 'Раньше я тратила выходные на подготовку к урокам. Теперь нахожу отличные материалы за 5 минут! Спасибо коллегам 💚',
      school: 'СОШ №45, Алматы',
    },
    {
      name: 'Болат Сериков',
      role: 'Учитель физики',
      avatar: 'БС',
      text: 'Мои материалы скачали 2000+ раз. Приятно знать, что мой труд помогает другим учителям по всей стране!',
      school: 'Гимназия №1, Астана',
    },
    {
      name: 'Гульнара Ахметова',
      role: 'Учитель начальных классов',
      avatar: 'ГА',
      text: 'Это как Pinterest для учителей! Вдохновляюсь идеями коллег каждый день. Уже привела сюда весь наш педсовет 😊',
      school: 'Лицей "Білім"',
    },
  ] : [
    {
      name: 'Айжан Қалиева',
      role: 'Математика мұғалімі, 15 жыл тәжірибе',
      avatar: 'АҚ',
      text: 'Бұрын демалыс күндерді сабаққа дайындалуға жұмсайтынмын. Енді керемет материалдарды 5 минутта табамын! 💚',
      school: 'ЖОМ №45, Алматы',
    },
    {
      name: 'Болат Серіков',
      role: 'Физика мұғалімі',
      avatar: 'БС',
      text: 'Менің материалдарымды 2000+ рет жүктеп алды. Еңбегім бүкіл ел бойынша мұғалімдерге көмектесетінін білу қуанышты!',
      school: 'Гимназия №1, Астана',
    },
    {
      name: 'Гүлнара Ахметова',
      role: 'Бастауыш сынып мұғалімі',
      avatar: 'ГА',
      text: 'Бұл мұғалімдерге арналған Pinterest сияқты! Әріптестердің идеяларынан күнде шабыт аламын 😊',
      school: 'Білім лицейі',
    },
  ]

  const popularMaterials = [
    {
      title: language === 'ru' ? 'Интерактивная алгебра' : 'Интерактивті алгебра',
      author: 'Айгуль Н.',
      downloads: 1240,
      likes: 89,
      color: 'from-green-400 to-emerald-500',
      emoji: '📐',
    },
    {
      title: language === 'ru' ? 'Опыты по физике' : 'Физика тәжірибелері',
      author: 'Серик М.',
      downloads: 890,
      likes: 67,
      color: 'from-orange-400 to-amber-500',
      emoji: '🔬',
    },
    {
      title: language === 'ru' ? 'История Казахстана' : 'Қазақстан тарихы',
      author: 'Дана К.',
      downloads: 2100,
      likes: 156,
      color: 'from-blue-400 to-cyan-500',
      emoji: '📜',
    },
    {
      title: language === 'ru' ? 'English for Kids' : 'English for Kids',
      author: 'Мадина А.',
      downloads: 1560,
      likes: 134,
      color: 'from-purple-400 to-pink-500',
      emoji: '🇬🇧',
    },
  ]

  const stats = [
    {
      value: '10,847',
      label: language === 'ru' ? 'учителей' : 'мұғалім',
      icon: Users,
      color: 'text-green-600 bg-green-100',
    },
    {
      value: '52,341',
      label: language === 'ru' ? 'материалов' : 'материал',
      icon: BookOpen,
      color: 'text-orange-600 bg-orange-100',
    },
    {
      value: '1.2M',
      label: language === 'ru' ? 'скачиваний' : 'жүктеу',
      icon: Download,
      color: 'text-blue-600 bg-blue-100',
    },
  ]

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'upload': return <Upload className="h-3 w-3 text-green-600" />
      case 'download': return <Download className="h-3 w-3 text-blue-600" />
      case 'like': return <Heart className="h-3 w-3 text-red-500" />
      case 'comment': return <MessageCircle className="h-3 w-3 text-purple-600" />
      default: return <Bell className="h-3 w-3" />
    }
  }

  const getActivityText = (action: string) => {
    if (language === 'ru') {
      switch (action) {
        case 'upload': return 'загрузил(а)'
        case 'download': return 'скачал(а)'
        case 'like': return 'оценил(а)'
        case 'comment': return 'прокомментировал(а)'
        default: return ''
      }
    } else {
      switch (action) {
        case 'upload': return 'жүктеді'
        case 'download': return 'жүктеп алды'
        case 'like': return 'бағалады'
        case 'comment': return 'пікір қалдырды'
        default: return ''
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 via-white to-green-50/30 overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-amber-100/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg shadow-green-200 group-hover:scale-105 transition-transform">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
              {t.landing.title}
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                {t.nav.login}
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg shadow-green-200 hover:shadow-green-300 transition-all">
                {t.nav.register}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-28 pb-16 px-6 relative">
        {/* Decorative blobs */}
        <div className="absolute top-20 left-0 w-96 h-96 bg-gradient-to-br from-green-200/40 to-emerald-100/40 rounded-full blur-3xl" />
        <div className="absolute top-40 right-0 w-80 h-80 bg-gradient-to-br from-orange-200/40 to-amber-100/40 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-gradient-to-br from-yellow-100/40 to-amber-50/40 rounded-full blur-3xl" />

        <div className="max-w-6xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Text */}
            <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              {/* Live activity badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-lg shadow-gray-100 border border-gray-100 mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-sm text-gray-600">
                  {getActivityIcon(activities[currentActivity].action)}
                  <span className="ml-1.5 font-medium text-gray-900">{activities[currentActivity].user}</span>
                  {' '}{getActivityText(activities[currentActivity].action)}{' '}
                  <span className="text-green-600">{activities[currentActivity].item}</span>
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] mb-6">
                {language === 'ru' ? (
                  <>
                    <span className="text-gray-900">Место, где учителя</span>
                    <br />
                    <span className="bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 bg-clip-text text-transparent">помогают друг другу</span>
                    <span className="inline-block ml-3 animate-bounce">💚</span>
                  </>
                ) : (
                  <>
                    <span className="text-gray-900">Мұғалімдер бір-біріне</span>
                    <br />
                    <span className="bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 bg-clip-text text-transparent">көмектесетін орын</span>
                    <span className="inline-block ml-3 animate-bounce">💚</span>
                  </>
                )}
              </h1>

              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                {language === 'ru' ? (
                  <>Делитесь материалами, вдохновляйтесь идеями коллег, экономьте время на подготовку. <span className="font-medium text-gray-900">Бесплатно</span> и с любовью к профессии.</>
                ) : (
                  <>Материалдармен бөлісіңіз, әріптестердің идеяларынан шабыт алыңыз, дайындыққа уақыт үнемдеңіз. <span className="font-medium text-gray-900">Тегін</span> және кәсіпке сүйіспеншілікпен.</>
                )}
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register">
                  <Button size="lg" className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 h-14 text-lg rounded-2xl shadow-xl shadow-green-200 hover:shadow-green-300 hover:scale-[1.02] transition-all">
                    {language === 'ru' ? 'Присоединиться бесплатно' : 'Тегін қосылу'}
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/explore">
                  <Button size="lg" variant="outline" className="px-8 h-14 text-lg rounded-2xl border-2 border-gray-200 hover:border-green-300 hover:bg-green-50">
                    <Sparkles className="h-5 w-5 mr-2 text-orange-500" />
                    {language === 'ru' ? 'Посмотреть материалы' : 'Материалдарды қарау'}
                  </Button>
                </Link>
              </div>

              {/* Social proof avatars */}
              <div className="mt-10 flex items-center gap-4">
                <div className="flex -space-x-3">
                  {['АК', 'БС', 'ГА', 'ДК', 'ЕМ'].map((initials, i) => (
                    <Avatar key={i} className="h-10 w-10 border-2 border-white shadow-md">
                      <AvatarFallback className={`text-xs font-medium ${
                        i % 3 === 0 ? 'bg-green-100 text-green-700' :
                        i % 3 === 1 ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <div className="text-sm">
                  <span className="font-semibold text-gray-900">10,000+</span>
                  <span className="text-gray-600">
                    {language === 'ru' ? ' учителей уже с нами' : ' мұғалім бізбен бірге'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right - Visual */}
            <div className={`relative transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              {/* Stats cards */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {stats.map((stat, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl p-4 shadow-lg shadow-gray-100 border border-gray-100 hover:scale-105 transition-transform cursor-default"
                  >
                    <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-sm text-gray-500">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Featured material card */}
              <div className="bg-white rounded-3xl p-6 shadow-xl shadow-gray-100 border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-3xl">🔥</div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {language === 'ru' ? 'Популярно сегодня' : 'Бүгін танымал'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {language === 'ru' ? 'Скачали 234 раза за сегодня' : 'Бүгін 234 рет жүктелді'}
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl p-6 text-white mb-4">
                  <div className="text-4xl mb-3">📐</div>
                  <div className="font-semibold text-lg mb-1">
                    {language === 'ru' ? 'Интерактивная алгебра для 7 класса' : '7-сынып интерактивті алгебрасы'}
                  </div>
                  <div className="text-green-100 text-sm">
                    {language === 'ru' ? 'Презентация · 24 слайда' : 'Презентация · 24 слайд'}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-orange-100 text-orange-700 text-xs">АН</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium text-gray-900">Айгуль Нурланова</div>
                      <div className="text-xs text-gray-500">
                        {language === 'ru' ? 'Алматы, СОШ №45' : 'Алматы, ЖОМ №45'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Download className="h-4 w-4" /> 1.2K
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="h-4 w-4 text-red-400" /> 89
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits - Warm Cards */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-full text-orange-700 text-sm font-medium mb-4">
              <Coffee className="h-4 w-4" />
              {language === 'ru' ? 'Создано учителями для учителей' : 'Мұғалімдер мұғалімдер үшін жасаған'}
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {language === 'ru' ? 'Почему нас любят учителя' : 'Мұғалімдер неге бізді жақсы көреді'}
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              {language === 'ru'
                ? 'Мы знаем, как много вы работаете. Поэтому сделали платформу, которая реально экономит время'
                : 'Сіз қаншама жұмыс істейтініңізді білеміз. Сондықтан уақытты шынымен үнемдейтін платформа жасадық'}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                emoji: '⏰',
                title: language === 'ru' ? 'Экономьте время' : 'Уақытты үнемдеңіз',
                desc: language === 'ru' ? 'Готовые материалы вместо часов подготовки' : 'Дайындық сағаттарының орнына дайын материалдар',
                color: 'from-green-50 to-emerald-50 border-green-100',
              },
              {
                emoji: '🎯',
                title: language === 'ru' ? 'Находите быстро' : 'Тез табыңыз',
                desc: language === 'ru' ? 'Умный поиск по предметам и классам' : 'Пәндер мен сыныптар бойынша ақылды іздеу',
                color: 'from-orange-50 to-amber-50 border-orange-100',
              },
              {
                emoji: '🌟',
                title: language === 'ru' ? 'Делитесь опытом' : 'Тәжірибемен бөлісіңіз',
                desc: language === 'ru' ? 'Ваши материалы помогут тысячам коллег' : 'Материалдарыңыз мыңдаған әріптестерге көмектеседі',
                color: 'from-blue-50 to-cyan-50 border-blue-100',
              },
              {
                emoji: '🏆',
                title: language === 'ru' ? 'Растите в рейтинге' : 'Рейтингте өсіңіз',
                desc: language === 'ru' ? 'Бейджи, признание и благодарность' : 'Бейджилер, мойындау және алғыс',
                color: 'from-purple-50 to-pink-50 border-purple-100',
              },
            ].map((item, i) => (
              <div
                key={i}
                className={`bg-gradient-to-br ${item.color} rounded-3xl p-6 border hover:scale-[1.02] hover:shadow-lg transition-all cursor-default`}
              >
                <div className="text-4xl mb-4">{item.emoji}</div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-gradient-to-b from-white to-amber-50/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full text-green-700 text-sm font-medium mb-4">
              <Heart className="h-4 w-4" />
              {language === 'ru' ? 'Отзывы коллег' : 'Әріптестердің пікірлері'}
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {language === 'ru' ? 'Что говорят учителя' : 'Мұғалімдер не айтады'}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl p-6 shadow-lg shadow-gray-100 border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                <Quote className="h-8 w-8 text-green-200 mb-4" />
                <p className="text-gray-700 mb-6 leading-relaxed">{testimonial.text}</p>
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-gradient-to-br from-green-400 to-green-600 text-white font-medium">
                      {testimonial.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                    <div className="text-xs text-green-600">{testimonial.school}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Materials */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-full text-orange-700 text-sm font-medium mb-4">
                <TrendingUp className="h-4 w-4" />
                {language === 'ru' ? 'Популярное' : 'Танымал'}
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                {language === 'ru' ? 'Материалы, которые любят' : 'Сүйікті материалдар'}
              </h2>
              <p className="text-gray-600">
                {language === 'ru' ? 'То, что скачивают прямо сейчас' : 'Қазір жүктеп жатқандар'}
              </p>
            </div>
            <Link href="/explore">
              <Button variant="outline" className="rounded-full border-gray-200 hover:border-green-300 hover:bg-green-50">
                {language === 'ru' ? 'Смотреть все' : 'Барлығын көру'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularMaterials.map((material, i) => (
              <div
                key={i}
                className="group cursor-pointer"
              >
                <div className={`bg-gradient-to-br ${material.color} rounded-3xl p-6 mb-4 aspect-square flex flex-col justify-between text-white group-hover:scale-[1.02] group-hover:shadow-xl transition-all`}>
                  <div className="text-5xl">{material.emoji}</div>
                  <div>
                    <div className="font-semibold text-lg">{material.title}</div>
                    <div className="text-white/80 text-sm">{material.author}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between px-2 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Download className="h-4 w-4" /> {material.downloads}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="h-4 w-4 text-red-400" /> {material.likes}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-green-50/50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-[2rem] p-8 sm:p-12 relative overflow-hidden">
            {/* Decorative */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-green-500/20 to-emerald-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-br from-orange-500/20 to-amber-500/10 rounded-full blur-3xl" />

            <div className="relative grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 rounded-full text-green-400 text-sm font-medium mb-6">
                  <Zap className="h-4 w-4" />
                  {language === 'ru' ? 'Новинка!' : 'Жаңалық!'}
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                  {language === 'ru' ? 'ИИ-помощник для учителя' : 'Мұғалімге арналған AI-көмекші'}
                </h2>
                <p className="text-gray-400 text-lg mb-8">
                  {language === 'ru'
                    ? 'Умный ассистент поможет составить план урока, придумать интересные задания и ответит на методические вопросы'
                    : 'Ақылды көмекші сабақ жоспарын құруға, қызықты тапсырмалар ойлап табуға және әдістемелік сұрақтарға жауап беруге көмектеседі'}
                </p>
                <div className="space-y-4 mb-8">
                  {[
                    language === 'ru' ? 'Генерация идей для уроков' : 'Сабаққа идеялар генерациясы',
                    language === 'ru' ? 'Помощь с планами и КТП' : 'Жоспарлар мен КТЖ-мен көмек',
                    language === 'ru' ? 'Ответы на методические вопросы' : 'Әдістемелік сұрақтарға жауаптар',
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-gray-300">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      {item}
                    </div>
                  ))}
                </div>
                <Link href="/ai-assistant">
                  <Button size="lg" className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 rounded-2xl">
                    {language === 'ru' ? 'Попробовать бесплатно' : 'Тегін қолданып көру'}
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
              </div>

              <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                    <Smile className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-medium">
                      {language === 'ru' ? 'ИИ-ассистент' : 'AI-көмекші'}
                    </div>
                    <div className="text-gray-500 text-sm">
                      {language === 'ru' ? 'Онлайн' : 'Онлайн'}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-gray-700/50 rounded-xl p-4 text-gray-300 text-sm">
                    {language === 'ru'
                      ? '🎓 Привет! Я помогу вам с планированием уроков и методическими материалами. Что вас интересует?'
                      : '🎓 Сәлем! Мен сабақтарды жоспарлауға және әдістемелік материалдарға көмектесемін. Сізді не қызықтырады?'}
                  </div>
                  <div className="flex gap-2">
                    <div className="bg-green-500/20 text-green-400 rounded-lg px-3 py-2 text-sm cursor-pointer hover:bg-green-500/30 transition-colors">
                      {language === 'ru' ? '📝 Составить план урока' : '📝 Сабақ жоспарын құру'}
                    </div>
                    <div className="bg-orange-500/20 text-orange-400 rounded-lg px-3 py-2 text-sm cursor-pointer hover:bg-orange-500/30 transition-colors">
                      {language === 'ru' ? '💡 Идеи для занятий' : '💡 Сабаққа идеялар'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-6xl mb-6">👋</div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            {language === 'ru'
              ? 'Готовы присоединиться?'
              : 'Қосылуға дайынсыз ба?'}
          </h2>
          <p className="text-gray-600 text-xl mb-10 max-w-2xl mx-auto">
            {language === 'ru'
              ? 'Регистрация бесплатна и займёт всего 30 секунд. Тысячи коллег уже ждут вас!'
              : 'Тіркелу тегін және тек 30 секунд алады. Мыңдаған әріптестер сізді күтуде!'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-12 h-16 text-xl rounded-2xl shadow-xl shadow-green-200 hover:shadow-green-300 hover:scale-[1.02] transition-all">
                {language === 'ru' ? 'Создать аккаунт' : 'Аккаунт жасау'}
                <ArrowRight className="h-6 w-6 ml-2" />
              </Button>
            </Link>
          </div>
          <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-green-500" />
              {language === 'ru' ? 'Бесплатно' : 'Тегін'}
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-green-500" />
              {language === 'ru' ? 'Без рекламы' : 'Жарнамасыз'}
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-green-500" />
              {language === 'ru' ? 'С любовью' : 'Сүйіспеншілікпен'}
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg shadow-green-200">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg">{t.landing.title}</span>
            </div>

            <div className="flex items-center gap-8 text-sm text-gray-500">
              <Link href="/explore" className="hover:text-gray-900 transition-colors">{t.nav.explore}</Link>
              <Link href="/communities" className="hover:text-gray-900 transition-colors">{t.nav.communities}</Link>
              <Link href="/help" className="hover:text-gray-900 transition-colors">{t.nav.help}</Link>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <div>
              &copy; {new Date().getFullYear()} {t.landing.title}. {language === 'ru' ? 'Сделано с' : 'Жасалған'} 💚 {language === 'ru' ? 'для учителей' : 'мұғалімдер үшін'}
            </div>
            <div className="flex items-center gap-2">
              <ThumbsUp className="h-4 w-4" />
              {language === 'ru' ? 'Нас рекомендуют!' : 'Бізді ұсынады!'}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
