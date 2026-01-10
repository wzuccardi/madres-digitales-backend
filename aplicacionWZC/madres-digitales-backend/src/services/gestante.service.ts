// Servicio para gestantes con funcionalidades completas
// Todos los datos provienen de la base de datos real, no se usan mocks
import prisma from '../config/database';
import { GestanteRepositoryImpl } from '../infrastructure/repositories/gestante.repository.impl';
import { CreateGestanteData } from '../domain/entities/gestante.entity';
import { Prisma } from '@prisma/client';
import { log } from '../config/logger';
import type {
	FiltrosGestanteDTO,
	RespuestaPaginada,
	BusquedaGeograficaDTO,
	RiesgoGestante
} from '../types/gestante.dto';

export class GestanteService {
  private readonly repo = new GestanteRepositoryImpl();
	// MÉTODO ORIGINAL - SOLO PARA ADMINISTRADORES
	async getAllGestantes() {
		log.info('GestanteService: Fetching all gestantes (ADMIN ONLY)');
		const gestantes = await this.repo.findMany({});
		log.info(`GestanteService: Found ${gestantes.length} gestantes`);
		return gestantes.map(g => ({
			id: g.id,
			nombre: g.name,
			documento: g.document,
			tipo_documento: g.documentType,
			fecha_nacimiento: g.birthDate,
			telefono: g.phone,
			direccion: g.address,
			municipio_id: g.municipalityId,
			madrina_id: g.madrinaId,
			ips_asignada_id: g.ipsAsignadaId,
			activa: g.active,
			riesgo_alto: g.highRisk,
			fecha_creacion: g.createdAt,
			fecha_actualizacion: g.updatedAt,
		} as any));
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
    const g = await this.repo.findById(id);
    if (!g) return null as any;
    return {
      id: g.id,
      nombre: g.name,
      documento: g.document,
      tipo_documento: g.documentType,
      fecha_nacimiento: g.birthDate,
      telefono: g.phone,
      direccion: g.address,
      coordenadas: g.coordinates ? { type: 'Point', coordinates: [g.coordinates.longitude, g.coordinates.latitude] } : null,
      fecha_ultima_menstruacion: g.lastMenstruation,
      fecha_probable_parto: g.probableDelivery,
      eps: g.eps,
      regimen_salud: g.healthRegime,
      municipio_id: g.municipalityId,
      madrina_id: g.madrinaId,
      medico_tratante_id: g.medicoTratanteId,
      ips_asignada_id: g.ipsAsignadaId,
      activa: g.active,
      riesgo_alto: g.highRisk,
      fecha_creacion: g.createdAt,
      fecha_actualizacion: g.updatedAt,
    } as any;
  }

	async createGestante(data: any) {
		return prisma.gestantes.create({ data });
	}

	async updateGestante(id: string, data: any) {
		return prisma.gestantes.update({ where: { id }, data });
	}

	async deleteGestante(id: string) {
		await this.repo.delete(id);
		return { id } as any;
	}

	// Método para crear gestante con validaciones completas
  async createGestanteCompleta(data: any) {
    log.info('GestanteService: Creating new gestante');
    log.debug('Data received', { data });

    try {
      const dto: CreateGestanteData = {
        name: data.nombre,
        document: data.documento,
        documentType: data.tipo_documento || 'cedula',
        birthDate: data.fecha_nacimiento ? new Date(data.fecha_nacimiento) : new Date(),
        phone: data.telefono,
        address: data.direccion,
        coordinates: data.latitud && data.longitud ? { latitude: data.latitud, longitude: data.longitud } : undefined,
        lastMenstruation: data.fecha_ultima_menstruacion ? new Date(data.fecha_ultima_menstruacion) : undefined,
        probableDelivery: data.fecha_probable_parto ? new Date(data.fecha_probable_parto) : undefined,
        eps: data.eps,
        healthRegime: data.regimen_salud || 'subsidiado',
        municipalityId: data.municipio_id,
        madrinaId: data.madrina_id,
        medicoTratanteId: data.medico_tratante_id,
        ipsAsignadaId: data.ips_asignada_id,
      };

      const created = await this.repo.create(dto);

      const newGestante = {
        id: created.id,
        documento: created.document,
        tipo_documento: created.documentType,
        nombre: created.name,
        fecha_nacimiento: created.birthDate,
        telefono: created.phone,
        direccion: created.address,
        coordenadas: created.coordinates ? { type: 'Point', coordinates: [created.coordinates.longitude, created.coordinates.latitude] } : null,
        fecha_ultima_menstruacion: created.lastMenstruation,
        fecha_probable_parto: created.probableDelivery,
        eps: created.eps,
        regimen_salud: created.healthRegime,
        municipio_id: created.municipalityId,
        madrina_id: created.madrinaId,
        medico_tratante_id: created.medicoTratanteId,
        ips_asignada_id: created.ipsAsignadaId,
        activa: created.active,
        riesgo_alto: created.highRisk,
        fecha_creacion: created.createdAt,
        fecha_actualizacion: created.updatedAt,
      } as any;

      log.info(`GestanteService: Gestante created with ID: ${newGestante.id}`);
      return newGestante;
    } catch (error) {
      log.error('GestanteService: Error creating gestante', { error: (error as any).message });
      throw error;
    }
  }

