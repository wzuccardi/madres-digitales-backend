# 💡 Ejemplos Prácticos de Uso de RLS

## 🎯 Escenarios Reales

### Escenario 1: Madrina consulta sus gestantes

#### Antes de RLS (Inseguro)
```typescript
// ❌ PROBLEMA: Retorna TODAS las gestantes
const gestantes = await prisma.gestantes.findMany();
// Resultado: 150 gestantes (incluyendo de otras madrinas)
```

#### Después de RLS (Seguro)
```typescript
// ✅ SOLUCIÓN: RLS filtra automáticamente
const gestantes = await prisma.gestantes.findMany();
// Resultado: 15 gestantes (solo las asignadas a esta madrina)
```

**No se requiere cambio de código** - RLS filtra automáticamente a nivel de base de datos.

---

### Escenario 2: Admin consulta todas las gestantes

#### Con RLS Activo
```typescript
// ✅ Admin ve TODAS las gestantes
const gestantes = await prisma.gestantes.findMany();
// Resultado: 150 gestantes (todas)
```

**RLS detecta el rol de admin** y permite acceso completo.

---

### Escenario 3: Madrina intenta actualizar gestante de otra madrina

#### Antes de RLS (Inseguro)
```typescript
// ❌ PROBLEMA: Puede actualizar cualquier gestante
await prisma.gestantes.update({
  where: { id: 'gestante_de_otra_madrina' },
  data: { telefono: '3001234567' }
});
// Resultado: Actualización exitosa (INSEGURO)
```

#### Después de RLS (Seguro)
```typescript
// ✅ SOLUCIÓN: RLS bloquea la actualización
await prisma.gestantes.update({
  where: { id: 'gestante_de_otra_madrina' },
  data: { telefono: '3001234567' }
});
// Resultado: 0 filas afectadas (bloqueado por RLS)
```

---

### Escenario 4: Crear control prenatal

#### Madrina crea control de su gestante
```typescript
// ✅ Permitido: La gestante está asignada a esta madrina
await prisma.control_prenatal.create({
  data: {
    gestante_id: 'gestante_de_esta_madrina',
    fecha_control: new Date(),
    peso: 65.5,
    presion_sistolica: 120,
    presion_diastolica: 80
  }
});
// Resultado: Control creado exitosamente
```

#### Madrina intenta crear control de gestante de otra madrina
```typescript
// ❌ Bloqueado: La gestante NO está asignada a esta madrina
await prisma.control_prenatal.create({
  data: {
    gestante_id: 'gestante_de_otra_madrina',
    fecha_control: new Date(),
    peso: 65.5
  }
});
// Resultado: Error - Violación de política RLS
```

---

## 🔧 Uso del Middleware

### Automático (Recomendado)

El middleware se aplica automáticamente en todas las rutas `/api`:

```typescript
// src/app.ts
app.use('/api', generalLimiter, rlsCombinedMiddleware, routes);
```

**No necesitas hacer nada más** - el contexto se establece automáticamente.

### Manual (Casos Especiales)

Para operaciones fuera del flujo request/response:

```typescript
import { setSecurityContext, clearSecurityContext } from './middlewares/rls.middleware';

// Establecer contexto manualmente
await setSecurityContext('madrina_123', 'MADRINA');

// Realizar operaciones
const gestantes = await prisma.gestantes.findMany();

// Limpiar contexto
await clearSecurityContext();
```

---

## 📊 Ejemplos de Consultas

### Ejemplo 1: Contar gestantes visibles

```typescript
import { getSecurityContext, canViewAllData } from './middlewares/rls.middleware';

// Obtener contexto actual
const context = await getSecurityContext();
console.log('Usuario:', context.user_id);
console.log('Rol:', context.user_rol);

// Verificar permisos
const canViewAll = await canViewAllData();
if (canViewAll) {
  console.log('✅ Usuario puede ver todos los datos');
} else {
  console.log('⚠️ Usuario tiene acceso limitado');
}

// Contar gestantes (respeta RLS)
const count = await prisma.gestantes.count();
console.log(`Total gestantes visibles: ${count}`);
```

### Ejemplo 2: Verificar acceso a gestante específica

```typescript
import { canAccessGestante } from './middlewares/rls.middleware';

const gestanteId = 'gest_123';

// Verificar si el usuario actual puede acceder
const canAccess = await canAccessGestante(gestanteId);

if (canAccess) {
  // Obtener datos de la gestante
  const gestante = await prisma.gestantes.findUnique({
    where: { id: gestanteId }
  });
  console.log('✅ Acceso permitido:', gestante);
} else {
  console.log('❌ Acceso denegado');
}
```

### Ejemplo 3: Filtrado combinado con RLS

```typescript
// RLS + filtros adicionales
const gestantesActivas = await prisma.gestantes.findMany({
  where: {
    activa: true,  // Filtro adicional
    // madrina_id se filtra automáticamente por RLS
  },
  include: {
    municipio: true,
    ips_asignada: true
  },
  orderBy: {
    fecha_creacion: 'desc'
  }
});

console.log(`Gestantes activas visibles: ${gestantesActivas.length}`);
```

---

## 🧪 Testing Manual

