import { initializeApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { collection, doc, getFirestore, type Firestore } from 'firebase/firestore'

function getEnvValue(name: string) {
  return import.meta.env[`VITE_FIREBASE_${name}`]?.trim() ?? ''
}

function createFirebase() {
  const config = {
    apiKey: getEnvValue('API_KEY'),
    authDomain: getEnvValue('AUTH_DOMAIN'),
    projectId: getEnvValue('PROJECT_ID'),
    storageBucket: getEnvValue('STORAGE_BUCKET'),
    messagingSenderId: getEnvValue('MESSAGING_SENDER_ID'),
    appId: getEnvValue('APP_ID'),
  }

  const hasPlaceholder = Object.values(config).some(
    (value) => !value || value.includes('SEU-') || value.includes('seu-') || value.includes('sua-'),
  )

  if (hasPlaceholder) {
    return { app: null, auth: null, db: null } as const
  }

  const app = initializeApp(config)
  return { app, auth: getAuth(app), db: getFirestore(app) } as const
}

export const firebase = createFirebase()
export const auth: Auth | null = firebase.auth
export const db: Firestore | null = firebase.db
export const isFirebaseConfigured = firebase.app !== null

export function userCollection(uid: string, name: string) {
  if (!db) throw new Error('Firebase não configurado.')
  return collection(db, 'users', uid, name)
}

export function userDocument(uid: string, collectionName: string, id?: string) {
  if (!db) throw new Error('Firebase não configurado.')
  return id ? doc(db, 'users', uid, collectionName, id) : doc(collection(db, 'users', uid, collectionName))
}
