
import { useEffect, useState } from 'react'
import type { Disciplina, Semestre, DiaSemAula } from '../types'
import { carregarDisciplinas } from '../services/disciplinasService'
import { carregarSemestre } from '../services/semestreService'
import { carregarRecessos } from '../services/recessosService'

interface UseDashboardDataReturn {
  disciplinas: Disciplina[]
  semestre: Semestre | null
  extras: DiaSemAula[]
  loading: boolean
  error: string | null
  reload: () => Promise<void>
}

export function useDashboardData(userId: string | undefined): UseDashboardDataReturn {
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([])
  const [semestre, setSemestre] = useState<Semestre | null>(null)
  const [extras, setExtras] = useState<DiaSemAula[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function carregarDados() {
    if (!userId) {
      setLoading(false)
      return
    }

    setError(null)

    try {
      const [disciplinasData, semestreData, extrasData] = await Promise.all([
        carregarDisciplinas(userId),
        carregarSemestre(userId),
        carregarRecessos(userId),
      ])

      setDisciplinas(disciplinasData)
      setSemestre(semestreData)
      setExtras(extrasData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados do Firebase.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void carregarDados()
  }, [userId])

  return {
    disciplinas,
    semestre,
    extras,
    loading,
    error,
    reload: carregarDados,
  }
}
