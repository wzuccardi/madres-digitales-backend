// missing-endpoints.js
// Endpoints CRUD faltantes para completar la API

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper functions
function getAuthUser(req) {
  const token = parseBearerToken(req);
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const payload = decodeBase64Url(parts[1]);
  if (!payload || !payload.email) return null;
  return payload;
}

function parseBearerToken(req) {
  const auth = req.get('Authorization') || '';
  const parts = auth.split(' ');
  if (parts.length === 2 && parts[0] === 'Bearer') return parts[1];
  return null;
}

function decodeBase64Url(str) {
  try {
    const pad = (s) => s + '='.repeat((4 - (s.length % 4)) % 4);
    const b64 = pad(str).replace(/-/g, '+').replace(/_/g, '/');
    const json = Buffer.from(b64, 'base64').toString('utf-8');
    return JSON.parse(json);
  } catch (_) {
    return null;
  }
}

const prismaRoleToFront = (r) => ({
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
  COORDINADOR: 'coordinador',
  MEDICO: 'medico',
  MADRINA: 'madrina',
}[r] || 'madrina');

// ==================== GESTANTES ====================

// PUT /api/gestantes/:id - Actualizar gestante
const updateGestante = async (req, res) => {
  try {
    const { id } = req.params;
    const authPayload = getAuthUser(req);
    if (!authPayload) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const {
      nombre,
      documento,
      telefono,
      municipio_id,
      direccion,
      eps,
      regimen_salud,
      fecha_nacimiento,
      fecha_probable_parto,
      fecha_ultima_menstruacion,
      riesgo_alto,
      activa,
      madrina_id,
      medico_tratante_id,
    } = req.body;

    const gestante = await prisma.gestantes.update({
      where: { id },
      data: {
        nombre,
        documento,
        telefono,
        municipio_id,
        direccion,
        eps,
        regimen_salud,
        fecha_nacimiento: fecha_nacimiento ? new Date(fecha_nacimiento) : undefined,
        fecha_probable_parto: fecha_probable_parto ? new Date(fecha_probable_parto) : undefined,
        fecha_ultima_menstruacion: fecha_ultima_menstruacion ? new Date(fecha_ultima_menstruacion) : undefined,
        riesgo_alto,
        activa,
        madrina_id,
        medico_tratante_id,
      },
    });

    console.log('✅ Gestante actualizada:', id);
    res.json({ success: true, data: gestante });
  } catch (error) {
    console.error('❌ Error actualizando gestante:', error);
    res.status(500).json({ success: false, error: 'Error actualizando gestante' });
  }
};

// DELETE /api/gestantes/:id - Eliminar gestante (soft delete)
const deleteGestante = async (req, res) => {
  try {
    const { id } = req.params;
    const authPayload = getAuthUser(req);
    if (!authPayload) return res.status(401).json({ success: false, error: 'Unauthorized' });

    // Soft delete - marcar como inactiva
    const gestante = await prisma.gestantes.update({
      where: { id },
      data: { activa: false },
    });

    console.log('✅ Gestante eliminada (soft delete):', id);
    res.json({ success: true, data: gestante });
  } catch (error) {
    console.error('❌ Error eliminando gestante:', error);
    res.status(500).json({ success: false, error: 'Error eliminando gestante' });
  }
};

// ==================== CONTROLES ====================