### Test 1: Login como Admin

```bash
# 1. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "tu_password"
  }'

# Respuesta:
# {
#   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "user": {
#     "id": "admin_001",
#     "rol": "ADMIN"
#   }
# }

# 2. Obtener gestantes (debe ver TODAS)
curl -X GET http://localhost:3000/api/gestantes \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Respuesta esperada: Array con TODAS las gestantes
```

### Test 2: Login como Madrina

```bash
# 1. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "madrina@example.com",
    "password": "tu_password"
  }'

# Respuesta:
# {
#   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "user": {
#     "id": "madrina_123",
#     "rol": "MADRINA"
#   }
# }

# 2. Obtener gestantes (debe ver SOLO las suyas)
curl -X GET http://localhost:3000/api/gestantes \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Respuesta esperada: Array con SOLO gestantes asignadas a esta madrina
```

### Test 3: Intentar acceso no autorizado

```bash
# Como madrina, intentar obtener gestante de otra madrina
curl -X GET http://localhost:3000/api/gestantes/gestante_de_otra_madrina \
  -H "Authorization: Bearer TOKEN_DE_MADRINA"

# Respuesta esperada: 404 Not Found (RLS bloquea el acceso)
```

---

## 📝 Logs Esperados

### Logs Exitosos

```
🔐 RLS Middleware: Estableciendo contexto de seguridad
  userId: "madrina_123"
  userRol: "MADRINA"
  path: "/api/gestantes"
  method: "GET"

✅ RLS Middleware: Contexto establecido exitosamente
  userId: "madrina_123"
  userRol: "MADRINA"

🔍 Controller: Searching gestantes with query: {}
🔍 DEBUG - Usuario autenticado: { id: 'madrina_123', rol: 'MADRINA' }
🔍 DEBUG - Aplicando filtro de madrina: { madrina_id: 'madrina_123' }

✅ Controller: Returning 15 gestantes

🧹 RLS Cleanup: Contexto limpiado exitosamente
  userId: "madrina_123"
  path: "/api/gestantes"
```

### Logs de Error (Esperados)

```
⚠️ RLS Middleware: Usuario no autenticado o sin rol
  path: "/api/gestantes"
  method: "GET"
  hasUser: false
```

---

## 🔍 Debugging

### Ver contexto actual en PostgreSQL

```sql
-- Ejecutar durante una sesión activa
SELECT * FROM public.get_app_context();

-- Resultado esperado:
-- user_id      | user_rol
-- -------------|----------
-- madrina_123  | MADRINA
```

### Ver gestantes visibles para el usuario actual

```sql
-- Establecer contexto
SELECT public.set_app_context('madrina_123', 'MADRINA');

-- Ver gestantes visibles
SELECT * FROM public.get_visible_gestantes();

-- Contar gestantes visibles
SELECT public.count_visible_gestantes();

-- Limpiar contexto
SELECT public.clear_app_context();
```

### Verificar políticas activas

```sql
-- Ver todas las políticas de gestantes
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'gestantes';
```

---

## 🎓 Mejores Prácticas

### ✅ DO (Hacer)

1. **Confiar en RLS** - No duplicar lógica de filtrado en código
2. **Usar el middleware** - Dejar que establezca el contexto automáticamente
3. **Verificar logs** - Monitorear que el contexto se establece correctamente
4. **Probar con diferentes roles** - Verificar que cada rol ve lo correcto

### ❌ DON'T (No Hacer)

1. **No saltarse el middleware** - No hacer consultas directas sin contexto
2. **No hardcodear filtros** - RLS ya filtra automáticamente
3. **No usar el rol postgres** - Usar roles de aplicación específicos
4. **No olvidar limpiar contexto** - El middleware lo hace automáticamente

---

## 🚀 Casos de Uso Avanzados

### Caso 1: Operaciones en lote

```typescript
// RLS se aplica a cada operación individual
const results = await Promise.all([
  prisma.gestantes.findMany(),
  prisma.control_prenatal.findMany(),
  prisma.alertas.findMany()
]);

// Todas las consultas respetan RLS automáticamente
```

### Caso 2: Transacciones

```typescript
// RLS se mantiene durante toda la transacción
await prisma.$transaction(async (tx) => {
  const gestante = await tx.gestantes.create({
    data: { /* ... */ }
  });
  
  const control = await tx.control_prenatal.create({
    data: {
      gestante_id: gestante.id,
      /* ... */
    }
  });
  
  // Ambas operaciones respetan RLS
});
```

### Caso 3: Consultas raw

```typescript
// RLS también se aplica a consultas raw
const gestantes = await prisma.$queryRaw`
  SELECT * FROM gestantes 
  WHERE activa = true
`;

// RLS filtra automáticamente según el contexto
```

---

## 📚 Referencias

- **Guía completa**: `IMPLEMENTACION_RLS.md`
- **Inicio rápido**: `INICIO_RAPIDO_RLS.md`
- **Resumen ejecutivo**: `RESUMEN_IMPLEMENTACION_RLS.md`
- **Documento original**: `S/genio/medrinasControles.md`

---

**Última actualización**: Noviembre 2025  
**Versión**: 1.0.0  
**Estado**: ✅ Producción
