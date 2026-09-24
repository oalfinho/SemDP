import { aulasDaDisciplina } from '../lib/calendario'
import { calcularAulasPorHorario, limiteFaltas } from '../lib/calculo'
import { DIAS_SEMANA, formatarHora } from '../lib/datas'
import type { DiaSemAula, Disciplina, Horario, Semestre } from '../types'

type Props = {
  disciplinas: Disciplina[]
  semestre: Semestre | null
  extras: DiaSemAula[]
  onAdd: (dia: number) => void
}

export function GradeSemana({ disciplinas, semestre, extras, onAdd }: Props) {
  const hoje = new Date().getDay()
  const horarios: (Horario & { disciplina: Disciplina })[] = disciplinas.flatMap((disciplina) =>
    disciplina.horarios.map((horario) => ({ ...horario, disciplina })),
  )

  return (
    <section className="mt-8" aria-labelledby="grade-title">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">Sua semana</p>
          <h2 id="grade-title" className="mt-1 text-xl font-semibold text-zinc-50">Quanto ainda posso faltar?</h2>
        </div>
        <p className="hidden text-xs text-zinc-500 sm:block">Cálculo automático por dia de aula</p>
      </div>
      <div className="flex snap-x gap-3 overflow-x-auto pb-3 md:grid md:grid-cols-2 md:overflow-visible xl:grid-cols-3">
        {DIAS_SEMANA.map((dia) => {
          const itens = horarios
            .filter((h) => h.dia_semana === dia.value)
            .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio))
          return (
            <article key={dia.value} className={`min-w-[82vw] snap-center rounded-3xl border p-4 md:min-w-0 ${hoje === dia.value ? 'border-emerald-400/60 bg-emerald-400/[0.08] shadow-[0_0_30px_rgba(52,211,153,0.08)]' : 'border-zinc-800 bg-zinc-900/60'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-zinc-100">{dia.label}</h3>
                  {hoje === dia.value && <span className="rounded-full bg-emerald-400 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-zinc-950">Hoje</span>}
                </div>
                <button
                  type="button"
                  onClick={() => onAdd(dia.value)}
                  className="text-xs text-emerald-400 hover:text-emerald-300"
                >
                  + aula
                </button>
              </div>
              <ul className="mt-3 space-y-2">
                {itens.length === 0 && <li className="text-sm text-zinc-600">Sem aulas</li>}
                {itens.map((h) => {
                  const total = semestre
                    ? aulasDaDisciplina(h.disciplina.id, semestre.inicio, semestre.fim, h.disciplina.horarios, extras).previstas.length
                    : h.disciplina.total_aulas
                  const usadas = h.disciplina.faltas.reduce((soma, falta) => soma + falta.quantidade, 0)
                  const restantes = Math.max(0, limiteFaltas(total, h.disciplina.percentual_presenca) - usadas)
                  const aulasNoEncontro = Math.max(1, calcularAulasPorHorario(h.hora_inicio, h.hora_fim))
                  const diasRestantes = Math.floor(restantes / aulasNoEncontro)

                  return (
                    <li key={h.id} className="rounded-2xl border border-white/[0.06] bg-zinc-950/70 px-3.5 py-3 text-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-zinc-100">{h.disciplina.nome}</p>
                          <p className="mt-0.5 text-xs text-zinc-500">{formatarHora(h.hora_inicio)} às {formatarHora(h.hora_fim)}</p>
                        </div>
                        <div className="text-right">
                          <strong className={`block text-xl leading-none ${diasRestantes <= 1 ? 'text-amber-300' : 'text-emerald-300'}`}>{diasRestantes}</strong>
                          <span className="text-[10px] text-zinc-500">{diasRestantes === 1 ? 'vez' : 'vezes'}</span>
                        </div>
                      </div>
                      <p className="mt-2 border-t border-zinc-800 pt-2 text-xs text-zinc-400">
                        Você ainda pode faltar {diasRestantes} {diasRestantes === 1 ? 'dia' : 'dias'} inteiro{diasRestantes === 1 ? '' : 's'} nesta aula.
                      </p>
                    </li>
                  )
                })}
              </ul>
            </article>
          )
        })}
      </div>
    </section>
  )
}
