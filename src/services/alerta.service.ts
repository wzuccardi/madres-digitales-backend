import { PrismaClient, Prisma } from '@prisma/client';
import { PermissionService } from './permission.service';
import { log } from '../config/logger';

const prisma = new PrismaClient();

export interface CreateAlertaData {
  gestante_id: string;
  tipo_alerta: string;
  nivel_prioridad: string;
  mensaje: string;
  sintomas?: string[];
  coordenadas_alerta?: [number, number];
  generado_por_id?: string;
  es_automatica?: boolean;
  score_riesgo?: number;
}

export class AlertaService {
  private permissionService: PermissionService;

  constructor() {
    this.permissionService = new PermissionService();
    log.info('AlertaService initialized with permissions');
  }

  /**
   * Obtener alertas filtradas por permisos del usuario
   */
  async getAlertasByUser(userId: string) {
    try {
      log.info(`AlertaService: Getting alerts for user ${userId}`);
      
      const alertas = await this.permissionService.filterAlertasByPermission(userId);
      
      log.info(`AlertaService: ${alertas.length} alerts obtained with permissions`);
      return alertas;
    } catch (error) {
      log.error('AlertaService: Error getting alerts by user', { error: error.message, userId });
      throw new Error(`Error obteniendo alertas: ${error.message}`);
    }
  }

  /**
   * Obtener todas las alertas (solo para administradores)
   */
  async getAllAlertas() {
    try {
      log.info('AlertaService: Fetching all alertas');
      
      const alertas = await prisma.alertas.findMany({
        include: {
          gestante: {
            select: {
              id: true,
              nombre: true,
              documento: true,
              telefono: true,
              municipios: {
                select: {
                  id: true,
                  nombre: true,
                  departamento: true
                }
              }
            }
          },
          madrina: {
            select: {
              id: true,
              nombre: true,
              telefono: true
            }
          }
        },
        orderBy: [
          { nivel_prioridad: 'desc' },
          { fecha_creacion: 'desc' }
        ]
      });

      log.info(`AlertaService: Found ${alertas.length} alertas`);
      return alertas;
    } catch (error) {
      log.error('AlertaService: Error fetching all alertas', { error: error.message });
      throw new Error(`Error obteniendo todas las alertas: ${error.message}`);
    }
  }

  /**
   * Crear nueva alerta con validación de permisos
   */
  async createAlerta(data: CreateAlertaData, userId: string) {
    try {
      log.info(`AlertaService: Creating alert for gestante ${data.gestante_id}`);

      // Verificar permisos para crear alerta para esta gestante
      const canCreate = await this.permissionService.canCreateAlertaForGestante(userId, data.gestante_id);
      if (!canCreate) {
        throw new Error('No tiene permisos para crear alertas para esta gestante');
      }

      // Obtener información de la gestante para asignar madrina automáticamente
      log.debug('Verifying gestante fields in database');
      const gestante = await prisma.gestantes.findUnique({
        where: { id: data.gestante_id },
        select: {
          id: true,
          nombre: true,
          madrina_id: true,
          medico_tratante_id: true, // Campo correcto según schema
          municipio_id: true
        }
      });
      
      log.debug('Gestante fields found', {
        madrina_id: gestante?.madrina_id,
        medico_tratante_id: gestante?.medico_tratante_id,
      });

      if (!gestante) {
        throw new Error('Gestante no encontrada');
      }

      const alertaData: any = {
        gestante_id: data.gestante_id,
        tipo_alerta: data.tipo_alerta,
        nivel_prioridad: data.nivel_prioridad,
        mensaje: data.mensaje,
        sintomas: data.sintomas || [],
        generado_por_id: data.generado_por_id || userId,
        es_automatica: data.es_automatica || false,
        score_riesgo: data.score_riesgo || 0,
        madrina_id: gestante.madrina_id, // Asignar automáticamente la madrina de la gestante
        estado: 'pendiente',
        resuelta: false,
        fecha_creacion: new Date(),
        fecha_actualizacion: new Date()
      };

      // Agregar coordenadas si se proporcionan
      if (data.coordenadas_alerta && data.coordenadas_alerta.length === 2) {
        alertaData.coordenadas_alerta = {
          type: "Point",
          coordinates: [data.coordenadas_alerta[1], data.coordenadas_alerta[0]] // [longitud, latitud]
        };
      }

      const nuevaAlerta = await prisma.alertas.create({
        data: alertaData,
        include: {
          gestante: {
            select: {
              id: true,
              nombre: true,
              municipios: {
                select: { id: true, nombre: true }
              }
            }
          },
          madrina: {
            select: { id: true, nombre: true }
          }
        }
      });

      log.info(`AlertaService: Alert created with ID ${nuevaAlerta.id}`);
      log.info('Alert created', {
        alertaId: nuevaAlerta.id,
        gestanteId: data.gestante_id,
        tipo: data.tipo_alerta,
        prioridad: data.nivel_prioridad,
        userId
      });

      return nuevaAlerta;

    } catch (error) {
      log.error('AlertaService: Error creating alert', { error: error.message, data, userId });
      throw error;
    }
  }

