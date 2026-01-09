# Script para configurar el Firewall de Windows
# EJECUTAR COMO ADMINISTRADOR

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "CONFIGURANDO FIREWALL - MADRES DIGITALES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si se está ejecutando como administrador
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "ERROR: Este script debe ejecutarse como ADMINISTRADOR" -ForegroundColor Red
    Write-Host ""
    Write-Host "Pasos para ejecutar como Administrador:" -ForegroundColor Yellow
    Write-Host "1. Haz clic derecho en el icono de PowerShell" -ForegroundColor Yellow
    Write-Host "2. Selecciona 'Ejecutar como administrador'" -ForegroundColor Yellow
    Write-Host "3. Navega a: cd C:\Madrinas\aplicacionWZC" -ForegroundColor Yellow
    Write-Host "4. Ejecuta: .\CONFIGURAR_FIREWALL.ps1" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Presiona Enter para salir"
    exit 1
}

Write-Host "Eliminando reglas antiguas (si existen)..." -ForegroundColor Yellow
netsh advfirewall firewall delete rule name="Madres Digitales Backend" 2>$null
netsh advfirewall firewall delete rule name="Madres Digitales Frontend" 2>$null

Write-Host ""
Write-Host "Creando regla para Backend (Puerto 3000)..." -ForegroundColor Yellow
$result1 = netsh advfirewall firewall add rule name="Madres Digitales Backend" dir=in action=allow protocol=TCP localport=3000

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Regla para Backend creada exitosamente" -ForegroundColor Green
} else {
    Write-Host "✗ Error al crear regla para Backend" -ForegroundColor Red
}

Write-Host ""
Write-Host "Creando regla para Frontend (Puerto 3008)..." -ForegroundColor Yellow
$result2 = netsh advfirewall firewall add rule name="Madres Digitales Frontend" dir=in action=allow protocol=TCP localport=3008

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Regla para Frontend creada exitosamente" -ForegroundColor Green
} else {
    Write-Host "✗ Error al crear regla para Frontend" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "CONFIGURACIÓN COMPLETADA" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Reglas de firewall creadas:" -ForegroundColor Green
Write-Host "  ✓ Puerto 3000 (Backend) - ABIERTO" -ForegroundColor Green
Write-Host "  ✓ Puerto 3008 (Frontend) - ABIERTO" -ForegroundColor Green
Write-Host ""
Write-Host "Ahora puedes acceder desde otros dispositivos:" -ForegroundColor Yellow
Write-Host "  http://192.168.1.60:3008" -ForegroundColor Cyan
Write-Host ""
Write-Host "Credenciales:" -ForegroundColor Yellow
Write-Host "  Email:    wzuccardi@gmail.com" -ForegroundColor White
Write-Host "  Password: 73102604722" -ForegroundColor White
Write-Host ""

Read-Host "Presiona Enter para salir"

