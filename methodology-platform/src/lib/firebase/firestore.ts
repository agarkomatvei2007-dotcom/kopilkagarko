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

export async function getUsers(
  orderField: 'createdAt' | 'points' | 'stats.materialsCount' = 'createdAt',
  limitCount = 50
): Promise<User[]> {
  const q = query(
    collection(requireDb(), 'users'),
    orderBy(orderField, 'desc'),
    limit(limitCount)
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User))
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
    actorAvatar: data.authorAvatar ?? null,
    materialId: docRef.id,
    materialTitle: data.title,
    materialThumbnail: data.thumbnail ?? null,
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

export async function updateCollection(
  collectionId: string,
  data: Partial<Pick<CollectionType, 'name' | 'description' | 'isPublic'>>
): Promise<void> {
  const collectionRef = doc(requireDb(), 'collections', collectionId)
  await updateDoc(collectionRef, {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteCollection(collectionId: string): Promise<void> {
  const coll = await getCollection(collectionId)
  if (!coll) return

  // Decrease saves count for all materials in the collection
  for (const materialId of coll.materialIds) {
    try {
      await updateDoc(doc(requireDb(), 'materials', materialId), {
        'stats.saves': increment(-1),
      })
    } catch (error) {
      // Material might have been deleted
      console.error('Error updating material saves:', error)
    }
  }

  await deleteDoc(doc(requireDb(), 'collections', collectionId))
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

// ==================== CHATS & MESSAGES ====================

export async function createChat(
  currentUserId: string,
  currentUserName: string,
  currentUserAvatar: string | null,
  otherUserId: string,
  otherUserName: string,
  otherUserAvatar: string | null
): Promise<string> {
  // Check if chat already exists between these users
  const existingChat = await getChatBetweenUsers(currentUserId, otherUserId)
  if (existingChat) {
    return existingChat.id
  }

  const chatRef = await addDoc(collection(requireDb(), 'chats'), {
    participants: [currentUserId, otherUserId],
    participantsData: {
      [currentUserId]: {
        name: currentUserName,
        avatar: currentUserAvatar,
        lastRead: serverTimestamp(),
      },
      [otherUserId]: {
        name: otherUserName,
        avatar: otherUserAvatar,
        lastRead: serverTimestamp(),
      },
    },
    lastMessage: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return chatRef.id
}

export async function getChatBetweenUsers(userId1: string, userId2: string): Promise<Chat | null> {
  const q = query(
    collection(requireDb(), 'chats'),
    where('participants', 'array-contains', userId1)
  )
  const snapshot = await getDocs(q)

  for (const doc of snapshot.docs) {
    const chat = { id: doc.id, ...doc.data() } as Chat
    if (chat.participants.includes(userId2)) {
      return chat
    }
  }
  return null
}

export async function getChat(chatId: string): Promise<Chat | null> {
  const docSnap = await getDoc(doc(requireDb(), 'chats', chatId))
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Chat
  }
  return null
}

export async function getUserChats(userId: string): Promise<Chat[]> {
  const q = query(
    collection(requireDb(), 'chats'),
    where('participants', 'array-contains', userId),
    orderBy('updatedAt', 'desc')
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Chat))
}

export async function sendMessage(
  chatId: string,
  senderId: string,
  text: string,
  fileUrl?: string,
  fileType?: string
): Promise<string> {
  const messageRef = await addDoc(collection(requireDb(), 'chats', chatId, 'messages'), {
    chatId,
    senderId,
    text,
    fileUrl: fileUrl || null,
    fileType: fileType || null,
    readBy: [senderId],
    createdAt: serverTimestamp(),
  })

  // Update chat's last message
  await updateDoc(doc(requireDb(), 'chats', chatId), {
    lastMessage: {
      text,
      senderId,
      timestamp: serverTimestamp(),
    },
    updatedAt: serverTimestamp(),
  })

  return messageRef.id
}

export async function getChatMessages(chatId: string, limitCount = 50): Promise<Message[]> {
  const q = query(
    collection(requireDb(), 'chats', chatId, 'messages'),
    orderBy('createdAt', 'asc'),
    limit(limitCount)
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message))
}

export async function markMessagesAsRead(chatId: string, userId: string): Promise<void> {
  const messages = await getChatMessages(chatId, 100)
  const batch = writeBatch(requireDb())

  messages.forEach(message => {
    if (!message.readBy.includes(userId)) {
      batch.update(doc(requireDb(), 'chats', chatId, 'messages', message.id), {
        readBy: [...message.readBy, userId],
      })
    }
  })

  // Update user's lastRead in chat
  const chat = await getChat(chatId)
  if (chat) {
    await updateDoc(doc(requireDb(), 'chats', chatId), {
      [`participantsData.${userId}.lastRead`]: serverTimestamp(),
    })
  }

  await batch.commit()
}

export async function getUnreadChatsCount(userId: string): Promise<number> {
  const chats = await getUserChats(userId)
  let count = 0

  for (const chat of chats) {
    if (chat.lastMessage && chat.lastMessage.senderId !== userId) {
      const userLastRead = chat.participantsData[userId]?.lastRead
      if (!userLastRead || (chat.lastMessage.timestamp && chat.lastMessage.timestamp > userLastRead)) {
        count++
      }
    }
  }

  return count
}

// ==================== COURSES ====================

export async function createCourse(
  data: Omit<Course, 'id' | 'stats' | 'lessonsCount' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const docRef = await addDoc(collection(requireDb(), 'courses'), {
    ...data,
    stats: {
      enrollments: 0,
      rating: 0,
      reviews: 0,
    },
    lessonsCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return docRef.id
}

export async function getCourse(courseId: string): Promise<Course | null> {
  const docSnap = await getDoc(doc(requireDb(), 'courses', courseId))
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Course
  }
  return null
}

export async function updateCourse(courseId: string, data: Partial<Course>): Promise<void> {
  await updateDoc(doc(requireDb(), 'courses', courseId), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteCourse(courseId: string): Promise<void> {
  // Delete all lessons first
  const lessons = await getCourseLessons(courseId)
  const batch = writeBatch(requireDb())

  lessons.forEach(lesson => {
    batch.delete(doc(requireDb(), 'courses', courseId, 'lessons', lesson.id))
  })

  batch.delete(doc(requireDb(), 'courses', courseId))
  await batch.commit()
}

export async function getCourses(
  filters?: { subject?: string; instructorId?: string },
  limitCount = 20
): Promise<Course[]> {
  const constraints: QueryConstraint[] = [
    orderBy('createdAt', 'desc'),
    limit(limitCount),
  ]

  if (filters?.subject) {
    constraints.unshift(where('subject', '==', filters.subject))
  }

  if (filters?.instructorId) {
    constraints.unshift(where('instructorId', '==', filters.instructorId))
  }

  const q = query(collection(requireDb(), 'courses'), ...constraints)
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course))
}

export async function addLesson(
  courseId: string,
  data: Omit<Lesson, 'id' | 'courseId' | 'createdAt'>
): Promise<string> {
  const lessonRef = await addDoc(collection(requireDb(), 'courses', courseId, 'lessons'), {
    ...data,
    courseId,
    createdAt: serverTimestamp(),
  })

  // Update course lessons count
  await updateDoc(doc(requireDb(), 'courses', courseId), {
    lessonsCount: increment(1),
    updatedAt: serverTimestamp(),
  })

  return lessonRef.id
}

export async function getCourseLessons(courseId: string): Promise<Lesson[]> {
  const q = query(
    collection(requireDb(), 'courses', courseId, 'lessons'),
    orderBy('order', 'asc')
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lesson))
}

export async function getLesson(courseId: string, lessonId: string): Promise<Lesson | null> {
  const docSnap = await getDoc(doc(requireDb(), 'courses', courseId, 'lessons', lessonId))
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Lesson
  }
  return null
}

export async function enrollInCourse(courseId: string, userId: string): Promise<void> {
  const enrollmentRef = doc(requireDb(), 'courses', courseId, 'enrollments', userId)
  const existing = await getDoc(enrollmentRef)

  if (!existing.exists()) {
    await setDoc(enrollmentRef, {
      userId,
      progress: 0,
      completedLessons: [],
      enrolledAt: serverTimestamp(),
    })

    await updateDoc(doc(requireDb(), 'courses', courseId), {
      'stats.enrollments': increment(1),
    })
  }
}

export async function isEnrolledInCourse(courseId: string, userId: string): Promise<boolean> {
  const enrollmentRef = doc(requireDb(), 'courses', courseId, 'enrollments', userId)
  const docSnap = await getDoc(enrollmentRef)
  return docSnap.exists()
}

export async function getUserEnrolledCourses(userId: string): Promise<Course[]> {
  // Get all courses and filter by enrollment
  const courses = await getCourses({}, 100)
  const enrolledCourses: Course[] = []

  for (const course of courses) {
    if (await isEnrolledInCourse(course.id, userId)) {
      enrolledCourses.push(course)
    }
  }

  return enrolledCourses
}

// ==================== COMMUNITIES ====================

export interface Community {
  id: string
  name: string
  description: string
  avatar: string | null
  coverImage: string | null

  ownerId: string
  ownerName: string

  subject: string
  tags: string[]

  isPublic: boolean

  membersCount: number
  postsCount: number

  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface CommunityPost {
  id: string
  communityId: string
  authorId: string
  authorName: string
  authorAvatar: string | null

  content: string
  images: string[]

  likes: number
  comments: number

  createdAt: Timestamp
}

export async function createCommunity(
  data: Omit<Community, 'id' | 'membersCount' | 'postsCount' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const docRef = await addDoc(collection(requireDb(), 'communities'), {
    ...data,
    membersCount: 1, // Owner is first member
    postsCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  // Add owner as member
  await setDoc(doc(requireDb(), 'communities', docRef.id, 'members', data.ownerId), {
    userId: data.ownerId,
    role: 'owner',
    joinedAt: serverTimestamp(),
  })

  return docRef.id
}

export async function getCommunity(communityId: string): Promise<Community | null> {
  const docSnap = await getDoc(doc(requireDb(), 'communities', communityId))
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Community
  }
  return null
}

export async function updateCommunity(communityId: string, data: Partial<Community>): Promise<void> {
  await updateDoc(doc(requireDb(), 'communities', communityId), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export async function getCommunities(
  filters?: { subject?: string; ownerId?: string },
  limitCount = 20
): Promise<Community[]> {
  const constraints: QueryConstraint[] = [
    where('isPublic', '==', true),
    orderBy('membersCount', 'desc'),
    limit(limitCount),
  ]

  if (filters?.subject) {
    constraints.unshift(where('subject', '==', filters.subject))
  }

  if (filters?.ownerId) {
    constraints.unshift(where('ownerId', '==', filters.ownerId))
  }

  const q = query(collection(requireDb(), 'communities'), ...constraints)
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Community))
}

export async function joinCommunity(communityId: string, userId: string): Promise<void> {
  const memberRef = doc(requireDb(), 'communities', communityId, 'members', userId)
  const existing = await getDoc(memberRef)

  if (!existing.exists()) {
    await setDoc(memberRef, {
      userId,
      role: 'member',
      joinedAt: serverTimestamp(),
    })

    await updateDoc(doc(requireDb(), 'communities', communityId), {
      membersCount: increment(1),
    })
  }
}

export async function leaveCommunity(communityId: string, userId: string): Promise<void> {
  const memberRef = doc(requireDb(), 'communities', communityId, 'members', userId)
  const memberSnap = await getDoc(memberRef)

  if (memberSnap.exists() && memberSnap.data().role !== 'owner') {
    await deleteDoc(memberRef)
    await updateDoc(doc(requireDb(), 'communities', communityId), {
      membersCount: increment(-1),
    })
  }
}

export async function isCommunityMember(communityId: string, userId: string): Promise<boolean> {
  const memberRef = doc(requireDb(), 'communities', communityId, 'members', userId)
  const docSnap = await getDoc(memberRef)
  return docSnap.exists()
}

export async function getUserCommunities(userId: string): Promise<Community[]> {
  const communities = await getCommunities({}, 100)
  const userCommunities: Community[] = []

  for (const community of communities) {
    if (await isCommunityMember(community.id, userId)) {
      userCommunities.push(community)
    }
  }

  return userCommunities
}

export async function createCommunityPost(
  communityId: string,
  data: Omit<CommunityPost, 'id' | 'communityId' | 'likes' | 'comments' | 'createdAt'>
): Promise<string> {
  const postRef = await addDoc(collection(requireDb(), 'communities', communityId, 'posts'), {
    ...data,
    communityId,
    likes: 0,
    comments: 0,
    createdAt: serverTimestamp(),
  })

  await updateDoc(doc(requireDb(), 'communities', communityId), {
    postsCount: increment(1),
    updatedAt: serverTimestamp(),
  })

  return postRef.id
}

export async function getCommunityPosts(communityId: string, limitCount = 20): Promise<CommunityPost[]> {
  const q = query(
    collection(requireDb(), 'communities', communityId, 'posts'),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CommunityPost))
}

// ==================== ADMIN STATS ====================

export async function getAdminStats(): Promise<{
  usersCount: number
  materialsCount: number
  coursesCount: number
  communitiesCount: number
}> {
  const [usersSnap, materialsSnap, coursesSnap, communitiesSnap] = await Promise.all([
    getDocs(collection(requireDb(), 'users')),
    getDocs(collection(requireDb(), 'materials')),
    getDocs(collection(requireDb(), 'courses')),
    getDocs(collection(requireDb(), 'communities')),
  ])

  return {
    usersCount: usersSnap.size,
    materialsCount: materialsSnap.size,
    coursesCount: coursesSnap.size,
    communitiesCount: communitiesSnap.size,
  }
}

// ==================== SEED DATA ====================

export async function seedAchievements(): Promise<void> {
  const achievements = [
    {
      name: 'Первые шаги',
      description: 'Опубликуйте свой первый материал',
      icon: '🎯',
      condition: { type: 'materials_count', value: 1 },
      points: 10,
    },
    {
      name: 'Активный автор',
      description: 'Опубликуйте 5 материалов',
      icon: '✍️',
      condition: { type: 'materials_count', value: 5 },
      points: 25,
    },
    {
      name: 'Мастер контента',
      description: 'Опубликуйте 10 материалов',
      icon: '📚',
      condition: { type: 'materials_count', value: 10 },
      points: 50,
    },
    {
      name: 'Профессионал',
      description: 'Опубликуйте 25 материалов',
      icon: '🏆',
      condition: { type: 'materials_count', value: 25 },
      points: 100,
    },
    {
      name: 'Первый лайк',
      description: 'Получите первый лайк на ваш материал',
      icon: '❤️',
      condition: { type: 'likes_received', value: 1 },
      points: 5,
    },
    {
      name: 'Популярный автор',
      description: 'Получите 10 лайков',
      icon: '💖',
      condition: { type: 'likes_received', value: 10 },
      points: 20,
    },
    {
      name: 'Любимец публики',
      description: 'Получите 50 лайков',
      icon: '🌟',
      condition: { type: 'likes_received', value: 50 },
      points: 75,
    },
    {
      name: 'Первый подписчик',
      description: 'Получите первого подписчика',
      icon: '👤',
      condition: { type: 'followers_count', value: 1 },
      points: 10,
    },
    {
      name: 'Растущая аудитория',
      description: 'Наберите 10 подписчиков',
      icon: '👥',
      condition: { type: 'followers_count', value: 10 },
      points: 30,
    },
    {
      name: 'Лидер мнений',
      description: 'Наберите 50 подписчиков',
      icon: '🎖️',
      condition: { type: 'followers_count', value: 50 },
      points: 100,
    },
    {
      name: 'Первые просмотры',
      description: 'Ваши материалы просмотрели 10 раз',
      icon: '👁️',
      condition: { type: 'views_count', value: 10 },
      points: 5,
    },
    {
      name: 'Набираем обороты',
      description: 'Ваши материалы просмотрели 100 раз',
      icon: '📈',
      condition: { type: 'views_count', value: 100 },
      points: 25,
    },
    {
      name: 'Тысячник',
      description: 'Ваши материалы просмотрели 1000 раз',
      icon: '🚀',
      condition: { type: 'views_count', value: 1000 },
      points: 100,
    },
  ]

  for (const achievement of achievements) {
    // Check if already exists
    const q = query(
      collection(requireDb(), 'achievements'),
      where('name', '==', achievement.name),
      limit(1)
    )
    const existing = await getDocs(q)

    if (existing.empty) {
      await addDoc(collection(requireDb(), 'achievements'), achievement)
    }
  }
}
