"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.obtenerRecomendacionesSchema = exports.obtenerEstadisticasSchema = exports.calificarContenidoSchema = exports.registrarDescargaSchema = exports.registrarVistaSchema = exports.actualizarProgresoSchema = exports.buscarContenidoSchema = exports.actualizarContenidoSchema = exports.crearContenidoSchema = exports.NivelDificultad = exports.CategoriaContenido = exports.TipoContenido = void 0;
const zod_1 = require("zod");
/**
 * Enums para contenido educativo
 */
var TipoContenido;
(function (TipoContenido) {
    TipoContenido["VIDEO"] = "video";
    TipoContenido["AUDIO"] = "audio";
    TipoContenido["DOCUMENTO"] = "documento";
    TipoContenido["IMAGEN"] = "imagen";
    TipoContenido["ARTICULO"] = "articulo";
    TipoContenido["INFOGRAFIA"] = "infografia";
})(TipoContenido || (exports.TipoContenido = TipoContenido = {}));
var CategoriaContenido;
(function (CategoriaContenido) {
    CategoriaContenido["NUTRICION"] = "nutricion";
    CategoriaContenido["CUIDADO_PRENATAL"] = "cuidado_prenatal";
    CategoriaContenido["SIGNOS_ALARMA"] = "signos_alarma";
    CategoriaContenido["LACTANCIA"] = "lactancia";
    CategoriaContenido["PARTO"] = "parto";
    CategoriaContenido["POSPARTO"] = "posparto";
    CategoriaContenido["PLANIFICACION"] = "planificacion";
    CategoriaContenido["SALUD_MENTAL"] = "salud_mental";
    CategoriaContenido["EJERCICIO"] = "ejercicio";
    CategoriaContenido["HIGIENE"] = "higiene";
    CategoriaContenido["DERECHOS"] = "derechos";
    CategoriaContenido["OTROS"] = "otros";
})(CategoriaContenido || (exports.CategoriaContenido = CategoriaContenido = {}));
var NivelDificultad;
(function (NivelDificultad) {
    NivelDificultad["BASICO"] = "basico";
    NivelDificultad["INTERMEDIO"] = "intermedio";
    NivelDificultad["AVANZADO"] = "avanzado";
})(NivelDificultad || (exports.NivelDificultad = NivelDificultad = {}));
/**
 * Schema para crear contenido
 */
exports.crearContenidoSchema = zod_1.z.object({
    titulo: zod_1.z.string().min(1).max(200),
    descripcion: zod_1.z.string().min(1),
    tipo: zod_1.z.enum(['video', 'audio', 'documento', 'imagen', 'articulo', 'infografia']),
    categoria: zod_1.z.enum(['nutricion', 'cuidado_prenatal', 'signos_alarma', 'lactancia', 'parto', 'posparto', 'planificacion', 'salud_mental', 'ejercicio', 'higiene', 'derechos', 'otros']),
    nivel: zod_1.z.enum(['basico', 'intermedio', 'avanzado']).default('basico'),
    archivoUrl: zod_1.z.string().optional(), // Opcional cuando se sube archivo
    archivoNombre: zod_1.z.string().optional(),
    archivoTipo: zod_1.z.string().optional(),
    archivoTamano: zod_1.z.preprocess((val) => {
        // Convertir string a número si es necesario (para FormData)
        if (typeof val === 'string')
            return parseInt(val, 10);
        return val;
    }, zod_1.z.number().int().min(0).optional()),
    miniaturaUrl: zod_1.z.string().url().optional(),
    duracion: zod_1.z.preprocess((val) => {
        // Convertir string a número si es necesario (para FormData)
        if (typeof val === 'string')
            return parseInt(val, 10);
        return val;
    }, zod_1.z.number().int().positive().optional()),
    autor: zod_1.z.string().optional(),
    etiquetas: zod_1.z.array(zod_1.z.string()).optional(),
    orden: zod_1.z.preprocess((val) => {
        // Convertir string a número si es necesario (para FormData)
        if (typeof val === 'string')
            return parseInt(val, 10);
        return val;
    }, zod_1.z.number().int().default(0)),
    destacado: zod_1.z.preprocess((val) => {
        // Convertir string a booleano si es necesario (para FormData)
        if (typeof val === 'string')
            return val === 'true';
        return val;
    }, zod_1.z.boolean().default(false)),
    publico: zod_1.z.preprocess((val) => {
        // Convertir string a booleano si es necesario (para FormData)
        if (typeof val === 'string')
            return val === 'true';
        return val;
    }, zod_1.z.boolean().default(true)),
}).refine((data) => {
    // Al menos debe tener archivoUrl o los campos de archivo deben estar completos
    return data.archivoUrl || (data.archivoNombre && data.archivoTipo && data.archivoTamano !== undefined);
}, {
    message: 'Debe proporcionar archivoUrl o subir un archivo',
});
/**
 * Schema para actualizar contenido
 */
