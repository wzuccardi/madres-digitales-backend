# Solución Directa: Widget de Usuarios Muestra 0

## Problema Identificado
El widget de usuarios en el dashboard muestra "0" porque la consulta `prisma.usuarios.count({ where: { activo: true } })` no encuentra usuarios con `activo: true`.

## Causa Probable
Los usuarios en la base de datos tienen:
- `activo: false` 
- `activo: null`

## Soluciones Disponibles

### 1. Endpoint Automático (Recomendado)
Una vez que Vercel termine de redesplegar, usar:
```
GET https://madres-digitales-backend.vercel.app/api/fix-usuarios
```

### 2. SQL Directo
Si tienes acceso a la base de datos, ejecutar:
```sql
-- Activar todos los usuarios
UPDATE usuarios SET activo = true WHERE activo = false OR activo IS NULL;

-- Verificar resultado
SELECT COUNT(*) as usuarios_activos FROM usuarios WHERE activo = true;
```

### 3. Verificación Manual
Para verificar el estado actual:
```sql
SELECT 
    'Total usuarios' as tipo, 
    COUNT(*) as cantidad 
FROM usuarios
UNION ALL
SELECT 
    'Usuarios activos' as tipo, 
    COUNT(*) as cantidad 
FROM usuarios 
WHERE activo = true
UNION ALL
SELECT 
    'Usuarios inactivos' as tipo, 
    COUNT(*) as cantidad 
FROM usuarios 
WHERE activo = false
UNION ALL
SELECT 
    'Usuarios NULL' as tipo, 
    COUNT(*) as cantidad 
FROM usuarios 
WHERE activo IS NULL;
```

## Resultado Esperado
Después de la corrección, el widget de usuarios debería mostrar el número real de usuarios (probablemente entre 3-10 usuarios).

## Limpieza
Una vez solucionado el problema, eliminar los endpoints temporales de debug:
- `/api/debug/usuarios-activos`
- `/api/debug/activar-usuarios` 
- `/api/fix-usuarios`