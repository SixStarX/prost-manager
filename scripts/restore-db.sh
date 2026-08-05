#!/usr/bin/env bash
#
# Restaura um dump .sql.gz gerado por backup-db.sh em um banco MySQL.
#
# PERIGOSO: sobrescreve o banco de DESTINO. Restaure preferencialmente num banco
# de teste — nunca em produção sem certeza.
#
# Uso:
#   DATABASE_URL="mysql://user:pass@host:port/db_destino" ./scripts/restore-db.sh <arquivo.sql.gz>
set -euo pipefail

: "${DATABASE_URL:?Defina DATABASE_URL do banco de DESTINO}"
FILE="${1:?Informe o arquivo .sql.gz do backup}"
[ -f "$FILE" ] || { echo "Arquivo não encontrado: $FILE" >&2; exit 1; }
gzip -t "$FILE" || { echo "Arquivo .gz inválido/corrompido: $FILE" >&2; exit 1; }

eval "$(node <<'NODE'
const u = new URL(process.env.DATABASE_URL);
const shq = (s) => "'" + String(s).replace(/'/g, "'\\''") + "'";
const name = u.pathname.replace(/^\//, '').split('?')[0];
process.stdout.write(
  'DB_HOST=' + shq(u.hostname) + '\n' +
  'DB_PORT=' + shq(u.port || '3306') + '\n' +
  'DB_USER=' + shq(decodeURIComponent(u.username)) + '\n' +
  'DB_PASS=' + shq(decodeURIComponent(u.password)) + '\n' +
  'DB_NAME=' + shq(name) + '\n'
);
NODE
)"

echo "!! ATENÇÃO: isto vai IMPORTAR '${FILE}'"
echo "!! no banco '${DB_NAME}' @ ${DB_HOST}:${DB_PORT} — os dados atuais podem ser sobrescritos."
printf "Para confirmar, digite o nome do banco (%s): " "$DB_NAME"
read -r CONFIRM
[ "$CONFIRM" = "$DB_NAME" ] || { echo "Cancelado."; exit 1; }

gzip -dc "$FILE" | MYSQL_PWD="$DB_PASS" mysql \
  --host="$DB_HOST" --port="$DB_PORT" --user="$DB_USER" \
  --default-character-set=utf8mb4 "$DB_NAME"

echo "[restore] Concluído em ${DB_NAME}."
