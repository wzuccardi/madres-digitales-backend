# Script para verificar el despliegue en Vercel
Write-Host "🚀 VERIFICANDO DESPLIEGUE EN VERCEL..." -ForegroundColor Cyan

# Verificar Backend
Write-Host "`n📡 Verificando Backend..." -ForegroundColor Yellow
$backendUrl = "https://madres-digitales-backend.vercel.app"
$puerperioUrl = "$backendUrl/api/puerperio/estadisticas"

try {
    Write-Host "Probando: $backendUrl" -ForegroundColor Gray
    $response = Invoke-RestMethod -Uri $backendUrl -Method GET -TimeoutSec 10
    Write-Host "✅ Backend responde: $($response.message)" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend no responde: $($_.Exception.Message)" -ForegroundColor Red
}

try {
    Write-Host "Probando: $puerperioUrl" -ForegroundColor Gray
    $puerperioResponse = Invoke-RestMethod -Uri $puerperioUrl -Method GET -TimeoutSec 10
    if ($puerperioResponse.success) {
        $data = $puerperioResponse.data.resumen
        Write-Host "✅ Endpoint Puerperio funciona:" -ForegroundColor Green
        Write-Host "   - Gestantes: $($data.total_gestantes_activas)" -ForegroundColor White
        Write-Host "   - Puerperio: $($data.total_puerperio)" -ForegroundColor White
        Write-Host "   - Total: $($data.total_combinado)" -ForegroundColor White
    } else {
        Write-Host "❌ Endpoint Puerperio error: $($puerperioResponse.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Endpoint Puerperio no responde: $($_.Exception.Message)" -ForegroundColor Red
}

# Verificar Frontend
Write-Host "`n🌐 Verificando Frontend..." -ForegroundColor Yellow
$frontendUrl = "https://madres-digitales-frontend.vercel.app"

try {
    Write-Host "Probando: $frontendUrl" -ForegroundColor Gray
    $frontendResponse = Invoke-WebRequest -Uri $frontendUrl -Method GET -TimeoutSec 10
    if ($frontendResponse.StatusCode -eq 200) {
        Write-Host "✅ Frontend responde correctamente" -ForegroundColor Green
        
        # Verificar si contiene referencias al widget de puerperio
        $content = $frontendResponse.Content
        if ($content -match "puerperio" -or $content -match "PuerperioStatsWidget") {
            Write-Host "✅ Widget de puerperio detectado en el código" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Widget de puerperio no detectado en el HTML" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "❌ Frontend no responde: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n📋 RESUMEN:" -ForegroundColor Cyan
Write-Host "- Backend URL: $backendUrl" -ForegroundColor White
Write-Host "- Frontend URL: $frontendUrl" -ForegroundColor White
Write-Host "- Endpoint Puerperio: $puerperioUrl" -ForegroundColor White
Write-Host "- Credenciales: wzuccardi@gmail.com / 73102604722" -ForegroundColor White

Write-Host "`n⏰ Si los servicios no responden, espera 2-3 minutos para que Vercel complete el despliegue." -ForegroundColor Yellow