import { test } from 'node:test'
import assert from 'node:assert/strict'
import { addDays, normalizarData, parseISODate, toISODate } from '../src/lib/datas'
import { calcularAulasPorHorario, limiteFaltas } from '../src/lib/calculo'
import { criarCalendario } from '../src/lib/calendario'
import { resumirDisciplina, validarRegistroFalta } from '../src/domain/frequencia'
import { validarDisciplina, validarHorario, validarSemestre } from '../src/domain/validacao'
import { lerDisciplina, lerFalta, lerHorario, lerRecesso } from '../src/domain/normalizacao'
import type { Disciplina, Horario, Semestre } from '../src/types'

const semestre: Semestre = {
  id: 's1',
  user_id: 'u',
  nome: '2026.2',
  inicio: '2026-10-01',
  fim: '2026-10-31',
  ignorar_feriados: true,
  created_at: '',
}
const horario: Horario = {
  id: 'h1',
  user_id: 'u',
  disciplina_id: 'd1',
  dia_semana: 1,
  hora_inicio: '19:00',
  hora_fim: '20:40',
  aulas: 2,
  created_at: '',
}
const disciplina: Disciplina = {
  id: 'd1',
  user_id: 'u',
  semestre_id: 's1',
  nome: 'Dados',
  percentual_presenca: 75,
  total_aulas: null,
  created_at: '',
  horarios: [horario],
  faltas: [],
}
const calendario = () => criarCalendario(semestre, [horario], [])

