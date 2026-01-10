-- Script para activar todos los usuarios existentes
-- Esto debería resolver el problema del widget de usuarios mostrando 0

-- Primero verificar el estado actual
SELECT 'ANTES - Total usuarios' as descripcion, COUNT(*) as cantidad FROM usuarios;
SELECT 'ANTES - Usuarios activos' as descripcion, COUNT(*) as cantidad FROM usuarios WHERE activo = true;
SELECT 'ANTES - Usuarios inactivos' as descripcion, COUNT(*) as cantidad FROM usuarios WHERE activo = false;
SELECT 'ANTES - Usuarios con activo NULL' as descripcion, COUNT(*) as cantidad FROM usuarios WHERE activo IS NULL;

-- Actualizar todos los usuarios a activo = true
UPDATE usuarios SET activo = true WHERE activo = false OR activo IS NULL;

-- Verificar el resultado
SELECT 'DESPUÉS - Total usuarios' as descripcion, COUNT(*) as cantidad FROM usuarios;
SELECT 'DESPUÉS - Usuarios activos' as descripcion, COUNT(*) as cantidad FROM usuarios WHERE activo = true;
SELECT 'DESPUÉS - Usuarios inactivos' as descripcion, COUNT(*) as cantidad FROM usuarios WHERE activo = false;

-- Mostrar todos los usuarios actualizados
SELECT 
    id,
    nombre,
    email,
    rol,
    activo,
    fecha_creacion
FROM usuarios 
ORDER BY fecha_creacion DESC;