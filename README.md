# Finora

Controle financeiro pessoal: contas, transações, categorias, orçamentos e um painel claro, com tour guiado no primeiro acesso.

**Stack:** Next.js 14 (React, Tailwind, TanStack Query, Recharts, driver.js) · NestJS 10 · PostgreSQL 16 · Prisma · TypeScript · Docker · GitHub Actions.

## Rodando no WSL (Ubuntu)

Pré-requisitos: Node 20+ e Docker (Docker Desktop com integração WSL ativada) ou um PostgreSQL local.

```bash
# 1. Banco de dados
docker compose up -d db

# 2. Backend
cd backend
cp .env.example .env              # troque JWT_ACCESS_SECRET:  openssl rand -hex 32
npm install
npx prisma migrate dev --name init   # cria as tabelas e a pasta prisma/migrations (commite essa pasta)
npm run start:dev                 # http://localhost:3001  |  docs em /docs

# 3. Frontend (outro terminal)
cd frontend
cp .env.example .env.local
npm install
npm run dev                       # http://localhost:3000
```

Abra http://localhost:3000, crie uma conta e aceite o passeio guiado.

## Testes

```bash
cd backend
npm test            # unitários (sem banco)
npm run test:e2e    # ponta a ponta (precisa do banco no ar e migrado)
npm run test:cov    # cobertura

cd frontend
npm test            # utilitários de dinheiro e datas
npm run typecheck
```

## Produção local com Docker

```bash
docker compose --profile full up --build
```
Na primeira vez, gere antes a migração (`npx prisma migrate dev --name init` em `backend/`), pois a imagem aplica `prisma migrate deploy`.

## CI

`.github/workflows/ci.yml` roda tipos, testes (unitários e e2e com PostgreSQL), build e build das imagens Docker. Commite os `package-lock.json` (gerados no primeiro `npm install`) e a pasta `backend/prisma/migrations`.

## Estrutura

```
backend/   API NestJS + Prisma (src/<módulo>, prisma/schema.prisma, test/)
frontend/  Next.js (app/, components/, lib/)
docs/      requisitos, modelo de dados, arquitetura
```

## Roadmap
Fases 11 e 12 do planejamento: cartões e faturas, parcelamentos, recorrências, metas, relatórios e IA (resumos e perguntas em linguagem natural sobre os próprios dados).
