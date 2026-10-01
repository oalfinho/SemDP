import type { Disciplina, FaltaInput } from '../types'
import type { Encontro } from '../lib/calendario'
import { limiteFaltas, statusFaltas } from '../lib/calculo'
import { hojeLocal, normalizarData } from '../lib/datas'
import { exigirInteiro } from './validacao'

export function resumirDisciplina(disciplina: Disciplina, encontros: Encontro[]) {
  const previstos = encontros.filter((item) => item.disciplinaId === disciplina.id && !item.motivo)
  const estimativa = previstos.reduce((sum, item) => sum + item.aulas, 0)
  const total = disciplina.total_aulas ?? estimativa
  const usadas = disciplina.faltas.reduce((sum, falta) => sum + falta.quantidade, 0)
  const limite = limiteFaltas(total, disciplina.percentual_presenca)
  return {
    disciplina,
    total,
    estimativa,
    usadas,
    limite,
    restantes: limite - usadas,
    fonte: disciplina.total_aulas === null ? ('estimado' as const) : ('oficial' as const),
    status: total === 0 ? ('incompleto' as const) : statusFaltas(usadas, limite),
    uso: limite === 0 ? (usadas > 0 ? 100 : 0) : Math.min(100, (usadas / limite) * 100),
  }
}
export type ResumoDisciplina = ReturnType<typeof resumirDisciplina>

export function validarRegistroFalta(
  disciplina: Disciplina,
  encontros: Encontro[],
  input: FaltaInput,
  hoje = hojeLocal(),
): FaltaInput {
  const data = normalizarData(input.data)
  if (data > hoje)
    throw new Error('Use o simulador para faltas futuras. Registre apenas faltas já ocorridas.')
  const aulasNoDia = encontros
    .filter((item) => item.disciplinaId === disciplina.id && item.data === data && !item.motivo)
    .reduce((sum, item) => sum + item.aulas, 0)
  if (!aulasNoDia) throw new Error('Não há aula desta disciplina na data escolhida.')
  const usadasNoDia = disciplina.faltas
    .filter((falta) => normalizarData(falta.data) === data)
    .reduce((sum, falta) => sum + falta.quantidade, 0)
  exigirInteiro(input.quantidade, 1, aulasNoDia, 'Quantidade de faltas')
  if (usadasNoDia + input.quantidade > aulasNoDia)
    throw new Error(
      `Restam ${aulasNoDia - usadasNoDia} aulas disponíveis para registrar nesta data.`,
    )
  return { ...input, data, observacao: input.observacao?.trim() || null }
}
