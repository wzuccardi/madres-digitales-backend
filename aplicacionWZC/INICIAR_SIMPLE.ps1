# Script simple para iniciar servidores

Write-Host "=== INICIANDO BACKEND ===" -ForegroundColor Cyan
cd madres-digitales-backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"
cd ..

Write-Host "Esperando 15 segundos para que el backend inicie..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

Write-Host "`n=== INICIANDO FRONTEND ===" -ForegroundColor Cyan
cd madres_digitales_flutter_new
Start-Process powershell -ArgumentList "-NoExit", "-Command", "flutter run -d chrome --web-port 3008"
cd ..

Write-Host "`n=== SERVIDORES INICIADOS ===" -ForegroundColor Green
Write-Host "Backend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3008" -ForegroundColor Cyan
Write-Host "`nCredenciales:" -ForegroundColor Yellow
Write-Host "  Email: wzuccardi@gmail.com"
Write-Host "  Password: 73102604722"
Write-Host "`nEspera 60-90 segundos para que Flutter compile..." -ForegroundColor Yellow

