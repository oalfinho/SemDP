import { type SubmitEvent, useMemo, useState } from 'react'
import { Modal } from '../Modal'
import { formatarData } from '../../lib/datas'
import type { Disciplina, Semestre, DiaSemAula } from '../../types'
import { datasDeAula } from '../../lib/calendario'

type Props = { open: boolean; disciplina: Disciplina | null; semestre: Semestre | null; extras: DiaSemAula[]; onClose: () => void; onSubmit: (data: string, quantidade: number, observacao: string) => Promise<void> | void }
const inputClass = 'mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none focus:border-emerald-500'

export function FaltaModal({ open, disciplina, semestre, extras, onClose, onSubmit }: Props) {
  const [data, setData] = useState('')
  const [quantidade, setQuantidade] = useState('1')
  const [observacao, setObservacao] = useState('')
  const datas = useMemo(() => disciplina && semestre ? datasDeAula(semestre.inicio, semestre.fim, disciplina.dias, extras) : [], [disciplina, semestre, extras])
  const dataSelecionada = datas.includes(data) ? data : (datas[0] ?? '')
  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) { e.preventDefault(); await onSubmit(dataSelecionada, Number(quantidade), observacao); handleClose() }
  function handleClose() { setData(''); setQuantidade('1'); setObservacao(''); onClose() }
  return <Modal open={open} title="Registrar falta" onClose={handleClose}>{disciplina && <form onSubmit={handleSubmit} className="space-y-4"><div><p className="text-sm text-zinc-400">Disciplina</p><p className="text-lg font-medium text-zinc-100">{disciplina.nome}</p></div>{datas.length ? <label className="block text-sm text-zinc-300">Data<select required value={dataSelecionada} onChange={(e) => setData(e.target.value)} className={inputClass}>{datas.map((item) => <option key={item} value={item}>{formatarData(item)}</option>)}</select></label> : <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">Não há datas válidas. Confira o semestre e os dias da disciplina.</p>}<label className="block text-sm text-zinc-300">Quantidade<input type="number" required min={1} value={quantidade} onChange={(e) => setQuantidade(e.target.value)} className={inputClass} /></label><label className="block text-sm text-zinc-300">Observação<input value={observacao} onChange={(e) => setObservacao(e.target.value)} className={inputClass} placeholder="Opcional" /></label><div className="flex justify-end gap-2 pt-2"><button type="button" onClick={handleClose} className="rounded-xl border border-zinc-700 px-3 py-2 text-sm text-zinc-300">Cancelar</button><button type="submit" disabled={!datas.length} className="rounded-xl bg-emerald-500 px-3 py-2 text-sm font-semibold text-zinc-950 disabled:opacity-40">Salvar falta</button></div></form>}</Modal>
}
