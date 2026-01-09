# 📁 Scripts de Row Level Security (RLS)

Este directorio contiene todos los scripts SQL necesarios para implementar Row Level Security en la base de datos.

## 📋 Archivos

### Scripts SQL (Ejecutar en orden)

1. **01_enable_rls.sql** (40 líneas)
   - Habilita RLS en las tablas `gestantes`, `control_prenatal` y `alertas`
   - Activa `FORCE ROW LEVEL SECURITY` para máxima seguridad
   - Incluye verificación de estado

2. **02_create_rls_policies.sql** (250 líneas)
   - Crea políticas de seguridad para SELECT, INSERT, UPDATE, DELETE
   - Define permisos por rol (ADMIN, COORDINADOR, MADRINA, MEDICO)
   - Incluye verificación de políticas creadas

3. **03_create_security_functions.sql** (180 líneas)
   - Crea funciones auxiliares:
     - `set_app_context()` - Establecer contexto de usuario
     - `clear_app_context()` - Limpiar contexto
     - `get_app_context()` - Obtener contexto actual
     - `can_view_all_data()` - Verificar permisos globales
     - `get_visible_gestantes()` - Obtener gestantes visibles
     - `count_visible_gestantes()` - Contar gestantes visibles
     - `can_access_gestante()` - Verificar acceso a gestante específica

4. **04_test_rls_policies.sql** (350 líneas)
   - Tests completos de verificación
   - Crea datos de prueba
   - Verifica filtrado por rol
   - Verifica permisos de INSERT, UPDATE, DELETE
   - Limpia datos de prueba automáticamente

### Scripts de Instalación

- **install_rls.sh** - Script automático para Linux/Mac
- **install_rls.ps1** - Script automático para Windows

## 🚀 Uso Rápido

### Opción 1: Script Automático (Recomendado)

#### Windows:
```powershell
$env:DATABASE_URL = "postgresql://usuario:password@host:puerto/database"
.\install_rls.ps1
```

#### Linux/Mac:
```bash
export DATABASE_URL="postgresql://usuario:password@host:puerto/database"
chmod +x install_rls.sh
./install_rls.sh
```

### Opción 2: Manual

```bash
# Conectarse a la base de datos
psql -U usuario -d database

# Ejecutar scripts en orden
\i 01_enable_rls.sql
\i 02_create_rls_policies.sql
\i 03_create_security_functions.sql

# Opcional: Ejecutar tests
\i 04_test_rls_policies.sql
```

## ✅ Verificación

Después de ejecutar los scripts, verifica:

```sql
-- 1. RLS está habilitado
SELECT tablename, rowsecurity, forcerowsecurity
FROM pg_tables 
WHERE tablename IN ('gestantes', 'control_prenatal', 'alertas');
-- Resultado esperado: Todas con true, true

-- 2. Políticas creadas
SELECT tablename, policyname, cmd
FROM pg_policies 
WHERE tablename IN ('gestantes', 'control_prenatal', 'alertas');
-- Resultado esperado: Múltiples políticas por tabla

-- 3. Funciones creadas
SELECT proname FROM pg_proc 
WHERE proname LIKE '%app_context%';
-- Resultado esperado: 7 funciones
```

## 🧪 Testing

Ejecuta el script de tests para verificar que todo funciona:

```bash
psql -U usuario -d database -f 04_test_rls_policies.sql
```

**Resultados esperados:**
- TEST 1 (ADMIN): 3 gestantes, 3 controles
- TEST 2 (MADRINA A): 2 gestantes, 2 controles
- TEST 3 (MADRINA B): 1 gestante, 1 control
- TEST 4-8: Todos los tests pasan

## 🔧 Troubleshooting

### Error: "permission denied"
**Solución**: Ejecutar como superusuario o con permisos suficientes

### Error: "relation does not exist"
**Solución**: Verificar que las tablas existen en el schema `public`

### Error: "function already exists"
**Solución**: Normal si re-ejecutas los scripts (usa `CREATE OR REPLACE`)

## 📚 Documentación

- **Guía completa**: `../IMPLEMENTACION_RLS.md`
- **Inicio rápido**: `../INICIO_RAPIDO_RLS.md`
- **Ejemplos**: `../EJEMPLO_USO_RLS.md`
- **Resumen**: `../RESUMEN_IMPLEMENTACION_RLS.md`

## 🔒 Seguridad

Estos scripts implementan:
- ✅ Aislamiento completo de datos entre madrinas
- ✅ Protección a nivel de base de datos
- ✅ Imposible saltarse las restricciones
- ✅ Auditable y verificable

## 📞 Soporte

Si encuentras problemas:
1. Revisa la documentación en el directorio padre
2. Ejecuta el script de tests
3. Verifica los logs de PostgreSQL

---

**Versión**: 1.0.0  
**Última actualización**: Noviembre 2025  
**Estado**: ✅ Producción
