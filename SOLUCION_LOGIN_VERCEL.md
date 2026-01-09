# 🔧 Solución: Problema de Login en Vercel

## 🚨 Problema Identificado
La aplicación está funcionando pero el login falla con "Error interno del servidor".

## 🔍 Diagnóstico
- ✅ Backend responde (health check OK)
- ❌ Login endpoint falla con error 500
- 🔍 Probable causa: Variables de entorno o conexión a BD

## 🛠️ Soluciones Inmediatas

### 1. Verificar Variables de Entorno en Vercel

Ve a tu proyecto en Vercel Dashboard:
```
https://vercel.com/dashboard
→ Seleccionar proyecto "madres-digitales-backend"
→ Settings → Environment Variables
```

**Variables Requeridas:**
```env
DATABASE_URL=postgres://ff07eebc333c5499909e4b9766469e0b08d9c9e62beb8a9e5f426f3c793632a1:sk_fSmVWDgDBhkj8E1xooYPd@db.prisma.io:5432/postgres?sslmode=require

JWT_SECRET=M4dr3sD1g1t4l3sS3cur3JWTk3y2025R4nd0m32ch4rs

JWT_REFRESH_SECRET=M4dr3sD1g1t4l3sS3cur3R3fr3shk3y2025R4nd0m32ch4rs

NODE_ENV=production

CORS_ORIGINS=https://madres-digitales-frontend.vercel.app
```

### 2. Verificar Conexión a Base de Datos

**Problema Común**: La conexión a Prisma.io puede estar fallando.

**Solución A**: Verificar que la URL de BD sea correcta
**Solución B**: Regenerar la conexión en Prisma.io

### 3. Verificar Logs en Vercel

```
1. Ir a Vercel Dashboard
2. Proyecto → Functions → View Function Logs
3. Buscar errores específicos del login
```

### 4. Probar con Usuario Existente

Según los datos encontrados, prueba con:
```
Email: admin@madresdigitales.com
Password: admin123
```

O:
```
Email: wzuccardi@gmail.com  
Password: 73102604722
```

### 5. Redeploy Forzado

Si las variables están bien, hacer redeploy:
```
1. Vercel Dashboard → Deployments
2. Click en el último deployment
3. Click "Redeploy"
```

## 🔧 Solución Técnica Detallada

### Verificar Estructura de Tabla `usuarios`

El código busca en `prisma.usuarios` pero podría estar buscando en tabla incorrecta:

```javascript
// En api/index.js línea 28
const user = await prisma.usuarios.findUnique({
  where: { email }
});
```

**Posible problema**: La tabla podría llamarse diferente en producción.

### Verificar Hash de Contraseñas

El código maneja tanto bcrypt como SHA256:

```javascript
// Líneas 40-46 en api/index.js
const validPassword = await bcrypt.compare(password, user.password_hash);
```

**Verificar**: Que las contraseñas estén hasheadas con bcrypt.

## 🚀 Pasos de Acción Inmediata

### Paso 1: Verificar Variables de Entorno
```
1. Ir a https://vercel.com/dashboard
2. Seleccionar proyecto backend
3. Settings → Environment Variables
4. Verificar que todas las variables estén presentes
5. Si faltan, agregarlas
6. Redeploy
```

### Paso 2: Verificar Logs
```
1. Deployments → [último deployment]
2. View Function Logs
3. Buscar errores específicos
4. Anotar el error exacto
```

### Paso 3: Probar Endpoint Directo
```powershell
# Probar con PowerShell
$body = @{
    email = "admin@madresdigitales.com"
    password = "admin123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://madres-digitales-backend.vercel.app/api/auth/login" -Method POST -Body $body -ContentType "application/json"
```

### Paso 4: Verificar Base de Datos
```
1. Conectar a Prisma.io dashboard
2. Verificar que la tabla usuarios existe
3. Verificar que hay usuarios con esos emails
4. Verificar estructura de password_hash
```

## 🔍 Debug Adicional

### Agregar Logs Temporales

Si tienes acceso al código, agregar logs en la función login:

```javascript
console.log('🔍 Login attempt:', { email, password: '***' });
console.log('🔍 User found:', user ? 'YES' : 'NO');
console.log('🔍 User active:', user?.activo);
console.log('🔍 Password check:', validPassword);
```

### Verificar CORS

El error podría ser CORS. Verificar que el frontend esté en la lista de orígenes permitidos.

## 📞 Próximos Pasos

1. **Inmediato**: Verificar variables de entorno en Vercel
2. **Si persiste**: Revisar logs específicos del error
3. **Si es BD**: Verificar conexión a Prisma.io
4. **Si es código**: Hacer debug con logs adicionales

## 🆘 Contacto de Emergencia

Si el problema persiste:
- Revisar logs detallados en Vercel
- Verificar que la base de datos esté accesible
- Considerar rollback a versión anterior que funcionaba

---

**Fecha**: 28 de Diciembre, 2024  
**Estado**: 🔧 En Diagnóstico