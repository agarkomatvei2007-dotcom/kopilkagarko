'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Globe, Lock } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
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
import { createCommunity } from '@/lib/firebase/firestore'
import { SUBJECTS } from '@/types'

export default function CreateCommunityPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { language } = useLanguage()
  const { toast } = useToast()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [subject, setSubject] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [tags, setTags] = useState('')

  const txt = {
    ru: {
      back: 'Назад к сообществам',
      title: 'Создание сообщества',
      subtitle: 'Создайте сообщество для общения с коллегами',
      communityName: 'Название сообщества',
      communityNamePlaceholder: 'Введите название сообщества',
      communityDescription: 'Описание',
      communityDescriptionPlaceholder: 'Опишите цели и тематику сообщества',
      subject: 'Дисциплина',
      selectSubject: 'Выберите дисциплину',
      visibility: 'Видимость',
      public: 'Публичное',
      publicDescription: 'Любой может найти и вступить',
      private: 'Приватное',
      privateDescription: 'Только по приглашению',
      tags: 'Теги (через запятую)',
      tagsPlaceholder: 'методика, практика, СПО',
      create: 'Создать сообщество',
      creating: 'Создание...',
      success: 'Сообщество успешно создано!',
      error: 'Ошибка при создании сообщества',
      loginRequired: 'Войдите, чтобы создать сообщество',
      fillRequired: 'Заполните обязательные поля',
    },
    kk: {
      back: 'Қауымдастықтарға оралу',
      title: 'Қауымдастық құру',
      subtitle: 'Әріптестермен қарым-қатынас үшін қауымдастық жасаңыз',
      communityName: 'Қауымдастық атауы',
      communityNamePlaceholder: 'Қауымдастық атауын енгізіңіз',
      communityDescription: 'Сипаттама',
      communityDescriptionPlaceholder: 'Қауымдастық мақсаттары мен тақырыбын сипаттаңыз',
      subject: 'Пән',
      selectSubject: 'Пәнді таңдаңыз',
      visibility: 'Көріну',
      public: 'Жалпыға қолжетімді',
      publicDescription: 'Кез келген адам таба алады және қосыла алады',
      private: 'Жеке',
      privateDescription: 'Тек шақыру бойынша',
      tags: 'Тегтер (үтір арқылы)',
      tagsPlaceholder: 'әдістеме, практика, СПО',
      create: 'Қауымдастық құру',
      creating: 'Құрылуда...',
      success: 'Қауымдастық сәтті құрылды!',
      error: 'Қауымдастық құру кезінде қате',
      loginRequired: 'Қауымдастық құру үшін кіріңіз',
      fillRequired: 'Міндетті өрістерді толтырыңыз',
    },
  }

  const text = txt[language]

  const handleSubmit = async () => {
    if (!user) {
      toast({ title: text.loginRequired, variant: 'destructive' })
      return
    }

    if (!name.trim() || !description.trim() || !subject) {
      toast({ title: text.fillRequired, variant: 'destructive' })
      return
    }

    setIsSubmitting(true)
    try {
      const tagList = tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0)

      const communityId = await createCommunity({
        name: name.trim(),
        description: description.trim(),
        avatar: null,
        coverImage: null,
        ownerId: user.id,
        ownerName: user.displayName,
        subject,
        tags: tagList,
        isPublic,
      })

      toast({ title: text.success })
      router.push(`/communities/${communityId}`)
    } catch (error) {
      console.error('Error creating community:', error)
      toast({ title: text.error, variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-2xl">
      <Link href="/communities">
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {text.back}
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>{text.title}</CardTitle>
          <CardDescription>{text.subtitle}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">{text.communityName} *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={text.communityNamePlaceholder}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{text.communityDescription} *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={text.communityDescriptionPlaceholder}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>{text.subject} *</Label>
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger>
                <SelectValue placeholder={text.selectSubject} />
              </SelectTrigger>
              <SelectContent>
                {SUBJECTS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <Label>{text.visibility}</Label>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {isPublic ? (
                  <Globe className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Lock className="h-5 w-5 text-muted-foreground" />
                )}
                <div>
                  <p className="font-medium">
                    {isPublic ? text.public : text.private}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isPublic ? text.publicDescription : text.privateDescription}
                  </p>
                </div>
              </div>
              <Switch checked={isPublic} onCheckedChange={setIsPublic} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">{text.tags}</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder={text.tagsPlaceholder}
            />
          </div>

          <Button
            className="w-full"
            size="lg"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {text.creating}
              </>
            ) : (
              text.create
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
