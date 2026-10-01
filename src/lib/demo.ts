import type { DadosAcademicos, Disciplina, Semestre } from '../types'
import { addDays, hojeLocal, parseISODate } from './datas'
export function criarDemonstracao(): DadosAcademicos {
  const hoje = hojeLocal()
  const semestre: Semestre = {
    id: 'demo',
    user_id: 'demo',
    nome: 'Meu semestre',
    inicio: addDays(hoje, -60),
    fim: addDays(hoje, 60),
    ignorar_feriados: true,
    created_at: '',
  }
  const nomes = [
    'Banco de Dados',
    'Inteligência Artificial',
    'Redes de Computadores',
    'Computação em Nuvem',
  ]
  const disciplinas: Disciplina[] = nomes.map((nome, index) => {
    const id = `disciplina-${index}`
    const dia = (parseISODate(hoje).getDay() + Math.floor(index / 2)) % 7
    let dataFalta = addDays(hoje, -7)
    while (parseISODate(dataFalta).getDay() !== dia) dataFalta = addDays(dataFalta, -1)
    return {
      id,
      user_id: 'demo',
      semestre_id: 'demo',
      nome,
      percentual_presenca: 75,
      total_aulas: 40,
      created_at: '',
      horarios: [
        {
          id: `horario-${index}`,
          disciplina_id: id,
          user_id: 'demo',
          dia_semana: dia,
          hora_inicio: index % 2 ? '20:50' : '19:00',
          hora_fim: index % 2 ? '22:30' : '20:40',
          aulas: 2,
          created_at: '',
        },
      ],
      faltas: Array.from({ length: [1, 4, 2, 0][index] }, (_, n) => ({
        id: `falta-${index}-${n}`,
        disciplina_id: id,
        user_id: 'demo',
        data: addDays(dataFalta, -7 * n),
        quantidade: 2,
        observacao: null,
        created_at: '',
      })),
    }
  })
  return { semestres: [semestre], disciplinas, recessos: [] }
}
