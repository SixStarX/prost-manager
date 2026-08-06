# ---------- builder ----------
# Debian slim: tem toolchain para compilar módulos nativos (bcrypt) e OpenSSL p/ o Prisma.
FROM node:24-bookworm-slim AS builder
WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ openssl \
  && rm -rf /var/lib/apt/lists/*

# Instala deps com o lockfile; gera o Prisma Client antes de copiar o resto (cache).
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci
RUN npx prisma generate

COPY . .
RUN npm run build
# Remove devDependencies mantendo os módulos nativos já compilados.
RUN npm prune --omit=dev

# ---------- runner ----------
FROM node:24-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# OpenSSL é exigido pela engine do Prisma em runtime.
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json

# Diretório de uploads (assinaturas) gravável pelo usuário node — o volume do
# docker-compose é montado aqui e herda esta permissão na 1ª criação.
RUN mkdir -p /app/uploads && chown -R node:node /app/uploads

EXPOSE 3000
# Usuário não-root (imagem node já traz o usuário "node").
USER node

# Health check nativo do container (bate no endpoint público /health).
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:3000/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "dist/src/main.js"]
