/**
 * Endpoints para el sistema SOS de emergencias
 * 
 * Funcionalidades:
 * - Crear alerta SOS con ubicación GPS
 * - Notificar en tiempo real a admin, coordinadores y médicos
 * - Obtener alertas SOS activas
 * - Actualizar estado de alertas SOS
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Crear alerta SOS de emergencia
 * POST /api/sos/alerta
 */
async function crearAlertaSOS(req, res, io) {
  try {
    const {
      gestante_id,
      madrina_id,
      latitud,
      longitud,
      descripcion,
      tipo_emergencia,
      sintomas
    } = req.body;

    console.log('🚨 ALERTA SOS RECIBIDA:', {
      gestante_id,
      madrina_id,
      latitud,
      longitud,
      tipo_emergencia
    });

    // Validar datos requeridos
    if (!madrina_id) {
      return res.status(400).json({
        success: false,
        error: 'madrina_id es requerido'
      });
    }

    // Obtener información de la madrina
    const madrina = await prisma.usuarios.findUnique({
      where: { id: madrina_id },
      select: {
        id: true,
        nombre: true,
        telefono: true,
        email: true,
        municipio_id: true,
        coordenadas: true
      }
    });

    if (!madrina) {
      return res.status(404).json({
        success: false,
        error: 'Madrina no encontrada'
      });
    }

    // Obtener información de la gestante (si se proporciona)
    let gestante = null;
    if (gestante_id) {
      gestante = await prisma.gestantes.findUnique({
        where: { id: gestante_id },
        select: {
          id: true,
          nombre: true,
          documento: true,
          telefono: true,
          direccion: true,
          municipio_id: true,
          riesgo_alto: true,
          factores_riesgo: true,
          fecha_probable_parto: true,
          medico_tratante_id: true,
          ips_asignada_id: true
        }
      });
    }

    // Crear la alerta SOS en la base de datos
    const alertaSOS = await prisma.alertas.create({
      data: {
        id: `sos_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        gestante_id: gestante_id || null,
        tipo_alerta: 'EMERGENCIA_OBSTETRICA',
        nivel_prioridad: 'CRITICA',
        mensaje: descripcion || '🚨 EMERGENCIA SOS - Requiere atención INMEDIATA',
        sintomas: sintomas || [],
        coordenadas_alerta: latitud && longitud ? `(${latitud},${longitud})` : null,
        madrina_id: madrina_id,
        medico_asignado_id: gestante?.medico_tratante_id || null,
        ips_derivada_id: gestante?.ips_asignada_id || null,
        resuelta: false,
        estado: 'pendiente',
        metadata: {
          tipo_emergencia: tipo_emergencia || 'sos_button',
          timestamp_sos: new Date().toISOString(),
          ubicacion: {
            latitud,
            longitud,
            precision: 'alta'
          }
        }
      }
    });

    console.log('✅ Alerta SOS creada:', alertaSOS.id);

    // Preparar datos completos para la notificación
    const notificacionSOS = {
      alerta_id: alertaSOS.id,
      tipo: 'SOS_EMERGENCIA',
      prioridad: 'CRITICA',
      timestamp: new Date().toISOString(),
      
      // Información de la madrina
      madrina: {
        id: madrina.id,
        nombre: madrina.nombre,
        telefono: madrina.telefono,
        email: madrina.email,
        municipio_id: madrina.municipio_id
      },
      
      // Información de la gestante
      gestante: gestante ? {
        id: gestante.id,
        nombre: gestante.nombre,
        documento: gestante.documento,
        telefono: gestante.telefono,
        direccion: gestante.direccion,
        riesgo_alto: gestante.riesgo_alto,
        factores_riesgo: gestante.factores_riesgo,
        fecha_probable_parto: gestante.fecha_probable_parto
      } : null,
      
      // Ubicación GPS
      ubicacion: {
        latitud,
        longitud,
        descripcion: descripcion || 'Ubicación de emergencia',
        google_maps_url: latitud && longitud 
          ? `https://www.google.com/maps?q=${latitud},${longitud}`
          : null
      },
      
      // Detalles de la emergencia
      emergencia: {
        tipo: tipo_emergencia || 'sos_button',
        descripcion: descripcion || 'Emergencia SOS activada',
        sintomas: sintomas || [],
        nivel_urgencia: 'MAXIMA'
      },
      
      // Mensaje de alerta
      mensaje: `🚨 EMERGENCIA SOS - ${madrina.nombre} ha activado el botón SOS${gestante ? ` para ${gestante.nombre}` : ''}`,
      
      // Acción requerida
      accion_requerida: 'RESPUESTA INMEDIATA - Contactar a la madrina y coordinar atención médica urgente'
    };

    // Emitir notificación en tiempo real a través de WebSocket
    if (io) {
      // Emitir a todos los usuarios conectados (admin, coordinadores, médicos)
      io.emit('sos:emergencia', notificacionSOS);
      
      // Emitir específicamente a la sala de administradores
      io.to('admin').emit('sos:emergencia', notificacionSOS);
      io.to('coordinador').emit('sos:emergencia', notificacionSOS);
      io.to('medico').emit('sos:emergencia', notificacionSOS);
      
      console.log('📡 Notificación SOS emitida por WebSocket');
    }

    // Responder con éxito
    res.status(201).json({
      success: true,
      message: 'Alerta SOS creada y notificada exitosamente',
      data: {
        alerta_id: alertaSOS.id,
        notificacion: notificacionSOS
      }
    });

  } catch (error) {
    console.error('❌ Error creando alerta SOS:', error);
    res.status(500).json({
      success: false,
      error: 'Error creando alerta SOS: ' + error.message
    });
  }
}

/**
 * Obtener alertas SOS activas
 * GET /api/sos/alertas-activas
 */
async function obtenerAlertasSOSActivas(req, res) {
  try {
    const alertas = await prisma.alertas.findMany({
      where: {
        tipo_alerta: 'EMERGENCIA_OBSTETRICA',
        resuelta: false
      },
      include: {
        gestante: {
          select: {
            id: true,
            nombre: true,
            documento: true,
            telefono: true,
            direccion: true,
            riesgo_alto: true,
            factores_riesgo: true
          }
        },
        madrina: {
          select: {
            id: true,
            nombre: true,
            telefono: true,
            email: true,
            municipio_id: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    res.json({
      success: true,
      data: alertas
    });

  } catch (error) {
    console.error('❌ Error obteniendo alertas SOS:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo alertas SOS: ' + error.message
    });
  }
}

/**
 * Actualizar estado de alerta SOS
 * PUT /api/sos/alerta/:id
 */
async function actualizarAlertaSOS(req, res, io) {
  try {
    const { id } = req.params;
    const { estado, resuelto_por, notas } = req.body;

    const alertaActualizada = await prisma.alertas.update({
      where: { id },
      data: {
        resuelta: estado === 'resuelta',
        resuelto_por: resuelto_por || null,
        fecha_resolucion: estado === 'resuelta' ? new Date() : null,
        observaciones: notas || null
      }
    });

    // Notificar actualización por WebSocket
    if (io) {
      io.emit('sos:actualizada', {
        alerta_id: id,
        estado,
        resuelto_por,
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      data: alertaActualizada
    });

  } catch (error) {
    console.error('❌ Error actualizando alerta SOS:', error);
    res.status(500).json({
      success: false,
      error: 'Error actualizando alerta SOS: ' + error.message
    });
  }
}

module.exports = {
  crearAlertaSOS,
  obtenerAlertasSOSActivas,
  actualizarAlertaSOS
};
