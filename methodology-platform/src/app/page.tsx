'use client'

import { useRef, useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import {
  BookOpen,
  ArrowRight,
  ArrowUpRight,
  Check,
  Star,
  FileText,
  Video,
  Presentation,
  Bot,
  Users,
  Zap,
  Shield,
  Clock,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import LanguageSwitcher from '@/components/shared/LanguageSwitcher'
import { useLanguage } from '@/hooks/useLanguage'

// Animated number
function AnimatedNumber({ value }: { value: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
    >
      {value}
    </motion.span>
  )
}

export default function LandingPage() {
  const { t, language } = useLanguage()
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: containerRef })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])

  const features = [
    {
      icon: Clock,
      title: language === 'ru' ? 'Экономия времени' : 'Уақытты үнемдеу',
      desc: language === 'ru' ? 'Готовые материалы вместо часов подготовки к урокам' : 'Сабаққа дайындалудың орнына дайын материалдар',
    },
    {
      icon: Users,
      title: language === 'ru' ? 'Сообщество' : 'Қауымдастық',
      desc: language === 'ru' ? '10 000+ педагогов делятся опытом и материалами' : '10 000+ педагог тәжірибе мен материалдармен бөліседі',
    },
    {
      icon: Bot,
      title: language === 'ru' ? 'ИИ-помощник' : 'ЖИ-көмекші',
      desc: language === 'ru' ? 'Умный ассистент поможет с планами и идеями' : 'Ақылды көмекші жоспарлар мен идеяларға көмектеседі',
    },
    {
      icon: Shield,
      title: language === 'ru' ? 'Бесплатно' : 'Тегін',
      desc: language === 'ru' ? 'Все возможности платформы без ограничений' : 'Платформаның барлық мүмкіндіктері шектеусіз',
    },
  ]

  const stats = [
    { value: '10K+', label: language === 'ru' ? 'учителей' : 'мұғалім' },
    { value: '50K+', label: language === 'ru' ? 'материалов' : 'материал' },
    { value: '1M+', label: language === 'ru' ? 'скачиваний' : 'жүктеу' },
  ]

  const testimonials = [
    {
      text: language === 'ru'
        ? 'Наконец-то платформа, где можно найти качественные материалы за минуты, а не часы.'
        : 'Ақырында сапалы материалдарды сағаттар емес, минуттарда табуға болатын платформа.',
      author: language === 'ru' ? 'Айгуль К.' : 'Айгүл К.',
      role: language === 'ru' ? 'Учитель математики' : 'Математика мұғалімі',
    },
    {
      text: language === 'ru'
        ? 'Мои материалы скачали более 2000 раз. Приятно помогать коллегам.'
        : 'Менің материалдарымды 2000-нан астам рет жүктеп алды. Әріптестерге көмектесу қуанышты.',
      author: language === 'ru' ? 'Болат С.' : 'Болат С.',
      role: language === 'ru' ? 'Учитель физики' : 'Физика мұғалімі',
    },
    {
      text: language === 'ru'
        ? 'ИИ-ассистент — это находка. Генерирует идеи для уроков за секунды.'
        : 'ЖИ-көмекші — бұл табылға. Сабақтарға идеяларды секундтарда генерациялайды.',
      author: language === 'ru' ? 'Дана М.' : 'Дана М.',
      role: language === 'ru' ? 'Учитель информатики' : 'Информатика мұғалімі',
    },
  ]

  const materials = [
    { type: 'presentation', title: language === 'ru' ? 'Алгебра 7 класс' : 'Алгебра 7 сынып', author: 'Айгуль Н.', downloads: '1.2K' },
    { type: 'video', title: language === 'ru' ? 'Опыты по физике' : 'Физика тәжірибелері', author: 'Серик М.', downloads: '890' },
    { type: 'document', title: language === 'ru' ? 'КТП История Казахстана' : 'ҚТЖ Қазақстан тарихы', author: 'Дана К.', downloads: '2.1K' },
  ]

  const typeIcons = {
    presentation: Presentation,
    video: Video,
    document: FileText,
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-white text-neutral-900">
      {/* Navigation */}
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-neutral-100"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-neutral-900 rounded-lg flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-lg">{t.landing.title}</span>
          </Link>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Link href="/login">
              <Button variant="ghost" className="text-neutral-600 hover:text-neutral-900">
                {t.nav.login}
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-neutral-900 text-white hover:bg-neutral-800 rounded-full px-5">
                {t.nav.register}
              </Button>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="max-w-3xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Badge */}
            <motion.div
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-100 rounded-full text-sm text-neutral-600 mb-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              {language === 'ru' ? '10 000+ учителей уже с нами' : '10 000+ мұғалім бізбен бірге'}
            </motion.div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
              {language === 'ru' ? (
                <>
                  Материалы для уроков
                  <br />
                  <span className="text-neutral-400">за минуты, не часы</span>
                </>
              ) : (
                <>
                  Сабаққа материалдар
                  <br />
                  <span className="text-neutral-400">сағаттар емес, минуттарда</span>
                </>
              )}
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-neutral-500 mb-10 max-w-xl leading-relaxed">
              {language === 'ru'
                ? 'Платформа, где педагоги делятся готовыми материалами. Находите, скачивайте, делитесь своими.'
                : 'Педагогтар дайын материалдармен бөлісетін платформа. Табыңыз, жүктеңіз, өзіңіздікімен бөлісіңіз.'}
            </p>

            {/* CTA */}
            <div className="flex flex-wrap gap-4">
              <Link href="/register">
                <Button size="lg" className="bg-neutral-900 text-white hover:bg-neutral-800 rounded-full h-12 px-8 text-base">
                  {language === 'ru' ? 'Начать бесплатно' : 'Тегін бастау'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/explore">
                <Button size="lg" variant="outline" className="rounded-full h-12 px-8 text-base border-neutral-200 hover:bg-neutral-50">
                  {language === 'ru' ? 'Смотреть материалы' : 'Материалдарды қарау'}
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="grid grid-cols-3 gap-8 mt-20 pt-10 border-t border-neutral-100 max-w-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            {stats.map((stat, i) => (
              <div key={i}>
                <div className="text-3xl font-bold text-neutral-900">
                  <AnimatedNumber value={stat.value} />
                </div>
                <div className="text-sm text-neutral-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Bento Grid - Features */}
      <section className="py-24 px-6 bg-neutral-50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">
              {language === 'ru' ? 'Всё для педагога' : 'Педагогқа бәрі'}
            </h2>
            <p className="text-neutral-500 text-lg max-w-xl mx-auto">
              {language === 'ru'
                ? 'Инструменты, которые экономят время и делают работу проще'
                : 'Уақытты үнемдейтін және жұмысты жеңілдететін құралдар'}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                className="bg-white rounded-2xl p-6 border border-neutral-200 hover:border-neutral-300 hover:shadow-lg transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="w-10 h-10 bg-neutral-100 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="h-5 w-5 text-neutral-700" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-neutral-500 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Materials Preview */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="flex items-end justify-between mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div>
              <h2 className="text-4xl font-bold mb-4">
                {language === 'ru' ? 'Популярные материалы' : 'Танымал материалдар'}
              </h2>
              <p className="text-neutral-500 text-lg">
                {language === 'ru' ? 'Самые скачиваемые на этой неделе' : 'Осы аптада ең көп жүктелген'}
              </p>
            </div>
            <Link href="/explore">
              <Button variant="ghost" className="text-neutral-600 hover:text-neutral-900">
                {language === 'ru' ? 'Все материалы' : 'Барлық материалдар'}
                <ArrowUpRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {materials.map((material, i) => {
              const Icon = typeIcons[material.type as keyof typeof typeIcons]
              return (
                <motion.div
                  key={i}
                  className="group bg-white rounded-2xl border border-neutral-200 p-6 hover:border-neutral-300 hover:shadow-lg transition-all duration-300 cursor-pointer"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="w-full aspect-[4/3] bg-neutral-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-neutral-200 transition-colors">
                    <Icon className="h-12 w-12 text-neutral-400" />
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                      {material.type === 'presentation' && (language === 'ru' ? 'Презентация' : 'Презентация')}
                      {material.type === 'video' && (language === 'ru' ? 'Видео' : 'Бейне')}
                      {material.type === 'document' && (language === 'ru' ? 'Документ' : 'Құжат')}
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-neutral-600 transition-colors">{material.title}</h3>
                  <div className="flex items-center justify-between text-sm text-neutral-500">
                    <span>{material.author}</span>
                    <span>{material.downloads} {language === 'ru' ? 'скачиваний' : 'жүктеу'}</span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-neutral-900 text-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">
              {language === 'ru' ? 'Отзывы коллег' : 'Әріптестердің пікірлері'}
            </h2>
            <p className="text-neutral-400 text-lg">
              {language === 'ru' ? 'Что говорят педагоги о платформе' : 'Педагогтар платформа туралы не айтады'}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((item, i) => (
              <motion.div
                key={i}
                className="bg-neutral-800 rounded-2xl p-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                <p className="text-neutral-300 mb-6 leading-relaxed">"{item.text}"</p>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-neutral-700 text-white text-sm">
                      {item.author[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-sm">{item.author}</div>
                    <div className="text-neutral-500 text-sm">{item.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Section */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-100 rounded-full text-sm text-neutral-600 mb-6">
                <Zap className="h-4 w-4" />
                {language === 'ru' ? 'Новинка' : 'Жаңалық'}
              </div>
              <h2 className="text-4xl font-bold mb-6">
                {language === 'ru' ? 'ИИ-ассистент для педагогов' : 'Педагогтарға арналған ЖИ-көмекші'}
              </h2>
              <p className="text-neutral-500 text-lg mb-8 leading-relaxed">
                {language === 'ru'
                  ? 'Умный помощник поможет составить план урока, придумать задания, ответить на вопросы по методике преподавания.'
                  : 'Ақылды көмекші сабақ жоспарын құруға, тапсырмалар ойлап табуға, оқыту әдістемесі бойынша сұрақтарға жауап беруге көмектеседі.'}
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  language === 'ru' ? 'Генерация идей для уроков' : 'Сабақтарға идеялар генерациялау',
                  language === 'ru' ? 'Помощь с планами и КТП' : 'Жоспарлар мен КТЖ көмек',
                  language === 'ru' ? 'Ответы на методические вопросы' : 'Әдістемелік сұрақтарға жауаптар',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-neutral-600">
                    <div className="w-5 h-5 bg-neutral-900 rounded-full flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/ai-assistant">
                <Button size="lg" className="bg-neutral-900 text-white hover:bg-neutral-800 rounded-full h-12 px-8">
                  {language === 'ru' ? 'Попробовать' : 'Қолданып көру'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="bg-neutral-100 rounded-3xl p-8 aspect-square flex items-center justify-center">
                <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-neutral-900 rounded-xl flex items-center justify-center">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{language === 'ru' ? 'ИИ-ассистент' : 'ЖИ-көмекші'}</div>
                      <div className="text-xs text-green-500 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                        {language === 'ru' ? 'Онлайн' : 'Желіде'}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-neutral-100 rounded-xl rounded-tl-none p-3 text-sm text-neutral-600 max-w-[80%]">
                      {language === 'ru' ? 'Помогу с планом урока. Какой предмет и тема?' : 'Сабақ жоспарына көмектесемін. Қай пән және тақырып?'}
                    </div>
                    <div className="bg-neutral-900 rounded-xl rounded-tr-none p-3 text-sm text-white max-w-[80%] ml-auto">
                      {language === 'ru' ? 'Математика, 7 класс, дроби' : 'Математика, 7 сынып, бөлшектер'}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-neutral-50">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              {language === 'ru' ? 'Присоединяйтесь к сообществу' : 'Қауымдастыққа қосылыңыз'}
            </h2>
            <p className="text-neutral-500 text-lg mb-10 max-w-xl mx-auto">
              {language === 'ru'
                ? 'Регистрация бесплатна и занимает 30 секунд. Начните экономить время уже сегодня.'
                : 'Тіркелу тегін және 30 секунд алады. Бүгіннен бастап уақытты үнемдеңіз.'}
            </p>
            <Link href="/register">
              <Button size="lg" className="bg-neutral-900 text-white hover:bg-neutral-800 rounded-full h-14 px-10 text-lg">
                {language === 'ru' ? 'Создать аккаунт' : 'Аккаунт жасау'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-neutral-200">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-neutral-900 rounded-lg flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold">{t.landing.title}</span>
            </div>
            <div className="flex gap-8 text-sm text-neutral-500">
              <Link href="/explore" className="hover:text-neutral-900 transition-colors">{t.nav.explore}</Link>
              <Link href="/communities" className="hover:text-neutral-900 transition-colors">{t.nav.communities}</Link>
              <Link href="/help" className="hover:text-neutral-900 transition-colors">{t.nav.help}</Link>
            </div>
            <div className="text-sm text-neutral-400">
              © {new Date().getFullYear()} {t.landing.title}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
