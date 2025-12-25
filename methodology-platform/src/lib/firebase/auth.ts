import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  User as FirebaseUser,
  onAuthStateChanged,
} from 'firebase/auth'
import { auth, isFirebaseConfigured } from './config'
import { createUser, getUser, isUsernameTaken } from './firestore'
import type { User } from '@/types'

const googleProvider = new GoogleAuthProvider()

export interface SignUpData {
  email: string
  password: string
  username: string
  displayName: string
}

export interface SignInData {
  email: string
  password: string
}

// Helper to check if auth is available
function requireAuth() {
  if (!auth) {
    throw new Error('Firebase не настроен. Пожалуйста, добавьте ключи Firebase в .env.local')
  }
  return auth
}

// Sign up with email and password
export async function signUp(data: SignUpData): Promise<FirebaseUser> {
  const authInstance = requireAuth()

  // Check if username is taken
  const taken = await isUsernameTaken(data.username)
  if (taken) {
    throw new Error('Это имя пользователя уже занято')
  }

  // Create auth user
  const userCredential = await createUserWithEmailAndPassword(
    authInstance,
    data.email,
    data.password
  )

  // Update profile
  await updateProfile(userCredential.user, {
    displayName: data.displayName,
  })

  // Create user document in Firestore
  await createUser(userCredential.user.uid, {
    email: data.email,
    username: data.username,
    displayName: data.displayName,
  })

  // Send email verification
  await sendEmailVerification(userCredential.user)

  return userCredential.user
}

// Sign in with email and password
export async function signIn(data: SignInData): Promise<FirebaseUser> {
  const authInstance = requireAuth()
  const userCredential = await signInWithEmailAndPassword(
    authInstance,
    data.email,
    data.password
  )
  return userCredential.user
}

// Sign in with Google
export async function signInWithGoogle(): Promise<FirebaseUser> {
  const authInstance = requireAuth()
  const result = await signInWithPopup(authInstance, googleProvider)
  const user = result.user

  // Check if user document exists
  const existingUser = await getUser(user.uid)

  if (!existingUser) {
    // Generate username from email
    const emailUsername = user.email?.split('@')[0] || 'user'
    let username = emailUsername.toLowerCase().replace(/[^a-z0-9]/g, '')

    // Make sure username is unique
    let counter = 1
    while (await isUsernameTaken(username)) {
      username = `${emailUsername}${counter}`
      counter++
    }

    // Create user document
    await createUser(user.uid, {
      email: user.email || '',
      username,
      displayName: user.displayName || username,
      avatar: user.photoURL,
    })
  }

  return user
}

// Sign out
export async function signOut(): Promise<void> {
  const authInstance = requireAuth()
  await firebaseSignOut(authInstance)
}

// Reset password
export async function resetPassword(email: string): Promise<void> {
  const authInstance = requireAuth()
  await sendPasswordResetEmail(authInstance, email)
}

// Send verification email
export async function sendVerificationEmail(): Promise<void> {
  const authInstance = requireAuth()
  const user = authInstance.currentUser
  if (user) {
    await sendEmailVerification(user)
  }
}

// Get current user
export function getCurrentUser(): FirebaseUser | null {
  if (!auth) return null
  return auth.currentUser
}

// Subscribe to auth state changes
export function onAuthChange(callback: (user: FirebaseUser | null) => void): () => void {
  if (!auth) {
    // Return a no-op unsubscribe function if auth is not configured
    callback(null)
    return () => {}
  }
  return onAuthStateChanged(auth, callback)
}

// Check if Firebase is configured
export { isFirebaseConfigured }
