// Controlador para alertas con control de permisos
// Todos los datos provienen de la base de datos real, no se usan mocks
import { Request, Response } from 'express';
import { AlertaService } from '../services/alerta.service';
import { log } from '../config/logger';

const alertaService = new AlertaService();

interface AuthenticatedRequest extends Request {
	user?: {
		id: string;
		email: string;
		rol: string;
		municipio_id?: string;
	};
}

/**
 * Obtener alertas filtradas por permisos del usuario
 */
export const getAlertasByUser = async (req: AuthenticatedRequest, res: Response) => {
	try {
		const userId = req.user?.id;

		if (!userId) {
			return res.status(401).json({
				success: false,
				error: 'Usuario no autenticado'
			});
		}

		console.log(`🔐 Controller: Obteniendo alertas para usuario ${userId}`);

		const alertas = await alertaService.getAlertasByUser(userId);

		console.log(`✅ Controller: ${alertas.length} alertas obtenidas con permisos`);
		res.json({
			success: true,
			data: alertas
		});
	} catch (error) {
		console.error('❌ Controller: Error obteniendo alertas por usuario:', error);
		log.error('Error obteniendo alertas por usuario', { error: error.message });
		res.status(500).json({
			success: false,
			error: 'Error al obtener alertas'
		});
	}
};

/**
 * Obtener todas las alertas (solo para administradores)
 */
export const getAllAlertas = async (req: AuthenticatedRequest, res: Response) => {
	try {
		const userId = req.user?.id;
		const userRole = req.user?.rol;

		if (!userId) {
			return res.status(401).json({
				success: false,
				error: 'Usuario no autenticado'
			});
		}

		if (userRole !== 'admin') {
			return res.status(403).json({
				success: false,
				error: 'Solo los administradores pueden ver todas las alertas'
			});
		}

		console.log(`🔍 Controller: Obteniendo todas las alertas (admin)`);

		const alertas = await alertaService.getAllAlertas();

		console.log(`✅ Controller: ${alertas.length} alertas obtenidas`);
		res.json({
			success: true,
			data: alertas
		});
	} catch (error) {
		console.error('❌ Controller: Error obteniendo todas las alertas:', error);
		log.error('Error obteniendo todas las alertas', { error: error.message });
		res.status(500).json({
			success: false,
			error: 'Error al obtener alertas'
		});
	}
};

/**
 * Obtener alerta por ID
 */
export const getAlertaById = async (req: AuthenticatedRequest, res: Response) => {
	try {
		const { id } = req.params;
		const userId = req.user?.id;

		if (!userId) {
			return res.status(401).json({
				success: false,
				error: 'Usuario no autenticado'
			});
		}

		console.log(`🔍 Controller: Obteniendo alerta ${id}`);

		const alerta = await alertaService.getAlertaById(id, userId);

		if (!alerta) {
			return res.status(404).json({
				success: false,
				error: 'Alerta no encontrada'
			});
		}

		console.log(`✅ Controller: Alerta ${id} obtenida`);
		res.json({
			success: true,
			data: alerta
		});
	} catch (error) {
		console.error(`❌ Controller: Error obteniendo alerta ${req.params.id}:`, error);
		log.error('Error obteniendo alerta por ID', { error: error.message });

		if (error.message.includes('No tiene permisos')) {
			res.status(403).json({
				success: false,
				error: error.message
			});
		} else {
			res.status(500).json({
				success: false,
				error: 'Error interno del servidor'
			});
		}
	}
};

/**
 * Crear nueva alerta manual
 */
export const createAlerta = async (req: AuthenticatedRequest, res: Response) => {
	try {
		const userId = req.user?.id;

		if (!userId) {
			return res.status(401).json({
				success: false,
				error: 'Usuario no autenticado'
			});
		}

		const { gestante_id, tipo_alerta, nivel_prioridad, mensaje } = req.body;

		// Validaciones básicas
		if (!gestante_id || !tipo_alerta || !nivel_prioridad || !mensaje) {
			return res.status(400).json({
				success: false,
				error: 'Los campos gestante_id, tipo_alerta, nivel_prioridad y mensaje son requeridos'
			});
		}

		// Validar nivel de prioridad
		const nivelesValidos = ['baja', 'media', 'alta', 'critica'];
		if (!nivelesValidos.includes(nivel_prioridad)) {
			return res.status(400).json({
				success: false,
				error: 'El nivel de prioridad debe ser: baja, media, alta o critica'
			});
		}

		console.log(`🚨 Controller: Creando alerta para gestante ${gestante_id}`);

		const alertaData = {
			gestante_id,
			tipo_alerta,
			nivel_prioridad,
			mensaje,
			sintomas: req.body.sintomas || [],
			coordenadas_alerta: req.body.coordenadas_alerta,
			es_automatica: false, // Las alertas manuales siempre son false
			score_riesgo: 0 // Las alertas manuales inician con score 0
		};

		const nuevaAlerta = await alertaService.createAlerta(alertaData, userId);

		console.log(`✅ Controller: Alerta creada con ID ${nuevaAlerta.id}`);
		res.status(201).json({
			success: true,
			data: nuevaAlerta
		});
	} catch (error) {
		console.error('❌ Controller: Error creando alerta:', error);
		log.error('Error creando alerta', { error: error.message });

		if (error.message.includes('No tiene permisos')) {
			res.status(403).json({
				success: false,
				error: error.message
			});
		} else if (error.message.includes('no encontrada')) {
			res.status(404).json({
				success: false,
				error: error.message
			});
		} else {
			res.status(400).json({
				success: false,
				error: error.message
			});
		}
	}
};

