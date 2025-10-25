"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.eliminarContenido = exports.actualizarContenido = exports.crearContenido = exports.obtenerContenido = exports.listarContenidos = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
const prisma = new client_1.PrismaClient();
// Schema de validación para crear/actualizar contenido
const contenidoSchema = zod_1.z.object({
    titulo: zod_1.z.string().min(3, 'El título debe tener al menos 3 caracteres'),
    descripcion: zod_1.z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
    categoria: zod_1.z.enum(['nutricion', 'cuidado_prenatal', 'signos_alarma', 'lactancia', 'parto', 'posparto', 'planificacion', 'salud_mental', 'ejercicio', 'higiene', 'derechos', 'otros']),
    tipo: zod_1.z.enum(['video', 'audio', 'documento', 'imagen']),
    nivel: zod_1.z.enum(['basico', 'intermedio', 'avanzado']).default('basico'),
    duracion: zod_1.z.number().optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
});
// Verificar codec del video usando FFprobe
async function verificarCodecVideo(filePath) {
    try {
        // Verificar si FFprobe está disponible
        const { stdout } = await execAsync(`ffprobe -v error -select_streams v:0 -show_entries stream=codec_name -of default=noprint_wrappers=1:nokey=1 "${filePath}"`);
        const codec = stdout.trim().toLowerCase();
        // Verificar si es H.264 (también conocido como avc1)
        const isH264 = codec === 'h264' || codec === 'avc1';
        return {
            isValid: isH264,
            codec: codec,
            error: isH264 ? undefined : `Codec no compatible: ${codec}. Solo se permite H.264`
        };
    }
    catch (error) {
        // Si FFprobe no está disponible, asumir que es válido
        console.warn('FFprobe no disponible, saltando validación de codec:', error.message);
        return { isValid: true };
    }
}
// GET /api/contenido-crud - Listar todos los contenidos
const listarContenidos = async (req, res) => {
    try {
        const { categoria, tipo, page = '1', limit = '20' } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const where = {};
        if (categoria)
            where.categoria = categoria;
        if (tipo)
            where.tipo = tipo;
        const [contenidos, total] = await Promise.all([
            prisma.contenidoEducativo.findMany({
                where,
                skip,
                take: limitNum,
                orderBy: { created_at: 'desc' },
            }),
            prisma.contenidoEducativo.count({ where }),
        ]);
        res.json({
            contenidos,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    }
    catch (error) {
        console.error('Error al listar contenidos:', error);
        res.status(500).json({ error: 'Error al listar contenidos', details: error.message });
    }
};
exports.listarContenidos = listarContenidos;
// GET /api/contenido-crud/:id - Obtener un contenido por ID
const obtenerContenido = async (req, res) => {
    try {
        const { id } = req.params;
        const contenido = await prisma.contenidoEducativo.findUnique({
            where: { id },
        });
        if (!contenido) {
            return res.status(404).json({ error: 'Contenido no encontrado' });
        }
        res.json(contenido);
    }
    catch (error) {
        console.error('Error al obtener contenido:', error);
        res.status(500).json({ error: 'Error al obtener contenido', details: error.message });
    }
};
exports.obtenerContenido = obtenerContenido;
// POST /api/contenido-crud - Crear nuevo contenido con video
const crearContenido = async (req, res) => {
    try {
        // Validar datos del formulario
        const validatedData = contenidoSchema.parse(req.body);
        // Verificar que se subió un archivo
        if (!req.file) {
            return res.status(400).json({ error: 'No se proporcionó ningún archivo' });
        }
        const file = req.file;
        // Verificar que sea un video MP4
        if (file.mimetype !== 'video/mp4') {
            // Eliminar archivo subido
            await promises_1.default.unlink(file.path);
            return res.status(400).json({
                error: 'Formato no válido',
                details: 'Solo se permiten archivos MP4'
            });
        }
        // Verificar codec H.264
        const codecCheck = await verificarCodecVideo(file.path);
        if (!codecCheck.isValid) {
            // Eliminar archivo subido
            await promises_1.default.unlink(file.path);
            return res.status(400).json({
                error: 'Codec no compatible',
                details: codecCheck.error || 'El video debe usar codec H.264'
            });
        }
        // Construir URL del archivo
        const archivoUrl = `/uploads/${file.filename}`;
        // Crear registro en la base de datos
        const contenido = await prisma.contenidoEducativo.create({
            data: {
                titulo: validatedData.titulo,
                descripcion: validatedData.descripcion,
                tipo: validatedData.tipo,
                categoria: validatedData.categoria,
                nivel: validatedData.nivel,
                archivo_url: archivoUrl,
                archivo_nombre: file.originalname,
                archivo_tipo: file.mimetype,
                archivo_tamano: file.size,
                duracion: validatedData.duracion,
                etiquetas: validatedData.tags || [],
                created_by: '81d04231-c4ac-4139-bcc0-42e877a8dee4', // Usuario por defecto
            },
        });
        res.status(201).json({
            message: 'Contenido creado exitosamente',
            contenido,
            codecInfo: {
                codec: codecCheck.codec,
                compatible: true,
            },
        });
    }
    catch (error) {
        console.error('Error al crear contenido:', error);
        // Si hay un archivo subido, eliminarlo en caso de error
        if (req.file) {
            try {
                await promises_1.default.unlink(req.file.path);
            }
            catch (unlinkError) {
                console.error('Error al eliminar archivo:', unlinkError);
            }
        }
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                error: 'Datos inválidos',
                details: error.issues
            });
        }
        res.status(500).json({ error: 'Error al crear contenido', details: error.message });
    }
};
exports.crearContenido = crearContenido;
// PUT /api/contenido-crud/:id - Actualizar contenido
const actualizarContenido = async (req, res) => {
    try {
        const { id } = req.params;
        // Verificar que el contenido existe
        const contenidoExistente = await prisma.contenidoEducativo.findUnique({
            where: { id },
        });
        if (!contenidoExistente) {
            return res.status(404).json({ error: 'Contenido no encontrado' });
        }
        // Validar datos
        const validatedData = contenidoSchema.partial().parse(req.body);
        let archivoUrl = contenidoExistente.archivo_url;
        // Si se subió un nuevo archivo
        if (req.file) {
            const file = req.file;
            // Verificar que sea MP4
            if (file.mimetype !== 'video/mp4') {
                await promises_1.default.unlink(file.path);
                return res.status(400).json({
                    error: 'Formato no válido',
                    details: 'Solo se permiten archivos MP4'
                });
            }
            // Verificar codec H.264
            const codecCheck = await verificarCodecVideo(file.path);
            if (!codecCheck.isValid) {
                await promises_1.default.unlink(file.path);
                return res.status(400).json({
                    error: 'Codec no compatible',
                    details: codecCheck.error || 'El video debe usar codec H.264'
                });
            }
            // Eliminar archivo anterior si existe
            if (contenidoExistente.archivo_url) {
                const oldFilePath = path_1.default.join(__dirname, '../../uploads', path_1.default.basename(contenidoExistente.archivo_url));
                try {
                    await promises_1.default.unlink(oldFilePath);
                }
                catch (error) {
                    console.warn('No se pudo eliminar el archivo anterior:', error);
                }
            }
            archivoUrl = `/uploads/${file.filename}`;
        }
        // Actualizar en la base de datos
        const contenidoActualizado = await prisma.contenidoEducativo.update({
            where: { id },
            data: {
                ...validatedData,
                archivo_url: archivoUrl,
            },
        });
        res.json({
            message: 'Contenido actualizado exitosamente',
            contenido: contenidoActualizado,
        });
    }
    catch (error) {
        console.error('Error al actualizar contenido:', error);
        if (req.file) {
            try {
                await promises_1.default.unlink(req.file.path);
            }
            catch (unlinkError) {
                console.error('Error al eliminar archivo:', unlinkError);
            }
        }
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                error: 'Datos inválidos',
                details: error.issues
            });
        }
        res.status(500).json({ error: 'Error al actualizar contenido', details: error.message });
    }
};
exports.actualizarContenido = actualizarContenido;
// DELETE /api/contenido-crud/:id - Eliminar contenido
const eliminarContenido = async (req, res) => {
    try {
        const { id } = req.params;
        // Verificar que el contenido existe
        const contenido = await prisma.contenidoEducativo.findUnique({
            where: { id },
        });
        if (!contenido) {
            return res.status(404).json({ error: 'Contenido no encontrado' });
        }
        // Eliminar archivo físico
        if (contenido.archivo_url) {
            const filePath = path_1.default.join(__dirname, '../../uploads', path_1.default.basename(contenido.archivo_url));
            try {
                await promises_1.default.unlink(filePath);
            }
            catch (error) {
                console.warn('No se pudo eliminar el archivo:', error);
            }
        }
        // Eliminar registro de la base de datos
        await prisma.contenidoEducativo.delete({
            where: { id },
        });
        res.json({
            message: 'Contenido eliminado exitosamente',
            id,
        });
    }
    catch (error) {
        console.error('Error al eliminar contenido:', error);
        res.status(500).json({ error: 'Error al eliminar contenido', details: error.message });
    }
};
exports.eliminarContenido = eliminarContenido;
