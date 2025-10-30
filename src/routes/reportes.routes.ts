// Rutas para reportes y estadísticas
import { Router } from 'express';
import {
    getResumenGeneral,
    getListaReportes,
    getEstadisticasGestantes,
    getEstadisticasControles,
    getEstadisticasAlertas,
    getEstadisticasRiesgo,
    getTendencias,
    // PDF
    getResumenGeneralPDF,
    getEstadisticasGestantesPDF,
    getEstadisticasAlertasPDF,
    // Excel
    getResumenGeneralExcel,
    getEstadisticasGestantesExcel,
    getEstadisticasControlesExcel,
    getEstadisticasAlertasExcel,
    getEstadisticasRiesgoExcel,
    getTendenciasExcel,
    // Caché
    getCacheEstadisticas,
    clearExpiredCache,
    clearAllCache,
    // Fase 3: Reportes Consolidados
    getReporteMensual,
    getReporteAnual,
    getReportePorMunicipio,
    getComparativa
} from '../controllers/reporte.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Ruta raíz para /api/reportes (devuelve lista de reportes disponibles)
router.get('/', authMiddleware, getListaReportes);

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

// ========== DESCARGAS PDF ==========
/**
 * @swagger
 * /api/reportes/descargar/resumen-general/pdf:
 *   get:
 *     summary: Descargar resumen general como PDF
 *     tags: [Reportes]
 *     responses:
 *       200:
 *         description: PDF descargado exitosamente
 *       500:
 *         description: Error del servidor
 */
router.get('/descargar/resumen-general/pdf', getResumenGeneralPDF);

/**
 * @swagger
 * /api/reportes/descargar/estadisticas-gestantes/pdf:
 *   get:
 *     summary: Descargar estadísticas de gestantes como PDF
 *     tags: [Reportes]
 *     responses:
 *       200:
 *         description: PDF descargado exitosamente
 *       500:
 *         description: Error del servidor
 */
router.get('/descargar/estadisticas-gestantes/pdf', getEstadisticasGestantesPDF);

/**
 * @swagger
 * /api/reportes/descargar/estadisticas-alertas/pdf:
 *   get:
 *     summary: Descargar estadísticas de alertas como PDF
 *     tags: [Reportes]
 *     responses:
 *       200:
 *         description: PDF descargado exitosamente
 *       500:
 *         description: Error del servidor
 */
router.get('/descargar/estadisticas-alertas/pdf', getEstadisticasAlertasPDF);

// ========== DESCARGAS EXCEL ==========
/**
 * @swagger
 * /api/reportes/descargar/resumen-general/excel:
 *   get:
 *     summary: Descargar resumen general como Excel
 *     tags: [Reportes]
 *     responses:
 *       200:
 *         description: Excel descargado exitosamente
 *       500:
 *         description: Error del servidor
 */
router.get('/descargar/resumen-general/excel', getResumenGeneralExcel);

/**
 * @swagger
 * /api/reportes/descargar/estadisticas-gestantes/excel:
 *   get:
 *     summary: Descargar estadísticas de gestantes como Excel
 *     tags: [Reportes]
 *     responses:
 *       200:
 *         description: Excel descargado exitosamente
 *       500:
 *         description: Error del servidor
 */
router.get('/descargar/estadisticas-gestantes/excel', getEstadisticasGestantesExcel);

/**
 * @swagger
 * /api/reportes/descargar/estadisticas-controles/excel:
 *   get:
 *     summary: Descargar estadísticas de controles como Excel
 *     tags: [Reportes]
 *     parameters:
 *       - in: query
 *         name: fecha_inicio
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: fecha_fin
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Excel descargado exitosamente
 *       500:
 *         description: Error del servidor
 */
router.get('/descargar/estadisticas-controles/excel', getEstadisticasControlesExcel);

/**
 * @swagger
 * /api/reportes/descargar/estadisticas-alertas/excel:
 *   get:
 *     summary: Descargar estadísticas de alertas como Excel
 *     tags: [Reportes]
 *     responses:
 *       200:
 *         description: Excel descargado exitosamente
 *       500:
 *         description: Error del servidor
 */
router.get('/descargar/estadisticas-alertas/excel', getEstadisticasAlertasExcel);

/**
 * @swagger
 * /api/reportes/descargar/estadisticas-riesgo/excel:
 *   get:
 *     summary: Descargar estadísticas de riesgo como Excel
 *     tags: [Reportes]
 *     responses:
 *       200:
 *         description: Excel descargado exitosamente
 *       500:
 *         description: Error del servidor
 */
