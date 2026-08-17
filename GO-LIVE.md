# 🚀 GO-LIVE — PROST Manager (VPS + Docker)

Runbook enxuto para colocar no ar em um **VPS com Docker**, usando um **MySQL já
provisionado** e um **domínio já registrado**. TLS é automático (Caddy + Let's
Encrypt). Tempo estimado: **~meio dia**, quase todo operacional — não há código
pendente (build limpo, 36 testes backend + 5 frontend passando).

> Arquitetura no ar:
> `internet → Caddy (:80/:443, TLS) → web (nginx: SPA + proxy /api) → server (:3000)`
> Só as portas 80/443 do Caddy ficam públicas; `web` e `server` são internos.
> Referências: [DEPLOY.md](DEPLOY.md) · [AVALIACAO-FINAL.md](AVALIACAO-FINAL.md).

---

## Pré-requisitos (você já tem)

- [x] VPS Linux com Docker + Docker Compose
- [x] MySQL acessível pelo VPS (a `DATABASE_URL`)
- [x] Domínio registrado com acesso ao DNS

---

## A. Preparar código e servidor

1. **DNS:** crie um registro **A** do domínio (ex.: `app.suaoficina.com.br`)
   apontando para o **IP público do VPS**. Aguarde propagar (o Caddy só emite o
   certificado quando o domínio resolve para o VPS).
2. **Firewall do VPS:** libere só **80** e **443** (o Caddy usa a 80 para o
   desafio HTTP-01 do Let's Encrypt e a 443 para o tráfego). Não exponha 3000/8080.
3. **Clonar o repo** no VPS a partir da branch `main`:
   ```bash
   git clone <repo> prost && cd prost && git checkout main
   ```

## B. Configurar segredos

4. **Criar `server/.env`** (copie de `server/.env.example`). Obrigatórias em prod:

   | Variável | Valor |
   |---|---|
   | `NODE_ENV` | `production` |
   | `DATABASE_URL` | `mysql://user:pass@host:3306/db` (seu MySQL) |
   | `JWT_SECRET` | `openssl rand -hex 32` |
   | `OI_TOKEN` | token da API da Oficina Inteligente |
   | `OI_WEBHOOK_SECRET` | segredo HMAC do webhook (mesmo do painel da OI) |
   | `COLLECTOR_TOKEN` | `openssl rand -hex 24` |
   | `CORS_ORIGINS` | `https://SEU_DOMINIO` |
   | `GEMINI_API_KEY` | chave do Google AI Studio |

   Opcionais: `SENTRY_DSN` (recomendado), `GEMINI_TIMEOUT_MS`.
   **`COOKIE_DOMAIN` não é necessário** — front e API saem do mesmo host (Caddy→web).

## C. Subir a stack

5. **Subir**, informando o domínio ao Caddy via `SITE_ADDRESS`:
   ```bash
   SITE_ADDRESS=SEU_DOMINIO docker compose up -d --build
   ```
   - O container do `server` roda **`prisma migrate deploy` no startup**
     (idempotente — num banco já baselined é no-op).
   - O `web` só sobe quando o `server` fica *healthy*.
   - O Caddy emite/renova o certificado TLS sozinho.

   > 💡 Deixe `SITE_ADDRESS` fixo entre restarts. Para não repetir, coloque
   > `SITE_ADDRESS=SEU_DOMINIO` num arquivo **`.env` na raiz** (o compose lê
   > automaticamente; já está no `.gitignore`).

6. **Seed do 1º administrador** (registro público foi removido; sem seed não há
   como logar). Rode **dentro do container** — use `node`, **não** `npm run seed`
   (o `ts-node` é removido da imagem de produção; o seed já vem compilado no `dist`):
   ```bash
   docker compose exec \
     -e ADMIN_BOOTSTRAP_EMAIL=admin@suaoficina.com \
     -e ADMIN_BOOTSTRAP_PASSWORD='umaSenhaForte' \
     server node dist/prisma/seed.js
   ```
   É idempotente: só cria se ainda não houver um ADMIN.

## D. Validar

7. **Smoke test** (não-mutante, 8 checagens) contra o domínio público:
   ```bash
   ./scripts/validate-staging.sh https://SEU_DOMINIO
   ```
   Espere **8/8 PASS** (health 200, rotas protegidas 401, ingestão fail-closed 401,
   login valida corpo 400). Para testar o fluxo autenticado também:
   ```bash
   STAGING_EMAIL=admin@suaoficina.com STAGING_PASSWORD='umaSenhaForte' \
     ./scripts/validate-staging.sh https://SEU_DOMINIO
   ```
8. **No navegador** (`https://SEU_DOMINIO`): login com o admin → home; nas DevTools
   (Application → Cookies) confira `access_token` e `refresh_token` com **HttpOnly**;
   navegue por Clientes/Veículos; logout limpa os cookies. Deixe ~15 min e faça uma
   ação → o app renova a sessão sozinho (interceptor chama `/auth/refresh`).
9. Erros 5xx aparecem no Sentry (se `SENTRY_DSN` setado) e em
   `docker compose logs -f server`.

## E. Antes de abrir para os usuários

10. **Backup** do MySQL — rode uma vez e **teste a restauração**:
    ```bash
    DATABASE_URL="mysql://user:pass@host:3306/db" ./scripts/backup-db.sh ./backups
    # e valide restaurando num banco de TESTE:
    ./scripts/restore-db.sh ./backups/<arquivo>.sql.gz
    ```
    Depois **agende no cron** (diário). Os dumps têm PII — nunca versione (já no
    `.gitignore`).
11. **Ingestão externa:** no painel da OI, configure o mesmo `OI_WEBHOOK_SECRET`;
    gere o bookmarklet do coletor pela aba Integrações (o token vem do backend).
12. Confirme o Sentry recebendo eventos (force um erro de teste, se quiser).

---

## Operação

| Ação | Comando |
|---|---|
| Ver logs | `docker compose logs -f server` |
| Status das migrations | `docker compose exec server node_modules/.bin/prisma migrate status` |
| Atualizar (deploy nova versão) | `git pull && SITE_ADDRESS=SEU_DOMINIO docker compose up -d --build` |
| Reiniciar | `docker compose restart` |
| Backup manual | `./scripts/backup-db.sh ./backups` |

## Rollback

- **Aplicação:** `git checkout <commit-anterior> && docker compose up -d --build`
  (ou faça deploy da imagem anterior).
- **Banco:** migrations são *forward-only*. Para reverter schema, restaure o backup
  mais recente (`scripts/restore-db.sh`) num banco de teste, valide, e só então promova.

## Nota de escala (1 instância)

Rate limiting, retry de webhooks e o cron de sessão usam **memória local** — ótimo
para **uma instância**. Para escalar horizontalmente, migrar esses estados para um
**Redis** compartilhado e o storage de assinaturas para um bucket S3.
