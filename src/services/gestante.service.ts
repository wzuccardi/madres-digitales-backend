// Servicio para gestantes con funcionalidades completas
// Todos los datos provienen de la base de datos real, no se usan mocks
import prisma from '../config/database';
import { Prisma } from '@prisma/client';
import { log } from '../config/logger';
import type {
	FiltrosGestanteDTO,
	RespuestaPaginada,
	BusquedaGeograficaDTO,
	RiesgoGestante
} from '../types/gestante.dto';

export class GestanteService {
	// MÉTODO ORIGINAL - SOLO PARA ADMINISTRADORES
	async getAllGestantes() {
		log.info('GestanteService: Fetching all gestantes (ADMIN ONLY)');
		const gestantes = await prisma.gestantes.findMany({
			orderBy: { fecha_creacion: 'desc' }
		});
		log.info(`GestanteService: Found ${gestantes.length} gestantes`);
		return gestantes;
	}

	// NUEVO MÉTODO - FILTRADO POR MADRINA (SEGURIDAD)
	async getGestantesByMadrina(madrinaId: string) {
		log.info(`GestanteService: Fetching gestantes for madrina ${madrinaId}`);
		const gestantes = await prisma.gestantes.findMany({
			where: {
				madrina_id: madrinaId // FILTRO CRÍTICO DE SEGURIDAD
			},
			include: {
				municipio: true,
				ips_asignada: {
					select: {
						id: true,
						nombre: true,
						telefono: true,
					}
				}
			} as any,
			orderBy: { fecha_creacion: 'desc' }
		});
		log.info(`GestanteService: Found ${gestantes.length} gestantes for madrina ${madrinaId}`);
		return gestantes;
	}

	async getGestanteById(id: string) {
		return prisma.gestantes.findUnique({
			where: { id },
			include: {
				municipios: true,
				madrina: {
					select: {
						id: true,
						nombre: true,
						telefono: true,
					}
				},
				ips_asignada: {
					select: {
						id: true,
						nombre: true,
						telefono: true,
						direccion: true,
					}
				},
				medico_tratante: {
					select: {
						id: true,
						nombre: true,
						especialidad: true,
						telefono: true,
					}
				},
				controles: {
					orderBy: { fecha_control: 'desc' },
					take: 5,
				},
				alertas: {
					where: { resuelta: false },
					orderBy: { fecha_creacion: 'desc' },
					take: 10,
				}
			}
		}) as any;
	}

	async createGestante(data: any) {
		return prisma.gestantes.create({ data });
	}

	async updateGestante(id: string, data: any) {
		return prisma.gestantes.update({ where: { id }, data });
	}

	async deleteGestante(id: string) {
		return prisma.gestantes.delete({ where: { id } });
	}

	// Método para crear gestante con validaciones completas
	async createGestanteCompleta(data: any) {
		log.info('GestanteService: Creating new gestante');
		log.debug('Data received', { data });

		try {
			// Validar que el documento no exista
			const existingGestante = await prisma.gestantes.findFirst({
				where: { documento: data.documento }
			});

			if (existingGestante) {
				throw new Error(`Ya existe una gestante con documento ${data.documento}`);
			}

			// Calcular FPP si se proporciona FUM
			let fechaProbableParto = data.fecha_probable_parto;
			if (data.fecha_ultima_menstruacion && !fechaProbableParto) {
				const fum = new Date(data.fecha_ultima_menstruacion);
				fechaProbableParto = new Date(fum.getTime() + (280 * 24 * 60 * 60 * 1000)); // FUM + 280 días
			}

			// Preparar coordenadas GeoJSON si se proporcionan
			let coordenadas = null;
			if (data.latitud && data.longitud) {
				coordenadas = {
					type: 'Point',
					coordinates: [data.longitud, data.latitud]
				};
			}

			// Crear la gestante
			const newGestante = await prisma.gestantes.create({
				data: {
					documento: data.documento,
					tipo_documento: data.tipo_documento || 'cedula',
					nombre: data.nombre,
					fecha_nacimiento: data.fecha_nacimiento ? new Date(data.fecha_nacimiento) : new Date(),
					telefono: data.telefono,
					direccion: data.direccion,
					coordenadas: coordenadas,
					municipio_id: data.municipio_id,
					madrina_id: data.madrina_id,
					ips_asignada_id: data.ips_asignada_id,
					medico_tratante_id: data.medico_tratante_id,
					eps: data.eps,
					regimen_salud: data.regimen_salud || 'subsidiado',
					fecha_ultima_menstruacion: data.fecha_ultima_menstruacion ? new Date(data.fecha_ultima_menstruacion) : null,
					fecha_probable_parto: fechaProbableParto ? new Date(fechaProbableParto) : null,
					activa: data.activa !== undefined ? data.activa : true,
				} as any,
			}) as any;

			log.info(`GestanteService: Gestante created with ID: ${newGestante.id}`);
			return newGestante;
		} catch (error) {
			log.error('GestanteService: Error creating gestante', { error: error.message });
			throw error;
		}
	}

