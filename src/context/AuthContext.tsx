import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth'
import { auth } from '../lib/firebase'

type AuthValue = {
  user: User | null
  session: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<string | null>
  signUp: (email: string, password: string) => Promise<string | null>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!auth) {
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value = useMemo<AuthValue>(
    () => ({
      user,
      session: user,
      loading,
      signIn: async (email, password) => {
        if (!auth) return 'Firebase não configurado.'
        try {
          await signInWithEmailAndPassword(auth, email, password)
          return null
        } catch (error: unknown) {
          return error instanceof Error ? error.message : 'Erro ao entrar.'
        }
      },
      signUp: async (email, password) => {
        if (!auth) return 'Firebase não configurado.'
        try {
          await createUserWithEmailAndPassword(auth, email, password)
          return null
        } catch (error: unknown) {
          return error instanceof Error ? error.message : 'Erro ao criar conta.'
        }
      },
      signOut: async () => {
        if (!auth) return
        await signOut(auth)
      },
    }),
    [user, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth precisa estar dentro de AuthProvider')
  return ctx
}
