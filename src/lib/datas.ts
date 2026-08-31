export function toISODate(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${day}-${m}-${y}`
}

export function parseISODate(iso: string) {
  const [d, m, y] = iso.split('-').map(Number)
  return new Date(d, m - 1, y)
}

export function addDays(iso: string, days: number) {
  const d = parseISODate(iso)
  d.setDate(d.getDate() + days)
  return toISODate(d)
}

export function hojeLocal() {
  return toISODate(new Date())
}

export function formatarData(iso: string) {
  return parseISODate(iso).toLocaleDateString('pt-BR')
}

export function formatarHora(hora: string) {
  return hora.slice(0, 5)
}

export const DIAS_SEMANA = [
  { value: 1, label: 'Segunda-feira', curto: 'Seg' },
  { value: 2, label: 'Terça-feira', curto: 'Ter' },
  { value: 3, label: 'Quarta-feira', curto: 'Qua' },
  { value: 4, label: 'Quinta-feira', curto: 'Qui' },
  { value: 5, label: 'Sexta-feira', curto: 'Sex' },
  { value: 6, label: 'Sábado', curto: 'Sáb' },
] as const

export function nomeDia(diaSemana: number) {
  return DIAS_SEMANA.find((d) => d.value === diaSemana)?.label ?? 'Domingo'
}
