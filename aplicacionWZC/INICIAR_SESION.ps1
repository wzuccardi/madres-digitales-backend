# Script para iniciar sesión con el usuario existente y probar la solución

Write-Host "Iniciando sesión con usuario existente y probando solución del error 400..."

# Limpiar pantalla
Clear-Host

# Iniciar sesión con el usuario existente
Write-Host "Iniciando sesión con wzuccardi@gmail.com..."

# Conectar al backend
$connectionString = "postgresql://postgres:postgres@localhost:5432/madresdigitales"
$databaseName = "madresdigitales"

try {
    # Importar el servicio de autenticación
    Import-Module "./aplicacionWZC/madres-digitales-backend/src/services/auth.service.ts" -ArgumentList $connectionString, $databaseName
    
    # Crear el servicio
    $authService = New-Object -TypeName "AuthService" -ArgumentList $connectionString, $databaseName
    
    # Buscar el usuario existente
    $user = $authService.findUserByEmail("wzuccardi@gmail.com")
    
    if ($user) {
        Write-Host "✅ Usuario encontrado: $($user.email) con rol: $($user.rol)" -ForegroundColor Green
        Write-Host "ID: $($user.id)"
        Write-Host ""
        
        # Iniciar sesión
        $loginResult = $authService.login("wzuccardi@gmail.com", "wzuccardi")
        
        if ($loginResult) {
            Write-Host "✅ Sesión iniciada exitosamente" -ForegroundColor Green
            Write-Host "Token: $($loginResult.accessToken)"
            Write-Host ""
            
            # Abrir el navegador automáticamente
            Start-Process "chrome" -ArgumentList "http://localhost:3000/login?token=$($loginResult.accessToken)&email=wzuccardi@gmail.com"
            Write-Host "🌐 Navegador abierto para probar la solución"
            Write-Host ""
            Write-Host "=========================================="
            Write-Host "Instrucciones:"
            Write-Host "1. La aplicación debería abrir automáticamente"
            Write-Host "2. Navega a la sección de contenidos"
            Write-Host "3. Haz clic en 'Nuevo Contenido'"
            Write-Host "4. Selecciona un archivo de video MP4"
            Write-Host "5. Llena los campos requeridos"
            Write-Host "6. Haz clic en 'Crear Contenido'"
            Write-Host "7. Debería funcionar sin error 400"
            Write-Host "=========================================="
            
            # Esperar a que el usuario cierre el navegador
            Write-Host "Presiona cualquier tecla para detener la prueba..."
            $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
            
            # Detener procesos cuando el usuario presione una tecla
            Get-Process | Where-Object { $_.ProcessName -eq "chrome" } | Stop-Process
            Get-Process | Where-Object { $_.ProcessName -eq "powershell" } | Stop-Process
            
            Write-Host "Prueba detenida."
        } else {
            Write-Host "❌ Error al iniciar sesión" -ForegroundColor Red
            Write-Host $Error[0].Exception.Message
        }
    } catch {
        Write-Host "❌ Error conectando al backend" -ForegroundColor Red
        Write-Host $Error[0].Exception.Message
    }

Write-Host ""
Write-Host "=========================================="
Write-Host "Para probar manualmente:"
Write-Host "1. Inicia sesión en http://localhost:3001/api/auth/login"
Write-Host "   Email: wzuccardi@gmail.com"
Write-Host "   Contraseña: wzuccardi"
Write-Host ""
Write-Host "2. Copia el token que se muestra en la respuesta"
Write-Host "3. Abre http://localhost:3000"
Write-Host "4. Pega el token en la consola (localStorage.setItem('auth_token', 'TU_TOKEN'))"
Write-Host "5. Recarga la página"
Write-Host "=========================================="