import { type SubmitEvent, useState } from 'react'
import { Modal } from '../Modal'

interface RecessoModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: string, motivo: string) => Promise<void> | void
}

const inputClass =
  'mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none focus:border-emerald-500'

export function RecessoModal({ open, onClose, onSubmit }: RecessoModalProps) {
  const [data, setData] = useState('')
  const [motivo, setMotivo] = useState('Recesso acadêmico')

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    await onSubmit(data, motivo)
    handleClose()
  }

  function handleClose() {
    setData('')
    setMotivo('Recesso acadêmico')
    onClose()
  }

  return (
    <Modal open={open} title="Dia sem aula" onClose={handleClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm text-zinc-300">
          Data
          <input
            type="date"
            required
            value={data}
            onChange={(e) => setData(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="block text-sm text-zinc-300">
          Motivo
          <input value={motivo} onChange={(e) => setMotivo(e.target.value)} className={inputClass} />
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
            Salvar recesso
          </button>
        </div>
      </form>
    </Modal>
  )
}
