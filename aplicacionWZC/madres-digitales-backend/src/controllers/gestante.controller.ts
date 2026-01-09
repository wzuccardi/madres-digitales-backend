// Controlador mejorado para gestantes con funcionalidades completas
import { Request, Response } from 'express';
import { GestanteService } from '../services/gestante.service';
import { GestanteRepositoryImpl } from '../infrastructure/repositories/gestante.repository.impl';
import { CreateGestanteData } from '../domain/entities/gestante.entity';
import { getUserForFiltering, canViewAllData } from '../utils/auth.utils';
import { validateMadrinaId, validateAndFixGestanteAssignments } from '../utils/validation.utils';
import {
	crearGestanteCompletaSchema,
	actualizarGestanteCompletaSchema,
	filtrosGestanteSchema,
	busquedaGeograficaSchema,
	asignarMadrinaSchema,
} from '../types/gestante.dto';
import prisma from '../config/database';

const gestanteService = new GestanteService();

/**
 * Búsqueda avanzada de gestantes con filtros y paginación
 */
export const getAllGestantes = async (req: Request, res: Response) => {
	try {
		console.log('🔍 Controller: Searching gestantes with query:', req.query);

		// Validar y parsear filtros
		const filtros = filtrosGestanteSchema.parse({
			...req.query,
			page: req.query.page ? parseInt(req.query.page as string) : 1,
			limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
			activa: req.query.activa === 'true' ? true : req.query.activa === 'false' ? false : undefined,
			riesgo_alto: req.query.riesgo_alto === 'true' ? true : req.query.riesgo_alto === 'false' ? false : undefined,
			sin_madrina: req.query.sin_madrina === 'true',
			sin_ips: req.query.sin_ips === 'true',
		});

		// Aplicar filtro de seguridad por rol
		const user = await getUserForFiltering(req);
		console.log('🔍 DEBUG - Usuario autenticado:', {
			id: user.id,
			rol: user.rol,
			canViewAllData: canViewAllData(user.rol)
		});
		
		if (!canViewAllData(user.rol)) {
			// Madrinas solo ven sus gestantes
			filtros.madrina_id = user.id;
			console.log('🔍 DEBUG - Aplicando filtro de madrina:', {
				madrina_id: user.id,
				user_id: user.id,
				filtros_completos: JSON.stringify(filtros)
			});
		} else {
			console.log('🔍 DEBUG - Usuario con permisos de administrador, sin filtro de madrina');
		}
		
		console.log('🔍 DEBUG - Filtros finales antes de llamar al servicio:', JSON.stringify(filtros));

		const resultado = await gestanteService.buscarGestantes(filtros);

		console.log(`✅ Controller: Returning ${resultado.data.length} gestantes`);
		// Estandarizar respuesta como array directo (como IPS y médicos)
		res.json(resultado.data);
	} catch (error) {
		console.error('❌ Controller: Error searching gestantes:', error);

		if (error instanceof Error && error.name === 'ZodError') {
			return res.status(400).json({
				error: 'Parámetros de búsqueda inválidos',
				details: error.message
			});
		}

		res.status(500).json({
			error: 'Error al buscar gestantes',
			details: error instanceof Error ? error.message : 'Error desconocido'
		});
	}
};

/**
 * Obtener gestante por ID con información completa
 */
export const getGestanteById = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		console.log(`🤰 Controller: Fetching gestante ${id}`);

		const gestante = await gestanteService.getGestanteById(id);

		if (!gestante) {
			return res.status(404).json({ error: 'Gestante no encontrada' });
		}

		// Verificar permisos de acceso
		const user = await getUserForFiltering(req);
		if (!canViewAllData(user.rol) && gestante.madrina_id !== user.id) {
			return res.status(403).json({ error: 'No tienes permiso para ver esta gestante' });
		}

		console.log(`✅ Controller: Gestante ${id} found`);
		res.json(gestante);
	} catch (error) {
		console.error(`❌ Controller: Error fetching gestante ${req.params.id}:`, error);
		res.status(500).json({
			error: 'Error al obtener gestante',
			details: error instanceof Error ? error.message : 'Error desconocido'
		});
	}
};

