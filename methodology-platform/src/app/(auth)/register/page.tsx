'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Loader2, Mail, Lock, User, AtSign, ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth, useRequireGuest } from '@/hooks/useAuth'
import { useLanguage } from '@/hooks/useLanguage'
import { useToast } from '@/hooks/use-toast'

export default function RegisterPage() {
  useRequireGuest()
  const { signUp, signInWithGoogle, isLoading } = useAuth()
  const { language } = useLanguage()
  const { toast } = useToast()
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const txt = {
    ru: {
      title: 'Создать аккаунт',
      description: 'Присоединяйтесь к сообществу педагогов',
      displayName: 'Имя',
      displayNamePlaceholder: 'Иван Петров',
      username: 'Имя пользователя',
      usernamePlaceholder: 'ivan_petrov',
      email: 'Email',
      emailPlaceholder: 'teacher@college.ru',
      password: 'Пароль',
      confirmPassword: 'Подтверждение пароля',
      register: 'Создать аккаунт',
      or: 'или',
      signInGoogle: 'Продолжить с Google',
      haveAccount: 'Уже есть аккаунт?',
      signIn: 'Войти',
      accountCreated: 'Аккаунт создан!',
      checkEmail: 'Проверьте почту для подтверждения email',
      welcome: 'Добро пожаловать!',
      successGoogle: 'Вы успешно вошли через Google',
      error: 'Ошибка',
      registerError: 'Произошла ошибка при регистрации',
      googleError: 'Произошла ошибка при входе через Google',
      displayNameError: 'Имя должно быть не менее 2 символов',
      usernameMinError: 'Имя пользователя должно быть не менее 3 символов',
      usernameMaxError: 'Имя пользователя должно быть не более 20 символов',
      usernameFormatError: 'Только латинские буквы, цифры и _',
      emailError: 'Введите корректный email',
      passwordError: 'Пароль должен быть не менее 6 символов',
      passwordMismatch: 'Пароли не совпадают',
    },
    kk: {
      title: 'Аккаунт жасау',
      description: 'Педагогтар қауымдастығына қосылыңыз',
      displayName: 'Аты-жөні',
      displayNamePlaceholder: 'Иван Петров',
      username: 'Пайдаланушы аты',
      usernamePlaceholder: 'ivan_petrov',
      email: 'Email',
      emailPlaceholder: 'teacher@college.kz',
      password: 'Құпия сөз',
      confirmPassword: 'Құпия сөзді растау',
      register: 'Аккаунт жасау',
      or: 'немесе',
      signInGoogle: 'Google арқылы жалғастыру',
      haveAccount: 'Аккаунтыңыз бар ма?',
      signIn: 'Кіру',
      accountCreated: 'Аккаунт жасалды!',
      checkEmail: 'Email растау үшін поштаңызды тексеріңіз',
      welcome: 'Қош келдіңіз!',
      successGoogle: 'Сіз Google арқылы сәтті кірдіңіз',
      error: 'Қате',
      registerError: 'Тіркелу кезінде қате пайда болды',
      googleError: 'Google арқылы кіру кезінде қате пайда болды',
      displayNameError: 'Аты-жөні кемінде 2 таңбадан тұруы керек',
      usernameMinError: 'Пайдаланушы аты кемінде 3 таңбадан тұруы керек',
      usernameMaxError: 'Пайдаланушы аты 20 таңбадан аспауы керек',
      usernameFormatError: 'Тек латын әріптері, сандар және _',
      emailError: 'Дұрыс email енгізіңіз',
      passwordError: 'Құпия сөз кемінде 6 таңбадан тұруы керек',
      passwordMismatch: 'Құпия сөздер сәйкес келмейді',
    },
  }

  const text = txt[language]

  const registerSchema = z.object({
    displayName: z.string().min(2, text.displayNameError),
    username: z
      .string()
      .min(3, text.usernameMinError)
      .max(20, text.usernameMaxError)
      .regex(/^[a-zA-Z0-9_]+$/, text.usernameFormatError),
    email: z.string().email(text.emailError),
    password: z.string().min(6, text.passwordError),
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: text.passwordMismatch,
    path: ['confirmPassword'],
  })

  type RegisterForm = z.infer<typeof registerSchema>

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterForm) => {
    try {
      await signUp(data.email, data.password, data.username, data.displayName)
      toast({
        title: text.accountCreated,
        description: text.checkEmail,
      })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : text.registerError
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
    <div>
      <div className="text-center mb-8">
        <motion.h1
          className="text-3xl font-semibold text-neutral-900 mb-2 tracking-tight"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {text.title}
        </motion.h1>
        <motion.p
          className="text-neutral-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {text.description}
        </motion.p>
      </div>

      <motion.form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="displayName" className="text-neutral-700 font-medium">{text.displayName}</Label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
              <Input
                id="displayName"
                placeholder={text.displayNamePlaceholder}
                className="pl-11 h-12 rounded-xl border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900/10"
                {...register('displayName')}
                disabled={isSubmitting || isLoading}
              />
            </div>
            {errors.displayName && (
              <p className="text-xs text-red-500">{errors.displayName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="username" className="text-neutral-700 font-medium">{text.username}</Label>
            <div className="relative">
              <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
              <Input
                id="username"
                placeholder={text.usernamePlaceholder}
                className="pl-11 h-12 rounded-xl border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900/10"
                {...register('username')}
                disabled={isSubmitting || isLoading}
              />
            </div>
            {errors.username && (
              <p className="text-xs text-red-500">{errors.username.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-neutral-700 font-medium">{text.email}</Label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
            <Input
              id="email"
              type="email"
              placeholder={text.emailPlaceholder}
              className="pl-11 h-12 rounded-xl border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900/10"
              {...register('email')}
              disabled={isSubmitting || isLoading}
            />
          </div>
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-neutral-700 font-medium">{text.password}</Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="pl-11 h-12 rounded-xl border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900/10"
                {...register('password')}
                disabled={isSubmitting || isLoading}
              />
            </div>
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-neutral-700 font-medium">{text.confirmPassword}</Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                className="pl-11 h-12 rounded-xl border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900/10"
                {...register('confirmPassword')}
                disabled={isSubmitting || isLoading}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
            )}
          </div>
        </div>

        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="pt-2">
          <Button
            type="submit"
            className="w-full h-12 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-medium"
            disabled={isSubmitting || isLoading}
          >
            {(isSubmitting || isLoading) ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                {text.register}
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
            <span className="w-full border-t border-neutral-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-4 text-neutral-400 font-medium">
              {text.or}
            </span>
          </div>
        </div>

        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="mt-6">
          <Button
            variant="outline"
            className="w-full h-12 rounded-xl border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300 font-medium transition-all"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || isLoading}
          >
            {isGoogleLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24">
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
        className="text-center text-neutral-500 mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {text.haveAccount}{' '}
        <Link href="/login" className="text-neutral-900 hover:underline font-medium">
          {text.signIn}
        </Link>
      </motion.p>
    </div>
  )
}