router.get('/descargar/estadisticas-riesgo/excel', getEstadisticasRiesgoExcel);

/**
 * @swagger
 * /api/reportes/descargar/tendencias/excel:
 *   get:
 *     summary: Descargar tendencias como Excel
 *     tags: [Reportes]
 *     parameters:
 *       - in: query
 *         name: meses
 *         schema:
 *           type: integer
 *           default: 6
 *     responses:
 *       200:
 *         description: Excel descargado exitosamente
 *       500:
 *         description: Error del servidor
 */
router.get('/descargar/tendencias/excel', getTendenciasExcel);

// ========== CACHÉ ==========
/**
 * @swagger
 * /api/reportes/cache/estadisticas:
 *   get:
 *     summary: Obtener estadísticas del caché
 *     tags: [Reportes, Caché]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas del caché obtenidas exitosamente
 *       403:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/cache/estadisticas', authMiddleware, getCacheEstadisticas);

/**
 * @swagger
 * /api/reportes/cache/limpiar-expirado:
 *   post:
 *     summary: Limpiar caché expirado
 *     tags: [Reportes, Caché]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Caché expirado limpiado exitosamente
 *       403:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.post('/cache/limpiar-expirado', authMiddleware, clearExpiredCache);

/**
 * @swagger
 * /api/reportes/cache/limpiar-todo:
 *   post:
 *     summary: Limpiar todo el caché (solo super_admin)
 *     tags: [Reportes, Caché]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Caché limpiado completamente
 *       403:
 *         description: No autorizado (solo super_admin)
 *       500:
 *         description: Error del servidor
 */
router.post('/cache/limpiar-todo', authMiddleware, clearAllCache);

// ========== FASE 3: REPORTES CONSOLIDADOS ==========

/**
 * @swagger
 * /api/reportes/consolidados/mensual:
 *   get:
 *     summary: Obtener reporte mensual consolidado
 *     tags: [Reportes, Consolidados]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: mes
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *         description: Mes (1-12, default: mes actual)
 *       - in: query
 *         name: anio
 *         schema:
 *           type: integer
 *         description: Año (default: año actual)
 *     responses:
 *       200:
 *         description: Reporte mensual obtenido exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Sin permisos
 *       500:
 *         description: Error del servidor
 */
router.get('/consolidados/mensual', authMiddleware, getReporteMensual);

/**
 * @swagger
 * /api/reportes/consolidados/anual:
 *   get:
 *     summary: Obtener reporte anual consolidado
 *     tags: [Reportes, Consolidados]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: anio
 *         schema:
 *           type: integer
 *         description: Año (default: año actual)
 *     responses:
 *       200:
 *         description: Reporte anual obtenido exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Sin permisos
 *       500:
 *         description: Error del servidor
 */
router.get('/consolidados/anual', authMiddleware, getReporteAnual);

/**
 * @swagger
 * /api/reportes/consolidados/municipio:
 *   get:
 *     summary: Obtener reporte consolidado por municipio
 *     tags: [Reportes, Consolidados]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: municipio_id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del municipio
 *       - in: query
 *         name: mes
 *         schema:
 *           type: integer
 *         description: Mes (opcional)
 *       - in: query
 *         name: anio
 *         schema:
 *           type: integer
 *         description: Año (opcional)
 *     responses:
 *       200:
 *         description: Reporte por municipio obtenido exitosamente
 *       400:
 *         description: municipio_id es requerido
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Sin permisos
 *       500:
 *         description: Error del servidor
 */
router.get('/consolidados/municipio', authMiddleware, getReportePorMunicipio);

/**
 * @swagger
 * /api/reportes/consolidados/comparativa:
 *   get:
 *     summary: Obtener comparativa entre dos períodos
 *     tags: [Reportes, Consolidados]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: mes1
 *         schema:
 *           type: integer
 *         required: true
 *         description: Mes del primer período (1-12)
 *       - in: query
 *         name: anio1
 *         schema:
 *           type: integer
 *         required: true
 *         description: Año del primer período
 *       - in: query
 *         name: mes2
 *         schema:
 *           type: integer
 *         required: true
 *         description: Mes del segundo período (1-12)
 *       - in: query
 *         name: anio2
 *         schema:
 *           type: integer
 *         required: true
 *         description: Año del segundo período
 *     responses:
 *       200:
 *         description: Comparativa obtenida exitosamente
 *       400:
 *         description: Parámetros requeridos faltantes
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Sin permisos
 *       500:
 *         description: Error del servidor
 */
router.get('/consolidados/comparativa', authMiddleware, getComparativa);

export default router;

