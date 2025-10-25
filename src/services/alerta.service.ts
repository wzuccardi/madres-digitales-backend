import { PrismaClient } from '@prisma/client';
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
    console.log('🚨 AlertaService initialized with permissions');
  }

  /**
   * Obtener alertas filtradas por permisos del usuario
   */
  async getAlertasByUser(userId: string) {
    try {
      console.log(`🔍 AlertaService: Obteniendo alertas para usuario ${userId}`);
      
      const alertas = await this.permissionService.filterAlertasByPermission(userId);
      
      console.log(`✅ AlertaService: ${alertas.length} alertas obtenidas con permisos`);
      return alertas;
    } catch (error) {
      console.error('❌ AlertaService: Error obteniendo alertas por usuario:', error);
      log.error('Error obteniendo alertas por usuario', { error: error.message, userId });
      throw new Error(`Error obteniendo alertas: ${error.message}`);
    }
  }

  /**
   * Obtener todas las alertas (solo para administradores)
   */
  async getAllAlertas() {
    try {
      console.log('🔍 AlertaService: Fetching all alertas');
      
      const alertas = await prisma.alerta.findMany({
        include: {
          gestante: {
            select: {
              id: true,
              nombre: true,
              documento: true,
              telefono: true,
              municipio: {
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

      console.log(`✅ AlertaService: Found ${alertas.length} alertas`);
      return alertas;
    } catch (error) {
      console.error('❌ AlertaService: Error fetching all alertas:', error);
      throw new Error(`Error obteniendo todas las alertas: ${error.message}`);
    }
  }

  /**
   * Crear nueva alerta con validación de permisos
   */
  async createAlerta(data: CreateAlertaData, userId: string) {
    try {
      console.log(`🚨 AlertaService: Creando alerta para gestante ${data.gestante_id}`);

      // Verificar permisos para crear alerta para esta gestante
      const canCreate = await this.permissionService.canCreateAlertaForGestante(userId, data.gestante_id);
      if (!canCreate) {
        throw new Error('No tiene permisos para crear alertas para esta gestante');
      }

      // Obtener información de la gestante para asignar madrina automáticamente
      const gestante = await prisma.gestante.findUnique({
        where: { id: data.gestante_id },
        select: {
          id: true,
          nombre: true,
          madrina_id: true,
          municipio_id: true
        }
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
          lat: data.coordenadas_alerta[0],
          lng: data.coordenadas_alerta[1]
        };
      }

      const nuevaAlerta = await prisma.alerta.create({
        data: alertaData,
        include: {
          gestante: {
            select: {
              id: true,
              nombre: true,
              municipio: {
                select: { id: true, nombre: true }
              }
            }
          },
          madrina: {
            select: { id: true, nombre: true }
          }
        }
      });

      console.log(`✅ AlertaService: Alerta creada con ID ${nuevaAlerta.id}`);
      log.info('Alerta creada', { 
        alertaId: nuevaAlerta.id, 
        gestanteId: data.gestante_id,
        tipo: data.tipo_alerta,
        prioridad: data.nivel_prioridad,
        userId 
      });

      return nuevaAlerta;

    } catch (error) {
      console.error('❌ AlertaService: Error creando alerta:', error);
      log.error('Error creando alerta', { error: error.message, data, userId });
      throw error;
    }
  }

  /**
   * Obtener alerta por ID con validación de permisos
   */
  async getAlertaById(alertaId: string, userId: string) {
    try {
      console.log(`🔍 AlertaService: Obteniendo alerta ${alertaId} para usuario ${userId}`);

      const alerta = await prisma.alerta.findUnique({
        where: { id: alertaId },
        include: {
          gestante: {
            select: {
              id: true,
              nombre: true,
              documento: true,
              telefono: true,
              municipio: {
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

      console.log(`✅ AlertaService: Alerta ${alertaId} obtenida`);
      return alerta;

    } catch (error) {
      console.error('❌ AlertaService: Error obteniendo alerta por ID:', error);
      log.error('Error obteniendo alerta por ID', { error: error.message, alertaId, userId });
      throw error;
    }
  }

  /**
   * Resolver alerta con validación de permisos
   */
  async resolverAlerta(alertaId: string, userId: string) {
    try {
      console.log(`✅ AlertaService: Resolviendo alerta ${alertaId}`);

      // Verificar que la alerta existe y el usuario tiene permisos
      const alerta = await this.getAlertaById(alertaId, userId);

      const alertaResuelta = await prisma.alerta.update({
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

      console.log(`✅ AlertaService: Alerta ${alertaId} resuelta`);
      log.info('Alerta resuelta', { alertaId, userId, gestanteId: alerta.gestante_id });

      // Notificar resolución via WebSocket
      try {
        const { NotificationService } = await import('./notification.service');
        const notificationService = new NotificationService();
        await notificationService.notifyAlertUpdate(alertaId, 'resuelta');
      } catch (wsError) {
        console.warn('⚠️ AlertaService: Error sending WebSocket notification:', wsError);
        // No fallar la resolución por error en notificación
      }

      return alertaResuelta;

    } catch (error) {
      console.error('❌ AlertaService: Error resolviendo alerta:', error);
      log.error('Error resolviendo alerta', { error: error.message, alertaId, userId });
      throw error;
    }
  }

  /**
   * Obtener alertas por madrina
   */
  async getAlertasByMadrina(madrinaId: string) {
    try {
      console.log(`🔍 AlertaService: Fetching alertas for madrina ${madrinaId}`);
      
      const alertas = await prisma.alerta.findMany({
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
              municipio: {
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

      console.log(`✅ AlertaService: Found ${alertas.length} alertas for madrina ${madrinaId}`);
      return alertas;
    } catch (error) {
      console.error(`❌ AlertaService: Error fetching alertas for madrina ${madrinaId}:`, error);
      throw new Error(`Error obteniendo alertas de madrina: ${error.message}`);
    }
  }


  /**
   * Crear alerta completa
   */
  async createAlertaCompleta(data: any) {
    try {
      console.log('🚨 AlertaService: Creating complete alert with data:', data);
      
      // Validar que la gestante existe
      const gestante = await prisma.gestante.findUnique({
        where: { id: data.gestante_id }
      });

      if (!gestante) {
        throw new Error(`No se encontró gestante con ID ${data.gestante_id}`);
      }

      // Crear la alerta
      const alerta = await prisma.alerta.create({
        data: {
          gestante_id: data.gestante_id,
          tipo_alerta: data.tipo_alerta || data.tipo,
          nivel_prioridad: data.nivel_prioridad || 'media',
          mensaje: data.mensaje || 'Alerta creada',
          sintomas: data.sintomas || [],
          madrina_id: data.madrina_id || null,
          medico_asignado_id: data.medico_asignado_id || null,
          ips_derivada_id: data.ips_derivada_id || null,
          generado_por_id: data.generado_por_id || null,
          coordenadas_alerta: data.coordenadas ? {
            type: 'Point',
            coordinates: data.coordenadas
          } : null,
          resuelta: false
        },
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

      console.log(`✅ AlertaService: Alert created with ID: ${alerta.id}`);
      return alerta;
    } catch (error) {
      console.error('❌ AlertaService: Error creating complete alert:', error);
      throw error;
    }
  }

  /**
   * Actualizar alerta completa
   */
  async updateAlertaCompleta(id: string, data: any) {
    try {
      console.log(`🚨 AlertaService: Updating alert ${id} with data:`, data);
      
      // Verificar que la alerta existe
      const alertaExistente = await prisma.alerta.findUnique({
        where: { id }
      });

      if (!alertaExistente) {
        throw new Error(`No se encontró alerta con ID ${id}`);
      }

      // Actualizar la alerta
      const alerta = await prisma.alerta.update({
        where: { id },
        data: {
          tipo_alerta: data.tipo_alerta || data.tipo,
          nivel_prioridad: data.nivel_prioridad,
          mensaje: data.mensaje,
          sintomas: data.sintomas,
          madrina_id: data.madrina_id,
          medico_asignado_id: data.medico_asignado_id,
          ips_derivada_id: data.ips_derivada_id,
          resuelta: data.resuelta,
          fecha_resolucion: data.resuelta ? new Date() : null,
          coordenadas_alerta: data.coordenadas ? {
            type: 'Point',
            coordinates: data.coordenadas
          } : undefined
        },
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

      console.log(`✅ AlertaService: Alert ${id} updated successfully`);
      return alerta;
    } catch (error) {
      console.error(`❌ AlertaService: Error updating alert ${id}:`, error);
      throw error;
    }
  }

  /**
   * Eliminar alerta
   */
  async deleteAlerta(id: string) {
    try {
      console.log(`🗑️ AlertaService: Deleting alert ${id}`);
      
      const alerta = await prisma.alerta.delete({
        where: { id }
      });

      console.log(`✅ AlertaService: Alert ${id} deleted successfully`);
      return alerta;
    } catch (error) {
      console.error(`❌ AlertaService: Error deleting alert ${id}:`, error);
      throw new Error(`Error eliminando alerta: ${error.message}`);
    }
  }

  /**
   * Obtener alertas por gestante
   */
  async getAlertasByGestante(gestanteId: string) {
    try {
      console.log(`🔍 AlertaService: Fetching alertas for gestante ${gestanteId}`);
      
      const alertas = await prisma.alerta.findMany({
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

      console.log(`✅ AlertaService: Found ${alertas.length} alertas for gestante ${gestanteId}`);
      return alertas;
    } catch (error) {
      console.error(`❌ AlertaService: Error fetching alertas for gestante ${gestanteId}:`, error);
      throw new Error(`Error obteniendo alertas de gestante: ${error.message}`);
    }
  }

  /**
   * Obtener alertas activas
   */
  async getAlertasActivas() {
    try {
      console.log('🔍 AlertaService: Fetching active alertas');
      
      const alertas = await prisma.alerta.findMany({
        where: { resuelta: false },
        include: {
          gestante: {
            select: {
              id: true,
              nombre: true,
              documento: true,
              telefono: true,
              municipio: {
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

      console.log(`✅ AlertaService: Found ${alertas.length} active alertas`);
      return alertas;
    } catch (error) {
      console.error('❌ AlertaService: Error fetching active alertas:', error);
      throw new Error(`Error obteniendo alertas activas: ${error.message}`);
    }
  }


  /**
   * Crear alerta con evaluación automática
   */
  async createAlertaConEvaluacion(data: any) {
    try {
      console.log('🚨 AlertaService: Creating alert with evaluation');
      
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
      console.error('❌ AlertaService: Error creating alert with evaluation:', error);
      throw error;
    }
  }

  /**
   * Crear alerta SOS con notificaciones completas
   */
  async notificarEmergencia(gestanteId: string, coordenadas: [number, number]) {
    console.log('🚨 AlertaService: Creating SOS emergency alert...');
    console.log(`   Gestante ID: ${gestanteId}`);
    console.log(`   Coordinates: [${coordenadas[0]}, ${coordenadas[1]}]`);

    const startTime = Date.now();

    try {
      // Obtener información completa de la gestante
      const gestanteCompleta = await prisma.gestante.findUnique({
        where: { id: gestanteId },
        include: {
          municipio: true,
          madrina: {
            include: {
              municipio: true,
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
      const alertaSOS = await prisma.alerta.create({
        data: {
          gestante_id: gestanteId,
          madrina_id: gestanteCompleta.madrina_id || null,
          tipo_alerta: 'sos',
          nivel_prioridad: 'critica',
          mensaje: mensajeDetallado,
          coordenadas_alerta: {
            type: 'Point',
            coordinates: coordenadas
          } as any,
          resuelta: false,
          fecha_resolucion: null,
        }
      });

      console.log(`✅ AlertaService: SOS alert created with ID: ${alertaSOS.id}`);

      const duration = Date.now() - startTime;
      console.log(`⏱️ AlertaService: SOS alert created in ${duration}ms`);

      return alertaSOS;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error('❌ AlertaService: Error creating SOS alert:', error);
      throw new Error(`Error creando alerta SOS: ${error}`);
    }
  }
}