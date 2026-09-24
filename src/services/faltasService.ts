import { addDoc, collection, deleteDoc, doc } from 'firebase/firestore'
import type { DiaSemAula, Disciplina, Semestre } from '../types'
import { datasDeAula } from '../lib/calendario'
import { db } from '../lib/firebase'

export async function criarFalta(
  userId: string,
  disciplinaId: string,
  data: string,
  quantidade: number,
  observacao: string | null,
): Promise<void> {
  const firestore = db
  if (!firestore) throw new Error('Firebase não inicializado')

  await addDoc(collection(firestore, 'users', userId, 'disciplinas', disciplinaId, 'faltas'), {
    disciplina_id: disciplinaId,
    data,
    quantidade,
    observacao: observacao?.trim() || null,
    user_id: userId,
    created_at: new Date().toISOString(),
  })
}

export async function excluirFalta(userId: string, disciplinaId: string, faltaId: string): Promise<void> {
  const firestore = db
  if (!firestore) throw new Error('Firebase não inicializado')

  await deleteDoc(doc(firestore, 'users', userId, 'disciplinas', disciplinaId, 'faltas', faltaId))
}

export function validarFalta(
  disciplina: Disciplina,
  semestre: Semestre,
  extras: DiaSemAula[],
  data: string,
): boolean {
  const datasValidas = datasDeAula(
    semestre.inicio,
    semestre.fim,
    disciplina.dias,
    extras,
  )
  return datasValidas.includes(data)
}
