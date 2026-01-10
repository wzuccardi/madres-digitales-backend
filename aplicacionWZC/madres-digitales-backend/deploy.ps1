# Script de despliegue a Vercel - Madres Digitales Backend (PowerShell)
# Uso: .\deploy.ps1 [-Type production|preview]

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('production', 'prod', 'preview')]
    [string]$Type = 'preview'
)

Write-Host "🚀 Iniciando despliegue a Vercel..." -ForegroundColor Cyan

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: No se encontró package.json. Ejecuta este script desde el directorio del backend." -ForegroundColor Red
    exit 1
}

# Verificar que Vercel CLI está instalado
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $vercelInstalled) {
    Write-Host "📦 Vercel CLI no encontrado. Instalando..." -ForegroundColor Yellow
    npm install -g vercel
}

# Determinar el tipo de despliegue
if ($Type -eq 'production' -or $Type -eq 'prod') {
    Write-Host "🎯 Desplegando a PRODUCCIÓN..." -ForegroundColor Green
    $DeployCmd = "vercel --prod"
} else {
    Write-Host "🔍 Desplegando a PREVIEW..." -ForegroundColor Yellow
    $DeployCmd = "vercel"
}

# Verificar que las variables de entorno estén configuradas
Write-Host "🔐 Verificando variables de entorno..." -ForegroundColor Cyan
try {
    vercel env ls 2>&1 | Out-Null
} catch {
    Write-Host "⚠️  Advertencia: No se pudieron listar las variables de entorno." -ForegroundColor Yellow
    Write-Host "   Asegúrate de configurarlas en Vercel Dashboard." -ForegroundColor Yellow
}

# Generar Prisma Client
Write-Host "🔨 Generando Prisma Client..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al generar Prisma Client" -ForegroundColor Red
    exit 1
}

# Ejecutar despliegue
Write-Host "📤 Desplegando a Vercel..." -ForegroundColor Cyan
Invoke-Expression $DeployCmd

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Despliegue completado!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Para ver los logs:" -ForegroundColor Cyan
    Write-Host "   vercel logs" -ForegroundColor White
    Write-Host ""
    Write-Host "🔗 Para ver el proyecto:" -ForegroundColor Cyan
    Write-Host "   vercel --prod (si desplegaste a producción)" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Error durante el despliegue" -ForegroundColor Red
    Write-Host "Revisa los logs con: vercel logs" -ForegroundColor Yellow
    exit 1
}
