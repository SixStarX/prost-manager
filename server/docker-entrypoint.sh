#!/bin/sh
# Aplica as migrations pendentes antes de subir a API. É idempotente: num banco
# já baselined (produção), não há migration pendente e o comando é um no-op.
set -e

echo "[entrypoint] prisma migrate deploy..."
node_modules/.bin/prisma migrate deploy

echo "[entrypoint] iniciando o servidor..."
exec "$@"
