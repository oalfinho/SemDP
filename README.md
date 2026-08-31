# SemDP

Controle de faltas do semestre para não tomar DP. Cada disciplina mostra quantas aulas você já perdeu, o limite (em geral 25% da carga) e quantas ainda restam.

Stack: **React + Vite + TypeScript + Tailwind CSS + Supabase**.

## Setup

```bash
npm install
cp .env.example .env
```

## Calendário

Você informa só o **início/fim do semestre** e a **grade semanal** (ex.: sexta, Mineração 7:40–11:10). O app conta quantas vezes aquele dia ocorre no período, **tirando feriados nacionais** (incluindo Carnaval, Sexta Santa, Corpus Christi e Consciência Negra) e recessos que você cadastrar.

Cada encontro previsto vale 1 aula. O limite de faltas continua:

`limite = floor(aulas_no_semestre × (100 − percentual_presença) / 100)`

## Scripts

- `npm run dev` — desenvolvimento
- `npm run build` — build de produção
