import { aulasDaDisciplina } from '../lib/calendario'
import { limiteFaltas, statusFaltas } from '../lib/calculo'
import { formatarData, formatarHora, nomeDia } from '../lib/datas'
import type { DiaSemAula, Disciplina, Semestre } from '../types'

const estilos = {
  ok: 'border-zinc-800',
  alerta: 'border-amber-500/50',
  limite: 'border-orange-500/70',
  dp: 'border-rose-500/80',
} as const

const rotulos = {
  ok: 'Dentro do limite',
  alerta: 'Quase no limite',
  limite: 'Sem faltas restantes',
  dp: 'Risco de DP',
} as const

type Props = {
  disciplina: Disciplina
  semestre: Semestre | null
  extras: DiaSemAula[]
  onAddFalta: () => void
  onAddHorario: () => void
  onDelete: () => void
  onDeleteFalta: (id: string) => void
  onDeleteHorario: (id: string) => void
}

export function DisciplinaCard({
  disciplina,
  semestre,
  extras,
  onAddFalta,
  onAddHorario,
  onDelete,
  onDeleteFalta,
  onDeleteHorario,
}: Props) {
  const calc = semestre
    ? aulasDaDisciplina(disciplina.id, semestre.inicio, semestre.fim, disciplina.horarios, extras)
    : { previstas: [], puladas: [] }

  const total = calc.previstas.length
  const usadas = disciplina.faltas.reduce((acc, f) => acc + f.quantidade, 0)
  const limite = limiteFaltas(total, disciplina.percentual_presenca)
  const restantes = limite - usadas
  const status = statusFaltas(usadas, limite)
  const pct = limite === 0 ? (usadas > 0 ? 100 : 0) : Math.min(100, (usadas / limite) * 100)

  const barra =
    status === 'dp'
      ? 'bg-rose-500'
      : status === 'limite'
        ? 'bg-orange-400'
        : status === 'alerta'
          ? 'bg-amber-400'
          : 'bg-emerald-400'

  const horarios = [...disciplina.horarios].sort(
    (a, b) => a.dia_semana - b.dia_semana || a.hora_inicio.localeCompare(b.hora_inicio),
  )
  const faltasOrdenadas = [...disciplina.faltas].sort((a, b) => b.data.localeCompare(a.data))

  return (
    <article className={`flex flex-col rounded-2xl border bg-zinc-900/70 p-5 ${estilos[status]}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-zinc-50">{disciplina.nome}</h2>
          <p className="mt-1 text-xs uppercase tracking-wide text-zinc-500">
            {total === 0 ? 'Sem aulas no calendário' : rotulos[status]}
          </p>
        </div>
        <button type="button" onClick={onDelete} className="text-xs text-zinc-500 hover:text-rose-400">
          Excluir
        </button>
      </div>

      <ul className="mt-3 space-y-1 text-sm text-zinc-300">
        {horarios.length === 0 && (
          <li className="text-zinc-500">Cadastre o dia da semana e o horário.</li>
        )}
        {horarios.map((h) => (
          <li key={h.id} className="flex items-center justify-between gap-2">
            <span>
              {nomeDia(h.dia_semana)} · {formatarHora(h.hora_inicio)} às {formatarHora(h.hora_fim)}
            </span>
            <button
              type="button"
              className="text-xs text-zinc-500 hover:text-rose-400"
              onClick={() => onDeleteHorario(h.id)}
            >
              Tirar
            </button>
          </li>
        ))}
      </ul>

      <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-zinc-950/80 px-2 py-3">
          <dt className="text-[11px] text-zinc-500">No semestre</dt>
          <dd className="text-xl font-semibold text-zinc-50">{total}</dd>
        </div>
        <div className="rounded-xl bg-zinc-950/80 px-2 py-3">
          <dt className="text-[11px] text-zinc-500">Limite</dt>
          <dd className="text-xl font-semibold text-zinc-50">{limite}</dd>
        </div>
        <div className="rounded-xl bg-zinc-950/80 px-2 py-3">
          <dt className="text-[11px] text-zinc-500">Restam</dt>
          <dd className={`text-xl font-semibold ${restantes < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {restantes}
          </dd>
        </div>
      </dl>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-800">
        <div className={`h-full rounded-full ${barra}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-2 text-xs text-zinc-500">
        {usadas} falta{usadas === 1 ? '' : 's'} · {calc.puladas.length} encontro
        {calc.puladas.length === 1 ? '' : 's'} em feriado/recesso · {disciplina.percentual_presenca}%
        de presença
      </p>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={onAddHorario}
          className="flex-1 rounded-xl border border-zinc-700 px-3 py-2 text-sm text-zinc-200 hover:border-emerald-500 hover:text-emerald-300"
        >
          Horário
        </button>
        <button
          type="button"
          onClick={onAddFalta}
          className="flex-1 rounded-xl border border-zinc-700 px-3 py-2 text-sm text-zinc-200 hover:border-emerald-500 hover:text-emerald-300"
        >
          Falta
        </button>
      </div>

      <ul className="mt-4 max-h-40 space-y-2 overflow-auto text-sm">
        {faltasOrdenadas.length === 0 && <li className="text-zinc-500">Nenhuma falta registrada.</li>}
        {faltasOrdenadas.map((falta) => (
          <li
            key={falta.id}
            className="flex items-center justify-between gap-2 rounded-lg bg-zinc-950/60 px-3 py-2"
          >
            <span className="text-zinc-300">
              {formatarData(falta.data)} · {falta.quantidade} aula{falta.quantidade > 1 ? 's' : ''}
              {falta.observacao ? ` · ${falta.observacao}` : ''}
            </span>
            <button
              type="button"
              className="shrink-0 text-xs text-zinc-500 hover:text-rose-400"
              onClick={() => onDeleteFalta(falta.id)}
            >
              Tirar
            </button>
          </li>
        ))}
      </ul>
    </article>
  )
}