// POST /api/controles - Crear control básico
const createControl = async (req, res) => {
  try {
    const {
      gestante_id,
      fecha_control,
      semanas_gestacion,
      peso,
      altura_uterina,
      presion_sistolica,
      presion_diastolica,
      frecuencia_cardiaca,
      temperatura,
      movimientos_fetales,
      edemas,
      observaciones,
      recomendaciones,
    } = req.body;

    if (!gestante_id || !fecha_control) {
      return res.status(400).json({ success: false, error: 'gestante_id y fecha_control son requeridos' });
    }

    const id = `control_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
    const control = await prisma.control_prenatal.create({
      data: {
        id,
        gestante_id,
        fecha_control: new Date(fecha_control),
        semanas_gestacion: semanas_gestacion ? parseInt(semanas_gestacion) : null,
        peso: peso ? parseFloat(peso) : null,
        altura_uterina: altura_uterina ? parseFloat(altura_uterina) : null,
        presion_sistolica: presion_sistolica ? parseInt(presion_sistolica) : null,
        presion_diastolica: presion_diastolica ? parseInt(presion_diastolica) : null,
        frecuencia_cardiaca: frecuencia_cardiaca ? parseInt(frecuencia_cardiaca) : null,
        temperatura: temperatura ? parseFloat(temperatura) : null,
        movimientos_fetales,
        edemas,
        observaciones,
        recomendaciones,
        realizado: true,
      },
    });

    console.log('✅ Control prenatal creado:', id);
    res.status(201).json({ success: true, data: control });
  } catch (error) {
    console.error('❌ Error creando control:', error);
    res.status(500).json({ success: false, error: 'Error creando control' });
  }
};

// PUT /api/controles/:id - Actualizar control
const updateControl = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      fecha_control,
      semanas_gestacion,
      peso,
      altura_uterina,
      presion_sistolica,
      presion_diastolica,
      frecuencia_cardiaca,
      temperatura,
      movimientos_fetales,
      edemas,
      observaciones,
      recomendaciones,
    } = req.body;

    const control = await prisma.control_prenatal.update({
      where: { id },
      data: {
        fecha_control: fecha_control ? new Date(fecha_control) : undefined,
        semanas_gestacion: semanas_gestacion ? parseInt(semanas_gestacion) : undefined,
        peso: peso ? parseFloat(peso) : undefined,
        altura_uterina: altura_uterina ? parseFloat(altura_uterina) : undefined,
        presion_sistolica: presion_sistolica ? parseInt(presion_sistolica) : undefined,
        presion_diastolica: presion_diastolica ? parseInt(presion_diastolica) : undefined,
        frecuencia_cardiaca: frecuencia_cardiaca ? parseInt(frecuencia_cardiaca) : undefined,
        temperatura: temperatura ? parseFloat(temperatura) : undefined,
        movimientos_fetales,
        edemas,
        observaciones,
        recomendaciones,
      },
    });

    console.log('✅ Control actualizado:', id);
    res.json({ success: true, data: control });
  } catch (error) {
    console.error('❌ Error actualizando control:', error);
    res.status(500).json({ success: false, error: 'Error actualizando control' });
  }
};

// DELETE /api/controles/:id - Eliminar control
const deleteControl = async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.control_prenatal.delete({
      where: { id },
    });

    console.log('✅ Control eliminado:', id);
    res.json({ success: true, message: 'Control eliminado exitosamente' });
  } catch (error) {
    console.error('❌ Error eliminando control:', error);
    res.status(500).json({ success: false, error: 'Error eliminando control' });
  }
};

// ==================== ALERTAS ====================

// PUT /api/alertas/:id/leida - Marcar alerta como leída
const markAlertAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    
    const alerta = await prisma.alertas.update({
      where: { id },
      data: {
        resuelta: true,
        fecha_resolucion: new Date(),
        estado: 'resuelta',
      },
    });

    console.log('✅ Alerta marcada como leída:', id);
    res.json({ success: true, data: alerta });
  } catch (error) {
    console.error('❌ Error marcando alerta como leída:', error);
    res.status(500).json({ success: false, error: 'Error marcando alerta como leída' });
  }
};

// ==================== MÉDICOS ====================

// GET /api/medicos - Listar médicos
const listMedicos = async (req, res) => {
  try {
    const { page = 1, limit = 20, municipio_id } = req.query;
    const skip = (page - 1) * limit;

    const where = { activo: true };
    if (municipio_id) {
      where.municipio_id = municipio_id;
    }

    const [medicos, total] = await Promise.all([
      prisma.medicos.findMany({
        where,
        orderBy: { nombre: 'asc' },
        skip,
        take: Number(limit),
      }),
      prisma.medicos.count({ where }),
    ]);

    res.json({ success: true, data: medicos, meta: { page: Number(page), limit: Number(limit), total } });
  } catch (error) {
    console.error('❌ Error listando médicos:', error);
    res.status(500).json({ success: false, error: 'Error listando médicos' });
  }
};

// POST /api/medicos - Crear médico
const createMedico = async (req, res) => {
  try {
    const {
      nombre,
      documento,
      telefono,
      especialidad,
      email,
      registro_medico,
      ips_id,
      municipio_id,
    } = req.body;

    if (!nombre) {
      return res.status(400).json({ success: false, error: 'Nombre es requerido' });
    }

    const id = `medico_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
    const medico = await prisma.medicos.create({
      data: {
        id,
        nombre,
        documento,
        telefono,
        especialidad,
        email,
        registro_medico,
        ips_id,
        municipio_id,
        activo: true,
      },
    });

    console.log('✅ Médico creado:', id);
    res.status(201).json({ success: true, data: medico });
  } catch (error) {
    console.error('❌ Error creando médico:', error);
    res.status(500).json({ success: false, error: 'Error creando médico' });
  }
};

