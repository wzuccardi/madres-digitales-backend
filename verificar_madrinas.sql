-- Verificar cuántas gestantes tienen madrina asignada
SELECT 
    COUNT(*) as total_gestantes,
    COUNT(madrina_id) as con_madrina,
    COUNT(*) - COUNT(madrina_id) as sin_madrina
FROM gestantes
WHERE activa = true;

-- Ver detalle de gestantes sin madrina
SELECT 
    id,
    nombre,
    documento,
    telefono,
    municipio_id,
    madrina_id,
    riesgo_alto
FROM gestantes
WHERE activa = true 
  AND madrina_id IS NULL
ORDER BY nombre;

-- Ver resumen por madrina
SELECT 
    u.nombre as madrina,
    u.email,
    COUNT(g.id) as gestantes_asignadas
FROM usuarios u
LEFT JOIN gestantes g ON g.madrina_id = u.id AND g.activa = true
WHERE u.rol = 'MADRINA' AND u.activo = true
GROUP BY u.id, u.nombre, u.email
ORDER BY gestantes_asignadas DESC;
