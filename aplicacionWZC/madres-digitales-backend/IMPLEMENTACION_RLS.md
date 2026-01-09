# 🔐 Guía de Implementación: Row Level Security (RLS)

## 📋 Resumen

Esta guía describe cómo implementar Row Level Security (RLS) en PostgreSQL para garantizar que las madrinas solo puedan ver y gestionar sus propias gestantes y controles prenatales.

## 🎯 Objetivo

**Problema**: Las madrinas pueden ver gestantes y controles de otras madrinas.

**Solución**: Implementar RLS a nivel de base de datos para filtrar automáticamente los datos según el rol y permisos del usuario.

## 📁 Archivos Creados

### Scripts SQL (en `/scripts/`)

1. **01_enable_rls.sql** - Habilita RLS en las tablas
2. **02_create_rls_policies.sql** - Crea las políticas de seguridad
3. **03_create_security_functions.sql** - Crea funciones auxiliares
4. **04_test_rls_policies.sql** - Tests completos de verificación

### Código TypeScript

1. **src/middlewares/rls.middleware.ts** - Middleware para establecer contexto de seguridad

## 🚀 Pasos de Implementación

### Paso 1: Ejecutar Scripts SQL

Ejecuta los scripts en orden en tu base de datos PostgreSQL:

```bash
# Conectarse a la base de datos
psql -U tu_usuario -d tu_base_de_datos

# Ejecutar scripts en orden
\i scripts/01_enable_rls.sql
\i scripts/02_create_rls_policies.sql
\i scripts/03_create_security_functions.sql

# Verificar con tests
\i scripts/04_test_rls_policies.sql
```

O usando un cliente SQL:

```sql
-- Copiar y pegar el contenido de cada archivo en orden:
-- 1. 01_enable_rls.sql
-- 2. 02_create_rls_policies.sql
-- 3. 03_create_security_functions.sql
-- 4. 04_test_rls_policies.sql (para verificar)
```

### Paso 2: Integrar Middleware en la Aplicación

Edita `src/app.ts` para agregar el middleware de RLS:

```typescript
import { rlsCombinedMiddleware } from './middlewares/rls.middleware';

// ... otras importaciones

// Agregar DESPUÉS del middleware de autenticación
app.use(authMiddleware); // Tu middleware de autenticación existente
app.use(rlsCombinedMiddleware); // NUEVO: Middleware de RLS

// ... resto de la configuración
```

### Paso 3: Verificar Integración

El middleware automáticamente:

1. ✅ Establece el contexto de seguridad antes de cada request
2. ✅ Limpia el contexto después de cada response
3. ✅ Filtra automáticamente los datos según el rol del usuario

**No necesitas modificar tus controladores o servicios existentes** - RLS funciona a nivel de base de datos.

## 🔍 Cómo Funciona

### Variables de Sesión

RLS usa dos variables de sesión en PostgreSQL:

- `app.current_user_id` - ID del usuario autenticado
- `app.current_user_rol` - Rol del usuario (ADMIN, MADRINA, etc.)

### Políticas de Seguridad

#### Para Gestantes:

- **ADMIN/COORDINADOR**: Ve todas las gestantes
- **MADRINA**: Solo ve gestantes donde `madrina_id = su_id`

#### Para Controles Prenatales:

- **ADMIN/COORDINADOR**: Ve todos los controles
- **MADRINA**: Solo ve controles de sus gestantes
- **MEDICO**: Ve controles que él creó

## 📊 Matriz de Permisos

| Rol | Gestantes | Controles | Alertas |
|-----|-----------|-----------|---------|
| **SUPER_ADMIN** | ✅ Todas | ✅ Todos | ✅ Todas |
| **ADMIN** | ✅ Todas | ✅ Todos | ✅ Todas |
| **COORDINADOR** | ✅ Todas | ✅ Todos | ✅ Todas |
| **MADRINA** | ✅ Solo sus gestantes | ✅ Solo controles de sus gestantes | ✅ Solo alertas de sus gestantes |
| **MEDICO** | ❌ Ninguna* | ✅ Solo sus controles | ✅ Solo alertas asignadas |

*Los médicos pueden ver gestantes a través de relaciones específicas

## 🧪 Testing

### Verificar que RLS está activo:

```sql
SELECT 
    tablename,
    rowsecurity,
    forcerowsecurity
FROM pg_tables 
WHERE tablename IN ('gestantes', 'control_prenatal', 'alertas')
    AND schemaname = 'public';
```

### Verificar políticas creadas:

