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
exports.obtenerFavoritos = exports.obtenerDestacado = exports.obtenerEstadisticas = exports.calificarContenido = exports.registrarDescarga = exports.registrarVista = exports.actualizarProgreso = exports.eliminarContenido = exports.actualizarContenido = exports.buscarContenido = exports.obtenerContenido = exports.crearContenido = void 0;
const contenido_service_1 = require("../services/contenido.service");
const contenido_dto_1 = require("../core/application/dtos/contenido.dto");
const logger_1 = require("../config/logger");
const contenidoService = new contenido_service_1.ContenidoService();
/**
 * Crear contenido educativo
 * POST /api/contenido
 */
const crearContenido = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const userRole = req.user?.rol;
        if (!userId) {
            return res.status(401).json({ error: 'Usuario no autenticado' });
        }
        // Verificar permisos: solo super admin y admin pueden crear contenidos
        if (userRole !== 'super_admin' && userRole !== 'admin') {
            return res.status(403).json({
                error: 'Solo el super administrador o administrador pueden crear contenidos educativos'
            });
        }
        // Si hay archivo subido, usar su información
        const file = req.file;
        let dto = { ...req.body };
        if (file) {
            // Archivo subido localmente
            dto.archivoUrl = `/uploads/${file.filename}`;
            dto.archivoNombre = file.originalname;
            dto.archivoTipo = file.mimetype;
            dto.archivoTamano = file.size;
            logger_1.logger.info('Archivo subido', {
                filename: file.filename,
                originalname: file.originalname,
                size: file.size,
                mimetype: file.mimetype,
            });
        }
        const validatedDto = contenido_dto_1.crearContenidoSchema.parse(dto);
        const contenido = await contenidoService.crearContenido(validatedDto, userId);
        logger_1.logger.info('Contenido creado', { userId, contenidoId: contenido.id });
        res.status(201).json({
            success: true,
            message: 'Contenido creado exitosamente',
            data: contenido,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.crearContenido = crearContenido;
/**
 * Obtener contenido por ID
 * GET /api/contenido/:id
 */
const obtenerContenido = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const contenidoId = req.params.id;
        const contenido = await contenidoService.obtenerContenido(contenidoId, userId);
        res.status(200).json({
            success: true,
            data: contenido,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.obtenerContenido = obtenerContenido;
/**
 * Buscar contenido
 * GET /api/contenido
 */
const buscarContenido = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const dto = contenido_dto_1.buscarContenidoSchema.parse({
            query: req.query.query,
            tipo: req.query.tipo,
            categoria: req.query.categoria,
            nivel: req.query.nivel,
            etiquetas: req.query.etiquetas ? req.query.etiquetas.split(',') : undefined,
            destacado: req.query.destacado === 'true' ? true : undefined,
            publico: req.query.publico !== undefined ? req.query.publico === 'true' : undefined,
            limit: req.query.limit ? parseInt(req.query.limit) : undefined,
            offset: req.query.offset ? parseInt(req.query.offset) : undefined,
            orderBy: req.query.orderBy,
            orderDir: req.query.orderDir,
        });
        console.log('🔍 Buscar contenido DTO:', JSON.stringify(dto, null, 2));
        const result = await contenidoService.buscarContenido(dto, userId);
        console.log('✅ Resultado:', result.total, 'contenidos encontrados');
        const limit = dto.limit || 20;
        const offset = dto.offset || 0;
        res.status(200).json({
            contenidos: result.contenidos,
            total: result.total,
            page: Math.floor(offset / limit) + 1,
            limit: limit,
            totalPages: Math.ceil(result.total / limit),
        });
    }
    catch (error) {
        next(error);
    }
};
exports.buscarContenido = buscarContenido;
/**
 * Actualizar contenido
 * PUT /api/contenido/:id
 */
const actualizarContenido = async (req, res, next) => {
    try {
        const contenidoId = req.params.id;
        // Si hay archivo subido, usar su información
        const file = req.file;
        let dto = { ...req.body };
        if (file) {
            // Archivo subido localmente - eliminar el anterior
            const contenidoActual = await contenidoService.obtenerContenido(contenidoId);
            if (contenidoActual && contenidoActual.archivo_url?.startsWith('/uploads/')) {
                const { eliminarArchivo } = await Promise.resolve().then(() => __importStar(require('../utils/file.utils')));
                await eliminarArchivo(contenidoActual.archivo_url).catch((err) => {
                    logger_1.logger.warn('Error eliminando archivo anterior', { error: err });
                });
            }
            dto.archivoUrl = `/uploads/${file.filename}`;
            dto.archivoNombre = file.originalname;
            dto.archivoTipo = file.mimetype;
            dto.archivoTamano = file.size;
            logger_1.logger.info('Archivo actualizado', {
                filename: file.filename,
                originalname: file.originalname,
                size: file.size,
            });
        }
        const validatedDto = contenido_dto_1.actualizarContenidoSchema.parse(dto);
        const contenido = await contenidoService.actualizarContenido(contenidoId, validatedDto);
        logger_1.logger.info('Contenido actualizado', { contenidoId });
        res.status(200).json({
            success: true,
            message: 'Contenido actualizado exitosamente',
            data: contenido,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.actualizarContenido = actualizarContenido;
/**
 * Eliminar contenido
 * DELETE /api/contenido/:id
 */
const eliminarContenido = async (req, res, next) => {
    try {
        const contenidoId = req.params.id;
        // Obtener contenido para eliminar archivo físico si existe
        const contenido = await contenidoService.obtenerContenido(contenidoId);
        // Eliminar del base de datos
        await contenidoService.eliminarContenido(contenidoId);
        // Eliminar archivo físico si es local
        if (contenido && contenido.archivo_url?.startsWith('/uploads/')) {
            const { eliminarArchivo } = await Promise.resolve().then(() => __importStar(require('../utils/file.utils')));
            await eliminarArchivo(contenido.archivo_url).catch((err) => {
                logger_1.logger.warn('Error eliminando archivo físico', { error: err });
            });
        }
        logger_1.logger.info('Contenido eliminado', { contenidoId });
        res.status(200).json({
            success: true,
            message: 'Contenido eliminado exitosamente',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.eliminarContenido = eliminarContenido;
/**
 * Actualizar progreso
 * POST /api/contenido/:id/progreso
 */
const actualizarProgreso = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Usuario no autenticado' });
        }
        const dto = contenido_dto_1.actualizarProgresoSchema.parse({
            ...req.body,
            contenidoId: req.params.id,
        });
        const progreso = await contenidoService.actualizarProgreso(dto, userId);
        res.status(200).json({
            success: true,
            message: 'Progreso actualizado exitosamente',
            data: progreso,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.actualizarProgreso = actualizarProgreso;
/**
 * Registrar vista
 * POST /api/contenido/:id/vista
 */
const registrarVista = async (req, res, next) => {
    try {
        const contenidoId = req.params.id;
        await contenidoService.registrarVista(contenidoId);
        res.status(200).json({
            success: true,
            message: 'Vista registrada',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.registrarVista = registrarVista;
/**
 * Registrar descarga
 * POST /api/contenido/:id/descarga
 */
const registrarDescarga = async (req, res, next) => {
    try {
        const contenidoId = req.params.id;
        await contenidoService.registrarDescarga(contenidoId);
        res.status(200).json({
            success: true,
            message: 'Descarga registrada',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.registrarDescarga = registrarDescarga;
/**
 * Calificar contenido
 * POST /api/contenido/:id/calificar
 */
const calificarContenido = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Usuario no autenticado' });
        }
        const dto = contenido_dto_1.calificarContenidoSchema.parse({
            contenidoId: req.params.id,
            calificacion: req.body.calificacion,
        });
        await contenidoService.calificarContenido(dto.contenidoId, dto.calificacion, userId);
        res.status(200).json({
            success: true,
            message: 'Contenido calificado exitosamente',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.calificarContenido = calificarContenido;
/**
 * Obtener estadísticas
 * GET /api/contenido/estadisticas
 */
const obtenerEstadisticas = async (req, res, next) => {
    try {
        const estadisticas = await contenidoService.obtenerEstadisticas();
        res.status(200).json({
            success: true,
            data: estadisticas,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.obtenerEstadisticas = obtenerEstadisticas;
/**
 * Obtener contenido destacado
 * GET /api/contenido/destacado
 */
const obtenerDestacado = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const result = await contenidoService.buscarContenido({
            destacado: true,
            publico: true,
            limit: 10,
            offset: 0,
            orderBy: 'orden',
            orderDir: 'asc',
        }, userId);
        res.status(200).json({
            success: true,
            data: result.contenidos,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.obtenerDestacado = obtenerDestacado;
/**
 * Obtener favoritos del usuario
 * GET /api/contenido/favoritos
 */
const obtenerFavoritos = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Usuario no autenticado' });
        }
        // TODO: Implementar búsqueda de favoritos
        res.status(200).json({
            success: true,
            data: [],
        });
    }
    catch (error) {
        next(error);
    }
};
exports.obtenerFavoritos = obtenerFavoritos;
