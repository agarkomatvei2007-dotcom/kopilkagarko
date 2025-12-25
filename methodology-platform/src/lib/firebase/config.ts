import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getAuth, connectAuthEmulator, Auth } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator, Firestore } from 'firebase/firestore'
import { getStorage, connectStorageEmulator, FirebaseStorage } from 'firebase/storage'
import { getDatabase, connectDatabaseEmulator, Database } from 'firebase/database'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
}

// Check if Firebase is properly configured (not demo/placeholder values)
const isFirebaseConfigured =
  firebaseConfig.apiKey &&
  !firebaseConfig.apiKey.includes('DEMO') &&
  !firebaseConfig.apiKey.includes('REPLACE') &&
  !firebaseConfig.apiKey.includes('your-') &&
  firebaseConfig.apiKey.length > 10

// Initialize Firebase only if properly configured
let app: FirebaseApp | null = null
let auth: Auth | null = null
let db: Firestore | null = null
let storage: FirebaseStorage | null = null
let realtimeDb: Database | null = null

if (isFirebaseConfigured) {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
  auth = getAuth(app)
  db = getFirestore(app)
  storage = getStorage(app)
  realtimeDb = getDatabase(app)

  // Connect to emulators in development
  if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true') {
    try {
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true })
      connectFirestoreEmulator(db, 'localhost', 8080)
      connectStorageEmulator(storage, 'localhost', 9199)
      connectDatabaseEmulator(realtimeDb, 'localhost', 9000)
    } catch (error) {
      // Emulators may already be connected
    }
  }
}

export { auth, db, storage, realtimeDb, isFirebaseConfigured }
export default app
