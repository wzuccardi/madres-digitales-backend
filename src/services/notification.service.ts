// src/services/notification.service.ts
// Servicio de notificaciones automáticas para alertas críticas
import prisma from '../config/database';
import { AlertaTipo, PrioridadNivel } from '../types/prisma-enums';
import { ConfiguracionNotificacionesDTO } from '../types/alerta-automatica.dto';
import { WebSocketService, AlertNotification } from './websocket.service';

// ==================== INTERFACES ====================

export interface NotificacionData {
  destinatario_id: string;
  destinatario_tipo: 'madrina' | 'medico' | 'coordinador' | 'emergencias';
  canal: 'sms' | 'email' | 'push' | 'whatsapp';
  titulo: string;
  mensaje: string;
  datos_alerta: {
    alerta_id: string;
    gestante_id: string;
    gestante_nombre: string;
    tipo_alerta: AlertaTipo;
    nivel_prioridad: PrioridadNivel;
    ubicacion?: string;
    telefono_emergencia?: string;
  };
  urgente: boolean;
  intentos_envio: number;
  enviado_en?: Date;
  error_envio?: string;
}

export interface ResultadoNotificacion {
  exitoso: boolean;
  canal: string;
  destinatario: string;
  mensaje_id?: string;
  error?: string;
  tiempo_envio_ms: number;
}

export interface EstadisticasNotificaciones {
  total_enviadas: number;
  exitosas: number;
  fallidas: number;
  por_canal: { [canal: string]: number };
  por_prioridad: { [prioridad: string]: number };
  tiempo_promedio_envio_ms: number;
}

// ==================== SERVICIO PRINCIPAL ====================

export class NotificationService {
  private configuracion: ConfiguracionNotificacionesDTO;
  private colaNotificaciones: NotificacionData[] = [];
  private procesandoCola = false;
  private webSocketService?: WebSocketService;

  constructor(webSocketService?: WebSocketService) {
    this.webSocketService = webSocketService;
    // Configuración por defecto
    this.configuracion = {
      notificar_critica: true,
      notificar_alta: true,
      notificar_media: false,
      notificar_baja: false,
      usar_sms: true,
      usar_email: true,
      usar_push: true,
      usar_whatsapp: false,
      notificar_madrina: true,
      notificar_medico: true,
      notificar_coordinador: true,
      notificar_emergencias: true,
      tiempo_escalamiento_minutos: 15,
      escalamiento_automatico: true
    };

    // Iniciar procesamiento de cola
    this.iniciarProcesadorCola();
  }

  /**
   * Procesa una alerta y envía notificaciones automáticas
   * @param alertaId - ID de la alerta
   * @returns Array de resultados de notificación
   */
  async procesarAlertaParaNotificaciones(alertaId: string): Promise<ResultadoNotificacion[]> {
    console.log(`📱 NotificationService: Processing alert ${alertaId} for notifications...`);

    try {
      // Obtener datos completos de la alerta
      const alerta = await prisma.alerta.findUnique({
        where: { id: alertaId },
        include: {
          // Incluir relaciones necesarias si existen en el esquema
        }
      });

      if (!alerta) {
        throw new Error(`Alerta ${alertaId} no encontrada`);
      }

      // Verificar si debe notificarse según configuración
      if (!this.debeNotificar(alerta.nivel_prioridad as any)) {
        console.log(`📱 NotificationService: Alert priority ${alerta.nivel_prioridad} not configured for notifications`);
        return [];
      }

      // Obtener información de la gestante
      const gestante = await prisma.gestante.findUnique({
        where: { id: alerta.gestante_id }
      });

      if (!gestante) {
        throw new Error(`Gestante ${alerta.gestante_id} no encontrada`);
      }

      // Determinar destinatarios
      const destinatarios = await this.determinarDestinatarios(alerta, gestante);

      // Generar notificaciones
      const notificaciones = await this.generarNotificaciones(alerta, gestante, destinatarios);

      // Enviar notificación WebSocket inmediatamente
      if (this.webSocketService) {
        const wsNotification: AlertNotification = {
          id: `ws_${alerta.id}_${Date.now()}`,
          type: 'nueva_alerta',
          alerta: {
            id: alerta.id,
            tipo_alerta: alerta.tipo_alerta,
            nivel_prioridad: alerta.nivel_prioridad,
            mensaje: alerta.mensaje,
            gestante: {
              id: gestante.id,
              nombre: gestante.nombre,
              apellido: '' // Default value for required field
            },
            fecha_creacion: alerta.fecha_creacion
          },
          timestamp: new Date()
        };

        await this.webSocketService.notifyAlert(wsNotification);
      }

      // Agregar a cola de envío para otros canales
      this.colaNotificaciones.push(...notificaciones);

      console.log(`📱 NotificationService: ${notificaciones.length} notifications queued for alert ${alertaId}`);

      // Si es crítica, procesar inmediatamente
      if (alerta.nivel_prioridad === 'critica') {
        return await this.procesarColaInmediata();
      }

      return [];

    } catch (error) {
      console.error(`❌ NotificationService: Error processing alert ${alertaId}:`, error);
      throw error;
    }
  }

