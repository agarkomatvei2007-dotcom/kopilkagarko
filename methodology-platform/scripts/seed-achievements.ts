/**
 * Script to seed achievements in Firebase Firestore
 * Run this script once to initialize achievements:
 * npx ts-node scripts/seed-achievements.ts
 */

import { initializeApp } from 'firebase/app'
import { getFirestore, doc, setDoc } from 'firebase/firestore'

// Replace with your Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const achievements = [
  // Materials achievements
  {
    id: 'first-material',
    name: 'Первый материал',
    description: 'Опубликуйте свой первый материал',
    icon: '📝',
    condition: { type: 'materials_count', value: 1 },
    points: 10,
  },
  {
    id: '5-materials',
    name: 'Активный автор',
    description: 'Опубликуйте 5 материалов',
    icon: '📚',
    condition: { type: 'materials_count', value: 5 },
    points: 25,
  },
  {
    id: '10-materials',
    name: 'Опытный автор',
    description: 'Опубликуйте 10 материалов',
    icon: '🎓',
    condition: { type: 'materials_count', value: 10 },
    points: 50,
  },
  {
    id: '25-materials',
    name: 'Мастер контента',
    description: 'Опубликуйте 25 материалов',
    icon: '🏆',
    condition: { type: 'materials_count', value: 25 },
    points: 100,
  },
  {
    id: '50-materials',
    name: 'Легенда платформы',
    description: 'Опубликуйте 50 материалов',
    icon: '👑',
    condition: { type: 'materials_count', value: 50 },
    points: 200,
  },

  // Likes achievements
  {
    id: '10-likes',
    name: 'Первые лайки',
    description: 'Получите 10 лайков на свои материалы',
    icon: '❤️',
    condition: { type: 'likes_received', value: 10 },
    points: 15,
  },
  {
    id: '50-likes',
    name: 'Популярный автор',
    description: 'Получите 50 лайков',
    icon: '💖',
    condition: { type: 'likes_received', value: 50 },
    points: 40,
  },
  {
    id: '100-likes',
    name: 'Любимчик публики',
    description: 'Получите 100 лайков',
    icon: '💝',
    condition: { type: 'likes_received', value: 100 },
    points: 75,
  },
  {
    id: '500-likes',
    name: 'Звезда платформы',
    description: 'Получите 500 лайков',
    icon: '⭐',
    condition: { type: 'likes_received', value: 500 },
    points: 150,
  },

  // Followers achievements
  {
    id: '5-followers',
    name: 'Первые подписчики',
    description: 'Наберите 5 подписчиков',
    icon: '👥',
    condition: { type: 'followers_count', value: 5 },
    points: 20,
  },
  {
    id: '25-followers',
    name: 'Растущая аудитория',
    description: 'Наберите 25 подписчиков',
    icon: '🌱',
    condition: { type: 'followers_count', value: 25 },
    points: 50,
  },
  {
    id: '100-followers',
    name: 'Влиятельный учитель',
    description: 'Наберите 100 подписчиков',
    icon: '🌟',
    condition: { type: 'followers_count', value: 100 },
    points: 100,
  },
  {
    id: '500-followers',
    name: 'Лидер мнений',
    description: 'Наберите 500 подписчиков',
    icon: '🚀',
    condition: { type: 'followers_count', value: 500 },
    points: 200,
  },

  // Views achievements
  {
    id: '100-views',
    name: 'Первые просмотры',
    description: 'Получите 100 просмотров',
    icon: '👀',
    condition: { type: 'views_count', value: 100 },
    points: 10,
  },
  {
    id: '1000-views',
    name: 'Набирающий популярность',
    description: 'Получите 1000 просмотров',
    icon: '📈',
    condition: { type: 'views_count', value: 1000 },
    points: 35,
  },
  {
    id: '10000-views',
    name: 'Вирусный контент',
    description: 'Получите 10000 просмотров',
    icon: '🔥',
    condition: { type: 'views_count', value: 10000 },
    points: 100,
  },
]

async function seedAchievements() {
  console.log('Seeding achievements...')

  for (const achievement of achievements) {
    await setDoc(doc(db, 'achievements', achievement.id), achievement)
    console.log(`Added: ${achievement.name}`)
  }

  console.log('Done! All achievements have been seeded.')
}

seedAchievements().catch(console.error)