/**
 * Actualizar alerta existente
 */
export const updateAlerta = async (req: AuthenticatedRequest, res: Response) => {
	try {
		const { id } = req.params;
		const userId = req.user?.id;

		if (!userId) {
			return res.status(401).json({
				success: false,
				error: 'Usuario no autenticado'
			});
		}

		console.log(`🚨 Controller: Actualizando alerta ${id}`);

		// Validar que el ID sea válido
		if (!id) {
			return res.status(400).json({
				success: false,
				error: 'ID de alerta requerido'
			});
		}

		// Validar nivel de prioridad si se proporciona
		const nivelesValidos = ['baja', 'media', 'alta', 'critica'];
		if (req.body.nivel_prioridad && !nivelesValidos.includes(req.body.nivel_prioridad)) {
			return res.status(400).json({
				success: false,
				error: 'El nivel de prioridad debe ser: baja, media, alta o critica'
			});
		}

		const alertaActualizada = await alertaService.updateAlertaCompleta(id, req.body);

		console.log(`✅ Controller: Alerta ${id} actualizada exitosamente`);
		res.json({
			success: true,
			data: alertaActualizada
		});
	} catch (error) {
		console.error(`❌ Controller: Error actualizando alerta ${req.params.id}:`, error);
		log.error('Error actualizando alerta', { error: error.message });

		if (error.message.includes('No tiene permisos')) {
			res.status(403).json({
				success: false,
				error: error.message
			});
		} else if (error.message.includes('no encontrada')) {
			res.status(404).json({
				success: false,
				error: error.message
			});
		} else {
			res.status(400).json({
				success: false,
				error: error.message
			});
		}
	}
};

/**
 * Eliminar alerta
 */
export const deleteAlerta = async (req: AuthenticatedRequest, res: Response) => {
	try {
		const { id } = req.params;
		const userId = req.user?.id;

		if (!userId) {
			return res.status(401).json({
				success: false,
				error: 'Usuario no autenticado'
			});
		}

		console.log(`🗑️ Controller: Eliminando alerta ${id}`);

		await alertaService.deleteAlerta(id);

		console.log(`✅ Controller: Alerta ${id} eliminada exitosamente`);
		res.json({
			success: true,
			message: 'Alerta eliminada exitosamente'
		});
	} catch (error) {
		console.error(`❌ Controller: Error eliminando alerta ${req.params.id}:`, error);
		log.error('Error eliminando alerta', { error: error.message });

		if (error.message.includes('No tiene permisos')) {
			res.status(403).json({
				success: false,
				error: error.message
			});
		} else if (error.message.includes('no encontrada')) {
			res.status(404).json({
				success: false,
				error: error.message
			});
		} else {
			res.status(500).json({
				success: false,
				error: 'Error interno del servidor'
			});
		}
	}
};

/**
 * Resolver alerta (marcar como resuelta)
 */
export const resolverAlerta = async (req: AuthenticatedRequest, res: Response) => {
	try {
		const { id } = req.params;
		const userId = req.user?.id;

		if (!userId) {
			return res.status(401).json({
				success: false,
				error: 'Usuario no autenticado'
			});
		}

		console.log(`✅ Controller: Resolviendo alerta ${id}`);

		const alertaResuelta = await alertaService.resolverAlerta(id, userId);

		console.log(`✅ Controller: Alerta ${id} resuelta exitosamente`);
		res.json({
			success: true,
			data: alertaResuelta
		});
	} catch (error) {
		console.error(`❌ Controller: Error resolviendo alerta ${req.params.id}:`, error);
		log.error('Error resolviendo alerta', { error: error.message });

		if (error.message.includes('No tiene permisos')) {
			res.status(403).json({
				success: false,
				error: error.message
			});
		} else if (error.message.includes('no encontrada')) {
			res.status(404).json({
				success: false,
				error: error.message
			});
		} else {
			res.status(400).json({
				success: false,
				error: error.message
			});
		}
	}
};

