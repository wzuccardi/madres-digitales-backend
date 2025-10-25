"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calcularRiesgoSchema = exports.asignarIPSSchema = exports.asignarMadrinaSchema = exports.busquedaGeograficaSchema = exports.filtrosGestanteSchema = exports.actualizarGestanteCompletaSchema = exports.crearGestanteCompletaSchema = void 0;
// DTOs para Gestantes con validación completa
const zod_1 = require("zod");
/**
 * Schema para crear gestante completa
 */
exports.crearGestanteCompletaSchema = zod_1.z.object({
    // Datos básicos
    documento: zod_1.z.string()
        .min(6, 'El documento debe tener al menos 6 dígitos')
        .max(20, 'El documento no puede exceder 20 caracteres'),
    tipo_documento: zod_1.z.enum(['cedula', 'tarjeta_identidad', 'pasaporte', 'registro_civil'])
        .default('cedula'),
    nombre: zod_1.z.string()
        .min(3, 'El nombre debe tener al menos 3 caracteres')
        .max(200, 'El nombre no puede exceder 200 caracteres'),
    fecha_nacimiento: zod_1.z.string()
        .or(zod_1.z.date())
        .transform((val) => typeof val === 'string' ? new Date(val) : val),
    telefono: zod_1.z.string()
        .length(10, 'El teléfono debe tener 10 dígitos')
        .regex(/^\d+$/, 'El teléfono solo debe contener números')
        .optional()
        .nullable(),
    direccion: zod_1.z.string()
        .max(500, 'La dirección no puede exceder 500 caracteres')
        .optional()
        .nullable(),
    eps: zod_1.z.string()
        .max(100, 'El nombre de la EPS no puede exceder 100 caracteres')
        .optional()
        .nullable(),
    regimen_salud: zod_1.z.enum(['subsidiado', 'contributivo', 'especial', 'no_asegurado'])
        .default('subsidiado'),
    // Datos obstétricos
    numero_embarazo: zod_1.z.number()
        .int('El número de embarazo debe ser un entero')
        .min(1, 'El número de embarazo debe ser al menos 1')
        .max(20, 'El número de embarazo no puede exceder 20')
        .default(1),
    fecha_ultima_menstruacion: zod_1.z.string()
        .or(zod_1.z.date())
        .transform((val) => typeof val === 'string' ? new Date(val) : val)
        .optional()
        .nullable(),
    fecha_probable_parto: zod_1.z.string()
        .or(zod_1.z.date())
        .transform((val) => typeof val === 'string' ? new Date(val) : val)
        .optional()
        .nullable(),
    peso_actual: zod_1.z.number()
        .min(30, 'El peso debe ser al menos 30 kg')
        .max(200, 'El peso no puede exceder 200 kg')
        .optional()
        .nullable(),
    talla: zod_1.z.number()
        .min(100, 'La talla debe ser al menos 100 cm')
        .max(250, 'La talla no puede exceder 250 cm')
        .optional()
        .nullable(),
    grupo_sanguineo: zod_1.z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
        .optional()
        .nullable(),
    // Factores de riesgo
    factores_riesgo: zod_1.z.array(zod_1.z.string())
        .default([]),
    riesgo_alto: zod_1.z.boolean()
        .default(false),
    // Estado
    activa: zod_1.z.boolean()
        .default(true),
    // Asignaciones
    municipio_id: zod_1.z.string()
        .uuid('El ID del municipio debe ser un UUID válido')
        .optional()
        .nullable(),
    madrina_id: zod_1.z.string()
        .uuid('El ID de la madrina debe ser un UUID válido')
        .optional()
        .nullable(),
    ips_asignada_id: zod_1.z.string()
        .uuid('El ID de la IPS debe ser un UUID válido')
        .optional()
        .nullable(),
    medico_asignado_id: zod_1.z.string()
        .uuid('El ID del médico debe ser un UUID válido')
        .optional()
        .nullable(),
    // Geolocalización
    latitud: zod_1.z.number()
        .min(-90, 'La latitud debe estar entre -90 y 90')
        .max(90, 'La latitud debe estar entre -90 y 90')
        .optional()
        .nullable(),
    longitud: zod_1.z.number()
        .min(-180, 'La longitud debe estar entre -180 y 180')
        .max(180, 'La longitud debe estar entre -180 y 180')
        .optional()
        .nullable(),
    // Contacto de emergencia
    contacto_emergencia_nombre: zod_1.z.string()
        .max(200, 'El nombre del contacto no puede exceder 200 caracteres')
        .optional()
        .nullable(),
    contacto_emergencia_telefono: zod_1.z.string()
        .length(10, 'El teléfono debe tener 10 dígitos')
        .regex(/^\d+$/, 'El teléfono solo debe contener números')
        .optional()
        .nullable(),
});
/**
 * Schema para actualizar gestante
 */
