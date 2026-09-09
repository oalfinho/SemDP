# SemDP

Quantas faltas eu ainda posso ter sem pegar DP?

Essa é uma dúvida que praticamente todo universitário tem durante o semestre.

O SemDP automatiza esse cálculo considerando:
- carga horária
- presença mínima
- grade semanal
- feriados
- recessos

permitindo acompanhar em tempo real o risco de reprovação por frequência.

## Tecnologias

- React + Vite
- TypeScript
- Tailwind CSS
- Firebase Authentication
- Cloud Firestore

## O que ele faz

- cadastra disciplinas e percentual mínimo de presença
- monta a grade semanal do semestre
- calcula aulas previstas no período
- registra faltas por data e disciplina
- mostra limite de faltas, faltas usadas e faltas restantes
- ignora feriados nacionais e dias de recesso cadastrados
- mostra o próximo feriado em destaque no dashboard
- permite login com e-mail e Google
- mantém os dados separados por usuário no Firebase

## Algoritmos implementados

✓ cálculo de frequência <br>
✓ projeção de faltas <br>
✓ calendário acadêmico <br>
✓ tratamento de feriados <br>
✓ autenticação <br>
✓ persistência em nuvem


## Interface

### Login
(em construção)

### Dashboard
(em construção)

### Disciplinas e faltas
(em construção)


## Roadmap

Próximas funcionalidades planejadas:

- Transformar o SemDP em um Progressive Web App (PWA)
- Instalação direta no celular e desktop
- Funcionamento offline para consulta e registro de faltas
- Sincronização automática quando a conexão retornar
- Dashboard com indicadores visuais de risco de DP
- Estatísticas de presença por disciplina
- Notificações para disciplinas próximas do limite de faltas

## Observações

- o cálculo considera blocos de 50 minutos por aula
- o calendário considera feriados nacionais e recessos cadastrados pelo usuário
- a ideia principal do projeto é reduzir a fricção de acompanhar presença em faculdade sem depender de planilha ou cálculo manual

## Acesso

O SemDP está disponível diretamente pelo navegador, sem necessidade de instalação ou configuração.

Em versões futuras, o projeto também poderá ser instalado como aplicativo (PWA) em celulares Android, iPhone e computadores compatíveis.
