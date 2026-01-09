import { Router } from 'express';
import {
  evaluateGestanteAlerts,
  runMassiveEvaluation,
  getPrioritizedAlerts,
  getAlertStats,
  resolveAlert,
  getCriticalAlerts,
  scheduleAutoEvaluation,
} from '../controllers/smart-alerts.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

/**
 * @swagger
 * /api/smart-alerts/gestante/{gestanteId}/evaluate:
 *   post:
 *     summary: Evaluar alertas para una gestante específica
 *     tags: [Smart Alerts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: gestanteId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la gestante
 *     responses:
 *       200:
 *         description: Evaluación completada exitosamente
 *       401:
 *         description: No autorizado
 */
router.post('/gestante/:gestanteId/evaluate', evaluateGestanteAlerts);

/**
 * @swagger
 * /api/smart-alerts/evaluate-all:
 *   post:
 *     summary: Ejecutar evaluación masiva de alertas para todas las gestantes
 *     tags: [Smart Alerts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Evaluación masiva completada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     gestantesEvaluadas:
 *                       type: number
 *                     alertasGeneradas:
 *                       type: number
 *       401:
 *         description: No autorizado
 */
router.post('/evaluate-all', runMassiveEvaluation);

/**
 * @swagger
 * /api/smart-alerts/prioritized:
 *   get:
 *     summary: Obtener alertas priorizadas por ubicación y riesgo
 *     tags: [Smart Alerts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: municipioId
 *         schema:
 *           type: string
 *         description: ID del municipio (opcional)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *         description: Límite de resultados (default 50)
 *     responses:
 *       200:
 *         description: Alertas priorizadas obtenidas exitosamente
 *       401:
 *         description: No autorizado
 */
router.get('/prioritized', getPrioritizedAlerts);

/**
 * @swagger
 * /api/smart-alerts/critical:
 *   get:
 *     summary: Obtener alertas críticas en tiempo real
 *     tags: [Smart Alerts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: municipioId
 *         schema:
 *           type: string
 *         description: ID del municipio (opcional)
 *     responses:
 *       200:
 *         description: Alertas críticas obtenidas exitosamente
 *       401:
 *         description: No autorizado
 */
router.get('/critical', getCriticalAlerts);

/**
 * @swagger
 * /api/smart-alerts/stats:
 *   get:
 *     summary: Obtener estadísticas de alertas por prioridad y tipo
 *     tags: [Smart Alerts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: municipioId
 *         schema:
 *           type: string
 *         description: ID del municipio (opcional)
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     resumen:
 *                       type: object
 *                       properties:
 *                         totalAlertas:
 *                           type: number
 *                         alertasRecientes:
 *                           type: number
 *                         alertasPendientes:
 *                           type: number
 *                     porPrioridad:
 *                       type: object
 *                     porTipo:
 *                       type: object
 *       401:
 *         description: No autorizado
 */
router.get('/stats', getAlertStats);

/**
 * @swagger
 * /api/smart-alerts/{alertaId}/resolve:
 *   put:
 *     summary: Marcar alerta como resuelta
 *     tags: [Smart Alerts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: alertaId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la alerta
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               observaciones:
 *                 type: string
 *                 description: Observaciones sobre la resolución
 *     responses:
 *       200:
 *         description: Alerta resuelta exitosamente
 *       401:
 *         description: No autorizado
 */
router.put('/:alertaId/resolve', resolveAlert);

/**
 * @swagger
 * /api/smart-alerts/schedule:
 *   post:
 *     summary: Programar evaluación automática de alertas
 *     tags: [Smart Alerts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               intervalHours:
 *                 type: number
 *                 description: Intervalo en horas para la evaluación automática (default 6)
 *     responses:
 *       200:
 *         description: Evaluación automática programada
 *       401:
 *         description: No autorizado
 */
router.post('/schedule', scheduleAutoEvaluation);

export default router;
