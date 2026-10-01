import type { DiaSemAula, Semestre } from '../../types'
import type { Editor } from '../dashboardTypes'
import { formatarData } from '../../lib/datas'
type Props = {
  semestre: Semestre
  recessos: DiaSemAula[]
  busy: boolean
  demo: boolean
  email?: string | null
  abrir: (value: Editor) => void
  exportar: () => void
  onDeleteBreak: (id: string) => void
  onLogout: () => void
}
export function Settings({
  semestre,
  recessos,
  busy,
  demo,
  email,
  abrir,
  exportar,
  onDeleteBreak,
  onLogout,
}: Props) {
  return (
    <>
      <section className="panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">PERÍODO ACADÊMICO</span>
            <h2>{semestre.nome}</h2>
            <p className="hint">
              {formatarData(semestre.inicio)} — {formatarData(semestre.fim)}
            </p>
          </div>
          <button className="button" onClick={() => abrir({ type: 'semester', value: semestre })}>
            Editar
          </button>
        </div>
        <p className="hint">
          {semestre.ignorar_feriados
            ? 'Feriados e datas móveis sugeridas são descontados da estimativa.'
            : 'Apenas os dias sem aula que você cadastrar são descontados.'}
        </p>
        <button className="button primary" onClick={() => abrir({ type: 'semester' })}>
          + Novo semestre
        </button>
        <p className="hint">
          Cada novo semestre tem suas próprias disciplinas. O histórico anterior permanece
          disponível no seletor.
        </p>
      </section>
      <section className="panel">
        <div className="section-heading">
          <h2>Dias sem aula</h2>
          <button className="button" onClick={() => abrir({ type: 'break' })}>
            + Adicionar
          </button>
        </div>
        {recessos.filter((item) => item.semestre_id === semestre.id).length === 0 && (
          <p className="empty">Nenhum recesso manual cadastrado.</p>
        )}
        {recessos
          .filter((item) => item.semestre_id === semestre.id)
          .map((item) => (
            <div className="agenda-row" key={item.id}>
              <div className="grow">
                <strong>{formatarData(item.data)}</strong>
                <p className="hint">{item.motivo}</p>
              </div>
              <button
                className="button ghost danger small"
                disabled={busy}
                onClick={() => onDeleteBreak(item.id)}
              >
                Remover
              </button>
            </div>
          ))}
      </section>
      <section className="panel">
        <h2>Seus dados e sua conta</h2>
        <p className="hint account-email">{demo ? 'Dados de demonstração' : email}</p>
        <div className="row wrap">
          <button className="button" onClick={exportar}>
            Exportar backup JSON
          </button>
          <button className="button danger" disabled={busy} onClick={onLogout}>
            Sair da conta
          </button>
        </div>
      </section>
    </>
  )
}
