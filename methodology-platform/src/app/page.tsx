'use client'

import Link from 'next/link'
import {
  BookOpen,
  Users,
  Sparkles,
  ArrowRight,
  Heart,
  Clock,
  Download,
  Star,
  Trophy,
  Zap,
  FileText,
  Video,
  Presentation,
  MessageCircle,
  TrendingUp,
  Award,
  CheckCircle2,
  Play,
  Bot,
  Lightbulb,
  Target,
  Rocket,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import LanguageSwitcher from '@/components/shared/LanguageSwitcher'
import { useLanguage } from '@/hooks/useLanguage'

export default function LandingPage() {
  const { t, language } = useLanguage()

  const benefits = language === 'ru' ? [
    { icon: Clock, title: 'Экономьте время', desc: 'Готовые материалы от коллег вместо часов подготовки' },
    { icon: TrendingUp, title: 'Развивайтесь', desc: 'Учитесь у лучших преподавателей страны' },
    { icon: Heart, title: 'Делитесь опытом', desc: 'Ваши наработки помогут тысячам учителей' },
    { icon: Award, title: 'Получайте признание', desc: 'Рейтинги, бейджи и благодарности коллег' },
  ] : [
    { icon: Clock, title: 'Уақытты үнемдеңіз', desc: 'Дайындық сағаттарының орнына әріптестердің дайын материалдары' },
    { icon: TrendingUp, title: 'Дамыңыз', desc: 'Елдің үздік оқытушыларынан үйреніңіз' },
    { icon: Heart, title: 'Тәжірибемен бөлісіңіз', desc: 'Сіздің жұмыстарыңыз мыңдаған мұғалімдерге көмектеседі' },
    { icon: Award, title: 'Мойындау алыңыз', desc: 'Рейтингтер, бейджилер және әріптестердің алғысы' },
  ]

  const popularMaterials = language === 'ru' ? [
    { type: 'Презентация', title: 'Введение в алгебру', author: 'Айгуль Н.', downloads: 1240, icon: Presentation, color: 'bg-orange-500' },
    { type: 'Видеоурок', title: 'Опыты по физике', author: 'Серик М.', downloads: 890, icon: Video, color: 'bg-green-500' },
    { type: 'Документ', title: 'КТП по истории', author: 'Дана К.', downloads: 2100, icon: FileText, color: 'bg-blue-500' },
    { type: 'Презентация', title: 'Английский для начинающих', author: 'Мадина А.', downloads: 1560, icon: Presentation, color: 'bg-purple-500' },
  ] : [
    { type: 'Презентация', title: 'Алгебраға кіріспе', author: 'Айгүл Н.', downloads: 1240, icon: Presentation, color: 'bg-orange-500' },
    { type: 'Бейне сабақ', title: 'Физика тәжірибелері', author: 'Серік М.', downloads: 890, icon: Video, color: 'bg-green-500' },
    { type: 'Құжат', title: 'Тарих бойынша КТЖ', author: 'Дана К.', downloads: 2100, icon: FileText, color: 'bg-blue-500' },
    { type: 'Презентация', title: 'Бастауыш ағылшын', author: 'Мадина А.', downloads: 1560, icon: Presentation, color: 'bg-purple-500' },
  ]

  const aiFeatures = language === 'ru' ? [
    { icon: Lightbulb, title: 'Генерация идей', desc: 'ИИ предложит идеи для интерактивных занятий' },
    { icon: FileText, title: 'Создание планов', desc: 'Автоматическое создание планов уроков' },
    { icon: MessageCircle, title: 'Ответы на вопросы', desc: 'Мгновенные ответы на методические вопросы' },
    { icon: Target, title: 'Персонализация', desc: 'Адаптация под ваш предмет и класс' },
  ] : [
    { icon: Lightbulb, title: 'Идея генерациясы', desc: 'AI интерактивті сабақтарға идеялар ұсынады' },
    { icon: FileText, title: 'Жоспар құру', desc: 'Сабақ жоспарларын автоматты түрде жасау' },
    { icon: MessageCircle, title: 'Сұрақтарға жауап', desc: 'Әдістемелік сұрақтарға лезде жауап' },
    { icon: Target, title: 'Жекешелендіру', desc: 'Пәніңіз бен сыныпқа бейімдеу' },
  ]

  const steps = language === 'ru' ? [
    { num: '01', title: 'Регистрация', desc: 'Создайте аккаунт за 30 секунд' },
    { num: '02', title: 'Загрузите материал', desc: 'Поделитесь своими наработками' },
    { num: '03', title: 'Находите и скачивайте', desc: 'Используйте материалы коллег' },
    { num: '04', title: 'Растите в рейтинге', desc: 'Получайте признание сообщества' },
  ] : [
    { num: '01', title: 'Тіркелу', desc: '30 секундта аккаунт жасаңыз' },
    { num: '02', title: 'Материал жүктеу', desc: 'Жұмыстарыңызбен бөлісіңіз' },
    { num: '03', title: 'Тауып жүктеңіз', desc: 'Әріптестердің материалдарын қолданыңыз' },
    { num: '04', title: 'Рейтингте өсіңіз', desc: 'Қауымдастық мойындауын алыңыз' },
  ]

  const topTeachers = [
    { name: 'Айгуль Н.', subject: language === 'ru' ? 'Математика' : 'Математика', materials: 156, avatar: 'АН' },
    { name: 'Серик М.', subject: language === 'ru' ? 'Физика' : 'Физика', materials: 98, avatar: 'СМ' },
    { name: 'Дана К.', subject: language === 'ru' ? 'История' : 'Тарих', materials: 124, avatar: 'ДК' },
    { name: 'Мадина А.', subject: language === 'ru' ? 'Английский' : 'Ағылшын', materials: 89, avatar: 'МА' },
    { name: 'Ержан Б.', subject: language === 'ru' ? 'Информатика' : 'Информатика', materials: 112, avatar: 'ЕБ' },
  ]

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-green-500 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg">
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
              <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white">
                {t.nav.register}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative">
        {/* Decorative elements */}
        <div className="absolute top-40 left-10 w-64 h-64 bg-green-100 rounded-full blur-3xl opacity-60" />
        <div className="absolute top-60 right-10 w-48 h-48 bg-orange-100 rounded-full blur-3xl opacity-60" />

        <div className="max-w-6xl mx-auto relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full text-green-700 text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              {language === 'ru' ? 'Уже 10 000+ преподавателей с нами' : '10 000+ оқытушы бізбен бірге'}
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              {language === 'ru' ? (
                <>Место, где учителя <span className="text-green-500">вдохновляют</span> друг друга</>
              ) : (
                <>Мұғалімдер бір-бірін <span className="text-green-500">шабыттандыратын</span> орын</>
              )}
            </h1>

            <p className="text-xl text-gray-600 mb-10 leading-relaxed">
              {language === 'ru'
                ? 'Делитесь материалами, находите готовые уроки, общайтесь с коллегами. Всё бесплатно.'
                : 'Материалдармен бөлісіңіз, дайын сабақтарды табыңыз, әріптестермен сөйлесіңіз. Барлығы тегін.'}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="bg-green-500 hover:bg-green-600 text-white px-8 h-12 text-base">
                  {language === 'ru' ? 'Начать бесплатно' : 'Тегін бастау'}
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <Link href="/explore">
                <Button size="lg" variant="outline" className="px-8 h-12 text-base border-gray-200">
                  <Play className="h-5 w-5 mr-2" />
                  {language === 'ru' ? 'Смотреть материалы' : 'Материалдарды қарау'}
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '10K+', label: language === 'ru' ? 'Преподавателей' : 'Оқытушылар' },
              { value: '50K+', label: language === 'ru' ? 'Материалов' : 'Материалдар' },
              { value: '45', label: language === 'ru' ? 'Дисциплин' : 'Пәндер' },
              { value: '98%', label: language === 'ru' ? 'Довольны' : 'Қанағаттанған' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits for teachers */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              {language === 'ru' ? 'Почему учителя выбирают нас' : 'Мұғалімдер неге бізді таңдайды'}
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              {language === 'ru'
                ? 'Мы создали платформу, о которой мечтает каждый преподаватель'
                : 'Біз әр оқытушы арман ететін платформаны жасадық'}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, i) => {
              const Icon = benefit.icon
              return (
                <div
                  key={i}
                  className="bg-white p-6 rounded-2xl border border-gray-100 hover:border-green-200 hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                  <p className="text-gray-600 text-sm">{benefit.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Active community */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-100 rounded-full text-orange-700 text-sm font-medium mb-4">
                <Users className="h-4 w-4" />
                {language === 'ru' ? 'Активное сообщество' : 'Белсенді қауымдастық'}
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                {language === 'ru' ? 'Вы не одни в этом пути' : 'Сіз бұл жолда жалғыз емессіз'}
              </h2>
              <p className="text-gray-600 text-lg mb-8">
                {language === 'ru'
                  ? 'Тысячи преподавателей уже делятся опытом, помогают друг другу и растут вместе. Присоединяйтесь!'
                  : 'Мыңдаған оқытушылар тәжірибемен бөлісуде, бір-біріне көмектесуде және бірге өсуде. Қосылыңыз!'}
              </p>

              <div className="space-y-4">
                {[
                  { icon: MessageCircle, text: language === 'ru' ? 'Чаты по предметам' : 'Пәндер бойынша чаттар' },
                  { icon: Trophy, text: language === 'ru' ? 'Рейтинг лучших авторов' : 'Үздік авторлар рейтингі' },
                  { icon: Award, text: language === 'ru' ? 'Бейджи и достижения' : 'Бейджилер мен жетістіктер' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <item.icon className="h-5 w-5 text-green-600" />
                    </div>
                    <span className="font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 rounded-3xl p-8">
              <h3 className="font-semibold text-lg mb-6 flex items-center gap-2">
                <Star className="h-5 w-5 text-orange-500" />
                {language === 'ru' ? 'Топ авторов недели' : 'Апта үздіктері'}
              </h3>
              <div className="space-y-4">
                {topTeachers.map((teacher, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 bg-white rounded-xl">
                    <div className="text-sm font-bold text-gray-400 w-6">#{i + 1}</div>
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-green-100 text-green-700 text-sm font-medium">
                        {teacher.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium">{teacher.name}</div>
                      <div className="text-sm text-gray-500">{teacher.subject}</div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {teacher.materials} {language === 'ru' ? 'мат.' : 'мат.'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular materials */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-2">
                {language === 'ru' ? 'Популярные материалы' : 'Танымал материалдар'}
              </h2>
              <p className="text-gray-600">
                {language === 'ru' ? 'То, что сейчас скачивают больше всего' : 'Қазір ең көп жүктелетіндер'}
              </p>
            </div>
            <Link href="/explore">
              <Button variant="outline" className="border-gray-200">
                {language === 'ru' ? 'Смотреть все' : 'Барлығын көру'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularMaterials.map((material, i) => {
              const Icon = material.icon
              return (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer"
                >
                  <div className={`h-32 ${material.color} flex items-center justify-center`}>
                    <Icon className="h-12 w-12 text-white/90" />
                  </div>
                  <div className="p-5">
                    <div className="text-xs text-gray-500 mb-1">{material.type}</div>
                    <h3 className="font-semibold mb-2 group-hover:text-green-600 transition-colors">{material.title}</h3>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{material.author}</span>
                      <span className="flex items-center gap-1">
                        <Download className="h-3.5 w-3.5" />
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

      {/* AI Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden">
            {/* Decorative */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-400/20 rounded-full blur-3xl" />

            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <Bot className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold">
                    {language === 'ru' ? 'ИИ-ассистент' : 'AI-көмекші'}
                  </h2>
                  <p className="text-green-100">
                    {language === 'ru' ? 'Ваш умный помощник в работе' : 'Жұмыстағы ақылды көмекшіңіз'}
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
                {aiFeatures.map((feature, i) => {
                  const Icon = feature.icon
                  return (
                    <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-5">
                      <Icon className="h-8 w-8 mb-4 text-orange-300" />
                      <h3 className="font-semibold mb-2">{feature.title}</h3>
                      <p className="text-sm text-green-100">{feature.desc}</p>
                    </div>
                  )
                })}
              </div>

              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link href="/ai-assistant">
                  <Button size="lg" className="bg-white text-green-600 hover:bg-green-50 px-8">
                    {language === 'ru' ? 'Попробовать ИИ' : 'AI қолданып көру'}
                    <Zap className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              {language === 'ru' ? 'Как это работает' : 'Бұл қалай жұмыс істейді'}
            </h2>
            <p className="text-gray-600 text-lg">
              {language === 'ru' ? '4 простых шага к успеху' : 'Табысқа 4 қарапайым қадам'}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gray-200 -translate-x-1/2" />
                )}
                <div className="text-5xl font-bold text-gray-100 mb-4">{step.num}</div>
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-full text-orange-700 text-sm font-medium mb-6">
            <Rocket className="h-4 w-4" />
            {language === 'ru' ? 'Начните прямо сейчас' : 'Қазір бастаңыз'}
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            {language === 'ru'
              ? 'Присоединяйтесь к сообществу лучших учителей'
              : 'Үздік мұғалімдер қауымдастығына қосылыңыз'}
          </h2>

          <p className="text-gray-600 text-lg mb-10 max-w-2xl mx-auto">
            {language === 'ru'
              ? 'Регистрация бесплатна и займёт всего 30 секунд. Начните делиться и находить материалы уже сегодня.'
              : 'Тіркелу тегін және тек 30 секунд алады. Бүгіннен бастап материалдармен бөлісіп, табуды бастаңыз.'}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-green-500 hover:bg-green-600 text-white px-10 h-14 text-lg">
                {language === 'ru' ? 'Создать аккаунт бесплатно' : 'Тегін аккаунт жасау'}
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>

          <p className="text-sm text-gray-500 mt-6 flex items-center justify-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            {language === 'ru' ? 'Без кредитной карты' : 'Несие картасыз'}
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-green-500 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold">{t.landing.title}</span>
            </div>

            <div className="flex items-center gap-8 text-sm text-gray-500">
              <Link href="/explore" className="hover:text-gray-900 transition-colors">{t.nav.explore}</Link>
              <Link href="/communities" className="hover:text-gray-900 transition-colors">{t.nav.communities}</Link>
              <Link href="/help" className="hover:text-gray-900 transition-colors">{t.nav.help}</Link>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-400">
            &copy; {new Date().getFullYear()} {t.landing.title}. {language === 'ru' ? 'Все права защищены.' : 'Барлық құқықтар қорғалған.'}
          </div>
        </div>
      </footer>
    </div>
  )
}