```sql
SELECT 
    tablename, 
    policyname,
    cmd
FROM pg_policies 
WHERE tablename IN ('gestantes', 'control_prenatal', 'alertas')
ORDER BY tablename, policyname;
```

### Test manual de filtrado:

```sql
-- Como ADMIN (ve todo)
SELECT public.set_app_context('admin_id', 'ADMIN');
SELECT COUNT(*) FROM gestantes; -- Debe retornar todas

-- Como MADRINA (ve solo sus gestantes)
SELECT public.set_app_context('madrina_id', 'MADRINA');
SELECT COUNT(*) FROM gestantes; -- Debe retornar solo las asignadas

-- Limpiar
SELECT public.clear_app_context();
```

## 🔧 Troubleshooting

### Problema: No retorna datos

**Causa**: Contexto de seguridad no establecido

**Solución**: Verificar que el middleware de RLS está activo:

```typescript
// En src/app.ts
app.use(rlsCombinedMiddleware); // Debe estar después de authMiddleware
```

### Problema: Retorna datos de otras madrinas

**Causa**: RLS no está habilitado o políticas incorrectas

**Solución**: Verificar que RLS está activo:

```sql
SELECT tablename, rowsecurity, forcerowsecurity
FROM pg_tables 
WHERE tablename = 'gestantes';
-- Ambos deben ser true
```

### Problema: Error "undefined variable"

**Causa**: Función `set_app_context` no existe

**Solución**: Ejecutar `03_create_security_functions.sql`

## 📈 Monitoreo

### Ver contexto actual:

```sql
SELECT * FROM public.get_app_context();
```

### Ver conexiones activas y sus contextos:

```sql
SELECT 
    pid,
    usename,
    application_name,
    current_setting('app.current_user_id', true) as user_id,
    current_setting('app.current_user_rol', true) as rol
FROM pg_stat_activity
WHERE datname = current_database();
```

### Logs de acceso:

El middleware de RLS registra automáticamente:

```
RLS Middleware: Estableciendo contexto de seguridad
  userId: "madrina_123"
  userRol: "MADRINA"
  path: "/api/gestantes"
  method: "GET"
```

## 🔒 Seguridad Adicional

### Índices Recomendados

Ya existen en el schema:

```sql
-- Índice crítico para rendimiento de RLS
CREATE INDEX IF NOT EXISTS idx_gestantes_madrina 
ON gestantes(madrina_id);
```

### Auditoría (Opcional)

Para registrar accesos:

```sql
CREATE TABLE audit_acceso (
    id SERIAL PRIMARY KEY,
    usuario_id TEXT,
    rol TEXT,
    accion TEXT,
    tabla TEXT,
    registro_id TEXT,
    fecha TIMESTAMP DEFAULT NOW()
);

-- Trigger para auditoría
CREATE OR REPLACE FUNCTION log_acceso()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_acceso (usuario_id, rol, accion, tabla, registro_id)
    VALUES (
        current_setting('app.current_user_id', true),
        current_setting('app.current_user_rol', true),
        TG_OP,
        TG_TABLE_NAME,
        NEW.id
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_gestantes
    AFTER INSERT OR UPDATE ON gestantes
    FOR EACH ROW EXECUTE FUNCTION log_acceso();
```

## ✅ Checklist de Implementación

- [ ] Ejecutar `01_enable_rls.sql`
- [ ] Ejecutar `02_create_rls_policies.sql`
- [ ] Ejecutar `03_create_security_functions.sql`
- [ ] Ejecutar `04_test_rls_policies.sql` y verificar resultados
- [ ] Agregar middleware de RLS en `src/app.ts`
- [ ] Reiniciar servidor backend
- [ ] Probar con usuario ADMIN (debe ver todo)
- [ ] Probar con usuario MADRINA (debe ver solo sus gestantes)
- [ ] Verificar logs de aplicación
- [ ] Monitorear rendimiento durante 24h
- [ ] Documentar para el equipo

## 🎓 Recursos Adicionales

- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Prisma Raw Queries](https://www.prisma.io/docs/concepts/components/prisma-client/raw-database-access)
- Documento original: `S/genio/medrinasControles.md`

## 📞 Soporte

Si encuentras problemas:

1. Verificar logs del servidor: `logs/combined.log`
2. Verificar logs de PostgreSQL
3. Ejecutar script de tests: `04_test_rls_policies.sql`
4. Revisar que el middleware está activo en `src/app.ts`

---

**Implementado**: [Fecha]  
**Versión**: 1.0.0  
**Estado**: ✅ Listo para producción
