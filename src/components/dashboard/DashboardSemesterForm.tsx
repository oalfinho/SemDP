import type { SubmitEvent } from 'react'

const inputClass =
  'mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none focus:border-emerald-500'

interface DashboardSemesterFormProps {
  inicio: string
  fim: string
  onInicioChange: (value: string) => void
  onFimChange: (value: string) => void
  semestre: any
  resumo: any
  onSubmit: (e: SubmitEvent<HTMLFormElement>) => Promise<void>
}

export function DashboardSemesterForm({
  inicio,
  fim,
  onInicioChange,
  onFimChange,
  semestre,
  resumo,
  onSubmit,
}: DashboardSemesterFormProps) {
  return (
     <form
            onSubmit={onSubmit}
            className="mt-6 flex flex-wrap items-end gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4"
          >
            <label className="text-sm text-zinc-300">
              Início do semestre
              <input
                type="date"
                required
                value={inicio}
                onChange={(e) => onInicioChange(e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="text-sm text-zinc-300">
              Fim do semestre
              <input
                type="date"
                required
                value={fim}
                onChange={(e) => onFimChange(e.target.value)}
                className={inputClass}
              />
            </label>
            <button
              type="submit"
              className="rounded-xl bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-white"
            >
              {semestre ? 'Atualizar período' : 'Definir semestre'}
            </button>
            {resumo && (
              <p className="text-sm text-zinc-400">
                {resumo.previstas.length} aula{resumo.previstas.length === 1 ? '' : 's'} no calendário ·{' '}
                {resumo.puladas.length} pulada{resumo.puladas.length === 1 ? '' : 's'} por feriado/recesso
              </p>
            )}
          </form>
  )
}