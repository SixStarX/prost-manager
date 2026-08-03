#!/usr/bin/env bash
#
# Backup do MySQL do PROST Manager.
#
# Requisitos: mysqldump, gzip e node no PATH.
# Uso:
#   DATABASE_URL="mysql://user:pass@host:port/db" ./scripts/backup-db.sh [DIR_DESTINO]
#
# Variáveis opcionais:
#   BACKUP_DIR              (default: ./backups)  — destino dos dumps
#   BACKUP_RETENTION_DAYS   (default: 14)         — apaga dumps mais antigos
#
# O dump é consistente (--single-transaction), comprimido e datado. Contém
# dados pessoais — o destino é gitignored; guarde-o em local seguro/criptografado.
set -euo pipefail

: "${DATABASE_URL:?Defina DATABASE_URL (mysql://user:pass@host:port/db)}"
BACKUP_DIR="${1:-${BACKUP_DIR:-./backups}}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-14}"

# Parse robusto da URL via node (lida com URL-encoding e caracteres especiais na senha).
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

mkdir -p "$BACKUP_DIR"
TS="$(date +%Y%m%d-%H%M%S)"
OUT="$BACKUP_DIR/${DB_NAME}-${TS}.sql.gz"

echo "[backup] ${DB_NAME} @ ${DB_HOST}:${DB_PORT} -> ${OUT}"

# MYSQL_PWD evita expor a senha na lista de processos (ps).
MYSQL_PWD="$DB_PASS" mysqldump \
  --host="$DB_HOST" --port="$DB_PORT" --user="$DB_USER" \
  --single-transaction --quick --routines --triggers --events \
  --no-tablespaces --default-character-set=utf8mb4 \
  "$DB_NAME" | gzip -9 > "$OUT"

# Verifica a integridade do gzip e se o dump não está vazio.
gzip -t "$OUT"
if [ "$(gzip -dc "$OUT" | head -c 1 | wc -c)" -eq 0 ]; then
  echo "[backup] ERRO: dump vazio." >&2
  exit 1
fi
echo "[backup] OK — $(du -h "$OUT" | cut -f1)"

# Rotação: remove dumps mais antigos que RETENTION_DAYS.
find "$BACKUP_DIR" -name "${DB_NAME}-*.sql.gz" -type f -mtime +"$RETENTION_DAYS" -delete 2>/dev/null || true
echo "[backup] retenção: mantém os últimos ${RETENTION_DAYS} dias em ${BACKUP_DIR}"
