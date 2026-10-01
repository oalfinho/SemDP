import { useState, type FormEvent, type ReactNode } from 'react'
import type {
  Disciplina,
  DisciplinaInput,
  FaltaInput,
  Horario,
  HorarioInput,
  Semestre,
  SemestreInput,
} from '../../types'
import type { Encontro } from '../../lib/calendario'
import { addDays, DIAS_SEMANA, formatarData, hojeLocal } from '../../lib/datas'
import { calcularAulasPorHorario } from '../../lib/calculo'

type FormProps = { busy: boolean; error: string | null }
function Form({
  busy,
  error,
  children,
  onSubmit,
  label = 'Salvar alterações',
}: FormProps & {
  children: ReactNode
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  label?: string
}) {
  return (
    <form className="academic-form" onSubmit={onSubmit}>
      <fieldset disabled={busy}>{children}</fieldset>
      {error && (
        <p role="alert" className="message error">
          {error}
        </p>
      )}
      <button className="button primary full" type="submit" disabled={busy}>
        {busy ? 'Salvando…' : label}
      </button>
    </form>
  )
}
export function SemesterForm({
  value,
  busy,
  error,
  onSave,
}: FormProps & { value?: Semestre; onSave: (value: SemestreInput) => void }) {
  const [nome, setNome] = useState(
    value?.nome ?? `${new Date().getFullYear()}.${new Date().getMonth() < 6 ? 1 : 2}`,
  )
  const [inicio, setInicio] = useState(value?.inicio ?? hojeLocal())
  const [fim, setFim] = useState(value?.fim ?? addDays(hojeLocal(), 120))
  const [feriados, setFeriados] = useState(value?.ignorar_feriados ?? true)
  return (
    <Form
      busy={busy}
      error={error}
      onSubmit={(e) => {
        e.preventDefault()
        onSave({ nome, inicio, fim, ignorar_feriados: feriados })
      }}
    >
      <label>
        Nome do semestre
        <input required value={nome} onChange={(e) => setNome(e.target.value)} maxLength={60} />
      </label>
      <div className="form-grid">
        <label>
          Início
          <input required type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} />
        </label>
        <label>
          Fim
          <input
            required
            type="date"
            min={inicio}
            value={fim}
            onChange={(e) => setFim(e.target.value)}
          />
        </label>
      </div>
      <label className="checkbox">
        <input type="checkbox" checked={feriados} onChange={(e) => setFeriados(e.target.checked)} />
        Descontar feriados e datas móveis sugeridas
      </label>
      <p className="hint">
        Inclui Carnaval, Cinzas e Corpus Christi. Confira o calendário da sua instituição. Desative
        para cadastrar manualmente apenas os dias sem aula.
      </p>
      {value && (
        <p className="hint">
          Alterar o período ou os feriados recalcula as estimativas. Totais oficiais continuam sendo
          a base das disciplinas que os possuem.
        </p>
      )}
    </Form>
  )
}
export function SubjectForm({
  value,
  semestreId,
  busy,
  error,
  onSave,
}: FormProps & {
  value?: Disciplina
  semestreId: string
  onSave: (value: DisciplinaInput) => void
}) {
  const [nome, setNome] = useState(value?.nome ?? '')
  const [presenca, setPresenca] = useState(String(value?.percentual_presenca ?? 75))
  const [total, setTotal] = useState(value?.total_aulas?.toString() ?? '')
  return (
    <Form
      busy={busy}
      error={error}
      onSubmit={(e) => {
        e.preventDefault()
        onSave({
          nome,
          percentual_presenca: Number(presenca),
          total_aulas: total ? Number(total) : null,
          semestre_id: semestreId,
        })
      }}
    >
      <label>
        Nome da disciplina
        <input
          required
          maxLength={100}
          placeholder="Ex.: Banco de Dados"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
      </label>
      <div className="form-grid">
        <label>
          Presença mínima (%)
          <input
            required
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={presenca}
            onChange={(e) => setPresenca(e.target.value)}
          />
        </label>
        <label>
          Total oficial de aulas
          <input
            type="number"
            min="1"
            max="10000"
            placeholder="Opcional"
            value={total}
            onChange={(e) => setTotal(e.target.value)}
          />
        </label>
      </div>
      <p className="hint">
        Informe o total em unidades de aula, não em horas-relógio. Se deixar vazio, o app estima
        pela grade. Depois de salvar, adicione os dias e horários.
      </p>
    </Form>
  )
}
export function ScheduleForm({
  value,
  semestre,
  busy,
  error,
  onSave,
}: FormProps & { value?: Horario; semestre: Semestre; onSave: (value: HorarioInput) => void }) {
  const [dia, setDia] = useState(value?.dia_semana ?? 1)
  const [inicio, setInicio] = useState(value?.hora_inicio ?? '19:00')
  const [fim, setFim] = useState(value?.hora_fim ?? '20:40')
  const [aulas, setAulas] = useState(String(value?.aulas ?? 2))
  const [de, setDe] = useState(value?.vigencia_inicio ?? semestre.inicio)
  const [ate, setAte] = useState(value?.vigencia_fim ?? semestre.fim)
  let sugestao = 0
  try {
    sugestao = calcularAulasPorHorario(inicio, fim)
  } catch {
    /* Campos incompletos durante digitação. */
  }
  return (
    <Form
      busy={busy}
      error={error}
      onSubmit={(e) => {
        e.preventDefault()
        onSave({
          dia_semana: dia,
          hora_inicio: inicio,
          hora_fim: fim,
          aulas: Number(aulas),
          vigencia_inicio: de,
          vigencia_fim: ate,
        })
      }}
    >
      <label>
        Dia da semana
        <select value={dia} onChange={(e) => setDia(Number(e.target.value))}>
          {DIAS_SEMANA.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      <div className="form-grid">
        <label>
          Das
          <input required type="time" value={inicio} onChange={(e) => setInicio(e.target.value)} />
        </label>
        <label>
          Até
          <input required type="time" value={fim} onChange={(e) => setFim(e.target.value)} />
        </label>
      </div>
      <label>
        Aulas neste encontro
        <input
          required
          type="number"
          min="1"
          max="24"
          value={aulas}
          onChange={(e) => setAulas(e.target.value)}
        />
      </label>
      <p className="hint">
        Sugestão: {sugestao} aulas de 50 minutos sem intervalo. Confirme a quantidade usada na
        chamada.
      </p>
      <div className="form-grid">
        <label>
          Válido desde
          <input
            required
            type="date"
            min={semestre.inicio}
            max={semestre.fim}
            value={de}
            onChange={(e) => setDe(e.target.value)}
          />
        </label>
        <label>
          Válido até
          <input
            required
            type="date"
            min={de}
            max={semestre.fim}
            value={ate}
            onChange={(e) => setAte(e.target.value)}
          />
        </label>
      </div>
      <p className="hint">
        Mudou de horário? Encerre a vigência do antigo e adicione outro, preservando as aulas
        passadas.
      </p>
    </Form>
  )
}
export function AbsenceForm({
  disciplina,
  encontros,
  initialDate,
  busy,
  error,
  onSave,
}: FormProps & {
  disciplina: Disciplina
  encontros: Encontro[]
  initialDate?: string
  onSave: (value: FaltaInput) => void
}) {
  const hoje = hojeLocal()
  const dias = [
    ...new Set(
      encontros
        .filter((item) => item.disciplinaId === disciplina.id && !item.motivo && item.data <= hoje)
        .map((item) => item.data),
    ),
  ]
    .sort()
    .reverse()
  const saldo = (data: string) =>
    encontros
      .filter((item) => item.disciplinaId === disciplina.id && !item.motivo && item.data === data)
      .reduce((sum, item) => sum + item.aulas, 0) -
    disciplina.faltas
      .filter((item) => item.data === data)
      .reduce((sum, item) => sum + item.quantidade, 0)
  const disponiveis = dias.filter((data) => saldo(data) > 0)
  const defaultDate =
    initialDate && disponiveis.includes(initialDate) ? initialDate : (disponiveis[0] ?? '')
  const [data, setData] = useState(defaultDate)
  const [quantidade, setQuantidade] = useState(String(defaultDate ? saldo(defaultDate) : 1))
  const [observacao, setObservacao] = useState('')
  if (!disponiveis.length)
    return (
      <p className="empty">
        Não há aulas passadas disponíveis para registrar. Confira a grade, o semestre e as faltas já
        lançadas.
      </p>
    )
  return (
    <Form
      busy={busy}
      error={error}
      label="Registrar falta"
      onSubmit={(e) => {
        e.preventDefault()
        onSave({ data, quantidade: Number(quantidade), observacao })
      }}
    >
      <p className="hint">{disciplina.nome}</p>
      <label>
        Data
        <select
          value={data}
          onChange={(e) => {
            setData(e.target.value)
            setQuantidade(String(saldo(e.target.value)))
          }}
        >
          {disponiveis.map((day) => (
            <option key={day} value={day}>
              {formatarData(day)}
            </option>
          ))}
        </select>
      </label>
      <label>
        Quantidade de aulas
        <input
          required
          type="number"
          min="1"
          max={saldo(data)}
          value={quantidade}
          onChange={(e) => setQuantidade(e.target.value)}
        />
      </label>
      <p className="hint">
        {saldo(data)} aulas disponíveis nesta data. Para falta parcial, reduza a quantidade.
      </p>
      <label>
        Observação
        <input
          maxLength={200}
          placeholder="Opcional"
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
        />
      </label>
    </Form>
  )
}
export function BreakForm({
  semestre,
  busy,
  error,
  onSave,
}: FormProps & { semestre: Semestre; onSave: (data: string, motivo: string) => void }) {
  const [data, setData] = useState(
    hojeLocal() >= semestre.inicio && hojeLocal() <= semestre.fim ? hojeLocal() : semestre.inicio,
  )
  const [motivo, setMotivo] = useState('Recesso acadêmico')
  return (
    <Form
      busy={busy}
      error={error}
      label="Salvar dia sem aula"
      onSubmit={(e) => {
        e.preventDefault()
        onSave(data, motivo)
      }}
    >
      <label>
        Data
        <input
          required
          type="date"
          min={semestre.inicio}
          max={semestre.fim}
          value={data}
          onChange={(e) => setData(e.target.value)}
        />
      </label>
      <label>
        Motivo
        <input
          required
          maxLength={100}
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
        />
      </label>
      <p className="hint">
        Vale para todas as disciplinas deste semestre. Se já existem faltas nesta data, remova ou
        corrija esses registros primeiro.
      </p>
    </Form>
  )
}