  /**
   * Obtener alerta por ID con validación de permisos
   */
  async getAlertaById(alertaId: string, userId: string) {
    try {
      log.info(`AlertaService: Getting alert ${alertaId} for user ${userId}`);

      const alerta = await prisma.alertas.findUnique({
        where: { id: alertaId },
        include: {
          gestante: {
            select: {
              id: true,
              nombre: true,
              documento: true,
              telefono: true,
              municipios: {
                select: { id: true, nombre: true }
              }
            }
          },
          madrina: {
            select: { id: true, nombre: true }
          }
        }
      });

      if (!alerta) {
        throw new Error('Alerta no encontrada');
      }

      // Verificar permisos para acceder a esta gestante
      const canAccess = await this.permissionService.canAccessGestante(userId, alerta.gestante_id);
      if (!canAccess) {
        throw new Error('No tiene permisos para acceder a esta alerta');
      }

      log.info(`AlertaService: Alert ${alertaId} obtained`);
      return alerta;

    } catch (error) {
      log.error('AlertaService: Error getting alert by ID', { error: error.message, alertaId, userId });
      throw error;
    }
  }

  /**
   * Resolver alerta con validación de permisos
   */
  async resolverAlerta(alertaId: string, userId: string) {
    try {
      log.info(`AlertaService: Resolving alert ${alertaId}`);

      // Verificar que la alerta existe y el usuario tiene permisos
      const alerta = await this.getAlertaById(alertaId, userId);

      const alertaResuelta = await prisma.alertas.update({
        where: { id: alertaId },
        data: {
          resuelta: true,
          estado: 'resuelta',
          fecha_resolucion: new Date(),
          fecha_actualizacion: new Date()
        },
        include: {
          gestante: {
            select: { id: true, nombre: true }
          }
        }
      });

      log.info(`AlertaService: Alert ${alertaId} resolved`);
      log.info('Alert resolved', { alertaId, userId, gestanteId: alerta.gestante_id });

      // Notificar resolución via WebSocket
      try {
        const { NotificationService } = await import('./notification.service');
        const notificationService = new NotificationService();
        await notificationService.notifyAlertUpdate(alertaId, 'resuelta');
      } catch (wsError) {
        log.warn('AlertaService: Error sending WebSocket notification', { error: wsError.message });
        // No fallar la resolución por error en notificación
      }

      return alertaResuelta;

    } catch (error) {
      log.error('AlertaService: Error resolving alert', { error: error.message, alertaId, userId });
      throw error;
    }
  }

