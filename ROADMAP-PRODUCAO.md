# 🚀 Roadmap de Produção — PROST Manager

> Documento de trabalho para levar o sistema ao ar com segurança.
> Base: auditoria técnica de **30/07/2026** · Branch `feat/dashboard-tabela-temporal`
> Nota geral atual: **5.8 / 10** · Confiança para deploy hoje: **~35%**

---

## 📌 Progresso (atualizado em 31/07/2026)

Correções em andamento na branch **`fix/auth-security-blockers`**.

| Item | Status | Commit |
|---|---|---|
| B1 — Fechar registro público | ✅ **Concluído** | `dd9c40c` |
| B2 — Autorização por papel (RolesGuard) | ✅ **Concluído** | `dd9c40c` |
| B3 — Proteger `/oi/scrape` + webhook | ✅ **Concluído** | `55692a4` |
| B5 — Hardening HTTP (audit/helmet/throttler/CORS) | ✅ **Concluído** | `e464382` |
| B4 — Migrations · B6 — Infra · B7 — Higiene do repo | ⏳ Pendente | — |

> Cada correção foi validada com build + ESLint + smoke test de runtime, com
> confirmação de **0 escritas** indevidas no banco.

---

## Como usar este documento

Cada item de reparo segue o mesmo formato:

- **ID** — código curto para referência (B = bloqueador, H = hardening, P = pós-deploy).
- **Severidade / Prioridade** — 🔴 Crítico · 🟠 Alto · 🟡 Médio · 🟢 Baixo.
- **Causa** — por que o problema existe.
- **Impacto** — o que acontece se for para produção sem correção.
- **Arquivos** — onde mexer.
- **Recomendação técnica** — o passo-a-passo do reparo.
- **Esforço** — estimativa em dias-pessoa (S ≤ 0,5d · M = 1–2d · L = 3–5d).

**Meta de saída:** concluir **toda a Fase 0** → confiança ≥ 85% para go-live.

---

## Visão geral das fases

| Fase | Objetivo | Quando | Esforço somado |
|---|---|---|---|
| **Fase 0 — Bloqueadores** | Tornar o deploy seguro e operável | **Obrigatório antes do go-live** | ~9–14 dias |
| **Fase 1 — Endurecimento** | Reduzir risco e melhorar robustez | Logo antes ou na 1ª semana | ~4–6 dias |
| **Fase 2 — Pós-deploy** | Qualidade, escala e manutenção | Sem pressa, sem parar o ar | ~8–12 dias |

---

# 🔴 FASE 0 — Bloqueadores (obrigatório antes do go-live)

## B1 — Fechar o registro público de usuários  ✅ CONCLUÍDO (`dd9c40c`)
- **Severidade:** 🔴 Crítico
- **Causa:** `POST /auth/register` está marcado com `@Public()`, sem convite nem allowlist. Qualquer pessoa na internet cria uma conta.
- **Impacto:** Como não há isolamento de dados (ver B2), um estranho autenticado enxerga e edita **todos** os clientes, veículos, OS e diagnósticos — incluindo dados pessoais (CPF/CNPJ, telefone, endereço). É o maior risco do sistema.
- **Arquivos:** `server/src/auth/auth.controller.ts`, `server/src/auth/auth.service.ts`, `server/src/auth/auth.module.ts`
- **Recomendação técnica:**
  1. Remover `@Public()` de `register` e exigir JWT + papel `ADMIN` para criar usuários (endpoint administrativo).
  2. Criar um **seed do primeiro admin** (script `prisma/seed.ts` ou comando único protegido por variável de ambiente `ADMIN_BOOTSTRAP_EMAIL`/`ADMIN_BOOTSTRAP_PASSWORD`).
  3. Alternativa mais simples se o sistema é de uso interno de uma única oficina: **desabilitar o registro por completo** e provisionar contas via seed.
- **Esforço:** **M** (1–2d) — cresce se optar por convites por e-mail.

