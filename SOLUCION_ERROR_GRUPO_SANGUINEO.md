# ❌ Error: Campo grupo_sanguineo no existe en la base de datos

## 🐛 Problema

**Error actual:**
```
Error creando control con evaluación: 
Invalid `prisma.gestantes.findUnique()` invocation:

The column `gestantes.grupo_sanguineo` does not exist in the current database.
```

**Causa:** Los campos nuevos agregados al schema de Prisma (`grupo_sanguineo`, `barrio`, `foto_url`, `factores_riesgo`, `email`, `apellido`) **NO se han migrado a la base de datos de producción en Vercel**.

## 📋 Campos Faltantes

Los siguientes campos están en el schema de Prisma pero NO en la BD de producción:

1. **grupo_sanguineo** (VARCHAR) - Tipo de sangre de la gestante
2. **barrio** (TEXT) - Barrio de residencia
3. **foto_url** (TEXT) - URL de la foto de perfil
4. **factores_riesgo** (JSONB) - Factores de riesgo en formato JSON
5. **email** (VARCHAR) - Correo electrónico
6. **apellido** (VARCHAR) - Apellido de la gestante

## ✅ Solución

### Opción 1: Ejecutar SQL Directamente en Vercel Postgres (RECOMENDADO)

1. **Ir a Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Seleccionar el proyecto `madres-digitales-backend`
   - Ir a la pestaña "Storage"
   - Seleccionar la base de datos Postgres

2. **Abrir Query Editor:**
   - Click en "Query" o "Data"
   - Abrir el editor SQL

3. **Ejecutar el script:**
   - Copiar el contenido de `agregar_campos_gestantes_produccion.sql`
   - Pegarlo en el editor
   - Ejecutar

4. **Verificar:**
   - El script mostrará mensajes confirmando qué campos se agregaron
   - Al final mostrará una tabla con los campos nuevos

### Opción 2: Usar Prisma Migrate (Alternativa)

Si tienes acceso directo a la base de datos:

```bash
# En el directorio del backend
cd S/aplicacionWZC/madres-digitales-backend

# Crear una nueva migración
npx prisma migrate dev --name agregar_campos_gestantes

# Aplicar a producción
npx prisma migrate deploy
```

**NOTA:** Esta opción requiere que la variable `DATABASE_URL` apunte a la base de datos de producción.

### Opción 3: Script SQL Manual

Si prefieres ejecutar los ALTER TABLE uno por uno:

```sql
-- Agregar campos uno por uno
ALTER TABLE gestantes ADD COLUMN grupo_sanguineo VARCHAR(10);
ALTER TABLE gestantes ADD COLUMN barrio TEXT;
ALTER TABLE gestantes ADD COLUMN foto_url TEXT;
ALTER TABLE gestantes ADD COLUMN factores_riesgo JSONB;
ALTER TABLE gestantes ADD COLUMN email VARCHAR(255);
ALTER TABLE gestantes ADD COLUMN apellido VARCHAR(255);

-- Verificar
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'gestantes' 
AND column_name IN ('grupo_sanguineo', 'barrio', 'foto_url', 'factores_riesgo', 'email', 'apellido');
```

## 🔍 Verificación Post-Migración

Después de ejecutar el SQL, verificar que todo funcione:

1. **Probar crear un control prenatal:**
   - Ir a la app web
   - Intentar crear un control prenatal
   - Debería funcionar sin errores

2. **Verificar en logs de Vercel:**
   - Ir a Vercel Dashboard > Logs
   - Buscar errores relacionados con `grupo_sanguineo`
   - No deberían aparecer más

3. **Probar crear/editar gestante:**
   - Crear una nueva gestante
   - Editar una gestante existente
   - Verificar que los campos nuevos se guarden correctamente

## 📊 Impacto

**Endpoints afectados:**
- ✅ `POST /api/alertas-automaticas/controles/con-evaluacion` - **PRINCIPAL**
- ✅ `POST /api/gestantes` - Crear gestante
- ✅ `PUT /api/gestantes/:id` - Editar gestante
- ✅ `GET /api/gestantes/:id` - Obtener gestante (con campos nuevos)

**Funcionalidades afectadas:**
- ✅ Creación de controles prenatales con evaluación
- ✅ Registro de nuevas gestantes
- ✅ Edición de datos de gestantes
- ✅ Visualización de perfil de gestante

## 🚨 Urgencia

**CRÍTICO** - Este error está bloqueando la funcionalidad principal de la app:
- ❌ No se pueden crear controles prenatales
- ❌ No se pueden registrar nuevas gestantes
- ❌ No se pueden editar gestantes existentes

## 📝 Notas Importantes

1. **El schema de Prisma está correcto** - Los campos están definidos en `schema.prisma`
2. **La base de datos está desactualizada** - Falta ejecutar la migración
3. **No hay pérdida de datos** - Solo se agregan columnas nuevas (todas opcionales)
4. **Compatibilidad hacia atrás** - Los campos son opcionales (nullable), no rompe datos existentes

## 🎯 Próximos Pasos

1. ✅ **INMEDIATO:** Ejecutar `agregar_campos_gestantes_produccion.sql` en Vercel Postgres
2. ✅ Verificar que el error desaparezca
3. ✅ Probar crear un control prenatal
4. ✅ Documentar el proceso de migración para futuras actualizaciones

## 📚 Archivos Relacionados

- `S/agregar_campos_gestantes_produccion.sql` - Script SQL para ejecutar
- `S/aplicacionWZC/madres-digitales-backend/prisma/schema.prisma` - Schema de Prisma (líneas 210-215)
- `S/aplicacionWZC/madres-digitales-backend/src/controllers/gestante.controller.ts` - Controlador que usa estos campos

## 🔗 Referencias

- Commit que agregó los campos: `044b3fa`
- Mensaje: "fix: corregir manejo de campos JSON en creación de gestantes y agregar campos adicionales"
- Fecha: Reciente (último commit en main)

---

**ACCIÓN REQUERIDA:** Ejecutar el SQL en Vercel Postgres Dashboard AHORA para restaurar la funcionalidad de la app.
