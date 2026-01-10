# Script para reiniciar la aplicación Flutter
Write-Host "🔄 Reiniciando aplicación Flutter..." -ForegroundColor Green

# Cambiar al directorio de Flutter
Set-Location "madres_digitales_flutter_new"

# Limpiar cache
Write-Host "🧹 Limpiando cache..." -ForegroundColor Yellow
flutter clean

# Obtener dependencias
Write-Host "📦 Obteniendo dependencias..." -ForegroundColor Yellow
flutter pub get

# Verificar que no hay errores de compilación
Write-Host "🔍 Verificando código..." -ForegroundColor Yellow
flutter analyze

Write-Host "✅ Aplicación lista para ejecutar!" -ForegroundColor Green
Write-Host "🚀 Para ejecutar la app, usa:" -ForegroundColor Cyan
Write-Host "   flutter run -d web" -ForegroundColor White

# Volver al directorio anterior
Set-Location ".."