## B2 — Autorização por papel e controle de acesso  ✅ CONCLUÍDO (`dd9c40c`)
- **Severidade:** 🔴 Crítico
- **Causa:** `User.role` existe no schema mas **nunca é verificado**. Não há `RolesGuard`. Todo usuário autenticado tem acesso total.
- **Impacto:** Sem separação entre admin e operador; qualquer conta pode exportar toda a base (CSV de clientes/veículos/OS) e apagar/alterar registros.
- **Arquivos:** novo `server/src/auth/roles.guard.ts` + `roles.decorator.ts`; aplicar nos controllers sensíveis (`integrations`, `clients`, `auth`).
- **Recomendação técnica:**
  1. Incluir `role` no payload do JWT (`auth.service.login`) e em `JwtStrategy.validate`.
  2. Criar `@Roles('ADMIN')` + `RolesGuard` e proteger: criação de usuários, exportações, e (se aplicável) exclusões.
  3. Definir o modelo de acesso: **oficina única, dados globais** (só papéis) — não é necessário multi-tenant. Documentar essa decisão.
- **Esforço:** **M–L** (2–3d).

## B3 — Proteger endpoints públicos de escrita (`/oi/scrape` e webhook)  ✅ CONCLUÍDO (`55692a4`)
- **Severidade:** 🟠 Alto (bloqueador operacional)
- **Causa:**
  - `POST /oi/scrape` é `@Public()` **sem nenhuma verificação** de origem/assinatura.
  - `POST /webhooks/oficina-inteligente` valida HMAC **só se** `OI_WEBHOOK_SECRET` estiver setado: `if (!secret) return true` (fail-open).
- **Impacto:** Escrita anônima na base — qualquer um injeta/atualiza clientes, veículos e ordens de serviço.
- **Arquivos:** `server/src/oficina-inteligente/oi.controller.ts`, `server/src/webhooks/webhooks.service.ts` (`verifySignature`), `server/src/webhooks/webhooks.controller.ts`
- **Recomendação técnica:**
  1. **Webhook:** tornar `OI_WEBHOOK_SECRET` **obrigatório em produção** — se ausente, recusar (fail-closed) em vez de aceitar tudo. Manter fail-open apenas quando `NODE_ENV !== 'production'`.
  2. **Scrape:** exigir um token compartilhado no header (ex.: `X-Collector-Token` comparado com `timingSafeEqual` a uma env `COLLECTOR_TOKEN`), embutido no bookmarklet.
  3. Adicionar rate limiting específico nesses endpoints (ver B5).
- **Esforço:** **S–M** (0,5–1,5d).

## B4 — Adotar migrations de banco (sair do `db push`)
- **Severidade:** 🔴 Crítico (operacional)
- **Causa:** O schema é aplicado com `prisma db push` (o MySQL remoto bloqueia o shadow DB usado pelo `migrate`). Não há histórico de schema nem rollback.
- **Impacto:** Em produção, qualquer alteração de schema corre risco de **drift** e de **perda de dados** sem trilha de auditoria nem reversão.
- **Arquivos:** `server/prisma/schema.prisma`, novo diretório `server/prisma/migrations/`
- **Recomendação técnica:**
  1. Provisionar um **shadow database** dedicado (banco MySQL separado, local ou de staging) para habilitar `prisma migrate`.
  2. Fazer o **baseline** do schema atual: `prisma migrate diff` → primeira migration, marcada como aplicada no banco de produção (`migrate resolve --applied`).
  3. Passar a versionar toda mudança via `prisma migrate dev` (dev) / `prisma migrate deploy` (prod). Documentar no README.
- **Esforço:** **M** (1–2d) — depende do provisionamento do shadow DB.

## B5 — Endurecimento HTTP: vulnerabilidades, helmet, rate limit, CORS  ✅ CONCLUÍDO (`e464382`)
- **Severidade:** 🟠 Alto
- **Nota (o que ficou pendente):** server com **0 vulnerabilidades**; no web restam **2 high em `react-router-dom`** que exigem upgrade *breaking* (`npm audit fix --force`) — adiado para um upgrade testado (Fase 2). Rate-limit usa storage em memória; para múltiplas instâncias, migrar para Redis.
- **Causa:** `npm audit` acusa vulns *high* (multer via `@nestjs/platform-express`; vite/launch-editor). Sem `helmet`, sem `@nestjs/throttler`, e o CORS só libera `http://localhost:5173`.
- **Impacto:** DoS/abuso; brute-force no login; custo descontrolado nos endpoints de IA; **o frontend de produção será bloqueado pelo CORS**.
- **Arquivos:** `server/src/main.ts`, `server/src/app.module.ts`, `server/package.json`, `prost-web/package.json`
- **Recomendação técnica:**
  1. `npm audit fix` em `server/` e `prost-web/` (revalidar build após).
  2. Adicionar `helmet()` e `@nestjs/throttler` (limite global + limite agressivo no login e nos endpoints de IA/scrape).
  3. Mover as origens do CORS para env (`CORS_ORIGINS`) e incluir o domínio de produção do frontend.
