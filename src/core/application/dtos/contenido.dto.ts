import { z } from 'zod';

/**
 * Enums para contenido educativo
 */
export enum TipoContenido {
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENTO = 'documento',
  IMAGEN = 'imagen',
  ARTICULO = 'articulo',
  INFOGRAFIA = 'infografia',
}

export enum CategoriaContenido {
  NUTRICION = 'nutricion',
  CUIDADO_PRENATAL = 'cuidado_prenatal',
  SIGNOS_ALARMA = 'signos_alarma',
  LACTANCIA = 'lactancia',
  PARTO = 'parto',
  POSPARTO = 'posparto',
  PLANIFICACION = 'planificacion',
  SALUD_MENTAL = 'salud_mental',
  EJERCICIO = 'ejercicio',
  HIGIENE = 'higiene',
  DERECHOS = 'derechos',
  OTROS = 'otros',
}

export enum NivelDificultad {
  BASICO = 'basico',
  INTERMEDIO = 'intermedio',
  AVANZADO = 'avanzado',
}

/**
 * Schema para crear contenido
 */
export const crearContenidoSchema = z.object({
  titulo: z.string().min(1).max(200),
  descripcion: z.string().min(1),
  tipo: z.enum(['video', 'audio', 'documento', 'imagen', 'articulo', 'infografia']),
  categoria: z.enum(['nutricion', 'cuidado_prenatal', 'signos_alarma', 'lactancia', 'parto', 'posparto', 'planificacion', 'salud_mental', 'ejercicio', 'higiene', 'derechos', 'otros']),
  nivel: z.enum(['basico', 'intermedio', 'avanzado']).default('basico'),
  archivoUrl: z.string().optional(), // Opcional cuando se sube archivo
  archivoNombre: z.string().optional(),
  archivoTipo: z.string().optional(),
  archivoTamano: z.preprocess((val) => {
    // Convertir string a número si es necesario (para FormData)
    if (typeof val === 'string') return parseInt(val, 10);
    return val;
  }, z.number().int().min(0).optional()),
  miniaturaUrl: z.string().url().optional(),
  duracion: z.preprocess((val) => {
    // Convertir string a número si es necesario (para FormData)
    if (typeof val === 'string') return parseInt(val, 10);
    return val;
  }, z.number().int().positive().optional()),
  autor: z.string().optional(),
  etiquetas: z.array(z.string()).optional(),
  orden: z.preprocess((val) => {
    // Convertir string a número si es necesario (para FormData)
    if (typeof val === 'string') return parseInt(val, 10);
    return val;
  }, z.number().int().default(0)),
  destacado: z.preprocess((val) => {
    // Convertir string a booleano si es necesario (para FormData)
    if (typeof val === 'string') return val === 'true';
    return val;
  }, z.boolean().default(false)),
  publico: z.preprocess((val) => {
    // Convertir string a booleano si es necesario (para FormData)
    if (typeof val === 'string') return val === 'true';
    return val;
  }, z.boolean().default(true)),
}).refine((data) => {
  // Al menos debe tener archivoUrl o los campos de archivo deben estar completos
  return data.archivoUrl || (data.archivoNombre && data.archivoTipo && data.archivoTamano !== undefined);
}, {
  message: 'Debe proporcionar archivoUrl o subir un archivo',
});

export type CrearContenidoDTO = z.infer<typeof crearContenidoSchema>;

/**
 * Schema para actualizar contenido
 */
