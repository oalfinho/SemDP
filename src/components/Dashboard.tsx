import { useEffect, useMemo, useState, type SubmitEvent } from 'react'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore'
import { DisciplinaCard } from './DisciplinaCard'
import { GradeSemana } from './GradeSemana'
import { Modal } from './Modal'
import { useAuth } from '../context/AuthContext'
import { aulasDaDisciplina, expandirSemestre } from '../lib/calendario'
import { DIAS_SEMANA, count50MinAulas, formatarData, hojeLocal, toISODate } from '../lib/datas'
import { proximoFeriado } from '../lib/feriados'
import { db } from '../lib/firebase'
import type { DiaSemAula, Disciplina, Falta, Horario, Semestre } from '../types'

const inputClass =
  'mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none focus:border-emerald-500'

function mensagemSchema(msg: string) {
  return msg
}

export function Dashboard() {
  const { user, signOut } = useAuth()
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([])
  const [semestre, setSemestre] = useState<Semestre | null>(null)
  const [extras, setExtras] = useState<DiaSemAula[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  const [inicio, setInicio] = useState(hojeLocal())
  const [fim, setFim] = useState(() => {
    const d = new Date()
    d.setMonth(d.getMonth() + 4)
    return toISODate(d)
  })

  const [modalDisc, setModalDisc] = useState(false)
  const [nome, setNome] = useState('')
  const [percentual, setPercentual] = useState('75')

  const [modalHorario, setModalHorario] = useState(false)
  const [disciplinaHorario, setDisciplinaHorario] = useState('')
  const [diaHorario, setDiaHorario] = useState(5)
  const [horaInicio, setHoraInicio] = useState('07:40')
  const [horaFim, setHoraFim] = useState('11:10')

  const [disciplinaFalta, setDisciplinaFalta] = useState<Disciplina | null>(null)
  const [dataFalta, setDataFalta] = useState(hojeLocal())
  const [qtdFalta, setQtdFalta] = useState('1')
  const [obsFalta, setObsFalta] = useState('')

  const [modalRecesso, setModalRecesso] = useState(false)
  const [dataRecesso, setDataRecesso] = useState(hojeLocal())
  const [motivoRecesso, setMotivoRecesso] = useState('Recesso acadêmico')

  const proximoFeriadoAtual = useMemo(() => {
    if (!semestre) return null
    return proximoFeriado(semestre.inicio, semestre.fim)
  }, [semestre])

  async function carregar() {
    const firestore = db
    if (!firestore || !user) return
    setErro(null)

    try {
      const [semestresSnap, disciplinasSnap, extrasSnap] = await Promise.all([
        getDocs(query(collection(firestore, 'users', user.uid, 'semestres'), orderBy('created_at', 'asc'))),
        getDocs(query(collection(firestore, 'users', user.uid, 'disciplinas'), orderBy('created_at', 'asc'))),
        getDocs(query(collection(firestore, 'users', user.uid, 'diasSemAula'), orderBy('data', 'asc'))),
      ])

      const semestreDoc = semestresSnap.docs[0] ?? null
      const sem = semestreDoc
        ? ({ id: semestreDoc.id, ...(semestreDoc.data() as Omit<Semestre, 'id'>) } as Semestre)
        : null

      if (sem) {
        setInicio(sem.inicio)
        setFim(sem.fim)
      }

      const disciplinasCarregadas = await Promise.all(
        disciplinasSnap.docs.map(async (discSnap) => {
          const rawDisciplina = discSnap.data() as Omit<Disciplina, 'id' | 'horarios' | 'faltas'>

          const [horariosSnap, faltasSnap] = await Promise.all([
            getDocs(
              query(collection(firestore, 'users', user.uid, 'disciplinas', discSnap.id, 'horarios'), orderBy('created_at', 'asc')),
            ),
            getDocs(
              query(collection(firestore, 'users', user.uid, 'disciplinas', discSnap.id, 'faltas'), orderBy('created_at', 'asc')),
            ),
          ])

          return {
            id: discSnap.id,
            ...rawDisciplina,
            horarios: horariosSnap.docs.map((docSnap) => ({
              id: docSnap.id,
              ...(docSnap.data() as Omit<Horario, 'id'>),
            })) as Horario[],
            faltas: faltasSnap.docs.map((docSnap) => ({
              id: docSnap.id,
              ...(docSnap.data() as Omit<Falta, 'id'>),
            })) as Falta[],
          } as Disciplina
        }),
      )

      setSemestre(sem)
      setDisciplinas(disciplinasCarregadas)
      setExtras(
        extrasSnap.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<DiaSemAula, 'id'>),
        })) as DiaSemAula[],
      )
    } catch (error) {
      setErro(mensagemSchema(error instanceof Error ? error.message : 'Erro ao carregar dados do Firebase.'))
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    void carregar()
  }, [user])

  const horarios = useMemo(() => disciplinas.flatMap((d) => d.horarios), [disciplinas])

  const resumo = useMemo(() => {
    if (!semestre) return null
    return expandirSemestre(semestre.inicio, semestre.fim, horarios, extras)
  }, [semestre, horarios, extras])

  async function salvarSemestre(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    const firestore = db
    if (!firestore || !user) return
    if (fim < inicio) {
      setErro('A data final precisa ser depois do início.')
      return
    }

    try {
      const payload = {
        inicio,
        fim,
        user_id: user.uid,
        created_at: new Date().toISOString(),
      }

      if (semestre) {
        await updateDoc(doc(firestore, 'users', user.uid, 'semestres', semestre.id), { inicio, fim })
      } else {
        await addDoc(collection(firestore, 'users', user.uid, 'semestres'), payload)
      }

      await carregar()
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Erro ao salvar semestre.')
    }
  }

  async function criarDisciplina(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    const firestore = db
    if (!firestore || !user) return

    try {
      await addDoc(collection(firestore, 'users', user.uid, 'disciplinas'), {
        nome: nome.trim(),
        percentual_presenca: Number(percentual),
        user_id: user.uid,
        created_at: new Date().toISOString(),
      })

      setNome('')
      setPercentual('75')
      setModalDisc(false)
      await carregar()
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Erro ao criar disciplina.')
    }
  }


  // Aviso FormEvent Deprecated, utilizar SubmitEvent para não dar aviso mais.
  async function criarHorario(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    const firestore = db
    if (!firestore || !user) return

    try {
      await addDoc(collection(firestore, 'users', user.uid, 'disciplinas', disciplinaHorario, 'horarios'), {
        disciplina_id: disciplinaHorario,
        dia_semana: diaHorario,
        hora_inicio: horaInicio,
        hora_fim: horaFim,
        user_id: user.uid,
        created_at: new Date().toISOString(),
      })

      setModalHorario(false)
      await carregar()
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Erro ao criar horário.')
    }
  }

  function abrirHorario(dia: number, disciplinaId?: string) {
    setDiaHorario(dia)
    setDisciplinaHorario(disciplinaId ?? disciplinas[0]?.id ?? '')
    setModalHorario(true)
  }

  // Aviso FormEvent Deprecated, utilizar SubmitEvent para não dar aviso mais.
  async function criarFalta(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    const firestore = db
    if (!firestore || !user || !disciplinaFalta || !semestre) return

    const { previstas } = aulasDaDisciplina(
      disciplinaFalta.id,
      semestre.inicio,
      semestre.fim,
      disciplinaFalta.horarios,
      extras,
    )
    const noDia = previstas.filter((a) => a.data === dataFalta)
    if (noDia.length === 0) {
      setErro('Essa data não tem aula desta disciplina (feriado, recesso ou dia da semana diferente).')
      return
    }

    try {
      await addDoc(collection(firestore, 'users', user.uid, 'disciplinas', disciplinaFalta.id, 'faltas'), {
        disciplina_id: disciplinaFalta.id,
        data: dataFalta,
        quantidade: Number(qtdFalta),
        observacao: obsFalta.trim() || null,
        user_id: user.uid,
        created_at: new Date().toISOString(),
      })

      setDisciplinaFalta(null)
      setDataFalta(hojeLocal())
      setQtdFalta('1')
      setObsFalta('')
      await carregar()
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Erro ao registrar falta.')
    }
  }

  // Aviso FormEvent Deprecated, utilizar SubmitEvent para não dar aviso mais.
  async function criarRecesso(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    const firestore = db
    if (!firestore || !user) return

    try {
      await addDoc(collection(firestore, 'users', user.uid, 'diasSemAula'), {
        data: dataRecesso,
        motivo: motivoRecesso.trim() || 'Recesso',
        user_id: user.uid,
      })

      setModalRecesso(false)
      await carregar()
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Erro ao criar recesso.')
    }
  }

  async function excluirDisciplina(id: string) {
    const firestore = db
    if (!firestore || !user) return
    if (!confirm('Excluir esta disciplina, horários e faltas?')) return

    try {
      const [horariosSnap, faltasSnap] = await Promise.all([
        getDocs(collection(firestore, 'users', user.uid, 'disciplinas', id, 'horarios')),
        getDocs(collection(firestore, 'users', user.uid, 'disciplinas', id, 'faltas')),
      ])

      await Promise.all([
        ...horariosSnap.docs.map((docSnap) => deleteDoc(doc(firestore, 'users', user.uid, 'disciplinas', id, 'horarios', docSnap.id))),
        ...faltasSnap.docs.map((docSnap) => deleteDoc(doc(firestore, 'users', user.uid, 'disciplinas', id, 'faltas', docSnap.id))),
        deleteDoc(doc(firestore, 'users', user.uid, 'disciplinas', id)),
      ])

      await carregar()
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Erro ao excluir disciplina.')
    }
  }

  async function excluirFalta(disciplinaId: string, id: string) {
    const firestore = db
    if (!firestore || !user) return
    try {
      await deleteDoc(doc(firestore, 'users', user.uid, 'disciplinas', disciplinaId, 'faltas', id))
      await carregar()
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Erro ao excluir falta.')
    }
  }

  async function excluirHorario(disciplinaId: string, id: string) {
    const firestore = db
    if (!firestore || !user) return
    try {
      await deleteDoc(doc(firestore, 'users', user.uid, 'disciplinas', disciplinaId, 'horarios', id))
      await carregar()
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Erro ao excluir horário.')
    }
  }

  const datasFalta = disciplinaFalta && semestre
    ? aulasDaDisciplina(
        disciplinaFalta.id,
        semestre.inicio,
        semestre.fim,
        disciplinaFalta.horarios,
        extras,
      ).previstas.map((a) => a.data)
    : []
  const datasFaltaUnicas = [...new Set(datasFalta)]

  // Autofill data de faltas
  useEffect(() => {
    if (!disciplinaFalta || !semestre) return
    if (datasFaltaUnicas.length === 0) return

    const defaultDate = datasFaltaUnicas[0]
    setDataFalta(defaultDate)

    const { previstas } = aulasDaDisciplina(
      disciplinaFalta.id,
      semestre.inicio,
      semestre.fim,
      disciplinaFalta.horarios,
      extras,
    )

    const noDia = previstas.filter((a) => a.data === defaultDate)
    if (noDia.length > 0) {
      const cnt = count50MinAulas(noDia[0].horaInicio, noDia[0].horaFim)
      setQtdFalta(String(Math.max(1, cnt)))
    } else {
      setQtdFalta('1')
    }
  }, [disciplinaFalta, semestre, extras])

  // Recalcula quantidade de faltas ao mudar a data (em teste)
  useEffect(() => {
    if (!disciplinaFalta || !semestre) return

    const { previstas } = aulasDaDisciplina(
      disciplinaFalta.id,
      semestre.inicio,
      semestre.fim,
      disciplinaFalta.horarios,
      extras,
    )

    const noDia = previstas.filter((a) => a.data === dataFalta)
    if (noDia.length > 0) {
      const cnt = count50MinAulas(noDia[0].horaInicio, noDia[0].horaFim)
      setQtdFalta(String(Math.max(1, cnt)))
    }
  }, [dataFalta, disciplinaFalta, semestre, extras])

  return (
    <div className="mx-auto min-h-svh max-w-6xl px-4 py-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-emerald-400">SemDP</p>
          <h1 className="text-2xl font-semibold text-zinc-50">Grade e faltas</h1>
          <p className="text-sm text-zinc-500">{user?.email}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setModalDisc(true)}
            className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-emerald-400"
          >
            Nova disciplina
          </button>
          <button
            type="button"
            onClick={() => void signOut()}
            className="rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
          >
            Sair
          </button>
        </div>
      </header>

      {proximoFeriadoAtual && (
        <div className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-amber-300">Próximo feriado</p>
          <p className="mt-1 text-sm font-medium text-amber-100">
            {formatarData(proximoFeriadoAtual.data)} · {proximoFeriadoAtual.nome}
          </p>
        </div>
      )}

      <form
        onSubmit={salvarSemestre}
        className="mt-6 flex flex-wrap items-end gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4"
      >
        <label className="text-sm text-zinc-300">
          Início do semestre
          <input type="date" required value={inicio} onChange={(e) => setInicio(e.target.value)} className={inputClass} />
        </label>
        <label className="text-sm text-zinc-300">
          Fim do semestre
          <input type="date" required value={fim} onChange={(e) => setFim(e.target.value)} className={inputClass} />
        </label>
        <button
          type="submit"
          className="rounded-xl bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-white"
        >
          {semestre ? 'Atualizar período' : 'Definir semestre'}
        </button>
        {resumo && (
          <p className="text-sm text-zinc-400">
            {resumo.previstas.length} aula{resumo.previstas.length === 1 ? '' : 's'} no calendário ·{' '}
            {resumo.puladas.length} pulada{resumo.puladas.length === 1 ? '' : 's'} por feriado/recesso
          </p>
        )}
      </form>

      {erro && (
        <p className="mt-4 rounded-xl border border-rose-500/40 bg-rose-950/40 px-4 py-3 text-sm text-rose-200">
          {erro}
        </p>
      )}

      {carregando ? (
        <p className="mt-16 text-center text-zinc-500">Carregando…</p>
      ) : (
        <>
          <GradeSemana
            disciplinas={disciplinas}
            onAdd={(dia) => {
              if (disciplinas.length === 0) {
                setModalDisc(true)
                return
              }
              abrirHorario(dia)
            }}
          />

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-zinc-50">Disciplinas</h2>
            <button
              type="button"
              onClick={() => setModalRecesso(true)}
              className="text-sm text-zinc-400 hover:text-zinc-200"
            >
              + dia sem aula (recesso da faculdade)
            </button>
          </div>

          {disciplinas.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-zinc-800 px-6 py-16 text-center">
              <p className="text-zinc-300">Nenhuma disciplina ainda.</p>
              <p className="mt-1 text-sm text-zinc-500">Cadastre uma disciplina para começar a acompanhar presença.</p>
            </div>
          ) : (
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {disciplinas.map((disciplina) => (
                <DisciplinaCard
                  key={disciplina.id}
                  disciplina={disciplina}
                  semestre={semestre}
                  extras={extras}
                  onAddFalta={() => {
                    setDisciplinaFalta(disciplina)
                    setDataFalta(hojeLocal())
                    setQtdFalta('1')
                    setObsFalta('')
                  }}
                  onAddHorario={() => abrirHorario(diaHorario, disciplina.id)}
                  onDelete={() => void excluirDisciplina(disciplina.id)}
                  onDeleteFalta={(id) => void excluirFalta(disciplina.id, id)}
                  onDeleteHorario={(id) => void excluirHorario(disciplina.id, id)}
                />
              ))}
            </div>
          )}
        </>
      )}

      <Modal open={modalDisc} title="Nova disciplina" onClose={() => setModalDisc(false)}>
        <form onSubmit={criarDisciplina} className="space-y-4">
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
            <button type="button" onClick={() => setModalDisc(false)} className="rounded-xl border border-zinc-700 px-3 py-2 text-sm text-zinc-300">
              Cancelar
            </button>
            <button type="submit" className="rounded-xl bg-emerald-500 px-3 py-2 text-sm font-semibold text-zinc-950">
              Salvar disciplina
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={modalHorario} title="Novo horário" onClose={() => setModalHorario(false)}>
        <form onSubmit={criarHorario} className="space-y-4">
          <label className="block text-sm text-zinc-300">
            Disciplina
            <select
              required
              value={disciplinaHorario}
              onChange={(e) => setDisciplinaHorario(e.target.value)}
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
              <select value={diaHorario} onChange={(e) => setDiaHorario(Number(e.target.value))} className={inputClass}>
                {DIAS_SEMANA.map((dia) => (
                  <option key={dia.value} value={dia.value}>
                    {dia.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm text-zinc-300">
              Horário
              <div className="mt-1 flex gap-2">
                <input value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} className={inputClass} />
                <input value={horaFim} onChange={(e) => setHoraFim(e.target.value)} className={inputClass} />
              </div>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModalHorario(false)} className="rounded-xl border border-zinc-700 px-3 py-2 text-sm text-zinc-300">
              Cancelar
            </button>
            <button type="submit" className="rounded-xl bg-emerald-500 px-3 py-2 text-sm font-semibold text-zinc-950">
              Salvar horário
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={Boolean(disciplinaFalta)} title="Registrar falta" onClose={() => setDisciplinaFalta(null)}>
        {disciplinaFalta && (
          <form onSubmit={criarFalta} className="space-y-4">
            <div>
              <p className="text-sm text-zinc-400">Disciplina</p>
              <p className="text-lg font-medium text-zinc-100">{disciplinaFalta.nome}</p>
            </div>

            <label className="block text-sm text-zinc-300">
              Data
              <select value={dataFalta} onChange={(e) => setDataFalta(e.target.value)} className={inputClass}>
                {datasFaltaUnicas.map((data) => (
                  <option key={data} value={data}>
                    {formatarData(data)}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm text-zinc-300">
              Quantidade
              <input
                type="number"
                min={1}
                value={qtdFalta}
                onChange={(e) => setQtdFalta(e.target.value)}
                className={inputClass}
              />
            </label>

            <label className="block text-sm text-zinc-300">
              Observação
              <input
                value={obsFalta}
                onChange={(e) => setObsFalta(e.target.value)}
                className={inputClass}
                placeholder="Opcional"
              />
            </label>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setDisciplinaFalta(null)} className="rounded-xl border border-zinc-700 px-3 py-2 text-sm text-zinc-300">
                Cancelar
              </button>
              <button type="submit" className="rounded-xl bg-emerald-500 px-3 py-2 text-sm font-semibold text-zinc-950">
                Salvar falta
              </button>
            </div>
          </form>
        )}
      </Modal>

      <Modal open={modalRecesso} title="Dia sem aula" onClose={() => setModalRecesso(false)}>
        <form onSubmit={criarRecesso} className="space-y-4">
          <label className="block text-sm text-zinc-300">
            Data
            <input type="date" required value={dataRecesso} onChange={(e) => setDataRecesso(e.target.value)} className={inputClass} />
          </label>
          <label className="block text-sm text-zinc-300">
            Motivo
            <input value={motivoRecesso} onChange={(e) => setMotivoRecesso(e.target.value)} className={inputClass} />
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModalRecesso(false)} className="rounded-xl border border-zinc-700 px-3 py-2 text-sm text-zinc-300">
              Cancelar
            </button>
            <button type="submit" className="rounded-xl bg-emerald-500 px-3 py-2 text-sm font-semibold text-zinc-950">
              Salvar recesso
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
