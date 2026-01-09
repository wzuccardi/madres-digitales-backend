-- Agregar campos faltantes para reportes a la tabla gestantes
ALTER TABLE gestantes ADD COLUMN IF NOT EXISTS edad INTEGER;
ALTER TABLE gestantes ADD COLUMN IF NOT EXISTS tiene_discapacidad BOOLEAN DEFAULT FALSE;
ALTER TABLE gestantes ADD COLUMN IF NOT EXISTS es_migrante BOOLEAN DEFAULT FALSE;
ALTER TABLE gestantes ADD COLUMN IF NOT EXISTS poblacion_etnica VARCHAR(50); -- 'indigena', 'afro', 'palenquero', 'ninguna'
ALTER TABLE gestantes ADD COLUMN IF NOT EXISTS victima_conflicto_armado BOOLEAN DEFAULT FALSE;
ALTER TABLE gestantes ADD COLUMN IF NOT EXISTS fecha_ingreso_control DATE;

-- Agregar campos faltantes para reportes a la tabla control_prenatal
ALTER TABLE control_prenatal ADD COLUMN IF NOT EXISTS suministro_micronutrientes BOOLEAN DEFAULT FALSE;
ALTER TABLE control_prenatal ADD COLUMN IF NOT EXISTS tamizaje_vih BOOLEAN DEFAULT FALSE;
ALTER TABLE control_prenatal ADD COLUMN IF NOT EXISTS tamizaje_hepatitis_b BOOLEAN DEFAULT FALSE;
ALTER TABLE control_prenatal ADD COLUMN IF NOT EXISTS tamizaje_sifilis BOOLEAN DEFAULT FALSE;
ALTER TABLE control_prenatal ADD COLUMN IF NOT EXISTS consulta_nutricion BOOLEAN DEFAULT FALSE;
ALTER TABLE control_prenatal ADD COLUMN IF NOT EXISTS consulta_odontologia BOOLEAN DEFAULT FALSE;
ALTER TABLE control_prenatal ADD COLUMN IF NOT EXISTS ecografia_aneuploidias BOOLEAN DEFAULT FALSE;
ALTER TABLE control_prenatal ADD COLUMN IF NOT EXISTS ecografia_detalle_anatomico BOOLEAN DEFAULT FALSE;
ALTER TABLE control_prenatal ADD COLUMN IF NOT EXISTS visita_domiciliaria BOOLEAN DEFAULT FALSE;

-- Crear índices para mejorar performance de reportes
CREATE INDEX IF NOT EXISTS idx_gestantes_edad ON gestantes(edad);
CREATE INDEX IF NOT EXISTS idx_gestantes_poblacion_etnica ON gestantes(poblacion_etnica);
CREATE INDEX IF NOT EXISTS idx_gestantes_fecha_ingreso ON gestantes(fecha_ingreso_control);
CREATE INDEX IF NOT EXISTS idx_control_prenatal_fecha ON control_prenatal(fecha_control);
CREATE INDEX IF NOT EXISTS idx_control_prenatal_gestante ON control_prenatal(gestante_id);

-- Actualizar edad basada en fecha de nacimiento para registros existentes
UPDATE gestantes 
SET edad = EXTRACT(YEAR FROM AGE(CURRENT_DATE, fecha_nacimiento))
WHERE edad IS NULL AND fecha_nacimiento IS NOT NULL;

-- Actualizar fecha_ingreso_control con la fecha del primer control si no existe
UPDATE gestantes 
SET fecha_ingreso_control = (
    SELECT MIN(fecha_control)::DATE 
    FROM control_prenatal 
    WHERE control_prenatal.gestante_id = gestantes.id
)
WHERE fecha_ingreso_control IS NULL;