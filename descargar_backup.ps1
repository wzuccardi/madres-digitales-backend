# Script para descargar backup de la base de datos
# Descarga un archivo JSON completo con todos los datos

param(
    [string]$Tipo = "simple",  # "simple" o "completo"
    [string]$OutputDir = "backups"
)

Write-Host "🔄 Descargando backup de la base de datos..." -ForegroundColor Green
Write-Host ""

# Crear directorio de backups si no existe
if (!(Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir | Out-Null
    Write-Host "📁 Directorio '$OutputDir' creado" -ForegroundColor Yellow
}

# Configurar URL según el tipo
$baseUrl = "https://madres-digitales-backend.vercel.app"
if ($Tipo -eq "completo") {
    $url = "$baseUrl/api/admin/backup/download"
    $descripcion = "Backup completo (requiere autenticación)"
} else {
    $url = "$baseUrl/api/backup/simple"
    $descripcion = "Backup simplificado"
}

Write-Host "📡 Descargando: $descripcion" -ForegroundColor Cyan
Write-Host "   URL: $url" -ForegroundColor Gray

try {
    # Generar nombre de archivo con timestamp
    $timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
    $filename = "madres_digitales_backup_${Tipo}_${timestamp}.json"
    $filepath = Join-Path $OutputDir $filename
    
    # Descargar el backup
    $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 60
    
    if ($response.StatusCode -eq 200) {
        # Guardar el archivo
        $response.Content | Out-File -FilePath $filepath -Encoding UTF8
        
        # Parsear JSON para mostrar resumen
        $backup = $response.Content | ConvertFrom-Json
        
        Write-Host ""
        Write-Host "✅ Backup descargado exitosamente!" -ForegroundColor Green
        Write-Host "📁 Archivo: $filepath" -ForegroundColor White
        Write-Host "📊 Información del backup:" -ForegroundColor Yellow
        
        if ($backup.metadata) {
            Write-Host "   Fecha: $($backup.metadata.fecha_backup)" -ForegroundColor Gray
            Write-Host "   Total registros: $($backup.metadata.total_registros)" -ForegroundColor Gray
            Write-Host ""
            Write-Host "📋 Registros por tabla:" -ForegroundColor Yellow
            $backup.resumen.PSObject.Properties | ForEach-Object {
                Write-Host "   $($_.Name): $($_.Value)" -ForegroundColor Gray
            }
        } elseif ($backup.resumen) {
            Write-Host "   Fecha: $($backup.fecha)" -ForegroundColor Gray
            Write-Host "   Total registros: $($backup.resumen.total)" -ForegroundColor Gray
            Write-Host ""
            Write-Host "📋 Registros:" -ForegroundColor Yellow
            Write-Host "   Gestantes activas: $($backup.resumen.gestantes_activas)" -ForegroundColor Gray
            Write-Host "   Registros puerperio: $($backup.resumen.registros_puerperio)" -ForegroundColor Gray
            Write-Host "   Usuarios activos: $($backup.resumen.usuarios_activos)" -ForegroundColor Gray
        }
        
        # Mostrar tamaño del archivo
        $fileSize = (Get-Item $filepath).Length
        $fileSizeMB = [math]::Round($fileSize / 1MB, 2)
        Write-Host ""
        Write-Host "💾 Tamaño del archivo: $fileSizeMB MB" -ForegroundColor Cyan
        
    } else {
        Write-Host "❌ Error: Status Code $($response.StatusCode)" -ForegroundColor Red
        Write-Host "   Response: $($response.Content)" -ForegroundColor Gray
    }
    
} catch {
    Write-Host "❌ Error descargando backup:" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Gray
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode
        Write-Host "   Status Code: $statusCode" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "🏁 Proceso completado!" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Uso:" -ForegroundColor White
Write-Host "   .\descargar_backup.ps1                    # Backup simplificado" -ForegroundColor Gray
Write-Host "   .\descargar_backup.ps1 -Tipo completo     # Backup completo (requiere auth)" -ForegroundColor Gray
Write-Host "   .\descargar_backup.ps1 -OutputDir ./mis_backups  # Directorio personalizado" -ForegroundColor Gray