 // Servicio para controles prenatales con evaluación automática de alertas
// Todos los datos provienen de la base de datos real, no se usan mocks
import prisma from '../config/database';
import { evaluarSignosAlarma, calcularPuntuacionRiesgo, generarRecomendaciones } from '../utils/alarma_utils';
import { CrearControlConEvaluacionDTO, ControlConEvaluacionDTO, ResultadoEvaluacionDTO } from '../types/alerta-automatica.dto';
import { AlertaService } from './alerta.service';
import { AutoAlertService } from './auto-alert.service';
import { AlertRulesEngine } from './alert-rules-engine.service';

export class ControlService {
	private alertaService: AlertaService;
	private autoAlertService: AutoAlertService;
	private alertRulesEngine: AlertRulesEngine;

	constructor() {
		this.alertaService = new AlertaService();
		this.alertRulesEngine = new AlertRulesEngine();
		this.autoAlertService = new AutoAlertService(prisma, this.alertRulesEngine);
	}
	// MÉTODO ORIGINAL - SOLO PARA ADMINISTRADORES
	async getAllControles() {
		console.log('🏥 ControlService: Fetching all controles (ADMIN ONLY)...');
		const controles = await prisma.controlPrenatal.findMany();
		console.log(`🏥 ControlService: Found ${controles.length} controles`);
		return controles;
	}

	// NUEVO MÉTODO - FILTRADO POR MADRINA (SEGURIDAD)
	async getControlesByMadrina(madrinaId: string) {
		console.log(`🏥 ControlService: Fetching controles for madrina ${madrinaId}...`);

		// Primero obtenemos los IDs de las gestantes asignadas a esta madrina
		const gestantesAsignadas = await prisma.gestante.findMany({
			where: { madrina_id: madrinaId },
			select: { id: true }
		});

		const gestanteIds = gestantesAsignadas.map(g => g.id);
		console.log(`🏥 ControlService: Found ${gestanteIds.length} gestantes for madrina ${madrinaId}`);

		if (gestanteIds.length === 0) {
			console.log(`🏥 ControlService: No gestantes found for madrina ${madrinaId}, returning empty array`);
			return [];
		}

		// Luego obtenemos los controles de esas gestantes
		const controles = await prisma.controlPrenatal.findMany({
			where: {
				gestante_id: {
					in: gestanteIds // FILTRO CRÍTICO DE SEGURIDAD
				}
			},
			orderBy: { fecha_control: 'desc' }
		});

		console.log(`🏥 ControlService: Found ${controles.length} controles for madrina ${madrinaId}`);
		return controles;
	}

	async getControlById(id: string) {
		 return prisma.controlPrenatal.findUnique({ where: { id } });
	}

	async createControl(data: any) {
		 return prisma.controlPrenatal.create({ data });
	}

	async updateControl(id: string, data: any) {
		 return prisma.controlPrenatal.update({ where: { id }, data });
	}

	async deleteControl(id: string) {
		 return prisma.controlPrenatal.delete({ where: { id } });
	}

	// Método para crear control con validaciones
	async createControlCompleto(data: any) {
		console.log('🏥 ControlService: Creating new control...');
		console.log('   Data received:', data);

		try {
			// Validar que la gestante existe
			const gestante = await prisma.gestante.findUnique({
				where: { id: data.gestante_id }
			});

			if (!gestante) {
				throw new Error(`No se encontró gestante con ID ${data.gestante_id}`);
			}

			// Crear el control
			const newControl = await prisma.controlPrenatal.create({
				data: {
					gestante_id: data.gestante_id,
					medico_id: data.medico_id || 'c66fdb18-76f4-4767-95ad-9b4b81fa6add', // Usuario por defecto (admin)
					fecha_control: new Date(data.fecha_control),
					semanas_gestacion: data.semanas_gestacion || null,
					peso: data.peso || null,
					presion_sistolica: data.presion_sistolica || null,
					presion_diastolica: data.presion_diastolica || null,
				}
			});

			console.log(`✅ ControlService: Control created with ID: ${newControl.id}`);
			return newControl;
		} catch (error) {
			console.error('❌ ControlService: Error creating control:', error);
			throw error;
		}
	}

