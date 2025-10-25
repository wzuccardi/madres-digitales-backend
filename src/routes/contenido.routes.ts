import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireMinRole, UsuarioRol } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validation.middleware';
import { buscarContenidoSchema } from '../core/application/dtos/contenido.dto';
import * as contenidoController from '../controllers/contenido.controller';
import { upload } from '../utils/file.utils';

const router = Router();

/**
 * GET /api/contenido
 * Buscar contenido educativo (PÚBLICO)
 */
router.get('/', validate(buscarContenidoSchema, 'query'), contenidoController.buscarContenido);

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
 * Requiere rol: Admin o superior
 * Soporta subida de archivo con campo 'archivo'
 */
router.post('/', authMiddleware, requireMinRole(UsuarioRol.ADMIN), upload.single('archivo'), contenidoController.crearContenido);

/**
 * GET /api/contenido/favoritos
 * Obtener favoritos del usuario (requiere autenticación)
 */
router.get('/favoritos', authMiddleware, contenidoController.obtenerFavoritos);

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
router.put('/:id', authMiddleware, requireMinRole(UsuarioRol.COORDINADOR), upload.single('archivo'), contenidoController.actualizarContenido);

/**
 * DELETE /api/contenido/:id
 * Eliminar contenido
 * Requiere rol: Admin o superior
 */
router.delete('/:id', authMiddleware, requireMinRole(UsuarioRol.ADMIN), contenidoController.eliminarContenido);

/**
 * POST /api/contenido/:id/progreso
 * Actualizar progreso del usuario en el contenido (requiere autenticación)
 */
router.post('/:id/progreso', authMiddleware, contenidoController.actualizarProgreso);

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
router.post('/:id/calificar', authMiddleware, contenidoController.calificarContenido);

export default router;