	// Método para actualizar gestante con validaciones
	async updateGestanteCompleta(id: string, data: any) {
		log.info(`GestanteService: Updating gestante ${id}`);
		log.debug('Data received', { data });

		try {
			// Verificar que la gestante existe
			const existingGestante = await prisma.gestantes.findUnique({
				where: { id }
			});

			if (!existingGestante) {
				throw new Error(`No se encontró gestante con ID ${id}`);
			}

			// Si se está cambiando el documento, verificar que no exista otro con el mismo
			if (data.documento && data.documento !== existingGestante.documento) {
				const duplicateGestante = await prisma.gestantes.findFirst({
					where: {
						documento: data.documento,
						id: { not: id }
					}
				});

				if (duplicateGestante) {
					throw new Error(`Ya existe otra gestante con documento ${data.documento}`);
				}
			}

			// Actualizar la gestante
			const updatedGestante = await prisma.gestantes.update({
				where: { id },
				data: {
					documento: data.documento || existingGestante.documento,
					nombre: data.nombre || existingGestante.nombre,
					telefono: data.telefono !== undefined ? data.telefono : existingGestante.telefono,
					direccion: data.direccion !== undefined ? data.direccion : existingGestante.direccion,
					municipio_id: data.municipio_id !== undefined ? data.municipio_id : existingGestante.municipio_id,
					eps: data.eps !== undefined ? data.eps : existingGestante.eps,
					activa: data.activa !== undefined ? data.activa : existingGestante.activa,
					fecha_probable_parto: data.fecha_probable_parto !== undefined
						? (data.fecha_probable_parto ? new Date(data.fecha_probable_parto) : null)
						: existingGestante.fecha_probable_parto,
					fecha_nacimiento: data.fecha_nacimiento !== undefined
						? (data.fecha_nacimiento ? new Date(data.fecha_nacimiento) : new Date())
						: existingGestante.fecha_nacimiento,
				}
			});

			log.info(`GestanteService: Gestante ${id} updated successfully`);
			return updatedGestante;
		} catch (error) {
			log.error(`GestanteService: Error updating gestante ${id}`, { error: error.message });
			throw error;
		}
	}

	/**
	 * Búsqueda avanzada con filtros y paginación
	 */
	async buscarGestantes(filtros: FiltrosGestanteDTO): Promise<RespuestaPaginada<any>> {
		log.info('GestanteService: Searching gestantes with filters', { filtros });

		try {
			// Construir condiciones WHERE
			const where: any = {};

			// Búsqueda por texto (nombre o documento)
			if (filtros.busqueda) {
				where.OR = [
					{ nombre: { contains: filtros.busqueda, mode: 'insensitive' } },
					{ documento: { contains: filtros.busqueda } },
				];
			}

			// Filtros específicos
			if (filtros.documento) {
				where.documento = { contains: filtros.documento };
			}

			if (filtros.nombre) {
				where.nombre = { contains: filtros.nombre, mode: 'insensitive' };
			}

			if (filtros.municipio_id) {
				where.municipio_id = filtros.municipio_id;
			}

			if (filtros.madrina_id) {
				where.madrina_id = filtros.madrina_id;
			}

			if (filtros.ips_asignada_id) {
				where.ips_asignada_id = filtros.ips_asignada_id;
			}

			if (filtros.activa !== undefined) {
				where.activa = filtros.activa;
			}


			if (filtros.sin_madrina) {
				where.madrina_id = null;
			}

			if (filtros.sin_ips) {
				where.ips_asignada_id = null;
			}

			// Filtros de fecha
			if (filtros.fecha_parto_desde || filtros.fecha_parto_hasta) {
				where.fecha_probable_parto = {};
				if (filtros.fecha_parto_desde) {
					where.fecha_probable_parto.gte = filtros.fecha_parto_desde;
				}
				if (filtros.fecha_parto_hasta) {
					where.fecha_probable_parto.lte = filtros.fecha_parto_hasta;
				}
			}

			// Contar total de registros
			const total = await prisma.gestantes.count({ where });

			// Calcular paginación
			const page = filtros.page || 1;
			const limit = filtros.limit || 20;
			const skip = (page - 1) * limit;
			const totalPages = Math.ceil(total / limit);

			// Construir ordenamiento
			const orderBy: any = {};
			const orderField = filtros.orderBy || 'fecha_creacion';
			const orderDirection = filtros.orderDirection || 'desc';
			orderBy[orderField] = orderDirection;

			// Ejecutar consulta
			const gestantes = await prisma.gestantes.findMany({
				where,
				orderBy,
				skip,
				take: limit,
			});

			log.info(`GestanteService: Found ${gestantes.length} gestantes (${total} total)`);

			return {
				data: gestantes,
				pagination: {
					page,
					limit,
					total,
					totalPages,
					hasNextPage: page < totalPages,
					hasPrevPage: page > 1,
				}
			};
		} catch (error) {
			log.error('GestanteService: Error searching gestantes', { error: error.message });
			throw error;
		}
	}

