#!/usr/bin/env bash
#
# Valida um ambiente de staging/produção do PROST (smoke test da API).
#
# Uso:
#   ./scripts/validate-staging.sh [URL_DO_SERVER]
#   (default: http://localhost:3000)
#
# Fluxo autenticado opcional (login -> /auth/me -> logout), se informar:
#   STAGING_EMAIL=admin@... STAGING_PASSWORD=... ./scripts/validate-staging.sh
#
# Todas as checagens sem credenciais são NÃO-mutantes. Sai com código != 0 se
# alguma falhar (bom para CI/pipeline de deploy).
set -uo pipefail

BASE="${1:-http://localhost:3000}"
PASS=0
FAIL=0

green() { printf '\033[32m%s\033[0m' "$1"; }
red() { printf '\033[31m%s\033[0m' "$1"; }

# check <descrição> <esperado> <código_obtido>
check() {
  if [ "$2" = "$3" ]; then
    echo "  [$(green PASS)] $1 (HTTP $3)"
    PASS=$((PASS + 1))
  else
    echo "  [$(red FALHA)] $1 — esperado $2, obtido $3"
    FAIL=$((FAIL + 1))
  fi
}

code() { curl -s -o /dev/null -w '%{http_code}' "$@"; }

echo "== Validando $BASE =="

# 1. Health (público) — deve conter status ok
HEALTH_BODY="$(curl -s "$BASE/health")"
HEALTH_CODE="$(code "$BASE/health")"
check "health responde 200" 200 "$HEALTH_CODE"
if echo "$HEALTH_BODY" | grep -q '"status":"ok"'; then
  echo "  [$(green PASS)] health.status = ok  ($HEALTH_BODY)"
  PASS=$((PASS + 1))
else
  echo "  [$(red FALHA)] health.status != ok  ($HEALTH_BODY)"
  FAIL=$((FAIL + 1))
fi

# 2. Auth exigida onde deve
check "/auth/me sem sessão -> 401" 401 "$(code "$BASE/auth/me")"
check "/files/<x> sem sessão -> 401" 401 "$(code "$BASE/files/inexistente.png")"
check "listagem protegida (/clients) -> 401" 401 "$(code "$BASE/clients")"

# 3. Fail-closed da ingestão externa (em produção)
check "webhook sem assinatura -> 401" 401 \
  "$(code -X POST "$BASE/webhooks/oficina-inteligente" -H 'Content-Type: application/json' -d '{}')"
check "scrape sem token -> 401" 401 \
  "$(code -X POST "$BASE/oi/scrape" -H 'Content-Type: application/json' -d '{}')"

# 4. Login é público e valida o corpo
check "login (corpo vazio) -> 400" 400 \
  "$(code -X POST "$BASE/auth/login" -H 'Content-Type: application/json' -d '{}')"

# 5. Fluxo autenticado (opcional)
if [ -n "${STAGING_EMAIL:-}" ] && [ -n "${STAGING_PASSWORD:-}" ]; then
  echo "-- fluxo autenticado (login -> me -> logout) --"
  JAR="$(mktemp)"
  LOGIN_CODE="$(curl -s -o /dev/null -w '%{http_code}' -c "$JAR" -X POST "$BASE/auth/login" \
    -H 'Content-Type: application/json' \
    -d "{\"email\":\"$STAGING_EMAIL\",\"password\":\"$STAGING_PASSWORD\"}")"
  check "login com credenciais -> 201" 201 "$LOGIN_CODE"
  # cookies httpOnly presentes?
  if grep -qi 'access_token' "$JAR" && grep -qi 'refresh_token' "$JAR"; then
    echo "  [$(green PASS)] cookies access_token e refresh_token setados"
    PASS=$((PASS + 1))
  else
    echo "  [$(red FALHA)] cookies de sessão ausentes"
    FAIL=$((FAIL + 1))
  fi
  check "/auth/me com sessão -> 200" 200 "$(code -b "$JAR" "$BASE/auth/me")"
  check "logout -> 201" 201 "$(code -b "$JAR" -c "$JAR" -X POST "$BASE/auth/logout")"
  rm -f "$JAR"
else
  echo "-- fluxo autenticado pulado (defina STAGING_EMAIL/STAGING_PASSWORD p/ testar) --"
fi

echo "== Resultado: $(green "$PASS ok") / $([ "$FAIL" -gt 0 ] && red "$FAIL falha(s)" || echo '0 falhas') =="
[ "$FAIL" -eq 0 ]
