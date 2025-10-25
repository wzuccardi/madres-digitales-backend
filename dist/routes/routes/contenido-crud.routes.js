"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const contenido_crud_controller_1 = require("../controllers/contenido-crud.controller");
const router = (0, express_1.Router)();
// Configuración de Multer para subir videos
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${(0, uuid_1.v4)()}`;
        const ext = path_1.default.extname(file.originalname);
        cb(null, `video-${uniqueSuffix}${ext}`);
    },
});
// Filtro para aceptar solo videos MP4
const fileFilter = (req, file, cb) => {
    const allowedMimes = ['video/mp4'];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Solo se permiten archivos MP4'));
    }
};
const upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 500 * 1024 * 1024, // 500 MB máximo
    },
});
/**
 * @swagger
 * /api/contenido-crud:
 *   get:
 *     summary: Listar todos los contenidos educativos
 *     tags: [Contenido CRUD]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: categoria
 *         schema:
 *           type: string
 *           enum: [parto, lactancia, cuidados, nutricion, salud_mental, otro]
 *         description: Filtrar por categoría
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [video, audio, documento, imagen]
 *         description: Filtrar por tipo
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Elementos por página
 *     responses:
 *       200:
 *         description: Lista de contenidos
 *       401:
 *         description: No autorizado
 */
// TEMPORAL: Sin autenticación para desarrollo
router.get('/', contenido_crud_controller_1.listarContenidos);
/**
 * @swagger
 * /api/contenido-crud/{id}:
 *   get:
 *     summary: Obtener un contenido por ID
 *     tags: [Contenido CRUD]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del contenido
 *     responses:
 *       200:
 *         description: Contenido encontrado
 *       404:
 *         description: Contenido no encontrado
 */
router.get('/:id', contenido_crud_controller_1.obtenerContenido);
/**
 * @swagger
 * /api/contenido-crud:
 *   post:
 *     summary: Crear nuevo contenido educativo con video MP4 H.264
 *     tags: [Contenido CRUD]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - titulo
 *               - descripcion
 *               - categoria
 *               - tipo
 *               - video
 *             properties:
 *               titulo:
 *                 type: string
 *                 description: Título del contenido
 *               descripcion:
 *                 type: string
 *                 description: Descripción del contenido
 *               categoria:
 *                 type: string
 *                 enum: [parto, lactancia, cuidados, nutricion, salud_mental, otro]
 *               tipo:
 *                 type: string
 *                 enum: [video, audio, documento, imagen]
 *               nivel:
 *                 type: string
 *                 enum: [basico, intermedio, avanzado]
 *                 default: basico
 *               duracion:
 *                 type: number
 *                 description: Duración en segundos
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               video:
 *                 type: string
 *                 format: binary
 *                 description: Archivo de video MP4 con codec H.264
 *     responses:
 *       201:
 *         description: Contenido creado exitosamente
 *       400:
 *         description: Datos inválidos o formato no compatible
 *       401:
 *         description: No autorizado
 */
// TEMPORAL: Sin autenticación para desarrollo
router.post('/', upload.single('video'), contenido_crud_controller_1.crearContenido);
/**
 * @swagger
 * /api/contenido-crud/{id}:
 *   put:
 *     summary: Actualizar contenido educativo
 *     tags: [Contenido CRUD]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del contenido
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               categoria:
 *                 type: string
 *                 enum: [parto, lactancia, cuidados, nutricion, salud_mental, otro]
 *               tipo:
 *                 type: string
 *                 enum: [video, audio, documento, imagen]
 *               nivel:
 *                 type: string
 *                 enum: [basico, intermedio, avanzado]
 *               duracion:
 *                 type: number
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               video:
 *                 type: string
 *                 format: binary
 *                 description: Nuevo archivo de video (opcional)
 *     responses:
 *       200:
 *         description: Contenido actualizado exitosamente
 *       404:
 *         description: Contenido no encontrado
 *       401:
 *         description: No autorizado
 */
// TEMPORAL: Sin autenticación para desarrollo
router.put('/:id', upload.single('video'), contenido_crud_controller_1.actualizarContenido);
/**
 * @swagger
 * /api/contenido-crud/{id}:
 *   delete:
 *     summary: Eliminar contenido educativo
 *     tags: [Contenido CRUD]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del contenido
 *     responses:
 *       200:
 *         description: Contenido eliminado exitosamente
 *       404:
 *         description: Contenido no encontrado
 *       401:
 *         description: No autorizado
 */
// TEMPORAL: Sin autenticación para desarrollo
router.delete('/:id', contenido_crud_controller_1.eliminarContenido);
exports.default = router;