  /**
   * Determina si una alerta debe generar notificaciones
   * @param prioridad - Nivel de prioridad de la alerta
   * @returns true si debe notificarse
   */
  private debeNotificar(prioridad: PrioridadNivel): boolean {
    switch (prioridad) {
      case 'critica': return this.configuracion.notificar_critica;
      case 'alta': return this.configuracion.notificar_alta;
      case 'media': return this.configuracion.notificar_media;
      case 'baja': return this.configuracion.notificar_baja;
      default: return false;
    }
  }

  /**
   * Determina los destinatarios de las notificaciones
   * @param alerta - Datos de la alerta
   * @param gestante - Datos de la gestante
   * @returns Array de destinatarios
   */
  private async determinarDestinatarios(alerta: any, gestante: any): Promise<any[]> {
    const destinatarios = [];

    // Madrina asignada
    if (this.configuracion.notificar_madrina && gestante.madrina_id) {
      const madrina = await prisma.usuario.findUnique({
        where: { id: gestante.madrina_id }
      });
      if (madrina && madrina.activo) {
        destinatarios.push({
          id: madrina.id,
          tipo: 'madrina',
          nombre: madrina.nombre,
          telefono: madrina.telefono,
          email: madrina.email
        });
      }
    }

    // Médico asignado
    if (this.configuracion.notificar_medico && gestante.medico_tratante_id) {
      try {
        const medico = await prisma.medico.findUnique({
          where: { id: gestante.medico_tratante_id }
        });
        if (medico && medico.activo) {
          destinatarios.push({
            id: medico.id,
            tipo: 'medico',
            nombre: medico.nombre,
            telefono: medico.telefono,
            email: medico.email
          });
        }
      } catch (error) {
        console.warn('⚠️ NotificationService: Error fetching medico:', error);
      }
    }

    // Coordinador del municipio
    if (this.configuracion.notificar_coordinador && gestante.municipio_id) {
      const coordinadores = await prisma.usuario.findMany({
        where: {
          rol: 'coordinador',
          activo: true
          // Filtrar por municipio si existe relación
        }
      });
      
      coordinadores.forEach(coordinador => {
        destinatarios.push({
          id: coordinador.id,
          tipo: 'coordinador',
          nombre: coordinador.nombre,
          telefono: coordinador.telefono,
          email: coordinador.email
        });
      });
    }

    // Servicios de emergencia (para alertas críticas)
    if (this.configuracion.notificar_emergencias && alerta.nivel_prioridad === 'critica') {
      destinatarios.push({
        id: 'emergencias-123',
        tipo: 'emergencias',
        nombre: 'Central de Emergencias',
        telefono: '123', // Número de emergencias
        email: 'emergencias@madresdigitales.com'
      });
    }

    return destinatarios;
  }

  /**
   * Genera las notificaciones para todos los destinatarios
   * @param alerta - Datos de la alerta
   * @param gestante - Datos de la gestante
   * @param destinatarios - Lista de destinatarios
   * @returns Array de notificaciones
   */
  private async generarNotificaciones(
    alerta: any, 
    gestante: any, 
    destinatarios: any[]
  ): Promise<NotificacionData[]> {
    const notificaciones: NotificacionData[] = [];

    for (const destinatario of destinatarios) {
      // Determinar canales a usar
      const canales = this.determinarCanales(alerta.nivel_prioridad, destinatario.tipo);

      for (const canal of canales) {
        const { titulo, mensaje } = this.generarMensaje(alerta, gestante, destinatario, canal);

        notificaciones.push({
          destinatario_id: destinatario.id,
          destinatario_tipo: destinatario.tipo,
          canal: canal as 'email' | 'push' | 'sms' | 'whatsapp',
          titulo,
          mensaje,
          datos_alerta: {
            alerta_id: alerta.id,
            gestante_id: gestante.id,
            gestante_nombre: gestante.nombre,
            tipo_alerta: alerta.tipo_alerta,
            nivel_prioridad: alerta.nivel_prioridad,
            ubicacion: this.formatearUbicacion(alerta.coordenadas_alerta),
            telefono_emergencia: gestante.telefono
          },
          urgente: alerta.nivel_prioridad === 'critica',
          intentos_envio: 0
        });
      }
    }

    return notificaciones;
  }