	// Método para actualizar gestante con validaciones
	async updateGestanteCompleta(id: string, data: any) {
		log.info(`GestanteService: Updating gestante ${id}`);
		log.debug('Data received', { data });

		try {
			const dto = {
				document: data.documento,
				name: data.nombre,
				phone: data.telefono,
				address: data.direccion,
				municipalityId: data.municipio_id,
				eps: data.eps,
				active: data.activa,
				lastMenstruation: data.fecha_ultima_menstruacion ? new Date(data.fecha_ultima_menstruacion) : undefined,
				probableDelivery: data.fecha_probable_parto ? new Date(data.fecha_probable_parto) : undefined,
				healthRegime: data.regimen_salud,
			} as any;
			
			// Si se proporciona FUM, calcular automáticamente FPP (FUM + 280 días)
			if (data.fecha_ultima_menstruacion && !data.fecha_probable_parto) {
				const fum = new Date(data.fecha_ultima_menstruacion);
				const fpp = new Date(fum);
				fpp.setDate(fpp.getDate() + 280);
				dto.probableDelivery = fpp;
				log.info(`GestanteService: FPP calculada automáticamente desde FUM: ${fpp.toISOString()}`);
			}
			
			const updated = await this.repo.update(id, dto);
			return {
				id: updated.id,
				documento: updated.document,
				tipo_documento: updated.documentType,
				nombre: updated.name,
				fecha_nacimiento: updated.birthDate,
				telefono: updated.phone,
				direccion: updated.address,
				municipio_id: updated.municipalityId,
				eps: updated.eps,
				activa: updated.active,
				fecha_ultima_menstruacion: updated.lastMenstruation,
				fecha_probable_parto: updated.probableDelivery,
				fecha_actualizacion: updated.updatedAt,
			} as any;
		} catch (error) {
			log.error(`GestanteService: Error updating gestante ${id}`, { error: (error as any).message });
			throw error;
		}
	}

	/**
	 * Búsqueda avanzada con filtros y paginación
	 */
	async buscarGestantes(filtros: FiltrosGestanteDTO): Promise<RespuestaPaginada<any>> {
		log.info('GestanteService: Searching gestantes with filters', { filtros });

		try {
			const filters: any = {};
			// CORRECCIÓN: Asegurar que el filtro de madrina se aplique correctamente
			if (filtros.madrina_id) {
				filters.madrinaId = filtros.madrina_id;
				log.info(`🔍 Aplicando filtro de madrina: ${filtros.madrina_id}`);
			}
			if (filtros.municipio_id) filters.municipalityId = filtros.municipio_id;
			if (filtros.activa !== undefined) filters.active = filtros.activa;
			if (filtros.riesgo_alto !== undefined) filters.highRisk = filtros.riesgo_alto;
			if (filtros.busqueda) filters.search = filtros.busqueda;

			const total = await this.repo.count(filters);
			const page = filtros.page || 1;
			const limit = filtros.limit || 20;
			const totalPages = Math.ceil(total / limit);
			const data = await this.repo.findMany({ ...filters, page, limit });

			return {
				data: data.map(g => ({
					id: g.id,
					nombre: g.name,
					documento: g.document,
					tipo_documento: g.documentType,
					fecha_nacimiento: g.birthDate,
					telefono: g.phone,
					direccion: g.address,
					municipio_id: g.municipalityId,
					madrina_id: g.madrinaId,
					ips_asignada_id: g.ipsAsignadaId,
					activa: g.active,
					riesgo_alto: g.highRisk,
					fecha_creacion: g.createdAt,
					fecha_actualizacion: g.updatedAt,
				} as any)),
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
			log.error('GestanteService: Error searching gestantes', { error: (error as any).message });
			throw error;
		}
	}

	/**
	 * Búsqueda geográfica de gestantes cercanas
	 */
	async buscarGestantesCercanas(params: BusquedaGeograficaDTO): Promise<any[]> {
		log.info('GestanteService: Searching nearby gestantes', { params });

		try {
			const nearby = await this.repo.findNearbyGestantes(params.latitud, params.longitud, params.radio_km, params.limit);
			const result = await Promise.all(
				nearby.map(async (g) => {
					const full = await this.repo.findById(g.id);
					if (!full) return null;
					return {
						id: full.id,
						nombre: full.name,
						documento: full.document,
						tipo_documento: full.documentType,
						fecha_nacimiento: full.birthDate,
						telefono: full.phone,
						direccion: full.address,
						municipio_id: full.municipalityId,
						madrina_id: full.madrinaId,
						distancia_km: (g.distancia_metros / 1000).toFixed(2),
					} as any;
				})
			);
			return result.filter(Boolean) as any[];
		} catch (error) {
			log.error('GestanteService: Error searching nearby gestantes', { error: (error as any).message });
			throw error;
		}
	}

	/**
	 * Asignar madrina a gestante
	 */
	async asignarMadrina(gestanteId: string, madrinaId: string) {
		log.info(`GestanteService: Assigning madrina ${madrinaId} to gestante ${gestanteId}`);
		try {
			await this.repo.assignMadrina(gestanteId, madrinaId);
			const updated = await this.repo.findById(gestanteId);
			return updated as any;
		} catch (error) {
			log.error('GestanteService: Error assigning madrina', { error: (error as any).message });
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
