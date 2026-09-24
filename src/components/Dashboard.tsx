import { useEffect, useMemo, useState, type SubmitEvent } from 'react'
import { GradeSemana } from './GradeSemana'
import { DisciplinaModal } from './modals/DisciplinaModal'
import { DiaAulaModal } from './modals/DiaAulaModal'
import { FaltaModal } from './modals/FaltaModal'
import { RecessoModal } from './modals/RecessoModal'
import { useAuth } from '../context/AuthContext'
import { hojeLocal, toISODate } from '../lib/datas'
import { proximoFeriado } from '../lib/feriados'
import { useDashboardData } from '../hooks/useDashboardData'
import type { Disciplina } from '../types'
import { criarDisciplina, excluirDisciplina } from '../services/disciplinasService'
import { criarDia, excluirDia } from '../services/diasService'
import { criarFalta, excluirFalta, validarFalta } from '../services/faltasService'
import { salvarSemestre } from '../services/semestreService'
import { criarRecesso } from '../services/recessosService'
import { DashboardHeader } from './dashboard/DashboardHeader'
import { DashboardError } from './dashboard/DashboardError'
import { DashboardEmpty } from './dashboard/DashboardEmpty'
import { DashboardSemesterForm } from './dashboard/DashboardSemesterForm'
import { DashboardDisciplinas } from './dashboard/DashboardDisciplinas'
import { DashboardFeriado } from './dashboard/DashboardFeriado'
import { DashboardResumo } from './dashboard/DashboardResumo'

