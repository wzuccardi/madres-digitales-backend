-- Script para ajustar registros de puerperio de 327 a 87
-- Eliminando 240 registros de puerperio para que el total sea 900 (813 gestantes + 87 puerperio)

-- Paso 1: Verificar estado actual
SELECT 'ANTES - Gestantes activas' as descripcion, COUNT(*) as cantidad 
FROM gestantes 
WHERE activa = true;

SELECT 'ANTES - Gestantes en puerperio' as descripcion, COUNT(*) as cantidad 
FROM gestantes 
WHERE activa = true AND fecha_probable_parto <= NOW();

SELECT 'ANTES - Total general' as descripcion, COUNT(*) as cantidad 
FROM gestantes 
WHERE activa = true;

-- Paso 2: Identificar los 240 registros más antiguos de puerperio para eliminar
-- (manteniendo los 87 más recientes)
SELECT 
    'Registros a desactivar' as descripcion,
    COUNT(*) as cantidad
FROM gestantes
WHERE activa = true 
  AND fecha_probable_parto <= NOW()
  AND id IN (
    SELECT id 
    FROM gestantes 
    WHERE activa = true AND fecha_probable_parto <= NOW()
    ORDER BY fecha_probable_parto ASC NULLS FIRST, fecha_creacion ASC
    LIMIT 240
  );

-- Paso 3: Desactivar los 240 registros más antiguos de puerperio
-- (en lugar de eliminarlos, los marcamos como inactivos para mantener el historial)
UPDATE gestantes
SET activa = false,
    fecha_actualizacion = NOW()
WHERE activa = true 
  AND fecha_probable_parto <= NOW()
  AND id IN (
    SELECT id 
    FROM gestantes 
    WHERE activa = true AND fecha_probable_parto <= NOW()
    ORDER BY fecha_probable_parto ASC NULLS FIRST, fecha_creacion ASC
    LIMIT 240
  );

-- Paso 4: Verificar resultado
SELECT 'DESPUÉS - Gestantes activas' as descripcion, COUNT(*) as cantidad 
FROM gestantes 
WHERE activa = true;

SELECT 'DESPUÉS - Gestantes en puerperio' as descripcion, COUNT(*) as cantidad 
FROM gestantes 
WHERE activa = true AND fecha_probable_parto <= NOW();

SELECT 'DESPUÉS - Total general' as descripcion, COUNT(*) as cantidad 
FROM gestantes 
WHERE activa = true;

SELECT 'DESPUÉS - Gestantes inactivas (desactivadas)' as descripcion, COUNT(*) as cantidad 
FROM gestantes 
WHERE activa = false;

-- Paso 5: Mostrar algunos ejemplos de los registros desactivados
SELECT 
    id,
    nombre,
    documento,
    fecha_probable_parto,
    activa,
    fecha_creacion
FROM gestantes 
WHERE activa = false 
  AND fecha_probable_parto <= NOW()
ORDER BY fecha_actualizacion DESC
LIMIT 10;