# 🚀 Inicio Rápido: Implementación de RLS

## ⚡ Instalación en 3 Pasos

### Opción A: Script Automático (Recomendado)

#### Windows (PowerShell):
```powershell
# 1. Configurar variable de entorno
$env:DATABASE_URL = "postgresql://usuario:password@host:puerto/database"

# 2. Ejecutar script de instalación
cd S/aplicacionWZC/madres-digitales-backend
.\scripts\install_rls.ps1
```

#### Linux/Mac (Bash):
```bash
# 1. Configurar variable de entorno
export DATABASE_URL="postgresql://usuario:password@host:puerto/database"

# 2. Dar permisos de ejecución
chmod +x scripts/install_rls.sh

# 3. Ejecutar script de instalación
cd S/aplicacionWZC/madres-digitales-backend
./scripts/install_rls.sh
```

### Opción B: Manual (Paso a Paso)

#### 1. Conectarse a la base de datos

```bash
psql -U tu_usuario -d tu_base_de_datos
```

O usando tu cliente SQL favorito (DBeaver, pgAdmin, etc.)

#### 2. Ejecutar scripts SQL en orden

```sql
-- Copiar y pegar el contenido de cada archivo en este orden:

-- Paso 1: Habilitar RLS
\i scripts/01_enable_rls.sql

-- Paso 2: Crear políticas
\i scripts/02_create_rls_policies.sql

-- Paso 3: Crear funciones
\i scripts/03_create_security_functions.sql

-- Paso 4: Verificar (opcional)
\i scripts/04_test_rls_policies.sql
```

#### 3. Reiniciar el servidor backend

```bash
# Detener el servidor actual (Ctrl+C)

# Reiniciar
npm run dev
# o
npm start
```

## ✅ Verificación

### 1. Verificar que RLS está activo

```sql
SELECT 
    tablename,
    rowsecurity,
    forcerowsecurity
FROM pg_tables 
WHERE tablename IN ('gestantes', 'control_prenatal', 'alertas')
    AND schemaname = 'public';
```

**Resultado esperado**: Todas las tablas deben tener `rowsecurity = true` y `forcerowsecurity = true`

### 2. Verificar políticas creadas

```sql
SELECT 
    tablename, 
    policyname,
    cmd
FROM pg_policies 
WHERE tablename IN ('gestantes', 'control_prenatal', 'alertas')
ORDER BY tablename, policyname;
```

**Resultado esperado**: Debe mostrar múltiples políticas para cada tabla (select, insert, update, delete)

### 3. Probar en la aplicación

#### Como Administrador:
```bash
# Login como admin
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"tu_password"}'

# Obtener gestantes (debe ver TODAS)
curl -X GET http://localhost:3000/api/gestantes \
  -H "Authorization: Bearer TU_TOKEN"
```

#### Como Madrina:
```bash
# Login como madrina
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"madrina@example.com","password":"tu_password"}'

# Obtener gestantes (debe ver SOLO las asignadas a ella)
curl -X GET http://localhost:3000/api/gestantes \
  -H "Authorization: Bearer TU_TOKEN"
```

## 🔍 Logs a Revisar

Después de reiniciar el servidor, busca estos mensajes en los logs:

```
✅ Contexto establecido exitosamente
   userId: "madrina_123"
   userRol: "MADRINA"
```

Si ves errores como:
```
❌ Error estableciendo contexto de seguridad
```

Revisa que:
1. Los scripts SQL se ejecutaron correctamente
2. Las funciones `set_app_context` y `clear_app_context` existen
3. El middleware de RLS está activo en `src/app.ts`

## 🐛 Troubleshooting Rápido

### Problema: No retorna datos

**Solución**: Verificar que el middleware está activo

```typescript
// En src/app.ts debe estar:
import { rlsCombinedMiddleware } from './middlewares/rls.middleware';

// Y en las rutas:
app.use('/api', generalLimiter, rlsCombinedMiddleware, routes);
```

### Problema: Retorna datos de otras madrinas

**Solución**: Verificar que RLS está habilitado

```sql
-- Debe retornar true, true
SELECT rowsecurity, forcerowsecurity 
FROM pg_tables 
WHERE tablename = 'gestantes';
```

### Problema: Error "function set_app_context does not exist"

**Solución**: Ejecutar el script de funciones

```sql
\i scripts/03_create_security_functions.sql
```

## 📊 Resultados Esperados

### Antes de RLS:
- ❌ Madrina A ve gestantes de Madrina B
- ❌ Madrina B ve controles de Madrina A
- ❌ Sin aislamiento de datos

### Después de RLS:
- ✅ Madrina A solo ve sus gestantes
- ✅ Madrina B solo ve sus controles
- ✅ Admin ve todo
- ✅ Aislamiento completo a nivel de base de datos

## 📚 Documentación Completa

Para más detalles, consulta:
- `IMPLEMENTACION_RLS.md` - Guía completa de implementación
- `S/genio/medrinasControles.md` - Documento original con la solución

## 🆘 Soporte

Si encuentras problemas:

1. Revisa los logs del servidor: `logs/combined.log`
2. Ejecuta el script de tests: `04_test_rls_policies.sql`
3. Verifica que todas las funciones existen:
   ```sql
   SELECT proname FROM pg_proc 
   WHERE proname LIKE '%app_context%';
   ```

## ✨ ¡Listo!

Una vez completados estos pasos, tu aplicación tendrá seguridad a nivel de base de datos y las madrinas solo podrán ver sus propias gestantes y controles.

---

**Tiempo estimado de implementación**: 10-15 minutos  
**Nivel de dificultad**: Medio  
**Impacto**: Alto (Seguridad crítica)
