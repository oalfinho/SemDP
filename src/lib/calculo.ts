import { minutosDoHorario } from '../domain/validacao'
export const MINUTOS_POR_AULA = 50

/** Usado apenas como sugestão e para horários legados sem quantidade explícita. */
export function calcularAulasPorHorario(inicio: string, fim: string): number {
  return Math.max(
    0,
    Math.floor((minutosDoHorario(fim) - minutosDoHorario(inicio)) / MINUTOS_POR_AULA),
  )
}
export function limiteFaltas(total: number, presenca: number): number {
  return Math.floor((total * (100 - presenca)) / 100 + 1e-9)
}
export function statusFaltas(usadas: number, limite: number) {
  if (usadas > limite) return 'excedido' as const
  if (usadas === limite) return 'limite' as const
  if (limite - usadas <= Math.max(2, Math.ceil(limite * 0.2))) return 'alerta' as const
  return 'ok' as const
}