export const createGestante = async (req: Request, res: Response) => {
	try {
		console.log('🤰 Controller: Creating gestante with data:', req.body);

		// Validar datos requeridos
		const { documento, nombre, madrina_id } = req.body;
		if (!documento || !nombre) {
			return res.status(400).json({
				error: 'Los campos documento y nombre son requeridos'
			});
		}

		// Validar madrina_id si se proporciona
		if (madrina_id) {
			const isValidMadrina = await validateMadrinaId(madrina_id);
			if (!isValidMadrina) {
				return res.status(400).json({
					error: 'madrina_id inválido',
					details: 'El ID proporcionado no corresponde a una madrina activa'
				});
			}
		}

		// Validar formato de documento (permitir documentos con espacios o guiones)
		const documentoLimpio = documento.replace(/[\s-]/g, '');
		if (documentoLimpio.length < 6) {
			return res.status(400).json({
				error: 'El documento debe tener al menos 6 caracteres'
			});
		}

		// Validar nombre
		if (nombre.length < 3) {
			return res.status(400).json({
				error: 'El nombre debe tener al menos 3 caracteres'
			});
		}

		// Manejar ambos formatos: fecha_nacimiento (snake_case) y fechaNacimiento (camelCase)
		const fechaNacimiento = req.body.fecha_nacimiento || req.body.fechaNacimiento;
		const fechaUltimaMenstruacion = req.body.fecha_ultima_menstruacion || req.body.fechaUltimaMestruacion;
		const fechaProbableParto = req.body.fecha_probable_parto || req.body.fechaProbableParto;
		
		console.log('📅 Fechas recibidas:', { fechaNacimiento, fechaUltimaMenstruacion, fechaProbableParto });
		
		// Preparar datos para Prisma directamente
		const gestanteData: any = {
			id: `gestante_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
			nombre: req.body.nombre,
			apellido: req.body.apellido || '',
			documento: req.body.documento,
			tipo_documento: req.body.tipo_documento || 'CC',
			fecha_nacimiento: fechaNacimiento ? new Date(fechaNacimiento) : new Date(),
			telefono: req.body.telefono || '',
			direccion: req.body.direccion || '',
			email: req.body.email || null,
			coordenadas: req.body.latitud && req.body.longitud 
				? { type: 'Point', coordinates: [req.body.longitud, req.body.latitud] }
				: null,
			fecha_ultima_menstruacion: fechaUltimaMenstruacion ? new Date(fechaUltimaMenstruacion) : null,
			fecha_probable_parto: fechaProbableParto ? new Date(fechaProbableParto) : null,
			eps: req.body.eps || null,
			regimen_salud: req.body.regimen_salud || req.body.regimen || 'subsidiado',
			municipio_id: req.body.municipio_id || null,
			madrina_id: req.body.madrina_id || null,
			medico_tratante_id: req.body.medico_tratante_id || null,
			ips_asignada_id: req.body.ips_asignada_id || null,
			activa: true,
			riesgo_alto: req.body.riesgo_alto || req.body.esAltoRiesgo || false,
			grupo_sanguineo: req.body.grupo_sanguineo || req.body.grupoSanguineo || null,
			barrio: req.body.barrio || null,
			foto_url: req.body.foto_url || req.body.fotoUrl || null,
			factores_riesgo: req.body.factores_riesgo || req.body.factoresRiesgo || null,
		};

		console.log('💾 Datos a guardar:', JSON.stringify(gestanteData, null, 2));

		const created = await prisma.gestantes.create({ data: gestanteData });

		console.log('✅ Gestante creada en BD:', created.id);

		// La respuesta ya viene en el formato correcto de Prisma
		const gestante = created;

		console.log('✅ Controller: Gestante created successfully:', gestante.id);

  res.status(201).json({
    message: 'Gestante creada exitosamente',
    gestante
  });
	} catch (error) {
		console.error('❌ Controller: Error creating gestante:', error);
		console.error('❌ Error details:', error instanceof Error ? error.message : error);
		console.error('❌ Request body:', req.body);

		if (error instanceof Error && error.message.includes('Ya existe una gestante')) {
			return res.status(409).json({ error: error.message });
		}

		res.status(500).json({
			error: 'Error interno del servidor al crear gestante',
			details: error instanceof Error ? error.message : 'Error desconocido'
		});
	}
};

export const updateGestante = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		console.log(`🤰 Controller: Updating gestante ${id} with data:`, req.body);

		// Validar que el ID sea válido
		if (!id) {
			return res.status(400).json({ error: 'ID de gestante requerido' });
		}

		// Validar datos si se proporcionan
		const { documento, nombre, madrina_id } = req.body;

		// Validar madrina_id si se proporciona
		if (madrina_id) {
			const isValidMadrina = await validateMadrinaId(madrina_id);
			if (!isValidMadrina) {
				return res.status(400).json({
					error: 'madrina_id inválido',
					details: 'El ID proporcionado no corresponde a una madrina activa'
				});
			}
		}

		if (documento && documento.length < 6) {
			return res.status(400).json({
				error: 'El documento debe tener al menos 6 caracteres'
			});
		}

		if (nombre && nombre.length < 3) {
			return res.status(400).json({
				error: 'El nombre debe tener al menos 3 caracteres'
			});
		}

		const gestante = await gestanteService.updateGestanteCompleta(id, req.body);

		console.log(`✅ Controller: Gestante ${id} updated successfully`);
		res.json({
			message: 'Gestante actualizada exitosamente',
			gestante: gestante
		});
	} catch (error) {
		console.error(`❌ Controller: Error updating gestante ${req.params.id}:`, error);

		if (error instanceof Error) {
			if (error.message.includes('No se encontró gestante')) {
				return res.status(404).json({ error: error.message });
			}
			if (error.message.includes('Ya existe otra gestante')) {
				return res.status(409).json({ error: error.message });
			}
		}

		res.status(500).json({
			error: 'Error interno del servidor al actualizar gestante',
			details: error instanceof Error ? error.message : 'Error desconocido'
		});
	}
};

export const deleteGestante = async (req: Request, res: Response) => {
	try {
		await gestanteService.deleteGestante(req.params.id);
		res.status(204).send();
	} catch (error) {
		res.status(500).json({ error: 'Error al eliminar gestante' });
	}
};

/**
 * Búsqueda geográfica de gestantes cercanas
 */
export const buscarGestantesCercanas = async (req: Request, res: Response) => {
	try {
		console.log('📍 Controller: Searching nearby gestantes with params:', req.query);

		const params = busquedaGeograficaSchema.parse({
			latitud: parseFloat(req.query.latitud as string),
			longitud: parseFloat(req.query.longitud as string),
			radio_km: req.query.radio_km ? parseFloat(req.query.radio_km as string) : 5,
			limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
		});

		const gestantes = await gestanteService.buscarGestantesCercanas(params);

		console.log(`✅ Controller: Found ${gestantes.length} nearby gestantes`);
		res.json({
			total: gestantes.length,
			radio_km: params.radio_km,
			centro: { latitud: params.latitud, longitud: params.longitud },
			gestantes
		});
	} catch (error) {
		console.error('❌ Controller: Error searching nearby gestantes:', error);
		res.status(500).json({
			error: 'Error al buscar gestantes cercanas',
			details: error instanceof Error ? error.message : 'Error desconocido'
		});
	}
};

/**
 * Asignar madrina a gestante
 */
export const asignarMadrina = async (req: Request, res: Response) => {
	try {
		console.log('👩‍⚕️ Controller: Assigning madrina:', req.body);

		const datos = asignarMadrinaSchema.parse(req.body);
		
		// Validar que el madrina_id sea válido
		const isValidMadrina = await validateMadrinaId(datos.madrina_id);
		if (!isValidMadrina) {
			return res.status(400).json({
				error: 'madrina_id inválido',
				details: 'El ID proporcionado no corresponde a una madrina activa'
			});
		}

		const gestante = await gestanteService.asignarMadrina(datos.gestante_id, datos.madrina_id);

		console.log(`✅ Controller: Madrina assigned successfully`);
		res.json({ message: 'Madrina asignada exitosamente', gestante });
	} catch (error) {
		console.error('❌ Controller: Error assigning madrina:', error);
		res.status(500).json({
			error: 'Error al asignar madrina',
			details: error instanceof Error ? error.message : 'Error desconocido'
		});
	}
};

/**
 * Calcular riesgo de gestante
 */
export const calcularRiesgo = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		console.log(`⚠️ Controller: Calculating risk for gestante ${id}`);

		const riesgo = await gestanteService.calcularRiesgo(id);

		console.log(`✅ Controller: Risk calculated - Level: ${riesgo.nivel_riesgo}`);
		res.json(riesgo);
	} catch (error) {
		console.error(`❌ Controller: Error calculating risk:`, error);
		res.status(500).json({
			error: 'Error al calcular riesgo',
			details: error instanceof Error ? error.message : 'Error desconocido'
		});
	}
};

/**
 * Obtener gestantes disponibles para alertas (filtrado por permisos)
 */
export const getGestantesDisponiblesParaAlertas = async (req: Request, res: Response) => {
	try {
		const userId = (req as any).user?.id;

		if (!userId) {
			return res.status(401).json({
				success: false,
				error: 'Usuario no autenticado'
			});
		}

		console.log(`🔍 Controller: Getting available gestantes for alerts for user ${userId}`);

		const gestantes = await gestanteService.getGestantesDisponiblesParaAlertas(userId);

		console.log(`✅ Controller: Found ${gestantes.length} available gestantes for alerts`);
		res.json({
			success: true,
			data: gestantes,
			total: gestantes.length
		});
	} catch (error) {
		console.error('❌ Controller: Error getting available gestantes for alerts:', error);
		res.status(500).json({
			success: false,
			error: 'Error al obtener gestantes disponibles',
			details: error instanceof Error ? error.message : 'Error desconocido'
		});
	}
};

/**
 * Reasignar madrina a gestante (con validación de permisos)
 */
export const reasignarMadrina = async (req: Request, res: Response) => {
	try {
		const userId = (req as any).user?.id;
		const userRole = (req as any).user?.rol;
		const userMunicipioId = (req as any).user?.municipio_id;

		if (!userId) {
			return res.status(401).json({
				success: false,
				error: 'Usuario no autenticado'
			});
		}

		const { id: gestanteId } = req.params;
		const { madrina_id } = req.body;

		if (!gestanteId || !madrina_id) {
			return res.status(400).json({
				success: false,
				error: 'gestante_id y madrina_id son requeridos'
			});
		}

		console.log(`👩‍⚕️ Controller: Reasignando gestante ${gestanteId} a madrina ${madrina_id} por usuario ${userId}`);

		// Verificar permisos para reasignación
		if (userRole !== 'administrador' && userRole !== 'coordinador') {
			return res.status(403).json({
				success: false,
				error: 'Solo coordinadores y administradores pueden reasignar gestantes'
			});
		}

		// Si es coordinador, verificar que la gestante esté en su municipio
		if (userRole === 'coordinador') {
			const gestante = await gestanteService.getGestanteById(gestanteId);
			if (!gestante || gestante.municipio_id !== userMunicipioId) {
				return res.status(403).json({
					success: false,
					error: 'Solo puede reasignar gestantes de su municipio'
				});
			}
		}

		const gestanteActualizada = await gestanteService.asignarMadrina(gestanteId, madrina_id);

		console.log(`✅ Controller: Gestante reasignada exitosamente`);
		res.json({
			success: true,
			message: 'Gestante reasignada exitosamente',
			data: gestanteActualizada
		});
	} catch (error) {
		console.error('❌ Controller: Error reasignando gestante:', error);
		res.status(500).json({
			success: false,
			error: 'Error al reasignar gestante',
			details: error instanceof Error ? error.message : 'Error desconocido'
		});
	}
};
