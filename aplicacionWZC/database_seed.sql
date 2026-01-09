-- =====================================================
-- SCRIPT DE DATOS DE EJEMPLO - MADRES DIGITALES
-- Datos de prueba para poblar la base de datos
-- =====================================================

-- =====================================================
-- DATOS: municipios
-- =====================================================
INSERT INTO municipios (id, nombre, departamento, codigo_dane, latitud, longitud, poblacion, area_km2, altitud_msnm, es_capital, activo) VALUES
('cmh1injy2000181kjhefzdneb', 'ARJONA', 'BOLÍVAR', '13052', 10.2547, -75.3428, 85952, 608.5, 151, false, true),
('cmh1injy2000281kjhefzdnec', 'CARTAGENA', 'BOLÍVAR', '13001', 10.3910, -75.4794, 1028736, 609.1, 2, true, true),
('cmh1injy2000381kjhefzdned', 'TURBACO', 'BOLÍVAR', '13836', 10.3297, -75.4236, 118898, 158.6, 108, false, true),
('cmh1injy2000481kjhefzdnee', 'MAGANGUÉ', 'BOLÍVAR', '13430', 9.2417, -74.7542, 123516, 1666.8, 13, false, true);

-- =====================================================
-- DATOS: usuarios
-- =====================================================
INSERT INTO usuarios (id, nombre, email, password_hash, documento, tipo_documento, rol, municipio_id, telefono, activo) VALUES
('admin-001', 'Administrador Sistema', 'admin@madresdigitales.com', '$2b$10$hash_example', '12345678', 'cedula', 'super_admin', 'cmh1injy2000281kjhefzdnec', '3001234567', true),
('madrina-001', 'María González', 'maria.gonzalez@madresdigitales.com', '$2b$10$hash_example', '23456789', 'cedula', 'madrina', 'cmh1injy2000181kjhefzdneb', '3002345678', true),
('medico-001', 'Dr. Carlos Pérez', 'carlos.perez@hospital.com', '$2b$10$hash_example', '34567890', 'cedula', 'medico', 'cmh1injy2000281kjhefzdnec', '3003456789', true);

-- =====================================================
-- DATOS: ips
-- =====================================================
INSERT INTO ips (id, nombre, nit, telefono, direccion, municipio_id, nivel, email, activo, latitud, longitud) VALUES
('cmh1injy2000181kjhefzdneb', 'MataSano', '789654123', '65478912', 'las piedras', 'cmh1injy2000181kjhefzdneb', 'primario', 'matasano@gmail.com', true, 10.4454207, -75.51764312),
('ips-002', 'Hospital Universitario del Caribe', '900123456', '6756789', 'Calle 29 No. 50-50', 'cmh1injy2000281kjhefzdnec', 'terciario', 'huc@hospital.com', true, 10.3910, -75.4794),
('ips-003', 'Centro de Salud Turbaco', '800234567', '6567890', 'Carrera 21 No. 15-30', 'cmh1injy2000381kjhefzdned', 'primario', 'salud@turbaco.gov.co', true, 10.3297, -75.4236);

-- =====================================================
-- DATOS: medicos
-- =====================================================
INSERT INTO medicos (id, nombre, documento, telefono, especialidad, email, registro_medico, ips_id, municipio_id, activo) VALUES
('medico-001', 'Dr. Carlos Pérez', '34567890', '3003456789', 'Ginecología', 'carlos.perez@hospital.com', 'RM-12345', 'ips-002', 'cmh1injy2000281kjhefzdnec', true),
('medico-002', 'Dra. Ana Rodríguez', '45678901', '3004567890', 'Medicina General', 'ana.rodriguez@matasano.com', 'RM-23456', 'cmh1injy2000181kjhefzdneb', 'cmh1injy2000181kjhefzdneb', true),
('medico-003', 'Dr. Luis Martínez', '56789012', '3005678901', 'Obstetricia', 'luis.martinez@turbaco.com', 'RM-34567', 'ips-003', 'cmh1injy2000381kjhefzdned', true);