- **Esforço:** **S–M** (0,5–1,5d).

## B6 — Infraestrutura mínima de produção
- **Severidade:** 🟠 Alto (operacional)
- **Causa:** Não há Dockerfile, CI/CD, health check público, logging estruturado, monitoramento nem estratégia de backup.
- **Impacto:** Deploy manual e frágil; falhas em produção passam despercebidas; sem recuperação de desastre.
- **Arquivos:** novos — `server/Dockerfile`, `prost-web/Dockerfile` (ou build estático + Nginx), `docker-compose.yml`, `.github/workflows/ci.yml`
- **Recomendação técnica:**
  1. **Health check público:** endpoint `GET /health` marcado `@Public()` (o `GET /` atual exige JWT por causa do guard global).
  2. **Docker:** imagem do backend (`node dist/src/main.js`) e build estático do frontend servido por Nginx/host.
  3. **Logging:** trocar `console.log` por logger estruturado (pino/winston); remover o `console.log('Banco conectado…')`.
  4. **Monitoramento:** integrar error tracking (ex.: Sentry) no backend e no frontend.
  5. **Backup:** rotina de dump do MySQL (diária) + teste de restauração documentado.
- **Esforço:** **L** (3–5d).

## B7 — Higienizar o repositório e versionar o código
- **Severidade:** 🟡 Médio (mas trivial e essencial para deploy correto)
- **Causa:** Há muitos arquivos **untracked** (ex.: `server/src/auth/jwt.strategy.ts`, `server/src/common/`, `prost-web/src/hooks/`, `prost-web/src/lib/errors.ts`), scaffolds legados na raiz (`src/`, `app.module.ts`, `package.json`, `prost/`) e um diretório-lixo `prost-web/prost-web/`.
- **Impacto:** Código que funciona localmente **não está no git** — risco de deploy incompleto e de perda. O lixo confunde qualquer automação de build.
- **Arquivos:** raiz do repo, `prost-web/prost-web/`
- **Recomendação técnica:**
  1. Revisar e **commitar** todos os arquivos untracked necessários.
  2. Remover fisicamente `prost-web/prost-web/` e, se confirmados obsoletos, os scaffolds da raiz (já gitignorados).
  3. Garantir que o build de produção parte de um checkout limpo (`git clean -ndx` para inspecionar).
- **Esforço:** **S** (≤0,5d).

---

# 🟠 FASE 1 — Endurecimento (logo antes ou na 1ª semana)

## H1 — Error Boundary no frontend
- **Prioridade:** 🟡 Médio · **Esforço:** S
- **Causa/Impacto:** Sem `ErrorBoundary` do React, uma exceção de render leva o app à tela branca.
- **Ação:** Envolver as rotas com um `ErrorBoundary` com fallback amigável e botão de recarregar. Arquivo: `prost-web/src/App.tsx`.

## H2 — Índices de banco nas colunas consultadas
- **Prioridade:** 🟡 Médio · **Esforço:** S
- **Causa/Impacto:** `findFirst` por `Vehicle.plate`, `Client.name`, `Client.cpfcnpj`, `Diagnostic.vehicleId` sem índice → *full scan* que degrada com volume (fluxos de scrape/webhook).
- **Ação:** Adicionar `@@index` no `schema.prisma` e aplicar via migration (B4). Considerar unicidade em `Vehicle.plate` e `Client.cpfcnpj`.

## H3 — Sessão mais robusta (JWT)
- **Prioridade:** 🟡 Médio · **Esforço:** M
- **Causa/Impacto:** Token em `localStorage` (roubável por XSS), 1 dia de validade, sem refresh nem revogação.
- **Ação:** Migrar para **cookie httpOnly + SameSite**, com refresh token curto/rotativo. Arquivos: `auth.*`, `prost-web/src/api/index.ts`, `AuthContext.tsx`.

