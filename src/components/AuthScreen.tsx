import { useState, type FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'

export function AuthScreen() {
  const { signIn, signUp, signInWithGoogle } = useAuth()
  const [modo, setModo] = useState<'entrar' | 'criar'>('entrar')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setErro(null)
    setInfo(null)
    setEnviando(true)
    const action = modo === 'entrar' ? signIn : signUp
    const message = await action(email.trim(), senha)
    setEnviando(false)
    if (message) {
      setErro(message)
      return
    }
    if (modo === 'criar') {
      setInfo('Conta criada. Confirme o email antes de entrar.')
    }
  }

  async function onGoogle() {
    setErro(null)
    setInfo(null)
    setEnviando(true)
    const message = await (signInWithGoogle ? signInWithGoogle() : Promise.resolve(''))
    setEnviando(false)
    if (message) setErro(message)
  }

  return (
    <div className="flex min-h-svh items-center justify-center px-4">
      <div className="w-full max-w-md">
        <p className="mb-2 text-sm font-medium tracking-wide text-emerald-400">SemDP</p>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-50">
          Controle as faltas. Evite a DP.
        </h1>
        <form onSubmit={onSubmit} className="mt-8 space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5">
          <label className="block text-sm text-zinc-300">
            E-mail
            <input
              required
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none focus:border-emerald-500"
            />
          </label>
          <label className="block text-sm text-zinc-300">
            Senha
            <input
              required
              minLength={6}
              type="password"
              autoComplete={modo === 'entrar' ? 'current-password' : 'new-password'}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none focus:border-emerald-500"
            />
          </label>
          {erro && <p className="text-sm text-rose-400">{erro}</p>}
          {info && <p className="text-sm text-emerald-400">{info}</p>}
          <button
            type="submit"
            disabled={enviando}
            className="w-full rounded-xl bg-emerald-500 px-4 py-2.5 font-medium text-zinc-950 hover:bg-emerald-400 disabled:opacity-60"
          >
            {enviando ? 'Aguarde…' : modo === 'entrar' ? 'Entrar' : 'Criar conta'}
          </button>
        </form>

        <div className="mt-4">
          <button
            type="button"
            onClick={onGoogle}
            disabled={enviando}
            aria-label="Entrar com Google"
            className="w-full flex items-center justify-center gap-3 rounded-xl border border-zinc-700 bg-white/5 px-4 py-2 text-sm text-zinc-100 hover:bg-white/10 disabled:opacity-60"
          >
            {enviando ? (
              <>
                <svg className="h-4 w-4 animate-spin text-zinc-100" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Aguarde…
              </>
            ) : (
              <>
                <svg className="h-5 w-5" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path fill="#4285F4" d="M533.5 278.4c0-17.9-1.6-35.3-4.6-52.1H272v98.6h146.9c-6.3 34-25 62.8-53.4 82.2v68.2h86.3c50.4-46.5 81.7-114.8 81.7-196.9z"/>
                  <path fill="#34A853" d="M272 544.3c72.9 0 134.2-24.2 178.9-65.9l-86.3-68.2c-24 16.1-54.6 25.6-92.6 25.6-71 0-131.3-47.9-152.7-112.1H31.5v70.6C75.6 488.5 168 544.3 272 544.3z"/>
                  <path fill="#FBBC05" d="M119.3 324.1c-9.7-28.7-9.7-59.5 0-88.2V165.3H31.5c-38.9 77.8-38.9 169.1 0 246.9l87.8-88.1z"/>
                  <path fill="#EA4335" d="M272 107.7c39.6 0 75.3 13.6 103.4 40.2l77.5-77.5C405.3 24.1 344 0 272 0 168 0 75.6 55.8 31.5 138.4l87.8 70.6C140.7 155.6 201 107.7 272 107.7z"/>
                </svg>
                Entrar com Google
              </>
            )}
          </button>
        </div>

        <button
          type="button"
          className="mt-4 text-sm text-zinc-400 hover:text-zinc-200"
          onClick={() => {
            setModo(modo === 'entrar' ? 'criar' : 'entrar')
            setErro(null)
            setInfo(null)
          }}
        >
          {modo === 'entrar' ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entrar'}
        </button>
      </div>
    </div>
  )
}