  /**
   * Determina los canales de notificación a usar
   * @param prioridad - Nivel de prioridad
   * @param tipoDestinatario - Tipo de destinatario
   * @returns Array de canales
   */
  private determinarCanales(prioridad: PrioridadNivel, tipoDestinatario: string): string[] {
    const canales = [];

    // Para alertas críticas, usar todos los canales disponibles
    if (prioridad === 'critica') {
      if (this.configuracion.usar_sms) canales.push('sms');
      if (this.configuracion.usar_push) canales.push('push');
      if (this.configuracion.usar_email) canales.push('email');
      if (this.configuracion.usar_whatsapp) canales.push('whatsapp');
    } else {
      // Para otras prioridades, usar canales menos intrusivos
      if (this.configuracion.usar_push) canales.push('push');
      if (this.configuracion.usar_email) canales.push('email');
    }

    return canales;
  }

  /**
   * Genera el mensaje de notificación
   * @param alerta - Datos de la alerta
   * @param gestante - Datos de la gestante
   * @param destinatario - Datos del destinatario
   * @param canal - Canal de notificación
   * @returns Título y mensaje
   */
  private generarMensaje(
    alerta: any, 
    gestante: any, 
    destinatario: any, 
    canal: string
  ): { titulo: string; mensaje: string } {
    const prioridadTexto = this.obtenerTextoPrioridad(alerta.nivel_prioridad);
    const tipoTexto = this.obtenerTextoTipoAlerta(alerta.tipo_alerta);

    let titulo = '';
    let mensaje = '';

    if (alerta.nivel_prioridad === 'critica') {
      titulo = `🚨 EMERGENCIA OBSTÉTRICA - ${prioridadTexto}`;
      mensaje = `URGENTE: ${gestante.nombre} requiere atención médica inmediata.\n\n` +
                `Tipo: ${tipoTexto}\n` +
                `Detalle: ${alerta.mensaje}\n` +
                `Ubicación: ${this.formatearUbicacion(alerta.coordenadas_alerta) || 'No disponible'}\n` +
                `Teléfono: ${gestante.telefono || 'No disponible'}\n\n` +
                `⚠️ ACTUAR INMEDIATAMENTE`;
    } else {
      titulo = `⚠️ Alerta Obstétrica - ${prioridadTexto}`;
      mensaje = `${gestante.nombre} presenta signos de alerta.\n\n` +
                `Tipo: ${tipoTexto}\n` +
                `Detalle: ${alerta.mensaje}\n` +
                `Prioridad: ${prioridadTexto}\n\n` +
                `Favor revisar y tomar acción según protocolo.`;
    }

    // Personalizar según destinatario
    if (destinatario.tipo === 'madrina') {
      mensaje += `\n\n👩‍⚕️ Como madrina asignada, favor contactar inmediatamente.`;
    } else if (destinatario.tipo === 'medico') {
      mensaje += `\n\n🩺 Evaluación médica requerida.`;
    } else if (destinatario.tipo === 'emergencias') {
      mensaje += `\n\n🚑 Activar protocolo de emergencia obstétrica.`;
    }

    return { titulo, mensaje };
  }

  /**
   * Procesa la cola de notificaciones inmediatamente (para alertas críticas)
   * @returns Array de resultados
   */
  private async procesarColaInmediata(): Promise<ResultadoNotificacion[]> {
    const notificacionesCriticas = this.colaNotificaciones.filter(n => n.urgente);
    const resultados: ResultadoNotificacion[] = [];

    for (const notificacion of notificacionesCriticas) {
      const resultado = await this.enviarNotificacion(notificacion);
      resultados.push(resultado);
    }

    // Remover notificaciones procesadas
    this.colaNotificaciones = this.colaNotificaciones.filter(n => !n.urgente);

    return resultados;
  }

