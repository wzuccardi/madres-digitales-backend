// Rutas para reportes y estadísticas
import { Router } from 'express';
import {
    getResumenGeneral,
    getEstadisticasGestantes,
    getEstadisticasControles,
    getEstadisticasAlertas,
    getEstadisticasRiesgo,
    getTendencias
} from '../controllers/reporte.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Ruta raíz para /api/reportes (redirige a resumen-general)
router.get('/', authMiddleware, getResumenGeneral);

/**
 * @swagger
 * /api/reportes/resumen-general:
 *   get:
 *     summary: Obtener resumen general del sistema
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Resumen general obtenido exitosamente
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/resumen-general', authMiddleware, getResumenGeneral);

/**
 * @swagger
 * /api/reportes/estadisticas-gestantes:
 *   get:
 *     summary: Obtener estadísticas de gestantes por municipio
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/estadisticas-gestantes', authMiddleware, getEstadisticasGestantes);

/**
 * @swagger
 * /api/reportes/estadisticas-controles:
 *   get:
 *     summary: Obtener estadísticas de controles prenatales
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fecha_inicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio del período (opcional)
 *       - in: query
 *         name: fecha_fin
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin del período (opcional)
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/estadisticas-controles', authMiddleware, getEstadisticasControles);

/**
 * @swagger
 * /api/reportes/estadisticas-alertas:
 *   get:
 *     summary: Obtener estadísticas de alertas
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/estadisticas-alertas', authMiddleware, getEstadisticasAlertas);

/**
 * @swagger
 * /api/reportes/estadisticas-riesgo:
 *   get:
 *     summary: Obtener estadísticas de distribución de riesgo
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/estadisticas-riesgo', authMiddleware, getEstadisticasRiesgo);

/**
 * @swagger
 * /api/reportes/tendencias:
 *   get:
 *     summary: Obtener tendencias temporales
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: meses
 *         schema:
 *           type: integer
 *           default: 6
 *         description: Número de meses a analizar
 *     responses:
 *       200:
 *         description: Tendencias obtenidas exitosamente
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/tendencias', authMiddleware, getTendencias);

export default router;

