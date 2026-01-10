-- Script para verificar el estado de los usuarios en la base de datos
-- Verificar cuántos usuarios hay en total
SELECT 'Total usuarios' as descripcion, COUNT(*) as cantidad FROM usuarios;

-- Verificar cuántos usuarios están activos
SELECT 'Usuarios activos' as descripcion, COUNT(*) as cantidad FROM usuarios WHERE activo = true;

-- Verificar cuántos usuarios están inactivos
SELECT 'Usuarios inactivos' as descripcion, COUNT(*) as cantidad FROM usuarios WHERE activo = false;

-- Ver todos los usuarios con su estado
SELECT 
    id,
    nombre,
    email,
    rol,
    activo,
    fecha_creacion
FROM usuarios 
ORDER BY fecha_creacion DESC;

-- Verificar si hay usuarios con activo NULL
SELECT 'Usuarios con activo NULL' as descripcion, COUNT(*) as cantidad FROM usuarios WHERE activo IS NULL;