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
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-emerald-400">SemDP</p>
        <h1 className="text-2xl font-semibold text-zinc-50">
          Grade e faltas
        </h1>
        <p className="text-sm text-zinc-500">{email}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onNovaDisciplina}
          className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-emerald-400"
        >
          Nova disciplina
        </button>

        <button
          type="button"
          onClick={onLogout}
          className="rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
        >
          Sair
        </button>
      </div>
    </header>
  )
}