'use client'

import { useEffect } from 'react'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { BookOpen, Sparkles } from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { language } = useLanguage()
  const { setTheme, theme } = useTheme()

  // Force light theme on auth pages
  useEffect(() => {
    const previousTheme = theme
    setTheme('light')
    return () => {
      if (previousTheme && previousTheme !== 'light') {
        setTheme(previousTheme)
      }
    }
  }, [])

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left side - decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-emerald-600 relative overflow-hidden">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.06]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255, 255, 255, 0.3) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 255, 255, 0.3) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/" className="flex items-center gap-3 mb-12">
              <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Методическая копилка</span>
            </Link>

            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
              {language === 'ru' ? (
                <>
                  Присоединяйтесь к
                  <br />
                  <span className="text-emerald-200">сообществу педагогов</span>
                </>
              ) : (
                <>
                  Педагогтар
                  <br />
                  <span className="text-emerald-200">қауымдастығына қосылыңыз</span>
                </>
              )}
            </h1>

            <p className="text-emerald-100 text-lg mb-12 max-w-md">
              {language === 'ru'
                ? 'Делитесь материалами, находите готовые уроки, экономьте время на подготовку'
                : 'Материалдармен бөлісіңіз, дайын сабақтарды табыңыз, дайындыққа уақыт үнемдеңіз'}
            </p>

            {/* Stats */}
            <div className="flex gap-12">
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
                  <div className="text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-emerald-200">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Floating badge */}
        <motion.div
          className="absolute bottom-12 left-12 xl:left-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-white text-sm border border-white/15">
            <Sparkles className="h-4 w-4" />
            {language === 'ru' ? 'Бесплатная регистрация' : 'Тегін тіркелу'}
          </div>
        </motion.div>
      </div>

      {/* Right side - form */}
      <div className="flex-1 flex flex-col">
        {/* Mobile header */}
        <header className="lg:hidden border-b border-gray-100 bg-white">
          <div className="px-6 py-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg text-gray-900">Методическая копилка</span>
            </Link>
          </div>
        </header>

        {/* Form container */}
        <main className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-gray-50/50">
          <motion.div
            className="w-full max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {children}
          </motion.div>
        </main>

        {/* Footer */}
        <footer className="py-6 px-6 text-center text-sm text-gray-400 bg-white border-t border-gray-100">
          &copy; {new Date().getFullYear()} Методическая копилка. {language === 'ru' ? 'Все права защищены.' : 'Барлық құқықтар қорғалған.'}
        </footer>
      </div>
    </div>
  )
}
