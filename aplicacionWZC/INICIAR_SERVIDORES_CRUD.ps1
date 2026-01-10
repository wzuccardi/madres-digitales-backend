# Script para detener procesos y levantar servidores para el CRUD de IPS y Médicos
Write-Host "🔄 Deteniendo procesos existentes..." -ForegroundColor Yellow

# Detener procesos de Node.js
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process -Name "node.exe" -ErrorAction SilentlyContinue | Stop-Process -Force

# Detener procesos de Flutter/Dart
Get-Process -Name "dart" -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process -Name "flutter" -ErrorAction SilentlyContinue | Stop-Process -Force

# Esperar un momento para que los procesos se detengan completamente
Start-Sleep -Seconds 3

Write-Host "✅ Procesos detenidos" -ForegroundColor Green
Write-Host "🚀 Iniciando servidor backend..." -ForegroundColor Yellow

# Iniciar servidor backend en una nueva ventana
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\madres-digitales-backend'; npm run dev"

# Esperar a que el servidor backend inicie
Write-Host "⏳ Esperando a que el servidor backend inicie..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host "🚀 Iniciando aplicación frontend..." -ForegroundColor Yellow

# Iniciar aplicación Flutter en una nueva ventana
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\madres_digitales_flutter_new'; flutter run -d chrome --web-port 3008"

Write-Host "✅ Servidores iniciados" -ForegroundColor Green
Write-Host "🌐 Backend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🌐 Frontend: http://localhost:3008" -ForegroundColor Cyan
Write-Host "📚 API Docs: http://localhost:3000/api-docs" -ForegroundColor Cyan
Write-Host "" -ForegroundColor White
Write-Host "🔍 Para probar el CRUD de IPS y Médicos:" -ForegroundColor Magenta
Write-Host "1. Abre http://localhost:3008 en tu navegador" -ForegroundColor White
Write-Host "2. Inicia sesión con un usuario administrador" -ForegroundColor White
Write-Host "3. Navega a las pantallas de IPS y Médicos" -ForegroundColor White
Write-Host "4. Prueba crear, editar y eliminar registros" -ForegroundColor White