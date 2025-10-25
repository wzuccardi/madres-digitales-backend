"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketService = void 0;
const socket_io_1 = require("socket.io");
const permission_service_1 = require("./permission.service");
const logger_1 = require("../config/logger");
class WebSocketService {
    constructor(server) {
        this.connectedUsers = new Map();
        this.permissionService = new permission_service_1.PermissionService();
        this.io = new socket_io_1.Server(server, {
            cors: {
                origin: "*", // En producción, especificar dominios permitidos
                methods: ["GET", "POST"]
            },
            transports: ['websocket', 'polling']
        });
        this.setupEventHandlers();
        console.log('🔌 WebSocketService initialized');
    }
    setupEventHandlers() {
        this.io.on('connection', (socket) => {
            console.log(`🔌 New WebSocket connection: ${socket.id}`);
            // Manejar autenticación
            socket.on('authenticate', async (data) => {
                try {
                    const { userId, token } = data;
                    // Aquí deberías validar el token JWT
                    // Por simplicidad, asumimos que el userId es válido
                    const permissions = await this.permissionService.getUserPermissions(userId);
                    const user = {
                        userId,
                        role: permissions.role,
                        municipioId: permissions.municipioId,
                        socketId: socket.id,
                        connectedAt: new Date()
                    };
                    this.connectedUsers.set(socket.id, user);
                    // Unir a rooms basados en permisos
                    await this.joinUserRooms(socket, user);
                    socket.emit('authenticated', {
                        success: true,
                        user: {
                            id: userId,
                            role: permissions.role,
                            municipioId: permissions.municipioId
                        }
                    });
                    console.log(`✅ User ${userId} authenticated via WebSocket`);
                    logger_1.log.info('WebSocket user authenticated', { userId, role: permissions.role });
                }
                catch (error) {
                    console.error('❌ WebSocket authentication error:', error);
                    socket.emit('authenticated', { success: false, error: 'Authentication failed' });
                }
            });
            // Manejar desconexión
            socket.on('disconnect', () => {
                const user = this.connectedUsers.get(socket.id);
                if (user) {
                    console.log(`🔌 User ${user.userId} disconnected from WebSocket`);
                    this.connectedUsers.delete(socket.id);
                }
            });
            // Manejar ping para mantener conexión
            socket.on('ping', () => {
                socket.emit('pong');
            });
        });
    }
    async joinUserRooms(socket, user) {
        // Room general para el usuario
        socket.join(`user_${user.userId}`);
        // Room por rol
        socket.join(`role_${user.role}`);
        // Room por municipio (para coordinadores)
        if (user.municipioId) {
            socket.join(`municipio_${user.municipioId}`);
        }
        // Room para administradores
        if (user.role === 'administrador') {
            socket.join('admin');
        }
        console.log(`🏠 User ${user.userId} joined rooms: user_${user.userId}, role_${user.role}${user.municipioId ? `, municipio_${user.municipioId}` : ''}`);
    }
    /**
     * Envía notificación de alerta a usuarios específicos según permisos
     */
    async notifyAlert(notification) {
        try {
            console.log(`📢 WebSocketService: Broadcasting alert notification ${notification.alerta.id}`);
            const gestanteId = notification.alerta.gestante.id;
            // Obtener usuarios que pueden ver esta gestante
            const connectedUsersArray = Array.from(this.connectedUsers.values());
            for (const user of connectedUsersArray) {
                try {
                    const canAccess = await this.permissionService.canAccessGestante(user.userId, gestanteId);
                    if (canAccess) {
                        this.io.to(`user_${user.userId}`).emit('alert_notification', notification);
                        console.log(`📱 Alert notification sent to user ${user.userId}`);
                    }
                }
                catch (error) {
                    console.error(`❌ Error checking permissions for user ${user.userId}:`, error);
                }
            }
            // Para alertas críticas, notificar también a administradores
            if (notification.alerta.nivel_prioridad === 'critica') {
                this.io.to('admin').emit('critical_alert', notification);
                console.log(`🚨 Critical alert notification sent to administrators`);
            }
        }
        catch (error) {
            console.error('❌ WebSocketService: Error broadcasting alert notification:', error);
            logger_1.log.error('WebSocket alert notification error', { error: error.message, alertId: notification.alerta.id });
        }
    }
    /**
     * Envía notificación a un usuario específico
     */
    notifyUser(userId, event, data) {
        this.io.to(`user_${userId}`).emit(event, data);
        console.log(`📱 Notification sent to user ${userId}: ${event}`);
    }
    /**
     * Envía notificación a todos los usuarios de un rol específico
     */
    notifyRole(role, event, data) {
        this.io.to(`role_${role}`).emit(event, data);
        console.log(`📱 Notification sent to role ${role}: ${event}`);
    }
    /**
     * Envía notificación a todos los usuarios de un municipio
     */
    notifyMunicipio(municipioId, event, data) {
        this.io.to(`municipio_${municipioId}`).emit(event, data);
        console.log(`📱 Notification sent to municipio ${municipioId}: ${event}`);
    }
    /**
     * Envía notificación a todos los administradores
     */
    notifyAdmins(event, data) {
        this.io.to('admin').emit(event, data);
        console.log(`📱 Notification sent to administrators: ${event}`);
    }
    /**
     * Obtiene estadísticas de conexiones WebSocket
     */
    getConnectionStats() {
        const stats = {
            totalConnections: this.connectedUsers.size,
            usersByRole: {},
            usersByMunicipio: {}
        };
        for (const user of this.connectedUsers.values()) {
            // Contar por rol
            stats.usersByRole[user.role] = (stats.usersByRole[user.role] || 0) + 1;
            // Contar por municipio
            if (user.municipioId) {
                stats.usersByMunicipio[user.municipioId] = (stats.usersByMunicipio[user.municipioId] || 0) + 1;
            }
        }
        return stats;
    }
    /**
     * Desconecta a un usuario específico
     */
    disconnectUser(userId) {
        for (const [socketId, user] of this.connectedUsers.entries()) {
            if (user.userId === userId) {
                const socket = this.io.sockets.sockets.get(socketId);
                if (socket) {
                    socket.disconnect(true);
                    console.log(`🔌 User ${userId} forcibly disconnected`);
                }
                break;
            }
        }
    }
    /**
     * Envía mensaje de mantenimiento a todos los usuarios conectados
     */
    broadcastMaintenance(message, disconnectIn) {
        this.io.emit('maintenance_notice', {
            message,
            disconnectIn,
            timestamp: new Date()
        });
        if (disconnectIn) {
            setTimeout(() => {
                this.io.disconnectSockets(true);
                console.log('🔧 All users disconnected for maintenance');
            }, disconnectIn * 1000);
        }
    }
}
exports.WebSocketService = WebSocketService;