	// Método para actualizar control con validaciones
	async updateControlCompleto(id: string, data: any) {
		console.log(`🏥 ControlService: Updating control ${id}...`);
		console.log('   Data received:', data);

		try {
			// Verificar que el control existe
			const existingControl = await prisma.controlPrenatal.findUnique({
				where: { id }
			});

			if (!existingControl) {
				throw new Error(`No se encontró control con ID ${id}`);
			}

			// Si se está cambiando la gestante, verificar que existe
			if (data.gestante_id && data.gestante_id !== existingControl.gestante_id) {
				const gestante = await prisma.gestante.findUnique({
					where: { id: data.gestante_id }
				});

				if (!gestante) {
					throw new Error(`No se encontró gestante con ID ${data.gestante_id}`);
				}
			}

			// Actualizar el control
			const updatedControl = await prisma.controlPrenatal.update({
				where: { id },
				data: {
					gestante_id: data.gestante_id || existingControl.gestante_id,
					medico_id: data.medico_id !== undefined ? data.medico_id : existingControl.medico_id,
					fecha_control: data.fecha_control ? new Date(data.fecha_control) : existingControl.fecha_control,
					semanas_gestacion: data.semanas_gestacion !== undefined ? data.semanas_gestacion : existingControl.semanas_gestacion,
					peso: data.peso !== undefined ? data.peso : existingControl.peso,
					presion_sistolica: data.presion_sistolica !== undefined ? data.presion_sistolica : existingControl.presion_sistolica,
					presion_diastolica: data.presion_diastolica !== undefined ? data.presion_diastolica : existingControl.presion_diastolica,
				}
			});

			console.log(`✅ ControlService: Control ${id} updated successfully`);
			return updatedControl;
		} catch (error) {
			console.error(`❌ ControlService: Error updating control ${id}:`, error);
			throw error;
		}
	}

	// Método para obtener controles por gestante
	async getControlesByGestante(gestanteId: string) {
		console.log(`🏥 ControlService: Fetching controls for gestante ${gestanteId}...`);
		const controles = await prisma.controlPrenatal.findMany({
			where: { gestante_id: gestanteId },
			orderBy: { fecha_control: 'desc' }
		});
		console.log(`🏥 ControlService: Found ${controles.length} controls for gestante`);
		return controles;
	}

	// ==================== NUEVOS MÉTODOS CON EVALUACIÓN AUTOMÁTICA ====================

