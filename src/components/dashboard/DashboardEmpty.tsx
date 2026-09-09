export function DashboardEmpty() {
  return (
    <div className="mt-4 rounded-2xl border border-dashed border-zinc-800 px-6 py-16 text-center">
      <p className="text-zinc-300">
        Nenhuma disciplina ainda.
      </p>

      <p className="mt-1 text-sm text-zinc-500">
        Cadastre uma disciplina para começar a acompanhar presença.
      </p>
    </div>
  )
}