// PUT /api/medicos/:id - Actualizar médico
const updateMedico = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      documento,
      telefono,
      especialidad,
      email,
      registro_medico,
      ips_id,
      municipio_id,
      activo,
    } = req.body;

    const medico = await prisma.medicos.update({
      where: { id },
      data: {
        nombre,
        documento,
        telefono,
        especialidad,
        email,
        registro_medico,
        ips_id,
        municipio_id,
        activo,
      },
    });

    console.log('✅ Médico actualizado:', id);
    res.json({ success: true, data: medico });
  } catch (error) {
    console.error('❌ Error actualizando médico:', error);
    res.status(500).json({ success: false, error: 'Error actualizando médico' });
  }
};

// DELETE /api/medicos/:id - Eliminar médico (soft delete)
const deleteMedico = async (req, res) => {
  try {
    const { id } = req.params;
    
    const medico = await prisma.medicos.update({
      where: { id },
      data: { activo: false },
    });

    console.log('✅ Médico eliminado (soft delete):', id);
    res.json({ success: true, data: medico });
  } catch (error) {
    console.error('❌ Error eliminando médico:', error);
    res.status(500).json({ success: false, error: 'Error eliminando médico' });
  }
};

// ==================== IPS ====================

// POST /api/ips - Crear IPS
const createIPS = async (req, res) => {
  try {
    const {
      nombre,
      nit,
      telefono,
      direccion,
      municipio_id,
      nivel,
      email,
    } = req.body;

    if (!nombre) {
      return res.status(400).json({ success: false, error: 'Nombre es requerido' });
    }

    const id = `ips_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
    const ips = await prisma.ips.create({
      data: {
        id,
        nombre,
        nit,
        telefono,
        direccion,
        municipio_id,
        nivel,
        email,
        activo: true,
      },
    });

    console.log('✅ IPS creada:', id);
    res.status(201).json({ success: true, data: ips });
  } catch (error) {
    console.error('❌ Error creando IPS:', error);
    res.status(500).json({ success: false, error: 'Error creando IPS' });
  }
};

// PUT /api/ips/:id - Actualizar IPS
const updateIPS = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      nit,
      telefono,
      direccion,
      municipio_id,
      nivel,
      email,
      activo,
    } = req.body;

    const ips = await prisma.ips.update({
      where: { id },
      data: {
        nombre,
        nit,
        telefono,
        direccion,
        municipio_id,
        nivel,
        email,
        activo,
      },
    });

    console.log('✅ IPS actualizada:', id);
    res.json({ success: true, data: ips });
  } catch (error) {
    console.error('❌ Error actualizando IPS:', error);
    res.status(500).json({ success: false, error: 'Error actualizando IPS' });
  }
};

// DELETE /api/ips/:id - Eliminar IPS (soft delete)
const deleteIPS = async (req, res) => {
  try {
    const { id } = req.params;
    
    const ips = await prisma.ips.update({
      where: { id },
      data: { activo: false },
    });

    console.log('✅ IPS eliminada (soft delete):', id);
    res.json({ success: true, data: ips });
  } catch (error) {
    console.error('❌ Error eliminando IPS:', error);
    res.status(500).json({ success: false, error: 'Error eliminando IPS' });
  }
};

// ==================== CONTENIDOS ====================

// GET /api/contenido - Listar contenidos
const listContenidos = async (req, res) => {
  try {
    const { page = 1, limit = 20, categoria } = req.query;
    const skip = (page - 1) * limit;

    const where = { activo: true };
    if (categoria) {
      where.categoria = categoria;
    }

    const [contenidos, total] = await Promise.all([
      prisma.contenidos.findMany({
        where,
        orderBy: { fecha_creacion: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.contenidos.count({ where }),
    ]);

    res.json({ success: true, data: contenidos, meta: { page: Number(page), limit: Number(limit), total } });
  } catch (error) {
    console.error('❌ Error listando contenidos:', error);
    res.status(500).json({ success: false, error: 'Error listando contenidos' });
  }
};

// POST /api/contenido - Crear contenido
const createContenido = async (req, res) => {
  try {
    const {
      titulo,
      descripcion,
      categoria,
      tipo,
      url_contenido,
      url_imagen,
      duracion_minutos,
      destacado,
    } = req.body;

    if (!titulo || !categoria || !tipo) {
      return res.status(400).json({ success: false, error: 'Titulo, categoria y tipo son requeridos' });
    }

    const id = `contenido_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
    const contenido = await prisma.contenidos.create({
      data: {
        id,
        titulo,
        descripcion,
        categoria,
        tipo,
        url_contenido,
        url_imagen,
        duracion_minutos: duracion_minutos ? parseInt(duracion_minutos) : null,
        destacado: destacado || false,
        activo: true,
      },
    });

    console.log('✅ Contenido creado:', id);
    res.status(201).json({ success: true, data: contenido });
  } catch (error) {
    console.error('❌ Error creando contenido:', error);
    res.status(500).json({ success: false, error: 'Error creando contenido' });
  }
};