/**
 * Obtener alertas por gestante
 */
export const getAlertasByGestante = async (req: AuthenticatedRequest, res: Response) => {
	try {
		const { gestanteId } = req.params;
		const userId = req.user?.id;

		if (!userId) {
			return res.status(401).json({
				success: false,
				error: 'Usuario no autenticado'
			});
		}

		console.log(`📋 Controller: Obteniendo alertas para gestante ${gestanteId}`);

		const alertas = await alertaService.getAlertasByGestante(gestanteId);

		console.log(`✅ Controller: ${alertas.length} alertas obtenidas para gestante ${gestanteId}`);
		res.json({
			success: true,
			data: alertas
		});
	} catch (error) {
		console.error(`❌ Controller: Error obteniendo alertas para gestante ${req.params.gestanteId}:`, error);
		log.error('Error obteniendo alertas por gestante', { error: error.message });

		if (error.message.includes('No tiene permisos')) {
			res.status(403).json({
				success: false,
				error: error.message
			});
		} else {
			res.status(500).json({
				success: false,
				error: 'Error interno del servidor'
			});
		}
	}
};

/**
 * Obtener alertas activas (no resueltas)
 */
export const getAlertasActivas = async (req: AuthenticatedRequest, res: Response) => {
	try {
		const userId = req.user?.id;

		if (!userId) {
			return res.status(401).json({
				success: false,
				error: 'Usuario no autenticado'
			});
		}

		console.log(`🔥 Controller: Obteniendo alertas activas para usuario ${userId}`);

		const alertas = await alertaService.getAlertasActivas();

		console.log(`✅ Controller: ${alertas.length} alertas activas obtenidas`);
		res.json({
			success: true,
			data: alertas
		});
	} catch (error) {
		console.error('❌ Controller: Error obteniendo alertas activas:', error);
		log.error('Error obteniendo alertas activas', { error: error.message });
		res.status(500).json({
			success: false,
			error: 'Error interno del servidor'
		});
	}
};

/**
 * Notificar emergencia (crear alerta crítica SOS)
 * Captura ubicación GPS, datos de madrina y gestante
 */
export const notificarEmergencia = async (req: AuthenticatedRequest, res: Response) => {
	try {
		const userId = req.user?.id;

		if (!userId) {
			return res.status(401).json({
				success: false,
				error: 'Usuario no autenticado'
			});
		}

		const {
			gestante_id,
			mensaje,
			coordenadas_alerta,
			latitude,
			longitude,
			accuracy
		} = req.body;

		if (!gestante_id) {
			return res.status(400).json({
				success: false,
				error: 'El campo gestante_id es requerido'
			});
		}

		console.log(`🚨 Controller: Notificando emergencia SOS para gestante ${gestante_id}`);

		// Obtener datos de gestante y madrina
		const gestante = await prisma.gestantes.findUnique({
			where: { id: gestante_id },
			include: {
				madrina: {
					select: {
						id: true,
						nombre: true,
						telefono: true,
						rol: true
					}
				}
			}
		});

		if (!gestante) {
			return res.status(404).json({
				success: false,
				error: 'Gestante no encontrada'
			});
		}

		// Validar que solo madrinas pueden activar SOS
		if (gestante.madrina?.id !== userId && req.user?.rol !== 'SUPER_ADMIN' && req.user?.rol !== 'ADMIN') {
			return res.status(403).json({
				success: false,
				error: 'No tiene permisos para activar SOS para esta gestante'
			});
		}

		const alertaEmergencia = {
			gestante_id,
			tipo_alerta: 'SOS',
			nivel_prioridad: 'CRITICA',
			mensaje: mensaje || 'Alerta SOS de emergencia activada',
			coordenadas_alerta: coordenadas_alerta || (latitude && longitude ? {
				type: 'Point',
				coordinates: [longitude, latitude]
			} : null),
			es_automatica: false,
			score_riesgo: 100, // Emergencias tienen score máximo

			// Campos de ubicación GPS
			ubicacion_lat: latitude || null,
			ubicacion_lng: longitude || null,
			ubicacion_precision: accuracy || null,

			// Datos de Madrina
			nombre_madrina: gestante.madrina?.nombre || null,
			telefono_madrina: gestante.madrina?.telefono || null,

			// Datos de Gestante
			nombre_gestante: gestante.nombre || null,
			telefono_gestante: gestante.telefono || null,
			direccion_gestante: gestante.direccion || null,
			municipio: gestante.municipio || null,

			madrina_id: gestante.madrina?.id || null
		};

		const nuevaAlerta = await alertaService.createAlerta(alertaEmergencia, userId);

		console.log(`✅ Controller: Emergencia SOS notificada con ID ${nuevaAlerta.id}`);
		console.log(`📍 Ubicación: ${latitude}, ${longitude} (precisión: ${accuracy}m)`);
		console.log(`👩 Madrina: ${gestante.madrina?.nombre}`);
		console.log(`🤰 Gestante: ${gestante.nombre}`);

		res.status(201).json({
			success: true,
			data: nuevaAlerta,
			message: 'Emergencia SOS notificada exitosamente'
		});
	} catch (error) {
		console.error('❌ Controller: Error notificando emergencia:', error);
		log.error('Error notificando emergencia', { error: error.message });

		if (error.message.includes('No tiene permisos')) {
			res.status(403).json({
				success: false,
				error: error.message
			});
		} else if (error.message.includes('no encontrada')) {
			res.status(404).json({
				success: false,
				error: error.message
			});
		} else {
			res.status(400).json({
				success: false,
				error: error.message
			});
		}
	}
};

