import type { ResumoDisciplina } from '../../domain/frequencia'
import type { Horario } from '../../types'
import { formatarData, nomeDia } from '../../lib/datas'
import { STATUS_LABELS } from '../../domain/status'
export function SubjectDetail({
  resumo,
  onBack,
  onEdit,
  onSchedule,
  onAbsence,
  onDeleteAbsence,
  onDeleteSchedule,
  onDelete,
  busy,
}: {
  resumo: ResumoDisciplina
  onBack: () => void
  onEdit: () => void
  onSchedule: (value?: Horario) => void
  onAbsence: () => void
  onDeleteAbsence: (id: string) => void
  onDeleteSchedule: (id: string) => void
  onDelete: () => void
  busy: boolean
}) {
  const disciplina = resumo.disciplina
  return (
    <>
      <button className="button ghost" onClick={onBack}>
        ← Todas as disciplinas
      </button>
      <section className="panel">
        <div className="section-heading">
          <div>
            <span className={`badge ${resumo.status}`}>{STATUS_LABELS[resumo.status]}</span>
            <h2>{disciplina.nome}</h2>
            <p className="hint">
              Presença mínima: {disciplina.percentual_presenca}% · Total {resumo.fonte}
            </p>
          </div>
          <button className="button" onClick={onEdit}>
            Editar
          </button>
        </div>
        <div className="stats-grid">
          <div className="stat">
            <span>Total de aulas</span>
            <strong>{resumo.total}</strong>
            <small>Calendário: {resumo.estimativa}</small>
          </div>
          <div className="stat">
            <span>Faltas usadas</span>
            <strong>{resumo.usadas}</strong>
            <small>Limite: {resumo.limite}</small>
          </div>
          <div className="stat">
            <span>Saldo de faltas</span>
            <strong>{resumo.restantes}</strong>
            <small>Em unidades de aula</small>
          </div>
        </div>
        <p className="hint">
          O limite acompanha os dados informados. Confira o registro oficial da instituição.
        </p>
        <button className="button primary" onClick={onAbsence}>
          Registrar falta
        </button>
      </section>
      <div className="dashboard-columns">
        <section className="panel">
          <div className="section-heading">
            <h2>Horários</h2>
            <button className="button small" onClick={() => onSchedule()}>
              + Horário
            </button>
          </div>
          {!disciplina.horarios.length && (
            <p className="empty">Adicione o dia, horário e quantidade de aulas por encontro.</p>
          )}
          {[...disciplina.horarios]
            .sort(
              (a, b) => a.dia_semana - b.dia_semana || a.hora_inicio.localeCompare(b.hora_inicio),
            )
            .map((item) => (
              <div className="detail-row" key={item.id}>
                <strong>
                  {nomeDia(item.dia_semana)} · {item.hora_inicio}–{item.hora_fim}
                </strong>
                <p className="hint">
                  {item.aulas} aulas
                  {item.vigencia_inicio
                    ? ` · ${formatarData(item.vigencia_inicio)} a ${formatarData(item.vigencia_fim ?? item.vigencia_inicio)}`
                    : ' · semestre inteiro'}
                </p>
                <div className="row">
                  <button className="button small" onClick={() => onSchedule(item)}>
                    Editar
                  </button>
                  <button
                    className="button ghost danger small"
                    disabled={busy}
                    onClick={() => onDeleteSchedule(item.id)}
                  >
                    Excluir horário
                  </button>
                </div>
              </div>
            ))}
        </section>
        <section className="panel">
          <h2>Histórico de faltas</h2>
          {!disciplina.faltas.length && <p className="empty">Nenhuma falta registrada.</p>}
          {[...disciplina.faltas]
            .sort((a, b) => b.data.localeCompare(a.data))
            .map((item) => (
              <div className="detail-row" key={item.id}>
                <div className="row between">
                  <strong>{formatarData(item.data)}</strong>
                  <span className="badge">{item.quantidade} aulas</span>
                </div>
                {item.observacao && <p className="hint">{item.observacao}</p>}
                <button
                  className="button ghost danger small"
                  disabled={busy}
                  onClick={() => onDeleteAbsence(item.id)}
                >
                  Remover registro
                </button>
              </div>
            ))}
        </section>
      </div>
      <button className="button danger" disabled={busy} onClick={onDelete}>
        Excluir disciplina e histórico
      </button>
    </>
  )
}
