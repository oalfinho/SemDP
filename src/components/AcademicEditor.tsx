import type { Disciplina, Semestre } from '../types'
import type { Encontro } from '../lib/calendario'
import type { useAcademicActions } from '../hooks/useAcademicActions'
import type { Editor } from './dashboardTypes'
import * as repository from '../services/academicoRepository'
import { Modal } from './Modal'
import {
  AbsenceForm,
  BreakForm,
  ScheduleForm,
  SemesterForm,
  SubjectForm,
} from './forms/AcademicForms'
type Props = {
  editor: Editor
  semestre?: Semestre
  disciplinas: Disciplina[]
  encontros: Encontro[]
  uid: string
  actions: ReturnType<typeof useAcademicActions>
  fechar: () => void
  setSemesterId: (id: string) => void
  abrirDisciplina: (id: string) => void
}
export function AcademicEditor({
  editor,
  semestre,
  disciplinas,
  encontros,
  uid,
  actions,
  fechar,
  setSemesterId,
  abrirDisciplina,
}: Props) {
  const formProps = { busy: actions.busy, error: actions.error }
  const tituloEditor =
    editor?.type === 'semester'
      ? 'Configurar semestre'
      : editor?.type === 'subject'
        ? editor.value
          ? 'Editar disciplina'
          : 'Nova disciplina'
        : editor?.type === 'schedule'
          ? 'Horário da disciplina'
          : editor?.type === 'absence'
            ? 'Registrar falta'
            : 'Dia sem aula'

  return (
    <Modal title={tituloEditor} onClose={fechar} busy={actions.busy}>
      {editor.type === 'semester' && (
        <SemesterForm
          {...formProps}
          value={editor.value}
          onSave={(value) =>
            void actions.executar(
              async () => {
                const id = await repository.salvarSemestre(uid, value, editor.value?.id)
                setSemesterId(id)
              },
              'Semestre salvo.',
              fechar,
            )
          }
        />
      )}
      {editor.type === 'subject' && semestre && (
        <SubjectForm
          {...formProps}
          value={editor.value}
          semestreId={semestre.id}
          onSave={(value) =>
            void actions.executar(
              async () => {
                const id = await repository.salvarDisciplina(uid, value, editor.value?.id)
                abrirDisciplina(id)
              },
              'Disciplina salva. Confira os horários.',
              fechar,
            )
          }
        />
      )}
      {editor.type === 'schedule' && semestre && (
        <ScheduleForm
          {...formProps}
          value={editor.value}
          semestre={semestre}
          onSave={(value) =>
            void actions.executar(
              () => repository.salvarHorario(uid, editor.disciplina.id, value, editor.value?.id),
              'Horário salvo.',
              fechar,
            )
          }
        />
      )}
      {editor.type === 'absence' && (
        <AbsenceForm
          {...formProps}
          disciplina={editor.disciplina}
          encontros={encontros}
          initialDate={editor.data}
          onSave={(value) =>
            void actions.executar(
              () => repository.registrarFalta(uid, editor.disciplina.id, value),
              'Falta registrada.',
              fechar,
            )
          }
        />
      )}
      {editor.type === 'break' && semestre && (
        <BreakForm
          {...formProps}
          semestre={semestre}
          onSave={(data, motivo) =>
            void actions.executar(
              async () => {
                if (disciplinas.some((item) => item.faltas.some((falta) => falta.data === data)))
                  throw new Error(
                    'Já existem faltas nesta data. Corrija os registros antes de cadastrar o recesso.',
                  )
                await repository.salvarRecesso(uid, semestre.id, data, motivo)
              },
              'Dia sem aula salvo.',
              fechar,
            )
          }
        />
      )}
    </Modal>
  )
}
