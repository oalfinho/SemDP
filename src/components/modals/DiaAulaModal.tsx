import { type SubmitEvent, useEffect, useState } from 'react'
import { DIAS_SEMANA } from '../../lib/datas'
import type { Disciplina } from '../../types'
import { Modal } from '../Modal'

type Props = {
  open: boolean
  disciplinas: Disciplina[]
  initialDia?: number
  initialDisciplinaId?: string
  onClose: () => void
  onSubmit: (disciplinaId: string, dias: number[]) => Promise<void> | void
}

export function DiaAulaModal({ open, disciplinas, initialDia, initialDisciplinaId, onClose, onSubmit }: Props) {
  const [disciplinaId, setDisciplinaId] = useState('')
  const [selecionados, setSelecionados] = useState<number[]>([])
  useEffect(() => {
    if (!open) return
    const id = initialDisciplinaId ?? disciplinas[0]?.id ?? ''
    setDisciplinaId(id)
    const atuais = disciplinas.find((item) => item.id === id)?.dias.map((dia) => dia.dia_semana) ?? []
    setSelecionados(initialDia && !atuais.includes(initialDia) ? [...atuais, initialDia] : atuais)
  }, [open, disciplinas, initialDisciplinaId, initialDia])

  function selecionarDisciplina(id: string) {
    setDisciplinaId(id)
    setSelecionados(disciplinas.find((item) => item.id === id)?.dias.map((dia) => dia.dia_semana) ?? [])
  }

  function alternar(dia: number) {
    setSelecionados((atuais) => atuais.includes(dia) ? atuais.filter((item) => item !== dia) : [...atuais, dia])
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    await onSubmit(disciplinaId, selecionados)
    onClose()
  }

  return (
    <Modal open={open} title="Dias da disciplina" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <label className="block text-sm text-zinc-300">
          Disciplina
          <select required value={disciplinaId} onChange={(event) => selecionarDisciplina(event.target.value)} className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none focus:border-emerald-500">
            {disciplinas.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}
          </select>
        </label>
        <fieldset>
          <legend className="text-sm text-zinc-300">Selecione um ou mais dias</legend>
          <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {DIAS_SEMANA.map((dia) => {
              const ativo = selecionados.includes(dia.value)
              return <button key={dia.value} type="button" aria-pressed={ativo} onClick={() => alternar(dia.value)} className={`rounded-xl border px-3 py-2 text-sm transition ${ativo ? 'border-emerald-400 bg-emerald-400/15 text-emerald-300' : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'}`}>{dia.curto}</button>
            })}
          </div>
        </fieldset>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-xl border border-zinc-700 px-3 py-2 text-sm text-zinc-300">Cancelar</button>
          <button type="submit" className="rounded-xl bg-emerald-500 px-3 py-2 text-sm font-semibold text-zinc-950">Salvar dias</button>
        </div>
      </form>
    </Modal>
  )
}
