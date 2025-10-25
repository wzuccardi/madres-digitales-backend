import { Router } from 'express';
import {
  getWebSocketStats,
  sendTestNotification,
  disconnectUser,
  broadcastMaintenance
} from '../controllers/websocket.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Aplicar autenticación a todas las rutas
router.use(authMiddleware);

/**
 * @route   GET /api/websocket/stats
 * @desc    Obtener estadísticas de conexiones WebSocket
 * @access  Private (Solo Administradores)
 */
router.get('/stats', getWebSocketStats);

/**
 * @route   POST /api/websocket/test-notification
 * @desc    Enviar notificación de prueba via WebSocket
 * @access  Private (Solo Administradores)
 * @body    {
 *   message: string,
 *   target_type: 'user' | 'role' | 'municipio' | 'admin',
 *   target_id?: string
 * }
 */
router.post('/test-notification', sendTestNotification);

/**
 * @route   POST /api/websocket/disconnect/:userId
 * @desc    Desconectar usuario específico
 * @access  Private (Solo Administradores)
 * @params  userId: string
 */
router.post('/disconnect/:userId', disconnectUser);

/**
 * @route   POST /api/websocket/maintenance
 * @desc    Enviar aviso de mantenimiento a todos los usuarios
 * @access  Private (Solo Administradores)
 * @body    {
 *   message: string,
 *   disconnect_in?: number (segundos)
 * }
 */
router.post('/maintenance', broadcastMaintenance);

export default router;
