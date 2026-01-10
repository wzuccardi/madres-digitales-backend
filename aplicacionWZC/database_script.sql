-- =====================================================
-- SCRIPT DE BASE DE DATOS - MADRES DIGITALES
-- Basado en el schema de Prisma usado en Vercel
-- PostgreSQL Database
-- =====================================================

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLA: municipios
-- =====================================================
CREATE TABLE municipios (
    id VARCHAR PRIMARY KEY,
    nombre VARCHAR NOT NULL,
    departamento VARCHAR NOT NULL,
    codigo_dane VARCHAR,
    latitud DECIMAL(10, 8),
    longitud DECIMAL(11, 8),
    poblacion INTEGER,
    area_km2 DECIMAL(10, 2),
    altitud_msnm INTEGER,
    es_capital BOOLEAN DEFAULT false,
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- TABLA: usuarios
-- =====================================================
CREATE TABLE usuarios (
    id VARCHAR PRIMARY KEY,
    nombre VARCHAR NOT NULL,
    email VARCHAR UNIQUE NOT NULL,
    password_hash VARCHAR NOT NULL,
    documento VARCHAR,
    tipo_documento VARCHAR DEFAULT 'cedula',
    rol VARCHAR NOT NULL,
    municipio_id VARCHAR,
    telefono VARCHAR,
    activo BOOLEAN DEFAULT true,
    ultimo_acceso TIMESTAMP,
    refresh_token VARCHAR,
    fecha_creacion TIMESTAMP DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP DEFAULT NOW(),
    
    FOREIGN KEY (municipio_id) REFERENCES municipios(id)
);

-- =====================================================
-- TABLA: ips
-- =====================================================
CREATE TABLE ips (
    id VARCHAR PRIMARY KEY,
    nombre VARCHAR NOT NULL,
    nit VARCHAR,
    telefono VARCHAR,
    direccion VARCHAR,
    municipio_id VARCHAR,
    nivel VARCHAR,
    email VARCHAR,
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP DEFAULT NOW(),
    latitud DECIMAL(10, 8),
    longitud DECIMAL(11, 8),
    
    FOREIGN KEY (municipio_id) REFERENCES municipios(id)
);

-- =====================================================
-- TABLA: medicos
-- =====================================================
CREATE TABLE medicos (
    id VARCHAR PRIMARY KEY,
    nombre VARCHAR NOT NULL,
    documento VARCHAR,
    telefono VARCHAR,
    especialidad VARCHAR,
    email VARCHAR,
    registro_medico VARCHAR,
    ips_id VARCHAR,
    municipio_id VARCHAR,
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP DEFAULT NOW(),
    tipo_documento VARCHAR DEFAULT 'cedula',
    
    FOREIGN KEY (ips_id) REFERENCES ips(id),
    FOREIGN KEY (municipio_id) REFERENCES municipios(id)
);

-- =====================================================
-- TABLA: gestantes
-- =====================================================
CREATE TABLE gestantes (
    id VARCHAR PRIMARY KEY,
    documento VARCHAR,
    tipo_documento VARCHAR,
    nombre VARCHAR NOT NULL,
    fecha_nacimiento TIMESTAMP NOT NULL,
    telefono VARCHAR,
    direccion VARCHAR,
    coordenadas JSON,
    fecha_ultima_menstruacion TIMESTAMP,
    fecha_probable_parto TIMESTAMP,
    eps VARCHAR,
    regimen_salud VARCHAR NOT NULL,
    municipio_id VARCHAR,
    madrina_id VARCHAR,
    medico_tratante_id VARCHAR,
    ips_asignada_id VARCHAR,
    activa BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP DEFAULT NOW(),
    riesgo_alto BOOLEAN DEFAULT false,
    
    FOREIGN KEY (municipio_id) REFERENCES municipios(id),
    FOREIGN KEY (madrina_id) REFERENCES usuarios(id),
    FOREIGN KEY (medico_tratante_id) REFERENCES medicos(id),
    FOREIGN KEY (ips_asignada_id) REFERENCES ips(id)
);

-- =====================================================
-- TABLA: control_prenatal
-- =====================================================
CREATE TABLE control_prenatal (
    id VARCHAR PRIMARY KEY,
    gestante_id VARCHAR NOT NULL,
    medico_id VARCHAR,
    fecha_control TIMESTAMP NOT NULL,
    semanas_gestacion INTEGER,
    peso FLOAT,
    altura_uterina FLOAT,
    presion_sistolica INTEGER,
    presion_diastolica INTEGER,
    frecuencia_cardiaca INTEGER,
    frecuencia_respiratoria INTEGER,
    temperatura FLOAT,
    movimientos_fetales VARCHAR,
    edemas VARCHAR,
    proteinuria VARCHAR,
    glucosuria VARCHAR,
    hallazgos JSON,
    recomendaciones TEXT,
    proximo_control TIMESTAMP,
    realizado BOOLEAN DEFAULT false,
    observaciones TEXT,
    examenes_solicitados JSON,
    resultados_examenes JSON,
    fecha_creacion TIMESTAMP DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP DEFAULT NOW(),
    
    FOREIGN KEY (gestante_id) REFERENCES gestantes(id) ON DELETE CASCADE,
    FOREIGN KEY (medico_id) REFERENCES medicos(id)
);

-- =====================================================
-- TABLA: alertas
-- =====================================================
CREATE TABLE alertas (
    id VARCHAR PRIMARY KEY,
    gestante_id VARCHAR NOT NULL,
    madrina_id VARCHAR,
    medico_asignado_id VARCHAR,
    ips_derivada_id VARCHAR,
    tipo_alerta VARCHAR NOT NULL,
    nivel_prioridad VARCHAR NOT NULL,
    mensaje VARCHAR NOT NULL,
    sintomas JSON,
    coordenadas_alerta JSON,
    resuelta BOOLEAN DEFAULT false,
    fecha_resolucion TIMESTAMP,
    generado_por_id VARCHAR,
    fecha_creacion TIMESTAMP DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    estado VARCHAR DEFAULT 'pendiente',
    es_automatica BOOLEAN DEFAULT false,
    score_riesgo INTEGER,
    
    FOREIGN KEY (gestante_id) REFERENCES gestantes(id) ON DELETE CASCADE,
    FOREIGN KEY (madrina_id) REFERENCES usuarios(id)
);

-- =====================================================
-- TABLA: contactos_emergencia
-- =====================================================
CREATE TABLE contactos_emergencia (
    id VARCHAR PRIMARY KEY,
    gestante_id VARCHAR NOT NULL,
    nombre VARCHAR NOT NULL,
    parentesco VARCHAR,
    telefono VARCHAR NOT NULL,
    email VARCHAR,
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP DEFAULT NOW(),
    
    FOREIGN KEY (gestante_id) REFERENCES gestantes(id) ON DELETE CASCADE
);

-- =====================================================
-- TABLA: seguimiento_emergencia
-- =====================================================
CREATE TABLE seguimiento_emergencia (
    id VARCHAR PRIMARY KEY,
    alerta_id VARCHAR NOT NULL,
    gestante_id VARCHAR NOT NULL,
    tipo VARCHAR NOT NULL,
    estado VARCHAR NOT NULL,
    notificaciones_enviadas INTEGER DEFAULT 0,
    detalles_notificaciones JSON,
    observaciones TEXT,
    fecha_creacion TIMESTAMP DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP DEFAULT NOW(),
    
    FOREIGN KEY (alerta_id) REFERENCES alertas(id) ON DELETE CASCADE,
    FOREIGN KEY (gestante_id) REFERENCES gestantes(id) ON DELETE CASCADE
);

-- =====================================================
-- TABLA: contenidos
-- =====================================================
CREATE TABLE contenidos (
    id VARCHAR PRIMARY KEY,
    titulo VARCHAR NOT NULL,
    descripcion TEXT,
    categoria VARCHAR NOT NULL,
    url_contenido VARCHAR,
    url_imagen VARCHAR,
    duracion_minutos INTEGER,
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP DEFAULT NOW(),
    destacado BOOLEAN DEFAULT false,
    destacadoEnSemanaGestacion BOOLEAN DEFAULT false,
    nivel VARCHAR,
    semana_gestacion_fin INTEGER,
    semana_gestacion_inicio INTEGER,
    tags JSON,
    tipo VARCHAR NOT NULL,
    url_video VARCHAR
);

-- =====================================================
-- TABLA: progreso_contenido
-- =====================================================
CREATE TABLE progreso_contenido (
    id VARCHAR PRIMARY KEY,
    usuario_id VARCHAR NOT NULL,
    contenido_id VARCHAR NOT NULL,
    completado BOOLEAN DEFAULT false,
    porcentaje_progreso INTEGER DEFAULT 0,
    tiempo_visto INTEGER,
    fecha_inicio TIMESTAMP,
    fecha_completado TIMESTAMP,
    fecha_creacion TIMESTAMP DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP DEFAULT NOW(),
    
    FOREIGN KEY (contenido_id) REFERENCES contenidos(id) ON DELETE CASCADE,
    UNIQUE(usuario_id, contenido_id)
);

-- =====================================================
-- TABLA: refresh_tokens
-- =====================================================
CREATE TABLE refresh_tokens (
    id VARCHAR PRIMARY KEY,
    token VARCHAR UNIQUE NOT NULL,
    usuario_id VARCHAR NOT NULL,
    device_id VARCHAR,
    expires_at TIMESTAMP NOT NULL,
    revoked BOOLEAN DEFAULT false,
    revoked_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- TABLA: dispositivos
-- =====================================================
CREATE TABLE dispositivos (
    id VARCHAR PRIMARY KEY,
    usuario_id VARCHAR NOT NULL,
    device_id VARCHAR UNIQUE NOT NULL,
    device_name VARCHAR,
    platform VARCHAR,
    app_version VARCHAR,
    last_sync TIMESTAMP,
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- TABLA: sync_logs
-- =====================================================
CREATE TABLE sync_logs (
    id VARCHAR PRIMARY KEY,
    usuario_id VARCHAR,
    device_id VARCHAR,
    tipo_operacion VARCHAR NOT NULL,
    entidad VARCHAR NOT NULL,
    entidad_id VARCHAR,
    estado VARCHAR NOT NULL,
    detalles JSON,
    error_message TEXT,
    fecha_inicio TIMESTAMP DEFAULT NOW(),
    fecha_fin TIMESTAMP,
    duracion_ms INTEGER
);

-- =====================================================
-- TABLA: sync_queue
-- =====================================================
CREATE TABLE sync_queue (
    id VARCHAR PRIMARY KEY,
    usuario_id VARCHAR NOT NULL,
    device_id VARCHAR NOT NULL,
    entidad VARCHAR NOT NULL,
    entidad_id VARCHAR NOT NULL,
    operacion VARCHAR NOT NULL,
    datos JSON NOT NULL,
    prioridad INTEGER DEFAULT 1,
    intentos INTEGER DEFAULT 0,
    max_intentos INTEGER DEFAULT 3,
    estado VARCHAR DEFAULT 'pending',
    error_message TEXT,
    fecha_creacion TIMESTAMP DEFAULT NOW(),
    fecha_procesamiento TIMESTAMP
);

-- =====================================================
-- TABLA: sync_conflicts
-- =====================================================
CREATE TABLE sync_conflicts (
    id VARCHAR PRIMARY KEY,
    entidad VARCHAR NOT NULL,
    entidad_id VARCHAR NOT NULL,
    usuario_id VARCHAR NOT NULL,
    device_id VARCHAR NOT NULL,
    datos_local JSON NOT NULL,
    datos_servidor JSON NOT NULL,
    tipo_conflicto VARCHAR NOT NULL,
    estado VARCHAR DEFAULT 'pending',
    resolucion JSON,
    fecha_creacion TIMESTAMP DEFAULT NOW(),
    fecha_resolucion TIMESTAMP
);

-- =====================================================
-- TABLA: entity_versions
-- =====================================================
CREATE TABLE entity_versions (
    id VARCHAR PRIMARY KEY,
    entidad VARCHAR NOT NULL,
    entidad_id VARCHAR NOT NULL,
    version INTEGER DEFAULT 1,
    checksum VARCHAR,
    fecha_creacion TIMESTAMP DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(entidad, entidad_id)
);

-- =====================================================
-- TABLA: conversaciones
-- =====================================================
CREATE TABLE conversaciones (
    id VARCHAR PRIMARY KEY,
    tipo VARCHAR NOT NULL,
    nombre VARCHAR,
    descripcion TEXT,
    participantes JSON NOT NULL,
    activa BOOLEAN DEFAULT true,
    ultimo_mensaje_id VARCHAR,
    fecha_ultimo_mensaje TIMESTAMP,
    fecha_creacion TIMESTAMP DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- TABLA: mensajes
-- =====================================================
CREATE TABLE mensajes (
    id VARCHAR PRIMARY KEY,
    conversacion_id VARCHAR NOT NULL,
    remitente_id VARCHAR NOT NULL,
    contenido TEXT NOT NULL,
    tipo VARCHAR DEFAULT 'texto',
    archivo_url VARCHAR,
    metadata JSON,
    leido BOOLEAN DEFAULT false,
    fecha_lectura TIMESTAMP,
    fecha_creacion TIMESTAMP DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP DEFAULT NOW(),
    
    FOREIGN KEY (conversacion_id) REFERENCES conversaciones(id) ON DELETE CASCADE
);

-- =====================================================
-- TABLA: zonas_cobertura
-- =====================================================
CREATE TABLE zonas_cobertura (
    id VARCHAR PRIMARY KEY,
    nombre VARCHAR NOT NULL,
    descripcion TEXT,
    tipo VARCHAR NOT NULL,
    centro_latitud DECIMAL(10, 8),
    centro_longitud DECIMAL(11, 8),
    radio_km FLOAT,
    coordenadas_poligono JSON,
    municipio_id VARCHAR,
    activa BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP DEFAULT NOW(),
    
    FOREIGN KEY (municipio_id) REFERENCES municipios(id)
);

-- =====================================================
-- TABLA: logs
-- =====================================================
CREATE TABLE logs (
    id VARCHAR PRIMARY KEY,
    tipo VARCHAR NOT NULL,
    mensaje TEXT NOT NULL,
    datos JSON,
    nivel VARCHAR NOT NULL,
    usuario_id VARCHAR,
    fecha_creacion TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices para usuarios
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);
CREATE INDEX idx_usuarios_activo ON usuarios(activo);

-- Índices para gestantes
CREATE INDEX idx_gestantes_activa ON gestantes(activa);
CREATE INDEX idx_gestantes_municipio ON gestantes(municipio_id);
CREATE INDEX idx_gestantes_madrina ON gestantes(madrina_id);
CREATE INDEX idx_gestantes_medico ON gestantes(medico_tratante_id);
CREATE INDEX idx_gestantes_ips ON gestantes(ips_asignada_id);
CREATE INDEX idx_gestantes_riesgo_alto ON gestantes(riesgo_alto);

-- Índices para control_prenatal
CREATE INDEX idx_control_gestante ON control_prenatal(gestante_id);
CREATE INDEX idx_control_fecha ON control_prenatal(fecha_control);
CREATE INDEX idx_control_realizado ON control_prenatal(realizado);
CREATE INDEX idx_control_medico ON control_prenatal(medico_id);

-- Índices para alertas
CREATE INDEX idx_alertas_gestante ON alertas(gestante_id);
CREATE INDEX idx_alertas_resuelta ON alertas(resuelta);
CREATE INDEX idx_alertas_tipo ON alertas(tipo_alerta);
CREATE INDEX idx_alertas_prioridad ON alertas(nivel_prioridad);
CREATE INDEX idx_alertas_fecha ON alertas(fecha_creacion);

-- Índices para contenidos
CREATE INDEX idx_contenidos_activo ON contenidos(activo);
CREATE INDEX idx_contenidos_categoria ON contenidos(categoria);
CREATE INDEX idx_contenidos_tipo ON contenidos(tipo);
CREATE INDEX idx_contenidos_destacado ON contenidos(destacado);

-- Índices para municipios
CREATE INDEX idx_municipios_activo ON municipios(activo);
CREATE INDEX idx_municipios_departamento ON municipios(departamento);

-- Índices para ips
CREATE INDEX idx_ips_activo ON ips(activo);
CREATE INDEX idx_ips_municipio ON ips(municipio_id);

-- Índices para medicos
CREATE INDEX idx_medicos_activo ON medicos(activo);
CREATE INDEX idx_medicos_ips ON medicos(ips_id);
CREATE INDEX idx_medicos_municipio ON medicos(municipio_id);

-- =====================================================
-- TRIGGERS PARA ACTUALIZACIÓN AUTOMÁTICA DE TIMESTAMPS
-- =====================================================

-- Función para actualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger a todas las tablas con fecha_actualizacion
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_municipios_updated_at BEFORE UPDATE ON municipios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ips_updated_at BEFORE UPDATE ON ips FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_medicos_updated_at BEFORE UPDATE ON medicos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gestantes_updated_at BEFORE UPDATE ON gestantes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_control_prenatal_updated_at BEFORE UPDATE ON control_prenatal FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_alertas_updated_at BEFORE UPDATE ON alertas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contactos_emergencia_updated_at BEFORE UPDATE ON contactos_emergencia FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_seguimiento_emergencia_updated_at BEFORE UPDATE ON seguimiento_emergencia FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contenidos_updated_at BEFORE UPDATE ON contenidos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_progreso_contenido_updated_at BEFORE UPDATE ON progreso_contenido FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dispositivos_updated_at BEFORE UPDATE ON dispositivos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_entity_versions_updated_at BEFORE UPDATE ON entity_versions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conversaciones_updated_at BEFORE UPDATE ON conversaciones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mensajes_updated_at BEFORE UPDATE ON mensajes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_zonas_cobertura_updated_at BEFORE UPDATE ON zonas_cobertura FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMENTARIOS EN TABLAS
-- =====================================================

COMMENT ON TABLE usuarios IS 'Tabla de usuarios del sistema (madrinas, médicos, administradores)';
COMMENT ON TABLE municipios IS 'Tabla de municipios de cobertura del programa';
COMMENT ON TABLE ips IS 'Tabla de Instituciones Prestadoras de Servicios de Salud';
COMMENT ON TABLE medicos IS 'Tabla de médicos del programa';
COMMENT ON TABLE gestantes IS 'Tabla principal de gestantes del programa';
COMMENT ON TABLE control_prenatal IS 'Tabla de controles prenatales realizados';
COMMENT ON TABLE alertas IS 'Tabla de alertas médicas y de emergencia';
COMMENT ON TABLE contactos_emergencia IS 'Tabla de contactos de emergencia de las gestantes';
COMMENT ON TABLE seguimiento_emergencia IS 'Tabla de seguimiento de emergencias';
COMMENT ON TABLE contenidos IS 'Tabla de contenidos educativos';
COMMENT ON TABLE progreso_contenido IS 'Tabla de progreso de contenidos por usuario';

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================