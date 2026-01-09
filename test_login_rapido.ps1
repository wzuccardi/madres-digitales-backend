# Test rápido de login
$body = @{
    email = "admin@madresdigitales.com"
    password = "admin123"
} | ConvertTo-Json

Write-Host "🔍 Probando login..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "https://madres-digitales-backend.vercel.app/api/auth/login" -Method POST -Body $body -ContentType "application/json"
    Write-Host "✅ LOGIN EXITOSO!" -ForegroundColor Green
    Write-Host "Token recibido: $($response.data.token.Substring(0,20))..." -ForegroundColor Green
} catch {
    Write-Host "❌ LOGIN FALLÓ" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    
    # Probar health check
    try {
        $health = Invoke-RestMethod -Uri "https://madres-digitales-backend.vercel.app/health" -Method GET
        Write-Host "✅ Backend está vivo (health check OK)" -ForegroundColor Yellow
    } catch {
        Write-Host "❌ Backend no responde" -ForegroundColor Red
    }
}