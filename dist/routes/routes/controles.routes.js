"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const control_controller_1 = require("../controllers/control.controller");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /api/controles:
 *   get:
 *     summary: Obtener todos los controles (filtrado por rol)
 *     tags: [Controles]
 *     responses:
 *       200:
 *         description: Lista de controles
 */
router.get('/', control_controller_1.getAllControles);
/**
 * @swagger
 * /api/controles/vencidos:
 *   get:
 *     summary: Obtener controles vencidos o próximos a vencer
 *     tags: [Controles]
 *     responses:
 *       200:
 *         description: Lista de controles vencidos
 */
router.get('/vencidos', control_controller_1.getControlesVencidos);
/**
 * @swagger
 * /api/controles/pendientes:
 *   get:
 *     summary: Obtener controles pendientes (no realizados)
 *     tags: [Controles]
 *     responses:
 *       200:
 *         description: Lista de controles pendientes
 */
router.get('/pendientes', control_controller_1.getControlesPendientes);
/**
 * @swagger
 * /api/controles/gestante/{gestanteId}/historial:
 *   get:
 *     summary: Obtener historial de controles de una gestante
 *     tags: [Controles]
 *     parameters:
 *       - in: path
 *         name: gestanteId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Historial de controles
 */
router.get('/gestante/:gestanteId/historial', control_controller_1.getHistorialControles);
/**
 * @swagger
 * /api/controles/gestante/{gestanteId}/evolucion:
 *   get:
 *     summary: Obtener evolución de gestante para gráficas
 *     tags: [Controles]
 *     parameters:
 *       - in: path
 *         name: gestanteId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Datos de evolución con tendencias
 */
router.get('/gestante/:gestanteId/evolucion', control_controller_1.getEvolucionGestante);
/**
 * @swagger
 * /api/controles/gestante/{gestanteId}/proximo:
 *   get:
 *     summary: Calcular próximo control recomendado
 *     tags: [Controles]
 *     parameters:
 *       - in: path
 *         name: gestanteId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Recomendación de próximo control
 */
router.get('/gestante/:gestanteId/proximo', control_controller_1.getProximoControl);
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
router.get('/:id', control_controller_1.getControlById);
/**
 * @swagger
 * /api/controles/{id}/gestante:
 *   get:
 *     summary: Obtener control con datos de gestante
 *     tags: [Controles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Control con datos de gestante
 *       404:
 *         description: Control no encontrado
 */
router.get('/:id/gestante', control_controller_1.getControlConGestante);
/**
 * @swagger
 * /api/controles:
 *   post:
 *     summary: Crear nuevo control prenatal
 *     tags: [Controles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - gestante_id
 *               - fecha_control
 *             properties:
 *               gestante_id:
 *                 type: string
 *               fecha_control:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Control creado exitosamente
 */
router.post('/', control_controller_1.createControl);
/**
 * @swagger
 * /api/controles/{id}:
 *   put:
 *     summary: Actualizar control prenatal
 *     tags: [Controles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Control actualizado
 */
router.put('/:id', control_controller_1.updateControl);
/**
 * @swagger
 * /api/controles/{id}:
 *   delete:
 *     summary: Eliminar control prenatal
 *     tags: [Controles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Control eliminado
 */
router.delete('/:id', control_controller_1.deleteControl);
exports.default = router;
