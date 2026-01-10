# Script para iniciar Backend y Frontend de Madres Digitales en Red Local
# Ejecutar con: .\INICIAR_SERVIDORES_RED_LOCAL.ps1

Write-Host "INICIANDO SERVIDORES - MADRES DIGITALES (RED LOCAL)" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que estamos en el directorio correcto
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host "Directorio actual: $scriptPath" -ForegroundColor Yellow
Write-Host ""

# Obtener la IP local de la red
Write-Host "Detectando IP local de red..." -ForegroundColor Yellow
$localIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.*" -and $_.InterfaceAlias -like "*Wi-Fi*"}).IPAddress

if (-not $localIP) {
    # Si no encuentra Wi-Fi, buscar Ethernet
    $localIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.*" -and $_.InterfaceAlias -like "*Ethernet*"}).IPAddress
}

if (-not $localIP) {
    Write-Host "No se pudo detectar la IP local. Usando localhost." -ForegroundColor Red
    $localIP = "localhost"
} else {
    Write-Host "IP Local detectada: $localIP" -ForegroundColor Green
}

Write-Host ""

# Función para iniciar un proceso en una nueva ventana
function Start-ServerInNewWindow {
    param(
        [string]$Title,
        [string]$Command,
        [string]$WorkingDirectory
    )
    
    Write-Host "Iniciando $Title..." -ForegroundColor Green

    $startInfo = New-Object System.Diagnostics.ProcessStartInfo
    $startInfo.FileName = "powershell.exe"
    $startInfo.Arguments = "-NoExit -Command `"cd '$WorkingDirectory'; Write-Host '$Title' -ForegroundColor Cyan; $Command`""
    $startInfo.UseShellExecute = $true
    $startInfo.CreateNoWindow = $false

    $process = [System.Diagnostics.Process]::Start($startInfo)

    if ($process) {
        Write-Host "$Title iniciado (PID: $($process.Id))" -ForegroundColor Green
        return $process
    } else {
        Write-Host "Error al iniciar $Title" -ForegroundColor Red
        return $null
    }
}

# Iniciar Backend
Write-Host ""
Write-Host "BACKEND (Node.js + Express)" -ForegroundColor Magenta
Write-Host "   Puerto: 54112" -ForegroundColor Gray
Write-Host "   Acceso desde red: http://$localIP:54112" -ForegroundColor Gray
Write-Host "   Swagger: http://$localIP:54112/api-docs" -ForegroundColor Gray
$backendPath = Join-Path $scriptPath "madres-digitales-backend"
$backendProcess = Start-ServerInNewWindow -Title "BACKEND - Madres Digitales (Red Local)" -Command '$env:PORT=54112; npm run dev' -WorkingDirectory $backendPath

Start-Sleep -Seconds 3

# Iniciar Frontend
Write-Host ""
Write-Host "FRONTEND (Flutter Web)" -ForegroundColor Magenta
Write-Host "   Puerto: 3008" -ForegroundColor Gray
Write-Host "   URL: http://$localIP:3008" -ForegroundColor Gray
$frontendPath = Join-Path $scriptPath "madres_digitales_flutter_new"
$frontendProcess = Start-ServerInNewWindow -Title "FRONTEND - Madres Digitales (Red Local)" -Command "flutter run -d chrome --web-port 3008" -WorkingDirectory $frontendPath

# Esperar a que los servidores inicien
Write-Host ""
Write-Host "Esperando a que los servidores inicien..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Verificar Backend
Write-Host ""
Write-Host "Verificando Backend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://$localIP:54112/api/municipios" -Method GET -TimeoutSec 5 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "Backend esta corriendo correctamente en puerto 54112" -ForegroundColor Green
    }
} catch {
    Write-Host "Backend aun no responde (puede tardar unos segundos mas)" -ForegroundColor Yellow
}

# Verificar Frontend
Write-Host ""
Write-Host "Verificando Frontend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://$localIP:3008" -Method GET -TimeoutSec 5 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "Frontend esta corriendo correctamente en puerto 3008" -ForegroundColor Green
    }
} catch {
    Write-Host "Frontend aun no responde (puede tardar 30-60 segundos)" -ForegroundColor Yellow
}

# Configurar Firewall (opcional)
Write-Host ""
Write-Host "CONFIGURACION DE FIREWALL" -ForegroundColor Yellow
Write-Host "Para permitir acceso desde otros dispositivos, asegurate de que el firewall permita:" -ForegroundColor Gray
Write-Host "   - Puerto 3000 (Backend)" -ForegroundColor Gray
Write-Host "   - Puerto 3008 (Frontend)" -ForegroundColor Gray
Write-Host ""
$firewallResponse = Read-Host "Deseas configurar el firewall automaticamente? (S/N)"
if ($firewallResponse -eq "S" -or $firewallResponse -eq "s") {
    Write-Host "Configurando reglas de firewall..." -ForegroundColor Yellow
    try {
        # Regla para Backend
        netsh advfirewall firewall add rule name="Madres Digitales Backend" dir=in action=allow protocol=TCP localport=54112
        Write-Host "Regla de firewall para Backend (puerto 54112) creada" -ForegroundColor Green
        
        # Regla para Frontend
        netsh advfirewall firewall add rule name="Madres Digitales Frontend" dir=in action=allow protocol=TCP localport=3008
        Write-Host "Regla de firewall para Frontend (puerto 3008) creada" -ForegroundColor Green
    } catch {
        Write-Host "Error al configurar firewall. Ejecuta este script como Administrador." -ForegroundColor Red
    }
} else {
    Write-Host "Configuracion de firewall omitida." -ForegroundColor Yellow
}

# Resumen
Write-Host ""
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "SERVIDORES INICIADOS EN RED LOCAL" -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "INFORMACION DE ACCESO:" -ForegroundColor White
Write-Host ""
Write-Host "DESDE ESTE EQUIPO:" -ForegroundColor Cyan
Write-Host "   Frontend:  http://localhost:3008" -ForegroundColor White
Write-Host "   Backend:   http://localhost:54112" -ForegroundColor White
Write-Host "   Swagger:   http://localhost:54112/api-docs" -ForegroundColor White
Write-Host ""
Write-Host "DESDE OTROS DISPOSITIVOS EN LA RED:" -ForegroundColor Cyan
Write-Host "   Frontend:  http://$localIP:3008" -ForegroundColor Yellow
Write-Host "   Backend:   http://$localIP:54112" -ForegroundColor Yellow
Write-Host "   Swagger:   http://$localIP:54112/api-docs" -ForegroundColor Yellow
Write-Host ""
Write-Host "CREDENCIALES:" -ForegroundColor White
Write-Host "   Email:    wzuccardi@gmail.com" -ForegroundColor Yellow
Write-Host "   Password: 73102604722" -ForegroundColor Yellow
Write-Host ""
Write-Host "DATOS ESPERADOS:" -ForegroundColor White
Write-Host "   - 46 municipios" -ForegroundColor Gray
Write-Host "   - 10 gestantes" -ForegroundColor Gray
Write-Host "   - 24 controles" -ForegroundColor Gray
Write-Host "   - 19 alertas activas (11 criticas, 4 altas, 2 medias, 2 bajas)" -ForegroundColor Gray
Write-Host ""
Write-Host "NOTA IMPORTANTE:" -ForegroundColor Yellow
Write-Host "   - Asegurate de que tu firewall permita conexiones en los puertos 54112 y 3008" -ForegroundColor Gray
Write-Host "   - Los dispositivos deben estar en la misma red Wi-Fi" -ForegroundColor Gray
Write-Host "   - Si el frontend muestra pantalla en blanco, espera 30-60 segundos" -ForegroundColor Gray
Write-Host ""
Write-Host "Para detener los servidores, cierra las ventanas de PowerShell" -ForegroundColor Red
Write-Host "   o presiona Ctrl+C en cada una." -ForegroundColor Red
Write-Host ""
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host ""

# Abrir navegador automaticamente
Write-Host "Abriendo navegador en http://$localIP:3008..." -ForegroundColor Cyan
Start-Sleep -Seconds 5
Start-Process "http://$localIP:3008"

Write-Host ""
Write-Host "Listo! Los servidores estan corriendo en red local." -ForegroundColor Green
Write-Host "Comparte la URL http://$localIP:3008 con otros dispositivos en tu red." -ForegroundColor Green
Write-Host ""

