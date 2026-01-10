# Script para agregar comentarios a empty catch blocks

$files = @(
    "aplicacionWZC/madres_digitales_flutter_new/lib/features/auth/presentation/pages/login_page.dart",
    "aplicacionWZC/madres_digitales_flutter_new/lib/features/auth/presentation/pages/splash_page.dart",
    "aplicacionWZC/madres_digitales_flutter_new/lib/features/municipios/presentation/screens/municipios_admin_screen.dart",
    "aplicacionWZC/madres_digitales_flutter_new/lib/screens/forms/medico_form_dialog.dart",
    "aplicacionWZC/madres_digitales_flutter_new/lib/screens/sos_mejorado_screen.dart",
    "aplicacionWZC/madres_digitales_flutter_new/lib/services/api_service.dart",
    "aplicacionWZC/madres_digitales_flutter_new/lib/services/auth_service.dart",
    "aplicacionWZC/madres_digitales_flutter_new/lib/services/sos_alarm_service.dart",
    "aplicacionWZC/madres_digitales_flutter_new/lib/services/web_audio_helper.dart",
    "aplicacionWZC/madres_digitales_flutter_new/lib/widgets/multimedia_player.dart"
)

$count = 0
foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        
        # Reemplazar } catch (e) { } con } catch (e) { // Error ignorado }
        $newContent = $content -replace '} catch \((\w+)\) \{\s*\}', '} catch ($1) { // Error ignorado }'
        
        if ($newContent -ne $content) {
            Set-Content $file $newContent -Encoding UTF8
            $count++
            Write-Host "✅ Procesado: $file"
        }
    } else {
        Write-Host "⚠️ No encontrado: $file"
    }
}

Write-Host "`n✅ Total de archivos procesados: $count"

