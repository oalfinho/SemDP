import { DisciplinaCard } from '../DisciplinaCard'
import type { Disciplina } from '../../types'

interface DashboardDisciplinasProps {
  disciplinas: Disciplina[]
  semestre: any
  extras: any
  onAddFalta: (disciplina: Disciplina) => void
  onAddHorario: (diaSemana?: number) => void
  onDeleteDisciplina: (id: string) => void
  onDeleteFalta: (disciplinaId: string, faltaId: string) => void
  onDeleteHorario: (disciplinaId: string, horarioId: string) => void
}

export function DashboardDisciplinas({
  disciplinas,
  semestre,
  extras,
  onAddFalta,
  onAddHorario,
  onDeleteDisciplina,
  onDeleteFalta,
  onDeleteHorario,
}: DashboardDisciplinasProps) {
  return (
    <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {disciplinas.map((disciplina) => (
        <DisciplinaCard
          key={disciplina.id}
          disciplina={disciplina}
          semestre={semestre}
          extras={extras}
          onAddFalta={() => onAddFalta(disciplina)}
          onAddHorario={onAddHorario}
          onDelete={() => onDeleteDisciplina(disciplina.id)}
          onDeleteFalta={(id) => onDeleteFalta(disciplina.id, id)}
          onDeleteHorario={(id) => onDeleteHorario(disciplina.id, id)}
        />
      ))}
    </div>
  )
}