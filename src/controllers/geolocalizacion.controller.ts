import { Request, Response, NextFunction } from 'express';
import { GeolocalizacionService } from '../services/geolocalizacion.service';
import {
  buscarCercanosSchema,
  calcularRutaSchema,
  calcularRutaMultipleSchema,
  crearZonaCoberturaSchema,
  actualizarZonaCoberturaSchema,
} from '../core/application/dtos/geolocalizacion.dto';
import { logger } from '../config/logger';

const geoService = new GeolocalizacionService();

/**
 * Buscar entidades cercanas
 * GET /api/geolocalizacion/cercanos
 */
export const buscarCercanos = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const dto = buscarCercanosSchema.parse({
      latitud: parseFloat(req.query.latitud as string),
      longitud: parseFloat(req.query.longitud as string),
      radio: req.query.radio ? parseFloat(req.query.radio as string) : undefined,
      tipo: req.query.tipo,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
    });

    const resultados = await geoService.buscarCercanos(dto);

    res.status(200).json({
      success: true,
      data: resultados,
      total: resultados.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Calcular ruta entre dos puntos
 * POST /api/geolocalizacion/ruta
 */
export const calcularRuta = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const dto = calcularRutaSchema.parse(req.body);
    const ruta = await geoService.calcularRuta(dto);

    res.status(200).json({
      success: true,
      data: ruta,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Calcular ruta múltiple optimizada
 * POST /api/geolocalizacion/ruta-multiple
 */
export const calcularRutaMultiple = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const dto = calcularRutaMultipleSchema.parse(req.body);
    const ruta = await geoService.calcularRutaMultiple(dto);

    res.status(200).json({
      success: true,
      data: ruta,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Crear zona de cobertura
 * POST /api/geolocalizacion/zonas
 */
export const crearZonaCobertura = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const dto = crearZonaCoberturaSchema.parse(req.body);
    const zona = await geoService.crearZonaCobertura(dto);

    logger.info('Zona de cobertura creada', { zonaId: zona.id });

    res.status(201).json({
      success: true,
      message: 'Zona de cobertura creada exitosamente',
      data: zona,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener zonas de cobertura
 * GET /api/geolocalizacion/zonas
 */
export const obtenerZonasCobertura = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const municipioId = req.query.municipioId as string | undefined;
    const zonas = await geoService.obtenerZonasCobertura(municipioId);

    res.status(200).json({
      success: true,
      data: zonas,
      total: zonas.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener zona de cobertura por ID
 * GET /api/geolocalizacion/zonas/:id
 */
export const obtenerZonaCobertura = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const zonaId = req.params.id;
    const zonas = await geoService.obtenerZonasCobertura();
    const zona = zonas.find((z) => z.id === zonaId);

    if (!zona) {
      return res.status(404).json({
        success: false,
        error: 'Zona de cobertura no encontrada',
      });
    }

    res.status(200).json({
      success: true,
      data: zona,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Actualizar zona de cobertura
 * PUT /api/geolocalizacion/zonas/:id
 */
export const actualizarZonaCobertura = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const zonaId = req.params.id;
    const dto = actualizarZonaCoberturaSchema.parse(req.body);

    // TODO: Implementar actualización en servicio

    res.status(200).json({
      success: true,
      message: 'Zona de cobertura actualizada exitosamente',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Eliminar zona de cobertura
 * DELETE /api/geolocalizacion/zonas/:id
 */
export const eliminarZonaCobertura = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const zonaId = req.params.id;

    // TODO: Implementar eliminación en servicio

    res.status(200).json({
      success: true,
      message: 'Zona de cobertura eliminada exitosamente',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener estadísticas de geolocalización
 * GET /api/geolocalizacion/estadisticas
 */
export const obtenerEstadisticas = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // TODO: Implementar estadísticas en servicio

    res.status(200).json({
      success: true,
      data: {
        totalGestantes: 0,
        gestantesConUbicacion: 0,
        gestantesSinUbicacion: 0,
        totalIPS: 0,
        ipsConUbicacion: 0,
        totalZonasCobertura: 0,
        zonasActivas: 0,
        distanciaPromedioIPS: 0,
        coberturaPorcentaje: 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener heatmap
 * GET /api/geolocalizacion/heatmap
 */
export const obtenerHeatmap = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // TODO: Implementar heatmap en servicio

    res.status(200).json({
      success: true,
      data: {
        puntos: [],
        centro: { type: 'Point', coordinates: [-75.5, 10.4] },
        zoom: 10,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener clusters
 * GET /api/geolocalizacion/clusters
 */
export const obtenerClusters = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // TODO: Implementar clusters en servicio

    res.status(200).json({
      success: true,
      data: [],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Analizar cobertura
 * POST /api/geolocalizacion/analizar-cobertura
 */
export const analizarCobertura = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // TODO: Implementar análisis de cobertura en servicio

    res.status(200).json({
      success: true,
      data: {
        municipioId: '',
        municipioNombre: '',
        totalGestantes: 0,
        gestantesCubiertas: 0,
        gestantesNoCubiertas: 0,
        porcentajeCobertura: 0,
        zonasCobertura: 0,
        ipsDisponibles: 0,
        recomendaciones: [],
        gestantesNoCubiertasDetalle: [],
      },
    });
  } catch (error) {
    next(error);
  }
};

