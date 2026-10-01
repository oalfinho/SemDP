import { initializeApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'

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
    return { app: null, auth: null } as const
  }

  const app = initializeApp(config)
  return { app, auth: getAuth(app) } as const
}

export const firebase = createFirebase()
export const auth: Auth | null = firebase.auth
export const isFirebaseConfigured = firebase.app !== null
