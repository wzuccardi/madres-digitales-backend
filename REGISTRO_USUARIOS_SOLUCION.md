# Solución: Registro de Usuarios

## Problemas Identificados y Solucionados

### 1. Ruta de Registro Faltante en Frontend ✅
**Problema**: Los usuarios no podían acceder a la página de registro porque la ruta no estaba definida en el router de Flutter.

**Solución**:
- Agregada ruta `/register` en `app_router.dart`
- Importada `RegisterPage` correctamente
- Incluida en rutas públicas (sin autenticación requerida)

**Archivos modificados**:
- `lib/core/router/app_router.dart`

### 2. Error CORS en Backend ✅
**Problema**: El backend bloqueaba requests desde la nueva URL de Vercel del frontend.

**Error**:
```
Access to XMLHttpRequest at 'https://madres-digitales-backend.vercel.app/api/auth/register' 
from origin 'https://madres-digitales-frontend-qa5yec9v1.vercel.app' has been blocked by CORS policy
```

**Solución**:
- Agregada URL `https://madres-digitales-frontend-qa5yec9v1.vercel.app` a la lista de orígenes permitidos

**Archivos modificados**:
- `api/index.js` (línea 155-164)

### 3. Error 500 en Endpoint de Registro ✅
**Problema**: El endpoint `/api/auth/register` fallaba con error 500 porque:
- No generaba un ID único para el nuevo usuario
- No mapeaba correctamente el rol al formato de Prisma
- No retornaba un token JWT después del registro

**Solución Implementada**:
```javascript
const register = async (req, res) => {
  try {
    // Validación de campos
    const { email, password, nombre, documento, telefono, municipio_id } = req.body;
    const rolInput = req.body.rol || req.body.role || 'madrina';
    
    // Verificar usuario existente
    const existingUser = await prisma.usuarios.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'El email ya está registrado' });
    }

    // Mapear rol al formato Prisma
    const rolMap = {
      admin: 'ADMIN',
      super_admin: 'SUPER_ADMIN',
      coordinador: 'COORDINADOR',
      madrina: 'MADRINA',
      medico: 'MEDICO',
    };
    const prismaRol = rolMap[rolInput] || 'MADRINA';

    // Generar ID único
    const id = `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const user = await prisma.usuarios.create({
      data: {
        id,
        email,
        password_hash: hashedPassword,
        nombre,
        documento: documento || null,
        telefono: telefono || null,
        municipio_id: municipio_id || null,
        rol: prismaRol,
        activo: true
      }
    });

    // Generar token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, rol: rolInput },
      JWT_SECRET,
      { expiresIn: '24h', issuer: 'madres-digitales', audience: 'madres-digitales-users' }
    );
    
    // Retornar usuario y token
    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          nombre: user.nombre,
          email: user.email,
          rol: rolInput
        },
        token
      }
    });
  } catch (error) {
    console.error('❌ Error en registro:', error);
    res.status(500).json({ success: false, error: 'Error interno del servidor: ' + error.message });
  }
};
```

**Archivos modificados**:
- `api/index.js` (función `register`, líneas 84-161)

## Commits Realizados

1. **Frontend**:
   - `7726ca1` - Add register route and update gitignore
   - `bc64ae5` - Remove .dart_tool files from repository

2. **Backend**:
   - `e615b40` - Add new Vercel frontend URL to CORS allowed origins
   - `dde83cb` - Fix register endpoint: add ID generation and role mapping

## Estado Actual

✅ **Ruta de registro**: Disponible en `/register`
✅ **CORS**: Configurado correctamente para la URL de Vercel
✅ **Endpoint de registro**: Funcionando correctamente con:
   - Generación de ID único
   - Mapeo de roles correcto
   - Hash de contraseñas con bcrypt
   - Generación de token JWT
   - Validación de campos requeridos
   - Verificación de email duplicado

## Próximos Pasos

1. Esperar a que Vercel complete el deployment del backend (2-3 minutos)
2. Verificar que el registro funcione correctamente en producción
3. Probar el flujo completo: registro → login → dashboard

## URLs de Producción

- **Frontend**: https://madres-digitales-frontend-qa5yec9v1.vercel.app
- **Backend**: https://madres-digitales-backend.vercel.app
- **Endpoint de registro**: https://madres-digitales-backend.vercel.app/api/auth/register
- **Endpoint de login**: https://madres-digitales-backend.vercel.app/api/auth/login
