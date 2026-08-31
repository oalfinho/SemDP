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
  created_at: string
}

export type Disciplina = {
  id: string
  user_id: string
  nome: string
  percentual_presenca: number
  created_at: string
  horarios: Horario[]
  faltas: Falta[]
}

export type Semestre = {
  id: string
  user_id: string
  inicio: string
  fim: string
  created_at: string
}

export type DiaSemAula = {
  id: string
  user_id: string
  data: string
  motivo: string | null
}
