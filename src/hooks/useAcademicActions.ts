import { useRef, useState } from 'react'

/** Erros de gravação permanecem no formulário; falha de leitura não repete uma gravação concluída. */
export function useAcademicActions(reload: () => Promise<void>, demo: boolean) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const lock = useRef(false)
  async function executar(
    action: () => Promise<unknown>,
    message: string,
    onSuccess?: () => void,
  ): Promise<void> {
    if (lock.current) return
    setError(null)
    if (demo) {
      setError('Esta é uma demonstração. Entre na sua conta para salvar alterações.')
      return
    }
    lock.current = true
    setBusy(true)
    try {
      await action()
      onSuccess?.()
      setNotice(message)
      await reload()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Não foi possível salvar. Tente novamente.')
    } finally {
      lock.current = false
      setBusy(false)
    }
  }
  return {
    executar,
    busy,
    error,
    notice,
    limpar: () => {
      setError(null)
      setNotice(null)
    },
  }
}
