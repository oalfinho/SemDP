import type { DiaSemAula, Horario, Semestre } from '../types'
import { addDays, normalizarData, parseISODate } from './datas'
import { mapaFeriados } from './feriados'

export type Encontro = {
  id: string
  data: string
  horarioId: string
  disciplinaId: string
  horaInicio: string
  horaFim: string
  aulas: number
  motivo: string | null
}

/** Um registro por encontro; aulas é a quantidade de unidades de frequência. */
export function criarCalendario(
  semestre: Semestre,
  horarios: Horario[],
  recessos: DiaSemAula[],
): Encontro[] {
  const inicio = normalizarData(semestre.inicio)
  const fim = normalizarData(semestre.fim)
  if (fim < inicio) throw new Error('Período acadêmico inválido.')
  const feriados = semestre.ignorar_feriados ? mapaFeriados(inicio, fim) : new Map<string, string>()
  const extras = new Map(
    recessos
      .filter((item) => item.semestre_id === semestre.id)
      .map((item) => [normalizarData(item.data), item.motivo || 'Recesso']),
  )
  const encontros: Encontro[] = []
  let dias = 0
  for (let data = inicio; data <= fim; data = addDays(data, 1)) {
    if (++dias > 732) throw new Error('Período acadêmico muito longo.')
    const diaSemana = parseISODate(data).getDay()
    for (const horario of horarios) {
      if (horario.dia_semana !== diaSemana || horario.aulas <= 0) continue
      if (horario.vigencia_inicio && data < normalizarData(horario.vigencia_inicio)) continue
      if (horario.vigencia_fim && data > normalizarData(horario.vigencia_fim)) continue
      encontros.push({
        id: `${horario.id}:${data}`,
        data,
        horarioId: horario.id,
        disciplinaId: horario.disciplina_id,
        horaInicio: horario.hora_inicio,
        horaFim: horario.hora_fim,
        aulas: horario.aulas,
        motivo: extras.get(data) ?? feriados.get(data) ?? null,
      })
    }
  }
  return encontros.sort(
    (a, b) => a.data.localeCompare(b.data) || a.horaInicio.localeCompare(b.horaInicio),
  )
}
