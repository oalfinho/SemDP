import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  runTransaction,
  updateDoc,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../lib/firestore'
import { validarHistorico, validarSobreposicao } from '../domain/integridade'
import type {
  DadosAcademicos,
  DisciplinaInput,
  FaltaInput,
  HorarioInput,
  SemestreInput,
} from '../types'
import {
  lerDisciplina,
  lerFalta,
  lerHorario,
  lerRecesso,
  lerSemestre,
} from '../domain/normalizacao'
import { validarDisciplina, validarHorario, validarSemestre } from '../domain/validacao'
import { criarCalendario } from '../lib/calendario'
import { validarRegistroFalta } from '../domain/frequencia'
import { normalizarData } from '../lib/datas'

function banco() {
  if (!db) throw new Error('Firebase não configurado.')
  return db
}
function colecao(uid: string, name: string) {
  return collection(banco(), 'users', uid, name)
}
function disciplinaRef(uid: string, id: string) {
  return doc(banco(), 'users', uid, 'disciplinas', id)
}
const agora = () => new Date().toISOString()

/** Mantém os caminhos antigos. A compatibilidade acontece na leitura, sem migração destrutiva. */
export async function carregarDados(uid: string): Promise<DadosAcademicos> {
  const [semestresSnap, disciplinasSnap, recessosSnap] = await Promise.all([
    getDocs(colecao(uid, 'semestres')),
    getDocs(colecao(uid, 'disciplinas')),
    getDocs(colecao(uid, 'diasSemAula')),
  ])
  const semestres = semestresSnap.docs
    .map((item) => lerSemestre(item.id, item.data(), uid))
    .sort((a, b) => a.created_at.localeCompare(b.created_at) || a.id.localeCompare(b.id))
  // O app anterior sempre escolhia o primeiro semestre criado.
  const legado = semestres[0]?.id ?? ''
  const disciplinas = await Promise.all(
    disciplinasSnap.docs.map(async (item) => {
      const [horarios, faltas] = await Promise.all([
        getDocs(collection(item.ref, 'horarios')),
        getDocs(collection(item.ref, 'faltas')),
      ])
      return lerDisciplina(
        item.id,
        item.data(),
        uid,
        legado,
        horarios.docs.map((h) => lerHorario(h.id, h.data(), uid, item.id)),
        faltas.docs.map((f) => lerFalta(f.id, f.data(), uid, item.id)),
      )
    }),
  )
  return {
    semestres,
    disciplinas: disciplinas.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')),
    recessos: recessosSnap.docs
      .map((item) => lerRecesso(item.id, item.data(), uid, legado))
      .sort((a, b) => a.data.localeCompare(b.data)),
  }
}
export async function salvarSemestre(
  uid: string,
  input: SemestreInput,
  id?: string,
): Promise<string> {
  const value = validarSemestre(input)
  if (id) {
    const dados = await carregarDados(uid)
    const atual = dados.semestres.find((item) => item.id === id)
    if (!atual) throw new Error('Semestre não encontrado.')
    const proposto = { ...atual, ...value }
    for (const disciplina of dados.disciplinas.filter((item) => item.semestre_id === id)) {
      validarHistorico(disciplina, criarCalendario(proposto, disciplina.horarios, dados.recessos))
    }
    await updateDoc(doc(banco(), 'users', uid, 'semestres', id), value)
    return id
  }
  const ref = await addDoc(colecao(uid, 'semestres'), {
    ...value,
    user_id: uid,
    created_at: agora(),
  })
  return ref.id
}
export async function salvarDisciplina(
  uid: string,
  input: DisciplinaInput,
  id?: string,
): Promise<string> {
  const value = validarDisciplina(input)
  if (id) {
    await updateDoc(disciplinaRef(uid, id), value)
    return id
  }
  const ref = await addDoc(colecao(uid, 'disciplinas'), {
    ...value,
    user_id: uid,
    created_at: agora(),
  })
  return ref.id
}
export async function salvarHorario(
  uid: string,
  disciplinaId: string,
  input: HorarioInput,
  id?: string,
): Promise<void> {
  const value = validarHorario(input)
  const dados = await carregarDados(uid)
  const disciplina = dados.disciplinas.find((item) => item.id === disciplinaId)
  const semestre = dados.semestres.find((item) => item.id === disciplina?.semestre_id)
  if (!disciplina || !semestre) throw new Error('Disciplina ou semestre não encontrado.')
  if (
    (value.vigencia_inicio && value.vigencia_inicio < semestre.inicio) ||
    (value.vigencia_fim && value.vigencia_fim > semestre.fim)
  )
    throw new Error('A vigência precisa estar dentro do semestre.')
  const horarios = [
    ...disciplina.horarios.filter((item) => item.id !== id),
    { ...value, id: id ?? 'novo', user_id: uid, disciplina_id: disciplinaId, created_at: agora() },
  ]
  validarSobreposicao(horarios, semestre)
  validarHistorico(disciplina, criarCalendario(semestre, horarios, dados.recessos))
  const ref = disciplinaRef(uid, disciplinaId)
  // Quantidade de aulas é explícita: intervalo e duração institucional não são adivinhados.
  const clean = Object.fromEntries(Object.entries(value).filter(([, value]) => value !== undefined))
  if (id) await updateDoc(doc(ref, 'horarios', id), clean)
  else
    await addDoc(collection(ref, 'horarios'), {
      ...clean,
      disciplina_id: disciplinaId,
      user_id: uid,
      created_at: agora(),
    })
}
export async function excluirHorario(uid: string, disciplinaId: string, id: string): Promise<void> {
  const dados = await carregarDados(uid)
  const disciplina = dados.disciplinas.find((item) => item.id === disciplinaId)
  const semestre = dados.semestres.find((item) => item.id === disciplina?.semestre_id)
  if (!disciplina || !semestre) throw new Error('Disciplina ou semestre não encontrado.')
  validarHistorico(
    disciplina,
    criarCalendario(
      semestre,
      disciplina.horarios.filter((item) => item.id !== id),
      dados.recessos,
    ),
  )
  await deleteDoc(doc(disciplinaRef(uid, disciplinaId), 'horarios', id))
}
export async function registrarFalta(
  uid: string,
  disciplinaId: string,
  input: FaltaInput,
): Promise<void> {
  const firestore = banco()
  const parent = disciplinaRef(uid, disciplinaId)
  await runTransaction(firestore, async (transaction) => {
    const parentSnap = await transaction.get(parent)
    if (!parentSnap.exists()) throw new Error('Disciplina não encontrada.')
    // Recarrega dentro de cada tentativa. A revisão no pai serializa registros de faltas feitos por este app.
    const dados = await carregarDados(uid)
    const disciplina = dados.disciplinas.find((item) => item.id === disciplinaId)
    const semestre = dados.semestres.find((item) => item.id === disciplina?.semestre_id)
    if (!disciplina || !semestre) throw new Error('Defina o semestre da disciplina.')
    const encontros = criarCalendario(semestre, disciplina.horarios, dados.recessos)
    const value = validarRegistroFalta(disciplina, encontros, input)
    transaction.set(doc(collection(parent, 'faltas')), {
      ...value,
      user_id: uid,
      disciplina_id: disciplinaId,
      created_at: agora(),
    })
    transaction.update(parent, {
      faltas_revisao: Number(parentSnap.data().faltas_revisao ?? 0) + 1,
    })
  })
}
export async function excluirFalta(uid: string, disciplinaId: string, id: string): Promise<void> {
  const parent = disciplinaRef(uid, disciplinaId)
  await runTransaction(banco(), async (transaction) => {
    const snapshot = await transaction.get(parent)
    if (!snapshot.exists()) throw new Error('Disciplina não encontrada.')
    transaction.delete(doc(parent, 'faltas', id))
    transaction.update(parent, { faltas_revisao: Number(snapshot.data().faltas_revisao ?? 0) + 1 })
  })
}
export async function salvarRecesso(
  uid: string,
  semestreId: string,
  data: string,
  motivo: string,
): Promise<void> {
  const date = normalizarData(data)
  const dados = await carregarDados(uid)
  const semestre = dados.semestres.find((item) => item.id === semestreId)
  if (!semestre || date < semestre.inicio || date > semestre.fim)
    throw new Error('Escolha uma data dentro do semestre.')
  if (
    dados.disciplinas.some(
      (item) => item.semestre_id === semestreId && item.faltas.some((falta) => falta.data === date),
    )
  )
    throw new Error(
      'Já existem faltas nesta data. Corrija os registros antes de cadastrar o recesso.',
    )
  // ID determinístico evita duplicatas para o mesmo dia e semestre.
  const ref = doc(banco(), 'users', uid, 'diasSemAula', `${semestreId}_${date}`)
  await runTransaction(banco(), async (transaction) => {
    transaction.set(ref, {
      user_id: uid,
      semestre_id: semestreId,
      data: date,
      motivo: motivo.trim() || 'Recesso',
    })
  })
}
export async function excluirRecesso(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(banco(), 'users', uid, 'diasSemAula', id))
}
export async function excluirDisciplina(uid: string, id: string): Promise<void> {
  const parent = disciplinaRef(uid, id)
  const [horarios, faltas] = await Promise.all([
    getDocs(collection(parent, 'horarios')),
    getDocs(collection(parent, 'faltas')),
  ])
  const children = [...horarios.docs, ...faltas.docs]
  if (children.length > 498)
    throw new Error(
      'Esta disciplina tem muitos registros para excluir de uma vez. Exporte os dados e remova o histórico em partes.',
    )
  const batch = writeBatch(banco())
  children.forEach((item) => batch.delete(item.ref))
  batch.delete(parent)
  await batch.commit()
}
