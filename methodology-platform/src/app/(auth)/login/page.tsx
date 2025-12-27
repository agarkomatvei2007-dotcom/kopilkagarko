'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Loader2, Mail, Lock, ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth, useRequireGuest } from '@/hooks/useAuth'
import { useLanguage } from '@/hooks/useLanguage'
import { useToast } from '@/hooks/use-toast'

export default function LoginPage() {
  useRequireGuest()
  const { signIn, signInWithGoogle, isLoading } = useAuth()
  const { language } = useLanguage()
  const { toast } = useToast()
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const txt = {
    ru: {
      title: 'С возвращением!',
      description: 'Войдите в свой аккаунт',
      email: 'Email',
      emailPlaceholder: 'teacher@college.ru',
      password: 'Пароль',
      forgotPassword: 'Забыли пароль?',
      signIn: 'Войти',
      or: 'или продолжить с',
      signInGoogle: 'Google',
      noAccount: 'Нет аккаунта?',
      register: 'Зарегистрироваться',
      welcome: 'Добро пожаловать!',
      successLogin: 'Вы успешно вошли в систему',
      successGoogle: 'Вы успешно вошли через Google',
      error: 'Ошибка',
      loginError: 'Произошла ошибка при входе',
      googleError: 'Произошла ошибка при входе через Google',
      emailError: 'Введите корректный email',
      passwordError: 'Пароль должен быть не менее 6 символов',
    },
    kk: {
      title: 'Қайта оралуыңызбен!',
      description: 'Аккаунтыңызға кіріңіз',
      email: 'Email',
      emailPlaceholder: 'teacher@college.kz',
      password: 'Құпия сөз',
      forgotPassword: 'Құпия сөзді ұмыттыңыз ба?',
      signIn: 'Кіру',
      or: 'немесе жалғастыру',
      signInGoogle: 'Google',
      noAccount: 'Аккаунтыңыз жоқ па?',
      register: 'Тіркелу',
      welcome: 'Қош келдіңіз!',
      successLogin: 'Сіз жүйеге сәтті кірдіңіз',
      successGoogle: 'Сіз Google арқылы сәтті кірдіңіз',
      error: 'Қате',
      loginError: 'Кіру кезінде қате пайда болды',
      googleError: 'Google арқылы кіру кезінде қате пайда болды',
      emailError: 'Дұрыс email енгізіңіз',
      passwordError: 'Құпия сөз кемінде 6 таңбадан тұруы керек',
    },
  }

  const text = txt[language]

  const loginSchema = z.object({
    email: z.string().email(text.emailError),
    password: z.string().min(6, text.passwordError),
  })

  type LoginForm = z.infer<typeof loginSchema>

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    try {
      await signIn(data.email, data.password)
      toast({
        title: text.welcome,
        description: text.successLogin,
      })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : text.loginError
      toast({
        title: text.error,
        description: errorMessage,
        variant: 'destructive',
      })
    }
  }

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    try {
      await signInWithGoogle()
      toast({
        title: text.welcome,
        description: text.successGoogle,
      })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : text.googleError
      toast({
        title: text.error,
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
      <div className="text-center mb-8">
        <motion.h1
          className="text-3xl font-bold text-gray-900 mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {text.title}
        </motion.h1>
        <motion.p
          className="text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {text.description}
        </motion.p>
      </div>

      <motion.form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-700 font-medium">{text.email}</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="email"
              type="email"
              placeholder={text.emailPlaceholder}
              className="pl-10 h-12 rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
              {...register('email')}
              disabled={isSubmitting || isLoading}
            />
          </div>
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-gray-700 font-medium">{text.password}</Label>
            <Link
              href="/reset-password"
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              {text.forgotPassword}
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="pl-10 h-12 rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
              {...register('password')}
              disabled={isSubmitting || isLoading}
            />
          </div>
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>

        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
          <Button
            type="submit"
            className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium shadow-lg shadow-emerald-500/25"
            disabled={isSubmitting || isLoading}
          >
            {(isSubmitting || isLoading) ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                {text.signIn}
                <ArrowRight className="h-5 w-5 ml-2" />
              </>
            )}
          </Button>
        </motion.div>
      </motion.form>

      <motion.div
        className="mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-4 text-gray-400 font-medium">
              {text.or}
            </span>
          </div>
        </div>

        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="mt-6">
          <Button
            variant="outline"
            className="w-full h-12 rounded-xl border-gray-200 hover:bg-gray-50 font-medium"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || isLoading}
          >
            {isGoogleLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                {text.signInGoogle}
              </>
            )}
          </Button>
        </motion.div>
      </motion.div>

      <motion.p
        className="text-center text-gray-500 mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {text.noAccount}{' '}
        <Link href="/register" className="text-emerald-600 hover:text-emerald-700 font-semibold">
          {text.register}
        </Link>
      </motion.p>
    </div>
  )
}