	/**
	 * Crear control prenatal con evaluación automática de alertas
	 * @param data - Datos del control con configuración de evaluación
	 * @returns Control creado con resultado de evaluación y alertas generadas
	 */
	async createControlConEvaluacion(data: CrearControlConEvaluacionDTO): Promise<ControlConEvaluacionDTO> {
		console.log('🏥 ControlService: Creating control with automatic alert evaluation...');
		console.log('   Data received:', data);

		const startTime = Date.now();

		try {
			// Validar que la gestante existe
			const gestante = await prisma.gestante.findUnique({
				where: { id: data.gestante_id }
			});

			if (!gestante) {
				throw new Error(`No se encontró gestante con ID ${data.gestante_id}`);
			}

			// Obtener historial de controles si se solicita
			let historialControles: any[] = [];
			if (data.incluir_historial) {
				historialControles = await prisma.controlPrenatal.findMany({
					where: { gestante_id: data.gestante_id },
					orderBy: { fecha_control: 'desc' },
					take: 5 // Últimos 5 controles
				});
			}

			// Crear el control
			const nuevoControl = await prisma.controlPrenatal.create({
				data: {
					gestante_id: data.gestante_id,
					medico_id: data.realizado_por_id,
					fecha_control: new Date(data.fecha_control),
					semanas_gestacion: data.semanas_gestacion || null,
					peso: data.peso || null,
					presion_sistolica: data.presion_sistolica || null,
					presion_diastolica: data.presion_diastolica || null,
					frecuencia_cardiaca: data.frecuencia_cardiaca || null,
					frecuencia_respiratoria: data.frecuencia_respiratoria || null,
					temperatura: data.temperatura || null,
					altura_uterina: data.altura_uterina || null,
					movimientos_fetales: data.movimientos_fetales ? 'si' : 'no',
					edemas: data.edemas ? 'si' : 'no',
					recomendaciones: data.recomendaciones || null,
				}
			});

			console.log(`✅ ControlService: Control created with ID: ${nuevoControl.id}`);

			// Realizar evaluación automática si está habilitada
			let evaluacion: ResultadoEvaluacionDTO;
			let alertasGeneradas: any[] = [];

			if (data.evaluar_automaticamente !== false) { // Por defecto true
				console.log('🔍 ControlService: Performing automatic alert evaluation...');

				// Preparar datos para evaluación usando el nuevo AutoAlertService
				const controlData = {
					gestante_id: data.gestante_id,
					presion_sistolica: nuevoControl.presion_sistolica,
					presion_diastolica: nuevoControl.presion_diastolica,
					frecuencia_cardiaca: nuevoControl.frecuencia_cardiaca,
					frecuencia_respiratoria: nuevoControl.frecuencia_respiratoria,
					temperatura: nuevoControl.temperatura ? Number(nuevoControl.temperatura) : undefined,
					peso: nuevoControl.peso ? Number(nuevoControl.peso) : undefined,
					semanas_gestacion: nuevoControl.semanas_gestacion,
					altura_uterina: nuevoControl.altura_uterina ? Number(nuevoControl.altura_uterina) : undefined,
					movimientos_fetales: nuevoControl.movimientos_fetales === 'si',
					edemas: nuevoControl.edemas === 'si',
				};

				try {
					// Usar el nuevo AutoAlertService para evaluación y creación de alertas
					alertasGeneradas = await this.autoAlertService.evaluateAndCreateAlert(
						controlData, 
						data.sintomas || []
					);

					// Calcular puntuación de riesgo usando el método existente
					const puntuacionRiesgo = calcularPuntuacionRiesgo(controlData, data.sintomas, historialControles);

					// Generar recomendaciones usando el método existente
					const recomendaciones = generarRecomendaciones(controlData, data.sintomas, puntuacionRiesgo);

					// Preparar resultado de evaluación
					const alertaDetectada = alertasGeneradas.length > 0;
					const alertaPrincipal = alertasGeneradas[0]; // La de mayor prioridad

					evaluacion = {
						alerta_detectada: alertaDetectada,
						tipo_alerta: alertaPrincipal?.tipo_alerta,
						nivel_prioridad: alertaPrincipal?.nivel_prioridad,
						mensaje: alertaPrincipal?.mensaje,
						puntuacion_riesgo: alertaPrincipal?.score_riesgo || puntuacionRiesgo,
						sintomas_detectados: alertaPrincipal?.sintomas || [],
						factores_riesgo: this.identificarFactoresRiesgo(controlData, data.sintomas),
						recomendaciones: recomendaciones,
						evaluado_en: new Date(),
						version_algoritmo: '2.0.0', // Nueva versión con AutoAlertService
						tiempo_evaluacion_ms: Date.now() - startTime
					};

					console.log(`✅ ControlService: Automatic evaluation completed. Generated ${alertasGeneradas.length} alerts`);

				} catch (alertError) {
					console.error('❌ ControlService: Error in automatic alert evaluation:', alertError);
					
					// Fallback a evaluación básica
					const puntuacionRiesgo = calcularPuntuacionRiesgo(controlData, data.sintomas, historialControles);
					const recomendaciones = generarRecomendaciones(controlData, data.sintomas, puntuacionRiesgo);

					evaluacion = {
						alerta_detectada: false,
						puntuacion_riesgo: puntuacionRiesgo,
						sintomas_detectados: data.sintomas || [],
						factores_riesgo: this.identificarFactoresRiesgo(controlData, data.sintomas),
						recomendaciones: recomendaciones,
						evaluado_en: new Date(),
						version_algoritmo: '2.0.0-fallback',
						tiempo_evaluacion_ms: Date.now() - startTime
					};
				}
			} else {
				// Evaluación básica sin alertas
				evaluacion = {
					alerta_detectada: false,
					puntuacion_riesgo: 0,
					sintomas_detectados: [],
					factores_riesgo: [],
					recomendaciones: [],
					evaluado_en: new Date(),
					version_algoritmo: '1.0.0',
					tiempo_evaluacion_ms: Date.now() - startTime
				};
			}

			return {
				control: {
					id: nuevoControl.id,
					gestante_id: nuevoControl.gestante_id,
					fecha_control: nuevoControl.fecha_control,
					semanas_gestacion: nuevoControl.semanas_gestacion || undefined,
					peso: nuevoControl.peso ? Number(nuevoControl.peso) : undefined,
					presion_sistolica: nuevoControl.presion_sistolica || undefined,
					presion_diastolica: nuevoControl.presion_diastolica || undefined,
					frecuencia_cardiaca: nuevoControl.frecuencia_cardiaca || undefined,
					temperatura: nuevoControl.temperatura ? Number(nuevoControl.temperatura) : undefined,
					recomendaciones: nuevoControl.recomendaciones || undefined,
					created_at: nuevoControl.fecha_creacion
				},
				evaluacion,
				alertas_generadas: alertasGeneradas
			};

		} catch (error) {
			console.error('❌ ControlService: Error creating control with evaluation:', error);
			throw error;
		}
	}

