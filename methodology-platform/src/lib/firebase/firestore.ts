import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  increment,
  writeBatch,
  QueryConstraint,
  DocumentSnapshot,
  Timestamp,
} from 'firebase/firestore'
import { db, isFirebaseConfigured } from './config'
import type {
  User,
  Material,
  Comment,
  Collection as CollectionType,
  Notification,
  Chat,
  Message,
  Course,
  Lesson,
  Activity,
  Achievement,
  UserAchievement,
} from '@/types'

// Helper to check if db is available
function requireDb() {
  if (!db) {
    throw new Error('Firebase не настроен. Пожалуйста, добавьте ключи Firebase в .env.local')
  }
  return db
}

// ==================== USERS ====================

export async function createUser(userId: string, data: Partial<User>): Promise<void> {
  const database = requireDb()
  const userRef = doc(database, 'users', userId)
  await setDoc(userRef, {
    id: userId,
    email: data.email || '',
    username: data.username || '',
    displayName: data.displayName || '',
    avatar: data.avatar || null,
    bio: null,
    subjects: [],
    grades: [],
    experience: 0,
    school: null,
    location: null,
    isPremium: false,
    premiumUntil: null,
    level: 1,
    points: 0,
    badges: [],
    stats: {
      materialsCount: 0,
      followersCount: 0,
      followingCount: 0,
      totalViews: 0,
      totalLikes: 0,
    },
    settings: {
      emailNotifications: true,
      pushNotifications: true,
      privateProfile: false,
      showEmail: false,
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function getUser(userId: string): Promise<User | null> {
  const database = requireDb()
  const docSnap = await getDoc(doc(database, 'users', userId))
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as User
  }
  return null
}

export async function getUserByUsername(username: string): Promise<User | null> {
  const database = requireDb()
  const q = query(collection(database, 'users'), where('username', '==', username), limit(1))
  const snapshot = await getDocs(q)
  if (snapshot.empty) return null
  const doc = snapshot.docs[0]
  return { id: doc.id, ...doc.data() } as User
}

export async function isUsernameTaken(username: string): Promise<boolean> {
  const user = await getUserByUsername(username)
  return user !== null
}

export async function updateUser(userId: string, data: Partial<User>): Promise<void> {
  const userRef = doc(requireDb(), 'users', userId)
  await updateDoc(userRef, {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export async function addPointsToUser(userId: string, points: number): Promise<void> {
  const userRef = doc(requireDb(), 'users', userId)
  await updateDoc(userRef, {
    points: increment(points),
    updatedAt: serverTimestamp(),
  })

  // Check for level up and achievements
  const user = await getUser(userId)
  if (user) {
    const newLevel = Math.floor(user.points / 100) + 1
    if (newLevel > user.level) {
      await updateDoc(userRef, { level: newLevel })
    }
  }
}

// ==================== MATERIALS ====================

export async function createMaterial(data: Omit<Material, 'id' | 'stats' | 'createdAt' | 'updatedAt' | 'publishedAt'>): Promise<string> {
  const docRef = await addDoc(collection(requireDb(), 'materials'), {
    ...data,
    stats: {
      views: 0,
      downloads: 0,
      likes: 0,
      comments: 0,
      saves: 0,
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    publishedAt: serverTimestamp(),
  })

  // Update user's materials count
  const userRef = doc(requireDb(), 'users', data.authorId)
  await updateDoc(userRef, {
    'stats.materialsCount': increment(1),
    updatedAt: serverTimestamp(),
  })

  // Add points
  await addPointsToUser(data.authorId, 10)

  // Create activity
  await createActivity({
    type: 'material_published',
    actorId: data.authorId,
    actorName: data.authorName,
    actorAvatar: data.authorAvatar || null,
    materialId: docRef.id,
    materialTitle: data.title,
    materialThumbnail: data.thumbnail || undefined,
  })

  return docRef.id
}

export async function getMaterial(materialId: string): Promise<Material | null> {
  const docSnap = await getDoc(doc(requireDb(), 'materials', materialId))
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Material
  }
  return null
}

export async function updateMaterial(materialId: string, data: Partial<Material>): Promise<void> {
  const materialRef = doc(requireDb(), 'materials', materialId)
  await updateDoc(materialRef, {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteMaterial(materialId: string): Promise<void> {
  const material = await getMaterial(materialId)
  if (!material) return

  // Delete material
  await deleteDoc(doc(requireDb(), 'materials', materialId))

  // Update user's materials count
  const userRef = doc(requireDb(), 'users', material.authorId)
  await updateDoc(userRef, {
    'stats.materialsCount': increment(-1),
    updatedAt: serverTimestamp(),
  })
}

export async function incrementMaterialViews(materialId: string): Promise<void> {
  const materialRef = doc(requireDb(), 'materials', materialId)
  await updateDoc(materialRef, {
    'stats.views': increment(1),
  })

  // Also update author's total views
  const material = await getMaterial(materialId)
  if (material) {
    const userRef = doc(requireDb(), 'users', material.authorId)
    await updateDoc(userRef, {
      'stats.totalViews': increment(1),
    })
  }
}

export async function getMaterialsByAuthor(
  authorId: string,
  lastDoc?: DocumentSnapshot,
  pageSize = 10
): Promise<{ materials: Material[]; lastDoc: DocumentSnapshot | null }> {
  const constraints: QueryConstraint[] = [
    where('authorId', '==', authorId),
    orderBy('createdAt', 'desc'),
    limit(pageSize),
  ]

  if (lastDoc) {
    constraints.push(startAfter(lastDoc))
  }

  const q = query(collection(requireDb(), 'materials'), ...constraints)
  const snapshot = await getDocs(q)

  const materials = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Material))
  const newLastDoc = snapshot.docs[snapshot.docs.length - 1] || null

  return { materials, lastDoc: newLastDoc }
}

export async function getLatestMaterials(
  lastDoc?: DocumentSnapshot,
  pageSize = 20
): Promise<{ materials: Material[]; lastDoc: DocumentSnapshot | null }> {
  const constraints: QueryConstraint[] = [
    where('isPublic', '==', true),
    orderBy('createdAt', 'desc'),
    limit(pageSize),
  ]

  if (lastDoc) {
    constraints.push(startAfter(lastDoc))
  }

  const q = query(collection(requireDb(), 'materials'), ...constraints)
  const snapshot = await getDocs(q)

  const materials = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Material))
  const newLastDoc = snapshot.docs[snapshot.docs.length - 1] || null

  return { materials, lastDoc: newLastDoc }
}

export async function getMaterialsBySubject(
  subject: string,
  lastDoc?: DocumentSnapshot,
  pageSize = 20
): Promise<{ materials: Material[]; lastDoc: DocumentSnapshot | null }> {
  const constraints: QueryConstraint[] = [
    where('subject', '==', subject),
    where('isPublic', '==', true),
    orderBy('createdAt', 'desc'),
    limit(pageSize),
  ]

  if (lastDoc) {
    constraints.push(startAfter(lastDoc))
  }

  const q = query(collection(requireDb(), 'materials'), ...constraints)
  const snapshot = await getDocs(q)

  const materials = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Material))
  const newLastDoc = snapshot.docs[snapshot.docs.length - 1] || null

  return { materials, lastDoc: newLastDoc }
}

export async function searchMaterials(
  searchTerm: string,
  filters?: {
    subject?: string
    grades?: number[]
    type?: string
    difficulty?: string
  }
): Promise<Material[]> {
  // Note: For proper full-text search, consider using Algolia or similar
  // This is a simple implementation
  const constraints: QueryConstraint[] = [
    where('isPublic', '==', true),
    orderBy('createdAt', 'desc'),
    limit(50),
  ]

  if (filters?.subject) {
    constraints.push(where('subject', '==', filters.subject))
  }

  const q = query(collection(requireDb(), 'materials'), ...constraints)
  const snapshot = await getDocs(q)

  let materials = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Material))

  // Client-side filtering for search term
  if (searchTerm) {
    const term = searchTerm.toLowerCase()
    materials = materials.filter(m =>
      m.title.toLowerCase().includes(term) ||
      m.description.toLowerCase().includes(term) ||
      m.tags.some(t => t.toLowerCase().includes(term))
    )
  }

  // Additional filters
  if (filters?.grades && filters.grades.length > 0) {
    materials = materials.filter(m =>
      m.grades.some(g => filters.grades!.includes(g))
    )
  }

  if (filters?.type) {
    materials = materials.filter(m => m.type === filters.type)
  }

  if (filters?.difficulty) {
    materials = materials.filter(m => m.difficulty === filters.difficulty)
  }

  return materials
}

// ==================== LIKES ====================

export async function toggleLike(materialId: string, userId: string): Promise<boolean> {
  const likeRef = doc(requireDb(), 'materials', materialId, 'likes', userId)
  const likeSnap = await getDoc(likeRef)

  const materialRef = doc(requireDb(), 'materials', materialId)
  const material = await getMaterial(materialId)
  if (!material) return false

  if (likeSnap.exists()) {
    // Unlike
    await deleteDoc(likeRef)
    await updateDoc(materialRef, {
      'stats.likes': increment(-1),
    })
    await updateDoc(doc(requireDb(), 'users', material.authorId), {
      'stats.totalLikes': increment(-1),
    })
    return false
  } else {
    // Like
    await setDoc(likeRef, {
      userId,
      createdAt: serverTimestamp(),
    })
    await updateDoc(materialRef, {
      'stats.likes': increment(1),
    })
    await updateDoc(doc(requireDb(), 'users', material.authorId), {
      'stats.totalLikes': increment(1),
    })

    // Add points to author
    await addPointsToUser(material.authorId, 5)

    // Create notification
    if (material.authorId !== userId) {
      const liker = await getUser(userId)
      if (liker) {
        await createNotification(material.authorId, {
          type: 'like',
          title: 'Новый лайк',
          message: `${liker.displayName} оценил(а) ваш материал "${material.title}"`,
          actorId: userId,
          actorName: liker.displayName,
          actorAvatar: liker.avatar,
          materialId,
          link: `/materials/${materialId}`,
        })
      }
    }

    return true
  }
}

export async function isLikedByUser(materialId: string, userId: string): Promise<boolean> {
  const likeRef = doc(requireDb(), 'materials', materialId, 'likes', userId)
  const likeSnap = await getDoc(likeRef)
  return likeSnap.exists()
}

// ==================== COMMENTS ====================

export async function addComment(
  materialId: string,
  data: {
    authorId: string
    authorName: string
    authorAvatar: string | null
    content: string
    parentId?: string | null
  }
): Promise<string> {
  const commentRef = await addDoc(collection(requireDb(), 'materials', materialId, 'comments'), {
    materialId,
    ...data,
    parentId: data.parentId || null,
    likes: 0,
    likedBy: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  // Update comments count
  await updateDoc(doc(requireDb(), 'materials', materialId), {
    'stats.comments': increment(1),
  })

  // Add points
  await addPointsToUser(data.authorId, 3)

  // Create notification
  const material = await getMaterial(materialId)
  if (material && material.authorId !== data.authorId) {
    await createNotification(material.authorId, {
      type: data.parentId ? 'reply' : 'comment',
      title: data.parentId ? 'Ответ на комментарий' : 'Новый комментарий',
      message: `${data.authorName} ${data.parentId ? 'ответил(а) на комментарий' : 'прокомментировал(а)'}: "${data.content.slice(0, 50)}..."`,
      actorId: data.authorId,
      actorName: data.authorName,
      actorAvatar: data.authorAvatar,
      materialId,
      link: `/materials/${materialId}`,
    })
  }

  return commentRef.id
}

export async function getComments(materialId: string): Promise<Comment[]> {
  const q = query(
    collection(requireDb(), 'materials', materialId, 'comments'),
    orderBy('createdAt', 'asc')
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment))
}

export async function deleteComment(materialId: string, commentId: string): Promise<void> {
  await deleteDoc(doc(requireDb(), 'materials', materialId, 'comments', commentId))
  await updateDoc(doc(requireDb(), 'materials', materialId), {
    'stats.comments': increment(-1),
  })
}

// ==================== FOLLOWS ====================

export async function followUser(followerId: string, followingId: string): Promise<void> {
  const batch = writeBatch(requireDb())

  // Add to follower's following
  batch.set(doc(requireDb(), 'users', followerId, 'following', followingId), {
    followingId,
    createdAt: serverTimestamp(),
  })

  // Add to following's followers
  batch.set(doc(requireDb(), 'users', followingId, 'followers', followerId), {
    followerId,
    createdAt: serverTimestamp(),
  })

  // Update counts
  batch.update(doc(requireDb(), 'users', followerId), {
    'stats.followingCount': increment(1),
    updatedAt: serverTimestamp(),
  })

  batch.update(doc(requireDb(), 'users', followingId), {
    'stats.followersCount': increment(1),
    updatedAt: serverTimestamp(),
  })

  await batch.commit()

  // Add points to followed user
  await addPointsToUser(followingId, 15)

  // Create notification
  const follower = await getUser(followerId)
  if (follower) {
    await createNotification(followingId, {
      type: 'follow',
      title: 'Новый подписчик',
      message: `${follower.displayName} подписался(-ась) на вас`,
      actorId: followerId,
      actorName: follower.displayName,
      actorAvatar: follower.avatar,
      materialId: null,
      link: `/profile/${follower.username}`,
    })
  }

  // Create activity
  if (follower) {
    const following = await getUser(followingId)
    await createActivity({
      type: 'user_followed',
      actorId: followerId,
      actorName: follower.displayName,
      actorAvatar: follower.avatar,
      targetUserId: followingId,
      targetUserName: following?.displayName,
    })
  }
}

export async function unfollowUser(followerId: string, followingId: string): Promise<void> {
  const batch = writeBatch(requireDb())

  batch.delete(doc(requireDb(), 'users', followerId, 'following', followingId))
  batch.delete(doc(requireDb(), 'users', followingId, 'followers', followerId))

  batch.update(doc(requireDb(), 'users', followerId), {
    'stats.followingCount': increment(-1),
    updatedAt: serverTimestamp(),
  })

  batch.update(doc(requireDb(), 'users', followingId), {
    'stats.followersCount': increment(-1),
    updatedAt: serverTimestamp(),
  })

  await batch.commit()
}

export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  const docSnap = await getDoc(doc(requireDb(), 'users', followerId, 'following', followingId))
  return docSnap.exists()
}

export async function getFollowers(userId: string): Promise<string[]> {
  const q = query(collection(requireDb(), 'users', userId, 'followers'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => doc.data().followerId)
}

export async function getFollowing(userId: string): Promise<string[]> {
  const q = query(collection(requireDb(), 'users', userId, 'following'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => doc.data().followingId)
}

// ==================== NOTIFICATIONS ====================

export async function createNotification(
  userId: string,
  data: Omit<Notification, 'id' | 'isRead' | 'createdAt'>
): Promise<void> {
  await addDoc(collection(requireDb(), 'users', userId, 'notifications'), {
    ...data,
    isRead: false,
    createdAt: serverTimestamp(),
  })
}

export async function getNotifications(userId: string, limitCount = 20): Promise<Notification[]> {
  const q = query(
    collection(requireDb(), 'users', userId, 'notifications'),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification))
}

export async function markNotificationAsRead(userId: string, notificationId: string): Promise<void> {
  await updateDoc(doc(requireDb(), 'users', userId, 'notifications', notificationId), {
    isRead: true,
  })
}

export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  const notifications = await getNotifications(userId, 100)
  const batch = writeBatch(requireDb())

  notifications.forEach(notification => {
    if (!notification.isRead) {
      batch.update(doc(requireDb(), 'users', userId, 'notifications', notification.id), {
        isRead: true,
      })
    }
  })

  await batch.commit()
}

export async function getUnreadNotificationsCount(userId: string): Promise<number> {
  const q = query(
    collection(requireDb(), 'users', userId, 'notifications'),
    where('isRead', '==', false)
  )
  const snapshot = await getDocs(q)
  return snapshot.size
}

// ==================== COLLECTIONS ====================

export async function createCollection(
  data: Omit<CollectionType, 'id' | 'materialIds' | 'materialsCount' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const docRef = await addDoc(collection(requireDb(), 'collections'), {
    ...data,
    materialIds: [],
    materialsCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return docRef.id
}

export async function getCollection(collectionId: string): Promise<CollectionType | null> {
  const docSnap = await getDoc(doc(requireDb(), 'collections', collectionId))
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as CollectionType
  }
  return null
}

export async function getUserCollections(userId: string): Promise<CollectionType[]> {
  const q = query(
    collection(requireDb(), 'collections'),
    where('ownerId', '==', userId),
    orderBy('createdAt', 'desc')
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CollectionType))
}

export async function addToCollection(collectionId: string, materialId: string): Promise<void> {
  const collectionRef = doc(requireDb(), 'collections', collectionId)
  const coll = await getCollection(collectionId)
  if (!coll) return

  if (!coll.materialIds.includes(materialId)) {
    await updateDoc(collectionRef, {
      materialIds: [...coll.materialIds, materialId],
      materialsCount: increment(1),
      updatedAt: serverTimestamp(),
    })

    // Update material's saves count
    await updateDoc(doc(requireDb(), 'materials', materialId), {
      'stats.saves': increment(1),
    })
  }
}

export async function removeFromCollection(collectionId: string, materialId: string): Promise<void> {
  const collectionRef = doc(requireDb(), 'collections', collectionId)
  const coll = await getCollection(collectionId)
  if (!coll) return

  await updateDoc(collectionRef, {
    materialIds: coll.materialIds.filter(id => id !== materialId),
    materialsCount: increment(-1),
    updatedAt: serverTimestamp(),
  })

  await updateDoc(doc(requireDb(), 'materials', materialId), {
    'stats.saves': increment(-1),
  })
}

// ==================== ACTIVITIES ====================

export async function createActivity(
  data: Omit<Activity, 'id' | 'createdAt'>
): Promise<void> {
  await addDoc(collection(requireDb(), 'activities'), {
    ...data,
    createdAt: serverTimestamp(),
  })
}

export async function getActivities(limitCount = 50): Promise<Activity[]> {
  const q = query(
    collection(requireDb(), 'activities'),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Activity))
}

