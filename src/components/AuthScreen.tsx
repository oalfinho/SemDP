import { useState, type FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'

export function AuthScreen() {
  const { signIn, signUp } = useAuth()
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
