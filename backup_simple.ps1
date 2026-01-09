# Script simple para descargar backup
param([string]$OutputDir = "backups")

Write-Host "Descargando backup de la base de datos..." -ForegroundColor Green

# Crear directorio si no existe
if (!(Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir | Out-Null
    Write-Host "Directorio '$OutputDir' creado" -ForegroundColor Yellow
}

try {
    $url = "https://madres-digitales-backend.vercel.app/api/backup/simple"
    $timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
    $filename = "backup_$timestamp.json"
    $filepath = Join-Path $OutputDir $filename
    
    Write-Host "Descargando desde: $url" -ForegroundColor Cyan
    
    $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 60
    
    if ($response.StatusCode -eq 200) {
        $response.Content | Out-File -FilePath $filepath -Encoding UTF8
        
        $backup = $response.Content | ConvertFrom-Json
        
        Write-Host ""
        Write-Host "Backup descargado exitosamente!" -ForegroundColor Green
        Write-Host "Archivo: $filepath" -ForegroundColor White
        Write-Host ""
        Write-Host "Estadisticas:" -ForegroundColor Yellow
        Write-Host "  Gestantes activas: $($backup.datos.gestantes_activas)" -ForegroundColor Gray
        Write-Host "  Registros puerperio: $($backup.datos.puerperio_total)" -ForegroundColor Gray
        Write-Host "  Total combinado: $($backup.datos.total_combinado)" -ForegroundColor Gray
        
        $fileSize = (Get-Item $filepath).Length
        $fileSizeKB = [math]::Round($fileSize / 1KB, 2)
        Write-Host "  Tamaño: $fileSizeKB KB" -ForegroundColor Cyan
        
    } else {
        Write-Host "Error: Status Code $($response.StatusCode)" -ForegroundColor Red
    }
    
} catch {
    Write-Host "Error descargando backup: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Proceso completado!" -ForegroundColor Green