# Deploy

Arquitetura de produção, toda em planos gratuitos:

```
Navegador --> Vercel (Next.js) --/api/*--> Render (API NestJS, Docker) --> Neon (PostgreSQL)
```

| Peça | Serviço | Observação |
|---|---|---|
| Frontend | Vercel (Hobby) | Gratuito, uso pessoal e não comercial (adequado a portfólio). |
| API | Render (Web Service free) | Hiberna após 15 minutos sem tráfego e leva cerca de 1 minuto para acordar. |
| Banco | Neon (Free) | Sem cartão e sem expiração. Suspende quando ocioso e volta na próxima consulta. |

Os limites e preços mudam com frequência. Confira as páginas de preços antes de decidir.

Ordem de execução: **banco, API, frontend**. Cada etapa depende da anterior.

## 1. Banco de dados (Neon)

1. Crie a conta em neon.com (pode entrar com o GitHub) e um projeto chamado `finora`.
2. Escolha a região **AWS US East (N. Virginia)**, a mesma da API no Render.
3. Em **Connect**, **desative** a opção *Connection pooling* para obter a conexão direta (o host não tem `-pooler`). O Prisma precisa dela para aplicar migrações.
4. Copie a connection string e deixe os parâmetros assim:
   ```
   postgresql://USUARIO:SENHA@ep-xxxx.us-east-1.aws.neon.tech/neondb?sslmode=require&connect_timeout=15
   ```
   Se vier `channel_binding=require`, remova esse parâmetro. O `connect_timeout=15` dá tempo para o banco acordar na primeira consulta.

## 2. API (Render)

Pré-requisito: o repositório no GitHub precisa conter `backend/prisma/migrations/` e o `render.yaml` da raiz.

1. Crie a conta em render.com e conecte o GitHub.
2. **New > Blueprint**, escolha o repositório `finora` e confirme. O Render lê o `render.yaml`.
3. Quando ele pedir, cole o valor de `DATABASE_URL` (string do Neon). O `JWT_ACCESS_SECRET` é gerado automaticamente.
4. Aguarde o build (alguns minutos na primeira vez). A cada inicialização, o container aplica `prisma migrate deploy` e sincroniza as categorias padrão.
5. Copie a URL pública, algo como `https://finora-api.onrender.com`, e teste:
   - `https://finora-api.onrender.com/health` deve responder `{"status":"ok"}`
   - `https://finora-api.onrender.com/docs` abre o Swagger

O nome do serviço pode receber um sufixo se `finora-api` já estiver em uso. Use a URL que o Render mostrar.

Variáveis definidas pelo Blueprint: `NODE_ENV=production`, `COOKIE_SECURE=true` (cookies só em HTTPS), `TRUST_PROXY_HOPS=2` (balanceador do Render mais o proxy da Vercel, para o limite de requisições enxergar o IP real) e `APP_TIMEZONE`.

Deploy contínuo: `autoDeployTrigger: checksPass` faz o Render publicar apenas quando o CI do GitHub passa. O `buildFilter` evita redeploy da API quando só o frontend muda.

## 3. Frontend (Vercel)

1. Crie a conta em vercel.com e conecte o GitHub.
2. **Add New > Project**, importe o repositório.
3. Em **Root Directory**, selecione `frontend`. O framework Next.js é detectado sozinho.
4. Em **Environment Variables**, adicione:
   ```
   API_URL = https://finora-api.onrender.com
   ```
   Sem barra no final. A variável é lida no build; se mudar depois, faça um novo deploy.
5. **Deploy**. Cada push na `main` publica de novo, e cada pull request ganha uma prévia.

## 4. Validação

1. Abra a URL da Vercel, crie uma conta e faça o tour.
2. No navegador, em *DevTools > Application > Cookies*, confirme `access_token` e `refresh_token` com **HttpOnly** e **Secure**.
3. Cadastre uma conta financeira e uma transação; confira se o saldo e o painel atualizam.
4. Recarregue a página: a sessão deve continuar.

## Cold start (API hibernando)

No plano gratuito, a primeira requisição depois de 15 minutos parado leva até cerca de 1 minuto. O app mitiga isso:

- Ao abrir login ou cadastro, o frontend chama `/api/health` em segundo plano para acordar a API enquanto a pessoa digita.
- Telas de carregamento longas explicam que o servidor está acordando, e erros 502 a 504 mostram uma mensagem amigável.

Para acabar com a espera, use uma instância paga: Render Starter (cerca de US$ 7 por mês) ou Railway Hobby (cerca de US$ 5 por mês, com crédito incluído). Serviços de ping a cada poucos minutos funcionam como paliativo, mas consomem as 750 horas mensais gratuitas e não são garantia.

## Problemas comuns

| Sintoma | Causa provável |
|---|---|
| Primeiro login falha ou demora | API acordando. Aguarde cerca de 1 minuto e tente de novo. |
| Erro 502 ou 504 em `/api/*` | API hibernando ou fora do ar. Veja os logs no Render. |
| `Can't reach database server` (P1001) | String do Neon errada, host com `-pooler` ou sem `connect_timeout`. |
| Build da API falha em `migrate deploy` | Pasta `backend/prisma/migrations` não foi commitada. |
| Cookie não é salvo | `COOKIE_SECURE=true` só funciona em HTTPS; em HTTP local use `false`. |
| Build da Vercel não acha o projeto | Root Directory não está em `frontend`. |
| Frontend chama a API errada | `API_URL` incorreta ou alterada sem novo deploy. |

## Segurança em produção

- `JWT_ACCESS_SECRET` único e gerado pelo Render; nunca commite arquivos `.env`.
- Troque a senha do banco no Neon se ela vazar.
- O Swagger (`/docs`) fica público na URL do Render. Para um produto real, proteja-o ou desligue-o.
- Faça backup (exportação) dos dados de demonstração importantes, pois o plano gratuito não garante retenção.
