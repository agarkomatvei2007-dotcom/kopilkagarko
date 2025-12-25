'use client'

import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { onAuthChange, signIn, signUp, signOut, signInWithGoogle, resetPassword } from '@/lib/firebase/auth'
import { getUser, updateUser, addPointsToUser, checkAchievements } from '@/lib/firebase/firestore'
import type { User } from '@/types'

export function useAuth() {
  const router = useRouter()
  const {
    firebaseUser,
    user,
    isLoading,
    isInitialized,
    setFirebaseUser,
    setUser,
    setLoading,
    setInitialized,
    logout: storeLogout,
  } = useAuthStore()

  // Initialize auth listener
  useEffect(() => {
    const unsubscribe = onAuthChange(async (fbUser) => {
      setFirebaseUser(fbUser)

      if (fbUser) {
        // Get user document from Firestore
        const userData = await getUser(fbUser.uid)
        setUser(userData)

        // Add daily login points (simple implementation)
        if (userData) {
          const lastLogin = userData.updatedAt?.toDate()
          const now = new Date()
          if (!lastLogin || now.getDate() !== lastLogin.getDate()) {
            await addPointsToUser(fbUser.uid, 1)
            await checkAchievements(fbUser.uid)
          }
        }
      } else {
        setUser(null)
      }

      setLoading(false)
      setInitialized(true)
    })

    return () => unsubscribe()
  }, [setFirebaseUser, setUser, setLoading, setInitialized])

  const handleSignIn = useCallback(async (email: string, password: string) => {
    setLoading(true)
    try {
      await signIn({ email, password })
      router.push('/feed')
    } catch (error) {
      setLoading(false)
      throw error
    }
  }, [router, setLoading])

  const handleSignUp = useCallback(async (
    email: string,
    password: string,
    username: string,
    displayName: string
  ) => {
    setLoading(true)
    try {
      await signUp({ email, password, username, displayName })
      router.push('/verify-email')
    } catch (error) {
      setLoading(false)
      throw error
    }
  }, [router, setLoading])

  const handleGoogleSignIn = useCallback(async () => {
    setLoading(true)
    try {
      await signInWithGoogle()
      router.push('/feed')
    } catch (error) {
      setLoading(false)
      throw error
    }
  }, [router, setLoading])

  const handleSignOut = useCallback(async () => {
    setLoading(true)
    try {
      await signOut()
      storeLogout()
      router.push('/')
    } finally {
      setLoading(false)
    }
  }, [router, setLoading, storeLogout])

  const handleResetPassword = useCallback(async (email: string) => {
    await resetPassword(email)
  }, [])

  const handleUpdateProfile = useCallback(async (data: Partial<User>) => {
    if (!firebaseUser) return

    await updateUser(firebaseUser.uid, data)
    const updatedUser = await getUser(firebaseUser.uid)
    setUser(updatedUser)
  }, [firebaseUser, setUser])

  const refreshUser = useCallback(async () => {
    if (!firebaseUser) return

    const userData = await getUser(firebaseUser.uid)
    setUser(userData)
  }, [firebaseUser, setUser])

  return {
    user,
    firebaseUser,
    isLoading,
    isInitialized,
    isAuthenticated: !!firebaseUser,
    isEmailVerified: firebaseUser?.emailVerified ?? false,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signInWithGoogle: handleGoogleSignIn,
    signOut: handleSignOut,
    resetPassword: handleResetPassword,
    updateProfile: handleUpdateProfile,
    refreshUser,
  }
}

// Hook for protected routes
export function useRequireAuth(redirectUrl = '/login') {
  const { isAuthenticated, isLoading, isInitialized } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isInitialized && !isLoading && !isAuthenticated) {
      router.push(redirectUrl)
    }
  }, [isAuthenticated, isLoading, isInitialized, router, redirectUrl])

  return { isAuthenticated, isLoading }
}

// Hook for guest-only routes (redirect if authenticated)
export function useRequireGuest(redirectUrl = '/feed') {
  const { isAuthenticated, isLoading, isInitialized } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isInitialized && !isLoading && isAuthenticated) {
      router.push(redirectUrl)
    }
  }, [isAuthenticated, isLoading, isInitialized, router, redirectUrl])

  return { isAuthenticated, isLoading }
}
