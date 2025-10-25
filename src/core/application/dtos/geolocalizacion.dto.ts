import { z } from 'zod';

/**
 * Schema para punto geográfico
 */
export const puntoGeoSchema = z.object({
  type: z.literal('Point'),
  coordinates: z.tuple([z.number(), z.number()]), // [longitud, latitud]
});

export type PuntoGeoDTO = z.infer<typeof puntoGeoSchema>;

/**
 * Schema para buscar entidades cercanas
 */
export const buscarCercanosSchema = z.object({
  latitud: z.number().min(-90).max(90),
  longitud: z.number().min(-180).max(180),
  radio: z.number().positive().max(100).default(10), // km
  tipo: z.enum(['gestantes', 'ips', 'madrinas', 'todos']).default('todos'),
  limit: z.number().int().positive().max(100).default(20),
});

export type BuscarCercanosDTO = z.infer<typeof buscarCercanosSchema>;

/**
 * Schema para calcular ruta
 */
export const calcularRutaSchema = z.object({
  origen: puntoGeoSchema,
  destino: puntoGeoSchema,
  optimizar: z.boolean().default(true),
  evitarPeajes: z.boolean().default(false),
});

export type CalcularRutaDTO = z.infer<typeof calcularRutaSchema>;

/**
 * Schema para calcular ruta múltiple
 */
export const calcularRutaMultipleSchema = z.object({
  origen: puntoGeoSchema,
  destinos: z.array(puntoGeoSchema).min(1).max(20),
  optimizar: z.boolean().default(true),
  retornarAlOrigen: z.boolean().default(false),
});

export type CalcularRutaMultipleDTO = z.infer<typeof calcularRutaMultipleSchema>;

/**
 * Schema para zona de cobertura
 */
export const crearZonaCoberturaSchema = z.object({
  nombre: z.string().min(1).max(100),
  descripcion: z.string().optional(),
  madrinaId: z.string().uuid(),
  municipioId: z.string().uuid(),
  poligono: z.object({
    type: z.literal('Polygon'),
    coordinates: z.array(z.array(z.tuple([z.number(), z.number()]))),
  }),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  activo: z.boolean().default(true),
});

export type CrearZonaCoberturaDTO = z.infer<typeof crearZonaCoberturaSchema>;

/**
 * Schema para actualizar zona de cobertura
 */
export const actualizarZonaCoberturaSchema = z.object({
  nombre: z.string().min(1).max(100).optional(),
  descripcion: z.string().optional(),
  poligono: z.object({
    type: z.literal('Polygon'),
    coordinates: z.array(z.array(z.tuple([z.number(), z.number()]))),
  }).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  activo: z.boolean().optional(),
});

export type ActualizarZonaCoberturaDTO = z.infer<typeof actualizarZonaCoberturaSchema>;

/**
 * Schema para verificar punto en zona
 */
export const verificarPuntoEnZonaSchema = z.object({
  punto: puntoGeoSchema,
  zonaId: z.string().uuid().optional(),
});

export type VerificarPuntoEnZonaDTO = z.infer<typeof verificarPuntoEnZonaSchema>;

/**
 * Interfaces para respuestas
 */

export interface EntidadCercana {
  id: string;
  tipo: 'gestante' | 'ips' | 'madrina';
  nombre: string;
  ubicacion: PuntoGeoDTO;
  distancia: number; // en km
  direccion?: string;
  telefono?: string;
  metadata?: any;
}

export interface RutaCalculada {
  distancia: number; // en km
  duracion: number; // en minutos
  puntos: PuntoGeoDTO[];
  instrucciones?: string[];
  metadata?: {
    peajes?: number;
    carreteras?: string[];
  };
}

export interface RutaMultipleCalculada {
  distanciaTotal: number; // en km
  duracionTotal: number; // en minutos
  orden: number[]; // índices de destinos en orden óptimo
  rutas: RutaCalculada[];
}

export interface ZonaCobertura {
  id: string;
  nombre: string;
  descripcion?: string;
  madrinaId: string;
  madrinaNombre?: string;
  municipioId: string;
  municipioNombre?: string;
  poligono: {
    type: 'Polygon';
    coordinates: number[][][];
  };
  color?: string;
  activo: boolean;
  gestantesEnZona?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface EstadisticasGeolocalizacion {
  totalGestantes: number;
  gestantesConUbicacion: number;
  gestantesSinUbicacion: number;
  totalIPS: number;
  ipsConUbicacion: number;
  totalZonasCobertura: number;
  zonasActivas: number;
  distanciaPromedioIPS: number; // km
  coberturaPorcentaje: number; // %
}

export interface MapaHeatmap {
  puntos: Array<{
    latitud: number;
    longitud: number;
    peso: number; // intensidad
  }>;
  centro: PuntoGeoDTO;
  zoom: number;
}

/**
 * Schema para obtener heatmap
 */
export const obtenerHeatmapSchema = z.object({
  tipo: z.enum(['gestantes', 'alertas', 'controles']),
  municipioId: z.string().uuid().optional(),
  fechaInicio: z.string().optional(),
  fechaFin: z.string().optional(),
});

export type ObtenerHeatmapDTO = z.infer<typeof obtenerHeatmapSchema>;

/**
 * Schema para geocodificación
 */
export const geocodificarSchema = z.object({
  direccion: z.string().min(1),
  municipioId: z.string().uuid().optional(),
});

export type GeocodificarDTO = z.infer<typeof geocodificarSchema>;

/**
 * Schema para geocodificación inversa
 */
export const geocodificarInversaSchema = z.object({
  latitud: z.number().min(-90).max(90),
  longitud: z.number().min(-180).max(180),
});

export type GeocodificarInversaDTO = z.infer<typeof geocodificarInversaSchema>;

export interface ResultadoGeocodificacion {
  direccion: string;
  ubicacion: PuntoGeoDTO;
  municipio?: string;
  departamento?: string;
  pais?: string;
  codigoPostal?: string;
  confianza: number; // 0-1
}

/**
 * Schema para cluster de puntos
 */
export const obtenerClustersSchema = z.object({
  tipo: z.enum(['gestantes', 'ips', 'alertas']),
  municipioId: z.string().uuid().optional(),
  zoom: z.number().int().min(1).max(20).default(10),
});

export type ObtenerClustersDTO = z.infer<typeof obtenerClustersSchema>;

export interface Cluster {
  id: string;
  centro: PuntoGeoDTO;
  cantidad: number;
  tipo: string;
  items: string[]; // IDs de las entidades
}

/**
 * Schema para análisis de cobertura
 */
export const analizarCoberturaSchema = z.object({
  municipioId: z.string().uuid(),
  radioCobertura: z.number().positive().default(5), // km
});

export type AnalizarCoberturaDTO = z.infer<typeof analizarCoberturaSchema>;

export interface AnalisisCobertura {
  municipioId: string;
  municipioNombre: string;
  totalGestantes: number;
  gestantesCubiertas: number;
  gestantesNoCubiertas: number;
  porcentajeCobertura: number;
  zonasCobertura: number;
  ipsDisponibles: number;
  recomendaciones: string[];
  gestantesNoCubiertasDetalle: Array<{
    id: string;
    nombre: string;
    ubicacion: PuntoGeoDTO;
    distanciaIPSMasCercana: number;
  }>;
}