export const actualizarContenidoSchema = z.object({
  titulo: z.string().min(1).max(200).optional(),
  descripcion: z.string().min(1).optional(),
  tipo: z.enum(['video', 'audio', 'documento', 'imagen', 'articulo', 'infografia']).optional(),
  categoria: z.enum(['nutricion', 'cuidado_prenatal', 'signos_alarma', 'lactancia', 'parto', 'posparto', 'planificacion', 'salud_mental', 'ejercicio', 'higiene', 'derechos', 'otros']).optional(),
  nivel: z.enum(['basico', 'intermedio', 'avanzado']).optional(),
  archivoUrl: z.string().url().optional(),
  archivoNombre: z.string().optional(),
  archivoTipo: z.string().optional(),
  archivoTamano: z.number().int().min(0).optional(),
  miniaturaUrl: z.string().url().optional(),
  duracion: z.number().int().positive().optional(),
  autor: z.string().optional(),
  etiquetas: z.array(z.string()).optional(),
  orden: z.number().int().optional(),
  destacado: z.boolean().optional(),
  publico: z.boolean().optional(),
});

export type ActualizarContenidoDTO = z.infer<typeof actualizarContenidoSchema>;

/**
 * Schema para buscar contenido
 */
export const buscarContenidoSchema = z.object({
  query: z.string().optional(),
  tipo: z.enum(['video', 'audio', 'documento', 'imagen', 'articulo', 'infografia']).optional(),
  categoria: z.enum(['nutricion', 'cuidado_prenatal', 'signos_alarma', 'lactancia', 'parto', 'posparto', 'planificacion', 'salud_mental', 'ejercicio', 'higiene', 'derechos', 'otros']).optional(),
  nivel: z.enum(['basico', 'intermedio', 'avanzado']).optional(),
  etiquetas: z.array(z.string()).optional(),
  destacado: z.boolean().optional(),
  publico: z.boolean().optional(),
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().min(0).default(0),
  orderBy: z.enum(['created_at', 'updated_at', 'titulo', 'vistas', 'calificacion', 'orden']).default('created_at'),
  orderDir: z.enum(['asc', 'desc']).default('desc'),
});

export type BuscarContenidoDTO = z.infer<typeof buscarContenidoSchema>;

/**
 * Schema para actualizar progreso
 */
export const actualizarProgresoSchema = z.object({
  contenidoId: z.string().uuid(),
  progreso: z.number().min(0).max(100).optional(),
  completado: z.boolean().optional(),
  tiempoVisto: z.number().int().min(0).optional(),
  ultimaPosicion: z.number().int().min(0).optional(),
  calificacion: z.number().int().min(1).max(5).optional(),
  favorito: z.boolean().optional(),
  notas: z.string().optional(),
});

export type ActualizarProgresoDTO = z.infer<typeof actualizarProgresoSchema>;

/**
 * Schema para registrar vista
 */
export const registrarVistaSchema = z.object({
  contenidoId: z.string().uuid(),
});

export type RegistrarVistaDTO = z.infer<typeof registrarVistaSchema>;

/**
 * Schema para registrar descarga
 */
export const registrarDescargaSchema = z.object({
  contenidoId: z.string().uuid(),
});

export type RegistrarDescargaDTO = z.infer<typeof registrarDescargaSchema>;

/**
 * Schema para calificar contenido
 */
export const calificarContenidoSchema = z.object({
  contenidoId: z.string().uuid(),
  calificacion: z.number().int().min(1).max(5),
});
export type CalificarContenidoDTO = z.infer<typeof calificarContenidoSchema>;

/**
 * Interfaces para respuestas
 */
export interface ContenidoEducativo {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: TipoContenido;
  categoria: CategoriaContenido;
  nivel?: NivelDificultad;
  archivo_url: string;
  miniatura_url?: string;
  duracion?: number;
  autor?: string;
  etiquetas?: string[];
  orden?: number;
  publico: boolean;
  destacado: boolean;
  vistas: number;
  descargas: number;
  calificacion_promedio?: number;
  created_at: Date;
  updated_at: Date;
  // campos adicionales
  tags?: string[];
  activo?: boolean;
  url?: string;
  fechaPublicacion?: Date;
  fechaVencimiento?: Date;
  version?: string;
  fuente?: boolean;
  destacadoEnHome?: boolean;
  destacadoEnBuscador?: boolean;
  destacadoEnCategorias?: boolean;
  destacadoEnNiveles?: boolean;
  destacadoEnSemanaGestacion?: boolean;
}

