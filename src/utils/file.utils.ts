import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { logger } from '../config/logger';

const UPLOADS_DIR = path.join(__dirname, '../../uploads');

// Asegurar que el directorio uploads exista
fs.mkdir(UPLOADS_DIR, { recursive: true }).catch((error) => {
  logger.error('Error creando directorio uploads', { error });
});

// Configuración de almacenamiento de multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const sanitizedName = file.originalname
      .replace(extension, '')
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase();
    cb(null, `${sanitizedName}-${uniqueSuffix}${extension}`);
  }
});

// Filtro de tipos de archivo permitidos
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
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
  const extensionValid = allowedExtensions.test(path.extname(file.originalname).toLowerCase());

  if (mimeTypeValid && extensionValid) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}. Solo se permiten videos, audio, PDFs e imágenes.`));
  }
};

// Configuración de multer
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB límite
  },
  fileFilter: fileFilter,
});

/**
 * Eliminar archivo físico del sistema
 */
export async function eliminarArchivo(url: string): Promise<void> {
  try {
    // Solo eliminar archivos locales (que empiezan con /uploads/)
    if (!url.startsWith('/uploads/')) {
      logger.warn('Intento de eliminar archivo no local', { url });
      return;
    }

    const filename = path.basename(url);
    const filepath = path.join(UPLOADS_DIR, filename);

    // Verificar que el archivo existe
    try {
      await fs.access(filepath);
    } catch {
      logger.warn('Archivo no encontrado para eliminar', { filepath });
      return;
    }

    // Eliminar el archivo
    await fs.unlink(filepath);
    logger.info('Archivo eliminado exitosamente', { filepath });
  } catch (error) {
    logger.error('Error al eliminar archivo', { error, url });
    throw error;
  }
}

/**
 * Obtener estadísticas de archivos almacenados
 */
export async function obtenerEstadisticasArchivos(): Promise<{
  totalArchivos: number;
  tamañoTotal: number;
  tamañoTotalMB: number;
}> {
  try {
    const files = await fs.readdir(UPLOADS_DIR);
    let tamañoTotal = 0;

    for (const file of files) {
      const filepath = path.join(UPLOADS_DIR, file);
      try {
        const stats = await fs.stat(filepath);
        if (stats.isFile()) {
          tamañoTotal += stats.size;
        }
      } catch (error) {
        logger.warn('Error obteniendo stats de archivo', { file, error });
      }
    }

    return {
      totalArchivos: files.length,
      tamañoTotal,
      tamañoTotalMB: Math.round((tamañoTotal / (1024 * 1024)) * 100) / 100,
    };
  } catch (error) {
    logger.error('Error al obtener estadísticas de archivos', { error });
    return { totalArchivos: 0, tamañoTotal: 0, tamañoTotalMB: 0 };
  }
}

/**
 * Verificar si un archivo existe
 */
export async function archivoExiste(url: string): Promise<boolean> {
  try {
    if (!url.startsWith('/uploads/')) {
      return false;
    }

    const filename = path.basename(url);
    const filepath = path.join(UPLOADS_DIR, filename);

    await fs.access(filepath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Obtener información de un archivo
 */
export async function obtenerInfoArchivo(url: string): Promise<{
  nombre: string;
  tamaño: number;
  tamañoMB: number;
  extension: string;
  fechaCreacion: Date;
} | null> {
  try {
    if (!url.startsWith('/uploads/')) {
      return null;
    }

    const filename = path.basename(url);
    const filepath = path.join(UPLOADS_DIR, filename);

    const stats = await fs.stat(filepath);
    const extension = path.extname(filename);

    return {
      nombre: filename,
      tamaño: stats.size,
      tamañoMB: Math.round((stats.size / (1024 * 1024)) * 100) / 100,
      extension,
      fechaCreacion: stats.birthtime,
    };
  } catch (error) {
    logger.error('Error obteniendo info de archivo', { error, url });
    return null;
  }
}

/**
 * Limpiar archivos antiguos (más de X días)
 */
export async function limpiarArchivosAntiguos(diasAntiguedad: number = 90): Promise<number> {
  try {
    const files = await fs.readdir(UPLOADS_DIR);
    const ahora = Date.now();
    const milisegundosLimite = diasAntiguedad * 24 * 60 * 60 * 1000;
    let archivosEliminados = 0;

    for (const file of files) {
      const filepath = path.join(UPLOADS_DIR, file);
      try {
        const stats = await fs.stat(filepath);
        const edadArchivo = ahora - stats.birthtimeMs;

        if (edadArchivo > milisegundosLimite) {
          await fs.unlink(filepath);
          archivosEliminados++;
          logger.info('Archivo antiguo eliminado', { file, edadDias: Math.floor(edadArchivo / (24 * 60 * 60 * 1000)) });
        }
      } catch (error) {
        logger.warn('Error procesando archivo para limpieza', { file, error });
      }
    }

    logger.info('Limpieza de archivos antiguos completada', { archivosEliminados, diasAntiguedad });
    return archivosEliminados;
  } catch (error) {
    logger.error('Error en limpieza de archivos antiguos', { error });
    return 0;
  }
}

