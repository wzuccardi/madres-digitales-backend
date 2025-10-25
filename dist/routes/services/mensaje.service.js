"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MensajeService = void 0;
const database_1 = __importDefault(require("../config/database"));
const mensaje_dto_1 = require("../core/application/dtos/mensaje.dto");
const logger_1 = require("../config/logger");
const not_found_error_1 = require("../core/domain/errors/not-found.error");
const forbidden_error_1 = require("../core/domain/errors/forbidden.error");
const websocket_service_1 = require("./websocket.service");
class MensajeService {
    /**
     * Crear nueva conversación
     */
    async crearConversacion(dto, usuarioId) {
        try {
            // Verificar que el usuario esté en la lista de participantes
            if (!dto.participantes.includes(usuarioId)) {
                dto.participantes.push(usuarioId);
            }
            const conversacion = await database_1.default.conversacion.create({
                data: {
                    titulo: dto.titulo,
                    tipo: dto.tipo,
                    participantes: dto.participantes,
                    gestante_id: dto.gestanteId,
                },
            });
            logger_1.logger.info('Conversación creada', {
                conversacionId: conversacion.id,
                tipo: dto.tipo,
                participantes: dto.participantes.length,
            });
            return this._mapConversacion(conversacion);
        }
        catch (error) {
            logger_1.logger.error('Error creando conversación', { error, dto });
            throw error;
        }
    }
    /**
     * Enviar mensaje
     */
    async enviarMensaje(dto, usuarioId, usuarioNombre) {
        try {
            // Verificar que la conversación existe y el usuario es participante
            const conversacion = await database_1.default.conversacion.findUnique({
                where: { id: dto.conversacionId },
            });
            if (!conversacion) {
                throw new not_found_error_1.NotFoundError('Conversación no encontrada');
            }
            const participantes = conversacion.participantes;
            if (!participantes.includes(usuarioId)) {
                throw new forbidden_error_1.ForbiddenError('No eres participante de esta conversación');
            }
            // Crear mensaje
            const mensaje = await database_1.default.mensaje.create({
                data: {
                    conversacion_id: dto.conversacionId,
                    remitente_id: usuarioId,
                    remitente_nombre: usuarioNombre,
                    tipo: dto.tipo,
                    contenido: dto.contenido,
                    archivo_url: dto.archivoUrl,
                    archivo_nombre: dto.archivoNombre,
                    archivo_tipo: dto.archivoTipo,
                    archivo_tamano: dto.archivoTamano,
                    ubicacion: dto.ubicacion,
                    metadata: dto.metadata,
                    respondiendo_a: dto.respondiendoA,
                },
            });
            // Actualizar conversación
            await database_1.default.conversacion.update({
                where: { id: dto.conversacionId },
                data: {
                    ultimo_mensaje: dto.contenido.substring(0, 100),
                    ultimo_mensaje_fecha: new Date(),
                    updated_at: new Date(),
                },
            });
            logger_1.logger.info('Mensaje enviado', {
                mensajeId: mensaje.id,
                conversacionId: dto.conversacionId,
                tipo: dto.tipo,
            });
            // Enviar mensaje en tiempo real via WebSocket
            try {
                const wsService = (0, websocket_service_1.getWebSocketService)();
                const mensajeMapped = this._mapMensaje(mensaje);
                wsService.sendMessageToConversation(dto.conversacionId, mensajeMapped);
                // Enviar notificación a participantes (excepto remitente)
                const otrosParticipantes = participantes.filter(id => id !== usuarioId);
                otrosParticipantes.forEach(participanteId => {
                    wsService.sendNotificationToUser(participanteId, {
                        type: 'new_message',
                        conversacionId: dto.conversacionId,
                        mensaje: mensajeMapped,
                    });
                });
            }
            catch (error) {
                logger_1.logger.error('Error enviando mensaje via WebSocket', { error });
                // No fallar si WebSocket falla
            }
            return this._mapMensaje(mensaje);
        }
        catch (error) {
            logger_1.logger.error('Error enviando mensaje', { error, dto });
            throw error;
        }
    }
    /**
     * Obtener mensajes de una conversación
     */
    async obtenerMensajes(dto, usuarioId) {
        try {
            // Verificar que el usuario es participante
            const conversacion = await database_1.default.conversacion.findUnique({
                where: { id: dto.conversacionId },
            });
            if (!conversacion) {
                throw new not_found_error_1.NotFoundError('Conversación no encontrada');
            }
            const participantes = conversacion.participantes;
            if (!participantes.includes(usuarioId)) {
                throw new forbidden_error_1.ForbiddenError('No eres participante de esta conversación');
            }
            // Construir filtro
            const where = {
                conversacion_id: dto.conversacionId,
                eliminado: false,
            };
            if (dto.antes) {
                where.created_at = {
                    lt: new Date(dto.antes),
                };
            }
            // Obtener mensajes
            const [mensajes, total] = await Promise.all([
                database_1.default.mensaje.findMany({
                    where,
                    orderBy: { created_at: 'desc' },
                    take: dto.limit,
                    skip: dto.offset,
                }),
                database_1.default.mensaje.count({ where }),
            ]);
            const hasMore = dto.offset + mensajes.length < total;
            return {
                mensajes: mensajes.map(this._mapMensaje),
                total,
                hasMore,
            };
        }
        catch (error) {
            logger_1.logger.error('Error obteniendo mensajes', { error, dto });
            throw error;
        }
    }
    /**
     * Obtener conversaciones del usuario
     */
    async obtenerConversaciones(dto, usuarioId) {
        try {
            // Construir filtro
            const where = {
                participantes: {
                    path: '$',
                    array_contains: usuarioId,
                },
                activo: true,
            };
            if (dto.tipo) {
                where.tipo = dto.tipo;
            }
            if (dto.gestanteId) {
                where.gestante_id = dto.gestanteId;
            }
            // Obtener conversaciones
            const [conversaciones, total] = await Promise.all([
                database_1.default.conversacion.findMany({
                    where,
                    orderBy: { ultimo_mensaje_fecha: 'desc' },
                    take: dto.limit,
                    skip: dto.offset,
                }),
                database_1.default.conversacion.count({ where }),
            ]);
            // Obtener información de participantes y últimos mensajes
            const conversacionesConInfo = await Promise.all(conversaciones.map(async (conv) => {
                const participantes = conv.participantes;
                // Obtener info de participantes
                const usuarios = await database_1.default.usuario.findMany({
                    where: { id: { in: participantes } },
                    select: { id: true, nombre: true, rol: true },
                });
                // Obtener últimos 10 mensajes
                const mensajes = await database_1.default.mensaje.findMany({
                    where: {
                        conversacion_id: conv.id,
                        eliminado: false,
                    },
                    orderBy: { created_at: 'desc' },
                    take: 10,
                });
                return {
                    ...this._mapConversacion(conv),
                    mensajes: mensajes.map(this._mapMensaje).reverse(),
                    participantesInfo: usuarios,
                };
            }));
            return {
                conversaciones: conversacionesConInfo,
                total,
            };
        }
        catch (error) {
            logger_1.logger.error('Error obteniendo conversaciones', { error, dto });
            throw error;
        }
    }
    /**
     * Marcar mensaje como leído
     */
    async marcarComoLeido(mensajeId, usuarioId) {
        try {
            const mensaje = await database_1.default.mensaje.findUnique({
                where: { id: mensajeId },
            });
            if (!mensaje) {
                throw new not_found_error_1.NotFoundError('Mensaje no encontrado');
            }
            // No marcar como leído si es el remitente
            if (mensaje.remitente_id === usuarioId) {
                return;
            }
            const leidoPor = mensaje.leido_por || [];
            if (!leidoPor.includes(usuarioId)) {
                leidoPor.push(usuarioId);
                await database_1.default.mensaje.update({
                    where: { id: mensajeId },
                    data: {
                        leido_por: leidoPor,
                        estado: mensaje_dto_1.MensajeEstado.LEIDO,
                        fecha_leido: new Date(),
                    },
                });
                logger_1.logger.info('Mensaje marcado como leído', { mensajeId, usuarioId });
            }
        }
        catch (error) {
            logger_1.logger.error('Error marcando mensaje como leído', { error, mensajeId });
            throw error;
        }
    }
    /**
     * Agregar participante a conversación
     */
    async agregarParticipante(dto) {
        try {
            const conversacion = await database_1.default.conversacion.findUnique({
                where: { id: dto.conversacionId },
            });
            if (!conversacion) {
                throw new not_found_error_1.NotFoundError('Conversación no encontrada');
            }
            const participantes = conversacion.participantes;
            if (!participantes.includes(dto.usuarioId)) {
                participantes.push(dto.usuarioId);
                await database_1.default.conversacion.update({
                    where: { id: dto.conversacionId },
                    data: { participantes },
                });
                logger_1.logger.info('Participante agregado', dto);
            }
        }
        catch (error) {
            logger_1.logger.error('Error agregando participante', { error, dto });
            throw error;
        }
    }
    /**
     * Eliminar participante de conversación
     */
    async eliminarParticipante(dto) {
        try {
            const conversacion = await database_1.default.conversacion.findUnique({
                where: { id: dto.conversacionId },
            });
            if (!conversacion) {
                throw new not_found_error_1.NotFoundError('Conversación no encontrada');
            }
            const participantes = conversacion.participantes;
            const index = participantes.indexOf(dto.usuarioId);
            if (index > -1) {
                participantes.splice(index, 1);
                await database_1.default.conversacion.update({
                    where: { id: dto.conversacionId },
                    data: { participantes },
                });
                logger_1.logger.info('Participante eliminado', dto);
            }
        }
        catch (error) {
            logger_1.logger.error('Error eliminando participante', { error, dto });
            throw error;
        }
    }
    /**
     * Obtener estadísticas de mensajería del usuario
     */
    async obtenerEstadisticas(usuarioId) {
        try {
            const totalConversaciones = await database_1.default.conversacion.count({
                where: {
                    participantes: {
                        path: '$',
                        array_contains: usuarioId,
                    },
                },
            });
            const conversacionesActivas = await database_1.default.conversacion.count({
                where: {
                    participantes: {
                        path: '$',
                        array_contains: usuarioId,
                    },
                    activo: true,
                },
            });
            // TODO: Calcular mensajes no leídos
            return {
                totalConversaciones,
                conversacionesActivas,
                totalMensajes: 0,
                mensajesNoLeidos: 0,
            };
        }
        catch (error) {
            logger_1.logger.error('Error obteniendo estadísticas', { error, usuarioId });
            throw error;
        }
    }
    // Métodos auxiliares privados
    _mapConversacion(conv) {
        return {
            id: conv.id,
            titulo: conv.titulo,
            tipo: conv.tipo,
            participantes: conv.participantes,
            gestanteId: conv.gestante_id,
            ultimoMensaje: conv.ultimo_mensaje,
            ultimoMensajeFecha: conv.ultimo_mensaje_fecha,
            mensajesNoLeidos: conv.mensajes_no_leidos,
            activo: conv.activo,
            createdAt: conv.created_at,
            updatedAt: conv.updated_at,
        };
    }
    _mapMensaje(msg) {
        return {
            id: msg.id,
            conversacionId: msg.conversacion_id,
            remitenteId: msg.remitente_id,
            remitenteNombre: msg.remitente_nombre,
            tipo: msg.tipo,
            contenido: msg.contenido,
            archivoUrl: msg.archivo_url,
            archivoNombre: msg.archivo_nombre,
            archivoTipo: msg.archivo_tipo,
            archivoTamano: msg.archivo_tamano,
            ubicacion: msg.ubicacion,
            metadata: msg.metadata,
            estado: msg.estado,
            leidoPor: msg.leido_por,
            fechaLeido: msg.fecha_leido,
            respondiendoA: msg.respondiendo_a,
            editado: msg.editado,
            eliminado: msg.eliminado,
            createdAt: msg.created_at,
            updatedAt: msg.updated_at,
        };
    }
}
exports.MensajeService = MensajeService;
