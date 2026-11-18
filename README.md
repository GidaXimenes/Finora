# Finora

Aplicação web full stack de controle financeiro pessoal. O usuário cadastra suas contas, registra receitas, despesas e transferências, organiza tudo por categorias, define orçamentos e acompanha a situação financeira em um painel simples de entender.

O projeto foi desenvolvido de forma incremental, com foco em qualidade de software: regras de negócio isoladas e testadas, isolamento de dados entre usuários, containerização e integração contínua.

## Funcionalidades

- **Autenticação:** cadastro, login e logout, com sessão renovável e rotas privadas protegidas.
- **Contas:** carteira, conta corrente, poupança e outras, com saldo inicial e saldo calculado automaticamente. Contas com histórico são desativadas em vez de apagadas.
- **Transações:** receitas, despesas e transferências entre contas, com filtros por período, tipo, conta, categoria e texto, além de paginação.
- **Categorias:** conjunto padrão de categorias e categorias personalizadas, com cor e ícone.
- **Orçamentos:** limite por categoria de despesa, mensal ou anual, com percentual consumido e alerta visual.
- **Painel:** saldo total, receitas, despesas e resultado do mês, evolução dos últimos seis meses, despesas por categoria e últimas transações.
- **Exportação e privacidade:** exportação das transações em CSV e exclusão da conta com todos os dados.
- **Onboarding:** tour guiado por página e checklist de primeiros passos.

## Como funciona

```
Navegador  -->  Next.js (3000)  --  /api/*  -->  NestJS (3001)  -->  PostgreSQL (5432)
```

O navegador conversa apenas com o Next.js. As chamadas para `/api/*` são encaminhadas à API NestJS, o que permite usar cookies httpOnly na mesma origem, sem CORS e sem expor tokens ao JavaScript.

Principais decisões de projeto:

- **Valores em centavos (inteiros):** evita erros de ponto flutuante em cálculos financeiros.
- **Saldo calculado, não armazenado:** saldo = saldo inicial + receitas - despesas - transferências enviadas + transferências recebidas. Editar ou excluir uma transação ajusta o saldo automaticamente.
- **Transferência não é despesa:** movimenta dinheiro entre contas do próprio usuário e não entra nos totais de receitas e despesas.
- **Isolamento de usuários:** toda consulta filtra pelo usuário autenticado, e um recurso de outro usuário responde 404.
- **Sessão segura:** JWT de curta duração e refresh token opaco, armazenado como hash e rotacionado a cada uso, ambos em cookies httpOnly.
- **Datas sem fuso:** a data de uma transação é apenas a data, então o corte de mês nunca muda por causa de fuso horário.

## Tecnologias

| Camada         | Tecnologias                                                                                   |
| -------------- | --------------------------------------------------------------------------------------------- |
| Frontend       | Next.js 14 (App Router), React, TypeScript, Tailwind CSS, TanStack Query, Recharts, driver.js |
| Backend        | NestJS 10, TypeScript, Passport/JWT, class-validator, Swagger                                 |
| Banco de dados | PostgreSQL 16, Prisma                                                                         |
| Qualidade      | Jest, Supertest, Vitest                                                                       |
| Infraestrutura | Docker, Docker Compose, GitHub Actions                                                        |

## Como executar

Pré-requisitos: Node.js 20 ou superior e Docker (ou um PostgreSQL local). No Windows, os comandos abaixo foram pensados para o WSL.

**1. Banco de dados**

```bash
docker compose up -d db
```

**2. Backend**

```bash
cd backend
cp .env.example .env     # defina JWT_ACCESS_SECRET, por exemplo com: openssl rand -hex 32
npm install
npx prisma migrate dev   # aplica as migrações
npm run start:dev
```

A API fica em `http://localhost:3001` e a documentação interativa em `http://localhost:3001/docs`.

**3. Frontend**

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

A aplicação fica em `http://localhost:3000`.

### Executando tudo com Docker

```bash
docker compose --profile full up --build
```

## Testes

```bash
cd backend
npm test             # testes unitários (não exigem banco)
npm run test:e2e     # ponta a ponta (exige o banco em execução e migrado)

cd frontend
npm test
npm run typecheck
```

Os testes cobrem o cálculo de saldo e de orçamentos, regras de datas, geração de CSV, regras de validação das transações, autenticação e o isolamento de dados entre usuários.

## Integração contínua

O workflow em `.github/workflows/ci.yml` executa, a cada push e pull request, a verificação de tipos, os testes unitários e e2e (com PostgreSQL), o build do backend e do frontend e o build das imagens Docker.

## Estrutura do repositório

```
backend/    API NestJS e schema Prisma (src/<módulo>, prisma/, test/)
frontend/   Aplicação Next.js (app/, components/, lib/)
docs/       Requisitos, modelo de dados e arquitetura
```

## Documentação adicional

- [Requisitos e regras de negócio](docs/01-requisitos.md)
- [Modelo de dados](docs/02-modelo-de-dados.md)
- [Arquitetura](docs/03-arquitetura.md)

## Roadmap

- Cartões de crédito, faturas e parcelamentos
- Transações recorrentes
- Metas financeiras e relatórios avançados
- Importação de extratos
- Recursos de IA: resumos financeiros e consultas em linguagem natural sobre os próprios dados
