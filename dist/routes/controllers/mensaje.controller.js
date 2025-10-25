"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buscarMensajes = exports.obtenerEstadisticas = exports.eliminarParticipante = exports.agregarParticipante = exports.marcarComoLeido = exports.obtenerMensajes = exports.enviarMensaje = exports.obtenerConversacion = exports.obtenerConversaciones = exports.crearConversacion = void 0;
const mensaje_service_1 = require("../services/mensaje.service");
const mensaje_dto_1 = require("../core/application/dtos/mensaje.dto");
const logger_1 = require("../config/logger");
const mensajeService = new mensaje_service_1.MensajeService();
/**
 * Crear nueva conversación
 * POST /api/mensajes/conversaciones
 */
const crearConversacion = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Usuario no autenticado' });
        }
        const dto = mensaje_dto_1.crearConversacionSchema.parse(req.body);
        const conversacion = await mensajeService.crearConversacion(dto, userId);
        logger_1.logger.info('Conversación creada', { userId, conversacionId: conversacion.id });
        res.status(201).json({
            success: true,
            message: 'Conversación creada exitosamente',
            data: conversacion,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.crearConversacion = crearConversacion;
/**
 * Obtener conversaciones del usuario
 * GET /api/mensajes/conversaciones
 */
const obtenerConversaciones = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Usuario no autenticado' });
        }
        const dto = mensaje_dto_1.buscarConversacionesSchema.parse({
            query: req.query.query,
            tipo: req.query.tipo,
            gestanteId: req.query.gestanteId,
            limit: req.query.limit ? parseInt(req.query.limit) : undefined,
            offset: req.query.offset ? parseInt(req.query.offset) : undefined,
        });
        const result = await mensajeService.obtenerConversaciones(dto, userId);
        res.status(200).json({
            success: true,
            data: result.conversaciones,
            total: result.total,
            limit: dto.limit,
            offset: dto.offset,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.obtenerConversaciones = obtenerConversaciones;
/**
 * Obtener conversación por ID
 * GET /api/mensajes/conversaciones/:id
 */
const obtenerConversacion = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Usuario no autenticado' });
        }
        const conversacionId = req.params.id;
        const result = await mensajeService.obtenerConversaciones({ conversacionId, limit: 1, offset: 0 }, userId);
        if (result.conversaciones.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Conversación no encontrada',
            });
        }
        res.status(200).json({
            success: true,
            data: result.conversaciones[0],
        });
    }
    catch (error) {
        next(error);
    }
};
exports.obtenerConversacion = obtenerConversacion;
/**
 * Enviar mensaje
 * POST /api/mensajes/conversaciones/:id/mensajes
 */
const enviarMensaje = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const userName = req.user?.nombre;
        if (!userId || !userName) {
            return res.status(401).json({ error: 'Usuario no autenticado' });
        }
        const dto = mensaje_dto_1.enviarMensajeSchema.parse({
            ...req.body,
            conversacionId: req.params.id,
        });
        const mensaje = await mensajeService.enviarMensaje(dto, userId, userName);
        logger_1.logger.info('Mensaje enviado', { userId, mensajeId: mensaje.id });
        res.status(201).json({
            success: true,
            message: 'Mensaje enviado exitosamente',
            data: mensaje,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.enviarMensaje = enviarMensaje;
/**
 * Obtener mensajes de una conversación
 * GET /api/mensajes/conversaciones/:id/mensajes
 */
const obtenerMensajes = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Usuario no autenticado' });
        }
        const dto = mensaje_dto_1.obtenerMensajesSchema.parse({
            conversacionId: req.params.id,
            limit: req.query.limit ? parseInt(req.query.limit) : undefined,
            offset: req.query.offset ? parseInt(req.query.offset) : undefined,
            antes: req.query.antes,
        });
        const result = await mensajeService.obtenerMensajes(dto, userId);
        res.status(200).json({
            success: true,
            data: result.mensajes,
            total: result.total,
            hasMore: result.hasMore,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.obtenerMensajes = obtenerMensajes;
/**
 * Marcar mensaje como leído
 * POST /api/mensajes/:id/leer
 */
const marcarComoLeido = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Usuario no autenticado' });
        }
        const mensajeId = req.params.id;
        await mensajeService.marcarComoLeido(mensajeId, userId);
        res.status(200).json({
            success: true,
            message: 'Mensaje marcado como leído',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.marcarComoLeido = marcarComoLeido;
/**
 * Agregar participante a conversación
 * POST /api/mensajes/conversaciones/:id/participantes
 */
const agregarParticipante = async (req, res, next) => {
    try {
        const dto = mensaje_dto_1.agregarParticipanteSchema.parse({
            conversacionId: req.params.id,
            usuarioId: req.body.usuarioId,
        });
        await mensajeService.agregarParticipante(dto);
        res.status(200).json({
            success: true,
            message: 'Participante agregado exitosamente',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.agregarParticipante = agregarParticipante;
/**
 * Eliminar participante de conversación
 * DELETE /api/mensajes/conversaciones/:id/participantes/:usuarioId
 */
const eliminarParticipante = async (req, res, next) => {
    try {
        const dto = mensaje_dto_1.eliminarParticipanteSchema.parse({
            conversacionId: req.params.id,
            usuarioId: req.params.usuarioId,
        });
        await mensajeService.eliminarParticipante(dto);
        res.status(200).json({
            success: true,
            message: 'Participante eliminado exitosamente',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.eliminarParticipante = eliminarParticipante;
/**
 * Obtener estadísticas de mensajería
 * GET /api/mensajes/estadisticas
 */
const obtenerEstadisticas = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Usuario no autenticado' });
        }
        const estadisticas = await mensajeService.obtenerEstadisticas(userId);
        res.status(200).json({
            success: true,
            data: estadisticas,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.obtenerEstadisticas = obtenerEstadisticas;
/**
 * Buscar mensajes
 * GET /api/mensajes/buscar
 */
const buscarMensajes = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Usuario no autenticado' });
        }
        const query = req.query.q;
        // TODO: Implementar búsqueda de mensajes
        res.status(200).json({
            success: true,
            data: [],
            message: 'Búsqueda de mensajes - Por implementar',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.buscarMensajes = buscarMensajes;
