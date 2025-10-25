import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  listarContenidos,
  obtenerContenido,
  crearContenido,
  actualizarContenido,
  eliminarContenido,
} from '../controllers/contenido-crud.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Configuración de Multer para subir videos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${uuidv4()}`;
    const ext = path.extname(file.originalname);
    cb(null, `video-${uniqueSuffix}${ext}`);
  },
});

// Filtro para aceptar solo videos MP4
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['video/mp4'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos MP4'));
  }
};

const upload = multer({
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
router.get('/', listarContenidos);

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
router.get('/:id', obtenerContenido);

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
router.post('/', upload.single('video'), crearContenido);

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
router.put('/:id', upload.single('video'), actualizarContenido);

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
router.delete('/:id', eliminarContenido);

export default router;

