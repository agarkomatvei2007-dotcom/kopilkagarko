import { Timestamp } from 'firebase/firestore'

// User types
export interface UserLocation {
  city: string
  country: string
}

export interface UserStats {
  materialsCount: number
  followersCount: number
  followingCount: number
  totalViews: number
  totalLikes: number
}

export interface UserSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  privateProfile: boolean
  showEmail: boolean
}

export interface User {
  id: string
  email: string
  username: string
  displayName: string
  avatar: string | null
  bio: string | null

  // Professional info
  subjects: string[]
  grades: number[]
  experience: number
  school: string | null
  location: UserLocation | null

  // Premium
  isPremium: boolean
  premiumUntil: Timestamp | null

  // Gamification
  level: number
  points: number
  badges: string[]

  // Stats
  stats: UserStats

  // Settings
  settings: UserSettings

  // Admin
  isAdmin?: boolean
  isBanned?: boolean

  createdAt: Timestamp
  updatedAt: Timestamp
}

// Material types
export type MaterialType = 'text' | 'video' | 'presentation' | 'document' | 'audio' | 'quiz'
export type MaterialDifficulty = 'easy' | 'medium' | 'hard'

export interface MaterialFile {
  name: string
  url: string
  size: number
  type: string
}

export interface MaterialQuizQuestion {
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  difficulty: 'easy' | 'medium' | 'hard'
}

export interface MaterialContent {
  text?: string
  videoUrl?: string
  fileUrl?: string
  files?: MaterialFile[]
  questions?: MaterialQuizQuestion[]
}

export interface MaterialStats {
  views: number
  downloads: number
  likes: number
  comments: number
  saves: number
}

export interface Material {
  id: string
  title: string
  description: string
  type: MaterialType

  // Content
  content: MaterialContent

  // Metadata
  subject: string
  grades: number[]
  tags: string[]
  difficulty: MaterialDifficulty
  duration: number | null
  standards: string[]

  // Media
  thumbnail: string | null
  images: string[]

  // Access
  isPublic: boolean
  isPremium: boolean
  price: number | null
  allowDownload: boolean

  // Stats
  stats: MaterialStats

  // Author
  authorId: string
  authorUsername: string
  authorName: string
  authorAvatar: string | null

  // AI
  aiGenerated: boolean
  aiTags: string[]

  createdAt: Timestamp
  updatedAt: Timestamp
  publishedAt: Timestamp
}

// Comment types
export interface Comment {
  id: string
  materialId: string
  authorId: string
  authorName: string
  authorAvatar: string | null
  content: string

  parentId: string | null

  likes: number
  likedBy: string[]

  createdAt: Timestamp
  updatedAt: Timestamp
}

// Like type
export interface Like {
  userId: string
  createdAt: Timestamp
}

// Follow types
export interface Follow {
  followerId?: string
  followingId?: string
  createdAt: Timestamp
}

// Collection types
export interface Collection {
  id: string
  name: string
  description: string | null
  ownerId: string
  ownerName: string
  isPublic: boolean

  materialIds: string[]
  materialsCount: number

  thumbnail: string | null

  createdAt: Timestamp
  updatedAt: Timestamp
}

// Notification types
export type NotificationType = 'like' | 'comment' | 'follow' | 'mention' | 'achievement' | 'reply'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string

  actorId: string | null
  actorName: string | null
  actorAvatar: string | null

  materialId: string | null
  link: string | null

  isRead: boolean

  createdAt: Timestamp
}

// Chat types
export interface ChatParticipantData {
  name: string
  avatar: string | null
  lastRead: Timestamp
}

export interface ChatLastMessage {
  text: string
  senderId: string
  timestamp: Timestamp
}

export interface Chat {
  id: string
  participants: string[]
  participantsData: Record<string, ChatParticipantData>

