-- Script para verificar campos de la tabla usuarios
-- y agregar los que falten

-- Ver estructura actual de la tabla
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'usuarios'
ORDER BY ordinal_position;

-- Verificar si existen los campos necesarios
DO $$
BEGIN
    -- Verificar campo tipo_documento
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'usuarios' AND column_name = 'tipo_documento'
    ) THEN
        ALTER TABLE usuarios ADD COLUMN tipo_documento VARCHAR(50) DEFAULT 'cedula';
        RAISE NOTICE 'Campo tipo_documento agregado';
    ELSE
        RAISE NOTICE 'Campo tipo_documento ya existe';
    END IF;

    -- Verificar campo documento
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'usuarios' AND column_name = 'documento'
    ) THEN
        ALTER TABLE usuarios ADD COLUMN documento VARCHAR(50);
        RAISE NOTICE 'Campo documento agregado';
    ELSE
        RAISE NOTICE 'Campo documento ya existe';
    END IF;

    -- Verificar campo telefono
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'usuarios' AND column_name = 'telefono'
    ) THEN
        ALTER TABLE usuarios ADD COLUMN telefono VARCHAR(20);
        RAISE NOTICE 'Campo telefono agregado';
    ELSE
        RAISE NOTICE 'Campo telefono ya existe';
    END IF;

    -- Verificar campo municipio_id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'usuarios' AND column_name = 'municipio_id'
    ) THEN
        ALTER TABLE usuarios ADD COLUMN municipio_id VARCHAR(50);
        RAISE NOTICE 'Campo municipio_id agregado';
    ELSE
        RAISE NOTICE 'Campo municipio_id ya existe';
    END IF;

    -- Verificar campo activo
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'usuarios' AND column_name = 'activo'
    ) THEN
        ALTER TABLE usuarios ADD COLUMN activo BOOLEAN DEFAULT true;
        RAISE NOTICE 'Campo activo agregado';
    ELSE
        RAISE NOTICE 'Campo activo ya existe';
    END IF;

    -- Verificar campo reset_token
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'usuarios' AND column_name = 'reset_token'
    ) THEN
        ALTER TABLE usuarios ADD COLUMN reset_token VARCHAR(255);
        RAISE NOTICE 'Campo reset_token agregado';
    ELSE
        RAISE NOTICE 'Campo reset_token ya existe';
    END IF;

    -- Verificar campo reset_token_expires
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'usuarios' AND column_name = 'reset_token_expires'
    ) THEN
        ALTER TABLE usuarios ADD COLUMN reset_token_expires TIMESTAMP;
        RAISE NOTICE 'Campo reset_token_expires agregado';
    ELSE
        RAISE NOTICE 'Campo reset_token_expires ya existe';
    END IF;
END $$;

-- Verificar usuarios con datos incompletos
SELECT 
    id,
    nombre,
    email,
    rol,
    CASE WHEN documento IS NULL OR documento = '' THEN 'Falta documento' ELSE 'OK' END as estado_documento,
    CASE WHEN telefono IS NULL OR telefono = '' THEN 'Falta teléfono' ELSE 'OK' END as estado_telefono,
    CASE WHEN tipo_documento IS NULL THEN 'Falta tipo documento' ELSE 'OK' END as estado_tipo_documento,
    activo
FROM usuarios
WHERE 
    documento IS NULL OR documento = '' OR
    telefono IS NULL OR telefono = '' OR
    tipo_documento IS NULL
ORDER BY rol, nombre;

-- Contar usuarios por rol
SELECT 
    rol,
    COUNT(*) as total,
    COUNT(CASE WHEN activo = true THEN 1 END) as activos,
    COUNT(CASE WHEN activo = false THEN 1 END) as inactivos,
    COUNT(CASE WHEN documento IS NULL OR documento = '' THEN 1 END) as sin_documento,
    COUNT(CASE WHEN telefono IS NULL OR telefono = '' THEN 1 END) as sin_telefono
FROM usuarios
GROUP BY rol
ORDER BY rol;
