"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.obtenerConversacion = exports.eliminarConversacion = exports.buscarConversaciones = exports.obtenerEstadisticas = exports.marcarComoLeido = exports.obtenerMensajes = exports.enviarMensaje = exports.obtenerConversaciones = exports.crearConversacion = void 0;
const mensaje_service_1 = require("../services/mensaje.service");
const logger_1 = require("../config/logger");
const mensajeService = new mensaje_service_1.MensajeService();
/**
 * Crear conversación
 * POST /api/mensajes/conversaciones
 */
const crearConversacion = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Usuario no autenticado' });
        }
        const dto = {
            tipo: req.body.tipo || 'individual',
            participantes: req.body.participantes || [userId],
            titulo: req.body.titulo,
            gestanteId: req.body.gestanteId,
        };
        // Asegurar que el usuario actual esté en los participantes
        if (!dto.participantes.includes(userId)) {
            dto.participantes.push(userId);
        }
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
        const conversaciones = await mensajeService.obtenerConversaciones(userId);
        res.status(200).json({
            success: true,
            data: conversaciones,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.obtenerConversaciones = obtenerConversaciones;
/**
 * Enviar mensaje
 * POST /api/mensajes/conversaciones/:id/mensajes
 */
const enviarMensaje = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Usuario no autenticado' });
        }
        const dto = {
            conversacionId: req.params.id,
            contenido: req.body.contenido,
            tipo: req.body.tipo || 'texto',
            archivoUrl: req.body.archivoUrl,
            metadata: req.body.metadata,
            respondiendoA: req.body.respondiendoA,
        };
        const mensaje = await mensajeService.enviarMensaje(dto, userId);
        logger_1.logger.info('Mensaje enviado', { userId, mensajeId: mensaje?.id });
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
        const conversacionId = req.params.id;
        const limit = req.query.limit ? parseInt(req.query.limit) : 50;
        const offset = req.query.offset ? parseInt(req.query.offset) : 0;
        const mensajes = await mensajeService.obtenerMensajes(conversacionId, userId, limit, offset);
        res.status(200).json({
            success: true,
            data: mensajes,
            total: mensajes.length,
            hasMore: mensajes.length === limit,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.obtenerMensajes = obtenerMensajes;
/**
 * Marcar mensajes como leídos
 * PUT /api/mensajes/conversaciones/:id/leer
 */
const marcarComoLeido = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Usuario no autenticado' });
        }
        const conversacionId = req.params.id;
        await mensajeService.marcarComoLeido(conversacionId, userId);
        res.status(200).json({
            success: true,
            message: 'Mensajes marcados como leídos',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.marcarComoLeido = marcarComoLeido;
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
 * Buscar conversaciones
 * GET /api/mensajes/buscar
 */
const buscarConversaciones = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Usuario no autenticado' });
        }
        const query = req.query.q;
        if (!query) {
            return res.status(400).json({ error: 'Query de búsqueda requerido' });
        }
        const conversaciones = await mensajeService.buscarConversaciones(userId, query);
        res.status(200).json({
            success: true,
            data: conversaciones,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.buscarConversaciones = buscarConversaciones;
/**
 * Eliminar conversación
 * DELETE /api/mensajes/conversaciones/:id
 */
const eliminarConversacion = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Usuario no autenticado' });
        }
        const conversacionId = req.params.id;
        await mensajeService.eliminarConversacion(conversacionId, userId);
        res.status(200).json({
            success: true,
            message: 'Conversación eliminada exitosamente',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.eliminarConversacion = eliminarConversacion;
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
        // Obtener la conversación verificando que el usuario tenga acceso
        const mensajes = await mensajeService.obtenerMensajes(conversacionId, userId, 1, 0);
        if (mensajes.length === 0) {
            return res.status(404).json({ error: 'Conversación no encontrada' });
        }
        const conversaciones = await mensajeService.obtenerConversaciones(userId);
        const conversacion = conversaciones.find(c => c.id === conversacionId);
        if (!conversacion) {
            return res.status(404).json({ error: 'Conversación no encontrada' });
        }
        res.status(200).json({
            success: true,
            data: conversacion,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.obtenerConversacion = obtenerConversacion;