	/**
	 * Identifica factores de riesgo específicos basados en los datos
	 * @param datosControl - Datos del control
	 * @param sintomas - Síntomas reportados
	 * @returns Array de factores de riesgo identificados
	 */
	private identificarFactoresRiesgo(datosControl: any, sintomas?: string[]): string[] {
		const factores: string[] = [];

		// Factores de presión arterial
		if (datosControl.presion_sistolica >= 160 || datosControl.presion_diastolica >= 110) {
			factores.push('Hipertensión severa');
		} else if (datosControl.presion_sistolica >= 140 || datosControl.presion_diastolica >= 90) {
			factores.push('Hipertensión');
		}

		// Factores de frecuencia cardíaca
		if (datosControl.frecuencia_cardiaca >= 120) {
			factores.push('Taquicardia severa');
		} else if (datosControl.frecuencia_cardiaca >= 100) {
			factores.push('Taquicardia');
		}

		// Factores de temperatura
		if (datosControl.temperatura >= 39.0) {
			factores.push('Fiebre alta');
		} else if (datosControl.temperatura >= 38.0) {
			factores.push('Fiebre');
		}

		// Factores obstétricos
		if (datosControl.movimientos_fetales === false) {
			factores.push('Movimientos fetales disminuidos');
		}
		if (datosControl.edemas === true) {
			factores.push('Edemas presentes');
		}

		// Factores por síntomas
		if (sintomas) {
			if (sintomas.some(s => s.includes('sangrado') || s.includes('hemorragia'))) {
				factores.push('Síntomas de hemorragia');
			}
			if (sintomas.some(s => s.includes('dolor_cabeza') || s.includes('vision_borrosa'))) {
				factores.push('Síntomas neurológicos');
			}
			if (sintomas.some(s => s.includes('contracciones') || s.includes('trabajo_parto'))) {
				factores.push('Síntomas de trabajo de parto');
			}
		}

		return factores;
	}

	// NUEVO: Obtener historial de controles de una gestante
	async getHistorialControles(gestanteId: string) {
		console.log(`📊 ControlService: Fetching historial for gestante ${gestanteId}...`);

		const controles = await prisma.controlPrenatal.findMany({
			where: { gestante_id: gestanteId },
			orderBy: { fecha_control: 'asc' }
		}) as any;

		console.log(`📊 ControlService: Found ${controles.length} controles in history`);
		return controles;
	}

