import { useState } from 'react'
import type { Encontro } from '../../lib/calendario'
import type { ResumoDisciplina } from '../../domain/frequencia'
import { hojeLocal } from '../../lib/datas'
import { Icon } from '../Icon'

import { STATUS_LABELS } from '../../domain/status'
export function SubjectSummary({
  resumo,
  onOpen,
}: {
  resumo: ResumoDisciplina
  onOpen: () => void
}) {
  return (
    <button className="subject-summary" onClick={onOpen}>
      <div className="row">
        <span className={`subject-dot ${resumo.status}`} />
        <strong>{resumo.disciplina.nome}</strong>
        <Icon name="arrow" />
      </div>
      <div className="row between">
        <span className={`badge ${resumo.status}`}>{STATUS_LABELS[resumo.status]}</span>
        <span className="hint">Total {resumo.fonte}</span>
      </div>
      <div
        className="progress"
        role="progressbar"
        aria-label={`Limite de faltas utilizado em ${resumo.disciplina.nome}`}
        aria-valuenow={Math.round(resumo.uso)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <span className={resumo.status} style={{ width: `${resumo.uso}%` }} />
      </div>
      <div className="row between">
        <span className="hint">
          {resumo.usadas} de {resumo.limite} faltas
        </span>
        <strong>
          {resumo.status === 'incompleto'
            ? '—'
            : resumo.restantes < 0
              ? `${Math.abs(resumo.restantes)} acima`
              : `${resumo.restantes} restantes`}
        </strong>
      </div>
    </button>
  )
}
export function Overview({
  resumos,
  encontros,
  onSubject,
  onAbsence,
}: {
  resumos: ResumoDisciplina[]
  encontros: Encontro[]
  onSubject: (id: string) => void
  onAbsence: (id: string, data?: string) => void
}) {
  const hoje = hojeLocal()
  const alertas = resumos.filter((item) => ['alerta', 'limite', 'excedido'].includes(item.status))
  const aulasHoje = encontros.filter((item) => item.data === hoje)
  const [selected, setSelected] = useState('')
  const [quantity, setQuantity] = useState(1)
  const resumo = resumos.find((item) => item.disciplina.id === selected) ?? resumos[0]
  const faltas = resumos.reduce((sum, item) => sum + item.usadas, 0)
  const ordem = { excedido: 0, limite: 1, alerta: 2, incompleto: 3, ok: 4 }
  return (
    <>
      <section className="hero-panel">
        <div>
          <h2>
            Controle suas faltas. <br />
            <span style={{ color: 'white' }}>Fique Sem</span>
            <span style={{ color: 'emerald' }}>DP</span>.
          </h2>
          <p>Acompanhe sua margem por disciplina e planeje os próximos encontros.</p>
        </div>
        <div className="hero-stat">
          <span className="orbit">
            <Icon name="check" />
          </span>
          <strong>
            {resumos.filter((item) => item.status === 'ok').length}
            <small> / {resumos.length}</small>
          </strong>
          <span>disciplinas com margem</span>
        </div>
      </section>
      <section className="stats-grid" aria-label="Resumo do semestre">
        <div className="stat">
          <span>Disciplinas</span>
          <strong>{resumos.length.toString().padStart(2, '0')}</strong>
          <small>No semestre selecionado</small>
        </div>
        <div className="stat">
          <span>Precisam de atenção</span>
          <strong className={alertas.length ? 'text-amber' : ''}>
            {alertas.length.toString().padStart(2, '0')}
          </strong>
          <small>Próximas ou acima do limite</small>
        </div>
        <div className="stat">
          <span>Faltas registradas</span>
          <strong>{faltas.toString().padStart(2, '0')}</strong>
          <small>Unidades de aula no semestre</small>
        </div>
      </section>
      <div className="dashboard-columns">
        <section className="panel">
          <div className="section-heading">
            <div>
              <h2>Hoje na sua agenda</h2>
            </div>
            <span className="badge">
              {aulasHoje.filter((item) => !item.motivo).length} encontros
            </span>
          </div>
          {aulasHoje.length === 0 ? (
            <p className="empty">Sem aulas previstas para hoje.</p>
          ) : (
            aulasHoje.map((item) => (
              <div className="agenda-row" key={item.id}>
                <div className="time">
                  {item.horaInicio}
                  <small>{item.horaFim}</small>
                </div>
                <div className="grow">
                  <strong>
                    {resumos.find((r) => r.disciplina.id === item.disciplinaId)?.disciplina.nome}
                  </strong>
                  <p className="hint">{item.motivo ?? `${item.aulas} aulas neste encontro`}</p>
                </div>
                {!item.motivo && (
                  <button
                    className="button small"
                    onClick={() => onAbsence(item.disciplinaId, hoje)}
                  >
                    Falta
                  </button>
                )}
              </div>
            ))
          )}
        </section>
        <section className="panel simulator">
          <h2>E se eu faltar?</h2>
          <p className="hint">Uma simulação não altera seu histórico.</p>
          {resumo ? (
            <>
              <label>
                Disciplina
                <select value={resumo.disciplina.id} onChange={(e) => setSelected(e.target.value)}>
                  {resumos.map((item) => (
                    <option key={item.disciplina.id} value={item.disciplina.id}>
                      {item.disciplina.nome}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Aulas que pretende perder
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(1, Math.min(100, Number(e.target.value) || 1)))
                  }
                />
              </label>
              <p
                className={`simulation-result ${resumo.restantes - quantity < 0 ? 'text-rose' : ''}`}
              >
                {resumo.status === 'incompleto'
                  ? 'Configure a grade ou informe o total oficial.'
                  : resumo.restantes - quantity < 0
                    ? `Você ficaria ${Math.abs(resumo.restantes - quantity)} aula(s) acima do limite.`
                    : `Sobrariam ${resumo.restantes - quantity} falta(s).`}
              </p>
            </>
          ) : (
            <p className="empty">Cadastre uma disciplina para simular.</p>
          )}
        </section>
      </div>
      <section>
        <div className="section-heading">
          <div>
            <span className="eyebrow">OLHO NA FREQUÊNCIA</span>
            <h2>Suas disciplinas</h2>
          </div>
          <span className="hint">A margem é individual</span>
        </div>
        <div className="subjects-grid">
          {[...resumos]
            .sort((a, b) => ordem[a.status] - ordem[b.status])
            .map((item) => (
              <SubjectSummary
                key={item.disciplina.id}
                resumo={item}
                onOpen={() => onSubject(item.disciplina.id)}
              />
            ))}
        </div>
      </section>
    </>
  )
}