  lastMessage: ChatLastMessage | null

  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface Message {
  id: string
  chatId: string
  senderId: string
  text: string

  fileUrl: string | null
  fileType: string | null

  readBy: string[]

  createdAt: Timestamp
}

// Course types
export interface CourseStats {
  enrollments: number
  rating: number
  reviews: number
}

export interface Course {
  id: string
  title: string
  description: string
  instructorId: string
  instructorName: string

  subject: string
  grades: number[]

  thumbnail: string | null
  price: number | null

  stats: CourseStats

  lessonsCount: number

  createdAt: Timestamp
  updatedAt: Timestamp
}

export type LessonContentType = 'video' | 'text' | 'quiz'

export interface LessonContent {
  type: LessonContentType
  videoUrl?: string
  text?: string
  quiz?: QuizData
}

export interface Lesson {
  id: string
  courseId: string
  title: string
  description: string
  order: number

  content: LessonContent

  duration: number

  createdAt: Timestamp
}

// Quiz types
export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation?: string
}

export interface QuizData {
  questions: QuizQuestion[]
  timeLimit?: number
  passingScore: number
}

// Achievement types
export type AchievementConditionType = 'materials_count' | 'likes_received' | 'followers_count' | 'views_count' | 'comments_count'

export interface AchievementCondition {
  type: AchievementConditionType
  value: number
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  condition: AchievementCondition
  points: number
}

export interface UserAchievement {
  achievementId: string
  unlockedAt: Timestamp
}

// Activity types
export type ActivityType = 'material_published' | 'material_liked' | 'user_followed' | 'comment_added'

export interface Activity {
  id: string
  type: ActivityType

  actorId: string
  actorName: string
  actorAvatar: string | null

  materialId?: string
  materialTitle?: string
  materialThumbnail?: string

  targetUserId?: string
  targetUserName?: string

  createdAt: Timestamp
}

// Subject list (College/СПО disciplines)
export const SUBJECTS = [
  // Общеобразовательные дисциплины
  'Русский язык',
  'Литература',
  'Иностранный язык',
  'История',
  'Обществознание',
  'География',
  'Математика',
  'Информатика',
  'Физика',
  'Химия',
  'Биология',
  'Физическая культура',
  'ОБЖ',
  'Астрономия',
  // Общепрофессиональные дисциплины
  'Экономика организации',
  'Менеджмент',
  'Правовое обеспечение профессиональной деятельности',
  'Бухгалтерский учёт',
  'Статистика',
  'Документационное обеспечение управления',
  'Основы философии',
  'Психология общения',
  'Иностранный язык в профессиональной деятельности',
  // Технические дисциплины
  'Инженерная графика',
  'Техническая механика',
  'Электротехника и электроника',
  'Материаловедение',
  'Метрология и стандартизация',
  'Информационные технологии',
  'Компьютерные сети',
  'Базы данных',
  'Программирование',
  'Веб-разработка',
  // Медицинские дисциплины
  'Анатомия и физиология',
  'Фармакология',
  'Сестринское дело',
  'Основы латинского языка',
  // Педагогические дисциплины
  'Педагогика',
  'Психология',
  'Методика преподавания',
  // Другое
  'Безопасность жизнедеятельности',
  'Экология',
  'Основы проектной деятельности',
  'Индивидуальный проект',
  'Другое',
] as const

export type Subject = typeof SUBJECTS[number]

// Courses (1-4 курс колледжа)
export const GRADES = [1, 2, 3, 4] as const
export type Grade = typeof GRADES[number]

export const GRADE_LABELS: Record<number, string> = {
  1: '1 курс',
  2: '2 курс',
  3: '3 курс',
  4: '4 курс',
}

// Material type labels
export const MATERIAL_TYPE_LABELS: Record<MaterialType, string> = {
  text: 'Текст',
  video: 'Видео',
  presentation: 'Презентация',
  document: 'Документ',
  audio: 'Аудио',
  quiz: 'Тест',
}

export const DIFFICULTY_LABELS: Record<MaterialDifficulty, string> = {
  easy: 'Легкий',
  medium: 'Средний',
  hard: 'Сложный',
}
