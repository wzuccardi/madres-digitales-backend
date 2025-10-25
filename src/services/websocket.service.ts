import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { PermissionService } from './permission.service';
import { log } from '../config/logger';

export interface SocketUser {
  userId: string;
  role: string;
  municipioId?: string;
  socketId: string;
  connectedAt: Date;
}

export interface AlertNotification {
  id: string;
  type: 'nueva_alerta' | 'alerta_actualizada' | 'alerta_resuelta';
  alerta: {
    id: string;
    tipo_alerta: string;
    nivel_prioridad: string;
    mensaje: string;
    gestante: {
      id: string;
      nombre: string;
      apellido: string;
    };
    fecha_creacion: Date;
  };
  timestamp: Date;
}

export class WebSocketService {
  private io: SocketIOServer;
  private connectedUsers: Map<string, SocketUser> = new Map();
  private permissionService: PermissionService;

  constructor(server: HttpServer) {
    this.permissionService = new PermissionService();
    
    this.io = new SocketIOServer(server, {
      cors: {
        origin: "*", // En producción, especificar dominios permitidos
        methods: ["GET", "POST"]
      },
      transports: ['websocket', 'polling']
    });

    this.setupEventHandlers();
    console.log('🔌 WebSocketService initialized');
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`🔌 New WebSocket connection: ${socket.id}`);

      // Manejar autenticación
      socket.on('authenticate', async (data) => {
        try {
          const { userId, token } = data;
          
          // Aquí deberías validar el token JWT
          // Por simplicidad, asumimos que el userId es válido
          
          const permissions = await this.permissionService.getUserPermissions(userId);
          
          const user: SocketUser = {
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
          log.info('WebSocket user authenticated', { userId, role: permissions.role });

        } catch (error) {
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

  private async joinUserRooms(socket: any, user: SocketUser) {
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
  async notifyAlert(notification: AlertNotification) {
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
        } catch (error) {
          console.error(`❌ Error checking permissions for user ${user.userId}:`, error);
        }
      }
      
      // Para alertas críticas, notificar también a administradores
      if (notification.alerta.nivel_prioridad === 'critica') {
        this.io.to('admin').emit('critical_alert', notification);
        console.log(`🚨 Critical alert notification sent to administrators`);
      }
      
    } catch (error) {
      console.error('❌ WebSocketService: Error broadcasting alert notification:', error);
      log.error('WebSocket alert notification error', { error: error.message, alertId: notification.alerta.id });
    }
  }

  /**
   * Envía notificación a un usuario específico
   */
  notifyUser(userId: string, event: string, data: any) {
    this.io.to(`user_${userId}`).emit(event, data);
    console.log(`📱 Notification sent to user ${userId}: ${event}`);
  }

  /**
   * Envía notificación a todos los usuarios de un rol específico
   */
  notifyRole(role: string, event: string, data: any) {
    this.io.to(`role_${role}`).emit(event, data);
    console.log(`📱 Notification sent to role ${role}: ${event}`);
  }

  /**
   * Envía notificación a todos los usuarios de un municipio
   */
  notifyMunicipio(municipioId: string, event: string, data: any) {
    this.io.to(`municipio_${municipioId}`).emit(event, data);
    console.log(`📱 Notification sent to municipio ${municipioId}: ${event}`);
  }

  /**
   * Envía notificación a todos los administradores
   */
  notifyAdmins(event: string, data: any) {
    this.io.to('admin').emit(event, data);
    console.log(`📱 Notification sent to administrators: ${event}`);
  }

  /**
   * Obtiene estadísticas de conexiones WebSocket
   */
  getConnectionStats() {
    const stats = {
      totalConnections: this.connectedUsers.size,
      usersByRole: {} as { [role: string]: number },
      usersByMunicipio: {} as { [municipio: string]: number }
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
  disconnectUser(userId: string) {
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
  broadcastMaintenance(message: string, disconnectIn?: number) {
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