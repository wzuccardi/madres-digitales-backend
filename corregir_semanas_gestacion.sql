-- Script para recalcular semanas de gestación en controles existentes
-- Basado en la fecha_ultima_menstruacion de cada gestante

-- Actualizar semanas_gestacion en controles prenatales
UPDATE control_prenatal cp
SET semanas_gestacion = FLOOR(
  EXTRACT(EPOCH FROM (cp.fecha_control - g.fecha_ultima_menstruacion)) / (7 * 24 * 60 * 60)
)::INTEGER
FROM gestantes g
WHERE cp.gestante_id = g.id
  AND g.fecha_ultima_menstruacion IS NOT NULL
  AND cp.fecha_control >= g.fecha_ultima_menstruacion
  AND FLOOR(
    EXTRACT(EPOCH FROM (cp.fecha_control - g.fecha_ultima_menstruacion)) / (7 * 24 * 60 * 60)
  ) BETWEEN 0 AND 42;

-- Verificar los cambios
SELECT 
  cp.id,
  g.nombre as gestante,
  g.fecha_ultima_menstruacion as fum,
  cp.fecha_control,
  cp.semanas_gestacion as semanas_actualizadas,
  FLOOR(
    EXTRACT(EPOCH FROM (cp.fecha_control - g.fecha_ultima_menstruacion)) / (7 * 24 * 60 * 60)
  )::INTEGER as semanas_calculadas
FROM control_prenatal cp
JOIN gestantes g ON cp.gestante_id = g.id
WHERE g.fecha_ultima_menstruacion IS NOT NULL
ORDER BY cp.fecha_control DESC
LIMIT 20;

-- Resumen de controles actualizados
SELECT 
  COUNT(*) as total_controles_actualizados,
  MIN(semanas_gestacion) as min_semanas,
  MAX(semanas_gestacion) as max_semanas,
  ROUND(AVG(semanas_gestacion), 1) as promedio_semanas
FROM control_prenatal
WHERE semanas_gestacion IS NOT NULL;
