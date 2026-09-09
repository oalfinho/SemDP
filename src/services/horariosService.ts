import { addDoc, collection, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../lib/firebase'

export async function criarHorario(
  userId: string,
  disciplinaId: string,
  dia_semana: number,
  hora_inicio: string,
  hora_fim: string,
): Promise<void> {
  const firestore = db
  if (!firestore) throw new Error('Firebase não inicializado')

  await addDoc(collection(firestore, 'users', userId, 'disciplinas', disciplinaId, 'horarios'), {
    disciplina_id: disciplinaId,
    dia_semana,
    hora_inicio,
    hora_fim,
    user_id: userId,
    created_at: new Date().toISOString(),
  })
}

export async function excluirHorario(userId: string, disciplinaId: string, horarioId: string): Promise<void> {
  const firestore = db
  if (!firestore) throw new Error('Firebase não inicializado')

  await deleteDoc(doc(firestore, 'users', userId, 'disciplinas', disciplinaId, 'horarios', horarioId))
}
