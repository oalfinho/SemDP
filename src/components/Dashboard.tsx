import { AppShell } from './AppShell'
import { AcademicEditor } from './AcademicEditor'
import { Settings } from './views/Settings'
import type { Tab, Editor } from './dashboardTypes'
import { useMemo, useState } from 'react'
import { useAuth } from '../context/authContextValue'
import { useAcademicData } from '../hooks/useAcademicData'
import { useAcademicActions } from '../hooks/useAcademicActions'
import { criarCalendario } from '../lib/calendario'
import { hojeLocal } from '../lib/datas'
import { criarDemonstracao } from '../lib/demo'
import { resumirDisciplina } from '../domain/frequencia'
import * as repository from '../services/academicoRepository'
import { Icon } from './Icon'

import { Overview, SubjectSummary } from './views/Overview'
import { SubjectDetail } from './views/SubjectDetail'
import { Agenda } from './views/Agenda'

export function Dashboard({ demo = false }: { demo?: boolean }) {
  const { user, signOut } = useAuth()
  const demonstration = useMemo(() => (demo ? criarDemonstracao() : undefined), [demo])
  const { dados, loading, error, reload } = useAcademicData(
    demo ? undefined : user?.uid,
    demonstration,
  )
  const actions = useAcademicActions(reload, demo)
  const [tab, setTab] = useState<Tab>('home')
  const [semesterId, setSemesterId] = useState('')
  const [subjectId, setSubjectId] = useState<string | null>(null)
  const [editor, setEditor] = useState<Editor | null>(null)
  const [search, setSearch] = useState('')
  const hoje = hojeLocal()
  const semestre =
    dados.semestres.find((item) => item.id === semesterId) ??
    dados.semestres.find((item) => item.inicio <= hoje && item.fim >= hoje) ??
    dados.semestres.at(-1)
  const disciplinas = useMemo(
    () => dados.disciplinas.filter((item) => item.semestre_id === semestre?.id),
    [dados.disciplinas, semestre?.id],
  )
  const encontros = useMemo(
    () =>
      semestre
        ? criarCalendario(
            semestre,
            disciplinas.flatMap((item) => item.horarios),
            dados.recessos,
          )
        : [],
    [semestre, disciplinas, dados.recessos],
  )
  const resumos = useMemo(
    () => disciplinas.map((item) => resumirDisciplina(item, encontros)),
    [disciplinas, encontros],
  )
  const detalhe = resumos.find((item) => item.disciplina.id === subjectId)
  const uid = user?.uid ?? ''

  function abrir(value: Editor) {
    actions.limpar()
    setEditor(value)
  }
  function navegar(value: Tab) {
    window.scrollTo({ top: 0 })
    setTab(value)
    setSubjectId(null)
    actions.limpar()
  }
  function abrirDisciplina(id: string) {
    window.scrollTo({ top: 0 })
    setTab('subjects')
    setSubjectId(id)
  }
  function registrarFalta(id: string, data?: string) {
    const disciplina = disciplinas.find((item) => item.id === id)
    if (disciplina) abrir({ type: 'absence', disciplina, data })
  }
  function confirmar(
    message: string,
    action: () => Promise<unknown>,
    success: string,
    callback?: () => void,
  ) {
    if (window.confirm(message)) void actions.executar(action, success, callback)
  }
  function exportar() {
    const url = URL.createObjectURL(
      new Blob(
        [
          JSON.stringify(
            { schemaVersion: 3, exportadoEm: new Date().toISOString(), ...dados },
            null,
            2,
          ),
        ],
        { type: 'application/json' },
      ),
    )
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `semdp-backup-${hoje}.json`
    anchor.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  const fechar = () => setEditor(null)

  return (
    <AppShell
      demo={demo}
      user={user}
      tab={tab}
      semestre={semestre}
      semestres={dados.semestres}
      busy={actions.busy}
      navegar={navegar}
      onSemesterChange={(id) => {
        setSemesterId(id)
        setSubjectId(null)
        setEditor(null)
      }}
    >
      {error && (
        <div className="message error" role="alert">
          {error}
          <button className="button small" onClick={() => void reload()}>
            Tentar novamente
          </button>
        </div>
      )}
      {actions.notice && (
        <p className="message success" role="status">
          {actions.notice}
        </p>
      )}
      {!editor && actions.error && (
        <p className="message error" role="alert">
          {actions.error}
        </p>
      )}
      {loading && (
        <p className="message" role="status">
          Atualizando seus dados…
        </p>
      )}
      {!loading && !error && !semestre && (
        <section className="panel onboarding">
          <span className="eyebrow">COMECE POR AQUI</span>
          <h2>Um semestre mais organizado.</h2>
          <p>
            Defina o período, cadastre suas disciplinas e monte sua grade. O SemDP cuida dos
            cálculos.
          </p>
          <button className="button primary" onClick={() => abrir({ type: 'semester' })}>
            Configurar primeiro semestre <Icon name="arrow" />
          </button>
        </section>
      )}
      {!semestre && tab === 'settings' && (
        <section className="panel">
          <h2>Sua conta</h2>
          <p className="hint">{user?.email}</p>
          <button
            className="button danger"
            disabled={actions.busy}
            onClick={() => void actions.executar(signOut, 'Sessão encerrada.')}
          >
            Sair da conta
          </button>
        </section>
      )}
      {semestre && (
        <>
          {!disciplinas.length && tab !== 'settings' && (
            <section className="panel onboarding">
              <h2>Seu semestre está pronto.</h2>
              <p>Adicione sua primeira disciplina para acompanhar a frequência.</p>
              <button className="button primary" onClick={() => abrir({ type: 'subject' })}>
                + Adicionar disciplina
              </button>
            </section>
          )}
          {tab === 'home' && disciplinas.length > 0 && (
            <Overview
              resumos={resumos}
              encontros={encontros}
              onSubject={abrirDisciplina}
              onAbsence={registrarFalta}
            />
          )}
          {tab === 'subjects' &&
            (detalhe ? (
              <SubjectDetail
                resumo={detalhe}
                busy={actions.busy}
                onBack={() => setSubjectId(null)}
                onEdit={() => abrir({ type: 'subject', value: detalhe.disciplina })}
                onSchedule={(value) =>
                  abrir({ type: 'schedule', disciplina: detalhe.disciplina, value })
                }
                onAbsence={() => registrarFalta(detalhe.disciplina.id)}
                onDeleteAbsence={(id) =>
                  confirmar(
                    'Remover este registro de falta?',
                    () => repository.excluirFalta(uid, detalhe.disciplina.id, id),
                    'Falta removida.',
                  )
                }
                onDeleteSchedule={(id) =>
                  confirmar(
                    'Excluir este horário recalcula as estimativas do semestre. Para mudanças de grade, prefira editar a vigência. Excluir mesmo assim?',
                    () => repository.excluirHorario(uid, detalhe.disciplina.id, id),
                    'Horário excluído.',
                  )
                }
                onDelete={() =>
                  confirmar(
                    'Excluir permanentemente esta disciplina, seus horários e todo o histórico de faltas?',
                    () => repository.excluirDisciplina(uid, detalhe.disciplina.id),
                    'Disciplina excluída.',
                    () => setSubjectId(null),
                  )
                }
              />
            ) : (
              <>
                <div className="section-heading">
                  <label className="search">
                    <span className="sr-only">Buscar disciplina</span>
                    <input
                      type="search"
                      placeholder="Buscar disciplina…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </label>
                  <button className="button primary" onClick={() => abrir({ type: 'subject' })}>
                    <Icon name="plus" />
                    Disciplina
                  </button>
                </div>
                <div className="subjects-grid">
                  {resumos
                    .filter((item) =>
                      item.disciplina.nome
                        .toLocaleLowerCase('pt-BR')
                        .includes(search.toLocaleLowerCase('pt-BR')),
                    )
                    .map((item) => (
                      <SubjectSummary
                        key={item.disciplina.id}
                        resumo={item}
                        onOpen={() => setSubjectId(item.disciplina.id)}
                      />
                    ))}
                </div>
                {search &&
                  !resumos.some((item) =>
                    item.disciplina.nome.toLowerCase().includes(search.toLowerCase()),
                  ) && <p className="empty">Nenhuma disciplina encontrada.</p>}
              </>
            ))}
          {tab === 'agenda' && (
            <Agenda
              key={semestre.id}
              encontros={encontros}
              disciplinas={disciplinas}
              semestre={semestre}
              onAbsence={registrarFalta}
              onBreak={() => abrir({ type: 'break' })}
            />
          )}
          {tab === 'settings' && (
            <Settings
              semestre={semestre}
              recessos={dados.recessos}
              busy={actions.busy}
              demo={demo}
              email={user?.email}
              abrir={abrir}
              exportar={exportar}
              onDeleteBreak={(id) =>
                confirmar(
                  'Remover este dia sem aula? A estimativa será recalculada.',
                  () => repository.excluirRecesso(uid, id),
                  'Recesso removido.',
                )
              }
              onLogout={() =>
                demo
                  ? window.location.assign('/')
                  : void actions.executar(signOut, 'Sessão encerrada.')
              }
            />
          )}
        </>
      )}
      {editor && (
        <AcademicEditor
          editor={editor}
          semestre={semestre}
          disciplinas={disciplinas}
          encontros={encontros}
          uid={uid}
          actions={actions}
          fechar={fechar}
          setSemesterId={setSemesterId}
          abrirDisciplina={abrirDisciplina}
        />
      )}
    </AppShell>
  )
}
