'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  FileText,
  Users,
  FolderOpen,
  GraduationCap,
  Search,
  MessageCircle,
  Trophy,
  Heart,
  Plus,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/hooks/useLanguage'

// Pre-defined empty state types with translations
const EMPTY_STATE_PRESETS = {
  materials: {
    icon: FileText,
    titleRu: 'Материалы не найдены',
    titleKk: 'Материалдар табылмады',
    descriptionRu: 'Здесь пока нет материалов. Создайте первый!',
    descriptionKk: 'Мұнда әлі материалдар жоқ. Бірінші материалыңызды жасаңыз!',
    actionRu: 'Создать материал',
    actionKk: 'Материал жасау',
    actionHref: '/materials/create',
  },
  courses: {
    icon: GraduationCap,
    titleRu: 'Курсы не найдены',
    titleKk: 'Курстар табылмады',
    descriptionRu: 'Пока нет доступных курсов. Создайте свой первый курс!',
    descriptionKk: 'Қазірге қол жетімді курстар жоқ. Өзіңіздің бірінші курсыңызды жасаңыз!',
    actionRu: 'Создать курс',
    actionKk: 'Курс жасау',
    actionHref: '/courses/create',
  },
  communities: {
    icon: Users,
    titleRu: 'Сообщества не найдены',
    titleKk: 'Қауымдастықтар табылмады',
    descriptionRu: 'Присоединяйтесь к сообществам коллег или создайте своё!',
    descriptionKk: 'Әріптестер қауымдастығына қосылыңыз немесе өз қауымдастығыңызды құрыңыз!',
    actionRu: 'Создать сообщество',
    actionKk: 'Қауымдастық құру',
    actionHref: '/communities/create',
  },
  collections: {
    icon: FolderOpen,
    titleRu: 'Коллекции пусты',
    titleKk: 'Жинақтар бос',
    descriptionRu: 'Сохраняйте понравившиеся материалы в коллекции для быстрого доступа.',
    descriptionKk: 'Ұнаған материалдарыңызды тез қол жеткізу үшін жинақтарға сақтаңыз.',
    actionRu: 'Найти материалы',
    actionKk: 'Материалдарды табу',
    actionHref: '/feed',
  },
  search: {
    icon: Search,
    titleRu: 'Ничего не найдено',
    titleKk: 'Ештеңе табылмады',
    descriptionRu: 'Попробуйте изменить параметры поиска или сбросить фильтры.',
    descriptionKk: 'Іздеу параметрлерін өзгертіңіз немесе сүзгілерді тастаңыз.',
    actionRu: 'Сбросить',
    actionKk: 'Тастау',
    actionHref: null as string | null,
  },
  messages: {
    icon: MessageCircle,
    titleRu: 'Нет сообщений',
    titleKk: 'Хабарламалар жоқ',
    descriptionRu: 'Начните общение с коллегами. Здесь появятся ваши переписки.',
    descriptionKk: 'Әріптестермен сөйлесуді бастаңыз. Сіздің хат алмасуларыңыз осында пайда болады.',
    actionRu: 'Найти коллег',
    actionKk: 'Әріптестерді табу',
    actionHref: '/communities',
  },
  following: {
    icon: Users,
    titleRu: 'Нет подписок',
    titleKk: 'Жазылымдар жоқ',
    descriptionRu: 'Подпишитесь на интересных авторов, чтобы видеть их материалы здесь.',
    descriptionKk: 'Қызықты авторларға жазылыңыз, олардың материалдарын осында көру үшін.',
    actionRu: 'Найти авторов',
    actionKk: 'Авторларды табу',
    actionHref: '/feed',
  },
  leaderboard: {
    icon: Trophy,
    titleRu: 'Рейтинг пуст',
    titleKk: 'Рейтинг бос',
    descriptionRu: 'Станьте первым в рейтинге! Создавайте материалы и получайте баллы.',
    descriptionKk: 'Рейтингте бірінші болыңыз! Материалдар жасап, ұпайлар алыңыз.',
    actionRu: 'Начать',
    actionKk: 'Бастау',
    actionHref: '/materials/create',
  },
  favorites: {
    icon: Heart,
    titleRu: 'Нет избранного',
    titleKk: 'Таңдаулылар жоқ',
    descriptionRu: 'Ставьте лайки материалам, чтобы сохранить их в избранное.',
    descriptionKk: 'Таңдаулыларға сақтау үшін материалдарға лайк қойыңыз.',
    actionRu: 'Найти материалы',
    actionKk: 'Материалдарды табу',
    actionHref: '/feed',
  },
}

type EmptyStatePreset = keyof typeof EMPTY_STATE_PRESETS

interface EmptyStateProps {
  // Use a preset or provide custom content
  preset?: EmptyStatePreset
  // Custom content overrides preset
  icon?: ReactNode
  title?: string
  description?: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
  // Size variants
  size?: 'sm' | 'md' | 'lg'
  // Disable animation
  animate?: boolean
}

export function EmptyState({
  preset,
  icon,
  title,
  description,
  action,
  size = 'md',
  animate = true,
}: EmptyStateProps) {
  const { language } = useLanguage()

  // Get preset values if preset is specified
  const presetData = preset ? EMPTY_STATE_PRESETS[preset] : null
  const PresetIcon = presetData?.icon

  // Determine final values
  const finalIcon = icon || (PresetIcon ? <PresetIcon className={`${size === 'lg' ? 'h-12 w-12' : size === 'sm' ? 'h-6 w-6' : 'h-10 w-10'} text-muted-foreground`} /> : null)
  const finalTitle = title || (presetData ? (language === 'ru' ? presetData.titleRu : presetData.titleKk) : '')
  const finalDescription = description || (presetData ? (language === 'ru' ? presetData.descriptionRu : presetData.descriptionKk) : '')
  const finalAction = action || (presetData && presetData.actionHref ? {
    label: language === 'ru' ? presetData.actionRu : presetData.actionKk,
    href: presetData.actionHref,
  } : null)

  // Size-based classes
  const sizeClasses = {
    sm: {
      wrapper: 'py-8',
      iconWrapper: 'w-12 h-12 mb-3',
      title: 'text-base',
      description: 'text-sm',
    },
    md: {
      wrapper: 'py-16',
      iconWrapper: 'w-20 h-20 mb-4',
      title: 'text-xl',
      description: 'text-sm',
    },
    lg: {
      wrapper: 'py-24',
      iconWrapper: 'w-28 h-28 mb-6',
      title: 'text-2xl',
      description: 'text-base',
    },
  }

  const classes = sizeClasses[size]

  const Wrapper = animate ? motion.div : 'div'
  const animationProps = animate ? {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.3 },
  } : {}

  return (
    <Wrapper
      className={`text-center ${classes.wrapper}`}
      {...animationProps}
    >
      {/* Icon */}
      <div className={`${classes.iconWrapper} rounded-full bg-muted flex items-center justify-center mx-auto`}>
        {finalIcon}
      </div>

      {/* Title */}
      <h3 className={`${classes.title} font-semibold text-foreground mb-2`}>
        {finalTitle}
      </h3>

      {/* Description */}
      {finalDescription && (
        <p className={`${classes.description} text-muted-foreground max-w-md mx-auto mb-6`}>
          {finalDescription}
        </p>
      )}

      {/* Action button */}
      {finalAction && (
        finalAction.href ? (
          <Link href={finalAction.href}>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              {finalAction.label}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        ) : (
          <Button onClick={finalAction.onClick} className="gap-2">
            {finalAction.label}
          </Button>
        )
      )}
    </Wrapper>
  )
}
