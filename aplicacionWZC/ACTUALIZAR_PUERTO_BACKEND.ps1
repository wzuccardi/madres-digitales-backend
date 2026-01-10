# Script para actualizar todas las referencias del puerto 3000 a 54112

Write-Host "🔄 ACTUALIZANDO REFERENCIAS DEL PUERTO 3000 A 54112" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# Obtener lista de archivos .ps1 que contienen referencias al puerto 3000
$files = Get-ChildItem -Path "." -Filter "*.ps1" -Recurse | Where-Object {
    (Get-Content $_.FullName | Out-String) -match "localhost:3000|:3000"
}

Write-Host "📋 Archivos encontrados con referencias al puerto 3000:" -ForegroundColor Yellow
$files | ForEach-Object { Write-Host "   $($_.FullName)" -ForegroundColor Gray }

Write-Host ""
Write-Host "🔄 Actualizando archivos..." -ForegroundColor Yellow

$updatedFiles = 0
$totalReplacements = 0

foreach ($file in $files) {
    Write-Host "Procesando: $($file.Name)" -ForegroundColor White
    
    # Leer contenido del archivo
    $content = Get-Content $file.FullName -Raw
    
    # Contar reemplazos antes de hacerlos
    $originalCount = ([regex]::Matches($content, "localhost:3000|:3000")).Count
    
    if ($originalCount -gt 0) {
        # Reemplazar localhost:3000 por localhost:54112
        $content = $content -replace "localhost:3000", "localhost:54112"
        
        # Reemplazar :3000 (cuando no es localhost:3000) por :54112
        $content = $content -replace "(?<!localhost):3000", ":54112"
        
        # Guardar archivo actualizado
        $content | Out-File $file.FullName -Encoding UTF8
        
        Write-Host "   ✅ Actualizado ($originalCount reemplazos)" -ForegroundColor Green
        $updatedFiles++
        $totalReplacements += $originalCount
    } else {
        Write-Host "   ⚠️ No se encontraron referencias para reemplazar" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "📊 RESUMEN DE ACTUALIZACIÓN:" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan
Write-Host "Archivos actualizados: $updatedFiles" -ForegroundColor Green
Write-Host "Total de reemplazos: $totalReplacements" -ForegroundColor Green
Write-Host ""

Write-Host "✅ Todas las referencias al puerto 3000 han sido actualizadas al puerto 54112" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Ahora puedes reiniciar los servidores con el nuevo puerto:" -ForegroundColor Yellow
Write-Host "   Backend: http://localhost:54112" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:3008" -ForegroundColor Cyan
Write-Host "   API Docs: http://localhost:54112/api-docs" -ForegroundColor Cyan
Write-Host ""