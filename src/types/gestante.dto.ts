// DTOs para Gestantes con validación completa
import { z } from 'zod';

/**
 * Schema para crear gestante completa
 */
export const crearGestanteCompletaSchema = z.object({
  // Datos básicos
  documento: z.string()
    .min(6, 'El documento debe tener al menos 6 dígitos')
    .max(20, 'El documento no puede exceder 20 caracteres'),
  
  tipo_documento: z.enum(['cedula', 'tarjeta_identidad', 'pasaporte', 'registro_civil'])
    .default('cedula'),
  
  nombre: z.string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(200, 'El nombre no puede exceder 200 caracteres'),
  
  fecha_nacimiento: z.string()
    .or(z.date())
    .transform((val) => typeof val === 'string' ? new Date(val) : val),
  
  telefono: z.string()
    .length(10, 'El teléfono debe tener 10 dígitos')
    .regex(/^\d+$/, 'El teléfono solo debe contener números')
    .optional()
    .nullable(),
  
  direccion: z.string()
    .max(500, 'La dirección no puede exceder 500 caracteres')
    .optional()
    .nullable(),
  
  eps: z.string()
    .max(100, 'El nombre de la EPS no puede exceder 100 caracteres')
    .optional()
    .nullable(),
  
  regimen_salud: z.enum(['subsidiado', 'contributivo', 'especial', 'no_asegurado'])
    .default('subsidiado'),
  
  // Datos obstétricos
  numero_embarazo: z.number()
    .int('El número de embarazo debe ser un entero')
    .min(1, 'El número de embarazo debe ser al menos 1')
    .max(20, 'El número de embarazo no puede exceder 20')
    .default(1),
  
  fecha_ultima_menstruacion: z.string()
    .or(z.date())
    .transform((val) => typeof val === 'string' ? new Date(val) : val)
    .optional()
    .nullable(),
  
  fecha_probable_parto: z.string()
    .or(z.date())
    .transform((val) => typeof val === 'string' ? new Date(val) : val)
    .optional()
    .nullable(),
  
  peso_actual: z.number()
    .min(30, 'El peso debe ser al menos 30 kg')
    .max(200, 'El peso no puede exceder 200 kg')
    .optional()
    .nullable(),
  
  talla: z.number()
    .min(100, 'La talla debe ser al menos 100 cm')
    .max(250, 'La talla no puede exceder 250 cm')
    .optional()
    .nullable(),
  
  grupo_sanguineo: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .optional()
    .nullable(),
  
  // Factores de riesgo
  factores_riesgo: z.array(z.string())
    .default([]),
  
  riesgo_alto: z.boolean()
    .default(false),
  
  // Estado
  activa: z.boolean()
    .default(true),
  
  // Asignaciones
  municipio_id: z.string()
    .uuid('El ID del municipio debe ser un UUID válido')
    .optional()
    .nullable(),
  
  madrina_id: z.string()
    .uuid('El ID de la madrina debe ser un UUID válido')
    .optional()
    .nullable(),
  
  ips_asignada_id: z.string()
    .uuid('El ID de la IPS debe ser un UUID válido')
    .optional()
    .nullable(),
  
  medico_tratante_id: z.string()
    .uuid('El ID del médico debe ser un UUID válido')
    .optional()
    .nullable(),
  
  // Geolocalización
  latitud: z.number()
    .min(-90, 'La latitud debe estar entre -90 y 90')
    .max(90, 'La latitud debe estar entre -90 y 90')
    .optional()
    .nullable(),
  
  longitud: z.number()
    .min(-180, 'La longitud debe estar entre -180 y 180')
    .max(180, 'La longitud debe estar entre -180 y 180')
    .optional()
    .nullable(),
  
  // Contacto de emergencia
  contacto_emergencia_nombre: z.string()
    .max(200, 'El nombre del contacto no puede exceder 200 caracteres')
    .optional()
    .nullable(),
  
  contacto_emergencia_telefono: z.string()
    .length(10, 'El teléfono debe tener 10 dígitos')
    .regex(/^\d+$/, 'El teléfono solo debe contener números')
    .optional()
    .nullable(),
});

