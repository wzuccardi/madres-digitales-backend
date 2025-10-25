"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analizarCoberturaSchema = exports.obtenerClustersSchema = exports.geocodificarInversaSchema = exports.geocodificarSchema = exports.obtenerHeatmapSchema = exports.verificarPuntoEnZonaSchema = exports.actualizarZonaCoberturaSchema = exports.crearZonaCoberturaSchema = exports.calcularRutaMultipleSchema = exports.calcularRutaSchema = exports.buscarCercanosSchema = exports.puntoGeoSchema = void 0;
const zod_1 = require("zod");
/**
 * Schema para punto geográfico
 */
exports.puntoGeoSchema = zod_1.z.object({
    type: zod_1.z.literal('Point'),
    coordinates: zod_1.z.tuple([zod_1.z.number(), zod_1.z.number()]), // [longitud, latitud]
});
/**
 * Schema para buscar entidades cercanas
 */
exports.buscarCercanosSchema = zod_1.z.object({
    latitud: zod_1.z.number().min(-90).max(90),
    longitud: zod_1.z.number().min(-180).max(180),
    radio: zod_1.z.number().positive().max(100).default(10), // km
    tipo: zod_1.z.enum(['gestantes', 'ips', 'madrinas', 'todos']).default('todos'),
    limit: zod_1.z.number().int().positive().max(100).default(20),
});
/**
 * Schema para calcular ruta
 */
exports.calcularRutaSchema = zod_1.z.object({
    origen: exports.puntoGeoSchema,
    destino: exports.puntoGeoSchema,
    optimizar: zod_1.z.boolean().default(true),
    evitarPeajes: zod_1.z.boolean().default(false),
});
/**
 * Schema para calcular ruta múltiple
 */
exports.calcularRutaMultipleSchema = zod_1.z.object({
    origen: exports.puntoGeoSchema,
    destinos: zod_1.z.array(exports.puntoGeoSchema).min(1).max(20),
    optimizar: zod_1.z.boolean().default(true),
    retornarAlOrigen: zod_1.z.boolean().default(false),
});
/**
 * Schema para zona de cobertura
 */
exports.crearZonaCoberturaSchema = zod_1.z.object({
    nombre: zod_1.z.string().min(1).max(100),
    descripcion: zod_1.z.string().optional(),
    madrinaId: zod_1.z.string().uuid(),
    municipioId: zod_1.z.string().uuid(),
    poligono: zod_1.z.object({
        type: zod_1.z.literal('Polygon'),
        coordinates: zod_1.z.array(zod_1.z.array(zod_1.z.tuple([zod_1.z.number(), zod_1.z.number()]))),
    }),
    color: zod_1.z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    activo: zod_1.z.boolean().default(true),
});
/**
 * Schema para actualizar zona de cobertura
 */
exports.actualizarZonaCoberturaSchema = zod_1.z.object({
    nombre: zod_1.z.string().min(1).max(100).optional(),
    descripcion: zod_1.z.string().optional(),
    poligono: zod_1.z.object({
        type: zod_1.z.literal('Polygon'),
        coordinates: zod_1.z.array(zod_1.z.array(zod_1.z.tuple([zod_1.z.number(), zod_1.z.number()]))),
    }).optional(),
    color: zod_1.z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    activo: zod_1.z.boolean().optional(),
});
/**
 * Schema para verificar punto en zona
 */
exports.verificarPuntoEnZonaSchema = zod_1.z.object({
    punto: exports.puntoGeoSchema,
    zonaId: zod_1.z.string().uuid().optional(),
});
/**
 * Schema para obtener heatmap
 */
exports.obtenerHeatmapSchema = zod_1.z.object({
    tipo: zod_1.z.enum(['gestantes', 'alertas', 'controles']),
    municipioId: zod_1.z.string().uuid().optional(),
    fechaInicio: zod_1.z.string().optional(),
    fechaFin: zod_1.z.string().optional(),
});
/**
 * Schema para geocodificación
 */
exports.geocodificarSchema = zod_1.z.object({
    direccion: zod_1.z.string().min(1),
    municipioId: zod_1.z.string().uuid().optional(),
});
/**
 * Schema para geocodificación inversa
 */
exports.geocodificarInversaSchema = zod_1.z.object({
    latitud: zod_1.z.number().min(-90).max(90),
    longitud: zod_1.z.number().min(-180).max(180),
});
/**
 * Schema para cluster de puntos
 */
exports.obtenerClustersSchema = zod_1.z.object({
    tipo: zod_1.z.enum(['gestantes', 'ips', 'alertas']),
    municipioId: zod_1.z.string().uuid().optional(),
    zoom: zod_1.z.number().int().min(1).max(20).default(10),
});
/**
 * Schema para análisis de cobertura
 */
exports.analizarCoberturaSchema = zod_1.z.object({
    municipioId: zod_1.z.string().uuid(),
    radioCobertura: zod_1.z.number().positive().default(5), // km
});
