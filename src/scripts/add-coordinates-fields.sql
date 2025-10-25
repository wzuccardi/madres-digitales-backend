-- Script SQL para agregar campos de coordenadas a la tabla municipios existente
-- Compatible con PostgreSQL - NO elimina la tabla, solo agrega campos

-- Agregar campos de coordenadas y datos adicionales si no existen
DO $$
BEGIN
    -- Verificar y agregar cada campo individualmente
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'municipios' AND column_name = 'latitud') THEN
        ALTER TABLE municipios ADD COLUMN latitud DECIMAL(10, 8);
        RAISE NOTICE 'Campo latitud agregado';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'municipios' AND column_name = 'longitud') THEN
        ALTER TABLE municipios ADD COLUMN longitud DECIMAL(11, 8);
        RAISE NOTICE 'Campo longitud agregado';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'municipios' AND column_name = 'poblacion') THEN
        ALTER TABLE municipios ADD COLUMN poblacion INT;
        RAISE NOTICE 'Campo poblacion agregado';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'municipios' AND column_name = 'area_km2') THEN
        ALTER TABLE municipios ADD COLUMN area_km2 DECIMAL(10, 2);
        RAISE NOTICE 'Campo area_km2 agregado';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'municipios' AND column_name = 'altitud_msnm') THEN
        ALTER TABLE municipios ADD COLUMN altitud_msnm INT;
        RAISE NOTICE 'Campo altitud_msnm agregado';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'municipios' AND column_name = 'es_capital') THEN
        ALTER TABLE municipios ADD COLUMN es_capital BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Campo es_capital agregado';
    END IF;
END $$;

-- Crear índices para búsquedas geográficas si no existen
CREATE INDEX IF NOT EXISTS idx_municipios_coordenadas ON municipios (latitud, longitud);
CREATE INDEX IF NOT EXISTS idx_municipios_latitud ON municipios (latitud);
CREATE INDEX IF NOT EXISTS idx_municipios_longitud ON municipios (longitud);
CREATE INDEX IF NOT EXISTS idx_municipios_codigo_dane ON municipios (codigo_dane);
CREATE INDEX IF NOT EXISTS idx_municipios_departamento ON municipios (departamento);
CREATE INDEX IF NOT EXISTS idx_municipios_activo ON municipios (activo);
CREATE INDEX IF NOT EXISTS idx_municipios_es_capital ON municipios (es_capital);

-- Crear la función para actualizar timestamp automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger para actualizar fecha_actualización automáticamente si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger
                   WHERE tgname = 'update_municipios_updated_at') THEN
        CREATE TRIGGER update_municipios_updated_at
            BEFORE UPDATE ON municipios
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
        RAISE NOTICE 'Trigger update_municipios_updated_at creado';
    END IF;
END $$;

-- Mostrar la estructura final de la tabla
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'municipios' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Confirmar que los índices se crearon correctamente
SELECT indexname, tablename 
FROM pg_indexes 
WHERE tablename = 'municipios' 
AND schemaname = 'public'
ORDER BY indexname;