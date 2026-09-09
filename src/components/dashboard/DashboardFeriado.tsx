import { formatarData } from '../../lib/datas'

interface DashboardFeriadoProps {
  nome: string
  data: string
  feriadoHoje: boolean
}

export function DashboardFeriado({
  nome,
  data,
  feriadoHoje,
}: DashboardFeriadoProps) {
  return (
    <div className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
      <p className="text-[10px] uppercase tracking-[0.2em] text-amber-300">
        {feriadoHoje ? 'Hoje' : 'Próximo feriado'}
      </p>

      <p className="mt-1 text-sm font-medium text-amber-100">
        {formatarData(data)} · {nome}
      </p>
    </div>
  )
}