	/**
	 * Búsqueda geográfica de gestantes cercanas
	 */
	async buscarGestantesCercanas(params: BusquedaGeograficaDTO): Promise<any[]> {
		log.info('GestanteService: Searching nearby gestantes', { params });

		try {
			// Usar PostGIS para búsqueda geográfica
			const { latitud, longitud, radio_km, limit } = params;

			// Convertir radio de km a metros
			const radioMetros = radio_km * 1000;

			// Query SQL con PostGIS
			const gestantes = await prisma.$queryRaw<any[]>`
				SELECT
					g.*,
					ST_Distance(
						g.coordenadas::geography,
						ST_SetSRID(ST_MakePoint(${longitud}, ${latitud}), 4326)::geography
					) as distancia_metros
				FROM "Gestante" g
				WHERE g.coordenadas IS NOT NULL
				AND g.activa = true
				AND ST_DWithin(
					g.coordenadas::geography,
					ST_SetSRID(ST_MakePoint(${longitud}, ${latitud}), 4326)::geography,
					${radioMetros}
				)
				ORDER BY distancia_metros ASC
				LIMIT ${limit}
			`;

			log.info(`GestanteService: Found ${gestantes.length} nearby gestantes`);

			// Convertir distancia a km y agregar información adicional
			const gestantesConInfo = await Promise.all(
				gestantes.map(async (g) => {
					const gestanteCompleta = await prisma.gestantes.findUnique({
						where: { id: g.id },
						include: {
							municipio: true,
							madrina: {
								select: {
									id: true,
									nombre: true,
									telefono: true,
								}
							}
						} as any
					});

					return {
						...gestanteCompleta,
						distancia_km: (g.distancia_metros / 1000).toFixed(2),
					};
				})
			);

			return gestantesConInfo;
		} catch (error) {
			log.error('GestanteService: Error searching nearby gestantes', { error: error.message });
			throw error;
		}
	}

	/**
	 * Asignar madrina a gestante
	 */
	async asignarMadrina(gestanteId: string, madrinaId: string) {
		log.info(`GestanteService: Assigning madrina ${madrinaId} to gestante ${gestanteId}`);

		try {
			// Verificar que la gestante existe
			const gestante = await prisma.gestantes.findUnique({
				where: { id: gestanteId }
			});

			if (!gestante) {
				throw new Error(`No se encontró gestante con ID ${gestanteId}`);
			}

			// Verificar que la madrina existe
			const madrina = await prisma.usuarios.findUnique({
				where: { id: madrinaId }
			});

			if (!madrina) {
				throw new Error(`No se encontró madrina con ID ${madrinaId}`);
			}

			if (madrina.rol !== 'madrina') {
				throw new Error(`El usuario ${madrinaId} no es una madrina`);
			}

			// Asignar madrina
			const updatedGestante = await prisma.gestantes.update({
				where: { id: gestanteId },
				data: { madrina_id: madrinaId },
				include: {
					madrina: {
						select: {
							id: true,
							nombre: true,
							telefono: true,
						}
					}
				} as any
			});

			log.info(`GestanteService: Madrina assigned successfully`);
			return updatedGestante;
		} catch (error) {
			log.error('GestanteService: Error assigning madrina', { error: error.message });
			throw error;
		}
	}

