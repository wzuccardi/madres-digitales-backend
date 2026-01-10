import { Router } from 'express';
import {
  assignMadrina,
  assignMedico,
  runAutoAssignment,
  getAssignmentStats,
  reassignFromInactiveMadrina,
  getCoverageOverview,
} from '../controllers/assignment.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

/**
 * @swagger
 * /api/assignment/gestante/{gestanteId}/madrina:
 *   post:
 *     summary: Asignar madrina a gestante específica
 *     tags: [Assignment]
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
 *         description: Madrina asignada exitosamente
 *       404:
 *         description: No hay madrinas disponibles
 *       401:
 *         description: No autorizado
 */
router.post('/gestante/:gestanteId/madrina', assignMadrina);

/**
 * @swagger
 * /api/assignment/gestante/{gestanteId}/medico:
 *   post:
 *     summary: Asignar médico a gestante específica
 *     tags: [Assignment]
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
 *         description: Médico asignado exitosamente
 *       404:
 *         description: No hay médicos disponibles
 *       401:
 *         description: No autorizado
 */
router.post('/gestante/:gestanteId/medico', assignMedico);

/**
 * @swagger
 * /api/assignment/auto:
 *   post:
 *     summary: Ejecutar asignación automática masiva
 *     tags: [Assignment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Asignación automática completada
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
 *                     madrinasAsignadas:
 *                       type: number
 *                     medicosAsignados:
 *                       type: number
 *       401:
 *         description: No autorizado
 */
router.post('/auto', runAutoAssignment);

/**
 * @swagger
 * /api/assignment/stats:
 *   get:
 *     summary: Obtener estadísticas de asignación
 *     tags: [Assignment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: municipioId
 *         schema:
 *           type: string
 *         description: ID del municipio (opcional, si no se proporciona devuelve todos)
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *       401:
 *         description: No autorizado
 */
router.get('/stats', getAssignmentStats);

/**
 * @swagger
 * /api/assignment/coverage:
 *   get:
 *     summary: Obtener resumen de cobertura general
 *     tags: [Assignment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Resumen de cobertura obtenido exitosamente
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
 *                         totalGestantes:
 *                           type: number
 *                         totalMadrinas:
 *                           type: number
 *                         totalMedicos:
 *                           type: number
 *                         coberturaGlobalMadrinas:
 *                           type: string
 *                         coberturaGlobalMedicos:
 *                           type: string
 *                         gestantesSinMadrina:
 *                           type: number
 *                         gestantesSinMedico:
 *                           type: number
 *                     porMunicipio:
 *                       type: array
 *       401:
 *         description: No autorizado
 */
router.get('/coverage', getCoverageOverview);

/**
 * @swagger
 * /api/assignment/madrina/{madrinaId}/reassign:
 *   post:
 *     summary: Reasignar gestantes de madrina inactiva
 *     tags: [Assignment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: madrinaId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la madrina inactiva
 *     responses:
 *       200:
 *         description: Gestantes reasignadas exitosamente
 *       401:
 *         description: No autorizado
 */
router.post('/madrina/:madrinaId/reassign', reassignFromInactiveMadrina);

export default router;
