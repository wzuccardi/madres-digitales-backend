# Script para desplegar el backend a Vercel
Write-Host "🚀 Desplegando backend a Vercel..." -ForegroundColor Green

# Cambiar al directorio del backend
Set-Location "madres-digitales-backend"

# Verificar si Vercel CLI está instalado
if (!(Get-Command "vercel" -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Vercel CLI no está instalado. Instalando..." -ForegroundColor Red
    npm install -g vercel
}

# Desplegar a Vercel
Write-Host "📦 Desplegando a Vercel..." -ForegroundColor Yellow
vercel --prod

Write-Host "✅ Despliegue completado!" -ForegroundColor Green
Write-Host "🔗 El backend debería estar disponible en: https://madres-digitales-backend.vercel.app" -ForegroundColor Cyan

# Volver al directorio anterior
Set-Location ".."

# Probar las nuevas rutas
Write-Host "🧪 Probando las nuevas rutas..." -ForegroundColor Yellow
node test_backend.js