-- =====================================================
-- DATOS: gestantes
-- =====================================================
INSERT INTO gestantes (id, documento, tipo_documento, nombre, fecha_nacimiento, telefono, direccion, fecha_ultima_menstruacion, fecha_probable_parto, eps, regimen_salud, municipio_id, madrina_id, medico_tratante_id, ips_asignada_id, activa, riesgo_alto) VALUES
('cmh1dudh10001ort4r7212qu4', '459874562', 'cedula', 'Kathiuska', '1999-03-15', '3005689745', 'Barrio Las Flores, Calle 12 #45-67', '2024-07-15', '2025-04-22', 'Sanitas', 'contributivo', 'cmh1injy2000381kjhefzdned', 'madrina-001', null, 'cmh1injy2000181kjhefzdneb', true, false),
('gestante-002', '567890123', 'cedula', 'Carmen López', '1995-08-20', '3006789012', 'Barrio Centro, Carrera 15 #23-45', '2024-06-01', '2025-03-08', 'Nueva EPS', 'contributivo', 'cmh1injy2000281kjhefzdnec', 'madrina-001', 'medico-001', 'ips-002', true, true),
('gestante-003', '678901234', 'cedula', 'Sofía Herrera', '2001-12-10', '3007890123', 'Barrio San José, Calle 8 #12-34', '2024-08-10', '2025-05-17', 'Coomeva', 'contributivo', 'cmh1injy2000181kjhefzdneb', 'madrina-001', 'medico-002', 'cmh1injy2000181kjhefzdneb', true, false);

-- =====================================================
-- DATOS: control_prenatal
-- =====================================================
INSERT INTO control_prenatal (id, gestante_id, medico_id, fecha_control, semanas_gestacion, peso, altura_uterina, presion_sistolica, presion_diastolica, frecuencia_cardiaca, temperatura, recomendaciones, proximo_control, realizado, observaciones) VALUES
('control-001', 'gestante-002', 'medico-001', '2024-10-15 10:00:00', 18, 65.5, 18.0, 120, 80, 72, 36.5, 'Continuar con vitaminas prenatales. Aumentar ingesta de hierro.', '2024-11-15 10:00:00', true, 'Control normal, gestante en buen estado'),
('control-002', 'gestante-003', 'medico-002', '2024-10-20 14:30:00', 12, 58.2, 12.5, 110, 70, 68, 36.2, 'Iniciar suplementación con ácido fólico.', '2024-11-20 14:30:00', true, 'Primera consulta prenatal'),
('control-003', 'cmh1dudh10001ort4r7212qu4', null, '2024-11-01 09:00:00', 16, 62.0, 16.0, 115, 75, 70, 36.3, 'Programar ecografía morfológica.', '2024-12-01 09:00:00', false, 'Control programado');

-- =====================================================
-- DATOS: alertas
-- =====================================================
INSERT INTO alertas (id, gestante_id, madrina_id, tipo_alerta, nivel_prioridad, mensaje, resuelta, estado, es_automatica) VALUES
('alerta-001', 'gestante-002', 'madrina-001', 'medica', 'alta', 'Gestante presenta síntomas de preeclampsia. Requiere atención médica inmediata.', false, 'pendiente', false),
('alerta-002', 'gestante-003', 'madrina-001', 'control', 'media', 'Control prenatal vencido. Última cita hace 6 semanas.', true, 'resuelta', true),
('alerta-003', 'cmh1dudh10001ort4r7212qu4', 'madrina-001', 'recordatorio', 'baja', 'Recordatorio: Próximo control prenatal en 3 días.', false, 'pendiente', true);

-- =====================================================
-- DATOS: contactos_emergencia
-- =====================================================
INSERT INTO contactos_emergencia (id, gestante_id, nombre, parentesco, telefono, email, activo) VALUES
('contacto-001', 'gestante-002', 'Juan López', 'esposo', '3008901234', 'juan.lopez@email.com', true),
('contacto-002', 'gestante-002', 'Rosa López', 'madre', '3009012345', 'rosa.lopez@email.com', true),
('contacto-003', 'gestante-003', 'Miguel Herrera', 'esposo', '3010123456', 'miguel.herrera@email.com', true),
('contacto-004', 'cmh1dudh10001ort4r7212qu4', 'Pedro Martínez', 'esposo', '3011234567', 'pedro.martinez@email.com', true);

-- =====================================================
-- DATOS: contenidos
-- =====================================================
INSERT INTO contenidos (id, titulo, descripcion, categoria, tipo, url_contenido, url_imagen, duracion_minutos, activo, destacado, nivel, semana_gestacion_inicio, semana_gestacion_fin, tags) VALUES
('contenido-001', 'Alimentación durante el embarazo', 'Guía completa sobre nutrición prenatal y alimentos recomendados', 'NUTRICION', 'articulo', 'https://contenido.com/nutricion-embarazo', 'https://img.com/nutricion.jpg', 15, true, true, 'basico', 1, 40, '["nutricion", "embarazo", "alimentacion"]'),
('contenido-002', 'Ejercicios seguros en el embarazo', 'Rutina de ejercicios recomendados para gestantes', 'EJERCICIO', 'video', 'https://contenido.com/ejercicios-embarazo', 'https://img.com/ejercicios.jpg', 20, true, false, 'intermedio', 12, 36, '["ejercicio", "actividad_fisica", "salud"]'),
('contenido-003', 'Preparación para el parto', 'Técnicas de respiración y relajación para el trabajo de parto', 'PARTO', 'video', 'https://contenido.com/preparacion-parto', 'https://img.com/parto.jpg', 25, true, true, 'avanzado', 28, 40, '["parto", "respiracion", "relajacion"]'),
('contenido-004', 'Cuidados del recién nacido', 'Guía básica para el cuidado del bebé en sus primeros días', 'CUIDADOS', 'articulo', 'https://contenido.com/cuidados-bebe', 'https://img.com/bebe.jpg', 18, true, false, 'basico', 35, 40, '["recien_nacido", "cuidados", "lactancia"]');

