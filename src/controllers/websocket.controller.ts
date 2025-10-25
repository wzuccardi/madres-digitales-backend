import { Request, Response } from 'express';
import { WebSocketService } from '../services/websocket.service';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    rol: string;
    municipio_id?: string;
  };
}

/**
 * Obtener estadísticas de conexiones WebSocket
 */
export const getWebSocketStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
    }

    // Solo administradores pueden ver estadísticas completas
    if (user.rol !== 'administrador' && user.rol !== 'super_admin') {
      return res.status(403).json({
        success: false,
        error: 'Acceso denegado. Solo administradores pueden ver estadísticas de WebSocket.'
      });
    }

    // Obtener estadísticas del servicio WebSocket global
    const webSocketService = (global as any).webSocketService as WebSocketService;
    
    if (!webSocketService) {
      return res.status(503).json({
        success: false,
        error: 'Servicio WebSocket no disponible'
      });
    }

    const stats = webSocketService.getConnectionStats();

    res.json({
      success: true,
      data: {
        ...stats,
        timestamp: new Date(),
        server_uptime: process.uptime()
      }
    });

  } catch (error) {
    console.error('❌ WebSocketController: Error getting stats:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Enviar notificación de prueba via WebSocket
 */
export const sendTestNotification = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
    }

    // Solo administradores pueden enviar notificaciones de prueba
    if (user.rol !== 'administrador' && user.rol !== 'super_admin') {
      return res.status(403).json({
        success: false,
        error: 'Acceso denegado. Solo administradores pueden enviar notificaciones de prueba.'
      });
    }

    const { message, target_type, target_id } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Mensaje es requerido'
      });
    }

    const webSocketService = (global as any).webSocketService as WebSocketService;
    
    if (!webSocketService) {
      return res.status(503).json({
        success: false,
        error: 'Servicio WebSocket no disponible'
      });
    }

    const testNotification = {
      type: 'test_notification',
      message,
      from: `${user.id} (${user.rol})`,
      timestamp: new Date()
    };

    // Enviar según el tipo de destino
    switch (target_type) {
      case 'user':
        if (!target_id) {
          return res.status(400).json({
            success: false,
            error: 'target_id es requerido para notificaciones de usuario'
          });
        }
        webSocketService.notifyUser(target_id, 'test_notification', testNotification);
        break;

      case 'role':
        if (!target_id) {
          return res.status(400).json({
            success: false,
            error: 'target_id es requerido para notificaciones de rol'
          });
        }
        webSocketService.notifyRole(target_id, 'test_notification', testNotification);
        break;

      case 'municipio':
        if (!target_id) {
          return res.status(400).json({
            success: false,
            error: 'target_id es requerido para notificaciones de municipio'
          });
        }
        webSocketService.notifyMunicipio(target_id, 'test_notification', testNotification);
        break;

      case 'admin':
        webSocketService.notifyAdmins('test_notification', testNotification);
        break;

      default:
        return res.status(400).json({
          success: false,
          error: 'target_type debe ser: user, role, municipio, o admin'
        });
    }

    res.json({
      success: true,
      message: 'Notificación de prueba enviada exitosamente',
      data: {
        target_type,
        target_id,
        message,
        sent_at: new Date()
      }
    });

  } catch (error) {
    console.error('❌ WebSocketController: Error sending test notification:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Desconectar usuario específico
 */
export const disconnectUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
    }

    // Solo administradores pueden desconectar usuarios
    if (user.rol !== 'administrador' && user.rol !== 'super_admin') {
      return res.status(403).json({
        success: false,
        error: 'Acceso denegado. Solo administradores pueden desconectar usuarios.'
      });
    }

    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId es requerido'
      });
    }

    const webSocketService = (global as any).webSocketService as WebSocketService;
    
    if (!webSocketService) {
      return res.status(503).json({
        success: false,
        error: 'Servicio WebSocket no disponible'
      });
    }

    webSocketService.disconnectUser(userId);

    res.json({
      success: true,
      message: `Usuario ${userId} desconectado exitosamente`,
      disconnected_by: user.id,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('❌ WebSocketController: Error disconnecting user:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Enviar aviso de mantenimiento
 */
export const broadcastMaintenance = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
    }

    // Solo administradores pueden enviar avisos de mantenimiento
    if (user.rol !== 'administrador' && user.rol !== 'super_admin') {
      return res.status(403).json({
        success: false,
        error: 'Acceso denegado. Solo administradores pueden enviar avisos de mantenimiento.'
      });
    }

    const { message, disconnect_in } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Mensaje es requerido'
      });
    }

    const webSocketService = (global as any).webSocketService as WebSocketService;
    
    if (!webSocketService) {
      return res.status(503).json({
        success: false,
        error: 'Servicio WebSocket no disponible'
      });
    }

    webSocketService.broadcastMaintenance(message, disconnect_in);

    res.json({
      success: true,
      message: 'Aviso de mantenimiento enviado exitosamente',
      data: {
        message,
        disconnect_in,
        sent_by: user.id,
        timestamp: new Date()
      }
    });

  } catch (error) {
    console.error('❌ WebSocketController: Error broadcasting maintenance:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};