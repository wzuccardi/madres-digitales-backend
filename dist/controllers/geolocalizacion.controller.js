"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analizarCobertura = exports.obtenerClusters = exports.obtenerHeatmap = exports.obtenerEstadisticas = exports.eliminarZonaCobertura = exports.actualizarZonaCobertura = exports.obtenerZonaCobertura = exports.obtenerZonasCobertura = exports.crearZonaCobertura = exports.calcularRutaMultiple = exports.calcularRuta = exports.buscarCercanos = void 0;
const geolocalizacion_service_1 = require("../services/geolocalizacion.service");
const geolocalizacion_dto_1 = require("../core/application/dtos/geolocalizacion.dto");
const logger_1 = require("../config/logger");
const geoService = new geolocalizacion_service_1.GeolocalizacionService();
/**
 * Buscar entidades cercanas
 * GET /api/geolocalizacion/cercanos
 */
const buscarCercanos = async (req, res, next) => {
    try {
        const dto = geolocalizacion_dto_1.buscarCercanosSchema.parse({
            latitud: parseFloat(req.query.latitud),
            longitud: parseFloat(req.query.longitud),
            radio: req.query.radio ? parseFloat(req.query.radio) : undefined,
            tipo: req.query.tipo,
            limit: req.query.limit ? parseInt(req.query.limit) : undefined,
        });
        const resultados = await geoService.buscarCercanos(dto);
        res.status(200).json({
            success: true,
            data: resultados,
            total: resultados.length,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.buscarCercanos = buscarCercanos;
/**
 * Calcular ruta entre dos puntos
 * POST /api/geolocalizacion/ruta
 */
const calcularRuta = async (req, res, next) => {
    try {
        const dto = geolocalizacion_dto_1.calcularRutaSchema.parse(req.body);
        const ruta = await geoService.calcularRuta(dto);
        res.status(200).json({
            success: true,
            data: ruta,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.calcularRuta = calcularRuta;
/**
 * Calcular ruta múltiple optimizada
 * POST /api/geolocalizacion/ruta-multiple
 */
const calcularRutaMultiple = async (req, res, next) => {
    try {
        const dto = geolocalizacion_dto_1.calcularRutaMultipleSchema.parse(req.body);
        const ruta = await geoService.calcularRutaMultiple(dto);
        res.status(200).json({
            success: true,
            data: ruta,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.calcularRutaMultiple = calcularRutaMultiple;
/**
 * Crear zona de cobertura
 * POST /api/geolocalizacion/zonas
 */
const crearZonaCobertura = async (req, res, next) => {
    try {
        const dto = geolocalizacion_dto_1.crearZonaCoberturaSchema.parse(req.body);
        const zona = await geoService.crearZonaCobertura(dto);
        logger_1.logger.info('Zona de cobertura creada', { zonaId: zona.id });
        res.status(201).json({
            success: true,
            message: 'Zona de cobertura creada exitosamente',
            data: zona,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.crearZonaCobertura = crearZonaCobertura;
/**
 * Obtener zonas de cobertura
 * GET /api/geolocalizacion/zonas
 */
const obtenerZonasCobertura = async (req, res, next) => {
    try {
        const municipioId = req.query.municipioId;
        const zonas = await geoService.obtenerZonasCobertura(municipioId);
        res.status(200).json({
            success: true,
            data: zonas,
            total: zonas.length,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.obtenerZonasCobertura = obtenerZonasCobertura;
/**
 * Obtener zona de cobertura por ID
 * GET /api/geolocalizacion/zonas/:id
 */
const obtenerZonaCobertura = async (req, res, next) => {
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
    }
    catch (error) {
        next(error);
    }
};
exports.obtenerZonaCobertura = obtenerZonaCobertura;
/**
 * Actualizar zona de cobertura
 * PUT /api/geolocalizacion/zonas/:id
 */
const actualizarZonaCobertura = async (req, res, next) => {
    try {
        const zonaId = req.params.id;
        const dto = geolocalizacion_dto_1.actualizarZonaCoberturaSchema.parse(req.body);
        // TODO: Implementar actualización en servicio
        res.status(200).json({
            success: true,
            message: 'Zona de cobertura actualizada exitosamente',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.actualizarZonaCobertura = actualizarZonaCobertura;
/**
 * Eliminar zona de cobertura
 * DELETE /api/geolocalizacion/zonas/:id
 */
const eliminarZonaCobertura = async (req, res, next) => {
    try {
        const zonaId = req.params.id;
        // TODO: Implementar eliminación en servicio
        res.status(200).json({
            success: true,
            message: 'Zona de cobertura eliminada exitosamente',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.eliminarZonaCobertura = eliminarZonaCobertura;
/**
 * Obtener estadísticas de geolocalización
 * GET /api/geolocalizacion/estadisticas
 */
const obtenerEstadisticas = async (req, res, next) => {
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
    }
    catch (error) {
        next(error);
    }
};
exports.obtenerEstadisticas = obtenerEstadisticas;
/**
 * Obtener heatmap
 * GET /api/geolocalizacion/heatmap
 */
const obtenerHeatmap = async (req, res, next) => {
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
    }
    catch (error) {
        next(error);
    }
};
exports.obtenerHeatmap = obtenerHeatmap;
/**
 * Obtener clusters
 * GET /api/geolocalizacion/clusters
 */
const obtenerClusters = async (req, res, next) => {
    try {
        // TODO: Implementar clusters en servicio
        res.status(200).json({
            success: true,
            data: [],
        });
    }
    catch (error) {
        next(error);
    }
};
exports.obtenerClusters = obtenerClusters;
/**
 * Analizar cobertura
 * POST /api/geolocalizacion/analizar-cobertura
 */
const analizarCobertura = async (req, res, next) => {
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
    }
    catch (error) {
        next(error);
    }
};
exports.analizarCobertura = analizarCobertura;
