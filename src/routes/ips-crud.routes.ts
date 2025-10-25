// Rutas CRUD para IPS
import { Router } from 'express';
import {
    getAllIps,
    getActiveIps,
    getIpsById,
    getIpsByMunicipio,
    createIps,
    updateIps,
    deleteIps,
    searchIps,
    getNearbyIps
} from '../controllers/ips-crud.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/ips-crud:
 *   get:
 *     summary: Obtener todas las IPS
 *     tags: [IPS CRUD]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de IPS obtenida exitosamente
 *       401:
 *         description: No autorizado
 */
router.get('/', authMiddleware, getAllIps);

/**
 * @swagger
 * /api/ips-crud/active:
 *   get:
 *     summary: Obtener IPS activas
 *     tags: [IPS CRUD]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de IPS activas obtenida exitosamente
 */
router.get('/active', authMiddleware, getActiveIps);

/**
 * @swagger
 * /api/ips-crud/search:
 *   get:
 *     summary: Buscar IPS por nombre
 *     tags: [IPS CRUD]
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
router.get('/search', authMiddleware, searchIps);

/**
 * @swagger
 * /api/ips-crud/nearby:
 *   get:
 *     summary: Obtener IPS cercanas
 *     tags: [IPS CRUD]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *         description: Latitud
 *       - in: query
 *         name: lng
 *         required: true
 *         schema:
 *           type: number
 *         description: Longitud
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           default: 10
 *         description: Radio en kilómetros
 *     responses:
 *       200:
 *         description: IPS cercanas encontradas
 */
router.get('/nearby', authMiddleware, getNearbyIps);

/**
 * @swagger
 * /api/ips-crud/municipio/{municipioId}:
 *   get:
 *     summary: Obtener IPS por municipio
 *     tags: [IPS CRUD]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: municipioId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del municipio
 *     responses:
 *       200:
 *         description: IPS del municipio obtenidas
 */
router.get('/municipio/:municipioId', authMiddleware, getIpsByMunicipio);

/**
 * @swagger
 * /api/ips-crud/{id}:
 *   get:
 *     summary: Obtener IPS por ID
 *     tags: [IPS CRUD]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la IPS
 *     responses:
 *       200:
 *         description: IPS encontrada
 *       404:
 *         description: IPS no encontrada
 */
router.get('/:id', authMiddleware, getIpsById);

/**
 * @swagger
 * /api/ips-crud:
 *   post:
 *     summary: Crear nueva IPS
 *     tags: [IPS CRUD]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - codigo_habilitacion
 *               - nombre
 *               - direccion
 *               - nivel_atencion
 *             properties:
 *               codigo_habilitacion:
 *                 type: string
 *               nombre:
 *                 type: string
 *               nit:
 *                 type: string
 *               direccion:
 *                 type: string
 *               telefono:
 *                 type: string
 *               email:
 *                 type: string
 *               municipio_id:
 *                 type: string
 *               coordenadas:
 *                 type: object
 *               nivel_atencion:
 *                 type: string
 *                 enum: [PRIMER_NIVEL, SEGUNDO_NIVEL, TERCER_NIVEL]
 *     responses:
 *       201:
 *         description: IPS creada exitosamente
 */
router.post('/', authMiddleware, createIps);

/**
 * @swagger
 * /api/ips-crud/{id}:
 *   put:
 *     summary: Actualizar IPS
 *     tags: [IPS CRUD]
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
 *         description: IPS actualizada exitosamente
 */
router.put('/:id', authMiddleware, updateIps);

/**
 * @swagger
 * /api/ips-crud/{id}:
 *   delete:
 *     summary: Eliminar IPS (soft delete)
 *     tags: [IPS CRUD]
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
 *         description: IPS eliminada exitosamente
 */
router.delete('/:id', authMiddleware, deleteIps);

export default router;

