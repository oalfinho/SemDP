import { useState } from 'react'
import type { Encontro } from '../../lib/calendario'
import type { Disciplina, Semestre } from '../../types'
import { addDays, formatarData, hojeLocal, nomeDia, parseISODate } from '../../lib/datas'
export function Agenda({
  encontros,
  disciplinas,
  semestre,
  onAbsence,
  onBreak,
}: {
  encontros: Encontro[]
  disciplinas: Disciplina[]
  semestre: Semestre
  onAbsence: (id: string, data: string) => void
  onBreak: () => void
}) {
  const today = hojeLocal()
  const [data, setData] = useState(
    today < semestre.inicio ? semestre.inicio : today > semestre.fim ? semestre.fim : today,
  )
  const inicioSemana = addDays(data, -((parseISODate(data).getDay() + 6) % 7))
  const dias = Array.from({ length: 7 }, (_, index) => addDays(inicioSemana, index))
  const itens = encontros.filter((item) => item.data === data)
  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">SUA ROTINA</span>
          <h2>Agenda de aulas</h2>
        </div>
        <button className="button" onClick={onBreak}>
          + Dia sem aula
        </button>
      </div>
      <div className="agenda-controls">
        <button
          className="icon-button"
          aria-label="Semana anterior"
          disabled={inicioSemana <= semestre.inicio}
          onClick={() =>
            setData(addDays(data, -7) < semestre.inicio ? semestre.inicio : addDays(data, -7))
          }
        >
          ←
        </button>
        <label className="grow">
          Escolher data
          <input
            type="date"
            min={semestre.inicio}
            max={semestre.fim}
            value={data}
            onChange={(e) => {
              if (
                e.target.value &&
                e.target.value >= semestre.inicio &&
                e.target.value <= semestre.fim
              )
                setData(e.target.value)
            }}
          />
        </label>
        <button
          className="icon-button"
          aria-label="Próxima semana"
          disabled={addDays(inicioSemana, 6) >= semestre.fim}
          onClick={() => setData(addDays(data, 7) > semestre.fim ? semestre.fim : addDays(data, 7))}
        >
          →
        </button>
      </div>
      <div className="week-strip">
        {dias.map((day) => (
          <button
            className={day === data ? 'selected' : ''}
            key={day}
            disabled={day < semestre.inicio || day > semestre.fim}
            aria-pressed={day === data}
            onClick={() => setData(day)}
          >
            <span>{nomeDia(parseISODate(day).getDay()).slice(0, 3)}</span>
            <strong>{parseISODate(day).getDate()}</strong>
            <span
              className={`day-dot ${encontros.some((item) => item.data === day && !item.motivo) ? 'has-class' : ''}`}
            />
          </button>
        ))}
      </div>
      <h3>
        {nomeDia(parseISODate(data).getDay())}, {formatarData(data)}
      </h3>
      {!itens.length && <p className="empty">Nenhuma aula prevista para esta data.</p>}
      {itens.map((item) => (
        <div key={item.id} className={`agenda-row ${item.motivo ? 'cancelled' : ''}`}>
          <div className="time">
            {item.horaInicio}
            <small>{item.horaFim}</small>
          </div>
          <div className="grow">
            <strong>{disciplinas.find((d) => d.id === item.disciplinaId)?.nome}</strong>
            <p className="hint">
              {item.motivo ? `Sem aula · ${item.motivo}` : `${item.aulas} aulas`}
            </p>
          </div>
          {!item.motivo && data <= today && (
            <button className="button small" onClick={() => onAbsence(item.disciplinaId, data)}>
              Falta
            </button>
          )}
        </div>
      ))}
    </section>
  )
}