exports.actualizarGestanteCompletaSchema = exports.crearGestanteCompletaSchema.partial();
/**
 * Schema para filtros de búsqueda
 */
exports.filtrosGestanteSchema = zod_1.z.object({
    // Búsqueda por texto
    busqueda: zod_1.z.string()
        .optional(),
    // Filtros específicos
    documento: zod_1.z.string()
        .optional(),
    nombre: zod_1.z.string()
        .optional(),
    municipio_id: zod_1.z.string()
        .uuid()
        .optional(),
    madrina_id: zod_1.z.string()
        .uuid()
        .optional(),
    ips_asignada_id: zod_1.z.string()
        .uuid()
        .optional(),
    activa: zod_1.z.boolean()
        .optional(),
    riesgo_alto: zod_1.z.boolean()
        .optional(),
    sin_madrina: zod_1.z.boolean()
        .optional(),
    sin_ips: zod_1.z.boolean()
        .optional(),
    // Filtros de fecha
    fecha_parto_desde: zod_1.z.string()
        .or(zod_1.z.date())
        .transform((val) => typeof val === 'string' ? new Date(val) : val)
        .optional(),
    fecha_parto_hasta: zod_1.z.string()
        .or(zod_1.z.date())
        .transform((val) => typeof val === 'string' ? new Date(val) : val)
        .optional(),
    // Paginación
    page: zod_1.z.number()
        .int()
        .min(1)
        .default(1),
    limit: zod_1.z.number()
        .int()
        .min(1)
        .max(100)
        .default(20),
    // Ordenamiento
    orderBy: zod_1.z.enum(['nombre', 'documento', 'fecha_probable_parto', 'fecha_creacion'])
        .default('fecha_creacion'),
    orderDirection: zod_1.z.enum(['asc', 'desc'])
        .default('desc'),
});
/**
 * Schema para búsqueda geográfica
 */
exports.busquedaGeograficaSchema = zod_1.z.object({
    latitud: zod_1.z.number()
        .min(-90)
        .max(90),
    longitud: zod_1.z.number()
        .min(-180)
        .max(180),
    radio_km: zod_1.z.number()
        .min(0.1)
        .max(100)
        .default(5),
    limit: zod_1.z.number()
        .int()
        .min(1)
        .max(100)
        .default(20),
});
/**
 * Schema para asignar madrina
 */
exports.asignarMadrinaSchema = zod_1.z.object({
    gestante_id: zod_1.z.string()
        .uuid('El ID de la gestante debe ser un UUID válido'),
    madrina_id: zod_1.z.string()
        .uuid('El ID de la madrina debe ser un UUID válido'),
});
/**
 * Schema para asignar IPS
 */
exports.asignarIPSSchema = zod_1.z.object({
    gestante_id: zod_1.z.string()
        .uuid('El ID de la gestante debe ser un UUID válido'),
    ips_id: zod_1.z.string()
        .uuid('El ID de la IPS debe ser un UUID válido'),
});
/**
 * Schema para calcular riesgo
 */
exports.calcularRiesgoSchema = zod_1.z.object({
    gestante_id: zod_1.z.string()
        .uuid('El ID de la gestante debe ser un UUID válido'),
});
