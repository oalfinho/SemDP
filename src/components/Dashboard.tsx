import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { DisciplinaCard } from './DisciplinaCard'
import { GradeSemana } from './GradeSemana'
import { Modal } from './Modal'
import { useAuth } from '../context/AuthContext'
import { aulasDaDisciplina, expandirSemestre } from '../lib/calendario'
import { DIAS_SEMANA, formatarData, hojeLocal, toISODate } from '../lib/datas'
import { mapaFeriados } from '../lib/feriados'
import { supabase } from '../lib/supabase'
import type { DiaSemAula, Disciplina, Semestre } from '../types'

const inputClass =
  'mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none focus:border-emerald-500'

function mensagemSchema(msg: string) {
  if (/schema cache|does not exist|could not find the table/i.test(msg)) {
    return 'O banco ainda está no schema antigo. No Supabase: SQL Editor → cole supabase/schema.sql → Run. Depois recarregue a página.'
  }
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

  async function carregar() {
    if (!supabase) return
    setErro(null)

    const [semRes, discRes, extraRes] = await Promise.all([
      supabase.from('semestres').select('*').maybeSingle(),
      supabase
        .from('disciplinas')
        .select('*, horarios(*), faltas(*)')
        .order('created_at', { ascending: true }),
      supabase.from('dias_sem_aula').select('*').order('data', { ascending: true }),
    ])

    if (semRes.error && semRes.error.code !== 'PGRST116') setErro(mensagemSchema(semRes.error.message))
    if (discRes.error) setErro(mensagemSchema(discRes.error.message))
    if (extraRes.error) setErro(mensagemSchema(extraRes.error.message))

    const sem = (semRes.data as Semestre | null) ?? null
    setSemestre(sem)
    if (sem) {
      setInicio(sem.inicio)
      setFim(sem.fim)
    }
    setDisciplinas(
      ((discRes.data as Disciplina[]) ?? []).map((d) => ({
        ...d,
        horarios: d.horarios ?? [],
        faltas: d.faltas ?? [],
      })),
    )
    setExtras((extraRes.data as DiaSemAula[]) ?? [])
    setCarregando(false)
  }

  useEffect(() => {
    void carregar()
  }, [])

  const horarios = useMemo(() => disciplinas.flatMap((d) => d.horarios), [disciplinas])

  const resumo = useMemo(() => {
    if (!semestre) return null
    return expandirSemestre(semestre.inicio, semestre.fim, horarios, extras)
  }, [semestre, horarios, extras])

  const feriadosNoPeriodo = useMemo(() => {
    if (!semestre) return []
    return [...mapaFeriados(semestre.inicio, semestre.fim).entries()].sort(([a], [b]) =>
      a.localeCompare(b),
    )
  }, [semestre])

  async function salvarSemestre(e: FormEvent) {
    e.preventDefault()
    if (!supabase || !user) return
    if (fim < inicio) {
      setErro('A data final precisa ser depois do início.')
      return
    }
    const payload = { inicio, fim, user_id: user.id }
    const query = semestre
      ? supabase.from('semestres').update({ inicio, fim }).eq('id', semestre.id)
      : supabase.from('semestres').insert(payload)
    const { error } = await query
    if (error) setErro(error.message)
    else await carregar()
  }

  async function criarDisciplina(e: FormEvent) {
    e.preventDefault()
    if (!supabase) return
    const { error } = await supabase.from('disciplinas').insert({
      nome: nome.trim(),
      percentual_presenca: Number(percentual),
    })
    if (error) {
      setErro(error.message)
      return
    }
    setNome('')
    setPercentual('75')
    setModalDisc(false)
    await carregar()
  }

  async function criarHorario(e: FormEvent) {
    e.preventDefault()
    if (!supabase) return
    const { error } = await supabase.from('horarios').insert({
      disciplina_id: disciplinaHorario,
      dia_semana: diaHorario,
      hora_inicio: horaInicio,
      hora_fim: horaFim,
    })
    if (error) {
      setErro(error.message)
      return
    }
    setModalHorario(false)
    await carregar()
  }

  function abrirHorario(dia: number, disciplinaId?: string) {
    setDiaHorario(dia)
    setDisciplinaHorario(disciplinaId ?? disciplinas[0]?.id ?? '')
    setModalHorario(true)
  }

  async function criarFalta(e: FormEvent) {
    e.preventDefault()
    if (!supabase || !disciplinaFalta || !semestre) return

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

    const { error } = await supabase.from('faltas').insert({
      disciplina_id: disciplinaFalta.id,
      data: dataFalta,
      quantidade: Number(qtdFalta),
      observacao: obsFalta.trim() || null,
    })
    if (error) {
      setErro(error.message)
      return
    }
    setDisciplinaFalta(null)
    setDataFalta(hojeLocal())
    setQtdFalta('1')
    setObsFalta('')
    await carregar()
  }

  async function criarRecesso(e: FormEvent) {
    e.preventDefault()
    if (!supabase) return
    const { error } = await supabase.from('dias_sem_aula').insert({
      data: dataRecesso,
      motivo: motivoRecesso.trim() || 'Recesso',
    })
    if (error) {
      setErro(error.message)
      return
    }
    setModalRecesso(false)
    await carregar()
  }

  async function excluirDisciplina(id: string) {
    if (!supabase) return
    if (!confirm('Excluir esta disciplina, horários e faltas?')) return
    const { error } = await supabase.from('disciplinas').delete().eq('id', id)
    if (error) setErro(error.message)
    else await carregar()
  }

  async function excluirFalta(id: string) {
    if (!supabase) return
    const { error } = await supabase.from('faltas').delete().eq('id', id)
    if (error) setErro(error.message)
    else await carregar()
  }

  async function excluirHorario(id: string) {
    if (!supabase) return
    const { error } = await supabase.from('horarios').delete().eq('id', id)
    if (error) setErro(error.message)
    else await carregar()
  }

  async function excluirRecesso(id: string) {
    if (!supabase) return
    const { error } = await supabase.from('dias_sem_aula').delete().eq('id', id)
    if (error) setErro(error.message)
    else await carregar()
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
              <p className="mt-1 text-sm text-zinc-500">
                Ex.: Sexta — Mineração de dados 7:40–11:10 e Matemática 11:30–13:00.
              </p>
            </div>
          ) : (
            <section className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {disciplinas.map((d) => (
                <DisciplinaCard
                  key={d.id}
                  disciplina={d}
                  semestre={semestre}
                  extras={extras}
                  onAddFalta={() => {
                    setDisciplinaFalta(d)
                    const primeira = semestre
                      ? aulasDaDisciplina(d.id, semestre.inicio, semestre.fim, d.horarios, extras)
                          .previstas[0]?.data
                      : undefined
                    setDataFalta(primeira ?? hojeLocal())
                    setQtdFalta('1')
                  }}
                  onAddHorario={() => abrirHorario(5, d.id)}
                  onDelete={() => void excluirDisciplina(d.id)}
                  onDeleteFalta={(id) => void excluirFalta(id)}
                  onDeleteHorario={(id) => void excluirHorario(id)}
                />
              ))}
            </section>
          )}

          {semestre && (
            <section className="mt-10 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
              <h2 className="font-semibold text-zinc-50">Feriados no período</h2>
              <p className="mt-1 text-sm text-zinc-500">
                Nacionais e pontos móveis (Carnaval, Cinzas, Sexta Santa, Corpus Christi). Aulas nesses
                dias não entram no total.
              </p>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {feriadosNoPeriodo.length === 0 && (
                  <li className="text-sm text-zinc-500">Nenhum feriado entre as datas do semestre.</li>
                )}
                {feriadosNoPeriodo.map(([data, nome]) => (
                  <li key={data} className="text-sm text-zinc-300">
                    {formatarData(data)} — {nome}
                  </li>
                ))}
              </ul>
              {extras.length > 0 && (
                <>
                  <h3 className="mt-6 text-sm font-medium text-zinc-200">Recessos cadastrados</h3>
                  <ul className="mt-2 space-y-1">
                    {extras.map((d) => (
                      <li key={d.id} className="flex items-center justify-between text-sm text-zinc-300">
                        <span>
                          {formatarData(d.data)} — {d.motivo}
                        </span>
                        <button
                          type="button"
                          className="text-xs text-zinc-500 hover:text-rose-400"
                          onClick={() => void excluirRecesso(d.id)}
                        >
                          Tirar
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </section>
          )}
        </>
      )}

      <Modal open={modalDisc} title="Nova disciplina" onClose={() => setModalDisc(false)}>
        <form onSubmit={criarDisciplina} className="space-y-3">
          <label className="block text-sm text-zinc-300">
            Nome
            <input
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className={inputClass}
              placeholder="Mineração de dados"
            />
          </label>
          <label className="block text-sm text-zinc-300">
            Presença mínima (%)
            <input
              required
              min={50}
              max={100}
              type="number"
              value={percentual}
              onChange={(e) => setPercentual(e.target.value)}
              className={inputClass}
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-xl bg-emerald-500 px-4 py-2.5 font-medium text-zinc-950 hover:bg-emerald-400"
          >
            Salvar
          </button>
        </form>
      </Modal>

      <Modal open={modalHorario} title="Aula na grade" onClose={() => setModalHorario(false)}>
        <form onSubmit={criarHorario} className="space-y-3">
          <label className="block text-sm text-zinc-300">
            Disciplina
            <select
              required
              value={disciplinaHorario}
              onChange={(e) => setDisciplinaHorario(e.target.value)}
              className={inputClass}
            >
              {disciplinas.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nome}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm text-zinc-300">
            Dia da semana
            <select
              value={diaHorario}
              onChange={(e) => setDiaHorario(Number(e.target.value))}
              className={inputClass}
            >
              {DIAS_SEMANA.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm text-zinc-300">
              Início
              <input
                required
                type="time"
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="block text-sm text-zinc-300">
              Fim
              <input
                required
                type="time"
                value={horaFim}
                onChange={(e) => setHoraFim(e.target.value)}
                className={inputClass}
              />
            </label>
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-emerald-500 px-4 py-2.5 font-medium text-zinc-950 hover:bg-emerald-400"
          >
            Incluir na grade
          </button>
        </form>
      </Modal>

      <Modal
        open={disciplinaFalta !== null}
        title={disciplinaFalta ? `Falta em ${disciplinaFalta.nome}` : 'Falta'}
        onClose={() => setDisciplinaFalta(null)}
      >
        <form onSubmit={criarFalta} className="space-y-3">
          <label className="block text-sm text-zinc-300">
            Data da aula
            <select
              required
              value={dataFalta}
              onChange={(e) => setDataFalta(e.target.value)}
              className={inputClass}
            >
              {datasFaltaUnicas.length === 0 && <option value="">Nenhuma aula no calendário</option>}
              {datasFaltaUnicas.map((data) => (
                <option key={data} value={data}>
                  {formatarData(data)}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm text-zinc-300">
            Aulas perdidas neste dia
            <input
              required
              min={1}
              type="number"
              value={qtdFalta}
              onChange={(e) => setQtdFalta(e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="block text-sm text-zinc-300">
            Observação (opcional)
            <input
              value={obsFalta}
              onChange={(e) => setObsFalta(e.target.value)}
              className={inputClass}
              placeholder="Atestado, greve…"
            />
          </label>
          <button
            type="submit"
            disabled={datasFaltaUnicas.length === 0}
            className="w-full rounded-xl bg-emerald-500 px-4 py-2.5 font-medium text-zinc-950 hover:bg-emerald-400 disabled:opacity-50"
          >
            Registrar
          </button>
        </form>
      </Modal>

      <Modal open={modalRecesso} title="Dia sem aula" onClose={() => setModalRecesso(false)}>
        <form onSubmit={criarRecesso} className="space-y-3">
          <p className="text-sm text-zinc-400">
            Use para recesso da faculdade ou feriado municipal que não está na lista nacional.
          </p>
          <label className="block text-sm text-zinc-300">
            Data
            <input
              required
              type="date"
              value={dataRecesso}
              onChange={(e) => setDataRecesso(e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="block text-sm text-zinc-300">
            Motivo
            <input
              value={motivoRecesso}
              onChange={(e) => setMotivoRecesso(e.target.value)}
              className={inputClass}
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-xl bg-emerald-500 px-4 py-2.5 font-medium text-zinc-950 hover:bg-emerald-400"
          >
            Salvar
          </button>
        </form>
      </Modal>
    </div>
  )
}
