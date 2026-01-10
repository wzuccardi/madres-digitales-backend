-- Verificar controles con exactamente 24 semanas de gestación
SELECT 
    c.id,
    c.gestante_id,
    g.nombre as gestante_nombre,
    g.fecha_ultima_menstruacion,
    c.fecha_control,
    c.semanas_gestacion,
    c.created_at,
    -- Calcular semanas reales desde FUM
    FLOOR(DATEDIFF(c.fecha_control, g.fecha_ultima_menstruacion) / 7) as semanas_reales_calculadas
FROM controles c
INNER JOIN gestantes g ON c.gestante_id = g.id
WHERE c.semanas_gestacion = 24
ORDER BY c.created_at DESC;

-- Contar cuántos hay
SELECT COUNT(*) as total_controles_con_24_semanas
FROM controles
WHERE semanas_gestacion = 24;

-- Ver si las 24 semanas son correctas o hardcodeadas
SELECT 
    c.semanas_gestacion,
    FLOOR(DATEDIFF(c.fecha_control, g.fecha_ultima_menstruacion) / 7) as semanas_calculadas,
    COUNT(*) as cantidad,
    CASE 
        WHEN c.semanas_gestacion = FLOOR(DATEDIFF(c.fecha_control, g.fecha_ultima_menstruacion) / 7) 
        THEN 'CORRECTO' 
        ELSE 'INCORRECTO (hardcodeado)'
    END as estado
FROM controles c
INNER JOIN gestantes g ON c.gestante_id = g.id
WHERE c.semanas_gestacion = 24
GROUP BY 
    c.semanas_gestacion,
    FLOOR(DATEDIFF(c.fecha_control, g.fecha_ultima_menstruacion) / 7),
    estado
ORDER BY cantidad DESC;
