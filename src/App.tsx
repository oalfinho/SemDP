import { AuthProvider, useAuth } from './context/AuthContext'
import { AuthScreen } from './components/AuthScreen'
import { Dashboard } from './components/Dashboard'
import { SetupScreen } from './components/SetupScreen'
import { isSupabaseConfigured } from './lib/supabase'

function Gate() {
  const { user, loading } = useAuth()

  if (!isSupabaseConfigured) return <SetupScreen />
  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center text-zinc-500">Carregando…</div>
    )
  }
  if (!user) return <AuthScreen />
  return <Dashboard />
}

export default function App() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  )
}
