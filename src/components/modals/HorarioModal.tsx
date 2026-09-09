import { type SubmitEvent, useEffect, useState } from 'react'
import { Modal } from '../Modal'
import { DIAS_SEMANA } from '../../lib/datas'
import type { Disciplina } from '../../types'

interface HorarioModalProps {
  open: boolean
  disciplinas: Disciplina[]
  initialDia?: number
  initialDisciplinaId?: string
  onClose: () => void
  onSubmit: (disciplinaId: string, dia: number, horaInicio: string, horaFim: string) => Promise<void> | void
}

const inputClass =
  'mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none focus:border-emerald-500'

export function HorarioModal({
  open,
  disciplinas,
  initialDia = 5,
  initialDisciplinaId,
  onClose,
  onSubmit,
}: HorarioModalProps) {
  const [disciplinaId, setDisciplinaId] = useState(initialDisciplinaId || disciplinas[0]?.id || '')
  const [dia, setDia] = useState(initialDia)
  const [horaInicio, setHoraInicio] = useState('07:40')
  const [horaFim, setHoraFim] = useState('11:10')

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    await onSubmit(disciplinaId, dia, horaInicio, horaFim)
    handleClose()
  }

  function handleClose() {
    setDisciplinaId(disciplinas[0]?.id || '')
    setDia(initialDia)
    setHoraInicio('07:40')
    setHoraFim('11:10')
    onClose()
  }

  useEffect(() => {
  if (open) {
    setDisciplinaId(initialDisciplinaId || disciplinas[0]?.id || '')
    setDia(initialDia)
  }
}, [open, disciplinas, initialDisciplinaId, initialDia])

  return (
    <Modal open={open} title="Novo horário" onClose={handleClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm text-zinc-300">
          Disciplina
          <select
            required
            value={disciplinaId}
            onChange={(e) => setDisciplinaId(e.target.value)}
            className={inputClass}
          >
            {disciplinas.map((disciplina) => (
              <option key={disciplina.id} value={disciplina.id}>
                {disciplina.nome}
              </option>
            ))}
          </select>
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm text-zinc-300">
            Dia da semana
            <select value={dia} onChange={(e) => setDia(Number(e.target.value))} className={inputClass}>
              {DIAS_SEMANA.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm text-zinc-300">
            Horário
            <div className="mt-1 flex gap-2">
              <input
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
                className={inputClass}
              />
              <input value={horaFim} onChange={(e) => setHoraFim(e.target.value)} className={inputClass} />
            </div>
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-xl border border-zinc-700 px-3 py-2 text-sm text-zinc-300"
          >
            Cancelar
          </button>
          <button type="submit" className="rounded-xl bg-emerald-500 px-3 py-2 text-sm font-semibold text-zinc-950">
            Salvar horário
          </button>
        </div>
      </form>
    </Modal>
  )
}
