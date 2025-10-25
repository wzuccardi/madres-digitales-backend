/*
  Warnings:

  - You are about to drop the column `tipo_contenido` on the `contenidos` table. All the data in the column will be lost.
  - Added the required column `tipo` to the `contenidos` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "alerta_tipo" AS ENUM ('SOS', 'MEDICA', 'CONTROL', 'RECORDATORIO', 'HIPERTENSION', 'PREECLAMPSIA', 'DIABETES', 'SANGRADO', 'CONTRACCIONES', 'FALTA_MOVIMIENTO_FETAL');

-- CreateEnum
CREATE TYPE "prioridad_nivel" AS ENUM ('BAJA', 'MEDIA', 'ALTA', 'CRITICA');

-- CreateEnum
CREATE TYPE "tipo_contenido" AS ENUM ('VIDEO', 'ARTICULO', 'INFOGRAFIA', 'PODCAST', 'EJERCICIO', 'RECETA');

-- CreateEnum
CREATE TYPE "categoria_contenido" AS ENUM ('NUTRICION', 'EJERCICIO', 'CUIDADOS_PRENATALES', 'PREPARACION_PARTO', 'LACTANCIA', 'CUIDADOS_BEBE', 'SALUD_MENTAL', 'EMERGENCIAS');

-- CreateEnum
CREATE TYPE "nivel_dificultad" AS ENUM ('BASICO', 'INTERMEDIO', 'AVANZADO');

-- AlterTable
ALTER TABLE "alertas" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "estado" TEXT DEFAULT 'pendiente';

-- AlterTable
ALTER TABLE "contenidos" DROP COLUMN "tipo_contenido",
ADD COLUMN     "destacado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "destacadoEnSemanaGestacion" BOOLEAN DEFAULT false,
ADD COLUMN     "nivel" TEXT,
ADD COLUMN     "semana_gestacion_fin" INTEGER,
ADD COLUMN     "semana_gestacion_inicio" INTEGER,
ADD COLUMN     "tags" JSONB,
ADD COLUMN     "tipo" TEXT NOT NULL,
ADD COLUMN     "url_video" TEXT;

-- AlterTable
ALTER TABLE "gestantes" ADD COLUMN     "riesgo_alto" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "progreso_contenido" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "contenido_id" TEXT NOT NULL,
    "completado" BOOLEAN NOT NULL DEFAULT false,
    "porcentaje_progreso" INTEGER NOT NULL DEFAULT 0,
    "tiempo_visto" INTEGER,
    "fecha_inicio" TIMESTAMP(3),
    "fecha_completado" TIMESTAMP(3),
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "progreso_contenido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "control_prenatal" (
    "id" TEXT NOT NULL,
    "gestante_id" TEXT NOT NULL,
    "medico_id" TEXT,
    "fecha_control" TIMESTAMP(3) NOT NULL,
    "semanas_gestacion" INTEGER,
    "peso" DOUBLE PRECISION,
    "altura_uterina" DOUBLE PRECISION,
    "presion_sistolica" INTEGER,
    "presion_diastolica" INTEGER,
    "frecuencia_cardiaca" INTEGER,
    "frecuencia_respiratoria" INTEGER,
    "temperatura" DOUBLE PRECISION,
    "movimientos_fetales" TEXT,
    "edemas" TEXT,
    "proteinuria" TEXT,
    "glucosuria" TEXT,
    "hallazgos" JSONB,
    "recomendaciones" TEXT,
    "proximo_control" TIMESTAMP(3),
    "realizado" BOOLEAN NOT NULL DEFAULT false,
    "observaciones" TEXT,
    "examenes_solicitados" JSONB,
    "resultados_examenes" JSONB,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "control_prenatal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "device_id" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dispositivos" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "device_id" TEXT NOT NULL,
    "device_name" TEXT,
    "platform" TEXT,
    "app_version" TEXT,
    "last_sync" TIMESTAMP(3),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dispositivos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sync_logs" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT,
    "device_id" TEXT,
    "tipo_operacion" TEXT NOT NULL,
    "entidad" TEXT NOT NULL,
    "entidad_id" TEXT,
    "estado" TEXT NOT NULL,
    "detalles" JSONB,
    "error_message" TEXT,
    "fecha_inicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_fin" TIMESTAMP(3),
    "duracion_ms" INTEGER,

    CONSTRAINT "sync_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sync_queue" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "device_id" TEXT NOT NULL,
    "entidad" TEXT NOT NULL,
    "entidad_id" TEXT NOT NULL,
    "operacion" TEXT NOT NULL,
    "datos" JSONB NOT NULL,
    "prioridad" INTEGER NOT NULL DEFAULT 1,
    "intentos" INTEGER NOT NULL DEFAULT 0,
    "max_intentos" INTEGER NOT NULL DEFAULT 3,
    "estado" TEXT NOT NULL DEFAULT 'pending',
    "error_message" TEXT,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_procesamiento" TIMESTAMP(3),

    CONSTRAINT "sync_queue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sync_conflicts" (
    "id" TEXT NOT NULL,
    "entidad" TEXT NOT NULL,
    "entidad_id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "device_id" TEXT NOT NULL,
    "datos_local" JSONB NOT NULL,
    "datos_servidor" JSONB NOT NULL,
    "tipo_conflicto" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'pending',
    "resolucion" JSONB,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_resolucion" TIMESTAMP(3),

    CONSTRAINT "sync_conflicts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entity_versions" (
    "id" TEXT NOT NULL,
    "entidad" TEXT NOT NULL,
    "entidad_id" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "checksum" TEXT,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "entity_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zonas_cobertura" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "tipo" TEXT NOT NULL,
    "centro_latitud" DECIMAL(10,8),
    "centro_longitud" DECIMAL(11,8),
    "radio_km" DOUBLE PRECISION,
    "coordenadas_poligono" JSONB,
    "municipio_id" TEXT,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "zonas_cobertura_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversaciones" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "nombre" TEXT,
    "descripcion" TEXT,
    "participantes" JSONB NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "ultimo_mensaje_id" TEXT,
    "fecha_ultimo_mensaje" TIMESTAMP(3),
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mensajes" (
    "id" TEXT NOT NULL,
    "conversacion_id" TEXT NOT NULL,
    "remitente_id" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'texto',
    "archivo_url" TEXT,
    "metadata" JSONB,
    "leido" BOOLEAN NOT NULL DEFAULT false,
    "fecha_lectura" TIMESTAMP(3),
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mensajes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "progreso_contenido_usuario_id_contenido_id_key" ON "progreso_contenido"("usuario_id", "contenido_id");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "dispositivos_device_id_key" ON "dispositivos"("device_id");

-- CreateIndex
CREATE UNIQUE INDEX "entity_versions_entidad_entidad_id_key" ON "entity_versions"("entidad", "entidad_id");

-- AddForeignKey
ALTER TABLE "progreso_contenido" ADD CONSTRAINT "progreso_contenido_contenido_id_fkey" FOREIGN KEY ("contenido_id") REFERENCES "contenidos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensajes" ADD CONSTRAINT "mensajes_conversacion_id_fkey" FOREIGN KEY ("conversacion_id") REFERENCES "conversaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;
