# Script para probar el deployment del backend en Vercel
# Verifica que los endpoints estén funcionando correctamente

Write-Host "🚀 Probando deployment del backend en Vercel..." -ForegroundColor Green
Write-Host ""

$baseUrl = "https://madres-digitales-backend.vercel.app"

# Función para hacer peticiones HTTP
function Test-Endpoint {
    param(
        [string]$Url,
        [string]$Description
    )
    
    Write-Host "📡 Probando: $Description" -ForegroundColor Yellow
    Write-Host "   URL: $Url" -ForegroundColor Gray
    
    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 30
        $statusCode = $response.StatusCode
        $content = $response.Content
        
        if ($statusCode -eq 200) {
            Write-Host "   ✅ Status: $statusCode - OK" -ForegroundColor Green
            
            # Intentar parsear JSON
            try {
                $json = $content | ConvertFrom-Json
                if ($json.success -eq $true) {
                    Write-Host "   ✅ Response: success = true" -ForegroundColor Green
                } else {
                    Write-Host "   ⚠️  Response: success = false" -ForegroundColor Yellow
                }
                
                # Mostrar datos específicos según el endpoint
                if ($Url -like "*puerperio/estadisticas*" -and $json.data) {
                    Write-Host "   📊 Gestantes: $($json.data.resumen.total_gestantes_activas)" -ForegroundColor Cyan
                    Write-Host "   🤱 Puerperio: $($json.data.resumen.total_puerperio)" -ForegroundColor Cyan
                    Write-Host "   📈 Total: $($json.data.resumen.total_combinado)" -ForegroundColor Cyan
                }
            } catch {
                Write-Host "   ℹ️  Response: $($content.Substring(0, [Math]::Min(100, $content.Length)))..." -ForegroundColor Gray
            }
        } else {
            Write-Host "   ❌ Status: $statusCode - Error" -ForegroundColor Red
        }
    } catch {
        Write-Host "   ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
}

# Probar endpoints principales
Test-Endpoint "$baseUrl" "Health Check Principal"
Test-Endpoint "$baseUrl/health" "Health Check Específico"
Test-Endpoint "$baseUrl/api/puerperio/estadisticas" "Estadísticas Puerperio (PRINCIPAL)"
Test-Endpoint "$baseUrl/api/puerperio" "Listado Puerperio"

Write-Host "🏁 Pruebas completadas!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Resumen:" -ForegroundColor White
Write-Host "   - Si todos los endpoints responden con status 200, el deployment es exitoso" -ForegroundColor Gray
Write-Host "   - El endpoint principal es: $baseUrl/api/puerperio/estadisticas" -ForegroundColor Gray
Write-Host "   - Este endpoint debe mostrar las estadísticas combinadas para el widget" -ForegroundColor Gray