  /**
   * Envía una notificación individual
   * @param notificacion - Datos de la notificación
   * @returns Resultado del envío
   */
  private async enviarNotificacion(notificacion: NotificacionData): Promise<ResultadoNotificacion> {
    const startTime = Date.now();

    try {
      console.log(`📱 NotificationService: Sending ${notificacion.canal} to ${notificacion.destinatario_tipo}`);

      // Simular envío según canal
      let exitoso = false;
      let mensajeId = '';

      switch (notificacion.canal) {
        case 'sms':
          exitoso = await this.enviarSMS(notificacion);
          mensajeId = `sms_${Date.now()}`;
          break;
        case 'email':
          exitoso = await this.enviarEmail(notificacion);
          mensajeId = `email_${Date.now()}`;
          break;
        case 'push':
          exitoso = await this.enviarPush(notificacion);
          mensajeId = `push_${Date.now()}`;
          break;
        case 'whatsapp':
          exitoso = await this.enviarWhatsApp(notificacion);
          mensajeId = `whatsapp_${Date.now()}`;
          break;
        default:
          throw new Error(`Canal ${notificacion.canal} no soportado`);
      }

      const tiempoEnvio = Date.now() - startTime;

      if (exitoso) {
        notificacion.enviado_en = new Date();
        console.log(`✅ NotificationService: ${notificacion.canal} sent successfully in ${tiempoEnvio}ms`);
      }

      return {
        exitoso,
        canal: notificacion.canal,
        destinatario: notificacion.destinatario_id,
        mensaje_id: mensajeId,
        tiempo_envio_ms: tiempoEnvio
      };

    } catch (error) {
      const tiempoEnvio = Date.now() - startTime;
      notificacion.error_envio = error instanceof Error ? error.message : 'Unknown error';
      notificacion.intentos_envio++;

      console.error(`❌ NotificationService: Error sending ${notificacion.canal}:`, error);

      return {
        exitoso: false,
        canal: notificacion.canal,
        destinatario: notificacion.destinatario_id,
        error: error instanceof Error ? error.message : 'Unknown error',
        tiempo_envio_ms: tiempoEnvio
      };
    }
  }

  /**
   * Envía SMS (implementación simulada)
   * @param notificacion - Datos de la notificación
   * @returns true si exitoso
   */
  private async enviarSMS(notificacion: NotificacionData): Promise<boolean> {
    // Aquí iría la integración con proveedor de SMS (Twilio, AWS SNS, etc.)
    console.log(`📱 SMS: ${notificacion.mensaje}`);
    
    // Simular latencia de red
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simular 95% de éxito
    return Math.random() > 0.05;
  }

  /**
   * Envía Email (implementación simulada)
   * @param notificacion - Datos de la notificación
   * @returns true si exitoso
   */
  private async enviarEmail(notificacion: NotificacionData): Promise<boolean> {
    // Aquí iría la integración con proveedor de email (SendGrid, AWS SES, etc.)
    console.log(`📧 Email: ${notificacion.titulo} - ${notificacion.mensaje}`);
    
    await new Promise(resolve => setTimeout(resolve, 300));
    return Math.random() > 0.02;
  }

  /**
   * Envía notificación Push (implementación simulada)
   * @param notificacion - Datos de la notificación
   * @returns true si exitoso
   */
  private async enviarPush(notificacion: NotificacionData): Promise<boolean> {
    // Aquí iría la integración con Firebase Cloud Messaging, etc.
    console.log(`🔔 Push: ${notificacion.titulo}`);
    
    await new Promise(resolve => setTimeout(resolve, 200));
    return Math.random() > 0.01;
  }

  /**
   * Envía WhatsApp (implementación simulada)
   * @param notificacion - Datos de la notificación
   * @returns true si exitoso
   */
  private async enviarWhatsApp(notificacion: NotificacionData): Promise<boolean> {
    // Aquí iría la integración con WhatsApp Business API
    console.log(`💬 WhatsApp: ${notificacion.mensaje}`);
    
    await new Promise(resolve => setTimeout(resolve, 400));
    return Math.random() > 0.03;
  }

  /**
   * Inicia el procesador de cola en background
   */
  private iniciarProcesadorCola(): void {
    setInterval(async () => {
      if (!this.procesandoCola && this.colaNotificaciones.length > 0) {
        this.procesandoCola = true;
        await this.procesarCola();
        this.procesandoCola = false;
      }
    }, 5000); // Procesar cada 5 segundos
  }

