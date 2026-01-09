# =====================================================
# Script de Instalación Rápida de RLS (PowerShell)
# =====================================================
# Este script ejecuta todos los pasos necesarios para
# implementar Row Level Security en la base de datos

Write-Host "🔐 ==========================================" -ForegroundColor Cyan
Write-Host "🔐 INSTALACIÓN DE ROW LEVEL SECURITY (RLS)" -ForegroundColor Cyan
Write-Host "🔐 ==========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que se proporcionó la URL de la base de datos
if (-not $env:DATABASE_URL) {
    Write-Host "❌ Error: Variable DATABASE_URL no está definida" -ForegroundColor Red
    Write-Host "💡 Uso: `$env:DATABASE_URL='postgresql://user:pass@host:port/db'; .\install_rls.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ DATABASE_URL detectada" -ForegroundColor Green
Write-Host ""

# Función para ejecutar un script SQL
function Execute-SQL {
    param(
        [string]$ScriptName
    )
    
    $ScriptPath = Join-Path -Path ".\scripts" -ChildPath $ScriptName
    
    Write-Host "📄 Ejecutando: $ScriptName" -ForegroundColor Cyan
    
    if (-not (Test-Path $ScriptPath)) {
        Write-Host "❌ Error: No se encontró el archivo $ScriptPath" -ForegroundColor Red
        return $false
    }
    
    try {
        # Ejecutar usando psql (debe estar instalado y en PATH)
        $content = Get-Content $ScriptPath -Raw
        $env:PGPASSWORD = ""  # Extraer password de DATABASE_URL si es necesario
        
        # Alternativa: usar psql directamente
        psql $env:DATABASE_URL -f $ScriptPath
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ $ScriptName ejecutado exitosamente" -ForegroundColor Green
            Write-Host ""
            return $true
        } else {
            Write-Host "❌ Error ejecutando $ScriptName" -ForegroundColor Red
            Write-Host ""
            return $false
        }
    } catch {
        Write-Host "❌ Error: $_" -ForegroundColor Red
        Write-Host ""
        return $false
    }
}

# Paso 1: Habilitar RLS
Write-Host "🔒 PASO 1: Habilitando Row Level Security..." -ForegroundColor Yellow
if (-not (Execute-SQL "01_enable_rls.sql")) {
    Write-Host "❌ Falló el Paso 1. Abortando instalación." -ForegroundColor Red
    exit 1
}

# Paso 2: Crear políticas
Write-Host "📋 PASO 2: Creando políticas de seguridad..." -ForegroundColor Yellow
if (-not (Execute-SQL "02_create_rls_policies.sql")) {
    Write-Host "❌ Falló el Paso 2. Abortando instalación." -ForegroundColor Red
    exit 1
}

# Paso 3: Crear funciones
Write-Host "⚙️ PASO 3: Creando funciones de seguridad..." -ForegroundColor Yellow
if (-not (Execute-SQL "03_create_security_functions.sql")) {
    Write-Host "❌ Falló el Paso 3. Abortando instalación." -ForegroundColor Red
    exit 1
}

# Paso 4: Ejecutar tests (opcional)
Write-Host "🧪 PASO 4: Ejecutando tests de verificación..." -ForegroundColor Yellow
Write-Host "⚠️ Los tests crearán y eliminarán datos de prueba" -ForegroundColor Yellow
$response = Read-Host "¿Desea ejecutar los tests? (s/n)"

if ($response -eq "s" -or $response -eq "S") {
    if (Execute-SQL "04_test_rls_policies.sql") {
        Write-Host "✅ Tests completados exitosamente" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Algunos tests fallaron. Revise los resultados." -ForegroundColor Yellow
    }
} else {
    Write-Host "⏭️ Tests omitidos" -ForegroundColor Gray
}

Write-Host ""
Write-Host "🎉 ==========================================" -ForegroundColor Green
Write-Host "🎉 INSTALACIÓN COMPLETADA" -ForegroundColor Green
Write-Host "🎉 ==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Próximos pasos:" -ForegroundColor Cyan
Write-Host "   1. Reiniciar el servidor backend" -ForegroundColor White
Write-Host "   2. Verificar logs de aplicación" -ForegroundColor White
Write-Host "   3. Probar con diferentes roles de usuario" -ForegroundColor White
Write-Host ""
Write-Host "📚 Documentación: IMPLEMENTACION_RLS.md" -ForegroundColor Cyan
Write-Host ""
