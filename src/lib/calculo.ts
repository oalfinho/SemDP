export function limiteFaltas(totalAulas: number, percentualPresenca: number) {
  const ausenciasPermitidas = (100 - percentualPresenca) / 100
  return Math.floor(totalAulas * ausenciasPermitidas)
}

export function statusFaltas(usadas: number, limite: number) {
  const restantes = limite - usadas
  if (restantes < 0) return 'dp' as const
  if (restantes === 0) return 'limite' as const
  if (restantes <= 2) return 'alerta' as const
  return 'ok' as const
}
