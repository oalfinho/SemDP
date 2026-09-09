import { addDoc, collection, doc, getDocs, orderBy, query, updateDoc } from 'firebase/firestore'
import type { Semestre } from '../types'
import { db } from '../lib/firebase'

export async function carregarSemestre(userId: string): Promise<Semestre | null> {
  const firestore = db
  if (!firestore) throw new Error('Firebase não inicializado')

  const semestresSnap = await getDocs(
    query(collection(firestore, 'users', userId, 'semestres'), orderBy('created_at', 'asc')),
  )

  const semestreDoc = semestresSnap.docs[0]
  if (!semestreDoc) return null

  return {
    id: semestreDoc.id,
    ...(semestreDoc.data() as Omit<Semestre, 'id'>),
  } as Semestre
}

export async function salvarSemestre(userId: string, inicio: string, fim: string, semestreId?: string): Promise<void> {
  const firestore = db
  if (!firestore) throw new Error('Firebase não inicializado')

  if (semestreId) {
    await updateDoc(doc(firestore, 'users', userId, 'semestres', semestreId), {
      inicio,
      fim,
    })
  } else {
    await addDoc(collection(firestore, 'users', userId, 'semestres'), {
      inicio,
      fim,
      user_id: userId,
      created_at: new Date().toISOString(),
    })
  }
}
