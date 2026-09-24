interface DashboardHeaderProps {
  email?: string | null
  onNovaDisciplina: () => void
  onLogout: () => void
}

export function DashboardHeader({
  email,
  onNovaDisciplina,
  onLogout,
}: DashboardHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-bold tracking-tight text-emerald-400">SemDP<span className="text-zinc-600">.</span></p>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">
          Olá, estudante 👋
        </h1>
        <p className="text-sm text-zinc-500">{email}</p>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onNovaDisciplina}
          className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-emerald-400"
        >
          <span className="sm:hidden">+ Disciplina</span><span className="hidden sm:inline">Nova disciplina</span>
        </button>

        <button
          type="button"
          onClick={onLogout}
          className="hidden rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 sm:block"
        >
          Sair
        </button>
      </div>
    </header>
  )
}
