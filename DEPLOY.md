# Guia de Deploy — PROST Manager (Staging → Produção)

Passo a passo para subir a stack com `docker-compose` e validar tudo junto
(health, migrations, cookies de sessão) antes de ir a produção.

> Referências: [server/README.md](server/README.md) (auth, migrations, backup,
> hardening) e [ROADMAP-PRODUCAO.md](ROADMAP-PRODUCAO.md) (estado do projeto).

---

## Pré-requisitos

- Docker + Docker Compose
- Um banco **MySQL** acessível (a `DATABASE_URL`)
- Node 24 disponível (para rodar migrations/seed — pode ser dentro do container)

---

## 1. Variáveis de ambiente

Copie `server/.env.example` → `server/.env` e preencha. **Obrigatórias em produção:**

| Variável | Como obter / valor |
|---|---|
| `DATABASE_URL` | `mysql://user:pass@host:3306/db` |
| `JWT_SECRET` | `openssl rand -hex 32` |
| `NODE_ENV` | `production` (ativa Secure nos cookies e o fail-closed) |
| `OI_TOKEN` | token da API da Oficina Inteligente |
| `OI_WEBHOOK_SECRET` | segredo HMAC do webhook (mesmo valor no painel da OI) |
| `COLLECTOR_TOKEN` | `openssl rand -hex 24` (token do coletor/bookmarklet) |
| `CORS_ORIGINS` | domínio(s) do frontend, separados por vírgula |
| `GEMINI_API_KEY` | chave do Google AI Studio (Diagnóstico IA) |

**Opcionais:** `COOKIE_DOMAIN` (só se front e API forem subdomínios distintos, ex.
`.suaoficina.com.br`), `SENTRY_DSN`, `GEMINI_TIMEOUT_MS`, `PORT`.

> ⚠️ HTTPS é necessário em produção: com `NODE_ENV=production` os cookies são
> `Secure` e só trafegam sobre TLS. O TLS é feito pelo serviço **Caddy** do
> `docker-compose` (Let's Encrypt automático) — basta o domínio em `SITE_ADDRESS`
> apontar para o host (registro DNS A).

---

## 2. Migrations do banco

O schema é versionado (Prisma Migrate). O baseline já foi aplicado; o deploy só
aplica migrations pendentes — **não** use `db push` em produção.

```bash
cd server
npm ci
npm run migrate:deploy   # aplica migrations pendentes (sem shadow DB)
npm run migrate:status   # deve dizer "Database schema is up to date!"
```

---

## 3. Primeiro administrador (seed idempotente)

Fora de container (host com deps de dev instaladas):

```bash
ADMIN_BOOTSTRAP_EMAIL=admin@suaoficina.com \
ADMIN_BOOTSTRAP_PASSWORD=umaSenhaForte \
npm run seed
```

**Dentro do container de produção** use `node` no seed já compilado — **não**
`npm run seed`/`prisma db seed` (o `ts-node` é removido da imagem pelo
`npm prune --omit=dev`):

```bash
docker compose exec \
  -e ADMIN_BOOTSTRAP_EMAIL=admin@suaoficina.com \
  -e ADMIN_BOOTSTRAP_PASSWORD=umaSenhaForte \
  server node dist/prisma/seed.js
```

Só cria se ainda não houver ADMIN. Depois, novos usuários são criados pelo admin
via `POST /auth/register`.

---

## 4. Subir a stack

Na raiz do projeto, informando o domínio ao Caddy:

```bash
SITE_ADDRESS=SEU_DOMINIO docker compose up -d --build
```

- **caddy** → `:80/:443` (TLS automático via Let's Encrypt; **única entrada pública**)
- **web** → interno (nginx servindo o build + proxy de `/api` para o server)
- **server** → `127.0.0.1:3000` no host (API NestJS; loopback só p/ tooling local)

O `web` só sobe depois que o `server` fica *healthy* (depends_on + healthcheck), e o
`caddy` fica na frente terminando HTTPS. Em produção, defina `SITE_ADDRESS` com o
domínio; localmente use `localhost` (o Caddy serve com certificado interno).

> Guia passo-a-passo específico p/ VPS: [GO-LIVE.md](GO-LIVE.md).

---

## 5. Validação (smoke test de staging)

```bash
# 1) Health do backend (público)
curl -s http://localhost:3000/health        # {"status":"ok","db":"up",...}

# 2) Migrations aplicadas
cd server && npm run migrate:status          # "Database schema is up to date!"
```

No navegador (`https://SEU_DOMINIO`):

1. **Login** com o admin do seed → deve navegar para a home.
2. Confira nas DevTools (Application → Cookies) os cookies **`access_token`** e
   **`refresh_token`** com **HttpOnly** marcado.
3. Navegue por Clientes/Veículos → os dados carregam (chamadas autenticadas via cookie).
4. **Logout** → volta ao login; os cookies são limpos.
5. Espere ~15 min (ou force) e faça uma ação → o access expira e o app **renova
   sozinho** (o interceptor chama `/auth/refresh`), sem derrubar a sessão.

Erros de servidor (5xx), se houver, aparecem no Sentry (se `SENTRY_DSN` setado)
e nos logs do container: `docker compose logs -f server`.

---

## 6. Backup (antes de abrir para usuários)

```bash
# na host (ou num container com mysql-client):
DATABASE_URL="mysql://user:pass@host:3306/db" ./scripts/backup-db.sh ./backups
```

Agende via cron (diário) e **teste a restauração** num banco de teste ao menos
uma vez (`scripts/restore-db.sh`). Os dumps contêm dados pessoais — guarde-os
com segurança e nunca os versione (já estão no `.gitignore`).

---

## 7. Ingestão externa (coletor & webhook)

- **Webhook:** configure no painel da OI o mesmo `OI_WEBHOOK_SECRET`. Em produção,
  sem o segredo, todo webhook é recusado (fail-closed).
- **Coletor:** gere o bookmarklet pela aba Integrações (o token vem do backend).
  Em produção, sem `COLLECTOR_TOKEN`, `POST /oi/scrape` é recusado.

---

## Rollback

- **Aplicação:** faça redeploy da imagem anterior (as imagens são versionáveis).
- **Banco:** as migrations são *forward-only*. Para reverter uma mudança de
  schema, restaure o backup mais recente com `scripts/restore-db.sh` num banco de
  teste, valide, e só então promova.

---

## Notas de escala (multi-instância)

Rate limiting, retry de webhooks e o cron de sessão usam **memória local**. Para
rodar **várias instâncias** do backend, migrar para storage/lock compartilhado
(ex.: Redis) — senão o rate limit é por-instância e o cron de retry roda em todas.
Para uma instância única, o setup atual está adequado.
