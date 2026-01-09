-- Actualizar contraseña para usuario nayiviscastrotorres@gmail.com
-- Nueva contraseña: nayivis03

UPDATE usuarios 
SET password_hash = '$2b$10$5WiNVnbxB1egb1n4dVPdL.UmOCaQDCFjrYagEmpvPR5n8sQYvJcQG'
WHERE email = 'nayiviscastrotorres@gmail.com';

-- Verificar la actualización
SELECT id, email, nombre, rol, activo
FROM usuarios 
WHERE email = 'nayiviscastrotorres@gmail.com';