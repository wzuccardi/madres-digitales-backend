# Script para remover print() statements de forma segura

$files = @(
    "aplicacionWZC/madres_digitales_flutter_new/lib/config/app_config.dart",
    "aplicacionWZC/madres_digitales_flutter_new/lib/features/auth/presentation/pages/login_page.dart",
    "aplicacionWZC/madres_digitales_flutter_new/lib/features/auth/presentation/pages/register_page.dart",
    "aplicacionWZC/madres_digitales_flutter_new/lib/features/auth/presentation/pages/splash_page.dart",
    "aplicacionWZC/madres_digitales_flutter_new/lib/features/contenido/data/services/file_service.dart",
    "aplicacionWZC/madres_digitales_flutter_new/lib/features/contenido/data/services/web_cache_service.dart",
    "aplicacionWZC/madres_digitales_flutter_new/lib/features/gestante/presentation/pages/gestantes_list_page.dart",
    "aplicacionWZC/madres_digitales_flutter_new/lib/features/gestante/presentation/providers/madrina_session_provider.dart",
    "aplicacionWZC/madres_digitales_flutter_new/lib/features/municipios/presentation/screens/municipios_admin_screen.dart",
    "aplicacionWZC/madres_digitales_flutter_new/lib/features/reportes/presentation/reportes_list_page.dart",
    "aplicacionWZC/madres_digitales_flutter_new/lib/main.dart",
    "aplicacionWZC/madres_digitales_flutter_new/lib/providers/dashboard_provider.dart",
    "aplicacionWZC/madres_digitales_flutter_new/lib/providers/integrated_admin_provider.dart",
    "aplicacionWZC/madres_digitales_flutter_new/lib/screens/contenido_crud_screen.dart",
    "aplicacionWZC/madres_digitales_flutter_new/lib/screens/contenido_screen.dart",
    "aplicacionWZC/madres_digitales_flutter_new/lib/screens/control_form_screen.dart",
    "aplicacionWZC/madres_digitales_flutter_new/lib/screens/control_prenatal_mejorado_screen.dart",
    "aplicacionWZC/madres_digitales_flutter_new/lib/screens/controles_screen.dart",
    "aplicacionWZC/madres_digitales_flutter_new/lib/screens/debug_screen.dart",
    "aplicacionWZC/madres_digitales_flutter_new/lib/screens/forms/ips_form_dialog.dart",
    "aplicacionWZC/madres_digitales_flutter_new/lib/screens/forms/medico_form_dialog.dart",
    "aplicacionWZC/madres_digitales_flutter_new/lib/screens/gestantes_screen.dart",
    "aplicacionWZC/madres_digitales_flutter_new/lib/screens/ips_screen.dart",
    "aplicacionWZC/madres_digitales_flutter_new/lib/screens/medicos_screen.dart",
    "aplicacionWZC/madres_digitales_flutter_new/lib/screens/simple_medico_form.dart",
    "aplicacionWZC/madres_digitales_flutter_new/lib/screens/sos_mejorado_screen.dart",
    "aplicacionWZC/madres_digitales_flutter_new/lib/screens/usuarios_screen.dart",
    "aplicacionWZC/madres_digitales_flutter_new/lib/services/api_service.dart",
    "aplicacionWZC/madres_digitales_flutter_new/lib/services/auth_service.dart",
    "aplicacionWZC/madres_digitales_flutter_new/lib/services/gestante_service.dart",
    "aplicacionWZC/madres_digitales_flutter_new/lib/services/integrated_admin_service.dart",
    "aplicacionWZC/madres_digitales_flutter_new/lib/services/ips_service.dart",
    "aplicacionWZC/madres_digitales_flutter_new/lib/services/medico_service.dart",
    "aplicacionWZC/madres_digitales_flutter_new/lib/services/municipio_service.dart",
    "aplicacionWZC/madres_digitales_flutter_new/lib/services/permission_service.dart",
    "aplicacionWZC/madres_digitales_flutter_new/lib/services/reporte_service.dart",
    "aplicacionWZC/madres_digitales_flutter_new/lib/services/simple_data_service.dart",
    "aplicacionWZC/madres_digitales_flutter_new/lib/services/simple_usuario_service.dart",
    "aplicacionWZC/madres_digitales_flutter_new/lib/services/sos_alarm_service.dart",
    "aplicacionWZC/madres_digitales_flutter_new/lib/services/sos_compatibility_service.dart",
    "aplicacionWZC/madres_digitales_flutter_new/lib/services/web_audio_helper.dart",
    "aplicacionWZC/madres_digitales_flutter_new/lib/widgets/multimedia_player.dart"
)

$count = 0
foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        
        # Remover líneas completas que contienen solo print()
        $lines = $content -split "`n"
        $newLines = @()
        
        foreach ($line in $lines) {
            # Si la línea contiene print( pero no es solo comentario
            if ($line -match 'print\(' -and $line -notmatch '^\s*//') {
                # Remover la línea completa
                continue
            }
            $newLines += $line
        }
        
        $newContent = $newLines -join "`n"
        
        if ($newContent -ne $content) {
            Set-Content $file $newContent -Encoding UTF8
            $count++
            Write-Host "✅ Procesado: $file"
        }
    }
}

Write-Host "`n✅ Total de archivos procesados: $count"

