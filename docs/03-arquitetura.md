# Arquitetura

```
Navegador ──► Next.js (3000) ──/api/*──► NestJS (3001) ──► PostgreSQL (5432)
              App Router + React Query     Prisma
```

- O navegador só conversa com o Next. O `rewrite` em `next.config.mjs` encaminha `/api/*` para a API, então os cookies httpOnly funcionam na mesma origem (sem CORS e sem expor tokens ao JavaScript).
- **Sessão**: `access_token` (JWT, 15 min) e `refresh_token` (opaco, 7 dias, guardado como hash SHA-256 e rotacionado a cada uso). O cliente (`lib/api.ts`) renova uma única vez quando recebe 401.
- **Proteção**: guard JWT global; só rotas marcadas com `@Public()` ficam abertas.
- **Módulos do backend**: auth, accounts, categories, transactions, budgets, dashboard, prisma.
- **Frontend**: rotas em `app/(auth)` e `app/(app)`, dados com TanStack Query, mutações invalidam o cache inteiro (o app é pequeno e os saldos dependem de tudo).
- **Documentação da API**: Swagger em `http://localhost:3001/docs`.