-- =====================================================
-- DATOS: progreso_contenido
-- =====================================================
INSERT INTO progreso_contenido (id, usuario_id, contenido_id, completado, porcentaje_progreso, tiempo_visto, fecha_inicio, fecha_completado) VALUES
('progreso-001', 'gestante-002', 'contenido-001', true, 100, 15, '2024-10-01 10:00:00', '2024-10-01 10:15:00'),
('progreso-002', 'gestante-002', 'contenido-002', false, 60, 12, '2024-10-05 14:00:00', null),
('progreso-003', 'gestante-003', 'contenido-001', true, 100, 15, '2024-10-03 16:00:00', '2024-10-03 16:15:00'),
('progreso-004', 'cmh1dudh10001ort4r7212qu4', 'contenido-003', false, 30, 8, '2024-10-10 11:00:00', null);

-- =====================================================
-- DATOS: conversaciones
-- =====================================================
INSERT INTO conversaciones (id, tipo, nombre, descripcion, participantes, activa) VALUES
('conv-001', 'individual', 'Chat con Madrina María', 'Conversación entre gestante y madrina', '["gestante-002", "madrina-001"]', true),
('conv-002', 'grupal', 'Grupo Gestantes Octubre', 'Grupo de apoyo para gestantes', '["gestante-002", "gestante-003", "cmh1dudh10001ort4r7212qu4", "madrina-001"]', true);

-- =====================================================
-- DATOS: mensajes
-- =====================================================
INSERT INTO mensajes (id, conversacion_id, remitente_id, contenido, tipo, leido, fecha_creacion) VALUES
('msg-001', 'conv-001', 'madrina-001', '¡Hola Carmen! ¿Cómo te sientes hoy?', 'texto', true, '2024-10-25 09:00:00'),
('msg-002', 'conv-001', 'gestante-002', 'Hola María, me siento bien. Un poco de náuseas en la mañana.', 'texto', true, '2024-10-25 09:15:00'),
('msg-003', 'conv-002', 'madrina-001', 'Buenos días chicas, ¿cómo van con los ejercicios de respiración?', 'texto', false, '2024-10-25 10:00:00');

-- =====================================================
-- DATOS: zonas_cobertura
-- =====================================================
INSERT INTO zonas_cobertura (id, nombre, descripcion, tipo, centro_latitud, centro_longitud, radio_km, municipio_id, activa) VALUES
('zona-001', 'Centro Cartagena', 'Zona centro de Cartagena', 'circular', 10.3910, -75.4794, 5.0, 'cmh1injy2000281kjhefzdnec', true),
('zona-002', 'Arjona Rural', 'Zona rural de Arjona', 'circular', 10.2547, -75.3428, 10.0, 'cmh1injy2000181kjhefzdneb', true),
('zona-003', 'Turbaco Urbano', 'Zona urbana de Turbaco', 'circular', 10.3297, -75.4236, 3.0, 'cmh1injy2000381kjhefzdned', true);

-- =====================================================
-- DATOS: logs (ejemplos)
-- =====================================================
INSERT INTO logs (id, tipo, mensaje, nivel, usuario_id, fecha_creacion) VALUES
('log-001', 'auth', 'Usuario admin@madresdigitales.com inició sesión', 'info', 'admin-001', '2024-10-25 08:00:00'),
('log-002', 'alerta', 'Nueva alerta médica creada para gestante Carmen López', 'warning', 'madrina-001', '2024-10-25 10:30:00'),
('log-003', 'control', 'Control prenatal completado para gestante Sofía Herrera', 'info', 'medico-002', '2024-10-25 14:30:00');

-- =====================================================
-- ACTUALIZAR SECUENCIAS Y CONTADORES
-- =====================================================

-- Actualizar estadísticas de tablas
ANALYZE usuarios;
ANALYZE municipios;
ANALYZE ips;
ANALYZE medicos;
ANALYZE gestantes;
ANALYZE control_prenatal;
ANALYZE alertas;
ANALYZE contenidos;
ANALYZE conversaciones;
ANALYZE mensajes;

-- =====================================================
-- FIN DEL SCRIPT DE DATOS
-- =====================================================