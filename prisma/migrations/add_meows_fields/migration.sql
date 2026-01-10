-- Agregar campos MEOWS al modelo control_prenatal
ALTER TABLE "control_prenatal" 
ADD COLUMN IF NOT EXISTS "meows_score" INTEGER,
ADD COLUMN IF NOT EXISTS "meows_alert_level" VARCHAR(20),
ADD COLUMN IF NOT EXISTS "meows_component_scores" JSONB,
ADD COLUMN IF NOT EXISTS "meows_triggered_alerts" JSONB,
ADD COLUMN IF NOT EXISTS "meows_recommendations" JSONB,
ADD COLUMN IF NOT EXISTS "nivel_conciencia" VARCHAR(50),
ADD COLUMN IF NOT EXISTS "sangrado_ml" FLOAT,
ADD COLUMN IF NOT EXISTS "sintomas_neurologicos" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "tiene_sepsis" BOOLEAN DEFAULT false;

-- Crear índice para búsquedas por nivel de alerta
CREATE INDEX IF NOT EXISTS "idx_control_prenatal_meows_alert" ON "control_prenatal"("meows_alert_level", "fecha_control");

-- Crear índice para búsquedas por score
CREATE INDEX IF NOT EXISTS "idx_control_prenatal_meows_score" ON "control_prenatal"("meows_score" DESC);
