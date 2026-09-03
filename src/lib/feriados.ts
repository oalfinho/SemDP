import { addDays, parseISODate, toISODate } from './datas'

/** Páscoa no calendário gregoriano (algoritmo anônimo). */
export function pascoa(ano: number) {
  const a = ano % 19
  const b = Math.floor(ano / 100)
  const c = ano % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 16)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const mes = Math.floor((h + l - 7 * m + 114) / 31)
  const dia = ((h + l - 7 * m + 114) % 31) + 1
  return toISODate(new Date(ano, mes - 1, dia))
}

function fixo(ano: number, mes: number, dia: number, nome: string) {
  return { data: toISODate(new Date(ano, mes - 1, dia)), nome }
}

// Feriados nacionais + pontos móveis em que normalmente não há aula.
export function feriadosBrasil(ano: number) {
  const easter = pascoa(ano)
  return [
    fixo(ano, 1, 1, 'Confraternização Universal'),
    { data: addDays(easter, -48), nome: 'Carnaval' },
    { data: addDays(easter, -47), nome: 'Carnaval' },
    { data: addDays(easter, -46), nome: 'Quarta-feira de Cinzas' },
    { data: addDays(easter, -2), nome: 'Sexta-feira Santa' },
    fixo(ano, 4, 21, 'Tiradentes'),
    fixo(ano, 5, 1, 'Dia do Trabalho'),
    { data: addDays(easter, 60), nome: 'Corpus Christi' },
    fixo(ano, 9, 7, 'Independência do Brasil'),
    fixo(ano, 10, 12, 'Nossa Senhora Aparecida'),
    fixo(ano, 11, 2, 'Finados'),
    fixo(ano, 11, 15, 'Proclamação da República'),
    fixo(ano, 11, 20, 'Consciência Negra'),
    fixo(ano, 12, 25, 'Natal'),
  ]
}

export function mapaFeriados(inicioIso: string, fimIso: string) {
  const inicio = parseISODate(inicioIso)
  const fim = parseISODate(fimIso)
  const map = new Map<string, string>()
  for (let ano = inicio.getFullYear(); ano <= fim.getFullYear(); ano++) {
    for (const f of feriadosBrasil(ano)) {
      const fDate = parseISODate(f.data)
      if (fDate >= inicio && fDate <= fim) map.set(f.data, f.nome)
    }
  }
  return map
}

export function proximoFeriado(inicioIso: string, fimIso: string) {
  const hoje = new Date(2026, 8, 7)
  const feriados = [...mapaFeriados(inicioIso, fimIso).entries()]
    .map(([data, nome]) => ({ data, nome, dataDate: parseISODate(data) }))
    .filter(({ dataDate }) => dataDate >= hoje)
    .sort((a, b) => a.dataDate.getTime() - b.dataDate.getTime())

  return feriados[0] ?? null
}
