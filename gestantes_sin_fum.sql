-- Script para identificar gestantes sin fecha_ultima_menstruacion
-- Estas gestantes necesitan actualización para que los controles calculen correctamente las semanas de gestación

-- 1. Contar gestantes activas sin FUM
SELECT 
    COUNT(*) as total_gestantes_sin_fum,
    'Gestantes activas sin fecha_ultima_menstruacion registrada' as descripcion
FROM gestantes
WHERE activa = true
  AND fecha_ultima_menstruacion IS NULL;

-- 2. Listar gestantes sin FUM con sus datos básicos
SELECT 
    g.id,
    g.nombre,
    g.documento,
    g.telefono,
    g.direccion,
    g.municipio_id,
    g.fecha_probable_parto,
    g.riesgo_alto,
    g.fecha_creacion,
    -- Contar cuántos controles tiene cada gestante
    (SELECT COUNT(*) FROM control_prenatal WHERE gestante_id = g.id) as total_controles
FROM gestantes g
WHERE g.activa = true
  AND g.fecha_ultima_menstruacion IS NULL
ORDER BY g.fecha_creacion DESC;

-- 3. Gestantes sin FUM pero con controles registrados (PRIORIDAD ALTA)
SELECT 
    g.id,
    g.nombre,
    g.documento,
    g.telefono,
    COUNT(c.id) as total_controles,
    MIN(c.fecha_control) as primer_control,
    MAX(c.fecha_control) as ultimo_control,
    'PRIORIDAD ALTA: Tiene controles pero no FUM' as nota
FROM gestantes g
INNER JOIN control_prenatal c ON c.gestante_id = g.id
WHERE g.activa = true
  AND g.fecha_ultima_menstruacion IS NULL
GROUP BY g.id, g.nombre, g.documento, g.telefono
ORDER BY total_controles DESC;

-- 4. Resumen por municipio
SELECT 
    m.nombre as municipio,
    COUNT(g.id) as gestantes_sin_fum,
    SUM(CASE WHEN EXISTS(SELECT 1 FROM control_prenatal WHERE gestante_id = g.id) THEN 1 ELSE 0 END) as con_controles,
    SUM(CASE WHEN NOT EXISTS(SELECT 1 FROM control_prenatal WHERE gestante_id = g.id) THEN 1 ELSE 0 END) as sin_controles
FROM gestantes g
LEFT JOIN municipios m ON g.municipio_id = m.id
WHERE g.activa = true
  AND g.fecha_ultima_menstruacion IS NULL
GROUP BY m.nombre
ORDER BY gestantes_sin_fum DESC;

-- 5. Estadísticas generales
SELECT 
    COUNT(*) as total_gestantes_activas,
    SUM(CASE WHEN fecha_ultima_menstruacion IS NOT NULL THEN 1 ELSE 0 END) as con_fum,
    SUM(CASE WHEN fecha_ultima_menstruacion IS NULL THEN 1 ELSE 0 END) as sin_fum,
    ROUND(100.0 * SUM(CASE WHEN fecha_ultima_menstruacion IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*), 2) as porcentaje_con_fum
FROM gestantes
WHERE activa = true;
