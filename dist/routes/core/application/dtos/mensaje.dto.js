"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eliminarMensajeSchema = exports.editarMensajeSchema = exports.actualizarConversacionSchema = exports.eliminarParticipanteSchema = exports.agregarParticipanteSchema = exports.buscarConversacionesSchema = exports.obtenerMensajesSchema = exports.marcarLeidoSchema = exports.enviarMensajeSchema = exports.crearConversacionSchema = exports.ConversacionTipo = exports.MensajeEstado = exports.MensajeTipo = void 0;
const zod_1 = require("zod");
/**
 * Enums para mensajería
 */
var MensajeTipo;
(function (MensajeTipo) {
    MensajeTipo["TEXTO"] = "texto";
    MensajeTipo["IMAGEN"] = "imagen";
    MensajeTipo["ARCHIVO"] = "archivo";
    MensajeTipo["UBICACION"] = "ubicacion";
    MensajeTipo["ALERTA"] = "alerta";
})(MensajeTipo || (exports.MensajeTipo = MensajeTipo = {}));
var MensajeEstado;
(function (MensajeEstado) {
    MensajeEstado["ENVIADO"] = "enviado";
    MensajeEstado["ENTREGADO"] = "entregado";
    MensajeEstado["LEIDO"] = "leido";
})(MensajeEstado || (exports.MensajeEstado = MensajeEstado = {}));
var ConversacionTipo;
(function (ConversacionTipo) {
    ConversacionTipo["INDIVIDUAL"] = "individual";
    ConversacionTipo["GRUPO"] = "grupo";
    ConversacionTipo["SOPORTE"] = "soporte";
})(ConversacionTipo || (exports.ConversacionTipo = ConversacionTipo = {}));
/**
 * Schema para crear conversación
 */
exports.crearConversacionSchema = zod_1.z.object({
    titulo: zod_1.z.string().optional(),
    tipo: zod_1.z.nativeEnum(ConversacionTipo),
    participantes: zod_1.z.array(zod_1.z.string().uuid()).min(2, 'Debe haber al menos 2 participantes'),
    gestanteId: zod_1.z.string().uuid().optional(),
});
/**
 * Schema para enviar mensaje
 */
exports.enviarMensajeSchema = zod_1.z.object({
    conversacionId: zod_1.z.string().uuid(),
    tipo: zod_1.z.nativeEnum(MensajeTipo).default(MensajeTipo.TEXTO),
    contenido: zod_1.z.string().min(1, 'El contenido no puede estar vacío'),
    archivoUrl: zod_1.z.string().url().optional(),
    archivoNombre: zod_1.z.string().optional(),
    archivoTipo: zod_1.z.string().optional(),
    archivoTamano: zod_1.z.number().int().positive().optional(),
    ubicacion: zod_1.z.object({
        type: zod_1.z.literal('Point'),
        coordinates: zod_1.z.tuple([zod_1.z.number(), zod_1.z.number()]),
    }).optional(),
    metadata: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
    respondiendoA: zod_1.z.string().uuid().optional(),
});
/**
 * Schema para marcar mensaje como leído
 */
exports.marcarLeidoSchema = zod_1.z.object({
    mensajeId: zod_1.z.string().uuid(),
});
/**
 * Schema para obtener mensajes
 */
exports.obtenerMensajesSchema = zod_1.z.object({
    conversacionId: zod_1.z.string().uuid(),
    limit: zod_1.z.number().int().positive().max(100).default(50),
    offset: zod_1.z.number().int().min(0).default(0),
    antes: zod_1.z.string().optional(), // Timestamp ISO
});
/**
 * Schema para buscar conversaciones
 */
exports.buscarConversacionesSchema = zod_1.z.object({
    query: zod_1.z.string().optional(),
    tipo: zod_1.z.nativeEnum(ConversacionTipo).optional(),
    gestanteId: zod_1.z.string().uuid().optional(),
    limit: zod_1.z.number().int().positive().max(100).default(20),
    offset: zod_1.z.number().int().min(0).default(0),
});
/**
 * Schema para agregar participante
 */
exports.agregarParticipanteSchema = zod_1.z.object({
    conversacionId: zod_1.z.string().uuid(),
    usuarioId: zod_1.z.string().uuid(),
});
/**
 * Schema para eliminar participante
 */
exports.eliminarParticipanteSchema = zod_1.z.object({
    conversacionId: zod_1.z.string().uuid(),
    usuarioId: zod_1.z.string().uuid(),
});
/**
 * Schema para actualizar conversación
 */
exports.actualizarConversacionSchema = zod_1.z.object({
    titulo: zod_1.z.string().optional(),
    activo: zod_1.z.boolean().optional(),
});
/**
 * Schema para editar mensaje
 */
exports.editarMensajeSchema = zod_1.z.object({
    mensajeId: zod_1.z.string().uuid(),
    contenido: zod_1.z.string().min(1, 'El contenido no puede estar vacío'),
});
/**
 * Schema para eliminar mensaje
 */
exports.eliminarMensajeSchema = zod_1.z.object({
    mensajeId: zod_1.z.string().uuid(),
});
