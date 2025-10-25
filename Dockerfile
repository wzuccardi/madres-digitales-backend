# ========================================
# Dockerfile Backend - Producción
# Madres Digitales - Multi-stage Build
# ========================================

# Etapa 1: Builder - Compilación TypeScript
FROM node:20-alpine AS builder

# Instalar dependencias de build mínimas
RUN apk add --no-cache libc6-compat python3 make g++

# Configurar npm para producción
ENV NODE_ENV=production
ENV NPM_CONFIG_LOGLEVEL=warn
ENV NPM_CONFIG_PROGRESS=false

# Crear usuario no-root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs node

WORKDIR /app

# Copiar solo archivos de package management
COPY package*.json pnpm-lock.yaml* ./

# Instalar pnpm globalmente y dependencias
RUN npm install -g pnpm && \
    pnpm install --frozen-lockfile --prod=false --ignore-scripts

# Copiar solo archivos necesarios
COPY tsconfig.json ./
COPY prisma ./prisma/

# Generar cliente Prisma y compilar
RUN pnpm prisma generate && \
    pnpm run build

# Etapa 2: Runtime - Imagen ultra-ligera
FROM node:20-alpine AS runtime

# Variables de entorno de producción
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Instalar solo dependencias runtime críticas
RUN apk add --no-cache \
    dumb-init \
    curl \
    ca-certificates \
    && rm -rf /var/cache/apk/* \
    && apk cache purge

# Crear usuario no-root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs node

WORKDIR /app

# Copiar desde builder stage con ownership correcto
COPY --from=builder --chown=node:nodejs /app/dist ./dist
COPY --from=builder --chown=node:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=node:nodejs /app/package*.json ./
COPY --from=builder --chown=node:nodejs /app/prisma ./prisma

# Crear directorios necesarios con permisos correctos
RUN mkdir -p /app/uploads /app/logs && \
    chown -R node:nodejs /app

# Cambiar a usuario no-root
USER node

# Exponer puerto
EXPOSE 3000

# Health check optimizado
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Iniciar con dumb-init para manejo de señales
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "--max-old-space-size=512", "dist/app.js"]