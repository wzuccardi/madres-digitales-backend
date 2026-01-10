-- Agregar campos faltantes a la tabla gestantes en producción
-- Estos campos fueron agregados al schema de Prisma pero no se migraron a la BD de Vercel

-- Verificar si los campos ya existen antes de agregarlos
DO $$ 
BEGIN
    -- Agregar grupo_sanguineo si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'gestantes' AND column_name = 'grupo_sanguineo'
    ) THEN
        ALTER TABLE gestantes ADD COLUMN grupo_sanguineo VARCHAR(10);
        RAISE NOTICE 'Campo grupo_sanguineo agregado';
    ELSE
        RAISE NOTICE 'Campo grupo_sanguineo ya existe';
    END IF;

    -- Agregar barrio si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'gestantes' AND column_name = 'barrio'
    ) THEN
        ALTER TABLE gestantes ADD COLUMN barrio TEXT;
        RAISE NOTICE 'Campo barrio agregado';
    ELSE
        RAISE NOTICE 'Campo barrio ya existe';
    END IF;

    -- Agregar foto_url si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'gestantes' AND column_name = 'foto_url'
    ) THEN
        ALTER TABLE gestantes ADD COLUMN foto_url TEXT;
        RAISE NOTICE 'Campo foto_url agregado';
    ELSE
        RAISE NOTICE 'Campo foto_url ya existe';
    END IF;

    -- Agregar factores_riesgo si no existe (tipo JSONB)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'gestantes' AND column_name = 'factores_riesgo'
    ) THEN
        ALTER TABLE gestantes ADD COLUMN factores_riesgo JSONB;
        RAISE NOTICE 'Campo factores_riesgo agregado';
    ELSE
        RAISE NOTICE 'Campo factores_riesgo ya existe';
    END IF;

    -- Agregar email si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'gestantes' AND column_name = 'email'
    ) THEN
        ALTER TABLE gestantes ADD COLUMN email VARCHAR(255);
        RAISE NOTICE 'Campo email agregado';
    ELSE
        RAISE NOTICE 'Campo email ya existe';
    END IF;

    -- Agregar apellido si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'gestantes' AND column_name = 'apellido'
    ) THEN
        ALTER TABLE gestantes ADD COLUMN apellido VARCHAR(255);
        RAISE NOTICE 'Campo apellido agregado';
    ELSE
        RAISE NOTICE 'Campo apellido ya existe';
    END IF;
END $$;

-- Verificar que los campos se agregaron correctamente
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'gestantes' 
AND column_name IN ('grupo_sanguineo', 'barrio', 'foto_url', 'factores_riesgo', 'email', 'apellido')
ORDER BY column_name;
