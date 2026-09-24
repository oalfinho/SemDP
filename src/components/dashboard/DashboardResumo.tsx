import { limiteFaltas, statusFaltas } from '../../lib/calculo'
import type { Disciplina } from '../../types'

type Props = { disciplinas: Disciplina[] }

export function DashboardResumo({ disciplinas }: Props) {
  const dados = disciplinas.map((disciplina) => {
    const usadas = disciplina.faltas.reduce((soma, falta) => soma + falta.quantidade, 0)
    const limite = limiteFaltas(disciplina.total_aulas ?? 0, disciplina.percentual_presenca)
    return { disciplina, usadas, limite, status: statusFaltas(usadas, limite) }
  })
  const aulas = disciplinas.reduce((soma, disciplina) => soma + (disciplina.total_aulas ?? 0), 0)
  const usadas = dados.reduce((soma, item) => soma + item.usadas, 0)
  const emRisco = dados.filter((item) => item.disciplina.total_aulas > 0 && item.status !== 'ok').length
  const indicadores = [['Disciplinas', disciplinas.length], ['Aulas', aulas], ['Faltas usadas', usadas], ['Em risco', emRisco]]

  return <section className="mt-6" aria-labelledby="resumo-title"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">Visão geral</p><h2 id="resumo-title" className="mt-1 text-2xl font-semibold text-zinc-50">Como está sua frequência?</h2></div><dl className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">{indicadores.map(([label, value]) => <div key={label} className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4"><dt className="text-xs uppercase tracking-wider text-zinc-500">{label}</dt><dd className={`mt-2 text-3xl font-bold ${label === 'Em risco' && Number(value) > 0 ? 'text-amber-300' : 'text-zinc-50'}`}>{value}</dd></div>)}</dl>{dados.length > 0 && <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4"><h3 className="font-semibold text-zinc-100">Situação das disciplinas</h3><div className="mt-4 grid gap-4 md:grid-cols-2">{dados.map(({ disciplina, usadas, limite, status }) => { const pct = limite === 0 ? (usadas ? 100 : 0) : Math.min(100, usadas / limite * 100); const cor = status === 'dp' ? 'bg-rose-500' : status === 'limite' ? 'bg-orange-400' : status === 'alerta' ? 'bg-amber-400' : 'bg-emerald-400'; return <div key={disciplina.id}><div className="flex justify-between gap-3 text-sm"><span className="font-medium text-zinc-200">{disciplina.nome}</span><span className={status === 'ok' ? 'text-zinc-400' : 'text-amber-300'}>{usadas} / {limite} faltas</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-800"><div className={`h-full rounded-full ${cor}`} style={{ width: `${pct}%` }} /></div></div>})}</div></div>}</section>
}
