export function toISODate(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${day}-${m}-${y}`
}

export function parseISODate(iso: string) {
  const parts = iso.split('-').map(Number)
  if (parts.length !== 3) return new Date(iso)

  // Support both `dd-mm-yyyy` and `yyyy-mm-dd` formats.
  let d: number, m: number, y: number
  if (parts[0] > 31) {
    // assume `yyyy-mm-dd`
    y = parts[0]
    m = parts[1]
    d = parts[2]
  } else {
    // assume `dd-mm-yyyy` (legacy in this project)
    d = parts[0]
    m = parts[1]
    y = parts[2]
  }

  // Guard against two-digit years (e.g. "02" -> 1902). Interpret 0-99 as 2000-2099.
  if (y >= 0 && y < 100) y += 2000

  return new Date(y, m - 1, d)
}

export function count50MinAulas(horaInicio: string, horaFim: string) {
  const parseMin = (h: string) => {
    const [hh, mm] = h.slice(0, 5).split(':').map(Number)
    return (hh || 0) * 60 + (mm || 0)
  }
  const start = parseMin(horaInicio)
  const end = parseMin(horaFim)
  const diff = Math.max(0, end - start)
  return Math.floor(diff / 50)
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
