-- AlterTable: Agregar campos de ubicación y contacto para SOS
ALTER TABLE "alertas" ADD COLUMN "ubicacion_lat" DOUBLE PRECISION,
ADD COLUMN "ubicacion_lng" DOUBLE PRECISION,
ADD COLUMN "ubicacion_precision" INTEGER,
ADD COLUMN "nombre_madrina" TEXT,
ADD COLUMN "telefono_madrina" TEXT,
ADD COLUMN "nombre_gestante" TEXT,
ADD COLUMN "telefono_gestante" TEXT,
ADD COLUMN "direccion_gestante" TEXT,
ADD COLUMN "municipio" TEXT;

-- CreateIndex: Índice para búsquedas por ubicación
CREATE INDEX "idx_alertas_ubicacion" ON "alertas"("ubicacion_lat", "ubicacion_lng");

-- CreateIndex: Índice para búsquedas por madrina
CREATE INDEX "idx_alertas_nombre_madrina" ON "alertas"("nombre_madrina");

-- CreateIndex: Índice para búsquedas por municipio
CREATE INDEX "idx_alertas_municipio" ON "alertas"("municipio");

