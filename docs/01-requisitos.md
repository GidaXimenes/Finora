# Requisitos do Finora (MVP)

## Requisitos funcionais
| ID | Descrição | Onde |
|---|---|---|
| RF01 | Cadastro, login, logout e sessão renovável | `backend/src/auth` |
| RF02 | CRUD de contas com saldo inicial; desativação em vez de exclusão quando há histórico | `accounts` |
| RF03 | Saldo por conta calculado a partir das transações | `AccountsService.getBalances` |
| RF04 | Categorias padrão (somente leitura) e personalizadas | `categories` |
| RF05 | CRUD de transações (receita, despesa, transferência) | `transactions` |
| RF06 | Filtros por período, conta, categoria, tipo e texto; paginação | `GET /transactions` |
| RF07 | Dashboard: saldo, receitas, despesas, resultado, gastos por categoria, evolução, últimas transações | `dashboard` |
| RF08 | Orçamentos por categoria e período, com percentual consumido | `budgets` |
| RF09 | Exportação CSV (compatível com Excel pt-BR) | `GET /transactions/export` |
| RF10 | Exclusão de conta e de todos os dados (LGPD) | `DELETE /auth/me` |
| RF11 | Tour guiado e checklist de primeiros passos | `frontend/lib/tour.ts` |

## Regras de negócio
RN01 isolamento entre usuários: toda consulta filtra por `userId`; recurso de outro usuário responde 404.
RN02/RN03 contas e transações pertencem ao usuário autenticado.
RN04 transação é receita, despesa ou transferência.
RN05 categoria deve ser compatível com o tipo da transação.
RN06 saldo inicial informado na conta.
RN07/RN08 receita soma, despesa subtrai; transferência subtrai da origem e soma no destino.
RN09 editar/excluir reflete nos saldos (saldo é calculado, não armazenado).
RN10/RN11 orçamento = categoria de despesa + período; usado = soma das despesas no período.
RN12 categorias padrão e personalizadas.
RN13 lançamentos manuais.

## Requisitos não funcionais
Segurança: senhas com bcrypt (custo 12), JWT curto em cookie httpOnly, refresh token opaco com rotação e hash no banco, rate limit, helmet, validação com whitelist.
Integridade: valores em centavos (inteiro), datas "somente data", chaves estrangeiras com cascata definida.
Usabilidade: onboarding, estados vazios com orientação, formulários com valor em máscara de moeda.
Testabilidade: regras puras isoladas (`balance.ts`, `dates.ts`) e serviços testáveis com mock do Prisma.
Responsividade: menu lateral no desktop e menu inferior no celular.
