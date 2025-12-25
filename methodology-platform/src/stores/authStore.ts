import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User as FirebaseUser } from 'firebase/auth'
import type { User } from '@/types'

interface AuthState {
  firebaseUser: FirebaseUser | null
  user: User | null
  isLoading: boolean
  isInitialized: boolean

  setFirebaseUser: (user: FirebaseUser | null) => void
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setInitialized: (initialized: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      firebaseUser: null,
      user: null,
      isLoading: true,
      isInitialized: false,

      setFirebaseUser: (firebaseUser) => set({ firebaseUser }),
      setUser: (user) => set({ user }),
      setLoading: (isLoading) => set({ isLoading }),
      setInitialized: (isInitialized) => set({ isInitialized }),
      logout: () => set({ firebaseUser: null, user: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        // Only persist user data, not loading states
        user: state.user,
      }),
    }
  )
)
