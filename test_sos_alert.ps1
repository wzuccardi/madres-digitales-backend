# Script para probar el sistema de alertas SOS
# Simula una alerta SOS con ubicación GPS

$apiUrl = "http://localhost:3000/api/sos/alerta"

# Datos de prueba para la alerta SOS
$alertData = @{
    madrina_id = "1"  # Ajustar según tu base de datos
    gestante_id = "1"  # Ajustar según tu base de datos
    tipo_emergencia = "emergencia_obstetrica"
    descripcion = "Prueba de alerta SOS - Dolor abdominal severo"
    sintomas = @("dolor_abdominal", "sangrado", "mareo")
    ubicacion = @{
        latitud = 4.6097
        longitud = -74.0817
        precision = 10.5
    }
    nivel_urgencia = "MAXIMA"
} | ConvertTo-Json -Depth 10

Write-Host "🚨 Enviando alerta SOS de prueba..." -ForegroundColor Yellow
Write-Host ""
Write-Host "URL: $apiUrl" -ForegroundColor Cyan
Write-Host "Datos:" -ForegroundColor Cyan
Write-Host $alertData -ForegroundColor Gray
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri $apiUrl -Method Post -Body $alertData -ContentType "application/json"
    Write-Host "✅ Alerta SOS enviada exitosamente!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Respuesta del servidor:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 10 | Write-Host -ForegroundColor Gray
    Write-Host ""
    Write-Host "🔔 Verifica que aparezca el overlay rojo flasheando en la aplicación" -ForegroundColor Yellow
} catch {
    Write-Host "❌ Error al enviar alerta SOS:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host $_.ErrorDetails.Message -ForegroundColor Red
    }
}
