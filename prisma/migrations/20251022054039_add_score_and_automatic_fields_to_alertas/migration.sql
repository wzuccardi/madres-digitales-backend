-- AlterTable
ALTER TABLE "alertas" ADD COLUMN     "es_automatica" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "score_riesgo" INTEGER;
