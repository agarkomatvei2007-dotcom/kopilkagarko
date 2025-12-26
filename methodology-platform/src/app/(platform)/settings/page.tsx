'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Upload } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/hooks/useLanguage'
import { useToast } from '@/hooks/use-toast'
import { uploadAvatar } from '@/lib/firebase/storage'
import { getInitials } from '@/lib/utils'
import { SUBJECTS, GRADES, GRADE_LABELS } from '@/types'

const profileSchema = z.object({
  displayName: z.string().min(2, 'Имя должно быть не менее 2 символов'),
  bio: z.string().max(300, 'Описание не более 300 символов').optional(),
  school: z.string().optional(),
  experience: z.number().min(0).max(50).optional(),
  city: z.string().optional(),
})

type ProfileForm = z.infer<typeof profileSchema>

export default function SettingsPage() {
  const { user, updateProfile } = useAuth()
  const { language } = useLanguage()
  const { toast } = useToast()

  const txt = {
    ru: {
      title: 'Настройки',
      profilePhoto: 'Фото профиля',
      uploadPhoto: 'Загрузить фото',
      photoHint: 'JPG, PNG до 5MB',
      avatarUpdated: 'Аватар обновлен',
      avatarError: 'Не удалось загрузить аватар',
      mainInfo: 'Основная информация',
      name: 'Имя',
      aboutMe: 'О себе',
      aboutPlaceholder: 'Расскажите о себе...',
      college: 'Колледж / Учреждение',
      collegePlaceholder: 'Название колледжа',
      city: 'Город',
      cityPlaceholder: 'Ваш город',
      experience: 'Опыт работы (лет)',
      subjects: 'Предметы',
      subjectsDesc: 'Выберите предметы, которые вы преподаете',
      courses: 'Курсы',
      coursesDesc: 'Выберите курсы, с которыми вы работаете',
      notifications: 'Уведомления',
      emailNotifications: 'Email-уведомления',
      emailNotificationsDesc: 'Получать уведомления на почту',
      pushNotifications: 'Push-уведомления',
      pushNotificationsDesc: 'Получать push-уведомления в браузере',
      privacy: 'Приватность',
      privateProfile: 'Приватный профиль',
      privateProfileDesc: 'Скрыть профиль от других пользователей',
      showEmail: 'Показывать email',
      showEmailDesc: 'Другие пользователи смогут видеть ваш email',
      saveChanges: 'Сохранить изменения',
      profileUpdated: 'Профиль обновлен',
      profileError: 'Не удалось обновить профиль',
      error: 'Ошибка',
    },
    kk: {
      title: 'Параметрлер',
      profilePhoto: 'Профиль суреті',
      uploadPhoto: 'Сурет жүктеу',
      photoHint: 'JPG, PNG 5MB дейін',
      avatarUpdated: 'Аватар жаңартылды',
      avatarError: 'Аватарды жүктеу мүмкін болмады',
      mainInfo: 'Негізгі ақпарат',
      name: 'Аты',
      aboutMe: 'Өзім туралы',
      aboutPlaceholder: 'Өзіңіз туралы айтыңыз...',
      college: 'Колледж / Мекеме',
      collegePlaceholder: 'Колледж атауы',
      city: 'Қала',
      cityPlaceholder: 'Сіздің қалаңыз',
      experience: 'Жұмыс тәжірибесі (жыл)',
      subjects: 'Пәндер',
      subjectsDesc: 'Оқытатын пәндерді таңдаңыз',
      courses: 'Курстар',
      coursesDesc: 'Жұмыс істейтін курстарды таңдаңыз',
      notifications: 'Хабарландырулар',
      emailNotifications: 'Email-хабарландырулар',
      emailNotificationsDesc: 'Поштаға хабарландырулар алу',
      pushNotifications: 'Push-хабарландырулар',
      pushNotificationsDesc: 'Браузерде push-хабарландырулар алу',
      privacy: 'Құпиялылық',
      privateProfile: 'Жабық профиль',
      privateProfileDesc: 'Профильді басқа пайдаланушылардан жасыру',
      showEmail: 'Email көрсету',
      showEmailDesc: 'Басқа пайдаланушылар сіздің email-ды көре алады',
      saveChanges: 'Өзгерістерді сақтау',
      profileUpdated: 'Профиль жаңартылды',
      profileError: 'Профильді жаңарту мүмкін болмады',
      error: 'Қате',
    },
  }

  const text = txt[language]

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(user?.subjects || [])
  const [selectedGrades, setSelectedGrades] = useState<number[]>(user?.grades || [])
  const [settings, setSettings] = useState({
    emailNotifications: user?.settings?.emailNotifications ?? true,
    pushNotifications: user?.settings?.pushNotifications ?? true,
    privateProfile: user?.settings?.privateProfile ?? false,
    showEmail: user?.settings?.showEmail ?? false,
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: user?.displayName || '',
      bio: user?.bio || '',
      school: user?.school || '',
      experience: user?.experience || 0,
      city: user?.location?.city || '',
    },
  })

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    try {
      const url = await uploadAvatar(user.id, file)
      await updateProfile({ avatar: url })
      toast({ title: text.avatarUpdated })
    } catch (error) {
      toast({
        title: text.error,
        description: text.avatarError,
        variant: 'destructive',
      })
    }
  }

  const handleSubjectToggle = (subject: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subject)
        ? prev.filter((s) => s !== subject)
        : [...prev, subject]
    )
  }

  const handleGradeToggle = (grade: number) => {
    setSelectedGrades((prev) =>
      prev.includes(grade)
        ? prev.filter((g) => g !== grade)
        : [...prev, grade]
    )
  }

  const onSubmit = async (data: ProfileForm) => {
    if (!user) return
    setIsSubmitting(true)

    try {
      await updateProfile({
        displayName: data.displayName,
        bio: data.bio || null,
        school: data.school || null,
        experience: data.experience || 0,
        location: data.city ? { city: data.city, country: 'Россия' } : null,
        subjects: selectedSubjects,
        grades: selectedGrades,
        settings,
      })

      toast({ title: text.profileUpdated })
    } catch (error) {
      toast({
        title: text.error,
        description: text.profileError,
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) return null

  return (
    <div className="container mx-auto py-6 px-4 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">{text.title}</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Avatar */}
        <Card>
          <CardHeader>
            <CardTitle>{text.profilePhoto}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.avatar || undefined} />
              <AvatarFallback className="text-2xl">
                {getInitials(user.displayName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="avatar-upload"
                onChange={handleAvatarChange}
              />
              <label htmlFor="avatar-upload">
                <Button type="button" variant="outline" asChild>
                  <span className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    {text.uploadPhoto}
                  </span>
                </Button>
              </label>
              <p className="text-xs text-muted-foreground mt-2">
                {text.photoHint}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Profile info */}
        <Card>
          <CardHeader>
            <CardTitle>{text.mainInfo}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">{text.name}</Label>
              <Input
                id="displayName"
                {...register('displayName')}
              />
              {errors.displayName && (
                <p className="text-sm text-destructive">{errors.displayName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">{text.aboutMe}</Label>
              <Textarea
                id="bio"
                placeholder={text.aboutPlaceholder}
                {...register('bio')}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="school">{text.college}</Label>
                <Input
                  id="school"
                  placeholder={text.collegePlaceholder}
                  {...register('school')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">{text.city}</Label>
                <Input
                  id="city"
                  placeholder={text.cityPlaceholder}
                  {...register('city')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{text.experience}</Label>
              <Input
                type="number"
                min="0"
                max="50"
                {...register('experience', { valueAsNumber: true })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Subjects */}
        <Card>
          <CardHeader>
            <CardTitle>{text.subjects}</CardTitle>
            <CardDescription>{text.subjectsDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {SUBJECTS.map((subject) => (
                <button
                  key={subject}
                  type="button"
                  onClick={() => handleSubjectToggle(subject)}
                  className={`px-3 py-1 rounded-full border text-sm transition-colors ${
                    selectedSubjects.includes(subject)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-muted hover:border-primary/50'
                  }`}
                >
                  {subject}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Grades */}
        <Card>
          <CardHeader>
            <CardTitle>{text.courses}</CardTitle>
            <CardDescription>{text.coursesDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {GRADES.map((grade) => (
                <button
                  key={grade}
                  type="button"
                  onClick={() => handleGradeToggle(grade)}
                  className={`px-3 py-1 rounded-full border text-sm transition-colors ${
                    selectedGrades.includes(grade)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-muted hover:border-primary/50'
                  }`}
                >
                  {GRADE_LABELS[grade]}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>{text.notifications}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>{text.emailNotifications}</Label>
                <p className="text-sm text-muted-foreground">
                  {text.emailNotificationsDesc}
                </p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, emailNotifications: checked })
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label>{text.pushNotifications}</Label>
                <p className="text-sm text-muted-foreground">
                  {text.pushNotificationsDesc}
                </p>
              </div>
              <Switch
                checked={settings.pushNotifications}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, pushNotifications: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy */}
        <Card>
          <CardHeader>
            <CardTitle>{text.privacy}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>{text.privateProfile}</Label>
                <p className="text-sm text-muted-foreground">
                  {text.privateProfileDesc}
                </p>
              </div>
              <Switch
                checked={settings.privateProfile}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, privateProfile: checked })
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label>{text.showEmail}</Label>
                <p className="text-sm text-muted-foreground">
                  {text.showEmailDesc}
                </p>
              </div>
              <Switch
                checked={settings.showEmail}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, showEmail: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {text.saveChanges}
        </Button>
      </form>
    </div>
  )
}
