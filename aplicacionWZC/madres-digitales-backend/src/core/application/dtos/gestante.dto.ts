import { z } from 'zod';

/**
 * Schema de validación para crear gestante
 */
export const crearGestanteSchema = z.object({
  nombre: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .trim(),
  
  apellido: z.string()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(100, 'El apellido no puede exceder 100 caracteres')
    .trim(),
  
  documento: z.string()
    .min(5, 'El documento debe tener al menos 5 caracteres')
    .max(20, 'El documento no puede exceder 20 caracteres')
    .trim(),
  
  tipoDocumento: z.enum(['CC', 'TI', 'RC', 'CE', 'PA']),
  
  fechaNacimiento: z.coerce.date()
    .refine(
      (fecha) => {
        const edad = new Date().getFullYear() - fecha.getFullYear();
        return edad >= 10 && edad <= 60;
      },
      { message: 'La edad debe estar entre 10 y 60 años' }
    ),
  
  telefono: z.string()
    .min(7, 'El teléfono debe tener al menos 7 dígitos')
    .max(15, 'El teléfono no puede exceder 15 dígitos')
    .optional()
    .nullable(),
  
  direccion: z.string()
    .max(200, 'La dirección no puede exceder 200 caracteres')
    .optional()
    .nullable(),
  
  municipioId: z.string().uuid(),
  
  ipsId: z.string().uuid().optional().nullable(),
  
  madrinaId: z.string().uuid().optional().nullable(),
  
  fechaUltimaMenstruacion: z.coerce.date().optional().nullable(),
  
  fechaProbableParto: z.coerce.date().optional().nullable(),
  
  numeroEmbarazos: z.number()
    .int('El número de embarazos debe ser un entero')
    .min(0, 'El número de embarazos no puede ser negativo')
    .max(20, 'El número de embarazos no puede exceder 20'),
  
  numeroPartos: z.number()
    .int('El número de partos debe ser un entero')
    .min(0, 'El número de partos no puede ser negativo')
    .max(20, 'El número de partos no puede exceder 20'),
  
  numeroAbortos: z.number()
    .int('El número de abortos debe ser un entero')
    .min(0, 'El número de abortos no puede ser negativo')
    .max(20, 'El número de abortos no puede exceder 20'),
  
  grupoSanguineo: z.enum(['A', 'B', 'AB', 'O']).optional().nullable(),
  
  factorRh: z.enum(['+', '-']).optional().nullable(),
  
  alergias: z.string()
    .max(500, 'Las alergias no pueden exceder 500 caracteres')
    .optional()
    .nullable(),
  
  enfermedadesPreexistentes: z.string()
    .max(500, 'Las enfermedades preexistentes no pueden exceder 500 caracteres')
    .optional()
    .nullable(),
  
  observaciones: z.string()
    .max(1000, 'Las observaciones no pueden exceder 1000 caracteres')
    .optional()
    .nullable(),
  
  latitud: z.number()
    .min(-90, 'La latitud debe estar entre -90 y 90')
    .max(90, 'La latitud debe estar entre -90 y 90')
    .optional()
    .nullable(),
  
  longitud: z.number()
    .min(-180, 'La longitud debe estar entre -180 y 180')
    .max(180, 'La longitud debe estar entre -180 y 180')
    .optional()
    .nullable()
}).refine(
  (data) => data.numeroPartos + data.numeroAbortos <= data.numeroEmbarazos,
  {
    message: 'La suma de partos y abortos no puede ser mayor que el número de embarazos',
    path: ['numeroEmbarazos']
  }
);

/**
 * Schema de validación para actualizar gestante
 */
export const actualizarGestanteSchema = crearGestanteSchema.partial();

/**
 * Schema de validación para filtros de búsqueda
 */
export const filtrosGestanteSchema = z.object({
  municipioId: z.string().uuid().optional(),
  madrinaId: z.string().uuid().optional(),
  ipsId: z.string().uuid().optional(),
  activo: z.boolean().optional(),
  altoRiesgo: z.boolean().optional(),
  sinAsignar: z.boolean().optional(),
  busqueda: z.string().optional(),
  pagina: z.number().int().min(1).default(1),
  limite: z.number().int().min(1).max(100).default(10),
  ordenarPor: z.string().optional(),
  orden: z.enum(['asc', 'desc']).default('desc')
});

/**
 * Schema de validación para asignar madrina
 */
export const asignarMadrinaSchema = z.object({
  gestanteId: z.string().uuid(),
  madrinaId: z.string().uuid()
});

/**
 * Schema de validación para búsqueda por cercanía
 */
export const buscarCercanasSchema = z.object({
  latitud: z.number()
    .min(-90, 'La latitud debe estar entre -90 y 90')
    .max(90, 'La latitud debe estar entre -90 y 90'),
  longitud: z.number()
    .min(-180, 'La longitud debe estar entre -180 y 180')
    .max(180, 'La longitud debe estar entre -180 y 180'),
  radioKm: z.number()
    .min(0.1, 'El radio debe ser al menos 0.1 km')
    .max(100, 'El radio no puede exceder 100 km')
    .default(5)
});

// Tipos TypeScript inferidos de los schemas
export type CrearGestanteDTO = z.infer<typeof crearGestanteSchema>;
export type ActualizarGestanteDTO = z.infer<typeof actualizarGestanteSchema>;
export type FiltrosGestanteDTO = z.infer<typeof filtrosGestanteSchema>;
export type AsignarMadrinaDTO = z.infer<typeof asignarMadrinaSchema>;
export type BuscarCercanasDTO = z.infer<typeof buscarCercanasSchema>;

