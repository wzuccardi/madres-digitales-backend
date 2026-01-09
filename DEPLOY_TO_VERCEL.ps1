# Script para despliegue manual en Vercel
Write-Host "🚀 INICIANDO DESPLIEGUE MANUAL EN VERCEL..." -ForegroundColor Cyan

# Verificar si vercel CLI está instalado
try {
    $vercelVersion = vercel --version
    Write-Host "✅ Vercel CLI encontrado: $vercelVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Vercel CLI no encontrado. Instalando..." -ForegroundColor Red
    npm install -g vercel
}

Write-Host "`n📦 Configurando proyecto para despliegue..." -ForegroundColor Yellow

# Hacer commit de los cambios de configuración
Write-Host "📝 Haciendo commit de cambios de configuración..." -ForegroundColor Gray
git add .
git commit -m "fix: Simplificar configuración Vercel para despliegue

- Cambiar vercel.json a configuración builds/routes estándar
- Simplificar package.json para evitar errores de Prisma
- Remover comandos complejos que causan problemas en Vercel"

# Push a ambos repositorios
Write-Host "📤 Haciendo push a repositorios..." -ForegroundColor Gray
git push origin master
git push frontend master

Write-Host "`n🔧 OPCIONES DE DESPLIEGUE:" -ForegroundColor Cyan
Write-Host "1. Despliegue automático: Vercel detectará los cambios en ~2-3 minutos" -ForegroundColor White
Write-Host "2. Despliegue manual: Usar 'vercel --prod' en el directorio del proyecto" -ForegroundColor White
Write-Host "3. Dashboard Vercel: Hacer redeploy manual desde https://vercel.com/dashboard" -ForegroundColor White

Write-Host "`n📋 INFORMACIÓN DEL PROYECTO:" -ForegroundColor Cyan
Write-Host "- Backend: https://github.com/wzuccardi/madres-digitales-backend" -ForegroundColor White
Write-Host "- Frontend: https://github.com/wzuccardi/madres-digitales-frontend" -ForegroundColor White
Write-Host "- Rama: master" -ForegroundColor White
Write-Host "- Configuración: Simplificada para Vercel" -ForegroundColor White

Write-Host "`n⏰ Esperando despliegue automático..." -ForegroundColor Yellow
Write-Host "Los cambios deberían reflejarse en 2-3 minutos." -ForegroundColor Gray

# Función para verificar el despliegue
function Test-Deployment {
    Write-Host "`n🔍 Verificando despliegue..." -ForegroundColor Yellow
    
    try {
        $response = Invoke-RestMethod -Uri "https://madres-digitales-backend.vercel.app" -TimeoutSec 10
        if ($response.success) {
            Write-Host "✅ Backend desplegado correctamente" -ForegroundColor Green
            
            # Probar endpoint de puerperio
            try {
                $puerperioResponse = Invoke-RestMethod -Uri "https://madres-digitales-backend.vercel.app/api/puerperio/estadisticas" -TimeoutSec 10
                if ($puerperioResponse.success) {
                    Write-Host "✅ Endpoint puerperio funcionando" -ForegroundColor Green
                    Write-Host "   Datos: $($puerperioResponse.data.resumen.total_combinado) total" -ForegroundColor White
                } else {
                    Write-Host "❌ Endpoint puerperio con errores" -ForegroundColor Red
                }
            } catch {
                Write-Host "❌ Endpoint puerperio no responde" -ForegroundColor Red
            }
        }
    } catch {
        Write-Host "❌ Backend no responde aún" -ForegroundColor Red
    }
}

# Verificar cada 30 segundos por 5 minutos
Write-Host "`n⏳ Verificando cada 30 segundos..." -ForegroundColor Gray
for ($i = 1; $i -le 10; $i++) {
    Write-Host "Intento $i/10..." -ForegroundColor Gray
    Test-Deployment
    if ($i -lt 10) {
        Start-Sleep -Seconds 30
    }
}

Write-Host "`n🎯 DESPLIEGUE COMPLETADO" -ForegroundColor Green
Write-Host "Verifica manualmente en:" -ForegroundColor White
Write-Host "- Backend: https://madres-digitales-backend.vercel.app" -ForegroundColor Cyan
Write-Host "- Frontend: https://madres-digitales-frontend.vercel.app" -ForegroundColor Cyan