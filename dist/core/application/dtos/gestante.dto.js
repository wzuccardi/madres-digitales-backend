"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buscarCercanasSchema = exports.asignarMadrinaSchema = exports.filtrosGestanteSchema = exports.actualizarGestanteSchema = exports.crearGestanteSchema = void 0;
const zod_1 = require("zod");
/**
 * Schema de validación para crear gestante
 */
exports.crearGestanteSchema = zod_1.z.object({
    nombre: zod_1.z.string()
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .max(100, 'El nombre no puede exceder 100 caracteres')
        .trim(),
    apellido: zod_1.z.string()
        .min(2, 'El apellido debe tener al menos 2 caracteres')
        .max(100, 'El apellido no puede exceder 100 caracteres')
        .trim(),
    documento: zod_1.z.string()
        .min(5, 'El documento debe tener al menos 5 caracteres')
        .max(20, 'El documento no puede exceder 20 caracteres')
        .trim(),
    tipoDocumento: zod_1.z.enum(['CC', 'TI', 'RC', 'CE', 'PA']),
    fechaNacimiento: zod_1.z.coerce.date()
        .refine((fecha) => {
        const edad = new Date().getFullYear() - fecha.getFullYear();
        return edad >= 10 && edad <= 60;
    }, { message: 'La edad debe estar entre 10 y 60 años' }),
    telefono: zod_1.z.string()
        .min(7, 'El teléfono debe tener al menos 7 dígitos')
        .max(15, 'El teléfono no puede exceder 15 dígitos')
        .optional()
        .nullable(),
    direccion: zod_1.z.string()
        .max(200, 'La dirección no puede exceder 200 caracteres')
        .optional()
        .nullable(),
    municipioId: zod_1.z.string().uuid(),
    ipsId: zod_1.z.string().uuid().optional().nullable(),
    madrinaId: zod_1.z.string().uuid().optional().nullable(),
    fechaUltimaMenstruacion: zod_1.z.coerce.date().optional().nullable(),
    fechaProbableParto: zod_1.z.coerce.date().optional().nullable(),
    numeroEmbarazos: zod_1.z.number()
        .int('El número de embarazos debe ser un entero')
        .min(0, 'El número de embarazos no puede ser negativo')
        .max(20, 'El número de embarazos no puede exceder 20'),
    numeroPartos: zod_1.z.number()
        .int('El número de partos debe ser un entero')
        .min(0, 'El número de partos no puede ser negativo')
        .max(20, 'El número de partos no puede exceder 20'),
    numeroAbortos: zod_1.z.number()
        .int('El número de abortos debe ser un entero')
        .min(0, 'El número de abortos no puede ser negativo')
        .max(20, 'El número de abortos no puede exceder 20'),
    grupoSanguineo: zod_1.z.enum(['A', 'B', 'AB', 'O']).optional().nullable(),
    factorRh: zod_1.z.enum(['+', '-']).optional().nullable(),
    alergias: zod_1.z.string()
        .max(500, 'Las alergias no pueden exceder 500 caracteres')
        .optional()
        .nullable(),
    enfermedadesPreexistentes: zod_1.z.string()
        .max(500, 'Las enfermedades preexistentes no pueden exceder 500 caracteres')
        .optional()
        .nullable(),
    observaciones: zod_1.z.string()
        .max(1000, 'Las observaciones no pueden exceder 1000 caracteres')
        .optional()
        .nullable(),
    latitud: zod_1.z.number()
        .min(-90, 'La latitud debe estar entre -90 y 90')
        .max(90, 'La latitud debe estar entre -90 y 90')
        .optional()
        .nullable(),
    longitud: zod_1.z.number()
        .min(-180, 'La longitud debe estar entre -180 y 180')
        .max(180, 'La longitud debe estar entre -180 y 180')
        .optional()
        .nullable()
}).refine((data) => data.numeroPartos + data.numeroAbortos <= data.numeroEmbarazos, {
    message: 'La suma de partos y abortos no puede ser mayor que el número de embarazos',
    path: ['numeroEmbarazos']
});
/**
 * Schema de validación para actualizar gestante
 */
exports.actualizarGestanteSchema = exports.crearGestanteSchema.partial();
/**
 * Schema de validación para filtros de búsqueda
 */
exports.filtrosGestanteSchema = zod_1.z.object({
    municipioId: zod_1.z.string().uuid().optional(),
    madrinaId: zod_1.z.string().uuid().optional(),
    ipsId: zod_1.z.string().uuid().optional(),
    activo: zod_1.z.boolean().optional(),
    altoRiesgo: zod_1.z.boolean().optional(),
    sinAsignar: zod_1.z.boolean().optional(),
    busqueda: zod_1.z.string().optional(),
    pagina: zod_1.z.number().int().min(1).default(1),
    limite: zod_1.z.number().int().min(1).max(100).default(10),
    ordenarPor: zod_1.z.string().optional(),
    orden: zod_1.z.enum(['asc', 'desc']).default('desc')
});
/**
 * Schema de validación para asignar madrina
 */
exports.asignarMadrinaSchema = zod_1.z.object({
    gestanteId: zod_1.z.string().uuid(),
    madrinaId: zod_1.z.string().uuid()
});
/**
 * Schema de validación para búsqueda por cercanía
 */
exports.buscarCercanasSchema = zod_1.z.object({
    latitud: zod_1.z.number()
        .min(-90, 'La latitud debe estar entre -90 y 90')
        .max(90, 'La latitud debe estar entre -90 y 90'),
    longitud: zod_1.z.number()
        .min(-180, 'La longitud debe estar entre -180 y 180')
        .max(180, 'La longitud debe estar entre -180 y 180'),
    radioKm: zod_1.z.number()
        .min(0.1, 'El radio debe ser al menos 0.1 km')
        .max(100, 'El radio no puede exceder 100 km')
        .default(5)
});
