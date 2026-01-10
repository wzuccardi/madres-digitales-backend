// src/services/meows-notification.service.ts
// Servicio de notificaciones para alertas MEOWS críticas

import { PrismaClient } from '@prisma/client';
import { WebSocketService } from './websocket.service';

export interface MEOWSNotificationData {
  controlId: string;
  gestanteId: string;
  gestanteNombre: string;
  madrinaId?: string;
  madrinaNombre?: string;
  meowsScore: number;
  alertLevel: string;
  triggeredAlerts: string[];
  recommendations: string[];
  vitalSigns: {
    respiratoryRate?: number;
    heartRate?: number;
    systolicBP?: number;
    diastolicBP?: number;
    temperature?: number;
    consciousness?: string;
  };
}

export class MEOWSNotificationService {
  private prisma: PrismaClient;
  private wsService: WebSocketService;

  constructor(prisma: PrismaClient, wsService?: WebSocketService) {
    this.prisma = prisma;
    this.wsService = wsService || new WebSocketService();
  }

  /**
   * Enviar notificación de alerta MEOWS crítica
   */
  async sendCriticalAlert(data: MEOWSNotificationData): Promise<void> {
    try {
      console.log(`🚨 Enviando notificación MEOWS crítica - Score: ${data.meowsScore}`);

      // 1. Notificar vía WebSocket a usuarios relevantes
      await this.notifyViaWebSocket(data);

      // 2. Registrar en logs
      await this.logNotification(data);

      // 3. TODO: Enviar notificación push (Firebase)
      // await this.sendPushNotification(data);

      // 4. TODO: Enviar SMS si es crítico
      // if (data.meowsScore >= 7) {
      //   await this.sendSMS(data);
      // }

      console.log(`✅ Notificación MEOWS enviada exitosamente`);
    } catch (error) {
      console.error('❌ Error enviando notificación MEOWS:', error);
      throw error;
    }
  }

  /**
   * Notificar vía WebSocket
   */
  private async notifyViaWebSocket(data: MEOWSNotificationData): Promise<void> {
    const notification = {
      type: 'meows_critical_alert',
      timestamp: new Date().toISOString(),
      data: {
        controlId: data.controlId,
        gestanteId: data.gestanteId,
        gestanteNombre: data.gestanteNombre,
        madrinaId: data.madrinaId,
        madrinaNombre: data.madrinaNombre,
        meowsScore: data.meowsScore,
        alertLevel: data.alertLevel,
        triggeredAlerts: data.triggeredAlerts,
        recommendations: data.recommendations,
        vitalSigns: data.vitalSigns,
        priority: 'CRITICAL',
        requiresAction: true,
      },
    };

    // Enviar a todos los usuarios relevantes
    const recipients = await this.getNotificationRecipients(data.gestanteId, data.madrinaId);

    for (const recipient of recipients) {
      try {
        await this.wsService.emit(`user:${recipient.id}:meows_alert`, notification);
        console.log(`📤 Notificación MEOWS enviada a usuario ${recipient.id} (${recipient.rol})`);
      } catch (error) {
        console.error(`⚠️ Error enviando notificación a ${recipient.id}:`, error);
      }
    }

    // Broadcast general para admins y coordinadores
    await this.wsService.emit('meows:critical_alert', notification);
  }

  /**
   * Obtener destinatarios de la notificación
   */
  private async getNotificationRecipients(gestanteId: string, madrinaId?: string): Promise<any[]> {
    const recipients: any[] = [];

    try {
      // 1. Obtener gestante con sus relaciones
      const gestante = await this.prisma.gestantes.findUnique({
        where: { id: gestanteId },
        include: {
          madrina: true,
          medico_tratante: true,
        },
      });

      if (!gestante) return recipients;

      // 2. Agregar madrina
      if (gestante.madrina) {
        recipients.push({
          id: gestante.madrina.id,
          nombre: gestante.madrina.nombre,
          rol: 'madrina',
          email: gestante.madrina.email,
        });
      }

      // 3. Agregar médico tratante
      if (gestante.medico_tratante) {
        recipients.push({
          id: gestante.medico_tratante.id,
          nombre: gestante.medico_tratante.nombre,
          rol: 'medico',
          email: gestante.medico_tratante.email,
        });
      }

      // 4. Agregar coordinadores del municipio
      if (gestante.municipio_id) {
        const coordinadores = await this.prisma.usuarios.findMany({
          where: {
            rol: 'COORDINADOR',
            municipio_id: gestante.municipio_id,
            activo: true,
          },
        });

        recipients.push(...coordinadores.map(c => ({
          id: c.id,
          nombre: c.nombre,
          rol: 'coordinador',
          email: c.email,
        })));
      }

      // 5. Agregar admins y super admins
      const admins = await this.prisma.usuarios.findMany({
        where: {
          rol: { in: ['ADMIN', 'SUPER_ADMIN'] },
          activo: true,
        },
      });

      recipients.push(...admins.map(a => ({
        id: a.id,
        nombre: a.nombre,
        rol: a.rol.toLowerCase(),
        email: a.email,
      })));

      return recipients;
    } catch (error) {
      console.error('❌ Error obteniendo destinatarios:', error);
      return recipients;
    }
  }

  /**
   * Registrar notificación en logs
   */
  private async logNotification(data: MEOWSNotificationData): Promise<void> {
    try {
      await this.prisma.logs.create({
        data: {
          id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          tipo: 'meows_notification',
          nivel: 'critical',
          mensaje: `Alerta MEOWS crítica - Score: ${data.meowsScore} - Gestante: ${data.gestanteNombre}`,
          datos: {
            controlId: data.controlId,
            gestanteId: data.gestanteId,
            meowsScore: data.meowsScore,
            alertLevel: data.alertLevel,
            triggeredAlerts: data.triggeredAlerts,
            recommendations: data.recommendations,
          },
        },
      });
    } catch (error) {
      console.error('⚠️ Error registrando log de notificación:', error);
    }
  }

  /**
   * Enviar notificación push (Firebase Cloud Messaging)
   * TODO: Implementar cuando se configure Firebase
   */
  private async sendPushNotification(data: MEOWSNotificationData): Promise<void> {
    // Implementar integración con Firebase Cloud Messaging
    console.log('📱 TODO: Enviar notificación push para MEOWS crítico');
  }

  /**
   * Enviar SMS de emergencia
   * TODO: Implementar cuando se configure servicio SMS
   */
  private async sendSMS(data: MEOWSNotificationData): Promise<void> {
    // Implementar integración con servicio SMS (Twilio, AWS SNS, etc.)
    console.log('📲 TODO: Enviar SMS de emergencia para MEOWS crítico');
  }

  /**
   * Obtener estadísticas de notificaciones MEOWS
   */
  async getNotificationStats(startDate?: Date, endDate?: Date): Promise<any> {
    try {
      const where: any = {
        tipo: 'meows_notification',
      };

      if (startDate || endDate) {
        where.fecha_creacion = {};
        if (startDate) where.fecha_creacion.gte = startDate;
        if (endDate) where.fecha_creacion.lte = endDate;
      }

      const [total, byLevel] = await Promise.all([
        this.prisma.logs.count({ where }),
        this.prisma.logs.groupBy({
          by: ['nivel'],
          where,
          _count: { id: true },
        }),
      ]);

      return {
        total,
        byLevel: byLevel.reduce((acc, item) => {
          acc[item.nivel] = item._count.id;
          return acc;
        }, {} as Record<string, number>),
        period: {
          start: startDate,
          end: endDate,
        },
      };
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas de notificaciones:', error);
      throw error;
    }
  }
}