	/**
	 * Calcular riesgo de gestante
	 */
	async calcularRiesgo(gestanteId: string): Promise<RiesgoGestante> {
		log.info(`GestanteService: Calculating risk for gestante ${gestanteId}`);

		try {
			const gestante = await prisma.gestantes.findUnique({
				where: { id: gestanteId },
				include: {
					controles: {
						orderBy: { fecha_control: 'desc' },
						take: 3,
					},
					alertas: {
						where: { resuelta: false },
						orderBy: { fecha_creacion: 'desc' },
					}
				} as any
			});

			if (!gestante) {
				throw new Error(`No se encontró gestante con ID ${gestanteId}`);
			}

			let puntuacion = 0;
			const factoresDetectados: string[] = [];
			const recomendaciones: string[] = [];

			// Factores de riesgo registrados
			if (gestante.factores_riesgo && Array.isArray(gestante.factores_riesgo)) {
				// El campo factores_riesgo no existe en el schema actual
				// Se omitirá esta lógica hasta que se agregue el campo
			}

			// Edad
			const edad = new Date().getFullYear() - new Date(gestante.fecha_nacimiento).getFullYear();
			if (edad < 18) {
				puntuacion += 15;
				factoresDetectados.push('Edad menor a 18 años');
				recomendaciones.push('Control prenatal frecuente por edad materna');
			} else if (edad > 35) {
				puntuacion += 10;
				factoresDetectados.push('Edad mayor a 35 años');
				recomendaciones.push('Monitoreo especial por edad materna avanzada');
			}

			// Alertas activas
			const gestanteData = gestante as any;
			if (gestanteData.alertas && Array.isArray(gestanteData.alertas) && gestanteData.alertas.length > 0) {
				const alertas = gestanteData.alertas;
				puntuacion += alertas.length * 20;
				factoresDetectados.push(`${alertas.length} alerta(s) activa(s)`);
				recomendaciones.push('Resolver alertas pendientes urgentemente');
			}

			// Controles prenatales
			if (!gestanteData.controles || !Array.isArray(gestanteData.controles) || gestanteData.controles.length === 0) {
				puntuacion += 15;
				factoresDetectados.push('Sin controles prenatales registrados');
				recomendaciones.push('Programar control prenatal inmediatamente');
			}

			// Sin madrina asignada
			if (!gestante.madrina_id) {
				puntuacion += 10;
				factoresDetectados.push('Sin madrina asignada');
				recomendaciones.push('Asignar madrina para seguimiento');
			}

			// Sin IPS asignada
			if (!gestante.ips_asignada_id) {
				puntuacion += 5;
				factoresDetectados.push('Sin IPS asignada');
				recomendaciones.push('Asignar IPS para atención médica');
			}

			// Determinar nivel de riesgo
			let nivelRiesgo: 'bajo' | 'medio' | 'alto' | 'critico';
			if (puntuacion >= 70) {
				nivelRiesgo = 'critico';
			} else if (puntuacion >= 50) {
				nivelRiesgo = 'alto';
			} else if (puntuacion >= 30) {
				nivelRiesgo = 'medio';
			} else {
				nivelRiesgo = 'bajo';
			}

			const requiereAtencionInmediata = puntuacion >= 50;

			// Actualizar riesgo_alto en la base de datos
			// No se actualiza riesgo_alto porque el campo no existe en el schema

			log.info(`GestanteService: Risk calculated - Level: ${nivelRiesgo}, Score: ${puntuacion}`);

			return {
				gestante_id: gestanteId,
				puntuacion_riesgo: puntuacion,
				nivel_riesgo: nivelRiesgo,
				factores_detectados: factoresDetectados,
				recomendaciones: recomendaciones,
				requiere_atencion_inmediata: requiereAtencionInmediata,
			};
		} catch (error) {
			log.error('GestanteService: Error calculating risk', { error: error.message });
			throw error;
		}
	}

	/**
	 * Obtener gestantes disponibles para alertas (filtrado por permisos)
	 */
	async getGestantesDisponiblesParaAlertas(userId: string) {
		log.info(`GestanteService: Getting available gestantes for alerts for user ${userId}`);

		try {
			// Importar PermissionService aquí para evitar dependencias circulares
			const { PermissionService } = await import('./permission.service');
			const permissionService = new PermissionService();

			// Usar el método existente del PermissionService
			const gestantes = await permissionService.filterGestantesByPermission(userId);

			// Filtrar solo gestantes activas y agregar información relevante para alertas
			const gestantesParaAlertas = gestantes
				.filter(g => g.activa)
				.map(gestante => ({
					id: gestante.id,
					nombre: gestante.nombre,
					apellido: gestante.apellido,
					documento_identidad: gestante.documento_identidad,
					telefono: gestante.telefono,
					municipio: gestante.municipio ? {
						id: gestante.municipio.id,
						nombre: gestante.municipio.nombre
					} : null,
					madrina: gestante.madrina ? {
						id: gestante.madrina.id,
						nombre: gestante.madrina.nombre
					} : null,
					semanas_gestacion: gestante.semanas_gestacion,
					fecha_probable_parto: gestante.fecha_probable_parto
				}));

			log.info(`GestanteService: Found ${gestantesParaAlertas.length} available gestantes for alerts`);
			return gestantesParaAlertas;

		} catch (error) {
			log.error('GestanteService: Error getting available gestantes for alerts', { error: error.message });
			throw error;
		}
	}
}
