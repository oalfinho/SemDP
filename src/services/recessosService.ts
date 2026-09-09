import { addDoc, collection, getDocs, orderBy, query } from 'firebase/firestore'
import type { DiaSemAula } from '../types'
import { db } from '../lib/firebase'

export async function criarRecesso(userId: string, data: string, motivo: string | null): Promise<void> {
  const firestore = db
  if (!firestore) throw new Error('Firebase não inicializado')

  await addDoc(collection(firestore, 'users', userId, 'diasSemAula'), {
    data,
    motivo: motivo?.trim() || 'Recesso',
    user_id: userId,
  })
}

export async function carregarRecessos(userId: string): Promise<DiaSemAula[]> {
  const firestore = db
  if (!firestore) throw new Error('Firebase não inicializado')

  const extrasSnap = await getDocs(
    query(collection(firestore, 'users', userId, 'diasSemAula'), orderBy('data', 'asc')),
  )

  return extrasSnap.docs.map((docSnap) => ({
    id: docSnap.id,
    ...(docSnap.data() as Omit<DiaSemAula, 'id'>),
  })) as DiaSemAula[]
}
