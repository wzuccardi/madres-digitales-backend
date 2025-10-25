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
const role_middleware_1 = require("../middlewares/role.middleware");
const contenidoController = __importStar(require("../controllers/contenido.controller"));
const file_utils_1 = require("../utils/file.utils");
const router = (0, express_1.Router)();
/**
 * GET /api/contenido
 * Buscar contenido educativo (PÚBLICO)
 */
router.get('/', contenidoController.buscarContenido);
/**
 * GET /api/contenido/estadisticas
 * Obtener estadísticas generales de contenido (PÚBLICO)
 */
router.get('/estadisticas', contenidoController.obtenerEstadisticas);
/**
 * GET /api/contenido/destacado
 * Obtener contenido destacado (PÚBLICO)
 */
router.get('/destacado', contenidoController.obtenerDestacado);
/**
 * POST /api/contenido
 * Crear contenido educativo
 * Requiere rol: Coordinador o superior
 * Soporta subida de archivo con campo 'archivo'
 */
router.post('/', auth_middleware_1.authenticateToken, (0, role_middleware_1.requireMinRole)(role_middleware_1.UsuarioRol.COORDINADOR), file_utils_1.upload.single('archivo'), contenidoController.crearContenido);
/**
 * GET /api/contenido/favoritos
 * Obtener favoritos del usuario (requiere autenticación)
 */
router.get('/favoritos', auth_middleware_1.authenticateToken, contenidoController.obtenerFavoritos);
/**
 * GET /api/contenido/:id
 * Obtener contenido por ID (PÚBLICO)
 */
router.get('/:id', contenidoController.obtenerContenido);
/**
 * PUT /api/contenido/:id
 * Actualizar contenido
 * Requiere rol: Coordinador o superior
 * Soporta subida de archivo con campo 'archivo'
 */
router.put('/:id', auth_middleware_1.authenticateToken, (0, role_middleware_1.requireMinRole)(role_middleware_1.UsuarioRol.COORDINADOR), file_utils_1.upload.single('archivo'), contenidoController.actualizarContenido);
/**
 * DELETE /api/contenido/:id
 * Eliminar contenido
 * Requiere rol: Admin o superior
 */
router.delete('/:id', auth_middleware_1.authenticateToken, (0, role_middleware_1.requireMinRole)(role_middleware_1.UsuarioRol.ADMIN), contenidoController.eliminarContenido);
/**
 * POST /api/contenido/:id/progreso
 * Actualizar progreso del usuario en el contenido (requiere autenticación)
 */
router.post('/:id/progreso', auth_middleware_1.authenticateToken, contenidoController.actualizarProgreso);
/**
 * POST /api/contenido/:id/vista
 * Registrar vista del contenido (PÚBLICO)
 */
router.post('/:id/vista', contenidoController.registrarVista);
/**
 * POST /api/contenido/:id/descarga
 * Registrar descarga del contenido (PÚBLICO)
 */
router.post('/:id/descarga', contenidoController.registrarDescarga);
/**
 * POST /api/contenido/:id/calificar
 * Calificar contenido (requiere autenticación)
 */
router.post('/:id/calificar', auth_middleware_1.authenticateToken, contenidoController.calificarContenido);
exports.default = router;
