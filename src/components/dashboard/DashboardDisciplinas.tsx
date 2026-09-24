import { DisciplinaCard } from '../DisciplinaCard'
import type { Disciplina } from '../../types'

type Props = { disciplinas: Disciplina[]; onAddFalta: (disciplina: Disciplina) => void; onEditDias: (disciplina: Disciplina) => void; onDeleteDisciplina: (id: string) => void; onDeleteFalta: (disciplinaId: string, faltaId: string) => void }
export function DashboardDisciplinas({ disciplinas, onAddFalta, onEditDias, onDeleteDisciplina, onDeleteFalta }: Props) {
  return <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{disciplinas.map((disciplina) => <DisciplinaCard key={disciplina.id} disciplina={disciplina} onAddFalta={() => onAddFalta(disciplina)} onEditDias={() => onEditDias(disciplina)} onDelete={() => onDeleteDisciplina(disciplina.id)} onDeleteFalta={(id) => onDeleteFalta(disciplina.id, id)} />)}</div>
}
