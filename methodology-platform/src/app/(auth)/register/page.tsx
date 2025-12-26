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

export default function RegisterPage() {
  useRequireGuest()
  const { signUp, signInWithGoogle, isLoading } = useAuth()
  const { language } = useLanguage()
  const { toast } = useToast()
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const txt = {
    ru: {
      title: 'Регистрация',
      description: 'Создайте аккаунт для доступа к платформе',
      displayName: 'Имя',
      displayNamePlaceholder: 'Иван Петров',
      username: 'Имя пользователя',
      usernamePlaceholder: 'ivan_petrov',
      email: 'Email',
      emailPlaceholder: 'teacher@college.ru',
      password: 'Пароль',
      confirmPassword: 'Подтверждение пароля',
      register: 'Зарегистрироваться',
      or: 'или',
      signInGoogle: 'Войти через Google',
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
      title: 'Тіркелу',
      description: 'Платформаға кіру үшін аккаунт жасаңыз',
      displayName: 'Аты-жөні',
      displayNamePlaceholder: 'Иван Петров',
      username: 'Пайдаланушы аты',
      usernamePlaceholder: 'ivan_petrov',
      email: 'Email',
      emailPlaceholder: 'teacher@college.kz',
      password: 'Құпия сөз',
      confirmPassword: 'Құпия сөзді растау',
      register: 'Тіркелу',
      or: 'немесе',
      signInGoogle: 'Google арқылы кіру',
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
            <Label htmlFor="displayName">{text.displayName}</Label>
            <Input
              id="displayName"
              placeholder={text.displayNamePlaceholder}
              {...register('displayName')}
              disabled={isSubmitting || isLoading}
            />
            {errors.displayName && (
              <p className="text-sm text-destructive">{errors.displayName.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">{text.username}</Label>
            <Input
              id="username"
              placeholder={text.usernamePlaceholder}
              {...register('username')}
              disabled={isSubmitting || isLoading}
            />
            {errors.username && (
              <p className="text-sm text-destructive">{errors.username.message}</p>
            )}
          </div>
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
            <Label htmlFor="password">{text.password}</Label>
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
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{text.confirmPassword}</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="******"
              {...register('confirmPassword')}
              disabled={isSubmitting || isLoading}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
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
            {text.register}
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
          {text.haveAccount}{' '}
          <Link href="/login" className="text-primary hover:underline">
            {text.signIn}
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
