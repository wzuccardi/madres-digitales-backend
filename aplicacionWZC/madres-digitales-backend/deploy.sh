#!/bin/bash

# Script de despliegue a Vercel - Madres Digitales Backend
# Uso: ./deploy.sh [production|preview]

set -e

echo "🚀 Iniciando despliegue a Vercel..."

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json. Ejecuta este script desde el directorio del backend."
    exit 1
fi

# Verificar que Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo "📦 Vercel CLI no encontrado. Instalando..."
    npm install -g vercel
fi

# Determinar el tipo de despliegue
DEPLOY_TYPE=${1:-preview}

if [ "$DEPLOY_TYPE" = "production" ] || [ "$DEPLOY_TYPE" = "prod" ]; then
    echo "🎯 Desplegando a PRODUCCIÓN..."
    DEPLOY_CMD="vercel --prod"
else
    echo "🔍 Desplegando a PREVIEW..."
    DEPLOY_CMD="vercel"
fi

# Verificar que las variables de entorno estén configuradas
echo "🔐 Verificando variables de entorno..."
if ! vercel env ls > /dev/null 2>&1; then
    echo "⚠️  Advertencia: No se pudieron listar las variables de entorno."
    echo "   Asegúrate de configurarlas en Vercel Dashboard."
fi

# Generar Prisma Client
echo "🔨 Generando Prisma Client..."
npm run build

# Ejecutar despliegue
echo "📤 Desplegando a Vercel..."
$DEPLOY_CMD

echo "✅ Despliegue completado!"
echo ""
echo "📊 Para ver los logs:"
echo "   vercel logs"
echo ""
echo "🔗 Para ver el proyecto:"
echo "   vercel --prod (si desplegaste a producción)"
echo ""
