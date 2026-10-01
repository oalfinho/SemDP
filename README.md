SemDP
O SemDP ajuda estudantes a acompanhar faltas, presença e risco de dependência durante o semestre.
Ele transforma o calendário acadêmico em informações simples: quantas aulas já foram perdidas, quantas faltas ainda estão disponíveis e o que acontece se uma nova falta for registrada.
Demonstração
npm install
npm run dev
Abra http://localhost:5173/?demo=1 para explorar a interface com dados fictícios, sem configurar o Firebase.
Funcionalidades

- dashboard com resumo do semestre;
- indicadores de disciplinas próximas do limite;
- simulador de novas faltas;
- cadastro de semestres e disciplinas;
- total oficial de aulas ou estimativa pela grade;
- horários com quantidade explícita de aulas por encontro;
- vigência para mudanças de horário;
- agenda semanal e agenda por data;
- registro de faltas parciais;
- histórico de faltas por disciplina;
- feriados nacionais e datas móveis sugeridas;
- recessos e dias sem aula por semestre;
- validação contra duplicidades e registros inválidos;
- exportação dos dados em JSON;
- autenticação por e-mail e Google;
- dados separados por usuário no Cloud Firestore;
- navegação responsiva com foco no celular.
  Telas
  Visão geral no desktop

Visão geral no celular

Agenda no celular

Registro de falta

Arquitetura
src/
├── components/ interface e telas
├── domain/ regras de negócio e validações
├── hooks/ carregamento e ações da aplicação
├── lib/ datas, calendário, Firebase e cálculos
├── services/ persistência acadêmica no Firestore
├── types.ts tipos compartilhados
└── tests/ testes de regras e interface
As regras de frequência ficam separadas dos componentes visuais. O cálculo usa o total oficial quando informado; caso contrário, exibe que o valor é uma estimativa baseada nos encontros cadastrados.
Tecnologias

- React 19
- Vite 8
- TypeScript
- Tailwind CSS
- Firebase Authentication
- Cloud Firestore
- Playwright
- Node Test Runner
  Configuração do Firebase
  No PowerShell, copie o arquivo de exemplo:
  Copy-Item .env.example .env
  Depois preencha as variáveis VITE*FIREBASE*\* com as credenciais do seu projeto Firebase.
  Sem Firebase configurado, use o modo demonstração com ?demo=1.
  Scripts
  npm run dev # inicia o ambiente de desenvolvimento
  npm run build # verifica tipos e gera a versão de produção
  npm run lint # executa o linter
  npm run test # testa regras de datas e frequência
  npm run test:e2e # testa a interface em celular e desktop
  npm run format # formata os arquivos
  Regras de cálculo
- Datas são armazenadas no formato AAAA-MM-DD.
- Registros antigos no formato DD-MM-AAAA continuam sendo lidos.
- Feriados nacionais fixos são sugeridos automaticamente.
- Carnaval, Quarta-feira de Cinzas, Sexta-feira Santa e Corpus Christi são datas móveis sugeridas.
- O usuário pode cadastrar recessos específicos da instituição.
- O limite de faltas é calculado pela presença mínima da disciplina.
- Uma falta só pode ser registrada em um encontro passado e válido.
- Alterações de grade que invalidariam o histórico são bloqueadas.
  Verificação
  O projeto foi verificado com:
- 20 testes unitários das regras de domínio;
- 3 testes de interface: celular, desktop e largura de 320 px;
- build TypeScript e Vite;
- lint do projeto.
