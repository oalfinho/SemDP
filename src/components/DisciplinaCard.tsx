import { limiteFaltas, statusFaltas } from '../lib/calculo'
import { formatarData, nomeDia } from '../lib/datas'
import type { Disciplina } from '../types'

const estilos = { ok: 'border-zinc-800', alerta: 'border-amber-500/50', limite: 'border-orange-500/70', dp: 'border-rose-500/80' } as const
const rotulos = { ok: 'Dentro do limite', alerta: 'Quase no limite', limite: 'Sem faltas restantes', dp: 'Limite ultrapassado' } as const

type Props = { disciplina: Disciplina; onAddFalta: () => void; onEditDias: () => void; onDelete: () => void; onDeleteFalta: (id: string) => void }

export function DisciplinaCard({ disciplina, onAddFalta, onEditDias, onDelete, onDeleteFalta }: Props) {
  const total = disciplina.total_aulas ?? 0
  const usadas = disciplina.faltas.reduce((acc, falta) => acc + falta.quantidade, 0)
  const limite = limiteFaltas(total, disciplina.percentual_presenca)
  const restantes = Math.max(0, limite - usadas)
  const status = statusFaltas(usadas, limite)
  const pct = limite === 0 ? (usadas > 0 ? 100 : 0) : Math.min(100, (usadas / limite) * 100)
  const barra = status === 'dp' ? 'bg-rose-500' : status === 'limite' ? 'bg-orange-400' : status === 'alerta' ? 'bg-amber-400' : 'bg-emerald-400'
  const dias = [...(disciplina.dias ?? [])].sort((a, b) => a.dia_semana - b.dia_semana)
  const faltas = [...disciplina.faltas].sort((a, b) => b.data.localeCompare(a.data))

  return (
    <article className={`flex flex-col rounded-2xl border bg-gradient-to-b from-zinc-900 to-zinc-950 p-5 ${estilos[status]}`}>
      <div className="flex items-start justify-between gap-3">
        <div><h2 className="text-lg font-semibold text-zinc-50">{disciplina.nome}</h2><p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-zinc-500">{total === 0 ? 'Informe o total de aulas' : rotulos[status]}</p></div>
        <button type="button" onClick={onDelete} className="rounded-lg border border-zinc-800 px-2 py-1 text-[11px] text-zinc-400 hover:text-rose-300">Excluir</button>
      </div>
      <p className="mt-4 text-sm text-zinc-400"><span className="text-zinc-500">Dias:</span> {dias.length ? dias.map((dia) => nomeDia(dia.dia_semana)).join(' • ') : 'Nenhum dia associado'}</p>
      <p className="mt-1 text-sm text-zinc-400">Presença mínima: <span className="text-zinc-200">{disciplina.percentual_presenca}%</span></p>
      <dl className="mt-4 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
        {[['No semestre', total], ['Limite', limite], ['Usadas', usadas], ['Restam', restantes]].map(([label, value]) => <div key={label} className="rounded-xl border border-zinc-800 bg-zinc-950/80 px-2 py-3"><dt className="text-[11px] text-zinc-500">{label}</dt><dd className={`mt-1 text-xl font-semibold ${label === 'Restam' ? 'text-emerald-400' : 'text-zinc-50'}`}>{value}</dd></div>)}
      </dl>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-800"><div className={`h-full rounded-full ${barra}`} style={{ width: `${pct}%` }} /></div>
      <div className="mt-4 flex gap-2"><button type="button" onClick={onAddFalta} className="flex-1 rounded-xl bg-emerald-500 px-3 py-2 text-sm font-semibold text-zinc-950">+ Registrar falta</button><button type="button" onClick={onEditDias} className="flex-1 rounded-xl border border-zinc-700 px-3 py-2 text-sm text-zinc-200">Editar dias</button></div>
      <ul className="mt-4 max-h-40 space-y-2 overflow-auto text-sm">
        {faltas.length === 0 && <li className="rounded-xl border border-dashed border-zinc-700 px-3 py-2 text-zinc-500">Nenhuma falta registrada.</li>}
        {faltas.map((falta) => <li key={falta.id} className="flex items-center justify-between gap-2 rounded-xl border border-zinc-800 bg-zinc-950/60 px-3 py-2"><span className="text-zinc-300">{formatarData(falta.data)} · {falta.quantidade} aula{falta.quantidade > 1 ? 's' : ''}{falta.observacao ? ` · ${falta.observacao}` : ''}</span><button type="button" className="text-[11px] text-zinc-500 hover:text-rose-300" onClick={() => onDeleteFalta(falta.id)}>Tirar</button></li>)}
      </ul>
    </article>
  )
}