  /**
   * Obtener alertas por madrina
   */
  async getAlertasByMadrina(madrinaId: string) {
    try {
      log.info(`AlertaService: Fetching alerts for madrina ${madrinaId}`);
      
      const alertas = await prisma.alertas.findMany({
        where: {
          OR: [
            { madrina_id: madrinaId },
            {
              gestante: {
                madrina_id: madrinaId
              }
            }
          ]
        },
        include: {
          gestante: {
            select: {
              id: true,
              nombre: true,
              documento: true,
              telefono: true,
              municipios: {
                select: {
                  id: true,
                  nombre: true,
                  departamento: true
                }
              }
            }
          },
          madrina: {
            select: {
              id: true,
              nombre: true,
              telefono: true
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        }
      });

      log.info(`AlertaService: Found ${alertas.length} alerts for madrina ${madrinaId}`);
      return alertas;
    } catch (error) {
      log.error(`AlertaService: Error fetching alerts for madrina ${madrinaId}`, { error: error.message });
      throw new Error(`Error obteniendo alertas de madrina: ${error.message}`);
    }
  }


  /**
   * Crear alerta completa
   */
  async createAlertaCompleta(data: any) {
    try {
      log.info('AlertaService: Creating complete alert', { data });
      
      // Validar que la gestante existe
      const gestante = await prisma.gestantes.findUnique({
        where: { id: data.gestante_id }
      });

      if (!gestante) {
        throw new Error(`No se encontró gestante con ID ${data.gestante_id}`);
      }

      log.debug('Fields received in createAlertaCompleta', {
        madrina_id: data.madrina_id,
        medico_tratante_id: data.medico_tratante_id
      });

      // Crear la alerta
      const alerta = await prisma.alertas.create({
        data: {
          gestante_id: data.gestante_id,
          tipo_alerta: data.tipo_alerta || data.tipo,
          nivel_prioridad: data.nivel_prioridad || 'media',
          mensaje: data.mensaje || 'Alerta creada',
          sintomas: data.sintomas || [],
          madrina_id: data.madrina_id || null,
          medico_asignado_id: data.medico_tratante_id || null,
          ips_derivada_id: data.ips_derivada_id || null,
          generado_por_id: data.generado_por_id || null,
          coordenadas_alerta: data.coordenadas ? {
            type: 'Point',
            coordinates: data.coordenadas
          } : Prisma.JsonNull,
          resuelta: false
        } as any,
        include: {
          gestante: {
            select: {
              id: true,
              nombre: true,
              documento: true,
              telefono: true
            }
          }
        }
      });

      log.info(`AlertaService: Alert created with ID: ${alerta.id}`);
      return alerta;
    } catch (error) {
      log.error('AlertaService: Error creating complete alert', { error: error.message });
      throw error;
    }
  }

  /**
   * Actualizar alerta completa
   */
  async updateAlertaCompleta(id: string, data: any) {
    try {
      log.info(`AlertaService: Updating alert ${id}`, { data });
      
      // Verificar que la alerta existe
      const alertaExistente = await prisma.alertas.findUnique({
        where: { id }
      });

      if (!alertaExistente) {
        throw new Error(`No se encontró alerta con ID ${id}`);
      }

      // Actualizar la alerta
      const alerta = await prisma.alertas.update({
        where: { id },
        data: {
          tipo_alerta: data.tipo_alerta || data.tipo,
          nivel_prioridad: data.nivel_prioridad,
          mensaje: data.mensaje,
          sintomas: data.sintomas,
          madrina_id: data.madrina_id,
          medico_asignado_id: data.medico_tratante_id || null,
          ips_derivada_id: data.ips_derivada_id,
          resuelta: data.resuelta,
          fecha_resolucion: data.resuelta ? new Date() : null,
          coordenadas_alerta: data.coordenadas ? {
            type: 'Point',
            coordinates: data.coordenadas
          } : Prisma.JsonNull
        } as any,
        include: {
          gestante: {
            select: {
              id: true,
              nombre: true,
              documento: true,
              telefono: true
            }
          }
        }
      });

      log.info(`AlertaService: Alert ${id} updated successfully`);
      return alerta;
    } catch (error) {
      log.error(`AlertaService: Error updating alert ${id}`, { error: error.message });
      throw error;
    }
  }

  /**
   * Eliminar alerta
   */
  async deleteAlerta(id: string) {
    try {
      log.info(`AlertaService: Deleting alert ${id}`);
      
      const alerta = await prisma.alertas.delete({
        where: { id }
      });

      log.info(`AlertaService: Alert ${id} deleted successfully`);
      return alerta;
    } catch (error) {
      log.error(`AlertaService: Error deleting alert ${id}`, { error: error.message });
      throw new Error(`Error eliminando alerta: ${error.message}`);
    }
  }

  /**
   * Obtener alertas por gestante
   */
  async getAlertasByGestante(gestanteId: string) {
    try {
      log.info(`AlertaService: Fetching alerts for gestante ${gestanteId}`);
      
      const alertas = await prisma.alertas.findMany({
        where: { gestante_id: gestanteId },
        include: {
          madrina: {
            select: {
              id: true,
              nombre: true,
              telefono: true
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        }
      });

      log.info(`AlertaService: Found ${alertas.length} alerts for gestante ${gestanteId}`);
      return alertas;
    } catch (error) {
      log.error(`AlertaService: Error fetching alerts for gestante ${gestanteId}`, { error: error.message });
      throw new Error(`Error obteniendo alertas de gestante: ${error.message}`);
    }
  }

  /**
   * Obtener alertas activas
   */
  async getAlertasActivas() {
    try {
      log.info('AlertaService: Fetching active alertas');
      
      const alertas = await prisma.alertas.findMany({
        where: { resuelta: false },
        include: {
          gestante: {
            select: {
              id: true,
              nombre: true,
              documento: true,
              telefono: true,
              municipios: {
                select: {
                  id: true,
                  nombre: true,
                  departamento: true
                }
              }
            }
          },
          madrina: {
            select: {
              id: true,
              nombre: true,
              telefono: true
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        }
      });

      log.info(`AlertaService: Found ${alertas.length} active alertas`);
      return alertas;
    } catch (error) {
      log.error('AlertaService: Error fetching active alertas', { error: error.message });
      throw new Error(`Error obteniendo alertas activas: ${error.message}`);
    }
  }


  /**
   * Crear alerta con evaluación automática
   */
  async createAlertaConEvaluacion(data: any) {
    try {
      log.info('AlertaService: Creating alert with evaluation');
      
      // Crear la alerta manual
      const alertaManual = await this.createAlerta(data, data.generado_por_id);
      
      let alertaAutomatica = null;
      
      // Si se solicita evaluación automática, crear alerta automática
      if (data.evaluar_automaticamente) {
        // Aquí se podría integrar con el motor de reglas
        // Por ahora, solo creamos la alerta manual
      }
      
      return {
        alerta_manual: alertaManual,
        alerta_automatica: alertaAutomatica
      };
    } catch (error) {
      log.error('AlertaService: Error creating alert with evaluation', { error: error.message });
      throw error;
    }
  }

  /**
   * Crear alerta SOS con notificaciones completas
   */
  async notificarEmergencia(gestanteId: string, coordenadas: [number, number]) {
    log.info('AlertaService: Creating SOS emergency alert');
    log.info(`Gestante ID: ${gestanteId}`);
    log.info(`Coordinates: [${coordenadas[0]}, ${coordenadas[1]}]`);

    const startTime = Date.now();

    try {
      log.debug('Verifying gestante in notificarEmergencia');
      const gestanteCompleta = await prisma.gestantes.findUnique({
        where: { id: gestanteId },
        include: {
          municipios: true, // Corregido: municipio -> municipios
          madrina: {
            include: {
              municipios: true, // Corregido: municipio -> municipios
            },
          },
          medico_tratante: {
            include: {
              ips: true,
            },
          },
          ips_asignada: true,
        },
      });

      log.debug('Gestante fields in notificarEmergencia', {
        madrina_id: gestanteCompleta?.madrina_id,
        medico_tratante_id: gestanteCompleta?.medico_tratante_id,
      });

      if (!gestanteCompleta) {
        throw new Error(`Gestante con ID ${gestanteId} no encontrada`);
      }

      // Construir mensaje descriptivo
      const fechaHora = new Date().toLocaleString('es-CO', {
        timeZone: 'America/Bogota',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });

      let mensajeDetallado = `🚨 ALERTA DE EMERGENCIA SOS - ${fechaHora}\n\n`;
      mensajeDetallado += `👤 GESTANTE: ${gestanteCompleta.nombre}\n`;
      mensajeDetallado += `📍 COORDENADAS: ${coordenadas[1]}, ${coordenadas[0]}\n`;
      mensajeDetallado += `⚠️ REQUIERE ATENCIÓN MÉDICA INMEDIATA`;

      // Crear alerta de emergencia SOS
      const alertaSOS = await prisma.alertas.create({
        data: {
          gestante_id: gestanteId,
          madrina_id: gestanteCompleta.madrina_id || null,
          tipo_alerta: 'sos',
          nivel_prioridad: 'critica',
          mensaje: mensajeDetallado,
          coordenadas_alerta: {
            type: 'Point',
            coordinates: coordenadas
          },
          resuelta: false,
          fecha_resolucion: null,
        } as any
      });

      log.info(`AlertaService: SOS alert created with ID: ${alertaSOS.id}`);

      const duration = Date.now() - startTime;
      log.info(`AlertaService: SOS alert created in ${duration}ms`);

      return alertaSOS;
    } catch (error) {
      const duration = Date.now() - startTime;
      log.error('AlertaService: Error creating SOS alert', { error: error.message, duration });
      throw new Error(`Error creando alerta SOS: ${error}`);
    }
  }
}