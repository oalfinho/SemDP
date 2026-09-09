import { type SubmitEvent, useState } from 'react'
import { Modal } from '../Modal'

interface DisciplinaModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (nome: string, percentual: number) => Promise<void> | void
}

const inputClass =
  'mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none focus:border-emerald-500'

export function DisciplinaModal({ open, onClose, onSubmit }: DisciplinaModalProps) {
  const [nome, setNome] = useState('')
  const [percentual, setPercentual] = useState('75')

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    await onSubmit(nome, Number(percentual))
    setNome('')
    setPercentual('75')
  }

  function handleClose() {
    setNome('')
    setPercentual('75')
    onClose()
  }

  return (
    <Modal open={open} title="Nova disciplina" onClose={handleClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm text-zinc-300">
          Nome da disciplina
          <input
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className={inputClass}
            placeholder="História"
          />
        </label>
        <label className="block text-sm text-zinc-300">
          Percentual mínimo de presença
          <input
            type="number"
            min={0}
            max={100}
            value={percentual}
            onChange={(e) => setPercentual(e.target.value)}
            className={inputClass}
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
            Salvar disciplina
          </button>
        </div>
      </form>
    </Modal>
  )
}
