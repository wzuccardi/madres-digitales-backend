# Script mejorado para iniciar Backend y Frontend con logs visibles
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  MADRES DIGITALES - INICIO DE SERVIDORES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Matar procesos anteriores
Write-Host "🧹 Limpiando procesos anteriores..." -ForegroundColor Yellow
Stop-Process -Name node -Force -ErrorAction SilentlyContinue
Stop-Process -Name dart -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "✅ Procesos limpiados" -ForegroundColor Green
Write-Host ""

# Directorio base
$baseDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Iniciar Backend
Write-Host "🚀 INICIANDO BACKEND..." -ForegroundColor Cyan
Write-Host "   Directorio: $baseDir\madres-digitales-backend" -ForegroundColor Gray
Write-Host "   Puerto: 3000" -ForegroundColor Gray
Write-Host "   Comando: npm run dev" -ForegroundColor Gray
Write-Host ""

$backendScript = @"
`$Host.UI.RawUI.WindowTitle = 'BACKEND - Madres Digitales (Puerto 3000)'
Write-Host '========================================' -ForegroundColor Green
Write-Host '  BACKEND - MADRES DIGITALES' -ForegroundColor Green
Write-Host '  Puerto: 3000' -ForegroundColor Green
Write-Host '  Swagger: http://localhost:3000/api-docs' -ForegroundColor Green
Write-Host '========================================' -ForegroundColor Green
Write-Host ''
cd '$baseDir\madres-digitales-backend'
npm run dev
"@

Start-Process powershell -ArgumentList @("-NoExit", "-Command", $backendScript)

Write-Host "OK Backend iniciado" -ForegroundColor Green
Write-Host ""

# Esperar 10 segundos para que el backend compile
Write-Host "⏳ Esperando 10 segundos para que el backend compile..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Verificar Backend
Write-Host "🔍 Verificando Backend..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/municipios" -Method GET -TimeoutSec 5 -UseBasicParsing
    Write-Host "✅ Backend respondiendo correctamente (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Backend aún no responde (puede tardar unos segundos más)" -ForegroundColor Yellow
}
Write-Host ""

# Iniciar Frontend
Write-Host "🎨 INICIANDO FRONTEND..." -ForegroundColor Cyan
Write-Host "   Directorio: $baseDir\madres_digitales_flutter_new" -ForegroundColor Gray
Write-Host "   Puerto: 3008" -ForegroundColor Gray
Write-Host "   Comando: flutter run -d web-server --web-port 3008" -ForegroundColor Gray
Write-Host ""

$frontendScript = @"
`$Host.UI.RawUI.WindowTitle = 'FRONTEND - Madres Digitales (Puerto 3008)'
Write-Host '========================================' -ForegroundColor Blue
Write-Host '  FRONTEND - MADRES DIGITALES' -ForegroundColor Blue
Write-Host '  Puerto: 3008' -ForegroundColor Blue
Write-Host '  URL: http://localhost:3008' -ForegroundColor Blue
Write-Host '========================================' -ForegroundColor Blue
Write-Host ''
Write-Host 'Compilando Flutter Web (esto puede tardar 30-60 segundos)...' -ForegroundColor Yellow
Write-Host ''
cd '$baseDir\madres_digitales_flutter_new'
flutter run -d web-server --web-port 3008
"@

Start-Process powershell -ArgumentList @("-NoExit", "-Command", $frontendScript)

Write-Host "OK Frontend iniciado" -ForegroundColor Green
Write-Host ""

# Esperar 30 segundos para que Flutter compile
Write-Host "⏳ Esperando 30 segundos para que Flutter compile..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Verificar Frontend
Write-Host "🔍 Verificando Frontend..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3008" -Method GET -TimeoutSec 5 -UseBasicParsing
    Write-Host "✅ Frontend respondiendo correctamente (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Frontend aún está compilando (espera 30-60 segundos más)" -ForegroundColor Yellow
}
Write-Host ""

# Resumen final
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SERVIDORES INICIADOS" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📺 VENTANAS ABIERTAS:" -ForegroundColor White
Write-Host "   1. Backend (ventana con fondo negro)" -ForegroundColor Gray
Write-Host "   2. Frontend (ventana con fondo azul)" -ForegroundColor Gray
Write-Host ""
Write-Host "🌐 ACCESO:" -ForegroundColor White
Write-Host "   Frontend:  http://localhost:3008" -ForegroundColor Cyan
Write-Host "   Backend:   http://localhost:3000" -ForegroundColor Cyan
Write-Host "   Swagger:   http://localhost:3000/api-docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔐 CREDENCIALES:" -ForegroundColor White
Write-Host "   Email:    wzuccardi@gmail.com" -ForegroundColor Yellow
Write-Host "   Password: 73102604722" -ForegroundColor Yellow
Write-Host ""
Write-Host "📊 DATOS EN BASE DE DATOS:" -ForegroundColor White
Write-Host "   - 46 municipios" -ForegroundColor Gray
Write-Host "   - 10 gestantes" -ForegroundColor Gray
Write-Host "   - 24 controles prenatales" -ForegroundColor Gray
Write-Host "   - 19 alertas activas" -ForegroundColor Gray
Write-Host ""
Write-Host "⚠️  NOTAS IMPORTANTES:" -ForegroundColor Yellow
Write-Host "   - Si el frontend muestra pantalla en blanco, espera 60 segundos" -ForegroundColor Gray
Write-Host "   - Verifica las ventanas de PowerShell para ver logs" -ForegroundColor Gray
Write-Host "   - Para detener: cierra las ventanas o presiona Ctrl+C" -ForegroundColor Gray
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Abrir navegador
Write-Host "🌐 Abriendo navegador en http://localhost:3008..." -ForegroundColor Cyan
Start-Sleep -Seconds 5
Start-Process "http://localhost:3008"

Write-Host ""
Write-Host "✅ ¡TODO LISTO!" -ForegroundColor Green
Write-Host ""
Write-Host "Presiona cualquier tecla para cerrar esta ventana..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