export function Dashboard() {
  const { user, signOut } = useAuth()
  const { disciplinas, semestre, extras, loading, error, reload } = useDashboardData(user?.uid)
  const [appError, setAppError] = useState<string | null>(error)

  const [inicio, setInicio] = useState(hojeLocal())
  const [fim, setFim] = useState(() => {
    const d = new Date()
    d.setMonth(d.getMonth() + 4)
    return toISODate(d)
  })

  const [modalDisc, setModalDisc] = useState(false)
  const [modalDias, setModalDias] = useState(false)
  const [disciplinaFalta, setDisciplinaFalta] = useState<Disciplina | null>(null)
  const [modalRecesso, setModalRecesso] = useState(false)

  const [diaSelecionado, setDiaSelecionado] = useState<number | undefined>()
  const [disciplinaDiasId, setDisciplinaDiasId] = useState<string | undefined>()

  // Sincronizar início/fim com semestre carregado
  useEffect(() => {
    if (semestre) {
      setInicio(semestre.inicio)
      setFim(semestre.fim)
    }
  }, [semestre])

  // Sincronizar erro
  useEffect(() => {
    setAppError(error)
  }, [error])

  const proximoFeriadoAtual = useMemo(() => {
    if (!semestre) return null
    return proximoFeriado(semestre.inicio, semestre.fim)
  }, [semestre])

  const feriadoHoje = useMemo(() => {
    if (!proximoFeriadoAtual) return false
    const hoje = new Date()
    const dataHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())
    const [ano, mes, dia] = proximoFeriadoAtual.data.split('-').map(Number)
    const dataFeriado = new Date(ano, mes - 1, dia)
    return dataHoje.getTime() === dataFeriado.getTime()
  }, [proximoFeriadoAtual])


  async function handleSalvarSemestre(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!user) return
    if (fim < inicio) {
      setAppError('A data final precisa ser depois do início.')
      return
    }

    try {
      await salvarSemestre(user.uid, inicio, fim, semestre?.id)
      await reload()
    } catch (err) {
      setAppError(err instanceof Error ? err.message : 'Erro ao salvar semestre.')
    }
  }

  async function handleCriarDisciplina(nome: string, percentual: number, totalAulas: number) {
    if (!user) return

    try {
      const disciplinaId = await criarDisciplina(user.uid, nome, percentual, totalAulas)
      setModalDisc(false)
      setDisciplinaDiasId(disciplinaId)
      await reload()
      setModalDias(true)
    } catch (err) {
      setAppError(err instanceof Error ? err.message : 'Erro ao criar disciplina.')
    }
  }

  async function handleSalvarDias(disciplinaId: string, selecionados: number[]) {
    if (!user) return
    const disciplina = disciplinas.find((item) => item.id === disciplinaId)
    if (!disciplina) return
    const atuais = disciplina.dias ?? []
    try {
      await Promise.all([
        ...selecionados.filter((dia) => !atuais.some((item) => item.dia_semana === dia)).map((dia) => criarDia(user.uid, disciplinaId, dia)),
        ...atuais.filter((item) => !selecionados.includes(item.dia_semana)).map((item) => excluirDia(user.uid, disciplinaId, item.id)),
      ])
      setModalDias(false)
      await reload()
    } catch (err) {
      setAppError(err instanceof Error ? err.message : 'Erro ao salvar dias da disciplina.')
    }
  }

  async function handleCriarFalta(data: string, quantidade: number, observacao: string) {
    if (!user || !disciplinaFalta || !semestre) return

    if (!validarFalta(disciplinaFalta, semestre, extras, data)) {
      setAppError(
        'Essa data não tem aula desta disciplina (feriado, recesso ou dia da semana diferente).'
      )
      return
    }

    try {
      await criarFalta(user.uid, disciplinaFalta.id, data, quantidade, observacao)
      setDisciplinaFalta(null)
      await reload()
    } catch (err) {
      setAppError(err instanceof Error ? err.message : 'Erro ao registrar falta.')
    }
  }

  async function handleCriarRecesso(data: string, motivo: string) {
    if (!user) return

    try {
      await criarRecesso(user.uid, data, motivo)
      setModalRecesso(false)
      await reload()
    } catch (err) {
      setAppError(err instanceof Error ? err.message : 'Erro ao criar recesso.')
    }
  }

  async function handleExcluirDisciplina(id: string) {
    if (!user) return
    if (!confirm('Excluir esta disciplina, dias e faltas?')) return

    try {
      await excluirDisciplina(user.uid, id)
      await reload()
    } catch (err) {
      setAppError(err instanceof Error ? err.message : 'Erro ao excluir disciplina.')
    }
  }

  async function handleExcluirFalta(disciplinaId: string, id: string) {
    if (!user) return

    try {
      await excluirFalta(user.uid, disciplinaId, id)
      await reload()
    } catch (err) {
      setAppError(err instanceof Error ? err.message : 'Erro ao excluir falta.')
    }
  }


  function abrirDias(dia?: number, disciplinaId?: string) {
    setDiaSelecionado(dia)
    setDisciplinaDiasId(disciplinaId)
    setModalDias(true)
  }

  return (
    <div className="mx-auto min-h-svh max-w-6xl px-4 py-8">

      <DashboardHeader
       email={user?.email}
       onNovaDisciplina={() => setModalDisc(true)}
       onLogout={() => void signOut()}
        />

      {!loading && <DashboardResumo disciplinas={disciplinas} />}

      {proximoFeriadoAtual && (
        <DashboardFeriado
        nome={proximoFeriadoAtual.nome}
        data={proximoFeriadoAtual.data}
        feriadoHoje={feriadoHoje}
  />
)}
      <DashboardSemesterForm
        inicio={inicio}
        fim={fim}
        semestre={semestre}
        onInicioChange={setInicio}
        onFimChange={setFim}
        onSubmit={handleSalvarSemestre}
        />
     
      <DashboardError message={appError} />

      {loading ? (
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
              abrirDias(dia)
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
           <DashboardEmpty />
          ) : (
           <DashboardDisciplinas
            disciplinas={disciplinas}
            onAddFalta={setDisciplinaFalta}
            onEditDias={(disciplina) => abrirDias(undefined, disciplina.id)}
            onDeleteDisciplina={handleExcluirDisciplina}
            onDeleteFalta={handleExcluirFalta}
        />
          )}
        </>
      )}

      <DisciplinaModal
        open={modalDisc}
        onClose={() => setModalDisc(false)}
        onSubmit={handleCriarDisciplina}
      />

      <DiaAulaModal
        open={modalDias}
        disciplinas={disciplinas}
        initialDia={diaSelecionado}
        initialDisciplinaId={disciplinaDiasId}
        onClose={() => setModalDias(false)}
        onSubmit={handleSalvarDias}
      />

      <FaltaModal
        open={Boolean(disciplinaFalta)}
        disciplina={disciplinaFalta}
        semestre={semestre}
        extras={extras}
        onClose={() => setDisciplinaFalta(null)}
        onSubmit={handleCriarFalta}
      />

      <RecessoModal
        open={modalRecesso}
        onClose={() => setModalRecesso(false)}
        onSubmit={handleCriarRecesso}
      />
    </div>
  )
}