export interface ProgresoContenido {
  id: string;
  usuario_id: string;
  contenido_id: string;
  completado: boolean;
  progreso_porcentaje: number;
  tiempo_visto?: number;
  ultima_posicion?: number;
  fecha_inicio: Date;
  fecha_completado?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface ContenidoConProgreso extends ContenidoEducativo {
  progreso?: ProgresoContenido;
}

export interface EstadisticasContenido {
  total: number;
  activos: number;
  inactivos: number;
  porTipo: Array<{ tipo: string; cantidad: number }>;
  porCategoria: Array<{ categoria: string; cantidad: number }>;
  porNivel: Array<{ nivel: string; cantidad: number }>;
  porSemanaGestacion: Array<{ semana: number; cantidad: number }>;
  totalArchivos: number;
  tamañoTotalArchivos: number;
  ultimosContenidos: ContenidoEducativo[];
  contenidoMasVisto: ContenidoEducativo[];
  contenidoMejorCalificado: ContenidoEducativo[];
  contenidoMasDescargado: ContenidoEducativo[];
  estadisticasPorMes: Array<{
    mes: string;
    nuevos: number;
    visualizaciones: number;
    descargas: number;
  }>;
}

export interface EstadisticasUsuario {
  totalContenidosVistos: number;
  totalContenidosCompletados: number;
  totalTiempoVisualizacion: number; // en minutos
  progresoGlobal: number; // 0-100
  totalPuntos: number;
  rango: string;
  insignias: string[];
  ultimosContenidosVistos: Array<{
    contenidoId: string;
    titulo: string;
    fecha: Date;
    progreso: number;
    tipo: string;
    categoria: string;
  }>;
  progresoPorCategoria: Array<{
    categoria: string;
    completados: number;
    total: number;
    progreso: number;
    tiempoPromedio: number;
  }>;
  logros: Array<{
    nombre: string;
    descripcion: string;
    fechaObtencion: Date;
    icono: string;
    puntos: number;
    raro: boolean;
  }>;
  actividadReciente: Array<{
    fecha: Date;
    accion: 'visto' | 'completado' | 'descargado' | 'favorito' | 'compartido';
    contenidoId: string;
    titulo: string;
  }>;
  metas: Array<{
    id: string;
    descripcion: string;
    completada: boolean;
    progreso: number;
    fechaLimite: Date | null;
  }>;
}

/**
 * Schema para obtener estadísticas
 */
export const obtenerEstadisticasSchema = z.object({
  fechaInicio: z.string().optional(),
  fechaFin: z.string().optional(),
});

export type ObtenerEstadisticasDTO = z.infer<typeof obtenerEstadisticasSchema>;

/**
 * Schema para obtener recomendaciones
 */
export const obtenerRecomendacionesSchema = z.object({
  limit: z.number().int().positive().max(20).default(10),
  basadoEn: z.enum(['historial', 'categoria', 'popularidad']).default('historial'),
});

export type ObtenerRecomendacionesDTO = z.infer<typeof obtenerRecomendacionesSchema>;

/**
 * Respuesta de búsqueda
 */
export interface BuscarContenidoResponse {
  success: boolean;
  data: ContenidoConProgreso[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

/**
 * Respuesta de contenido individual
 */
export interface ObtenerContenidoResponse {
  success: boolean;
  data: ContenidoConProgreso;
}

/**
 * Respuesta de estadísticas
 */
export interface ObtenerEstadisticasResponse {
  success: boolean;
  data: EstadisticasContenido;
}

/**
 * Respuesta de estadísticas de usuario
 */
export interface ObtenerEstadisticasUsuarioResponse {
  success: boolean;
  data: EstadisticasUsuario;
}

