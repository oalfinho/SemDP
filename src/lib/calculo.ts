export const MinutosPorAula = 50;
export function converterHorasParaAulas(horasRelogio: number): number {
  const minutosTotais = horasRelogio * 60;
  return Math.floor(minutosTotais / MinutosPorAula);
}
export function calcularAulasPorHorario(
  horarioInicio: string, 
  horarioFim: string, 
  minutosIntervalo: number = 0
): number {
  const [hInicio, mInicio] = horarioInicio.split(':').map(Number);
  const [hFim, mFim] = horarioFim.split(':').map(Number);

  const inicioEmMinutos = hInicio * 60 + mInicio;
  const fimEmMinutos = hFim * 60 + mFim;

  const tempoEfetivoMinutos = (fimEmMinutos - inicioEmMinutos) - minutosIntervalo;

  if (tempoEfetivoMinutos <= 0) return 0;

  return Math.round(tempoEfetivoMinutos / MinutosPorAula);
}

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
export function calcularResumoDisciplina(params: {
  horasSemestrais?: number;    
  aulasSemestrais?: number;       
  faltasUsadas: number;          
  percentualPresenca?: number;    
}) {
  const {
    horasSemestrais,
    aulasSemestrais,
    faltasUsadas,
    percentualPresenca = 75
  } = params;

  const totalAulas = aulasSemestrais ?? (horasSemestrais ? converterHorasParaAulas(horasSemestrais) : 0);
  const limite = limiteFaltas(totalAulas, percentualPresenca);

  const status = statusFaltas(faltasUsadas, limite);
  const restantes = limite - faltasUsadas;

  return {
    totalAulas,
    limite,
    faltasUsadas,
    restantes,
    status
  };
}