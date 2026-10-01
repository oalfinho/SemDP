export type Falta = {
  id: string
  user_id: string
  disciplina_id: string
  data: string
  quantidade: number
  observacao: string | null
  created_at: string
}

export type Horario = {
  id: string
  user_id: string
  disciplina_id: string
  dia_semana: number
  hora_inicio: string
  hora_fim: string
  aulas: number
  vigencia_inicio?: string
  vigencia_fim?: string
  created_at: string
}

export type Disciplina = {
  id: string
  user_id: string
  semestre_id: string
  nome: string
  percentual_presenca: number
  total_aulas: number | null
  created_at: string
  horarios: Horario[]
  faltas: Falta[]
}

export type Semestre = {
  id: string
  user_id: string
  nome: string
  inicio: string
  fim: string
  ignorar_feriados: boolean
  created_at: string
}

export type DiaSemAula = {
  id: string
  user_id: string
  semestre_id: string
  data: string
  motivo: string | null
}

export type DadosAcademicos = {
  disciplinas: Disciplina[]
  semestres: Semestre[]
  recessos: DiaSemAula[]
}

export type DisciplinaInput = Pick<
  Disciplina,
  'nome' | 'percentual_presenca' | 'total_aulas' | 'semestre_id'
>
export type SemestreInput = Pick<Semestre, 'nome' | 'inicio' | 'fim' | 'ignorar_feriados'>
export type HorarioInput = Pick<
  Horario,
  'dia_semana' | 'hora_inicio' | 'hora_fim' | 'aulas' | 'vigencia_inicio' | 'vigencia_fim'
>
export type FaltaInput = Pick<Falta, 'data' | 'quantidade' | 'observacao'>
