"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketService = void 0;
exports.initializeWebSocket = initializeWebSocket;
exports.getWebSocketService = getWebSocketService;
const socket_io_1 = require("socket.io");
const logger_1 = require("../config/logger");
const jwt_utils_1 = require("../utils/jwt.utils");
/**
 * Servicio de WebSocket para comunicación en tiempo real
 */
class WebSocketService {
    constructor(httpServer) {
        this.userSockets = new Map(); // userId -> Set<socketId>
        this.io = new socket_io_1.Server(httpServer, {
            cors: {
                origin: process.env.FRONTEND_URL || 'http://localhost:3008',
                credentials: true,
            },
            path: '/socket.io',
        });
        this.setupMiddleware();
        this.setupEventHandlers();
        logger_1.logger.info('WebSocket service initialized');
    }
    /**
     * Configurar middleware de autenticación
     */
    setupMiddleware() {
        this.io.use(async (socket, next) => {
            try {
                const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
                if (!token) {
                    return next(new Error('Authentication error: No token provided'));
                }
                const decoded = await (0, jwt_utils_1.verifyToken)(token);
                socket.userId = decoded.id;
                socket.userName = decoded.nombre;
                logger_1.logger.info('Socket authenticated', {
                    socketId: socket.id,
                    userId: socket.userId,
                });
                next();
            }
            catch (error) {
                logger_1.logger.error('Socket authentication failed', { error });
                next(new Error('Authentication error'));
            }
        });
    }
    /**
     * Configurar manejadores de eventos
     */
    setupEventHandlers() {
        this.io.on('connection', (socket) => {
            const userId = socket.userId;
            const userName = socket.userName;
            logger_1.logger.info('Client connected', {
                socketId: socket.id,
                userId,
                userName,
            });
            // Registrar socket del usuario
            this.registerUserSocket(userId, socket.id);
            // Unirse a sala personal del usuario
            socket.join(`user:${userId}`);
            // Notificar a otros usuarios que este usuario está online
            socket.broadcast.emit('user:online', { userId, userName });
            // Manejar unirse a conversación
            socket.on('conversation:join', (conversationId) => {
                socket.join(`conversation:${conversationId}`);
                logger_1.logger.info('User joined conversation', {
                    userId,
                    conversationId,
                    socketId: socket.id,
                });
            });
            // Manejar salir de conversación
            socket.on('conversation:leave', (conversationId) => {
                socket.leave(`conversation:${conversationId}`);
                logger_1.logger.info('User left conversation', {
                    userId,
                    conversationId,
                    socketId: socket.id,
                });
            });
            // Manejar usuario escribiendo
            socket.on('typing:start', (data) => {
                socket.to(`conversation:${data.conversationId}`).emit('typing:start', {
                    userId,
                    userName,
                    conversationId: data.conversationId,
                });
            });
            // Manejar usuario dejó de escribir
            socket.on('typing:stop', (data) => {
                socket.to(`conversation:${data.conversationId}`).emit('typing:stop', {
                    userId,
                    conversationId: data.conversationId,
                });
            });
            // Manejar mensaje leído
            socket.on('message:read', (data) => {
                socket.to(`conversation:${data.conversationId}`).emit('message:read', {
                    messageId: data.messageId,
                    userId,
                    timestamp: new Date(),
                });
            });
            // Manejar desconexión
            socket.on('disconnect', () => {
                this.unregisterUserSocket(userId, socket.id);
                logger_1.logger.info('Client disconnected', {
                    socketId: socket.id,
                    userId,
                });
                // Notificar a otros usuarios que este usuario está offline
                // Solo si no tiene más sockets conectados
                if (!this.isUserOnline(userId)) {
                    socket.broadcast.emit('user:offline', { userId });
                }
            });
            // Manejar errores
            socket.on('error', (error) => {
                logger_1.logger.error('Socket error', {
                    error,
                    socketId: socket.id,
                    userId,
                });
            });
        });
    }
    /**
     * Registrar socket de usuario
     */
    registerUserSocket(userId, socketId) {
        if (!this.userSockets.has(userId)) {
            this.userSockets.set(userId, new Set());
        }
        this.userSockets.get(userId).add(socketId);
    }
    /**
     * Desregistrar socket de usuario
     */
    unregisterUserSocket(userId, socketId) {
        const sockets = this.userSockets.get(userId);
        if (sockets) {
            sockets.delete(socketId);
            if (sockets.size === 0) {
                this.userSockets.delete(userId);
            }
        }
    }
    /**
     * Verificar si usuario está online
     */
    isUserOnline(userId) {
        const sockets = this.userSockets.get(userId);
        return sockets ? sockets.size > 0 : false;
    }
    /**
     * Enviar mensaje nuevo a conversación
     */
    sendMessageToConversation(conversationId, message) {
        this.io.to(`conversation:${conversationId}`).emit('message:new', message);
        logger_1.logger.info('Message sent to conversation', {
            conversationId,
            messageId: message.id,
        });
    }
    /**
     * Enviar notificación a usuario específico
     */
    sendNotificationToUser(userId, notification) {
        this.io.to(`user:${userId}`).emit('notification', notification);
        logger_1.logger.info('Notification sent to user', {
            userId,
            type: notification.type,
        });
    }
    /**
     * Enviar notificación a múltiples usuarios
     */
    sendNotificationToUsers(userIds, notification) {
        userIds.forEach((userId) => {
            this.sendNotificationToUser(userId, notification);
        });
    }
    /**
     * Obtener usuarios online
     */
    getOnlineUsers() {
        return Array.from(this.userSockets.keys());
    }
    /**
     * Obtener número de usuarios online
     */
    getOnlineUserCount() {
        return this.userSockets.size;
    }
    /**
     * Verificar si usuario específico está online
     */
    isUserConnected(userId) {
        return this.isUserOnline(userId);
    }
    /**
     * Enviar actualización de conversación
     */
    sendConversationUpdate(conversationId, update) {
        this.io.to(`conversation:${conversationId}`).emit('conversation:update', update);
        logger_1.logger.info('Conversation update sent', {
            conversationId,
            updateType: update.type,
        });
    }
    /**
     * Broadcast a todos los usuarios conectados
     */
    broadcast(event, data) {
        this.io.emit(event, data);
        logger_1.logger.info('Broadcast sent', {
            event,
            recipientCount: this.getOnlineUserCount(),
        });
    }
    /**
     * Obtener instancia de Socket.IO
     */
    getIO() {
        return this.io;
    }
    /**
     * Cerrar servidor WebSocket
     */
    close() {
        this.io.close();
        logger_1.logger.info('WebSocket service closed');
    }
}
exports.WebSocketService = WebSocketService;
// Instancia singleton
let webSocketService = null;
/**
 * Inicializar servicio WebSocket
 */
function initializeWebSocket(httpServer) {
    if (!webSocketService) {
        webSocketService = new WebSocketService(httpServer);
    }
    return webSocketService;
}
/**
 * Obtener instancia del servicio WebSocket
 */
function getWebSocketService() {
    if (!webSocketService) {
        throw new Error('WebSocket service not initialized');
    }
    return webSocketService;
}
