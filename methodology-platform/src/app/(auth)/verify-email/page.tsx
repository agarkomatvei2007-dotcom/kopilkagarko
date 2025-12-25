'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, Loader2, CheckCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import { sendVerificationEmail } from '@/lib/firebase/auth'
import { useToast } from '@/hooks/use-toast'

export default function VerifyEmailPage() {
  const { firebaseUser, isEmailVerified, signOut } = useAuth()
  const { toast } = useToast()
  const [isSending, setIsSending] = useState(false)

  const handleResendEmail = async () => {
    setIsSending(true)
    try {
      await sendVerificationEmail()
      toast({
        title: 'Письмо отправлено',
        description: 'Проверьте вашу почту',
      })
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить письмо. Попробуйте позже.',
        variant: 'destructive',
      })
    } finally {
      setIsSending(false)
    }
  }

  if (isEmailVerified) {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Email подтвержден!</CardTitle>
          <CardDescription>
            Ваш email успешно подтвержден. Теперь вы можете пользоваться всеми функциями платформы.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button asChild>
            <Link href="/feed">Перейти к ленте</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Mail className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl">Подтвердите email</CardTitle>
        <CardDescription>
          Мы отправили письмо с ссылкой для подтверждения на адрес{' '}
          <span className="font-medium text-foreground">{firebaseUser?.email}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
          <p className="mb-2">Не получили письмо?</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Проверьте папку &quot;Спам&quot;</li>
            <li>Убедитесь, что email указан правильно</li>
            <li>Подождите несколько минут</li>
          </ul>
        </div>
        <Button
          variant="outline"
          className="w-full"
          onClick={handleResendEmail}
          disabled={isSending}
        >
          {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Отправить письмо повторно
        </Button>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Button variant="ghost" className="w-full" onClick={signOut}>
          Выйти из аккаунта
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          После подтверждения email обновите эту страницу
        </p>
      </CardFooter>
    </Card>
  )
}
