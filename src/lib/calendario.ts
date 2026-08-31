import { mapaFeriados } from './feriados'
import { parseISODate, toISODate } from './datas'
import type { DiaSemAula, Horario } from '../types'

export type AulaPrevista = {
  data: string
  horarioId: string
  disciplinaId: string
  diaSemana: number
  horaInicio: string
  horaFim: string
}

export type AulaPulado = AulaPrevista & { motivo: string }

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

export function expandirSemestre(
  inicio: string,
  fim: string,
  horarios: Horario[],
  extras: DiaSemAula[],
) {
  const feriados = mapaFeriados(inicio, fim)
  const extraMap = new Map(extras.map((d) => [d.data, d.motivo || 'Recesso']))
  const previstas: AulaPrevista[] = []
  const puladas: AulaPulado[] = []

  for (const data of cadaDia(inicio, fim)) {
    const diaSemana = parseISODate(data).getDay()
    const doDia = horarios.filter((h) => h.dia_semana === diaSemana)
    if (doDia.length === 0) continue

    const motivo = feriados.get(data) ?? extraMap.get(data)
    for (const h of doDia) {
      const aula: AulaPrevista = {
        data,
        horarioId: h.id,
        disciplinaId: h.disciplina_id,
        diaSemana: h.dia_semana,
        horaInicio: h.hora_inicio,
        horaFim: h.hora_fim,
      }
      if (motivo) puladas.push({ ...aula, motivo })
      else previstas.push(aula)
    }
  }

  return { previstas, puladas, feriados }
}

export function aulasDaDisciplina(
  disciplinaId: string,
  inicio: string,
  fim: string,
  horarios: Horario[],
  extras: DiaSemAula[],
) {
  const daDisc = horarios.filter((h) => h.disciplina_id === disciplinaId)
  return expandirSemestre(inicio, fim, daDisc, extras)
}
