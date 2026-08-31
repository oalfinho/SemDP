import { DIAS_SEMANA, formatarHora } from '../lib/datas'
import type { Disciplina, Horario } from '../types'

type Props = {
  disciplinas: Disciplina[]
  onAdd: (dia: number) => void
}

export function GradeSemana({ disciplinas, onAdd }: Props) {
  const horarios: (Horario & { nome: string })[] = disciplinas.flatMap((d) =>
    d.horarios.map((h) => ({ ...h, nome: d.nome })),
  )

  return (
    <section className="mt-8">
      <div className="mb-3 flex items-end justify-between gap-3">
        <h2 className="text-lg font-semibold text-zinc-50">Grade da semana</h2>
        <p className="text-xs text-zinc-500">Aulas só por dia da semana. O calendário conta o semestre.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {DIAS_SEMANA.map((dia) => {
          const itens = horarios
            .filter((h) => h.dia_semana === dia.value)
            .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio))
          return (
            <div key={dia.value} className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-zinc-100">{dia.label}</h3>
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
                {itens.map((h) => (
                  <li key={h.id} className="rounded-xl bg-zinc-950/70 px-3 py-2 text-sm">
                    <p className="font-medium text-zinc-100">{h.nome}</p>
                    <p className="text-zinc-400">
                      {formatarHora(h.hora_inicio)} às {formatarHora(h.hora_fim)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
    </section>
  )
}