// PUT /api/contenido/:id - Actualizar contenido
const updateContenido = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      titulo,
      descripcion,
      categoria,
      tipo,
      url_contenido,
      url_imagen,
      duracion_minutos,
      destacado,
      activo,
    } = req.body;

    const contenido = await prisma.contenidos.update({
      where: { id },
      data: {
        titulo,
        descripcion,
        categoria,
        tipo,
        url_contenido,
        url_imagen,
        duracion_minutos: duracion_minutos ? parseInt(duracion_minutos) : undefined,
        destacado,
        activo,
      },
    });

    console.log('✅ Contenido actualizado:', id);
    res.json({ success: true, data: contenido });
  } catch (error) {
    console.error('❌ Error actualizando contenido:', error);
    res.status(500).json({ success: false, error: 'Error actualizando contenido' });
  }
};

// DELETE /api/contenido/:id - Eliminar contenido (soft delete)
const deleteContenido = async (req, res) => {
  try {
    const { id } = req.params;
    
    const contenido = await prisma.contenidos.update({
      where: { id },
      data: { activo: false },
    });

    console.log('✅ Contenido eliminado (soft delete):', id);
    res.json({ success: true, data: contenido });
  } catch (error) {
    console.error('❌ Error eliminando contenido:', error);
    res.status(500).json({ success: false, error: 'Error eliminando contenido' });
  }
};

// ==================== MUNICIPIOS ====================

// GET /api/municipios - Listar municipios
const listMunicipios = async (req, res) => {
  try {
    const { departamento } = req.query;

    const where = { activo: true };
    if (departamento) {
      where.departamento = departamento;
    }

    const municipios = await prisma.municipios.findMany({
      where,
      orderBy: { nombre: 'asc' },
    });

    res.json({ success: true, data: municipios });
  } catch (error) {
    console.error('❌ Error listando municipios:', error);
    res.status(500).json({ success: false, error: 'Error listando municipios' });
  }
};

// GET /api/municipios/:id - Obtener municipio por ID
const getMunicipioById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const municipio = await prisma.municipios.findUnique({
      where: { id },
    });

    if (!municipio) {
      return res.status(404).json({ success: false, error: 'Municipio no encontrado' });
    }

    res.json({ success: true, data: municipio });
  } catch (error) {
    console.error('❌ Error obteniendo municipio:', error);
    res.status(500).json({ success: false, error: 'Error obteniendo municipio' });
  }
};

module.exports = {
  // Gestantes
  updateGestante,
  deleteGestante,
  // Controles
  createControl,
  updateControl,
  deleteControl,
  // Alertas
  markAlertAsRead,
  // Médicos
  listMedicos,
  createMedico,
  updateMedico,
  deleteMedico,
  // IPS
  createIPS,
  updateIPS,
  deleteIPS,
  // Contenidos
  listContenidos,
  createContenido,
  updateContenido,
  deleteContenido,
  // Municipios
  listMunicipios,
  getMunicipioById,
};
