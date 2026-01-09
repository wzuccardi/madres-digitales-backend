# Script para descargar backup completo de la base de datos
# Descarga TODOS los registros de TODAS las tablas

param([string]$OutputDir = "backups")

Write-Host "🔄 Descargando backup COMPLETO de la base de datos..." -ForegroundColor Green
Write-Host "⚠️  ADVERTENCIA: Este backup incluye TODOS los datos de TODAS las tablas" -ForegroundColor Yellow
Write-Host ""

# Crear directorio si no existe
if (!(Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir | Out-Null
    Write-Host "📁 Directorio '$OutputDir' creado" -ForegroundColor Yellow
}

try {
    $url = "https://madres-digitales-backend.vercel.app/api/backup/completo"
    $timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
    $filename = "backup_completo_$timestamp.json"
    $filepath = Join-Path $OutputDir $filename
    
    Write-Host "📡 Descargando desde: $url" -ForegroundColor Cyan
    Write-Host "⏳ Esto puede tomar varios minutos debido al tamaño de los datos..." -ForegroundColor Yellow
    
    $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 300
    
    if ($response.StatusCode -eq 200) {
        Write-Host "💾 Guardando archivo..." -ForegroundColor Cyan
        $response.Content | Out-File -FilePath $filepath -Encoding UTF8
        
        $backup = $response.Content | ConvertFrom-Json
        
        Write-Host ""
        Write-Host "✅ Backup completo descargado exitosamente!" -ForegroundColor Green
        Write-Host "📁 Archivo: $filepath" -ForegroundColor White
        Write-Host ""
        Write-Host "📊 Información del backup:" -ForegroundColor Yellow
        Write-Host "   Fecha: $($backup.metadata.fecha_backup)" -ForegroundColor Gray
        Write-Host "   Tipo: $($backup.metadata.tipo)" -ForegroundColor Gray
        Write-Host "   Total registros: $($backup.metadata.total_registros)" -ForegroundColor Gray
        Write-Host ""
        Write-Host "📋 Registros por tabla:" -ForegroundColor Yellow
        Write-Host "   Usuarios: $($backup.resumen.usuarios)" -ForegroundColor Gray
        Write-Host "   Gestantes: $($backup.resumen.gestantes)" -ForegroundColor Gray
        Write-Host "   Controles prenatales: $($backup.resumen.control_prenatal)" -ForegroundColor Gray
        Write-Host "   Alertas: $($backup.resumen.alertas)" -ForegroundColor Gray
        Write-Host "   Puerperio: $($backup.resumen.puerperio)" -ForegroundColor Gray
        Write-Host "   Municipios: $($backup.resumen.municipios)" -ForegroundColor Gray
        Write-Host "   IPS: $($backup.resumen.ips)" -ForegroundColor Gray
        Write-Host "   Médicos: $($backup.resumen.medicos)" -ForegroundColor Gray
        
        $fileSize = (Get-Item $filepath).Length
        if ($fileSize -gt 1MB) {
            $fileSizeMB = [math]::Round($fileSize / 1MB, 2)
            Write-Host "   Tamaño: $fileSizeMB MB" -ForegroundColor Cyan
        } else {
            $fileSizeKB = [math]::Round($fileSize / 1KB, 2)
            Write-Host "   Tamaño: $fileSizeKB KB" -ForegroundColor Cyan
        }
        
        Write-Host ""
        Write-Host "🎯 El backup incluye:" -ForegroundColor White
        Write-Host "   • Todos los usuarios del sistema" -ForegroundColor Gray
        Write-Host "   • Todas las gestantes (activas e inactivas)" -ForegroundColor Gray
        Write-Host "   • Todos los controles prenatales" -ForegroundColor Gray
        Write-Host "   • Todas las alertas" -ForegroundColor Gray
        Write-Host "   • Todos los registros de puerperio" -ForegroundColor Gray
        Write-Host "   • Municipios, IPS y médicos" -ForegroundColor Gray
        
    } else {
        Write-Host "❌ Error: Status Code $($response.StatusCode)" -ForegroundColor Red
        Write-Host "   Response: $($response.Content)" -ForegroundColor Gray
    }
    
} catch {
    Write-Host "❌ Error descargando backup completo:" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Gray
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode
        Write-Host "   Status Code: $statusCode" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "🏁 Proceso completado!" -ForegroundColor Green