/**
 * Obtener estadísticas de alertas para dashboard
 */
export const getEstadisticasAlertas = async (req: AuthenticatedRequest, res: Response) => {
	try {
		const userId = req.user?.id;

		if (!userId) {
			return res.status(401).json({
				success: false,
				error: 'Usuario no autenticado'
			});
		}

		console.log(`📊 Controller: Obteniendo estadísticas de alertas para usuario ${userId}`);

		// Obtener alertas del usuario y calcular estadísticas básicas
		const alertas = await alertaService.getAlertasByUser(userId);
		
		const estadisticas = {
			total: alertas.length,
			criticas: alertas.filter(a => a.nivel_prioridad === 'critica').length,
			altas: alertas.filter(a => a.nivel_prioridad === 'alta').length,
			medias: alertas.filter(a => a.nivel_prioridad === 'media').length,
			bajas: alertas.filter(a => a.nivel_prioridad === 'baja').length,
			pendientes: alertas.filter(a => !a.resuelta).length,
			resueltas: alertas.filter(a => a.resuelta).length,
			automaticas: alertas.filter(a => a.es_automatica).length,
		};

		console.log(`✅ Controller: Estadísticas obtenidas exitosamente`);
		res.json({
			success: true,
			data: estadisticas
		});
	} catch (error) {
		console.error('❌ Controller: Error obteniendo estadísticas:', error);
		log.error('Error obteniendo estadísticas de alertas', { error: error.message });
		res.status(500).json({
			success: false,
			error: 'Error interno del servidor'
		});
	}
};

/**
 * Obtener gestantes disponibles para crear alertas (filtrado por permisos)
 */
export const getGestantesDisponibles = async (req: AuthenticatedRequest, res: Response) => {
	try {
		const userId = req.user?.id;
		const userRole = req.user?.rol;
		const userMunicipioId = req.user?.municipio_id;

		if (!userId) {
			return res.status(401).json({
				success: false,
				error: 'Usuario no autenticado'
			});
		}

		console.log(`👥 Controller: Obteniendo gestantes disponibles para usuario ${userId}`);

		// Usar Prisma directamente para obtener gestantes según permisos
		const prisma = new (require('@prisma/client').PrismaClient)();
		
		let whereClause: any = { activa: true };

		// Filtrar según rol
		if (userRole === 'madrina') {
			whereClause.madrina_id = userId;
		} else if (userRole === 'coordinador' && userMunicipioId) {
			whereClause.municipio_id = userMunicipioId;
		}
		// Admin puede ver todas las gestantes activas

		const gestantes = await prisma.gestante.findMany({
			where: whereClause,
			select: {
				id: true,
				nombre: true,
				documento: true,
				telefono: true,
				municipio: {
					select: {
						id: true,
						nombre: true
					}
				},
				madrina: {
					select: {
						id: true,
						nombre: true
					}
				}
			},
			orderBy: { nombre: 'asc' }
		});

		console.log(`✅ Controller: ${gestantes.length} gestantes disponibles obtenidas`);
		res.json({
			success: true,
			data: gestantes
		});
	} catch (error) {
		console.error('❌ Controller: Error obteniendo gestantes disponibles:', error);
		log.error('Error obteniendo gestantes disponibles', { error: error.message });
		res.status(500).json({
			success: false,
			error: 'Error interno del servidor'
		});
	}
};