test('normaliza ISO e legado sem trocar dia e mês', () => {
  assert.equal(normalizarData('01-10-2026'), '2026-10-01')
  assert.equal(normalizarData('2026-10-01'), '2026-10-01')
  assert.equal(toISODate(parseISODate('2026-10-01')), '2026-10-01')
})
test('rejeita datas impossíveis, vazias ou ambíguas', () => {
  for (const value of ['', '2026-02-29', '31-04-2026', '01/10/2026', '2026-13-01', '02-03-04'])
    assert.throws(() => normalizarData(value))
  assert.equal(normalizarData('29-02-2024'), '2024-02-29')
})
test('incrementa dias através de mês, ano e ano bissexto', () => {
  assert.equal(addDays('2026-12-31', 1), '2027-01-01')
  assert.equal(addDays('2024-02-28', 1), '2024-02-29')
})
test('horário legado usa uma única regra de unidades completas', () => {
  assert.equal(calcularAulasPorHorario('08:00', '10:05'), 2)
  assert.equal(calcularAulasPorHorario('08:00', '08:20'), 0)
  assert.throws(() => calcularAulasPorHorario('25:00', '26:00'))
})
test('quantidade explícita é preservada em vez de inferida pela duração', () => {
  assert.equal(
    criarCalendario(semestre, [{ ...horario, aulas: 3 }], []).find((item) => !item.motivo)?.aulas,
    3,
  )
})
test('feriado de 12/10 é excluído mas continua visível na agenda', () => {
  const result = calendario()
  assert.equal(result.length, 4)
  assert.equal(result.filter((item) => !item.motivo).length, 3)
  assert.ok(result.find((item) => item.data === '2026-10-12')?.motivo)
})
test('recessos legados são normalizados e isolados por semestre', () => {
  const recessos = [
    { id: 'r1', user_id: 'u', semestre_id: 's1', data: '05-10-2026', motivo: 'Recesso' },
    { id: 'r2', user_id: 'u', semestre_id: 's2', data: '2026-10-19', motivo: 'Outro semestre' },
  ]
  const result = criarCalendario(semestre, [horario], recessos)
  assert.equal(result.find((item) => item.data === '2026-10-05')?.motivo, 'Recesso')
  assert.equal(result.find((item) => item.data === '2026-10-19')?.motivo, null)
})
test('permite desativar o calendário sugerido', () => {
  assert.equal(
    criarCalendario({ ...semestre, ignorar_feriados: false }, [horario], []).filter(
      (item) => !item.motivo,
    ).length,
    4,
  )
})
test('respeita a vigência de um horário', () => {
  const result = criarCalendario(
    semestre,
    [{ ...horario, vigencia_inicio: '2026-10-15', vigencia_fim: '2026-10-20' }],
    [],
  )
  assert.deepEqual(
    result.map((item) => item.data),
    ['2026-10-19'],
  )
})
test('o total oficial prevalece sobre a estimativa', () => {
  const result = resumirDisciplina({ ...disciplina, total_aulas: 80 }, calendario())
  assert.equal(result.total, 80)
  assert.equal(result.estimativa, 6)
  assert.equal(result.limite, 20)
  assert.equal(result.fonte, 'oficial')
})
test('sem calendário e total oficial, não inventa margem disponível', () => {
  assert.equal(resumirDisciplina(disciplina, []).status, 'incompleto')
})
test('limite é inteiro e trata percentuais extremos', () => {
  assert.equal(limiteFaltas(79, 75), 19)
  assert.equal(limiteFaltas(100, 100), 0)
  assert.equal(limiteFaltas(100, 0), 100)
  assert.equal(limiteFaltas(1000, 90), 100)
})
test('registro aceita formato legado, falta parcial e remove espaços', () => {
  const result = validarRegistroFalta(
    disciplina,
    calendario(),
    { data: '05-10-2026', quantidade: 1, observacao: ' teste ' },
    '2026-10-31',
  )
  assert.equal(result.data, '2026-10-05')
  assert.equal(result.observacao, 'teste')
})
test('não permite registrar faltas futuras ou em dia sem aula', () => {
  assert.throws(
    () =>
      validarRegistroFalta(
        disciplina,
        calendario(),
        { data: '2026-10-19', quantidade: 1, observacao: null },
        '2026-10-01',
      ),
    /futuras/,
  )
  assert.throws(
    () =>
      validarRegistroFalta(
        disciplina,
        calendario(),
        { data: '2026-10-12', quantidade: 1, observacao: null },
        '2026-10-31',
      ),
    /Não há aula/,
  )
})
test('impede exceder a quantidade diária somando os registros existentes', () => {
  const existing = {
    ...disciplina,
    faltas: [
      {
        id: 'f',
        user_id: 'u',
        disciplina_id: 'd1',
        data: '2026-10-05',
        quantidade: 1,
        observacao: null,
        created_at: '',
      },
    ],
  }
  assert.throws(
    () =>
      validarRegistroFalta(
        existing,
        calendario(),
        { data: '2026-10-05', quantidade: 2, observacao: null },
        '2026-10-31',
      ),
    /Restam 1/,
  )
  assert.doesNotThrow(() =>
    validarRegistroFalta(
      existing,
      calendario(),
      { data: '2026-10-05', quantidade: 1, observacao: null },
      '2026-10-31',
    ),
  )
})
test('soma vários encontros da mesma disciplina na mesma data', () => {
  const encontros = criarCalendario(
    semestre,
    [horario, { ...horario, id: 'h2', hora_inicio: '21:00', hora_fim: '22:40' }],
    [],
  )
  assert.doesNotThrow(() =>
    validarRegistroFalta(
      disciplina,
      encontros,
      { data: '2026-10-05', quantidade: 4, observacao: null },
      '2026-10-31',
    ),
  )
})
test('rejeita quantidades fracionadas, negativas e não finitas', () => {
  for (const quantidade of [0, -1, 1.5, NaN, Infinity])
    assert.throws(() =>
      validarRegistroFalta(
        disciplina,
        calendario(),
        { data: '2026-10-05', quantidade, observacao: null },
        '2026-10-31',
      ),
    )
})
test('valida dados antes da persistência', () => {
  assert.throws(() => validarSemestre({ ...semestre, fim: '2026-09-01' }))
  assert.throws(() => validarDisciplina({ ...disciplina, nome: '  ' }))
  assert.throws(() => validarDisciplina({ ...disciplina, percentual_presenca: 101 }))
  assert.throws(() => validarHorario({ ...horario, hora_fim: '18:00' }))
  assert.throws(() => validarHorario({ ...horario, aulas: 0 }))
})
test('leitura de registros anteriores mantém IDs e associa ao semestre legado', () => {
  const result = lerDisciplina('d', { nome: 'Antiga', total_aulas: 0 }, 'u', 'primeiro', [], [])
  assert.equal(result.id, 'd')
  assert.equal(result.semestre_id, 'primeiro')
  assert.equal(result.total_aulas, null)
  assert.equal(lerRecesso('r', { data: '01-10-2026' }, 'u', 'primeiro').data, '2026-10-01')
  assert.equal(lerFalta('f', { data: '01-10-2026', quantidade: 2 }, 'u', 'd').quantidade, 2)
  assert.equal(lerHorario('h', { hora_inicio: '08:00', hora_fim: '10:05' }, 'u', 'd').aulas, 2)
})

test('edições de grade preservam o histórico e rejeitam duplicação de horários', async () => {
  const { validarHistorico, validarSobreposicao } = await import('../src/domain/integridade')
  const existente = {
    ...disciplina,
    faltas: [
      {
        id: 'f',
        user_id: 'u',
        disciplina_id: 'd1',
        data: '2026-10-05',
        quantidade: 2,
        observacao: null,
        created_at: '',
      },
    ],
  }
  assert.throws(() => validarHistorico(existente, []), /alteração/)
  assert.doesNotThrow(() => validarHistorico(existente, calendario()))
  assert.throws(
    () => validarSobreposicao([horario, { ...horario, id: 'h2' }], semestre),
    /sobrepostos/,
  )
  assert.doesNotThrow(() =>
    validarSobreposicao(
      [
        { ...horario, vigencia_fim: '2026-10-15' },
        { ...horario, id: 'h2', vigencia_inicio: '2026-10-16' },
      ],
      semestre,
    ),
  )
})
