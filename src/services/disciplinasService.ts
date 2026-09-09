import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query } from 'firebase/firestore'
import type { Disciplina, Falta, Horario } from '../types'
import { db } from '../lib/firebase'

export async function criarDisciplina(
  userId: string,
  nome: string,
  percentual_presenca: number,
): Promise<void> {
  const firestore = db
  if (!firestore) throw new Error('Firebase não inicializado')

  await addDoc(collection(firestore, 'users', userId, 'disciplinas'), {
    nome: nome.trim(),
    percentual_presenca,
    user_id: userId,
    created_at: new Date().toISOString(),
  })
}

export async function carregarDisciplinas(userId: string): Promise<Disciplina[]> {
  const firestore = db
  if (!firestore) throw new Error('Firebase não inicializado')

  const disciplinasSnap = await getDocs(
    query(collection(firestore, 'users', userId, 'disciplinas'), orderBy('created_at', 'asc')),
  )

  const disciplinas = await Promise.all(
    disciplinasSnap.docs.map(async (discSnap) => {
      const rawDisciplina = discSnap.data() as Omit<Disciplina, 'id' | 'horarios' | 'faltas'>

      const [horariosSnap, faltasSnap] = await Promise.all([
        getDocs(
          query(
            collection(firestore, 'users', userId, 'disciplinas', discSnap.id, 'horarios'),
            orderBy('created_at', 'asc'),
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

  return disciplinas
}

export async function excluirDisciplina(userId: string, disciplinaId: string): Promise<void> {
  const firestore = db
  if (!firestore) throw new Error('Firebase não inicializado')

  const [horariosSnap, faltasSnap] = await Promise.all([
    getDocs(collection(firestore, 'users', userId, 'disciplinas', disciplinaId, 'horarios')),
    getDocs(collection(firestore, 'users', userId, 'disciplinas', disciplinaId, 'faltas')),
  ])

  await Promise.all([
    ...horariosSnap.docs.map((docSnap) =>
      deleteDoc(doc(firestore, 'users', userId, 'disciplinas', disciplinaId, 'horarios', docSnap.id)),
    ),
    ...faltasSnap.docs.map((docSnap) =>
      deleteDoc(doc(firestore, 'users', userId, 'disciplinas', disciplinaId, 'faltas', docSnap.id)),
    ),
    deleteDoc(doc(firestore, 'users', userId, 'disciplinas', disciplinaId)),
  ])
}
