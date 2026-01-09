'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { BookOpen, ArrowRight } from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { language } = useLanguage()

  return (
    <div className="min-h-screen flex">
      {/* Left side - decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-neutral-950 relative overflow-hidden">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255, 255, 255, 0.5) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 255, 255, 0.5) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        {/* Subtle glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-3xl" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link href="/" className="flex items-center gap-3 mb-16">
              <motion.div
                className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
              >
                <BookOpen className="h-6 w-6 text-neutral-900" />
              </motion.div>
              <span className="text-2xl font-semibold text-white">Методическая копилка</span>
            </Link>

            <h1 className="text-5xl xl:text-6xl font-semibold text-white leading-[1.1] mb-8 tracking-tight">
              {language === 'ru' ? (
                <>
                  Присоединяйтесь к
                  <br />
                  <span className="text-neutral-400">сообществу педагогов</span>
                </>
              ) : (
                <>
                  Педагогтар
                  <br />
                  <span className="text-neutral-400">қауымдастығына қосылыңыз</span>
                </>
              )}
            </h1>

            <p className="text-neutral-400 text-lg mb-16 max-w-md leading-relaxed">
              {language === 'ru'
                ? 'Делитесь материалами, находите готовые уроки, экономьте время на подготовку'
                : 'Материалдармен бөлісіңіз, дайын сабақтарды табыңыз, дайындыққа уақыт үнемдеңіз'}
            </p>

            {/* Stats */}
            <div className="flex gap-16">
              {[
                { value: '10K+', label: language === 'ru' ? 'Учителей' : 'Мұғалім' },
                { value: '50K+', label: language === 'ru' ? 'Материалов' : 'Материал' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                >
                  <div className="text-4xl font-semibold text-white tracking-tight">{stat.value}</div>
                  <div className="text-neutral-500 mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom badge */}
        <motion.div
          className="absolute bottom-12 left-12 xl:left-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-3 px-5 py-3 bg-white/5 backdrop-blur-sm rounded-full text-white text-sm border border-white/10">
            <span className="text-neutral-400">{language === 'ru' ? 'Бесплатная регистрация' : 'Тегін тіркелу'}</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        </motion.div>
      </div>

      {/* Right side - form */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Mobile header */}
        <header className="lg:hidden border-b border-neutral-100">
          <div className="px-6 py-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-neutral-900 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold text-lg text-neutral-900">Методическая копилка</span>
            </Link>
          </div>
        </header>

        {/* Form container */}
        <main className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <motion.div
            className="w-full max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {children}
          </motion.div>
        </main>

        {/* Footer */}
        <footer className="py-6 px-6 text-center text-sm text-neutral-400 border-t border-neutral-100">
          &copy; {new Date().getFullYear()} Методическая копилка. {language === 'ru' ? 'Все права защищены.' : 'Барлық құқықтар қорғалған.'}
        </footer>
      </div>
    </div>
  )
}
