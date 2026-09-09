import { type SubmitEvent, useEffect, useState } from 'react'
import { Modal } from '../Modal'
import { formatarData } from '../../lib/datas'
import type { Disciplina, Semestre, DiaSemAula } from '../../types'
import { aulasDaDisciplina } from '../../lib/calendario'
import { count50MinAulas } from '../../lib/datas'

interface FaltaModalProps {
  open: boolean
  disciplina: Disciplina | null
  semestre: Semestre | null
  extras: DiaSemAula[]
  onClose: () => void
  onSubmit: (data: string, quantidade: number, observacao: string) => Promise<void> | void
}

const inputClass =
  'mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none focus:border-emerald-500'

export function FaltaModal({
  open,
  disciplina,
  semestre,
  extras,
  onClose,
  onSubmit,
}: FaltaModalProps) {
  const [data, setData] = useState('')
  const [quantidade, setQuantidade] = useState('1')
  const [observacao, setObservacao] = useState('')

  const datasFalta = disciplina && semestre
    ? aulasDaDisciplina(
        disciplina.id,
        semestre.inicio,
        semestre.fim,
        disciplina.horarios,
        extras,
      ).previstas.map((a) => a.data)
    : []
  const datasFaltaUnicas = [...new Set(datasFalta)]

  // Autofill data de faltas
  useEffect(() => {
    if (!disciplina || !semestre) return
    if (datasFaltaUnicas.length === 0) return

    const defaultDate = datasFaltaUnicas[0]
    setData(defaultDate)

    const { previstas } = aulasDaDisciplina(
      disciplina.id,
      semestre.inicio,
      semestre.fim,
      disciplina.horarios,
      extras,
    )

    const noDia = previstas.filter((a) => a.data === defaultDate)
    if (noDia.length > 0) {
      const cnt = count50MinAulas(noDia[0].horaInicio, noDia[0].horaFim)
      setQuantidade(String(Math.max(1, cnt)))
    } else {
      setQuantidade('1')
    }
  }, [disciplina, semestre, datasFaltaUnicas, extras])

  // Recalcula quantidade de faltas ao mudar a data
  useEffect(() => {
    if (!disciplina || !semestre) return

    const { previstas } = aulasDaDisciplina(
      disciplina.id,
      semestre.inicio,
      semestre.fim,
      disciplina.horarios,
      extras,
    )

    const noDia = previstas.filter((a) => a.data === data)
    if (noDia.length > 0) {
      const cnt = count50MinAulas(noDia[0].horaInicio, noDia[0].horaFim)
      setQuantidade(String(Math.max(1, cnt)))
    }
  }, [data, disciplina, semestre, extras])

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    await onSubmit(data, Number(quantidade), observacao)
    handleClose()
  }

  function handleClose() {
    setData('')
    setQuantidade('1')
    setObservacao('')
    onClose()
  }

  return (
    <Modal open={open} title="Registrar falta" onClose={handleClose}>
      {disciplina && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="text-sm text-zinc-400">Disciplina</p>
            <p className="text-lg font-medium text-zinc-100">{disciplina.nome}</p>
          </div>

          <label className="block text-sm text-zinc-300">
            Data
            <select value={data} onChange={(e) => setData(e.target.value)} className={inputClass}>
              {datasFaltaUnicas.map((d) => (
                <option key={d} value={d}>
                  {formatarData(d)}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm text-zinc-300">
            Quantidade
            <input
              type="number"
              min={1}
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
              className={inputClass}
            />
          </label>

          <label className="block text-sm text-zinc-300">
            Observação
            <input
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              className={inputClass}
              placeholder="Opcional"
            />
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-xl border border-zinc-700 px-3 py-2 text-sm text-zinc-300"
            >
              Cancelar
            </button>
            <button type="submit" className="rounded-xl bg-emerald-500 px-3 py-2 text-sm font-semibold text-zinc-950">
              Salvar falta
            </button>
          </div>
        </form>
      )}
    </Modal>
  )
}