	// NUEVO: Obtener datos de evolución para gráficas
	async getEvolucionGestante(gestanteId: string) {
		console.log(`📈 ControlService: Calculating evolution for gestante ${gestanteId}...`);

		const controles = await prisma.controlPrenatal.findMany({
			where: { gestante_id: gestanteId },
			orderBy: { fecha_control: 'asc' },
			select: {
				id: true,
				fecha_control: true,
				semanas_gestacion: true,
				peso: true,
				presion_sistolica: true,
				presion_diastolica: true,
				frecuencia_cardiaca: true,
				temperatura: true,
				altura_uterina: true,
			}
		});

		// Calcular estadísticas
		const evolucion = {
			total_controles: controles.length,
			primer_control: controles[0]?.fecha_control || null,
			ultimo_control: controles[controles.length - 1]?.fecha_control || null,
			datos: controles.map(c => ({
				fecha: c.fecha_control,
				semanas: c.semanas_gestacion,
				peso: c.peso,
				presion: `${c.presion_sistolica}/${c.presion_diastolica}`,
				frecuencia_cardiaca: c.frecuencia_cardiaca,
				temperatura: c.temperatura,
				altura_uterina: c.altura_uterina,
				imc: c.peso && Number(c.peso) > 0 ? this.calcularIMC(Number(c.peso), 1.60) : null // Altura promedio
			})),
			tendencias: {
				peso: this.calcularTendencia(controles.map(c => Number(c.peso))),
				presion_sistolica: this.calcularTendencia(controles.map(c => Number(c.presion_sistolica))),
				presion_diastolica: this.calcularTendencia(controles.map(c => Number(c.presion_diastolica)))
			}
		};

		console.log(`📈 ControlService: Evolution calculated with ${evolucion.total_controles} controls`);
		return evolucion;
	}

	// NUEVO: Calcular IMC
	private calcularIMC(peso: number | null, altura: number): number | null {
		if (!peso || !altura || altura === 0) return null;
		return parseFloat((peso / (altura * altura)).toFixed(2));
	}

	// NUEVO: Calcular tendencia (ascendente, descendente, estable)
	private calcularTendencia(valores: (number | null)[]): string {
		const valoresValidos = valores.filter(v => v !== null) as number[];
		if (valoresValidos.length < 2) return 'insuficiente';

		const primero = valoresValidos[0];
		const ultimo = valoresValidos[valoresValidos.length - 1];
		const diferencia = ultimo - primero;
		const porcentaje = (diferencia / primero) * 100;

		if (Math.abs(porcentaje) < 5) return 'estable';
		return porcentaje > 0 ? 'ascendente' : 'descendente';
	}

	// NUEVO: Obtener control con datos de gestante
	async getControlConGestante(controlId: string) {
		console.log(`🔍 ControlService: Fetching control ${controlId} with gestante data...`);

		const control = await prisma.controlPrenatal.findUnique({
			where: { id: controlId }
		}) as any;

		if (!control) {
			throw new Error(`Control ${controlId} not found`);
		}

		console.log(`✅ ControlService: Control found for gestante ${(control as any).gestante?.nombre || 'desconocida'}`);
		return control;
	}

	// NUEVO: Calcular próximo control recomendado
	async calcularProximoControl(gestanteId: string) {
		console.log(`📅 ControlService: Calculating next control for gestante ${gestanteId}...`);

		const ultimoControl = await prisma.controlPrenatal.findFirst({
			where: { gestante_id: gestanteId },
			orderBy: { fecha_control: 'desc' }
		});

		if (!ultimoControl) {
			return {
				recomendacion: 'Agendar primer control prenatal',
				dias_desde_ultimo: null,
				urgencia: 'alta'
			};
		}

		const diasDesdeUltimo = Math.floor(
			(Date.now() - ultimoControl.fecha_control.getTime()) / (1000 * 60 * 60 * 24)
		);

		let recomendacion = '';
		let urgencia = 'baja';

		if (diasDesdeUltimo > 30) {
			recomendacion = 'Control vencido - Agendar urgente';
			urgencia = 'critica';
		} else if (diasDesdeUltimo > 21) {
			recomendacion = 'Próximo control en los próximos 7 días';
			urgencia = 'alta';
		} else if (diasDesdeUltimo > 14) {
			recomendacion = 'Próximo control en las próximas 2 semanas';
			urgencia = 'media';
		} else {
			recomendacion = 'Control reciente - Próximo en 3-4 semanas';
			urgencia = 'baja';
		}

		console.log(`📅 ControlService: Next control recommendation: ${recomendacion}`);
		return {
			recomendacion,
			dias_desde_ultimo: diasDesdeUltimo,
			urgencia,
			ultimo_control: ultimoControl.fecha_control
		};
	}

