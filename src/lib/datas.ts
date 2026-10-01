/** Datas acadêmicas são dias locais, sem conversão para UTC. */
export function toISODate(date: Date): string {
  if (Number.isNaN(date.getTime())) throw new Error('Data inválida.')
  const year = String(date.getFullYear()).padStart(4, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** Aceita o formato canônico e DD-MM-AAAA dos registros antigos. */
export function parseISODate(value: string): Date {
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  const legacy = /^(\d{2})-(\d{2})-(\d{4})$/.exec(value)
  if (!iso && !legacy) throw new Error(`Data inválida: ${value || 'vazia'}.`)
  const [year, month, day] = iso
    ? [Number(iso[1]), Number(iso[2]), Number(iso[3])]
    : [Number(legacy![3]), Number(legacy![2]), Number(legacy![1])]
  const date = new Date(year, month - 1, day)
  if (
    year < 1000 ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    throw new Error(`Data inexistente: ${value}.`)
  }
  return date
}

export function normalizarData(value: string): string {
  return toISODate(parseISODate(value))
}

export function addDays(value: string, days: number): string {
  const date = parseISODate(value)
  date.setDate(date.getDate() + days)
  return toISODate(date)
}

export function hojeLocal(): string {
  return toISODate(new Date())
}
export function formatarData(value: string): string {
  return parseISODate(value).toLocaleDateString('pt-BR')
}
export function formatarHora(value: string): string {
  return value.slice(0, 5)
}

export const DIAS_SEMANA = [
  { value: 1, label: 'Segunda-feira', curto: 'Seg' },
  { value: 2, label: 'Terça-feira', curto: 'Ter' },
  { value: 3, label: 'Quarta-feira', curto: 'Qua' },
  { value: 4, label: 'Quinta-feira', curto: 'Qui' },
  { value: 5, label: 'Sexta-feira', curto: 'Sex' },
  { value: 6, label: 'Sábado', curto: 'Sáb' },
  { value: 0, label: 'Domingo', curto: 'Dom' },
] as const
export function nomeDia(day: number): string {
  return DIAS_SEMANA.find((item) => item.value === day)?.label ?? ''
}