export async function getUserActivities(userId: string, limitCount = 20): Promise<Activity[]> {
  const q = query(
    collection(requireDb(), 'activities'),
    where('actorId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Activity))
}

// ==================== ACHIEVEMENTS ====================

export async function getAchievements(): Promise<Achievement[]> {
  const snapshot = await getDocs(collection(requireDb(), 'achievements'))
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Achievement))
}

export async function getUserAchievements(userId: string): Promise<UserAchievement[]> {
  const snapshot = await getDocs(collection(requireDb(), 'users', userId, 'achievements'))
  return snapshot.docs.map(doc => doc.data() as UserAchievement)
}

export async function unlockAchievement(userId: string, achievementId: string): Promise<void> {
  const achievement = await getDoc(doc(requireDb(), 'achievements', achievementId))
  if (!achievement.exists()) return

  const userAchievementRef = doc(requireDb(), 'users', userId, 'achievements', achievementId)
  const existing = await getDoc(userAchievementRef)
  if (existing.exists()) return

  await setDoc(userAchievementRef, {
    achievementId,
    unlockedAt: serverTimestamp(),
  })

  // Add points
  await addPointsToUser(userId, achievement.data().points)

  // Add badge
  await updateDoc(doc(requireDb(), 'users', userId), {
    badges: [...(await getUser(userId))?.badges || [], achievementId],
    updatedAt: serverTimestamp(),
  })

  // Create notification
  await createNotification(userId, {
    type: 'achievement',
    title: 'Новое достижение!',
    message: `Вы получили достижение "${achievement.data().name}"`,
    actorId: null,
    actorName: null,
    actorAvatar: null,
    materialId: null,
    link: '/achievements',
  })
}

