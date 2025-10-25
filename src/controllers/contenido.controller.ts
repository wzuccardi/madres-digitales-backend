import { Request, Response, NextFunction } from 'express';
import { ContenidoService } from '../services/contenido.service';
import {
  crearContenidoSchema,
  actualizarContenidoSchema,
  buscarContenidoSchema,
  actualizarProgresoSchema,
  registrarVistaSchema,
  registrarDescargaSchema,
  calificarContenidoSchema,
} from '../core/application/dtos/contenido.dto';
import { logger } from '../config/logger';

const contenidoService = new ContenidoService();

/**
 * Crear contenido educativo
 * POST /api/contenido
 */
export const crearContenido = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    // Si hay archivo subido, usar su información
    const file = req.file as Express.Multer.File | undefined;
    let dto: any = { ...req.body };

    if (file) {
      // Archivo subido localmente
      dto.archivoUrl = `/uploads/${file.filename}`;
      dto.archivoNombre = file.originalname;
      dto.archivoTipo = file.mimetype;
      dto.archivoTamano = file.size;

      logger.info('Archivo subido', {
        filename: file.filename,
        originalname: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
      });
    }

    const validatedDto = crearContenidoSchema.parse(dto);
    const contenido = await contenidoService.crearContenido(validatedDto, userId);

    logger.info('Contenido creado', { userId, contenidoId: contenido.id });

    res.status(201).json({
      success: true,
      message: 'Contenido creado exitosamente',
      data: contenido,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener contenido por ID
 * GET /api/contenido/:id
 */
export const obtenerContenido = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const contenidoId = req.params.id;

    const contenido = await contenidoService.obtenerContenido(contenidoId, userId);

    res.status(200).json({
      success: true,
      data: contenido,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Buscar contenido
 * GET /api/contenido
 */
export const buscarContenido = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;

    const dto = buscarContenidoSchema.parse({
      query: req.query.query,
      tipo: req.query.tipo,
      categoria: req.query.categoria,
      nivel: req.query.nivel,
      etiquetas: req.query.etiquetas ? (req.query.etiquetas as string).split(',') : undefined,
      destacado: req.query.destacado === 'true' ? true : undefined,
      publico: req.query.publico !== undefined ? req.query.publico === 'true' : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
      orderBy: req.query.orderBy,
      orderDir: req.query.orderDir,
    });

    console.log('🔍 Buscar contenido DTO:', JSON.stringify(dto, null, 2));
    const result = await contenidoService.buscarContenido(dto, userId);
    console.log('✅ Resultado:', result.total, 'contenidos encontrados');

    const limit = dto.limit || 20;
    const offset = dto.offset || 0;

    res.status(200).json({
      contenidos: result.contenidos,
      total: result.total,
      page: Math.floor(offset / limit) + 1,
      limit: limit,
      totalPages: Math.ceil(result.total / limit),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Actualizar contenido
 * PUT /api/contenido/:id
 */
export const actualizarContenido = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const contenidoId = req.params.id;

    // Si hay archivo subido, usar su información
    const file = req.file as Express.Multer.File | undefined;
    let dto: any = { ...req.body };

    if (file) {
      // Archivo subido localmente - eliminar el anterior
      const contenidoActual = await contenidoService.obtenerContenido(contenidoId);
      if (contenidoActual && contenidoActual.archivo_url?.startsWith('/uploads/')) {
        const { eliminarArchivo } = await import('../utils/file.utils');
        await eliminarArchivo(contenidoActual.archivo_url).catch((err) => {
          logger.warn('Error eliminando archivo anterior', { error: err });
        });
      }

      dto.archivoUrl = `/uploads/${file.filename}`;
      dto.archivoNombre = file.originalname;
      dto.archivoTipo = file.mimetype;
      dto.archivoTamano = file.size;

      logger.info('Archivo actualizado', {
        filename: file.filename,
        originalname: file.originalname,
        size: file.size,
      });
    }

    const validatedDto = actualizarContenidoSchema.parse(dto);
    const contenido = await contenidoService.actualizarContenido(contenidoId, validatedDto);

    logger.info('Contenido actualizado', { contenidoId });

    res.status(200).json({
      success: true,
      message: 'Contenido actualizado exitosamente',
      data: contenido,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Eliminar contenido
 * DELETE /api/contenido/:id
 */
export const eliminarContenido = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const contenidoId = req.params.id;

    // Obtener contenido para eliminar archivo físico si existe
    const contenido = await contenidoService.obtenerContenido(contenidoId);

    // Eliminar del base de datos
    await contenidoService.eliminarContenido(contenidoId);

    // Eliminar archivo físico si es local
    if (contenido && contenido.archivo_url?.startsWith('/uploads/')) {
      const { eliminarArchivo } = await import('../utils/file.utils');
      await eliminarArchivo(contenido.archivo_url).catch((err) => {
        logger.warn('Error eliminando archivo físico', { error: err });
      });
    }

    logger.info('Contenido eliminado', { contenidoId });

    res.status(200).json({
      success: true,
      message: 'Contenido eliminado exitosamente',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Actualizar progreso
 * POST /api/contenido/:id/progreso
 */
export const actualizarProgreso = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    const dto = actualizarProgresoSchema.parse({
      ...req.body,
      contenidoId: req.params.id,
    });

    const progreso = await contenidoService.actualizarProgreso(dto, userId);

    res.status(200).json({
      success: true,
      message: 'Progreso actualizado exitosamente',
      data: progreso,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Registrar vista
 * POST /api/contenido/:id/vista
 */
export const registrarVista = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const contenidoId = req.params.id;

    await contenidoService.registrarVista(contenidoId);

    res.status(200).json({
      success: true,
      message: 'Vista registrada',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Registrar descarga
 * POST /api/contenido/:id/descarga
 */
export const registrarDescarga = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const contenidoId = req.params.id;

    await contenidoService.registrarDescarga(contenidoId);

    res.status(200).json({
      success: true,
      message: 'Descarga registrada',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Calificar contenido
 * POST /api/contenido/:id/calificar
 */
export const calificarContenido = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    const dto = calificarContenidoSchema.parse({
      contenidoId: req.params.id,
      calificacion: req.body.calificacion,
    });

    await contenidoService.calificarContenido(dto.contenidoId, dto.calificacion, userId);

    res.status(200).json({
      success: true,
      message: 'Contenido calificado exitosamente',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener estadísticas
 * GET /api/contenido/estadisticas
 */
export const obtenerEstadisticas = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const estadisticas = await contenidoService.obtenerEstadisticas();

    res.status(200).json({
      success: true,
      data: estadisticas,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener contenido destacado
 * GET /api/contenido/destacado
 */
export const obtenerDestacado = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;

    const result = await contenidoService.buscarContenido(
      {
        destacado: true,
        publico: true,
        limit: 10,
        offset: 0,
        orderBy: 'orden',
        orderDir: 'asc',
      },
      userId
    );

    res.status(200).json({
      success: true,
      data: result.contenidos,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener favoritos del usuario
 * GET /api/contenido/favoritos
 */
export const obtenerFavoritos = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    // TODO: Implementar búsqueda de favoritos

    res.status(200).json({
      success: true,
      data: [],
    });
  } catch (error) {
    next(error);
  }
};