	// NUEVO: Obtener controles vencidos o próximos a vencer
	async getControlesVencidos() {
		console.log('⏰ ControlService: Fetching overdue controls');
		
		// Considerar un control como vencido si tiene más de 30 días desde la fecha esperada
		const fechaLimite = new Date();
		fechaLimite.setDate(fechaLimite.getDate() - 30);
		
		try {
			const controles = await prisma.controlPrenatal.findMany({
				where: {
					fecha_control: {
						lt: fechaLimite
					}
					// Eliminado el filtro realizado: false ya que el campo no existe en la tabla
				},
				orderBy: {
					fecha_control: 'asc'
				}
			});
			
			console.log(`⏰ ControlService: Found ${controles.length} overdue controls`);
			return controles;
		} catch (error) {
			console.error('❌ ControlService: Error fetching overdue controls:', error);
			throw error;
		}
	}

	// NUEVO: Obtener controles vencidos por madrina
	async getControlesVencidosByMadrina(madrinaId: string) {
		console.log(`⏰ ControlService: Fetching overdue controls for madrina ${madrinaId}`);
		
		// Considerar un control como vencido si tiene más de 30 días desde la fecha esperada
		const fechaLimite = new Date();
		fechaLimite.setDate(fechaLimite.getDate() - 30);
		
		try {
			// Primero obtener las gestantes asignadas a esta madrina
			const gestantesAsignadas = await prisma.gestante.findMany({
				where: { madrina_id: madrinaId },
				select: { id: true }
			});
			
			const gestanteIds = gestantesAsignadas.map(g => g.id);
			
			const controles = await prisma.controlPrenatal.findMany({
				where: {
					fecha_control: {
						lt: fechaLimite
					},
					// Eliminado el filtro realizado: false ya que el campo no existe en la tabla
					gestante_id: {
						in: gestanteIds
					}
				},
				orderBy: {
					fecha_control: 'asc'
				}
			});
			
			console.log(`⏰ ControlService: Found ${controles.length} overdue controls for madrina ${madrinaId}`);
			return controles;
		} catch (error) {
			console.error('❌ ControlService: Error fetching overdue controls for madrina:', error);
			throw error;
		}
	}

	// NUEVO: Obtener controles pendientes (no realizados)
	async getControlesPendientes() {
		console.log('📋 ControlService: Fetching pending controls');
		
		try {
			// Obtener controles futuros (pendientes)
			const fechaActual = new Date();
			const controles = await prisma.controlPrenatal.findMany({
				where: {
					fecha_control: {
						gte: fechaActual
					}
					// Eliminado el filtro realizado: false ya que el campo no existe en la tabla
				},
				orderBy: {
					fecha_control: 'asc'
				}
			});
			
			console.log(`📋 ControlService: Found ${controles.length} pending controls`);
			return controles;
		} catch (error) {
			console.error('❌ ControlService: Error fetching pending controls:', error);
			throw error;
		}
	}

	// NUEVO: Obtener controles pendientes por madrina
	async getControlesPendientesByMadrina(madrinaId: string) {
		console.log(`📋 ControlService: Fetching pending controls for madrina ${madrinaId}`);
		
		try {
			// Primero obtener las gestantes asignadas a esta madrina
			const gestantesAsignadas = await prisma.gestante.findMany({
				where: { madrina_id: madrinaId },
				select: { id: true }
			});
			
			const gestanteIds = gestantesAsignadas.map(g => g.id);
			
			// Obtener controles futuros (pendientes)
			const fechaActual = new Date();
			const controles = await prisma.controlPrenatal.findMany({
				where: {
					fecha_control: {
						gte: fechaActual
					},
					// Eliminado el filtro realizado: false ya que el campo no existe en la tabla
					gestante_id: {
						in: gestanteIds
					}
				},
				orderBy: {
					fecha_control: 'asc'
				}
			});
			
			console.log(`📋 ControlService: Found ${controles.length} pending controls for madrina ${madrinaId}`);
			return controles;
		} catch (error) {
			console.error('❌ ControlService: Error fetching pending controls for madrina:', error);
			throw error;
		}
	}
}
