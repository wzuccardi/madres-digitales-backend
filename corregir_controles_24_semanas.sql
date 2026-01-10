-- Script para corregir controles con 24 semanas hardcodeadas
-- IMPORTANTE: Ejecutar primero verificar_controles_24_semanas.sql para confirmar cuáles necesitan corrección

-- Paso 1: Ver cuántos controles se van a actualizar
SELECT 
    COUNT(*) as controles_a_corregir,
    'Controles donde semanas_gestacion no coincide con el cálculo real' as descripcion
FROM controles c
INNER JOIN gestantes g ON c.gestante_id = g.id
WHERE c.semanas_gestacion = 24
  AND c.semanas_gestacion != FLOOR(DATEDIFF(c.fecha_control, g.fecha_ultima_menstruacion) / 7)
  AND g.fecha_ultima_menstruacion IS NOT NULL;

-- Paso 2: Actualizar los controles con el cálculo correcto
UPDATE controles c
INNER JOIN gestantes g ON c.gestante_id = g.id
SET c.semanas_gestacion = FLOOR(DATEDIFF(c.fecha_control, g.fecha_ultima_menstruacion) / 7)
WHERE c.semanas_gestacion = 24
  AND c.semanas_gestacion != FLOOR(DATEDIFF(c.fecha_control, g.fecha_ultima_menstruacion) / 7)
  AND g.fecha_ultima_menstruacion IS NOT NULL;

-- Paso 3: Verificar la corrección
SELECT 
    'Después de la corrección' as momento,
    COUNT(*) as total_controles_24_semanas,
    SUM(CASE 
        WHEN c.semanas_gestacion = FLOOR(DATEDIFF(c.fecha_control, g.fecha_ultima_menstruacion) / 7) 
        THEN 1 
        ELSE 0 
    END) as correctos,
    SUM(CASE 
        WHEN c.semanas_gestacion != FLOOR(DATEDIFF(c.fecha_control, g.fecha_ultima_menstruacion) / 7) 
        THEN 1 
        ELSE 0 
    END) as incorrectos
FROM controles c
INNER JOIN gestantes g ON c.gestante_id = g.id
WHERE c.semanas_gestacion = 24
  AND g.fecha_ultima_menstruacion IS NOT NULL;