exports.actualizarContenidoSchema = zod_1.z.object({
    titulo: zod_1.z.string().min(1).max(200).optional(),
    descripcion: zod_1.z.string().min(1).optional(),
    tipo: zod_1.z.enum(['video', 'audio', 'documento', 'imagen', 'articulo', 'infografia']).optional(),
    categoria: zod_1.z.enum(['nutricion', 'cuidado_prenatal', 'signos_alarma', 'lactancia', 'parto', 'posparto', 'planificacion', 'salud_mental', 'ejercicio', 'higiene', 'derechos', 'otros']).optional(),
    nivel: zod_1.z.enum(['basico', 'intermedio', 'avanzado']).optional(),
    archivoUrl: zod_1.z.string().url().optional(),
    archivoNombre: zod_1.z.string().optional(),
    archivoTipo: zod_1.z.string().optional(),
    archivoTamano: zod_1.z.number().int().min(0).optional(),
    miniaturaUrl: zod_1.z.string().url().optional(),
    duracion: zod_1.z.number().int().positive().optional(),
    autor: zod_1.z.string().optional(),
    etiquetas: zod_1.z.array(zod_1.z.string()).optional(),
    orden: zod_1.z.number().int().optional(),
    destacado: zod_1.z.boolean().optional(),
    publico: zod_1.z.boolean().optional(),
});
/**
 * Schema para buscar contenido
 */
exports.buscarContenidoSchema = zod_1.z.object({
    query: zod_1.z.string().optional(),
    tipo: zod_1.z.enum(['video', 'audio', 'documento', 'imagen', 'articulo', 'infografia']).optional(),
    categoria: zod_1.z.enum(['nutricion', 'cuidado_prenatal', 'signos_alarma', 'lactancia', 'parto', 'posparto', 'planificacion', 'salud_mental', 'ejercicio', 'higiene', 'derechos', 'otros']).optional(),
    nivel: zod_1.z.enum(['basico', 'intermedio', 'avanzado']).optional(),
    etiquetas: zod_1.z.array(zod_1.z.string()).optional(),
    destacado: zod_1.z.boolean().optional(),
    publico: zod_1.z.boolean().optional(),
    limit: zod_1.z.number().int().positive().max(100).default(20),
    offset: zod_1.z.number().int().min(0).default(0),
    orderBy: zod_1.z.enum(['created_at', 'titulo', 'vistas', 'calificacion', 'orden']).default('created_at'),
    orderDir: zod_1.z.enum(['asc', 'desc']).default('desc'),
});
/**
 * Schema para actualizar progreso
 */
exports.actualizarProgresoSchema = zod_1.z.object({
    contenidoId: zod_1.z.string().uuid(),
    progreso: zod_1.z.number().min(0).max(100).optional(),
    completado: zod_1.z.boolean().optional(),
    tiempoVisto: zod_1.z.number().int().min(0).optional(),
    ultimaPosicion: zod_1.z.number().int().min(0).optional(),
    calificacion: zod_1.z.number().int().min(1).max(5).optional(),
    favorito: zod_1.z.boolean().optional(),
    notas: zod_1.z.string().optional(),
});
/**
 * Schema para registrar vista
 */
exports.registrarVistaSchema = zod_1.z.object({
    contenidoId: zod_1.z.string().uuid(),
});
/**
 * Schema para registrar descarga
 */
exports.registrarDescargaSchema = zod_1.z.object({
    contenidoId: zod_1.z.string().uuid(),
});
/**
 * Schema para calificar contenido
 */
exports.calificarContenidoSchema = zod_1.z.object({
    contenidoId: zod_1.z.string().uuid(),
    calificacion: zod_1.z.number().int().min(1).max(5),
});
/**
 * Schema para obtener estadísticas
 */
exports.obtenerEstadisticasSchema = zod_1.z.object({
    fechaInicio: zod_1.z.string().optional(),
    fechaFin: zod_1.z.string().optional(),
});
/**
 * Schema para obtener recomendaciones
 */
exports.obtenerRecomendacionesSchema = zod_1.z.object({
    limit: zod_1.z.number().int().positive().max(20).default(10),
    basadoEn: zod_1.z.enum(['historial', 'categoria', 'popularidad']).default('historial'),
});
