import { Router } from 'express';
import {
	getAllControles,
	getControlById,
	createControl,
	updateControl,
	deleteControl,
	getControlesVencidos,
	getControlesPendientes
} from '../controllers/control.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Aplicar autenticación a todas las rutas
router.use(authMiddleware);

/**
 * @swagger
 * /api/controles:
 *   get:
 *     summary: Obtener todos los controles
 *     tags: [Controles]
 *     responses:
 *       200:
 *         description: Lista de controles
 */
router.get('/', getAllControles);

/**
 * @swagger
 * /api/controles/vencidos:
 *   get:
 *     summary: Obtener controles vencidos
 *     tags: [Controles]
 *     responses:
 *       200:
 *         description: Lista de controles vencidos
 */
router.get('/vencidos', getControlesVencidos);

/**
 * @swagger
 * /api/controles/pendientes:
 *   get:
 *     summary: Obtener controles pendientes
 *     tags: [Controles]
 *     responses:
 *       200:
 *         description: Lista de controles pendientes
 */
router.get('/pendientes', getControlesPendientes);

/**
 * @swagger
 * /api/controles/{id}:
 *   get:
 *     summary: Obtener control por ID
 *     tags: [Controles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Control encontrado
 *       404:
 *         description: Control no encontrado
 */
router.get('/:id', getControlById);

/**
 * @swagger
 * /api/controles:
 *   post:
 *     summary: Crear nuevo control
 *     tags: [Controles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               gestante_id:
 *                 type: string
 *               fecha_control:
 *                 type: string
 *                 format: date
 *               peso:
 *                 type: number
 *               presion_sistolica:
 *                 type: number
 *               presion_diastolica:
 *                 type: number
 *     responses:
 *       201:
 *         description: Control creado exitosamente
 */
router.post('/', createControl);

/**
 * @swagger
 * /api/controles/{id}:
 *   put:
 *     summary: Actualizar control
 *     tags: [Controles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Control actualizado exitosamente
 */
router.put('/:id', updateControl);

/**
 * @swagger
 * /api/controles/{id}:
 *   delete:
 *     summary: Eliminar control
 *     tags: [Controles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Control eliminado exitosamente
 */
router.delete('/:id', deleteControl);

export default router;
