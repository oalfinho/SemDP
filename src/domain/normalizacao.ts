import { normalizarData } from '../lib/datas'
import { calcularAulasPorHorario } from '../lib/calculo'
import type { DiaSemAula, Disciplina, Falta, Horario, Semestre } from '../types'

type Registro = Record<string, unknown>
const texto = (value: unknown, fallback = '') => (typeof value === 'string' ? value : fallback)
function numero(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}
export function lerSemestre(id: string, raw: Registro, uid: string): Semestre {
  return {
    id,
    user_id: uid,
    nome: texto(raw.nome, 'Semestre anterior'),
    inicio: normalizarData(texto(raw.inicio)),
    fim: normalizarData(texto(raw.fim)),
    ignorar_feriados: raw.ignorar_feriados !== false,
    created_at: texto(raw.created_at),
  }
}
export function lerHorario(id: string, raw: Registro, uid: string, disciplinaId: string): Horario {
  const inicio = texto(raw.hora_inicio).slice(0, 5)
  const fim = texto(raw.hora_fim).slice(0, 5)
  return {
    id,
    user_id: uid,
    disciplina_id: disciplinaId,
    dia_semana: numero(raw.dia_semana, 1),
    hora_inicio: inicio,
    hora_fim: fim,
    aulas: numero(raw.aulas, calcularAulasPorHorario(inicio, fim)),
    created_at: texto(raw.created_at),
    ...(raw.vigencia_inicio ? { vigencia_inicio: normalizarData(texto(raw.vigencia_inicio)) } : {}),
    ...(raw.vigencia_fim ? { vigencia_fim: normalizarData(texto(raw.vigencia_fim)) } : {}),
  }
}
export function lerFalta(id: string, raw: Registro, uid: string, disciplinaId: string): Falta {
  const quantidade = numero(raw.quantidade, 0)
  if (!Number.isInteger(quantidade) || quantidade < 1)
    throw new Error(
      'Há uma falta antiga com quantidade inválida. Corrija o registro antes de continuar.',
    )
  return {
    id,
    user_id: uid,
    disciplina_id: disciplinaId,
    data: normalizarData(texto(raw.data)),
    quantidade,
    observacao: texto(raw.observacao) || null,
    created_at: texto(raw.created_at),
  }
}
export function lerDisciplina(
  id: string,
  raw: Registro,
  uid: string,
  semestreLegado: string,
  horarios: Horario[],
  faltas: Falta[],
): Disciplina {
  return {
    id,
    user_id: uid,
    semestre_id: texto(raw.semestre_id, semestreLegado),
    nome: texto(raw.nome, 'Disciplina'),
    percentual_presenca: numero(raw.percentual_presenca, 75),
    total_aulas: numero(raw.total_aulas, 0) > 0 ? Number(raw.total_aulas) : null,
    created_at: texto(raw.created_at),
    horarios,
    faltas,
  }
}
export function lerRecesso(
  id: string,
  raw: Registro,
  uid: string,
  semestreLegado: string,
): DiaSemAula {
  return {
    id,
    user_id: uid,
    semestre_id: texto(raw.semestre_id, semestreLegado),
    data: normalizarData(texto(raw.data)),
    motivo: texto(raw.motivo, 'Recesso'),
  }
}