export async function checkAchievements(userId: string): Promise<void> {
  const user = await getUser(userId)
  if (!user) return

  const achievements = await getAchievements()
  const userAchievements = await getUserAchievements(userId)
  const unlockedIds = userAchievements.map(a => a.achievementId)

  for (const achievement of achievements) {
    if (unlockedIds.includes(achievement.id)) continue

    let shouldUnlock = false

    switch (achievement.condition.type) {
      case 'materials_count':
        shouldUnlock = user.stats.materialsCount >= achievement.condition.value
        break
      case 'likes_received':
        shouldUnlock = user.stats.totalLikes >= achievement.condition.value
        break
      case 'followers_count':
        shouldUnlock = user.stats.followersCount >= achievement.condition.value
        break
      case 'views_count':
        shouldUnlock = user.stats.totalViews >= achievement.condition.value
        break
    }

    if (shouldUnlock) {
      await unlockAchievement(userId, achievement.id)
    }
  }
}

// ==================== LEADERBOARD ====================

export async function getLeaderboard(
  type: 'points' | 'materials' | 'likes' = 'points',
  limitCount = 10
): Promise<User[]> {
  let orderField: string
  switch (type) {
    case 'materials':
      orderField = 'stats.materialsCount'
      break
    case 'likes':
      orderField = 'stats.totalLikes'
      break
    default:
      orderField = 'points'
  }

  const q = query(
    collection(requireDb(), 'users'),
    orderBy(orderField, 'desc'),
    limit(limitCount)
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User))
}
