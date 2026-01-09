// src/routes/meows-dashboard.routes.ts
// Rutas para dashboard de análisis MEOWS

import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import {
  getMEOWSStats,
  getCriticalAlerts,
  getGestanteMEOWSTrend,
  getRiskRanking,
  getCommonAlerts,
} from '../controllers/meows-dashboard.controller';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

/**
 * @route   GET /api/meows/dashboard/stats
 * @desc    Obtener estadísticas generales de MEOWS
 * @access  Private (Todos los usuarios autenticados)
 * @query   {
 *   fecha_inicio?: string,
 *   fecha_fin?: string,
 *   municipio_id?: string
 * }
 */
router.get('/stats', getMEOWSStats);

/**
 * @route   GET /api/meows/dashboard/critical-alerts
 * @desc    Obtener controles con alertas críticas
 * @access  Private (Todos los usuarios autenticados)
 * @query   {
 *   limit?: number,
 *   offset?: number
 * }
 */
router.get('/critical-alerts', getCriticalAlerts);

/**
 * @route   GET /api/meows/dashboard/gestante/:gestanteId/trend
 * @desc    Obtener tendencia de MEOWS para una gestante específica
 * @access  Private (Todos los usuarios autenticados)
 * @params  gestanteId: string
 */
router.get('/gestante/:gestanteId/trend', getGestanteMEOWSTrend);

/**
 * @route   GET /api/meows/dashboard/risk-ranking
 * @desc    Obtener ranking de gestantes por riesgo MEOWS
 * @access  Private (Todos los usuarios autenticados)
 * @query   {
 *   municipio_id?: string,
 *   limit?: number
 * }
 */
router.get('/risk-ranking', getRiskRanking);

/**
 * @route   GET /api/meows/dashboard/common-alerts
 * @desc    Obtener alertas MEOWS más comunes
 * @access  Private (Todos los usuarios autenticados)
 * @query   {
 *   fecha_inicio?: string,
 *   fecha_fin?: string
 * }
 */
router.get('/common-alerts', getCommonAlerts);

export default router;
