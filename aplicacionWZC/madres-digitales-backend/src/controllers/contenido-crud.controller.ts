import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import path from 'path';
import fs from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const prisma = new PrismaClient();

// Schema de validación para crear/actualizar contenido
const contenidoSchema = z.object({
  titulo: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  descripcion: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  categoria: z.enum(['nutricion', 'cuidado_prenatal', 'signos_alarma', 'lactancia', 'parto', 'posparto', 'planificacion', 'salud_mental', 'ejercicio', 'higiene', 'derechos', 'otros']),
  tipo: z.enum(['video', 'audio', 'documento', 'imagen']),
  nivel: z.enum(['basico', 'intermedio', 'avanzado']).default('basico'),
  duracion: z.number().optional(),
  tags: z.array(z.string()).optional(),
});

// Verificar codec del video usando FFprobe
async function verificarCodecVideo(filePath: string): Promise<{ isValid: boolean; codec?: string; error?: string }> {
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
  } catch (error: any) {
    // Si FFprobe no está disponible, asumir que es válido
    console.warn('FFprobe no disponible, saltando validación de codec:', error.message);
    return { isValid: true };
  }
}

// GET /api/contenido-crud - Listar todos los contenidos
export const listarContenidos = async (req: Request, res: Response) => {
  try {
    const { categoria, tipo, page = '1', limit = '20' } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;
    
    const where: any = {};
    if (categoria) where.categoria = categoria;
    if (tipo) where.tipo = tipo;
    
    const [contenidos, total] = await Promise.all([
      prisma.contenido.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { fecha_creacion: 'desc' },
      }),
      prisma.contenido.count({ where }),
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
  } catch (error: any) {
    console.error('Error al listar contenidos:', error);
    res.status(500).json({ error: 'Error al listar contenidos', details: error.message });
  }
};

// GET /api/contenido-crud/:id - Obtener un contenido por ID
export const obtenerContenido = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const contenido = await prisma.contenido.findUnique({
      where: { id },
    });
    
    if (!contenido) {
      return res.status(404).json({ error: 'Contenido no encontrado' });
    }
    
    res.json(contenido);
  } catch (error: any) {
    console.error('Error al obtener contenido:', error);
    res.status(500).json({ error: 'Error al obtener contenido', details: error.message });
  }
};

// POST /api/contenido-crud - Crear nuevo contenido con video
export const crearContenido = async (req: Request, res: Response) => {
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
      await fs.unlink(file.path);
      return res.status(400).json({ 
        error: 'Formato no válido', 
        details: 'Solo se permiten archivos MP4' 
      });
    }
    
    // Verificar codec H.264
    const codecCheck = await verificarCodecVideo(file.path);
    if (!codecCheck.isValid) {
      // Eliminar archivo subido
      await fs.unlink(file.path);
      return res.status(400).json({ 
        error: 'Codec no compatible', 
        details: codecCheck.error || 'El video debe usar codec H.264'
      });
    }
    
    // Construir URL del archivo
    const archivoUrl = `/uploads/${file.filename}`;
    
    // Crear registro en la base de datos
    const contenido = await prisma.contenido.create({
      data: {
        titulo: validatedData.titulo,
        descripcion: validatedData.descripcion,
        tipo: validatedData.tipo,
        categoria: validatedData.categoria,
        nivel: validatedData.nivel,
        url_contenido: archivoUrl,
        duracion_minutos: validatedData.duracion,
        tags: validatedData.tags || []
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
  } catch (error: any) {
    console.error('Error al crear contenido:', error);
    
    // Si hay un archivo subido, eliminarlo en caso de error
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error al eliminar archivo:', unlinkError);
      }
    }
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Datos inválidos', 
        details: error.issues
      });
    }
    
    res.status(500).json({ error: 'Error al crear contenido', details: error.message });
  }
};

// PUT /api/contenido-crud/:id - Actualizar contenido
export const actualizarContenido = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Verificar que el contenido existe
    const contenidoExistente = await prisma.contenido.findUnique({
      where: { id },
    });
    
    if (!contenidoExistente) {
      return res.status(404).json({ error: 'Contenido no encontrado' });
    }
    
    // Validar datos
    const validatedData = contenidoSchema.partial().parse(req.body);
    
    let archivoUrl = contenidoExistente.url_contenido;
    
    // Si se subió un nuevo archivo
    if (req.file) {
      const file = req.file;
      
      // Verificar que sea MP4
      if (file.mimetype !== 'video/mp4') {
        await fs.unlink(file.path);
        return res.status(400).json({ 
          error: 'Formato no válido', 
          details: 'Solo se permiten archivos MP4' 
        });
      }
      
      // Verificar codec H.264
      const codecCheck = await verificarCodecVideo(file.path);
      if (!codecCheck.isValid) {
        await fs.unlink(file.path);
        return res.status(400).json({ 
          error: 'Codec no compatible', 
          details: codecCheck.error || 'El video debe usar codec H.264'
        });
      }
      
      // Eliminar archivo anterior si existe
      if (contenidoExistente.url_contenido) {
        const oldFilePath = path.join(__dirname, '../../uploads', path.basename(contenidoExistente.url_contenido));
        try {
          await fs.unlink(oldFilePath);
        } catch (error) {
          console.warn('No se pudo eliminar el archivo anterior:', error);
        }
      }
      
      archivoUrl = `/uploads/${file.filename}`;
    }
    
    // Actualizar en la base de datos
    const contenidoActualizado = await prisma.contenido.update({
      where: { id },
      data: {
        ...validatedData,
        url_contenido: archivoUrl,
      },
    });
    
    res.json({
      message: 'Contenido actualizado exitosamente',
      contenido: contenidoActualizado,
    });
  } catch (error: any) {
    console.error('Error al actualizar contenido:', error);
    
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error al eliminar archivo:', unlinkError);
      }
    }
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Datos inválidos', 
        details: error.issues
      });
    }
    
    res.status(500).json({ error: 'Error al actualizar contenido', details: error.message });
  }
};

// DELETE /api/contenido-crud/:id - Eliminar contenido
export const eliminarContenido = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Verificar que el contenido existe
    const contenido = await prisma.contenido.findUnique({
      where: { id },
    });
    
    if (!contenido) {
      return res.status(404).json({ error: 'Contenido no encontrado' });
    }
    
    // Eliminar archivo físico
    if (contenido.url_contenido) {
      const filePath = path.join(__dirname, '../../uploads', path.basename(contenido.url_contenido));
      try {
        await fs.unlink(filePath);
      } catch (error) {
        console.warn('No se pudo eliminar el archivo:', error);
      }
    }
    
    // Eliminar registro de la base de datos
    await prisma.contenido.delete({
      where: { id },
    });
    
    res.json({
      message: 'Contenido eliminado exitosamente',
      id,
    });
  } catch (error: any) {
    console.error('Error al eliminar contenido:', error);
    res.status(500).json({ error: 'Error al eliminar contenido', details: error.message });
  }
};

