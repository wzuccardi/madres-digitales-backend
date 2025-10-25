"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const mensajeController = __importStar(require("../controllers/mensaje.controller"));
const router = (0, express_1.Router)();
/**
 * Todas las rutas de mensajería requieren autenticación
 */
router.use(auth_middleware_1.authMiddleware);
/**
 * POST /api/mensajes/conversaciones
 * Crear nueva conversación
 *
 * Body:
 * {
 *   "titulo": "Conversación con María",
 *   "tipo": "individual",
 *   "participantes": ["uuid1", "uuid2"],
 *   "gestanteId": "uuid-opcional"
 * }
 */
router.post('/conversaciones', mensajeController.crearConversacion);
/**
 * GET /api/mensajes/conversaciones
 * Obtener conversaciones del usuario
 *
 * Query params:
 * - query: string (búsqueda)
 * - tipo: individual|grupo|soporte
 * - gestanteId: uuid
 * - limit: number (default: 20)
 * - offset: number (default: 0)
 */
router.get('/conversaciones', mensajeController.obtenerConversaciones);
/**
 * GET /api/mensajes/conversaciones/:id
 * Obtener conversación por ID
 */
router.get('/conversaciones/:id', mensajeController.obtenerConversacion);
/**
 * POST /api/mensajes/conversaciones/:id/mensajes
 * Enviar mensaje a una conversación
 *
 * Body:
 * {
 *   "tipo": "texto",
 *   "contenido": "Hola, ¿cómo estás?",
 *   "archivoUrl": "url-opcional",
 *   "archivoNombre": "nombre-opcional",
 *   "archivoTipo": "tipo-opcional",
 *   "archivoTamano": 1024,
 *   "ubicacion": { "type": "Point", "coordinates": [lon, lat] },
 *   "respondiendoA": "uuid-mensaje-opcional"
 * }
 */
router.post('/conversaciones/:id/mensajes', mensajeController.enviarMensaje);
/**
 * GET /api/mensajes/conversaciones/:id/mensajes
 * Obtener mensajes de una conversación
 *
 * Query params:
 * - limit: number (default: 50, max: 100)
 * - offset: number (default: 0)
 * - antes: timestamp ISO (para paginación)
 */
router.get('/conversaciones/:id/mensajes', mensajeController.obtenerMensajes);
/**
 * POST /api/mensajes/:id/leer
 * Marcar mensaje como leído
 */
router.post('/:id/leer', mensajeController.marcarComoLeido);
/**
 * POST /api/mensajes/conversaciones/:id/participantes
 * Agregar participante a conversación
 *
 * Body:
 * {
 *   "usuarioId": "uuid"
 * }
 */
// router.post('/conversaciones/:id/participantes', mensajeController.agregarParticipante); // Method not implemented
/**
 * DELETE /api/mensajes/conversaciones/:id/participantes/:usuarioId
 * Eliminar participante de conversación
 */
// router.delete('/conversaciones/:id/participantes/:usuarioId', mensajeController.eliminarParticipante); // Method not implemented
/**
 * GET /api/mensajes/estadisticas
 * Obtener estadísticas de mensajería del usuario
 */
router.get('/estadisticas', mensajeController.obtenerEstadisticas);
/**
 * GET /api/mensajes/buscar
 * Buscar mensajes
 *
 * Query params:
 * - q: string (término de búsqueda)
 */
router.get('/buscar', mensajeController.buscarConversaciones);
exports.default = router;
