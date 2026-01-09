import { PrismaClient } from '@prisma/client';
import { logger } from '../config/logger';

const prisma = new PrismaClient();

export interface CrearConversacionDTO {
  tipo: string;
  participantes: string[];
  titulo?: string;
  gestanteId?: string;
}

export interface CrearMensajeDTO {
  conversacionId: string;
  contenido: string;
  tipo?: string;
  archivoUrl?: string;
  metadata?: any;
  respondiendoA?: string;
}

export class MensajeService {
  /**
   * Crear una nueva conversación
   */
  async crearConversacion(dto: CrearConversacionDTO, usuarioId: string) {
    try {
      logger.info('MensajeService: Creando conversación', {
        tipo: dto.tipo,
        participantes: dto.participantes,
        usuarioId,
      });

      const conversacion = await prisma.conversacion.create({
        data: {
          tipo: dto.tipo,
          participantes: dto.participantes,
          activa: true,
        },
      });

      logger.info('Conversación creada', {
        conversacionId: conversacion.id,
        usuarioId,
      });

      return conversacion;
    } catch (error) {
      logger.error('Error creando conversación', { error, usuarioId });
      throw error;
    }
  }

  /**
   * Enviar mensaje
   */
  async enviarMensaje(dto: CrearMensajeDTO, usuarioId: string) {
    try {
      logger.info('MensajeService: Enviando mensaje', {
        conversacionId: dto.conversacionId,
        usuarioId,
      });

      // Crear el mensaje
      const mensaje = await prisma.mensaje.create({
        data: {
          conversacion_id: dto.conversacionId,
          remitente_id: usuarioId,
          contenido: dto.contenido,
          tipo: dto.tipo || 'texto',
          archivo_url: dto.archivoUrl,
          metadata: dto.metadata,
          leido: false,
        },
      });

      // Actualizar última actividad de la conversación
      await prisma.conversacion.update({
        where: { id: dto.conversacionId },
        data: {
          ultimo_mensaje_id: mensaje.id,
          fecha_ultimo_mensaje: new Date(),
          fecha_actualizacion: new Date(),
        },
      });

      // Obtener información completa del mensaje
      const mensajeCompleto = await prisma.mensaje.findUnique({
        where: { id: mensaje.id },
        include: {
          conversacion: true,
        },
      });

      logger.info('Mensaje enviado', {
        mensajeId: mensaje.id,
        conversacionId: dto.conversacionId,
        usuarioId,
      });

      return mensajeCompleto;
    } catch (error) {
      logger.error('Error enviando mensaje', { error, usuarioId });
      throw error;
    }
  }

  /**
   * Obtener conversaciones del usuario
   */
  async obtenerConversaciones(usuarioId: string) {
    try {
      logger.info('MensajeService: Obteniendo conversaciones', { usuarioId });

      // Simplificado: obtener todas las conversaciones activas
      const conversaciones = await prisma.conversacion.findMany({
        where: {
          activa: true,
        },
        include: {
          mensajes: {
            take: 1,
            orderBy: { fecha_creacion: 'desc' },
          },
        },
        orderBy: { fecha_ultimo_mensaje: 'desc' },
      });

      // Filtrar conversaciones donde el usuario es participante
      const conversacionesFiltradas = conversaciones.filter(conv => {
        const participantes = conv.participantes as string[];
        return Array.isArray(participantes) && participantes.includes(usuarioId);
      });

      return conversacionesFiltradas.map(conv => ({
        id: conv.id,
        tipo: conv.tipo,
        participantes: conv.participantes,
        ultimoMensaje: conv.mensajes[0] || null,
        fechaUltimoMensaje: conv.fecha_ultimo_mensaje,
        activa: conv.activa,
      }));
    } catch (error) {
      logger.error('Error obteniendo conversaciones', { error, usuarioId });
      throw error;
    }
  }

