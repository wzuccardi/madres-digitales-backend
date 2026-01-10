/**
 * Servicio de Emergencias SOS
 * 
 * Maneja alertas SOS críticas con notificación en tiempo real
 * a todos los usuarios autorizados (admin, coordinador, médico)
 */

class SOSEmergencyService {
  constructor(prisma, webSocketService) {
    this.prisma = prisma;
    this.ws = webSocketService;
  }

  /**
   * Crea una alerta SOS de emergencia
   * @param {Object} data - Datos de la emergencia
   * @returns {Promise<Object>} - Alerta creada y notificaciones enviadas
   */
  async crearAlertaSOS(data) {
    const {
      madrina_id,
      gestante_id,
      latitud,
      longitud,
      descripcion,
      tipo_emergencia,
      device_info
    } = data;

    try {
      // 1. Obtener información de la madrina
      const madrina = await this.prisma.usuarios.findUnique({
        where: { id: madrina_id },
        select: {
          id: true,
          nombre: true,
          email: true,
          telefono: true,
          municipio_id: true,
          coordenadas: true
        }
      });

      if (!madrina) {
        throw new Error('Madrina no encontrada');
      }

      // 2. Obtener información de la gestante (si se proporciona)
      let gestante = null;
      if (gestante_id) {
        gestante = await this.prisma.gestantes.findUnique({
          where: { id: gestante_id },
          select: {
            id: true,
            nombre: true,
            documento: true,
            telefono: true,
            direccion: true,
            coordenadas: true,
            riesgo_alto: true,
            factores_riesgo: true,
            fecha_probable_parto: true,
            semanas_gestacion: true
          }
        });
      }

      // 3. Crear la alerta SOS en la base de datos
      const alertaSOS = await this.prisma.alertas.create({
        data: {
          id: `sos_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          gestante_id: gestante_id || null,
          tipo_alerta: 'EMERGENCIA_OBSTETRICA',
          nivel_prioridad: 'CRITICA',
          mensaje: descripcion || '🚨 EMERGENCIA SOS - Requiere atención INMEDIATA',
          sintomas: tipo_emergencia ? [tipo_emergencia] : ['sos_button'],
          coordenadas_alerta: latitud && longitud ? `POINT(${longitud} ${latitud})` : null,
          madrina_id: madrina_id,
          generado_por_id: madrina_id,
          es_automatica: false,
          estado: 'pendiente',
          resuelta: false,
          metadata: {
            tipo: 'SOS',
            device_info,
            timestamp: new Date().toISOString()
          }
        }
      });

      console.log('🚨 ALERTA SOS CREADA:', alertaSOS.id);

      // 4. Buscar usuarios que deben recibir la notificación
      const usuariosNotificar = await this.prisma.usuarios.findMany({
        where: {
          rol: {
            in: ['ADMIN', 'SUPER_ADMIN', 'COORDINADOR', 'MEDICO']
          },
          activo: true
        },
        select: {
          id: true,
          nombre: true,
          email: true,
          rol: true,
          telefono: true
        }
      });

      console.log(`📢 Notificando a ${usuariosNotificar.length} usuarios`);

      // 5. Preparar datos de la notificación
      const notificacionData = {
        id: alertaSOS.id,
        tipo: 'SOS_EMERGENCY',
        prioridad: 'CRITICA',
        timestamp: new Date().toISOString(),
        madrina: {
          id: madrina.id,
          nombre: madrina.nombre,
          telefono: madrina.telefono,
          email: madrina.email,
          ubicacion: {
            latitud: latitud || null,
            longitud: longitud || null
          }
        },
        gestante: gestante ? {
          id: gestante.id,
          nombre: gestante.nombre,
          documento: gestante.documento,
          telefono: gestante.telefono,
          direccion: gestante.direccion,
          riesgo_alto: gestante.riesgo_alto,
          factores_riesgo: gestante.factores_riesgo,
          semanas_gestacion: gestante.semanas_gestacion,
          ubicacion: {
            latitud: gestante.coordenadas?.x || null,
            longitud: gestante.coordenadas?.y || null
          }
        } : null,
        ubicacion: {
          latitud,
          longitud,
          precision: device_info?.accuracy || null
        },
        descripcion: descripcion || 'Emergencia SOS activada',
        tipo_emergencia: tipo_emergencia || 'sos_button',
        device_info: device_info || null
      };

      // 6. Enviar notificación por WebSocket a todos los usuarios autorizados
      if (this.ws && this.ws.io) {
        // Emitir a todos los clientes conectados
        this.ws.io.emit('sos:emergency', notificacionData);
        console.log('📡 Notificación SOS enviada por WebSocket');
      }

      // 7. Registrar la notificación en la base de datos
      for (const usuario of usuariosNotificar) {
        try {
          await this.prisma.notificaciones.create({
            data: {
              id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
              usuario_id: usuario.id,
              tipo: 'SOS_EMERGENCY',
              titulo: '🚨 EMERGENCIA SOS',
              mensaje: `${madrina.nombre} ha activado una alerta SOS${gestante ? ` para ${gestante.nombre}` : ''}`,
              prioridad: 'CRITICA',
              leida: false,
              metadata: notificacionData
            }
          });
        } catch (error) {
          console.error(`Error creando notificación para usuario ${usuario.id}:`, error);
        }
      }

      return {
        success: true,
        alerta: alertaSOS,
        notificacion: notificacionData,
        usuarios_notificados: usuariosNotificar.length
      };

    } catch (error) {
      console.error('❌ Error creando alerta SOS:', error);
      throw error;
    }
  }

  /**
   * Obtiene alertas SOS activas
   */
  async obtenerAlertasSOSActivas() {
    return await this.prisma.alertas.findMany({
      where: {
        tipo_alerta: 'EMERGENCIA_OBSTETRICA',
        nivel_prioridad: 'CRITICA',
        resuelta: false,
        metadata: {
          path: ['tipo'],
          equals: 'SOS'
        }
      },
      include: {
        gestante: {
          select: {
            id: true,
            nombre: true,
            documento: true,
            telefono: true,
            riesgo_alto: true
          }
        },
        madrina: {
          select: {
            id: true,
            nombre: true,
            telefono: true,
            email: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });
  }

  /**
   * Marca una alerta SOS como resuelta
   */
  async resolverAlertaSOS(alertaId, resolvidoPorId, notas) {
    const alerta = await this.prisma.alertas.update({
      where: { id: alertaId },
      data: {
        resuelta: true,
        estado: 'resuelta',
        resuelto_por: resolvidoPorId,
        fecha_resolucion: new Date(),
        notas_resolucion: notas
      }
    });

    // Notificar resolución por WebSocket
    if (this.ws && this.ws.io) {
      this.ws.io.emit('sos:resolved', {
        alerta_id: alertaId,
        resuelto_por: resolvidoPorId,
        timestamp: new Date().toISOString()
      });
    }

    return alerta;
  }
}

module.exports = SOSEmergencyService;
