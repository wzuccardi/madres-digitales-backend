#!/usr/bin/env powershell
# Script para iniciar pruebas locales completas
# Inicia Backend y Frontend automáticamente

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     🚀 INICIAR PRUEBAS LOCALES COMPLETAS                  ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Colores
$Success = "Green"
$Error = "Red"
$Info = "Cyan"
$Warning = "Yellow"

# Función para mostrar mensajes
function Show-Message {
    param(
        [string]$Message,
        [string]$Type = "Info"
    )
    
    $Color = switch($Type) {
        "Success" { $Success }
        "Error" { $Error }
        "Warning" { $Warning }
        default { $Info }
    }
    
    Write-Host $Message -ForegroundColor $Color
}

# Verificar que estamos en el directorio correcto
$BackendPath = "C:\Madrinas\aplicacionWZC\madres-digitales-backend"
$FrontendPath = "C:\Madrinas\aplicacionWZC\madres_digitales_flutter_new"

if (-not (Test-Path $BackendPath)) {
    Show-Message "❌ Backend no encontrado en: $BackendPath" "Error"
    exit 1
}

if (-not (Test-Path $FrontendPath)) {
    Show-Message "❌ Frontend no encontrado en: $FrontendPath" "Error"
    exit 1
}

Show-Message "✅ Rutas verificadas correctamente" "Success"
Write-Host ""

# Verificar .env.local
Show-Message "📋 Verificando configuración..." "Info"

$EnvLocalPath = "$BackendPath\.env.local"
if (-not (Test-Path $EnvLocalPath)) {
    Show-Message "⚠️  .env.local no encontrado. Creando..." "Warning"
    
    $EnvContent = @"
# Database - Prisma Cloud
DATABASE_URL="postgres://ff07eebc333c5499909e4b9766469e0b08d9c9e62beb8a9e5f426f3c793632a1:sk_fSmVWDgDBhkj8E1xooYPd@db.prisma.io:5432/postgres?sslmode=require"

# JWT Secrets
JWT_SECRET="dev_secret_key_12345"
JWT_REFRESH_SECRET="dev_refresh_secret_key_12345"

# Configuración
NODE_ENV="development"
PORT="54112"

# CORS
CORS_ORIGINS="http://localhost:3008,http://localhost:54112,http://127.0.0.1:3008,http://127.0.0.1:54112"

# URLs
FRONTEND_URL="http://localhost:3008"
BACKEND_URL="http://localhost:54112"

# Logging
LOG_LEVEL="debug"
DEBUG="true"
"@
    
    Set-Content -Path $EnvLocalPath -Value $EnvContent
    Show-Message "✅ .env.local creado" "Success"
} else {
    Show-Message "✅ .env.local encontrado" "Success"
}

Write-Host ""
Show-Message "🔧 Configuración de Entorno" "Info"
Write-Host "  - Backend: http://localhost:54112"
Write-Host "  - Frontend: http://localhost:3008"
Write-Host "  - Modo: LOCAL"
Write-Host ""

# Iniciar Backend
Show-Message "🚀 Iniciando Backend..." "Info"
Write-Host ""

$BackendProcess = Start-Process -FilePath "powershell" `
    -ArgumentList "-NoExit", "-Command", "cd '$BackendPath'; npm install; node api/index.js" `
    -PassThru

Show-Message "✅ Backend iniciado (PID: $($BackendProcess.Id))" "Success"
Write-Host ""

# Esperar a que el backend esté listo
Show-Message "⏳ Esperando a que el backend esté listo..." "Info"
Start-Sleep -Seconds 5

# Verificar que el backend está corriendo
$BackendReady = $false
for ($i = 0; $i -lt 10; $i++) {
    try {
        $Response = Invoke-WebRequest -Uri "http://localhost:54112/health" -UseBasicParsing -ErrorAction SilentlyContinue
        if ($Response.StatusCode -eq 200) {
            $BackendReady = $true
            break
        }
    } catch {
        Start-Sleep -Seconds 1
    }
}

if ($BackendReady) {
    Show-Message "✅ Backend está listo" "Success"
} else {
    Show-Message "⚠️  Backend puede no estar completamente listo, continuando..." "Warning"
}

Write-Host ""

# Iniciar Frontend
Show-Message "🚀 Iniciando Frontend..." "Info"
Write-Host ""

$FrontendProcess = Start-Process -FilePath "powershell" `
    -ArgumentList "-NoExit", "-Command", "cd '$FrontendPath'; flutter run -d chrome" `
    -PassThru

Show-Message "✅ Frontend iniciado (PID: $($FrontendProcess.Id))" "Success"
Write-Host ""

# Mostrar información final
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║     ✅ PRUEBAS LOCALES INICIADAS CORRECTAMENTE            ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Show-Message "📱 URLs Disponibles:" "Info"
Write-Host "  - Frontend: http://localhost:3008"
Write-Host "  - Backend: http://localhost:54112"
Write-Host "  - API Docs: http://localhost:54112/api-docs"
Write-Host ""

Show-Message "🔐 Credenciales de Prueba:" "Info"
Write-Host "  - Email: wzuccardi@gmail.com"
Write-Host "  - Contraseña: password123"
Write-Host "  - Rol: SUPER_ADMIN"
Write-Host ""

Show-Message "📋 Procesos Iniciados:" "Info"
Write-Host "  - Backend PID: $($BackendProcess.Id)"
Write-Host "  - Frontend PID: $($FrontendProcess.Id)"
Write-Host ""

Show-Message "💡 Nota: Los procesos se ejecutan en ventanas separadas" "Info"
Show-Message "   Cierra las ventanas para detener los servidores" "Info"
Write-Host ""

# Mantener el script abierto
Write-Host "Presiona Ctrl+C para salir de este script (los servidores seguirán corriendo)"
Read-Host "Presiona Enter para continuar"

