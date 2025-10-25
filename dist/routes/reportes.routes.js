"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Rutas para reportes y estadísticas
const express_1 = require("express");
const reporte_controller_1 = require("../controllers/reporte.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Ruta raíz para /api/reportes (redirige a resumen-general)
router.get('/', auth_middleware_1.authMiddleware, reporte_controller_1.getResumenGeneral);
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
router.get('/resumen-general', auth_middleware_1.authMiddleware, reporte_controller_1.getResumenGeneral);
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
router.get('/estadisticas-gestantes', auth_middleware_1.authMiddleware, reporte_controller_1.getEstadisticasGestantes);
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
router.get('/estadisticas-controles', auth_middleware_1.authMiddleware, reporte_controller_1.getEstadisticasControles);
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
router.get('/estadisticas-alertas', auth_middleware_1.authMiddleware, reporte_controller_1.getEstadisticasAlertas);
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
router.get('/estadisticas-riesgo', auth_middleware_1.authMiddleware, reporte_controller_1.getEstadisticasRiesgo);
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
router.get('/tendencias', auth_middleware_1.authMiddleware, reporte_controller_1.getTendencias);
exports.default = router;
