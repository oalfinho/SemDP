import { DIAS_SEMANA } from '../lib/datas'
import type { Disciplina } from '../types'

type Props = { disciplinas: Disciplina[]; onAdd: (dia: number) => void }

export function GradeSemana({ disciplinas, onAdd }: Props) {
  const hoje = new Date().getDay()
  return (
    <section className="mt-8" aria-labelledby="grade-title">
      <div className="mb-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">Sua semana</p>
        <h2 id="grade-title" className="mt-1 text-xl font-semibold text-zinc-50">Grade semanal</h2>
        <p className="mt-1 text-xs text-zinc-500">Os dias organizam sua rotina e não alteram o limite de faltas.</p>
      </div>
      <div className="flex snap-x gap-3 overflow-x-auto pb-3 md:grid md:grid-cols-2 md:overflow-visible xl:grid-cols-3">
        {DIAS_SEMANA.map((dia) => {
          const itens = disciplinas.filter((disciplina) => disciplina.dias.some((item) => item.dia_semana === dia.value))
          return (
            <article key={dia.value} className={`min-w-[82vw] snap-center rounded-3xl border p-4 md:min-w-0 ${hoje === dia.value ? 'border-emerald-400/60 bg-emerald-400/[0.08]' : 'border-zinc-800 bg-zinc-900/60'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><h3 className="font-semibold text-zinc-100">{dia.label}</h3>{hoje === dia.value && <span className="rounded-full bg-emerald-400 px-2 py-0.5 text-[10px] font-bold uppercase text-zinc-950">Hoje</span>}</div>
                <button type="button" onClick={() => onAdd(dia.value)} className="text-xs text-emerald-400 hover:text-emerald-300">+ associar</button>
              </div>
              <ul className="mt-3 space-y-2">
                {itens.length === 0 && <li className="text-sm text-zinc-600">Nenhuma aula</li>}
                {itens.map((disciplina) => <li key={disciplina.id} className="rounded-2xl border border-white/[0.06] bg-zinc-950/70 px-3.5 py-3 text-sm font-medium text-zinc-100">{disciplina.nome}</li>)}
              </ul>
            </article>
          )
        })}
      </div>
    </section>
  )
}
