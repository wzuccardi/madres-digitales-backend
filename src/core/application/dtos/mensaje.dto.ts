import { z } from 'zod';

/**
 * Enums para mensajería
 */
export enum MensajeTipo {
  TEXTO = 'texto',
  IMAGEN = 'imagen',
  ARCHIVO = 'archivo',
  UBICACION = 'ubicacion',
  ALERTA = 'alerta',
}

export enum MensajeEstado {
  ENVIADO = 'enviado',
  ENTREGADO = 'entregado',
  LEIDO = 'leido',
}

export enum ConversacionTipo {
  INDIVIDUAL = 'individual',
  GRUPO = 'grupo',
  SOPORTE = 'soporte',
}

/**
 * Schema para crear conversación
 */
export const crearConversacionSchema = z.object({
  titulo: z.string().optional(),
  tipo: z.nativeEnum(ConversacionTipo),
  participantes: z.array(z.string().uuid()).min(2, 'Debe haber al menos 2 participantes'),
  gestanteId: z.string().uuid().optional(),
});

export type CrearConversacionDTO = z.infer<typeof crearConversacionSchema>;

/**
 * Schema para enviar mensaje
 */
export const enviarMensajeSchema = z.object({
  conversacionId: z.string().uuid(),
  tipo: z.nativeEnum(MensajeTipo).default(MensajeTipo.TEXTO),
  contenido: z.string().min(1, 'El contenido no puede estar vacío'),
  archivoUrl: z.string().url().optional(),
  archivoNombre: z.string().optional(),
  archivoTipo: z.string().optional(),
  archivoTamano: z.number().int().positive().optional(),
  ubicacion: z.object({
    type: z.literal('Point'),
    coordinates: z.tuple([z.number(), z.number()]),
  }).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  respondiendoA: z.string().uuid().optional(),
});

export type EnviarMensajeDTO = z.infer<typeof enviarMensajeSchema>;

/**
 * Schema para marcar mensaje como leído
 */
export const marcarLeidoSchema = z.object({
  mensajeId: z.string().uuid(),
});

export type MarcarLeidoDTO = z.infer<typeof marcarLeidoSchema>;

/**
 * Schema para obtener mensajes
 */
export const obtenerMensajesSchema = z.object({
  conversacionId: z.string().uuid(),
  limit: z.number().int().positive().max(100).default(50),
  offset: z.number().int().min(0).default(0),
  antes: z.string().optional(), // Timestamp ISO
});

export type ObtenerMensajesDTO = z.infer<typeof obtenerMensajesSchema>;

/**
 * Schema para buscar conversaciones
 */
export const buscarConversacionesSchema = z.object({
  query: z.string().optional(),
  tipo: z.nativeEnum(ConversacionTipo).optional(),
  gestanteId: z.string().uuid().optional(),
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

export type BuscarConversacionesDTO = z.infer<typeof buscarConversacionesSchema>;

/**
 * Schema para agregar participante
 */
export const agregarParticipanteSchema = z.object({
  conversacionId: z.string().uuid(),
  usuarioId: z.string().uuid(),
});

export type AgregarParticipanteDTO = z.infer<typeof agregarParticipanteSchema>;

/**
 * Schema para eliminar participante
 */
export const eliminarParticipanteSchema = z.object({
  conversacionId: z.string().uuid(),
  usuarioId: z.string().uuid(),
});

export type EliminarParticipanteDTO = z.infer<typeof eliminarParticipanteSchema>;

/**
 * Interfaces para respuestas
 */
export interface Conversacion {
  id: string;
  titulo?: string;
  tipo: ConversacionTipo;
  participantes: string[];
  gestanteId?: string;
  ultimoMensaje?: string;
  ultimoMensajeFecha?: Date;
  mensajesNoLeidos?: Record<string, number>;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Mensaje {
  id: string;
  conversacionId: string;
  remitenteId: string;
  remitenteNombre: string;
  tipo: MensajeTipo;
  contenido: string;
  archivoUrl?: string;
  archivoNombre?: string;
  archivoTipo?: string;
  archivoTamano?: number;
  ubicacion?: {
    type: 'Point';
    coordinates: [number, number];
  };
  metadata?: any;
  estado: MensajeEstado;
  leidoPor?: string[];
  fechaLeido?: Date;
  respondiendoA?: string;
  editado: boolean;
  eliminado: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversacionConMensajes extends Conversacion {
  mensajes: Mensaje[];
  participantesInfo: Array<{
    id: string;
    nombre: string;
    rol: string;
  }>;
}

export interface EstadisticasConversacion {
  totalConversaciones: number;
  conversacionesActivas: number;
  totalMensajes: number;
  mensajesNoLeidos: number;
  ultimaActividad?: Date;
}

/**
 * Schema para actualizar conversación
 */
export const actualizarConversacionSchema = z.object({
  titulo: z.string().optional(),
  activo: z.boolean().optional(),
});

export type ActualizarConversacionDTO = z.infer<typeof actualizarConversacionSchema>;

/**
 * Schema para editar mensaje
 */
export const editarMensajeSchema = z.object({
  mensajeId: z.string().uuid(),
  contenido: z.string().min(1, 'El contenido no puede estar vacío'),
});

export type EditarMensajeDTO = z.infer<typeof editarMensajeSchema>;

/**
 * Schema para eliminar mensaje
 */
export const eliminarMensajeSchema = z.object({
  mensajeId: z.string().uuid(),
});

export type EliminarMensajeDTO = z.infer<typeof eliminarMensajeSchema>;

/**
 * Schema para notificación de mensaje nuevo
 */
export interface NotificacionMensaje {
  conversacionId: string;
  mensajeId: string;
  remitenteId: string;
  remitenteNombre: string;
  contenido: string;
  tipo: MensajeTipo;
  timestamp: Date;
}

/**
 * Schema para respuesta de envío de mensaje
 */
export interface EnviarMensajeResponse {
  success: boolean;
  mensaje: Mensaje;
  conversacion: Conversacion;
}

/**
 * Schema para respuesta de conversaciones
 */
export interface ObtenerConversacionesResponse {
  success: boolean;
  conversaciones: ConversacionConMensajes[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Schema para respuesta de mensajes
 */
export interface ObtenerMensajesResponse {
  success: boolean;
  mensajes: Mensaje[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

