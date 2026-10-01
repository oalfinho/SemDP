import { ErrorBoundary } from './components/ErrorBoundary'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './context/authContextValue'
import { AuthScreen } from './components/AuthScreen'
import { lazy, Suspense } from 'react'
const Dashboard = lazy(() =>
  import('./components/Dashboard').then((module) => ({ default: module.Dashboard })),
)
import { SetupScreen } from './components/SetupScreen'
import { isFirebaseConfigured } from './lib/firebase'

function Gate() {
  const { user, loading } = useAuth()

  if (new URLSearchParams(window.location.search).get('demo') === '1') return <Dashboard demo />

  if (!isFirebaseConfigured) return <SetupScreen />
  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center text-zinc-500">Carregando…</div>
    )
  }
  if (!user) return <AuthScreen />
  return <Dashboard key={user.uid} />
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Suspense fallback={<p className="message">Carregando o SemDP…</p>}>
          <Gate />
        </Suspense>
      </AuthProvider>
    </ErrorBoundary>
  )
}
