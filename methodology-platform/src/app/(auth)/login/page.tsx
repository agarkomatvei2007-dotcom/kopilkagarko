'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
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
      title: 'Вход',
      description: 'Войдите в свой аккаунт для доступа к платформе',
      email: 'Email',
      emailPlaceholder: 'teacher@college.ru',
      password: 'Пароль',
      forgotPassword: 'Забыли пароль?',
      signIn: 'Войти',
      or: 'или',
      signInGoogle: 'Войти через Google',
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
      title: 'Кіру',
      description: 'Платформаға кіру үшін аккаунтыңызға кіріңіз',
      email: 'Email',
      emailPlaceholder: 'teacher@college.kz',
      password: 'Құпия сөз',
      forgotPassword: 'Құпия сөзді ұмыттыңыз ба?',
      signIn: 'Кіру',
      or: 'немесе',
      signInGoogle: 'Google арқылы кіру',
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
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">{text.title}</CardTitle>
        <CardDescription className="text-center">
          {text.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{text.email}</Label>
            <Input
              id="email"
              type="email"
              placeholder={text.emailPlaceholder}
              {...register('email')}
              disabled={isSubmitting || isLoading}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">{text.password}</Label>
              <Link
                href="/reset-password"
                className="text-sm text-primary hover:underline"
              >
                {text.forgotPassword}
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="******"
              {...register('password')}
              disabled={isSubmitting || isLoading}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || isLoading}
          >
            {(isSubmitting || isLoading) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {text.signIn}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              {text.or}
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading || isLoading}
        >
          {isGoogleLoading && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
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
        </Button>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          {text.noAccount}{' '}
          <Link href="/register" className="text-primary hover:underline">
            {text.register}
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
