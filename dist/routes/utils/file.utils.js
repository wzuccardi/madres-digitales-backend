"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
exports.eliminarArchivo = eliminarArchivo;
exports.obtenerEstadisticasArchivos = obtenerEstadisticasArchivos;
exports.archivoExiste = archivoExiste;
exports.obtenerInfoArchivo = obtenerInfoArchivo;
exports.limpiarArchivosAntiguos = limpiarArchivosAntiguos;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const logger_1 = require("../config/logger");
const UPLOADS_DIR = path_1.default.join(__dirname, '../../uploads');
// Asegurar que el directorio uploads exista
promises_1.default.mkdir(UPLOADS_DIR, { recursive: true }).catch((error) => {
    logger_1.logger.error('Error creando directorio uploads', { error });
});
// Configuración de almacenamiento de multer
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOADS_DIR);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path_1.default.extname(file.originalname);
        const sanitizedName = file.originalname
            .replace(extension, '')
            .replace(/[^a-z0-9]/gi, '_')
            .toLowerCase();
        cb(null, `${sanitizedName}-${uniqueSuffix}${extension}`);
    }
});
// Filtro de tipos de archivo permitidos
const fileFilter = (req, file, cb) => {
    // Tipos MIME permitidos
    const allowedMimeTypes = [
        // Videos
        'video/mp4',
        'video/mpeg',
        'video/quicktime',
        'video/x-msvideo',
        'video/x-ms-wmv',
        'video/webm',
        // Audio
        'audio/mpeg',
        'audio/mp3',
        'audio/wav',
        'audio/ogg',
        'audio/webm',
        // Documentos
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        // Imágenes
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
    ];
    // Extensiones permitidas
    const allowedExtensions = /\.(mp4|mpeg|mov|avi|wmv|webm|mp3|wav|ogg|pdf|doc|docx|jpg|jpeg|png|gif|webp)$/i;
    const mimeTypeValid = allowedMimeTypes.includes(file.mimetype);
    const extensionValid = allowedExtensions.test(path_1.default.extname(file.originalname).toLowerCase());
    if (mimeTypeValid && extensionValid) {
        cb(null, true);
    }
    else {
        cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}. Solo se permiten videos, audio, PDFs e imágenes.`));
    }
};
// Configuración de multer
exports.upload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB límite
    },
    fileFilter: fileFilter,
});
/**
 * Eliminar archivo físico del sistema
 */
async function eliminarArchivo(url) {
    try {
        // Solo eliminar archivos locales (que empiezan con /uploads/)
        if (!url.startsWith('/uploads/')) {
            logger_1.logger.warn('Intento de eliminar archivo no local', { url });
            return;
        }
        const filename = path_1.default.basename(url);
        const filepath = path_1.default.join(UPLOADS_DIR, filename);
        // Verificar que el archivo existe
        try {
            await promises_1.default.access(filepath);
        }
        catch {
            logger_1.logger.warn('Archivo no encontrado para eliminar', { filepath });
            return;
        }
        // Eliminar el archivo
        await promises_1.default.unlink(filepath);
        logger_1.logger.info('Archivo eliminado exitosamente', { filepath });
    }
    catch (error) {
        logger_1.logger.error('Error al eliminar archivo', { error, url });
        throw error;
    }
}
/**
 * Obtener estadísticas de archivos almacenados
 */
async function obtenerEstadisticasArchivos() {
    try {
        const files = await promises_1.default.readdir(UPLOADS_DIR);
        let tamañoTotal = 0;
        for (const file of files) {
            const filepath = path_1.default.join(UPLOADS_DIR, file);
            try {
                const stats = await promises_1.default.stat(filepath);
                if (stats.isFile()) {
                    tamañoTotal += stats.size;
                }
            }
            catch (error) {
                logger_1.logger.warn('Error obteniendo stats de archivo', { file, error });
            }
        }
        return {
            totalArchivos: files.length,
            tamañoTotal,
            tamañoTotalMB: Math.round((tamañoTotal / (1024 * 1024)) * 100) / 100,
        };
    }
    catch (error) {
        logger_1.logger.error('Error al obtener estadísticas de archivos', { error });
        return { totalArchivos: 0, tamañoTotal: 0, tamañoTotalMB: 0 };
    }
}
/**
 * Verificar si un archivo existe
 */
async function archivoExiste(url) {
    try {
        if (!url.startsWith('/uploads/')) {
            return false;
        }
        const filename = path_1.default.basename(url);
        const filepath = path_1.default.join(UPLOADS_DIR, filename);
        await promises_1.default.access(filepath);
        return true;
    }
    catch {
        return false;
    }
}
/**
 * Obtener información de un archivo
 */
async function obtenerInfoArchivo(url) {
    try {
        if (!url.startsWith('/uploads/')) {
            return null;
        }
        const filename = path_1.default.basename(url);
        const filepath = path_1.default.join(UPLOADS_DIR, filename);
        const stats = await promises_1.default.stat(filepath);
        const extension = path_1.default.extname(filename);
        return {
            nombre: filename,
            tamaño: stats.size,
            tamañoMB: Math.round((stats.size / (1024 * 1024)) * 100) / 100,
            extension,
            fechaCreacion: stats.birthtime,
        };
    }
    catch (error) {
        logger_1.logger.error('Error obteniendo info de archivo', { error, url });
        return null;
    }
}
/**
 * Limpiar archivos antiguos (más de X días)
 */
async function limpiarArchivosAntiguos(diasAntiguedad = 90) {
    try {
        const files = await promises_1.default.readdir(UPLOADS_DIR);
        const ahora = Date.now();
        const milisegundosLimite = diasAntiguedad * 24 * 60 * 60 * 1000;
        let archivosEliminados = 0;
        for (const file of files) {
            const filepath = path_1.default.join(UPLOADS_DIR, file);
            try {
                const stats = await promises_1.default.stat(filepath);
                const edadArchivo = ahora - stats.birthtimeMs;
                if (edadArchivo > milisegundosLimite) {
                    await promises_1.default.unlink(filepath);
                    archivosEliminados++;
                    logger_1.logger.info('Archivo antiguo eliminado', { file, edadDias: Math.floor(edadArchivo / (24 * 60 * 60 * 1000)) });
                }
            }
            catch (error) {
                logger_1.logger.warn('Error procesando archivo para limpieza', { file, error });
            }
        }
        logger_1.logger.info('Limpieza de archivos antiguos completada', { archivosEliminados, diasAntiguedad });
        return archivosEliminados;
    }
    catch (error) {
        logger_1.logger.error('Error en limpieza de archivos antiguos', { error });
        return 0;
    }
}
