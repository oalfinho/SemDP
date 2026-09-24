import { mapaFeriados } from './feriados'
import { parseISODate, toISODate } from './datas'
import type { DiaAula, DiaSemAula } from '../types'

function cadaDia(inicioIso: string, fimIso: string) {
  const dias: string[] = []
  const cursor = parseISODate(inicioIso)
  const fim = parseISODate(fimIso)

  while (cursor <= fim) {
    dias.push(toISODate(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }
  return dias
}

/** Datas válidas para registro de falta; não determina o total oficial de aulas. */
export function datasDeAula(
  inicio: string,
  fim: string,
  dias: DiaAula[],
  extras: DiaSemAula[],
) {
  const feriados = mapaFeriados(inicio, fim)
  const recessos = new Set(extras.map((item) => item.data))
  const diasSemana = new Set(dias.map((item) => item.dia_semana))

  return cadaDia(inicio, fim).filter((data) => {
    const diaSemana = parseISODate(data).getDay()
    return diasSemana.has(diaSemana) && !feriados.has(data) && !recessos.has(data)
  })
}
