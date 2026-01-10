-- Script para identificar usuarios con datos faltantes
-- Ejecutar en la base de datos de producción

-- 1. Usuarios sin municipio
SELECT 
    'SIN_MUNICIPIO' as tipo_faltante,
    id,
    nombre,
    email,
    rol,
    documento,
    telefono,
    municipio_id,
    fecha_creacion
FROM usuarios
WHERE activo = true
AND municipio_id IS NULL
ORDER BY rol, nombre;

-- 2. Usuarios sin documento
SELECT 
    'SIN_DOCUMENTO' as tipo_faltante,
    id,
    nombre,
    email,
    rol,
    documento,
    telefono,
    municipio_id,
    fecha_creacion
FROM usuarios
WHERE activo = true
AND (documento IS NULL OR documento = '')
ORDER BY rol, nombre;

-- 3. Usuarios sin teléfono
SELECT 
    'SIN_TELEFONO' as tipo_faltante,
    id,
    nombre,
    email,
    rol,
    documento,
    telefono,
    municipio_id,
    fecha_creacion
FROM usuarios
WHERE activo = true
AND (telefono IS NULL OR telefono = '')
ORDER BY rol, nombre;

-- 4. Resumen de datos faltantes por rol
SELECT 
    rol,
    COUNT(*) as total_usuarios,
    COUNT(municipio_id) as con_municipio,
    COUNT(*) - COUNT(municipio_id) as sin_municipio,
    ROUND(COUNT(municipio_id) * 100.0 / COUNT(*), 2) as porcentaje_con_municipio,
    COUNT(CASE WHEN documento IS NOT NULL AND documento != '' THEN 1 END) as con_documento,
    COUNT(*) - COUNT(CASE WHEN documento IS NOT NULL AND documento != '' THEN 1 END) as sin_documento,
    COUNT(CASE WHEN telefono IS NOT NULL AND telefono != '' THEN 1 END) as con_telefono,
    COUNT(*) - COUNT(CASE WHEN telefono IS NOT NULL AND telefono != '' THEN 1 END) as sin_telefono
FROM usuarios
WHERE activo = true
GROUP BY rol
ORDER BY rol;

-- 5. Usuarios con TODOS los datos faltantes (crítico)
SELECT 
    'TODOS_FALTANTES' as tipo_faltante,
    id,
    nombre,
    email,
    rol,
    fecha_creacion
FROM usuarios
WHERE activo = true
AND municipio_id IS NULL
AND (documento IS NULL OR documento = '')
AND (telefono IS NULL OR telefono = '')
ORDER BY rol, nombre;

-- 6. Usuarios con AL MENOS UN dato faltante
SELECT 
    id,
    nombre,
    email,
    rol,
    CASE WHEN municipio_id IS NULL THEN 'SIN_MUNICIPIO' ELSE 'OK' END as estado_municipio,
    CASE WHEN documento IS NULL OR documento = '' THEN 'SIN_DOCUMENTO' ELSE 'OK' END as estado_documento,
    CASE WHEN telefono IS NULL OR telefono = '' THEN 'SIN_TELEFONO' ELSE 'OK' END as estado_telefono,
    fecha_creacion
FROM usuarios
WHERE activo = true
AND (
    municipio_id IS NULL 
    OR documento IS NULL 
    OR documento = ''
    OR telefono IS NULL 
    OR telefono = ''
)
ORDER BY rol, nombre;

-- 7. Estadísticas generales
SELECT 
    COUNT(*) as total_usuarios_activos,
    COUNT(CASE WHEN municipio_id IS NOT NULL THEN 1 END) as usuarios_con_municipio,
    COUNT(CASE WHEN municipio_id IS NULL THEN 1 END) as usuarios_sin_municipio,
    COUNT(CASE WHEN documento IS NOT NULL AND documento != '' THEN 1 END) as usuarios_con_documento,
    COUNT(CASE WHEN documento IS NULL OR documento = '' THEN 1 END) as usuarios_sin_documento,
    COUNT(CASE WHEN telefono IS NOT NULL AND telefono != '' THEN 1 END) as usuarios_con_telefono,
    COUNT(CASE WHEN telefono IS NULL OR telefono = '' THEN 1 END) as usuarios_sin_telefono,
    COUNT(CASE 
        WHEN municipio_id IS NOT NULL 
        AND documento IS NOT NULL AND documento != ''
        AND telefono IS NOT NULL AND telefono != ''
        THEN 1 
    END) as usuarios_completos,
    ROUND(
        COUNT(CASE 
            WHEN municipio_id IS NOT NULL 
            AND documento IS NOT NULL AND documento != ''
            AND telefono IS NOT NULL AND telefono != ''
            THEN 1 
        END) * 100.0 / COUNT(*), 
        2
    ) as porcentaje_completos
FROM usuarios
WHERE activo = true;

-- 8. Lista de emails para notificación (usuarios con datos faltantes)
SELECT 
    email,
    nombre,
    rol
FROM usuarios
WHERE activo = true
AND (
    municipio_id IS NULL 
    OR documento IS NULL 
    OR documento = ''
    OR telefono IS NULL 
    OR telefono = ''
)
ORDER BY rol, nombre;
