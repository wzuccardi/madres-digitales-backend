"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const websocket_controller_1 = require("../controllers/websocket.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Aplicar autenticación a todas las rutas
router.use(auth_middleware_1.authMiddleware);
/**
 * @route   GET /api/websocket/stats
 * @desc    Obtener estadísticas de conexiones WebSocket
 * @access  Private (Solo Administradores)
 */
router.get('/stats', websocket_controller_1.getWebSocketStats);
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
router.post('/test-notification', websocket_controller_1.sendTestNotification);
/**
 * @route   POST /api/websocket/disconnect/:userId
 * @desc    Desconectar usuario específico
 * @access  Private (Solo Administradores)
 * @params  userId: string
 */
router.post('/disconnect/:userId', websocket_controller_1.disconnectUser);
/**
 * @route   POST /api/websocket/maintenance
 * @desc    Enviar aviso de mantenimiento a todos los usuarios
 * @access  Private (Solo Administradores)
 * @body    {
 *   message: string,
 *   disconnect_in?: number (segundos)
 * }
 */
router.post('/maintenance', websocket_controller_1.broadcastMaintenance);
exports.default = router;
