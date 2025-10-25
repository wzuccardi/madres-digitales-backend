"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const gestante_controller_1 = require("../controllers/gestante.controller");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /api/gestantes:
 *   get:
 *     summary: Búsqueda avanzada de gestantes con filtros y paginación
 *     tags: [Gestantes]
 *     parameters:
 *       - in: query
 *         name: busqueda
 *         schema:
 *           type: string
 *         description: Búsqueda por nombre o documento
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Resultados por página
 *       - in: query
 *         name: riesgo_alto
 *         schema:
 *           type: boolean
 *         description: Filtrar por riesgo alto
 *     responses:
 *       200:
 *         description: Lista paginada de gestantes
 */
router.get('/', gestante_controller_1.getAllGestantes);
/**
 * @swagger
 * /api/gestantes/cercanas:
 *   get:
 *     summary: Buscar gestantes cercanas por geolocalización
 *     tags: [Gestantes]
 *     parameters:
 *       - in: query
 *         name: latitud
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: longitud
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: radio_km
 *         schema:
 *           type: number
 *         description: Radio de búsqueda en kilómetros
 *     responses:
 *       200:
 *         description: Lista de gestantes cercanas
 */
router.get('/cercanas', gestante_controller_1.buscarGestantesCercanas);
/**
 * @swagger
 * /api/gestantes/{id}:
 *   get:
 *     summary: Obtener gestante por ID
 *     tags: [Gestantes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Información completa de la gestante
 *       404:
 *         description: Gestante no encontrada
 */
router.get('/:id', gestante_controller_1.getGestanteById);
/**
 * @swagger
 * /api/gestantes/{id}/riesgo:
 *   get:
 *     summary: Calcular riesgo de gestante
 *     tags: [Gestantes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cálculo de riesgo completo
 */
router.get('/:id/riesgo', gestante_controller_1.calcularRiesgo);
/**
 * @swagger
 * /api/gestantes:
 *   post:
 *     summary: Crear nueva gestante
 *     tags: [Gestantes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - documento
 *               - nombre
 *               - fecha_nacimiento
 *             properties:
 *               documento:
 *                 type: string
 *               nombre:
 *                 type: string
 *               fecha_nacimiento:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Gestante creada exitosamente
 */
router.post('/', gestante_controller_1.createGestante);
/**
 * @swagger
 * /api/gestantes/asignar-madrina:
 *   post:
 *     summary: Asignar madrina a gestante
 *     tags: [Gestantes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - gestante_id
 *               - madrina_id
 *             properties:
 *               gestante_id:
 *                 type: string
 *               madrina_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Madrina asignada exitosamente
 */
router.post('/asignar-madrina', gestante_controller_1.asignarMadrina);
/**
 * @swagger
 * /api/gestantes/{id}:
 *   put:
 *     summary: Actualizar gestante
 *     tags: [Gestantes]
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
 *         description: Gestante actualizada exitosamente
 */
router.put('/:id', gestante_controller_1.updateGestante);
/**
 * @swagger
 * /api/gestantes/{id}:
 *   delete:
 *     summary: Eliminar gestante
 *     tags: [Gestantes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Gestante eliminada exitosamente
 */
router.delete('/:id', gestante_controller_1.deleteGestante);
exports.default = router;
