import { useCallback, useEffect, useRef, useState } from 'react'
import type { DadosAcademicos } from '../types'
import { carregarDados } from '../services/academicoRepository'
const VAZIO: DadosAcademicos = { disciplinas: [], semestres: [], recessos: [] }
export function useAcademicData(uid: string | undefined, demo?: DadosAcademicos) {
  const [dados, setDados] = useState<DadosAcademicos>(demo ?? VAZIO)
  const [loading, setLoading] = useState(!demo)
  const [error, setError] = useState<string | null>(null)
  const request = useRef(0)
  const mounted = useRef(false)
  const carregar = useCallback(async () => {
    if (demo || !uid) return
    const version = ++request.current
    try {
      const result = await carregarDados(uid)
      if (mounted.current && request.current === version) setDados(result)
    } catch (error) {
      if (mounted.current && request.current === version)
        setError(error instanceof Error ? error.message : 'Não foi possível carregar os dados.')
    } finally {
      if (mounted.current && request.current === version) setLoading(false)
    }
  }, [uid, demo])
  const reload = useCallback(async () => {
    if (demo || !uid) return
    setLoading(true)
    setError(null)
    await carregar()
  }, [carregar, uid, demo])
  useEffect(() => {
    mounted.current = true
    // O Dashboard é remontado pela identidade do usuário; respostas antigas são descartadas.
    // eslint-disable-next-line react/set-state-in-effect -- Sincroniza dados externos; setState ocorre após a resposta assíncrona.
    void carregar()
    return () => {
      mounted.current = false
    }
  }, [carregar])
  return { dados, loading, error, reload }
}
