-- Agregar campos para reset de contraseña SIN perder datos
-- Ejecutar este SQL directamente en la base de datos

-- Agregar columna reset_token (nullable)
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS reset_token TEXT;

-- Agregar columna reset_token_expires (nullable)
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP;

-- Verificar que se agregaron correctamente
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
AND column_name IN ('reset_token', 'reset_token_expires');
