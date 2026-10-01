import { normalizarData } from '../lib/datas'
import type { DisciplinaInput, HorarioInput, SemestreInput } from '../types'

export function exigirInteiro(value: number, min: number, max: number, label: string): void {
  if (!Number.isInteger(value) || value < min || value > max)
    throw new Error(`${label}: informe um inteiro entre ${min} e ${max}.`)
}
export function minutosDoHorario(value: string): number {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) throw new Error('Horário inválido. Use HH:MM.')
  const [hours, minutes] = value.split(':').map(Number)
  return hours * 60 + minutes
}
export function validarSemestre(input: SemestreInput): SemestreInput {
  const inicio = normalizarData(input.inicio)
  const fim = normalizarData(input.fim)
  if (!input.nome.trim()) throw new Error('Informe o nome do semestre.')
  if (fim < inicio) throw new Error('O fim do semestre deve ser igual ou posterior ao início.')
  if (Number(fim.slice(0, 4)) - Number(inicio.slice(0, 4)) > 1)
    throw new Error('O período deve abranger no máximo dois anos consecutivos.')
  return { ...input, nome: input.nome.trim(), inicio, fim }
}
export function validarDisciplina(input: DisciplinaInput): DisciplinaInput {
  if (!input.nome.trim()) throw new Error('Informe o nome da disciplina.')
  if (!input.semestre_id) throw new Error('Defina um semestre primeiro.')
  if (
    !Number.isFinite(input.percentual_presenca) ||
    input.percentual_presenca < 0 ||
    input.percentual_presenca > 100
  )
    throw new Error('Presença mínima deve estar entre 0 e 100%.')
  if (input.total_aulas !== null)
    exigirInteiro(input.total_aulas, 1, 10000, 'Total oficial de aulas')
  return { ...input, nome: input.nome.trim() }
}
export function validarHorario(input: HorarioInput): HorarioInput {
  exigirInteiro(input.dia_semana, 0, 6, 'Dia da semana')
  exigirInteiro(input.aulas, 1, 24, 'Aulas por encontro')
  if (minutosDoHorario(input.hora_fim) <= minutosDoHorario(input.hora_inicio))
    throw new Error('O horário final precisa ser posterior ao inicial, no mesmo dia.')
  const inicio = input.vigencia_inicio ? normalizarData(input.vigencia_inicio) : undefined
  const fim = input.vigencia_fim ? normalizarData(input.vigencia_fim) : undefined
  if (inicio && fim && fim < inicio)
    throw new Error('A vigência final deve ser posterior à inicial.')
  return {
    ...input,
    ...(inicio ? { vigencia_inicio: inicio } : {}),
    ...(fim ? { vigencia_fim: fim } : {}),
  }
}