/**
 * Schema para actualizar gestante
 */
export const actualizarGestanteCompletaSchema = crearGestanteCompletaSchema.partial();

/**
 * Schema para filtros de búsqueda
 */
export const filtrosGestanteSchema = z.object({
  // Búsqueda por texto
  busqueda: z.string()
    .optional(),
  
  // Filtros específicos
  documento: z.string()
    .optional(),
  
  nombre: z.string()
    .optional(),
  
  municipio_id: z.string()
    .uuid()
    .optional(),
  
  madrina_id: z.string()
    .uuid()
    .optional(),
  
  ips_asignada_id: z.string()
    .uuid()
    .optional(),
  
  activa: z.boolean()
    .optional(),
  
  riesgo_alto: z.boolean()
    .optional(),
  
  sin_madrina: z.boolean()
    .optional(),
  
  sin_ips: z.boolean()
    .optional(),
  
  // Filtros de fecha
  fecha_parto_desde: z.string()
    .or(z.date())
    .transform((val) => typeof val === 'string' ? new Date(val) : val)
    .optional(),
  
  fecha_parto_hasta: z.string()
    .or(z.date())
    .transform((val) => typeof val === 'string' ? new Date(val) : val)
    .optional(),
  
  // Paginación
  page: z.number()
    .int()
    .min(1)
    .default(1),
  
  limit: z.number()
    .int()
    .min(1)
    .max(100)
    .default(20),
  
  // Ordenamiento
  orderBy: z.enum(['nombre', 'documento', 'fecha_probable_parto', 'fecha_creacion'])
    .default('fecha_creacion'),
  
  orderDirection: z.enum(['asc', 'desc'])
    .default('desc'),
});

/**
 * Schema para búsqueda geográfica
 */
export const busquedaGeograficaSchema = z.object({
  latitud: z.number()
    .min(-90)
    .max(90),
  
  longitud: z.number()
    .min(-180)
    .max(180),
  
  radio_km: z.number()
    .min(0.1)
    .max(100)
    .default(5),
  
  limit: z.number()
    .int()
    .min(1)
    .max(100)
    .default(20),
});

/**
 * Schema para asignar madrina
 */
export const asignarMadrinaSchema = z.object({
  gestante_id: z.string()
    .uuid('El ID de la gestante debe ser un UUID válido'),
  
  madrina_id: z.string()
    .uuid('El ID de la madrina debe ser un UUID válido'),
});

/**
 * Schema para asignar IPS
 */
export const asignarIPSSchema = z.object({
  gestante_id: z.string()
    .uuid('El ID de la gestante debe ser un UUID válido'),
  
  ips_id: z.string()
    .uuid('El ID de la IPS debe ser un UUID válido'),
});

/**
 * Schema para calcular riesgo
 */
export const calcularRiesgoSchema = z.object({
  gestante_id: z.string()
    .uuid('El ID de la gestante debe ser un UUID válido'),
});

// Tipos TypeScript inferidos
export type CrearGestanteCompletaDTO = z.infer<typeof crearGestanteCompletaSchema>;
export type ActualizarGestanteCompletaDTO = z.infer<typeof actualizarGestanteCompletaSchema>;
export type FiltrosGestanteDTO = z.infer<typeof filtrosGestanteSchema>;
export type BusquedaGeograficaDTO = z.infer<typeof busquedaGeograficaSchema>;
export type AsignarMadrinaDTO = z.infer<typeof asignarMadrinaSchema>;
export type AsignarIPSDTO = z.infer<typeof asignarIPSSchema>;
export type CalcularRiesgoDTO = z.infer<typeof calcularRiesgoSchema>;

/**
 * Respuesta paginada
 */
export interface RespuestaPaginada<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

/**
 * Respuesta de cálculo de riesgo
 */
export interface RiesgoGestante {
  gestante_id: string;
  puntuacion_riesgo: number;
  nivel_riesgo: 'bajo' | 'medio' | 'alto' | 'critico';
  factores_detectados: string[];
  recomendaciones: string[];
  requiere_atencion_inmediata: boolean;
}