  /**
   * Obtener mensajes de una conversación
   */
  async obtenerMensajes(conversacionId: string, usuarioId: string, limit = 50, offset = 0) {
    try {
      logger.info('MensajeService: Obteniendo mensajes', {
        conversacionId,
        usuarioId,
        limit,
        offset,
      });

      // Verificar que el usuario pertenece a la conversación
      const conversacion = await prisma.conversacion.findUnique({
        where: { id: conversacionId },
      });

      if (!conversacion) {
        throw new Error('Conversación no encontrada');
      }

      // Verificar participación (simplificado)
      const participantes = conversacion.participantes as string[];
      if (!Array.isArray(participantes) || !participantes.includes(usuarioId)) {
        throw new Error('Acceso denegado a la conversación');
      }

      const mensajes = await prisma.mensaje.findMany({
        where: {
          conversacion_id: conversacionId,
        },
        orderBy: { fecha_creacion: 'desc' },
        take: limit,
        skip: offset,
      });

      return mensajes.reverse(); // Devolver en orden cronológico
    } catch (error) {
      logger.error('Error obteniendo mensajes', { error, conversacionId, usuarioId });
      throw error;
    }
  }

  /**
   * Marcar mensajes como leídos
   */
  async marcarComoLeido(conversacionId: string, usuarioId: string) {
    try {
      logger.info('MensajeService: Marcando mensajes como leídos', {
        conversacionId,
        usuarioId,
      });

      await prisma.mensaje.updateMany({
        where: {
          conversacion_id: conversacionId,
          remitente_id: { not: usuarioId },
          leido: false,
        },
        data: {
          leido: true,
          fecha_lectura: new Date(),
        },
      });

      logger.info('Mensajes marcados como leídos', {
        conversacionId,
        usuarioId,
      });
    } catch (error) {
      logger.error('Error marcando mensajes como leídos', { error, conversacionId, usuarioId });
      throw error;
    }
  }

  /**
   * Obtener estadísticas de mensajería del usuario
   */
  async obtenerEstadisticas(usuarioId: string) {
    try {
      logger.info('MensajeService: Obteniendo estadísticas', { usuarioId });

      // Simplificado: contar todas las conversaciones y mensajes
      const totalConversaciones = await prisma.conversacion.count({
        where: { activa: true },
      });

      const conversacionesActivas = totalConversaciones;

      const mensajesNoLeidos = await prisma.mensaje.count({
        where: {
          remitente_id: { not: usuarioId },
          leido: false,
        },
      });

      return {
        totalConversaciones,
        conversacionesActivas,
        mensajesNoLeidos,
      };
    } catch (error) {
      logger.error('Error obteniendo estadísticas de mensajería', { error, usuarioId });
      throw error;
    }
  }

  /**
   * Buscar conversaciones
   */
  async buscarConversaciones(usuarioId: string, query: string) {
    try {
      logger.info('MensajeService: Buscando conversaciones', { usuarioId, query });

      const conversaciones = await prisma.conversacion.findMany({
        where: {
          activa: true,
          mensajes: {
            some: {
              contenido: {
                contains: query,
                mode: 'insensitive',
              },
            },
          },
        },
        include: {
          mensajes: {
            where: {
              contenido: {
                contains: query,
                mode: 'insensitive',
              },
            },
            take: 5,
            orderBy: { fecha_creacion: 'desc' },
          },
        },
      });

      return conversaciones;
    } catch (error) {
      logger.error('Error buscando conversaciones', { error, usuarioId, query });
      throw error;
    }
  }

  /**
   * Eliminar conversación
   */
  async eliminarConversacion(conversacionId: string, usuarioId: string) {
    try {
      logger.info('MensajeService: Eliminando conversación', {
        conversacionId,
        usuarioId,
      });

      // Verificar que la conversación existe
      const conversacion = await prisma.conversacion.findUnique({
        where: { id: conversacionId },
      });

      if (!conversacion) {
        throw new Error('Conversación no encontrada');
      }

      // Marcar como inactiva en lugar de eliminar
      await prisma.conversacion.update({
        where: { id: conversacionId },
        data: { activa: false },
      });

      logger.info('Conversación eliminada', {
        conversacionId,
        usuarioId,
      });
    } catch (error) {
      logger.error('Error eliminando conversación', { error, conversacionId, usuarioId });
      throw error;
    }
  }
}