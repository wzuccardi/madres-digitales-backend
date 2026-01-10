// Rutas CRUD para Médicos
import { Router } from 'express';
import {
    getAllMedicos,
    getActiveMedicos,
    getMedicoById,
    getMedicosByIps,
    getMedicosByEspecialidad,
    createMedico,
    updateMedico,
    deleteMedico,
    searchMedicos
} from '../controllers/medico-crud.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/medicos-crud:
 *   get:
 *     summary: Obtener todos los médicos
 *     tags: [Médicos CRUD]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de médicos obtenida exitosamente
 */
router.get('/', authMiddleware, getAllMedicos);

/**
 * @swagger
 * /api/medicos-crud/active:
 *   get:
 *     summary: Obtener médicos activos
 *     tags: [Médicos CRUD]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de médicos activos obtenida exitosamente
 */
router.get('/active', authMiddleware, getActiveMedicos);

/**
 * @swagger
 * /api/medicos-crud/search:
 *   get:
 *     summary: Buscar médicos por nombre
 *     tags: [Médicos CRUD]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Término de búsqueda
 *     responses:
 *       200:
 *         description: Resultados de búsqueda
 */
router.get('/search', authMiddleware, searchMedicos);

/**
 * @swagger
 * /api/medicos-crud/ips/{ipsId}:
 *   get:
 *     summary: Obtener médicos por IPS
 *     tags: [Médicos CRUD]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ipsId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la IPS
 *     responses:
 *       200:
 *         description: Médicos de la IPS obtenidos
 */
router.get('/ips/:ipsId', authMiddleware, getMedicosByIps);

/**
 * @swagger
 * /api/medicos-crud/especialidad/{especialidad}:
 *   get:
 *     summary: Obtener médicos por especialidad
 *     tags: [Médicos CRUD]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: especialidad
 *         required: true
 *         schema:
 *           type: string
 *         description: Especialidad médica
 *     responses:
 *       200:
 *         description: Médicos con la especialidad obtenidos
 */
router.get('/especialidad/:especialidad', authMiddleware, getMedicosByEspecialidad);

/**
 * @swagger
 * /api/medicos-crud/{id}:
 *   get:
 *     summary: Obtener médico por ID
 *     tags: [Médicos CRUD]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del médico
 *     responses:
 *       200:
 *         description: Médico encontrado
 *       404:
 *         description: Médico no encontrado
 */
router.get('/:id', authMiddleware, getMedicoById);

/**
 * @swagger
 * /api/medicos-crud:
 *   post:
 *     summary: Crear nuevo médico
 *     tags: [Médicos CRUD]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - documento
 *               - registro_medico
 *             properties:
 *               nombre:
 *                 type: string
 *               documento:
 *                 type: string
 *               registro_medico:
 *                 type: string
 *               especialidad:
 *                 type: string
 *               telefono:
 *                 type: string
 *               email:
 *                 type: string
 *               ips_id:
 *                 type: string
 *     responses:
 *       201:
 *         description: Médico creado exitosamente
 */
router.post('/', authMiddleware, createMedico);

/**
 * @swagger
 * /api/medicos-crud/{id}:
 *   put:
 *     summary: Actualizar médico
 *     tags: [Médicos CRUD]
 *     security:
 *       - bearerAuth: []
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
 *         description: Médico actualizado exitosamente
 */
router.put('/:id', authMiddleware, updateMedico);

/**
 * @swagger
 * /api/medicos-crud/{id}:
 *   delete:
 *     summary: Eliminar médico (soft delete)
 *     tags: [Médicos CRUD]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Médico eliminado exitosamente
 */
router.delete('/:id', authMiddleware, deleteMedico);

export default router;