  /**
   * Procesa la cola de notificaciones no urgentes
   */
  private async procesarCola(): Promise<void> {
    const notificacionesPendientes = this.colaNotificaciones.filter(n => !n.urgente && !n.enviado_en);
    
    for (const notificacion of notificacionesPendientes.slice(0, 10)) { // Procesar máximo 10 por vez
      await this.enviarNotificacion(notificacion);
    }
  }

  /**
   * Utilidades para formateo
   */
  private obtenerTextoPrioridad(prioridad: PrioridadNivel): string {
    const textos = {
      'critica': 'CRÍTICA',
      'alta': 'ALTA',
      'media': 'MEDIA',
      'baja': 'BAJA'
    };
    return textos[prioridad] || 'DESCONOCIDA';
  }

  private obtenerTextoTipoAlerta(tipo: AlertaTipo): string {
    const textos = {
      'emergencia_obstetrica': 'Emergencia Obstétrica',
      'riesgo_alto': 'Riesgo Alto',
      'trabajo_parto': 'Trabajo de Parto',
      'sintoma_alarma': 'Síntoma de Alarma',
      'control_vencido': 'Control Vencido',
      'medicacion': 'Medicación',
      'laboratorio': 'Laboratorio',
      'sos': 'SOS'
    };
    return textos[tipo] || 'Alerta Médica';
  }

  private formatearUbicacion(coordenadas: any): string | null {
    if (!coordenadas) return null;
    
    try {
      if (typeof coordenadas === 'object' && coordenadas.coordinates) {
        const [lng, lat] = coordenadas.coordinates;
        return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      }
    } catch (error) {
      console.warn('⚠️ Error formatting location:', error);
    }
    
    return null;
  }

  /**
   * Actualiza la configuración de notificaciones
   * @param nuevaConfiguracion - Nueva configuración
   */
  async actualizarConfiguracion(nuevaConfiguracion: Partial<ConfiguracionNotificacionesDTO>): Promise<void> {
    this.configuracion = { ...this.configuracion, ...nuevaConfiguracion };
    console.log('📱 NotificationService: Configuration updated');
  }

  /**
   * Obtiene estadísticas de notificaciones
   * @returns Estadísticas del servicio
   */
  async obtenerEstadisticas(): Promise<EstadisticasNotificaciones> {
    // Implementar lógica para obtener estadísticas reales
    return {
      total_enviadas: 0,
      exitosas: 0,
      fallidas: 0,
      por_canal: {},
      por_prioridad: {},
      tiempo_promedio_envio_ms: 0
    };
  }

  /**
   * Notifica actualización de alerta via WebSocket
   */
  async notifyAlertUpdate(alertaId: string, updateType: 'actualizada' | 'resuelta') {
    if (!this.webSocketService) return;

    try {
      const alerta = await prisma.alerta.findUnique({
        where: { id: alertaId },
        include: {
          gestante: {
            select: {
              id: true,
              nombre: true
            }
          }
        }
      });

      if (!alerta) return;

      const wsNotification: AlertNotification = {
        id: `ws_${alertaId}_${updateType}_${Date.now()}`,
        type: updateType === 'actualizada' ? 'alerta_actualizada' : 'alerta_resuelta',
        alerta: {
          id: alerta.id,
          tipo_alerta: alerta.tipo_alerta,
          nivel_prioridad: alerta.nivel_prioridad,
          mensaje: alerta.mensaje,
          gestante: {
            id: alerta.gestante.id,
            nombre: alerta.gestante.nombre,
            apellido: '' // Default value for required field
          },
          fecha_creacion: alerta.fecha_creacion
        },
        timestamp: new Date()
      };

      await this.webSocketService.notifyAlert(wsNotification);
      console.log(`📱 WebSocket notification sent for alert ${updateType}: ${alertaId}`);

    } catch (error) {
      console.error('❌ Error sending WebSocket alert update:', error);
    }
  }

  /**
   * Configura el servicio WebSocket
   */
  setWebSocketService(webSocketService: WebSocketService) {
    this.webSocketService = webSocketService;
    console.log('🔌 WebSocket service configured for notifications');
  }

  /**
   * Obtiene estadísticas de conexiones WebSocket
   */
  getWebSocketStats() {
    return this.webSocketService?.getConnectionStats() || null;
  }
}