## H4 — Filtro global de exceções e mensagens de erro
- **Prioridade:** 🟢 Baixo · **Esforço:** S
- **Ação:** `ExceptionFilter` global padronizando respostas de erro e evitando vazamento de detalhes internos em produção.

## H5 — Robustez dos webhooks (retry / dead-letter)
- **Prioridade:** 🟡 Médio · **Esforço:** M
- **Causa/Impacto:** Processamento *fire-and-forget* (`void this.processEvent(...).catch(log)`) — eventos falhos só são logados, sem reprocessamento.
- **Ação:** Persistir status `FAILED` já existe; adicionar reprocesso manual/agendado ou fila (BullMQ) para retry com backoff.

---

# 🟢 FASE 2 — Pós-deploy (sem comprometer estabilidade)

| ID | Item | Prioridade | Esforço | Nota |
|---|---|---|---|---|
| P1 | **Testes automatizados + CI** | 🟡 Médio | L | Cobertura hoje ~0 em `server/src` e no frontend. Começar por auth, scrape e webhooks. |
| P2 | **Auditoria de acessibilidade** | 🟢 Baixo | M | `aria-label` em botões-ícone, contraste, navegação por teclado. |
| P3 | **Cache** (HTTP/DB) e CDN de assets | 🟢 Baixo | M | Reduz latência e custo. |
| P4 | **Object storage para assinaturas** | 🟢 Baixo | M | Hoje base64 `LongText` incha o banco e as queries. |
| P5 | **Enums Prisma** no lugar de `String` | 🟢 Baixo | S | `status`, `unit`, `role`, `source` → integridade a nível de banco. |
| P6 | **IA: timeout, cache e limite de custo** | 🟡 Médio | M | Chamadas Gemini síncronas com `googleSearch`; sanitizar entrada (queixa/VIN) e limitar abuso. |
| P7 | **Sanitizar dedupe de cliente** | 🟢 Baixo | S | Comparação por nome é frágil (acentos/espaços/caixa); normalizar antes de casar. |
| P8 | **Revisar tipagem estrita** | 🟢 Baixo | S | `noImplicitAny: false` e `strictBindCallApply: false` afrouxam checagem. |

---

## 🧭 Ordem de execução recomendada

```
1. B7  Higienizar repo e commitar        (destrava tudo; ≤0,5d)
2. B5  audit fix + helmet + throttler + CORS
3. B1  Fechar registro público
4. B2  Autorização por papel (RolesGuard)
5. B3  Proteger /oi/scrape + webhook fail-closed
6. B4  Migrations (provisionar shadow DB + baseline)
7. B6  Infra: Docker + /health + logs + monitoramento + backup
   ── PORTÃO DE GO-LIVE (confiança ≥ 85%) ──
8. Fase 1 (H1–H5) em paralelo à estabilização
9. Fase 2 (P1–P8) de forma contínua
```

**Estimativa até o go-live (Fase 0):** **~9 a 14 dias-pessoa**, dependendo de:
- provisionamento do shadow DB (B4) e do ambiente de infra (B6);
- escopo do controle de acesso (B2) — só papéis (mais rápido) vs. convites por e-mail.

---

## ✅ Checklist do dia do deploy (go-live)

- [ ] Todos os itens **B1–B7** concluídos e validados.
- [ ] `npm run build` limpo em `server/` e `prost-web/` a partir de checkout limpo.
- [ ] `.env` de produção preenchido: `DATABASE_URL`, `JWT_SECRET` (forte), `OI_TOKEN`, `OI_WEBHOOK_SECRET`, `COLLECTOR_TOKEN`, `GEMINI_API_KEY`, `CORS_ORIGINS`, `PORT`.
- [ ] `prisma migrate deploy` executado (sem `db push`).
- [ ] Primeiro admin provisionado via seed; registro público desabilitado.
- [ ] HTTPS ativo (TLS no proxy/host) e CORS com domínio de produção.
- [ ] `GET /health` respondendo 200 sem autenticação.
- [ ] Error tracking recebendo eventos (teste proposital de erro).
- [ ] Backup automático do MySQL ativo e **restauração testada** ao menos uma vez.
- [ ] `npm audit` sem vulnerabilidades *high* remanescentes.

---

*Gerado a partir da auditoria técnica de prontidão para produção. Atualize este documento conforme os itens forem concluídos (marque ✅ e registre a data).*
