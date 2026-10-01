import type { Disciplina, Horario, Semestre } from '../types'
import type { Encontro } from '../lib/calendario'

/** Uma alteração de grade não pode deixar o histórico com mais faltas que aulas no dia. */
export function validarHistorico(disciplina: Disciplina, encontros: Encontro[]): void {
  const faltasPorDia = new Map<string, number>()
  for (const falta of disciplina.faltas)
    faltasPorDia.set(falta.data, (faltasPorDia.get(falta.data) ?? 0) + falta.quantidade)
  for (const [data, faltas] of faltasPorDia) {
    const aulas = encontros
      .filter((item) => item.disciplinaId === disciplina.id && item.data === data && !item.motivo)
      .reduce((sum, item) => sum + item.aulas, 0)
    if (faltas > aulas)
      throw new Error(
        `A alteração deixaria ${faltas} falta(s) em ${data}, mas apenas ${aulas} aula(s) previstas em ${disciplina.nome}. Confira o histórico e a vigência dos horários.`,
      )
  }
}
export function validarSobreposicao(horarios: Horario[], semestre: Semestre): void {
  for (let i = 0; i < horarios.length; i++) {
    for (let j = i + 1; j < horarios.length; j++) {
      const a = horarios[i],
        b = horarios[j]
      const mesmoDia = a.dia_semana === b.dia_semana
      const inicio = [a.vigencia_inicio ?? semestre.inicio, b.vigencia_inicio ?? semestre.inicio]
        .sort()
        .at(-1)!
      const fim = [a.vigencia_fim ?? semestre.fim, b.vigencia_fim ?? semestre.fim].sort()[0]
      if (mesmoDia && inicio <= fim && a.hora_inicio < b.hora_fim && b.hora_inicio < a.hora_fim)
        throw new Error('Há horários sobrepostos nesta disciplina. Ajuste as horas ou a vigência.')
    }
  }
}
