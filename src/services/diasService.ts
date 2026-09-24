import { addDoc, collection, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../lib/firebase'

export async function criarDia(userId: string, disciplinaId: string, diaSemana: number): Promise<void> {
  if (!db) throw new Error('Firebase não inicializado')

  await addDoc(collection(db, 'users', userId, 'disciplinas', disciplinaId, 'dias'), {
    disciplina_id: disciplinaId,
    dia_semana: diaSemana,
  })
}

export async function excluirDia(userId: string, disciplinaId: string, diaId: string): Promise<void> {
  if (!db) throw new Error('Firebase não inicializado')
  await deleteDoc(doc(db, 'users', userId, 'disciplinas', disciplinaId, 'dias', diaId))
}
