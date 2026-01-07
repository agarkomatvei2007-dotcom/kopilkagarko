'use client'

import { useRef, useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform, useInView, useSpring, AnimatePresence } from 'framer-motion'
import {
  BookOpen,
  Users,
  ArrowRight,
  Heart,
  Download,
  Star,
  Sparkles,
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
  MousePointer,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import LanguageSwitcher from '@/components/shared/LanguageSwitcher'
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

// Floating orbs background - enhanced with new design
function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Primary orb - cyan/teal */}
      <motion.div
        className="absolute w-[700px] h-[700px] rounded-full bg-gradient-to-r from-primary/30 to-accent/30 blur-[100px]"
        style={{ top: '-15%', left: '-10%' }}
        animate={{
          x: [0, 80, 0],
          y: [0, 50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Secondary orb - accent */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-r from-accent/25 to-primary/25 blur-[80px]"
        style={{ top: '30%', right: '-10%' }}
        animate={{
          x: [0, -60, 0],
          y: [0, 70, 0],
          scale: [1, 0.8, 1],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
      {/* Tertiary orb - purple/pink neon */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-r from-[hsl(280,100%,65%)]/20 to-[hsl(320,100%,65%)]/20 blur-[80px]"
        style={{ bottom: '5%', left: '15%' }}
        animate={{
          x: [0, 100, 0],
          y: [0, -60, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
      />
      {/* Extra small orbs for depth */}
      <motion.div
        className="absolute w-[200px] h-[200px] rounded-full bg-primary/40 blur-[60px]"
        style={{ top: '60%', right: '20%' }}
        animate={{
          x: [0, 40, 0],
          y: [0, -30, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}

// Animated grid background
function GridBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.03]">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(16, 185, 129, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16, 185, 129, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  )
}

// Stagger container variants
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
}

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }
  },
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }
  },
}

export default function LandingPage() {
  const { t, language } = useLanguage()
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%'])
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95])

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
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      type: language === 'ru' ? 'Видеоурок' : 'Бейнесабақ',
      title: language === 'ru' ? 'Опыты по физике' : 'Физика тәжірибелері',
      author: 'Серик М.',
      downloads: 890,
      icon: Video,
      gradient: 'from-orange-500 to-amber-600',
    },
    {
      type: language === 'ru' ? 'Документ' : 'Құжат',
      title: language === 'ru' ? 'КТП История' : 'КТЖ Тарих',
      author: 'Дана К.',
      downloads: 2100,
      icon: FileText,
      gradient: 'from-blue-500 to-indigo-600',
    },
  ]

  const features = [
    {
      icon: Clock,
      title: language === 'ru' ? 'Экономия времени' : 'Уақыт үнемдеу',
      desc: language === 'ru' ? 'Готовые материалы вместо часов подготовки' : 'Дайындық орнына дайын материалдар',
      color: 'emerald',
    },
    {
      icon: TrendingUp,
      title: language === 'ru' ? 'Развитие' : 'Даму',
      desc: language === 'ru' ? 'Учитесь у лучших преподавателей' : 'Үздік оқытушылардан үйреніңіз',
      color: 'orange',
    },
    {
      icon: Heart,
      title: language === 'ru' ? 'Сообщество' : 'Қауымдастық',
      desc: language === 'ru' ? 'Делитесь и помогайте коллегам' : 'Бөлісіңіз және әріптестерге көмектесіңіз',
      color: 'pink',
    },
    {
      icon: Award,
      title: language === 'ru' ? 'Признание' : 'Мойындау',
      desc: language === 'ru' ? 'Рейтинги и благодарности' : 'Рейтингтер мен алғыстар',
      color: 'blue',
    },
  ]

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="mx-4 mt-4">
          <div className="max-w-6xl mx-auto glass-strong rounded-2xl border border-white/20 dark:border-white/10 shadow-2xl">
            <div className="px-6 h-16 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3 group">
                <motion.div
                  className="w-11 h-11 rounded-2xl gradient-primary flex items-center justify-center shadow-xl glow animate-pulse-glow"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <BookOpen className="h-5 w-5 text-white" />
                </motion.div>
                <span className="font-bold text-xl gradient-text">
                  {t.landing.title}
                </span>
              </Link>
              <div className="flex items-center gap-3">
                <LanguageSwitcher />
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="rounded-xl glass-subtle hover:glass hover:glow-accent transition-all font-medium">
                    {t.nav.login}
                  </Button>
                </Link>
                <Link href="/register">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button size="sm" className="btn-cyber rounded-2xl font-semibold">
                      {t.nav.register}
                    </Button>
                  </motion.div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center pt-24 pb-20 px-6">
        <FloatingOrbs />
        <GridBackground />

        <motion.div
          className="max-w-6xl mx-auto relative z-10"
          style={{ y, opacity, scale }}
        >
          <motion.div
            className="text-center max-w-4xl mx-auto"
            variants={staggerContainer}
            initial="hidden"
            animate="show"
          >
            {/* Badge */}
            <motion.div variants={fadeInUp}>
              <motion.div
                className="inline-flex items-center gap-2 px-6 py-3 glass-strong border border-primary/30 rounded-full text-sm font-semibold mb-8 shadow-xl glow-accent"
                whileHover={{ scale: 1.05 }}
              >
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-primary"
                >
                  <Sparkles className="h-5 w-5" />
                </motion.div>
                <span className="gradient-text">{language === 'ru' ? '10 000+ учителей уже с нами' : '10 000+ мұғалім бізбен бірге'}</span>
              </motion.div>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeInUp}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground leading-[1.1] mb-8 tracking-tight"
            >
              {language === 'ru' ? (
                <>
                  Платформа, где учителя
                  <br />
                  <span className="gradient-text text-glow">вдохновляют друг друга</span>
                </>
              ) : (
                <>
                  Мұғалімдер бір-бірін
                  <br />
                  <span className="gradient-text text-glow">шабыттандыратын платформа</span>
                </>
              )}
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={fadeInUp}
              className="text-xl sm:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed"
            >
              {language === 'ru'
                ? 'Делитесь материалами, находите готовые уроки, экономьте время. Всё бесплатно.'
                : 'Материалдармен бөлісіңіз, дайын сабақтарды табыңыз, уақыт үнемдеңіз. Барлығы тегін.'}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-wrap justify-center gap-4 mb-16"
            >
              <Link href="/register">
                <motion.div
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button size="lg" className="btn-cyber h-16 px-10 text-lg rounded-2xl font-bold">
                    {language === 'ru' ? 'Начать бесплатно' : 'Тегін бастау'}
                    <motion.div
                      animate={{ x: [0, 6, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </motion.div>
                  </Button>
                </motion.div>
              </Link>
              <Link href="/feed">
                <motion.div
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button size="lg" variant="outline" className="h-16 px-10 text-lg glass-strong border-white/30 hover:border-primary/50 hover:glow rounded-2xl font-medium">
                    <Play className="h-5 w-5 mr-2" />
                    {language === 'ru' ? 'Смотреть материалы' : 'Материалдарды қарау'}
                  </Button>
                </motion.div>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={fadeInUp}
              className="grid grid-cols-3 gap-6 max-w-2xl mx-auto"
            >
              {[
                { value: 10000, suffix: '+', label: language === 'ru' ? 'Учителей' : 'Мұғалім' },
                { value: 50000, suffix: '+', label: language === 'ru' ? 'Материалов' : 'Материал' },
                { value: 1000000, suffix: '+', label: language === 'ru' ? 'Скачиваний' : 'Жүктеу' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  className="text-center glass rounded-2xl p-4 border border-white/20 card-lift"
                  whileHover={{ scale: 1.08 }}
                >
                  <div className="text-3xl sm:text-4xl font-bold gradient-text mb-1">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-muted-foreground text-sm sm:text-base font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <MousePointer className="h-5 w-5" />
            <ChevronDown className="h-5 w-5" />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh opacity-20" />
        <div className="absolute top-20 -right-32 w-96 h-96 rounded-full bg-primary/20 blur-3xl animate-float" />
        <div className="absolute bottom-20 -left-32 w-96 h-96 rounded-full bg-accent/20 blur-3xl animate-float" style={{ animationDelay: '-5s' }} />

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-3xl gradient-primary mb-8 shadow-2xl glow animate-pulse-glow"
            >
              <Zap className="h-10 w-10 text-white" />
            </motion.div>
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
              {language === 'ru' ? 'Почему выбирают нас' : 'Неге бізді таңдайды'}
            </h2>
            <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
              {language === 'ru'
                ? 'Платформа, созданная учителями для учителей'
                : 'Мұғалімдер мұғалімдер үшін жасаған платформа'}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <motion.div
                  className="glass-strong rounded-3xl p-8 border border-white/20 dark:border-white/10 h-full group cursor-pointer card-lift relative overflow-hidden"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="absolute inset-0 gradient-primary opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
                  <motion.div
                    className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mb-6 shadow-xl glow group-hover:scale-110 transition-transform relative z-10"
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                  >
                    <feature.icon className="h-8 w-8 text-white" />
                  </motion.div>
                  <h3 className="font-bold text-xl text-foreground mb-3 relative z-10">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed relative z-10">{feature.desc}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Materials Section */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh opacity-10" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-accent/10 to-transparent pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div>
              <motion.span
                className="inline-block gradient-text font-bold text-sm tracking-wider mb-4"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                {language === 'ru' ? 'ПОПУЛЯРНОЕ' : 'ТАНЫМАЛ'}
              </motion.span>
              <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
                {language === 'ru' ? 'Топ материалов' : 'Үздік материалдар'}
              </h2>
              <p className="text-muted-foreground text-lg max-w-xl">
                {language === 'ru' ? 'Самые популярные материалы этой недели' : 'Осы аптаның ең танымал материалдары'}
              </p>
            </div>
            <Link href="/feed">
              <motion.div
                whileHover={{ scale: 1.05, x: 5 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button variant="outline" className="glass border-white/30 hover:border-primary/50 hover:glow rounded-2xl h-12 px-6 font-medium">
                  {language === 'ru' ? 'Все материалы' : 'Барлық материалдар'}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </motion.div>
            </Link>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {materials.map((material, i) => {
              const Icon = material.icon
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.5 }}
                >
                  <motion.div
                    className="glass-strong rounded-3xl overflow-hidden border border-white/20 dark:border-white/10 cursor-pointer group card-lift"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="h-48 gradient-mesh flex items-center justify-center relative overflow-hidden">
                      <motion.div
                        className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"
                      />
                      <motion.div
                        className="relative z-10"
                        whileHover={{ scale: 1.2, rotate: 10 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="p-5 rounded-3xl glass-strong shadow-2xl glow">
                          <Icon className="h-16 w-16 text-primary" />
                        </div>
                      </motion.div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-bold px-3 py-1.5 rounded-full gradient-primary text-white shadow-lg">
                          {material.type}
                        </span>
                      </div>
                      <h3 className="font-bold text-xl text-foreground mb-4 group-hover:gradient-text transition-colors">
                        {material.title}
                      </h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                            <AvatarFallback className="gradient-primary text-white text-xs font-bold">
                              {material.author[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-muted-foreground text-sm font-medium">{material.author}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                          <Download className="h-4 w-4" />
                          <span className="font-medium">{material.downloads.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh opacity-20" />
        <div className="absolute top-20 left-10 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '-8s' }} />

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-3xl gradient-cyber mb-8 shadow-2xl glow animate-pulse-glow"
            >
              <Quote className="h-10 w-10 text-white" />
            </motion.div>
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
              {language === 'ru' ? 'Что говорят учителя' : 'Мұғалімдер не айтады'}
            </h2>
            <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
              {language === 'ru' ? 'Истории успеха наших пользователей' : 'Біздің пайдаланушылардың табыс тарихтары'}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
              >
                <motion.div
                  className="glass-strong rounded-3xl p-8 border border-white/20 dark:border-white/10 h-full relative card-lift"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center gap-1 mb-6">
                    {[...Array(item.rating)].map((_, j) => (
                      <motion.div
                        key={j}
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + j * 0.1 }}
                      >
                        <Star className="h-5 w-5 fill-amber-400 text-amber-400 drop-shadow-lg" />
                      </motion.div>
                    ))}
                  </div>
                  <p className="text-foreground text-lg mb-8 leading-relaxed">"{item.text}"</p>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 ring-2 ring-primary/30 shadow-lg glow-accent">
                      <AvatarFallback className="gradient-primary text-white font-bold">
                        {item.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-bold text-foreground">{item.name}</div>
                      <div className="text-sm gradient-text font-medium">{item.role}</div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Section */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="relative rounded-[2.5rem] overflow-hidden"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-600/20 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-orange-600/10 via-transparent to-transparent" />

            {/* Grid pattern */}
            <div className="absolute inset-0 opacity-10">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
                  `,
                  backgroundSize: '40px 40px',
                }}
              />
            </div>

            <div className="relative z-10 p-8 md:p-16 flex flex-col lg:flex-row items-center gap-12">
              <div className="flex-1">
                <motion.div
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-medium mb-8 border border-emerald-500/30"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Bot className="h-4 w-4" />
                  </motion.div>
                  {language === 'ru' ? 'Искусственный интеллект' : 'Жасанды интеллект'}
                </motion.div>

                <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight">
                  {language === 'ru' ? 'ИИ-ассистент для' : 'Мұғалімге арналған'}
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                    {language === 'ru' ? 'каждого учителя' : 'AI-көмекші'}
                  </span>
                </h2>

                <p className="text-gray-400 text-lg mb-10 leading-relaxed max-w-xl">
                  {language === 'ru'
                    ? 'Умный помощник поможет составить план урока, придумать задания и ответит на любые вопросы по методике'
                    : 'Ақылды көмекші сабақ жоспарын құруға, тапсырмалар ойлап табуға және әдістемелік сұрақтарға жауап беруге көмектеседі'}
                </p>

                <div className="space-y-4 mb-10">
                  {[
                    { text: language === 'ru' ? 'Генерация идей для уроков за секунды' : 'Сабаққа идеяларды секундтарда генерациялау', icon: Zap },
                    { text: language === 'ru' ? 'Помощь с планами и КТП' : 'Жоспарлар мен КТЖ көмек', icon: FileText },
                    { text: language === 'ru' ? 'Ответы на методические вопросы' : 'Әдістемелік сұрақтарға жауаптар', icon: Globe },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      className="flex items-center gap-4 text-gray-300"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                        <item.icon className="h-5 w-5 text-emerald-400" />
                      </div>
                      {item.text}
                    </motion.div>
                  ))}
                </div>

                <Link href="/ai-assistant">
                  <motion.div
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white h-14 px-8 text-lg shadow-xl shadow-emerald-500/25 rounded-xl">
                      {language === 'ru' ? 'Попробовать бесплатно' : 'Тегін қолданып көру'}
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </motion.div>
                </Link>
              </div>

              {/* AI Chat Preview */}
              <motion.div
                className="flex-1 max-w-md w-full"
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <motion.div
                  className="bg-gray-800/50 backdrop-blur-xl rounded-3xl p-6 border border-gray-700/50 shadow-2xl"
                  whileHover={{ y: -5 }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <motion.div
                      className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30"
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 4, repeat: Infinity }}
                    >
                      <Bot className="h-6 w-6 text-white" />
                    </motion.div>
                    <div>
                      <div className="text-white font-semibold">
                        {language === 'ru' ? 'ИИ-ассистент' : 'AI-көмекші'}
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-400 text-sm">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        {language === 'ru' ? 'Онлайн' : 'Желіде'}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <motion.div
                      className="bg-gray-700/30 rounded-2xl rounded-tl-md p-4 text-gray-200 text-sm max-w-[85%]"
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4 }}
                    >
                      {language === 'ru'
                        ? 'Привет! Я помогу с планированием уроков. Расскажите, какой урок хотите подготовить?'
                        : 'Сәлем! Сабақтарды жоспарлауға көмектесемін. Қандай сабақ дайындағыңыз келеді?'}
                    </motion.div>

                    <motion.div
                      className="bg-emerald-500/20 rounded-2xl rounded-tr-md p-4 text-emerald-100 text-sm max-w-[85%] ml-auto"
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.6 }}
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
                        className="px-4 py-2 bg-gray-700/30 rounded-xl text-gray-300 text-sm border border-gray-600/30 cursor-pointer hover:bg-gray-600/30 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {tag}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent" />
        <div className="absolute inset-0 gradient-mesh opacity-30" />

        {/* Animated shapes */}
        <motion.div
          className="absolute top-10 left-10 w-24 h-24 border-2 border-white/30 rounded-3xl glow"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-40 h-40 border-2 border-white/20 rounded-full glow"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-1/2 right-1/4 w-20 h-20 glass rounded-2xl"
          animate={{ y: [0, -30, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-1/3 left-1/4 w-16 h-16 glass rounded-xl"
          animate={{ y: [0, 20, 0], x: [0, 10, 0] }}
          transition={{ duration: 7, repeat: Infinity }}
        />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center justify-center w-24 h-24 rounded-3xl glass-strong mb-10 shadow-2xl animate-pulse-glow"
            >
              <Heart className="h-12 w-12 text-white" />
            </motion.div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight text-glow">
              {language === 'ru' ? 'Присоединяйтесь к' : 'Жаңа буындағы'}
              <br />
              {language === 'ru' ? 'сообществу педагогов' : 'педагогтарға қосылыңыз'}
            </h2>

            <p className="text-white/80 text-xl mb-12 max-w-2xl mx-auto">
              {language === 'ru'
                ? 'Регистрация бесплатна и займёт всего 30 секунд. Начните экономить время уже сегодня!'
                : 'Тіркелу тегін және тек 30 секунд алады. Бүгіннен бастап уақытты үнемдеңіз!'}
            </p>

            <motion.div className="flex flex-wrap justify-center gap-4">
              <Link href="/register">
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button size="lg" className="bg-white text-primary hover:bg-white/90 h-16 px-12 text-lg font-bold shadow-2xl rounded-2xl glow">
                    {language === 'ru' ? 'Создать аккаунт бесплатно' : 'Тегін аккаунт жасау'}
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </motion.div>
              </Link>
            </motion.div>

            <motion.div
              className="mt-12 flex items-center justify-center gap-8 text-white/90 text-sm"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              {[
                { icon: Shield, text: language === 'ru' ? 'Безопасно' : 'Қауіпсіз' },
                { icon: Zap, text: language === 'ru' ? 'Быстро' : 'Жылдам' },
                { icon: Heart, text: language === 'ru' ? 'Бесплатно' : 'Тегін' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 glass-subtle px-4 py-2 rounded-full">
                  <item.icon className="h-4 w-4" />
                  <span className="font-medium">{item.text}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 bg-[hsl(220,30%,8%)] relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh opacity-10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 pb-10 border-b border-white/10">
            <motion.div
              className="flex items-center gap-3"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-11 h-11 rounded-2xl gradient-primary flex items-center justify-center shadow-xl glow">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl text-white">{t.landing.title}</span>
            </motion.div>

            <div className="flex gap-6">
              {[
                { href: '/explore', label: t.nav.explore },
                { href: '/communities', label: t.nav.communities },
                { href: '/help', label: t.nav.help },
              ].map((link, i) => (
                <Link key={i} href={link.href}>
                  <motion.span
                    className="text-gray-400 hover:text-white hover:glow-accent transition-all cursor-pointer px-3 py-1.5 rounded-lg hover:bg-white/5"
                    whileHover={{ y: -2 }}
                  >
                    {link.label}
                  </motion.span>
                </Link>
              ))}
            </div>
          </div>

          <div className="pt-10 text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} {t.landing.title}. {language === 'ru' ? 'Все права защищены.' : 'Барлық құқықтар қорғалған.'}
          </div>
        </div>
      </footer>
    </div>
  )
}
