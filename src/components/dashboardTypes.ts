import type { Disciplina, Horario, Semestre } from '../types'
export type Tab = 'home' | 'subjects' | 'agenda' | 'settings'
export type Editor =
  | { type: 'semester'; value?: Semestre }
  | { type: 'subject'; value?: Disciplina }
  | { type: 'schedule'; disciplina: Disciplina; value?: Horario }
  | { type: 'absence'; disciplina: Disciplina; data?: string }
  | { type: 'break' }
