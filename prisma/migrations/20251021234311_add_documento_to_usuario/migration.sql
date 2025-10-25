-- CreateTable
CREATE TABLE "municipios" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "departamento" TEXT NOT NULL,
    "codigo_dane" TEXT,
    "latitud" DECIMAL(10,8),
    "longitud" DECIMAL(11,8),
    "poblacion" INTEGER,
    "area_km2" DECIMAL(10,2),
    "altitud_msnm" INTEGER,
    "es_capital" BOOLEAN NOT NULL DEFAULT false,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "municipios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "documento" TEXT,
    "tipo_documento" TEXT DEFAULT 'cedula',
    "rol" TEXT NOT NULL,
    "municipio_id" TEXT,
    "telefono" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "ultimo_acceso" TIMESTAMP(3),
    "refresh_token" TEXT,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ips" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "nit" TEXT,
    "telefono" TEXT,
    "direccion" TEXT,
    "municipio_id" TEXT,
    "nivel" TEXT,
    "email" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medicos" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "documento" TEXT,
    "telefono" TEXT,
    "especialidad" TEXT,
    "email" TEXT,
    "registro_medico" TEXT,
    "ips_id" TEXT,
    "municipio_id" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gestantes" (
    "id" TEXT NOT NULL,
    "documento" TEXT,
    "tipo_documento" TEXT,
    "nombre" TEXT NOT NULL,
    "fecha_nacimiento" TIMESTAMP(3) NOT NULL,
    "telefono" TEXT,
    "direccion" TEXT,
    "coordenadas" JSONB,
    "fecha_ultima_menstruacion" TIMESTAMP(3),
    "fecha_probable_parto" TIMESTAMP(3),
    "eps" TEXT,
    "regimen_salud" TEXT NOT NULL,
    "municipio_id" TEXT,
    "madrina_id" TEXT,
    "medico_tratante_id" TEXT,
    "ips_asignada_id" TEXT,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gestantes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "controles" (
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
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "controles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alertas" (
    "id" TEXT NOT NULL,
    "gestante_id" TEXT NOT NULL,
    "madrina_id" TEXT,
    "medico_asignado_id" TEXT,
    "ips_derivada_id" TEXT,
    "tipo_alerta" TEXT NOT NULL,
    "nivel_prioridad" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "sintomas" JSONB,
    "coordenadas_alerta" JSONB,
    "resuelta" BOOLEAN NOT NULL DEFAULT false,
    "fecha_resolucion" TIMESTAMP(3),
    "generado_por_id" TEXT,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alertas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contactos_emergencia" (
    "id" TEXT NOT NULL,
    "gestante_id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "parentesco" TEXT,
    "telefono" TEXT NOT NULL,
    "email" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contactos_emergencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seguimiento_emergencia" (
    "id" TEXT NOT NULL,
    "alerta_id" TEXT NOT NULL,
    "gestante_id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "notificaciones_enviadas" INTEGER NOT NULL DEFAULT 0,
    "detalles_notificaciones" JSONB,
    "observaciones" TEXT,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seguimiento_emergencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contenidos" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "tipo_contenido" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "url_contenido" TEXT,
    "url_imagen" TEXT,
    "duracion_minutos" INTEGER,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contenidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logs" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "datos" JSONB,
    "nivel" TEXT NOT NULL,
    "usuario_id" TEXT,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_municipio_id_fkey" FOREIGN KEY ("municipio_id") REFERENCES "municipios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ips" ADD CONSTRAINT "ips_municipio_id_fkey" FOREIGN KEY ("municipio_id") REFERENCES "municipios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medicos" ADD CONSTRAINT "medicos_ips_id_fkey" FOREIGN KEY ("ips_id") REFERENCES "ips"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medicos" ADD CONSTRAINT "medicos_municipio_id_fkey" FOREIGN KEY ("municipio_id") REFERENCES "municipios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gestantes" ADD CONSTRAINT "gestantes_municipio_id_fkey" FOREIGN KEY ("municipio_id") REFERENCES "municipios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gestantes" ADD CONSTRAINT "gestantes_madrina_id_fkey" FOREIGN KEY ("madrina_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gestantes" ADD CONSTRAINT "gestantes_medico_tratante_id_fkey" FOREIGN KEY ("medico_tratante_id") REFERENCES "medicos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gestantes" ADD CONSTRAINT "gestantes_ips_asignada_id_fkey" FOREIGN KEY ("ips_asignada_id") REFERENCES "ips"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "controles" ADD CONSTRAINT "controles_gestante_id_fkey" FOREIGN KEY ("gestante_id") REFERENCES "gestantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "controles" ADD CONSTRAINT "controles_medico_id_fkey" FOREIGN KEY ("medico_id") REFERENCES "medicos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alertas" ADD CONSTRAINT "alertas_gestante_id_fkey" FOREIGN KEY ("gestante_id") REFERENCES "gestantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alertas" ADD CONSTRAINT "alertas_madrina_id_fkey" FOREIGN KEY ("madrina_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contactos_emergencia" ADD CONSTRAINT "contactos_emergencia_gestante_id_fkey" FOREIGN KEY ("gestante_id") REFERENCES "gestantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seguimiento_emergencia" ADD CONSTRAINT "seguimiento_emergencia_alerta_id_fkey" FOREIGN KEY ("alerta_id") REFERENCES "alertas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seguimiento_emergencia" ADD CONSTRAINT "seguimiento_emergencia_gestante_id_fkey" FOREIGN KEY ("gestante_id") REFERENCES "gestantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
