'use client'

import { useRef, useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import {
  BookOpen,
  Users,
  ArrowRight,
  Heart,
  Download,
  Star,
  FileText,
  Video,
  Presentation,
  Bot,
  Clock,
  Award,
  TrendingUp,
  Quote,
  Zap,
  Globe,
  Shield,
  Play,
  ChevronDown,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import LanguageSwitcher from '@/components/shared/LanguageSwitcher'
import HeroScene from '@/components/shared/HeroScene'
import { useLanguage } from '@/hooks/useLanguage'

// Animated counter component
function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (isInView) {
      const duration = 2000
      const steps = 60
      const increment = value / steps
      let current = 0
      const timer = setInterval(() => {
        current += increment
        if (current >= value) {
          setCount(value)
          clearInterval(timer)
        } else {
          setCount(Math.floor(current))
        }
      }, duration / steps)
      return () => clearInterval(timer)
    }
  }, [isInView, value])

  return (
    <span ref={ref}>
      {count.toLocaleString()}{suffix}
    </span>
  )
}

// Stagger animation variants
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
}

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }
  },
}

export default function LandingPage() {
  const { t, language } = useLanguage()
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.25], [1, 0])

  const testimonials = language === 'ru' ? [
    {
      name: 'Айжан Калиева',
      role: 'Учитель математики',
      avatar: 'АК',
      text: 'Раньше тратила выходные на подготовку. Теперь нахожу материалы за 5 минут!',
      rating: 5,
    },
    {
      name: 'Болат Сериков',
      role: 'Учитель физики',
      avatar: 'БС',
      text: 'Мои материалы скачали 2000+ раз. Приятно помогать коллегам по всей стране.',
      rating: 5,
    },
    {
      name: 'Гульнара Ахметова',
      role: 'Начальные классы',
      avatar: 'ГА',
      text: 'Это как Pinterest для учителей! Уже привела сюда весь наш педсовет.',
      rating: 5,
    },
  ] : [
    {
      name: 'Айжан Қалиева',
      role: 'Математика мұғалімі',
      avatar: 'АҚ',
      text: 'Бұрын демалыс күндерді дайындалуға жұмсайтынмын. Енді материалдарды 5 минутта табамын!',
      rating: 5,
    },
    {
      name: 'Болат Серіков',
      role: 'Физика мұғалімі',
      avatar: 'БС',
      text: 'Менің материалдарымды 2000+ рет жүктеп алды. Әріптестерге көмектесу қуанышты.',
      rating: 5,
    },
    {
      name: 'Гүлнара Ахметова',
      role: 'Бастауыш сынып',
      avatar: 'ГА',
      text: 'Бұл мұғалімдерге арналған Pinterest сияқты! Барлық әріптестерімді әкелдім.',
      rating: 5,
    },
  ]

  const materials = [
    {
      type: language === 'ru' ? 'Презентация' : 'Презентация',
      title: language === 'ru' ? 'Алгебра 7 класс' : 'Алгебра 7 сынып',
      author: 'Айгуль Н.',
      downloads: 1240,
      icon: Presentation,
    },
    {
      type: language === 'ru' ? 'Видеоурок' : 'Бейнесабақ',
      title: language === 'ru' ? 'Опыты по физике' : 'Физика тәжірибелері',
      author: 'Серик М.',
      downloads: 890,
      icon: Video,
    },
    {
      type: language === 'ru' ? 'Документ' : 'Құжат',
      title: language === 'ru' ? 'КТП История' : 'КТЖ Тарих',
      author: 'Дана К.',
      downloads: 2100,
      icon: FileText,
    },
  ]

  const features = [
    {
      icon: Clock,
      title: language === 'ru' ? 'Экономия времени' : 'Уақыт үнемдеу',
      desc: language === 'ru' ? 'Готовые материалы вместо часов подготовки' : 'Дайындық орнына дайын материалдар',
    },
    {
      icon: TrendingUp,
      title: language === 'ru' ? 'Развитие' : 'Даму',
      desc: language === 'ru' ? 'Учитесь у лучших преподавателей' : 'Үздік оқытушылардан үйреніңіз',
    },
    {
      icon: Heart,
      title: language === 'ru' ? 'Сообщество' : 'Қауымдастық',
      desc: language === 'ru' ? 'Делитесь и помогайте коллегам' : 'Бөлісіңіз және әріптестерге көмектесіңіз',
    },
    {
      icon: Award,
      title: language === 'ru' ? 'Признание' : 'Мойындау',
      desc: language === 'ru' ? 'Рейтинги и благодарности' : 'Рейтингтер мен алғыстар',
    },
  ]

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div
              className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <BookOpen className="h-5 w-5 text-white" />
            </motion.div>
            <span className="font-bold text-lg text-foreground">
              {t.landing.title}
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link href="/login">
              <Button variant="ghost" size="sm" className="rounded-lg font-medium text-muted-foreground hover:text-foreground">
                {t.nav.login}
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium">
                {t.nav.register}
              </Button>
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center pt-16 pb-20 px-6">
        <motion.div className="max-w-6xl mx-auto w-full" style={{ opacity }}>
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left side - Text content */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
            >
              {/* Badge */}
              <motion.div variants={fadeInUp}>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-full text-sm font-medium text-emerald-700 dark:text-emerald-400 mb-8">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  {language === 'ru' ? '10 000+ учителей уже с нами' : '10 000+ мұғалім бізбен бірге'}
                </div>
              </motion.div>

              {/* Headline */}
              <motion.h1
                variants={fadeInUp}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] mb-6 tracking-tight"
              >
                {language === 'ru' ? (
                  <>
                    Платформа, где учителя{' '}
                    <span className="text-emerald-600 dark:text-emerald-400">вдохновляют</span> друг друга
                  </>
                ) : (
                  <>
                    Мұғалімдер бір-бірін{' '}
                    <span className="text-emerald-600 dark:text-emerald-400">шабыттандыратын</span> платформа
                  </>
                )}
              </motion.h1>

              {/* Subheadline */}
              <motion.p
                variants={fadeInUp}
                className="text-lg text-muted-foreground mb-10 max-w-lg leading-relaxed"
              >
                {language === 'ru'
                  ? 'Делитесь материалами, находите готовые уроки, экономьте время. Всё бесплатно.'
                  : 'Материалдармен бөлісіңіз, дайын сабақтарды табыңыз, уақыт үнемдеңіз. Барлығы тегін.'}
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                variants={fadeInUp}
                className="flex flex-wrap gap-4"
              >
                <Link href="/register">
                  <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                    <Button size="lg" className="h-14 px-8 text-base rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm">
                      {language === 'ru' ? 'Начать бесплатно' : 'Тегін бастау'}
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </motion.div>
                </Link>
                <Link href="/feed">
                  <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                    <Button size="lg" variant="outline" className="h-14 px-8 text-base rounded-xl font-medium border-border hover:bg-muted">
                      <Play className="h-5 w-5 mr-2" />
                      {language === 'ru' ? 'Смотреть материалы' : 'Материалдарды қарау'}
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>
            </motion.div>

            {/* Right side - 3D Scene */}
            <motion.div
              className="relative h-[400px] lg:h-[500px]"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <HeroScene />
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        </motion.div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-border bg-card">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-3 gap-8">
            {[
              { value: 10000, suffix: '+', label: language === 'ru' ? 'Учителей' : 'Мұғалім' },
              { value: 50000, suffix: '+', label: language === 'ru' ? 'Материалов' : 'Материал' },
              { value: 1000000, suffix: '+', label: language === 'ru' ? 'Скачиваний' : 'Жүктеу' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="text-3xl sm:text-4xl font-bold text-foreground mb-1">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-muted-foreground text-sm font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/30 mb-6">
              <Zap className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              {language === 'ru' ? 'Почему выбирают нас' : 'Неге бізді таңдайды'}
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {language === 'ru'
                ? 'Платформа, созданная учителями для учителей'
                : 'Мұғалімдер мұғалімдер үшін жасаған платформа'}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <div className="surface rounded-2xl p-7 h-full card-lift">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center mb-5">
                    <feature.icon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="font-semibold text-lg text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Materials Section */}
      <section className="py-24 px-6 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div>
              <span className="inline-block text-emerald-600 dark:text-emerald-400 font-semibold text-sm tracking-wider uppercase mb-3">
                {language === 'ru' ? 'Популярное' : 'Танымал'}
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
                {language === 'ru' ? 'Топ материалов' : 'Үздік материалдар'}
              </h2>
              <p className="text-muted-foreground text-base max-w-xl">
                {language === 'ru' ? 'Самые популярные материалы этой недели' : 'Осы аптаның ең танымал материалдары'}
              </p>
            </div>
            <Link href="/feed">
              <motion.div whileHover={{ x: 4 }}>
                <Button variant="outline" className="rounded-xl h-11 px-6 font-medium border-border hover:bg-card">
                  {language === 'ru' ? 'Все материалы' : 'Барлық материалдар'}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </motion.div>
            </Link>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {materials.map((material, i) => {
              const Icon = material.icon
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="surface rounded-2xl overflow-hidden card-lift">
                    <div className="h-44 bg-muted flex items-center justify-center">
                      <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center shadow-sm">
                        <Icon className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-600 text-white">
                          {material.type}
                        </span>
                      </div>
                      <h3 className="font-semibold text-lg text-foreground mb-4">
                        {material.title}
                      </h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarFallback className="bg-emerald-600 text-white text-xs font-semibold">
                              {material.author[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-muted-foreground text-sm">{material.author}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                          <Download className="h-4 w-4" />
                          <span>{material.downloads.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/30 mb-6">
              <Quote className="h-7 w-7 text-amber-600 dark:text-amber-400" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              {language === 'ru' ? 'Что говорят учителя' : 'Мұғалімдер не айтады'}
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {language === 'ru' ? 'Истории успеха наших пользователей' : 'Біздің пайдаланушылардың табыс тарихтары'}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="surface rounded-2xl p-7 h-full card-lift">
                  <div className="flex items-center gap-1 mb-5">
                    {[...Array(item.rating)].map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-foreground text-base mb-6 leading-relaxed">"{item.text}"</p>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-emerald-600 text-white font-semibold text-sm">
                        {item.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-foreground text-sm">{item.name}</div>
                      <div className="text-sm text-muted-foreground">{item.role}</div>
                    </div>
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
          <motion.div
            className="relative rounded-3xl overflow-hidden bg-stone-900 dark:bg-stone-950"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="relative z-10 p-8 md:p-14 flex flex-col lg:flex-row items-center gap-12">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-full text-sm font-medium mb-8 border border-emerald-500/20">
                  <Bot className="h-4 w-4" />
                  {language === 'ru' ? 'Искусственный интеллект' : 'Жасанды интеллект'}
                </div>

                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-5 leading-tight">
                  {language === 'ru' ? 'ИИ-ассистент для' : 'Мұғалімге арналған'}
                  <br />
                  <span className="text-emerald-400">
                    {language === 'ru' ? 'каждого учителя' : 'AI-көмекші'}
                  </span>
                </h2>

                <p className="text-stone-400 text-base mb-8 leading-relaxed max-w-xl">
                  {language === 'ru'
                    ? 'Умный помощник поможет составить план урока, придумать задания и ответит на любые вопросы по методике'
                    : 'Ақылды көмекші сабақ жоспарын құруға, тапсырмалар ойлап табуға және әдістемелік сұрақтарға жауап беруге көмектеседі'}
                </p>

                <div className="space-y-3 mb-8">
                  {[
                    { text: language === 'ru' ? 'Генерация идей для уроков за секунды' : 'Сабаққа идеяларды секундтарда генерациялау', icon: Zap },
                    { text: language === 'ru' ? 'Помощь с планами и КТП' : 'Жоспарлар мен КТЖ көмек', icon: FileText },
                    { text: language === 'ru' ? 'Ответы на методические вопросы' : 'Әдістемелік сұрақтарға жауаптар', icon: Globe },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      className="flex items-center gap-3 text-stone-300"
                      initial={{ opacity: 0, x: -16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08 }}
                    >
                      <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                        <item.icon className="h-4 w-4 text-emerald-400" />
                      </div>
                      <span className="text-sm">{item.text}</span>
                    </motion.div>
                  ))}
                </div>

                <Link href="/ai-assistant">
                  <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                    <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white h-12 px-7 rounded-xl font-medium shadow-sm">
                      {language === 'ru' ? 'Попробовать бесплатно' : 'Тегін қолданып көру'}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </motion.div>
                </Link>
              </div>

              {/* AI Chat Preview */}
              <motion.div
                className="flex-1 max-w-md w-full"
                initial={{ opacity: 0, x: 32 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 }}
              >
                <div className="bg-stone-800/60 rounded-2xl p-6 border border-stone-700/40">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="text-white font-medium text-sm">
                        {language === 'ru' ? 'ИИ-ассистент' : 'AI-көмекші'}
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-400 text-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        {language === 'ru' ? 'Онлайн' : 'Желіде'}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-5">
                    <motion.div
                      className="bg-stone-700/40 rounded-xl rounded-tl-sm p-3.5 text-stone-200 text-sm max-w-[85%]"
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 }}
                    >
                      {language === 'ru'
                        ? 'Привет! Я помогу с планированием уроков. Расскажите, какой урок хотите подготовить?'
                        : 'Сәлем! Сабақтарды жоспарлауға көмектесемін. Қандай сабақ дайындағыңыз келеді?'}
                    </motion.div>

                    <motion.div
                      className="bg-emerald-600/20 rounded-xl rounded-tr-sm p-3.5 text-emerald-100 text-sm max-w-[85%] ml-auto"
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.45 }}
                    >
                      {language === 'ru' ? 'Математика, 5 класс, дроби' : 'Математика, 5 сынып, бөлшектер'}
                    </motion.div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {[
                      language === 'ru' ? 'План урока' : 'Сабақ жоспары',
                      language === 'ru' ? 'Задания' : 'Тапсырмалар',
                      language === 'ru' ? 'Идеи' : 'Идеялар',
                    ].map((tag, i) => (
                      <motion.div
                        key={i}
                        className="px-3 py-1.5 bg-stone-700/40 rounded-lg text-stone-300 text-xs border border-stone-600/30 cursor-pointer hover:bg-stone-600/40 transition-colors"
                        whileHover={{ scale: 1.03 }}
                      >
                        {tag}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-emerald-600">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/15 mb-8">
              <Heart className="h-8 w-8 text-white" />
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              {language === 'ru' ? 'Присоединяйтесь к' : 'Жаңа буындағы'}
              <br />
              {language === 'ru' ? 'сообществу педагогов' : 'педагогтарға қосылыңыз'}
            </h2>

            <p className="text-white/80 text-lg mb-10 max-w-2xl mx-auto">
              {language === 'ru'
                ? 'Регистрация бесплатна и займёт всего 30 секунд. Начните экономить время уже сегодня!'
                : 'Тіркелу тегін және тек 30 секунд алады. Бүгіннен бастап уақытты үнемдеңіз!'}
            </p>

            <Link href="/register">
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                <Button size="lg" className="bg-white text-emerald-700 hover:bg-white/90 h-14 px-10 text-base font-bold rounded-xl shadow-sm">
                  {language === 'ru' ? 'Создать аккаунт бесплатно' : 'Тегін аккаунт жасау'}
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </motion.div>
            </Link>

            <motion.div
              className="mt-10 flex items-center justify-center gap-6 text-white/90 text-sm"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              {[
                { icon: Shield, text: language === 'ru' ? 'Безопасно' : 'Қауіпсіз' },
                { icon: Zap, text: language === 'ru' ? 'Быстро' : 'Жылдам' },
                { icon: Heart, text: language === 'ru' ? 'Бесплатно' : 'Тегін' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <item.icon className="h-4 w-4" />
                  <span className="font-medium">{item.text}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-14 px-6 bg-stone-950">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 pb-8 border-b border-stone-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg text-white">{t.landing.title}</span>
            </div>

            <div className="flex gap-6">
              {[
                { href: '/explore', label: t.nav.explore },
                { href: '/communities', label: t.nav.communities },
                { href: '/help', label: t.nav.help },
              ].map((link, i) => (
                <Link key={i} href={link.href}>
                  <span className="text-stone-400 hover:text-white transition-colors cursor-pointer text-sm">
                    {link.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div className="pt-8 text-center text-stone-500 text-sm">
            &copy; {new Date().getFullYear()} {t.landing.title}. {language === 'ru' ? 'Все права защищены.' : 'Барлық құқықтар қорғалған.'}
          </div>
        </div>
      </footer>
    </div>
  )
}
