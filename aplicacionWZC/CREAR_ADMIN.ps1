# Script para crear usuario administrador

Write-Host "Creando usuario administrador para probar la solución..."

# Importar el servicio de autenticación
Import-Module "./aplicacionWZC/madres-digitales-backend/src/services/auth.service.ts"

# Conectar a la base de datos
$connectionString = "postgresql://postgres:postgres@localhost:5432/madresdigitales"
$databaseName = "madresdigitales"

try {
    # Crear el servicio de autenticación
    $authService = New-Object -TypeName "AuthService" -ArgumentList $connectionString, $databaseName
    
    # Verificar si ya existe un usuario super_admin
    $existingAdmin = $authService.findUserByEmail("admin@madresdigitales.com")
    
    if ($existingAdmin) {
        Write-Host "⚠️  Ya existe un usuario administrador"
        Write-Host "Email: admin@madresdigitales.com"
        Write-Host "Puedes usar una de estas contraseñas:"
        Write-Host "1. admin123 (simple)"
        Write-Host "2. Admin@2024 (segura)"
        Write-Host ""
        Write-Host "Si no recuerdas la contraseña, puedes resetearla con:"
        Write-Host "node -e `"require('path')('./aplicacionWZC/madres-digitales-backend/src/services/auth.service.ts')` -e `"require('dotenv').config()" -e `"const authService = new AuthService(); authService.resetPassword('admin@madresdigitales.com', 'NUEVA_CONTRASEÑA_AQUI')"`"
    } else {
        # Crear nuevo usuario super_admin
        $newPassword = "Admin@2024"
        $hashedPassword = ConvertTo-SecureString -AsPlainText $newPassword -Force
        
        $newUser = @{
            email = "admin@madresdigitales.com"
            password_hash = $hashedPassword
            nombre = "Administrador del Sistema"
            rol = "super_admin"
            activo = $true
            fecha_creacion = Get-Date
            fecha_actualizacion = Get-Date
        }
        
        $createdUser = $authService.register($newUser)
        
        if ($createdUser) {
            Write-Host "✅ Usuario administrador creado exitosamente" -ForegroundColor Green
            Write-Host "Email: admin@madresdigitales.com"
            Write-Host "Contraseña: $newPassword"
            Write-Host "Rol: super_admin"
            Write-Host ""
            Write-Host "🔐 Ahora puedes iniciar sesión en:"
            Write-Host "1. http://localhost:3001/api/auth/login"
            Write-Host "2. O usa las credenciales en la app Flutter"
        } else {
            Write-Host "❌ Error creando usuario administrador" -ForegroundColor Red
            Write-Host $Error[0].Exception.Message
        }
    }
} catch {
    Write-Host "❌ Error conectando a la base de datos" -ForegroundColor Red
    Write-Host $Error[0].Exception.Message
}

Write-Host ""
Write-Host "=========================================="
Write-Host "Usuario administrador creado exitosamente"
Write-Host "Ahora puedes:"
Write-Host "1. Iniciar sesión en http://localhost:3001/api/auth/login"
Write-Host "2. Usar las credenciales en la app Flutter"
Write-Host "3. Probar la funcionalidad de guardar videos"
Write-Host "=========================================="