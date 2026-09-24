import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query } from 'firebase/firestore'
import type { DiaAula, Disciplina, Falta } from '../types'
import { db } from '../lib/firebase'

export async function criarDisciplina(
  userId: string,
  nome: string,
  percentual_presenca: number,
  total_aulas: number,
): Promise<string> {
  const firestore = db
  if (!firestore) throw new Error('Firebase não inicializado')

  const referencia = await addDoc(collection(firestore, 'users', userId, 'disciplinas'), {
    nome: nome.trim(),
    percentual_presenca,
    total_aulas,
    user_id: userId,
    created_at: new Date().toISOString(),
  })
  return referencia.id
}

export async function carregarDisciplinas(userId: string): Promise<Disciplina[]> {
  const firestore = db
  if (!firestore) throw new Error('Firebase não inicializado')

  const disciplinasSnap = await getDocs(
    query(collection(firestore, 'users', userId, 'disciplinas'), orderBy('created_at', 'asc')),
  )

  const disciplinas = await Promise.all(
    disciplinasSnap.docs.map(async (discSnap) => {
      const rawDisciplina = discSnap.data() as Partial<Omit<Disciplina, 'id' | 'dias' | 'faltas'>>

      const [diasSnap, faltasSnap] = await Promise.all([
        getDocs(
          query(
            collection(firestore, 'users', userId, 'disciplinas', discSnap.id, 'dias'),
            orderBy('dia_semana', 'asc'),
          ),
        ),
        getDocs(
          query(
            collection(firestore, 'users', userId, 'disciplinas', discSnap.id, 'faltas'),
            orderBy('created_at', 'asc'),
          ),
        ),
      ])

      return {
        id: discSnap.id,
        user_id: rawDisciplina.user_id ?? userId,
        nome: rawDisciplina.nome ?? 'Disciplina sem nome',
        percentual_presenca: rawDisciplina.percentual_presenca ?? 75,
        total_aulas: rawDisciplina.total_aulas ?? 0,
        created_at: rawDisciplina.created_at ?? '',
        dias: diasSnap.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<DiaAula, 'id'>),
          disciplina_id: discSnap.id,
        })) as DiaAula[],
        faltas: faltasSnap.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<Falta, 'id'>),
        })) as Falta[],
      } as Disciplina
    }),
  )

  return disciplinas
}

export async function excluirDisciplina(userId: string, disciplinaId: string): Promise<void> {
  const firestore = db
  if (!firestore) throw new Error('Firebase não inicializado')

  const [diasSnap, faltasSnap] = await Promise.all([
    getDocs(collection(firestore, 'users', userId, 'disciplinas', disciplinaId, 'dias')),
    getDocs(collection(firestore, 'users', userId, 'disciplinas', disciplinaId, 'faltas')),
  ])

  await Promise.all([
    ...diasSnap.docs.map((docSnap) =>
      deleteDoc(doc(firestore, 'users', userId, 'disciplinas', disciplinaId, 'dias', docSnap.id)),
    ),
    ...faltasSnap.docs.map((docSnap) =>
      deleteDoc(doc(firestore, 'users', userId, 'disciplinas', disciplinaId, 'faltas', docSnap.id)),
    ),
    deleteDoc(doc(firestore, 'users', userId, 'disciplinas', disciplinaId)),
  ])
}
