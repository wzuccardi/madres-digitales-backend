-- Actualizar contraseña para usuario 1975.orozcoyudis@gmail.com
-- Nueva contraseña: Yudis1975

UPDATE usuarios 
SET password_hash = '$2b$10$sGis6idBbFy8RsaaRMWn1uMvZ6X1tnyB5pIC/V6i..4LSEnpodGx.'
WHERE email = '1975.orozcoyudis@gmail.com';

-- Verificar la actualización
SELECT id, email, nombre, rol, activo
FROM usuarios 
WHERE email = '1975.orozcoyudis@gmail.com';
