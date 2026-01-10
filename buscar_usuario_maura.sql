-- Buscar usuarios con "maura" en el email o nombre
SELECT id, email, nombre, documento, rol, activo
FROM usuarios
WHERE LOWER(email) LIKE '%maura%' 
   OR LOWER(nombre) LIKE '%maura%'
ORDER BY nombre;

-- Si no se encuentra, buscar por documento 1049932839
SELECT id, email, nombre, documento, rol, activo
FROM usuarios
WHERE documento = '1049932839';
