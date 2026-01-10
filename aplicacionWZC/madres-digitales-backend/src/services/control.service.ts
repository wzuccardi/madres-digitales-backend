// Servicio para controles prenatales con evaluación automática de alertas
// Todos los datos provienen de la base de datos real, no se usan mocks
import prisma from '../config/database';
import { evaluarSignosAlarma, calcularPuntuacionRiesgo, generarRecomendaciones } from '../utils/alarma_utils';
import ControlRepositoryImpl from '../infrastructure/repositories/control.repository.impl';
import GestanteRepositoryImpl from '../infrastructure/repositories/gestante.repository.impl';
import { CrearControlConEvaluacionDTO, ControlConEvaluacionDTO, ResultadoEvaluacionDTO } from '../types/alerta-automatica.dto';
import { AlertaService } from './alerta.service';
import { AutoAlertService } from './auto-alert.service';
import { AlertRulesEngine } from './alert-rules-engine.service';
import { log } from '../config/logger';

export class ControlService {
	private alertaService: AlertaService;
	private autoAlertService: AutoAlertService;
	private alertRulesEngine: AlertRulesEngine;
	private controlRepo: ControlRepositoryImpl;
	private gestanteRepo: GestanteRepositoryImpl;

	constructor() {
		this.alertaService = new AlertaService();
		this.alertRulesEngine = new AlertRulesEngine();
		this.controlRepo = new ControlRepositoryImpl();
		this.gestanteRepo = new GestanteRepositoryImpl();
		this.autoAlertService = new AutoAlertService(new (require('../infrastructure/repositories/alerta.repository.impl').default)(), this.controlRepo, this.alertRulesEngine);
	}
	// MÉTODO ORIGINAL - SOLO PARA ADMINISTRADORES
	async getAllControles() {
		log.info('ControlService: Fetching all controles (ADMIN ONLY)');
		const controles = await this.controlRepo.findMany();
		log.info(`ControlService: Found ${controles.length} controles`);
		return controles;
	}

	// NUEVO MÉTODO - FILTRADO POR MADRINA (SEGURIDAD)
	async getControlesByMadrina(madrinaId: string) {
		log.info(`ControlService: Fetching controles for madrina ${madrinaId}`);

		// Primero obtenemos los IDs de las gestantes asignadas a esta madrina
		const gestantesAsignadas = await prisma.gestantes.findMany({
			where: { madrina_id: madrinaId },
			select: { id: true }
		});

		const gestanteIds = gestantesAsignadas.map(g => g.id);
		log.info(`ControlService: Found ${gestanteIds.length} gestantes for madrina ${madrinaId}`);

		if (gestanteIds.length === 0) {
			log.info(`ControlService: No gestantes found for madrina ${madrinaId}, returning empty array`);
			return [];
		}

		// Luego obtenemos los controles de esas gestantes
		const controles = (await Promise.all(gestanteIds.map(id => this.controlRepo.findMany({ gestante_id: id })))).flat().sort((a,b)=>b.fecha_control.getTime()-a.fecha_control.getTime());

		log.info(`ControlService: Found ${controles.length} controles for madrina ${madrinaId}`);
		return controles;
	}

	async getControlById(id: string) {
		 return this.controlRepo.findById(id);
	}

	async createControl(data: any) {
		 return this.controlRepo.create(data);
	}

	async updateControl(id: string, data: any) {
		 return this.controlRepo.update(id, data);
	}

	async deleteControl(id: string) {
		 await this.controlRepo.delete(id);
		 return { id } as any;
	}

	// Método auxiliar para calcular semanas de gestación
	private calcularSemanasGestacion(fechaUltimaMenstruacion: Date | null, fechaControl: Date): number | null {
		if (!fechaUltimaMenstruacion) {
			log.warn('No se puede calcular semanas de gestación: FUM no disponible');
			return null;
		}

		const fum = new Date(fechaUltimaMenstruacion);
		const control = new Date(fechaControl);
		
		// Calcular diferencia en milisegundos
		const diferenciaMilisegundos = control.getTime() - fum.getTime();
		
		// Convertir a días
		const diferenciaDias = Math.floor(diferenciaMilisegundos / (1000 * 60 * 60 * 24));
		
		// Convertir a semanas (redondeado)
		const semanas = Math.floor(diferenciaDias / 7);
		
		// Validar rango (0-42 semanas)
		if (semanas < 0 || semanas > 42) {
			log.warn(`Semanas de gestación fuera de rango: ${semanas}. FUM: ${fum.toISOString()}, Control: ${control.toISOString()}`);
			return null;
		}
		
		log.info(`Semanas de gestación calculadas: ${semanas} (FUM: ${fum.toISOString().split('T')[0]}, Control: ${control.toISOString().split('T')[0]})`);
		return semanas;
	}

	// Método para crear control con validaciones
	async createControlCompleto(data: any) {
		log.info('ControlService: Creating new control');
		log.debug('Data received', { data });

		try {
			// Validar que la gestante existe
			const gestante = await this.gestanteRepo.findById(data.gestante_id);

			if (!gestante) {
				throw new Error(`No se encontró gestante con ID ${data.gestante_id}`);
			}

			// Calcular semanas de gestación automáticamente si no se proporciona o es 0
			let semanasGestacion = data.semanas_gestacion ? parseInt(data.semanas_gestacion.toString()) : null;
			
			if (!semanasGestacion || semanasGestacion === 0) {
				semanasGestacion = this.calcularSemanasGestacion(
					gestante.fecha_ultima_menstruacion,
					new Date(data.fecha_control)
				);
				log.info(`Semanas de gestación calculadas automáticamente: ${semanasGestacion}`);
			}

			// Crear el control con todos los campos
			const newControl = await this.controlRepo.create({
				gestante_id: data.gestante_id,
				medico_id: data.medico_id || 'c66fdb18-76f4-4767-95ad-9b4b81fa6add',
				fecha_control: new Date(data.fecha_control),
				semanas_gestacion: semanasGestacion,
				peso: data.peso ? parseFloat(data.peso.toString()) : null,
				presion_sistolica: data.presion_sistolica ? parseInt(data.presion_sistolica.toString()) : null,
				presion_diastolica: data.presion_diastolica ? parseInt(data.presion_diastolica.toString()) : null,
				frecuencia_cardiaca: data.frecuencia_cardiaca ? parseInt(data.frecuencia_cardiaca.toString()) : null,
				frecuencia_respiratoria: data.frecuencia_respiratoria ? parseInt(data.frecuencia_respiratoria.toString()) : null,
				temperatura: data.temperatura ? parseFloat(data.temperatura.toString()) : null,
				altura_uterina: data.altura_uterina ? parseFloat(data.altura_uterina.toString()) : null,
				// Convertir booleanos a strings esperados por el schema
				movimientos_fetales: data.movimientos_fetales ? (typeof data.movimientos_fetales === 'string' ? data.movimientos_fetales : 'presentes') : 'ausentes',
				edemas: data.edemas ? (typeof data.edemas === 'string' ? data.edemas : 'presentes') : 'ausentes',
				proteinuria: data.proteinuria || null,
				glucosuria: data.glucosuria || null,
				hallazgos: data.hallazgos || null,
				recomendaciones: data.recomendaciones || null,
				observaciones: data.observaciones || null,
				proximo_control: data.proximo_control ? new Date(data.proximo_control) : null,
				examenes_solicitados: data.examenes_solicitados || null,
				resultados_examenes: data.resultados_examenes || null,
			});

			log.info(`ControlService: Control created with ID: ${newControl.id}`);

			// 🚨 EVALUACIÓN AUTOMÁTICA DE ALERTAS
			try {
				log.info(`🔍 Evaluando alertas automáticas para control ${newControl.id}`);
				
				// Preparar datos del control para evaluación
				const controlData = {
					gestante_id: newControl.gestante_id,
					presion_sistolica: newControl.presion_sistolica,
					presion_diastolica: newControl.presion_diastolica,
					peso: newControl.peso,
					semanas_gestacion: newControl.semanas_gestacion
				};
				
				// Evaluar y crear alertas automáticas
				const alertasGeneradas = await this.autoAlertService.evaluateAndCreateAlert(controlData, []);
				
				if (alertasGeneradas && alertasGeneradas.length > 0) {
					log.info(`✅ ${alertasGeneradas.length} alertas generadas automáticamente`);
					alertasGeneradas.forEach(alerta => {
						log.info(`📊 Alerta: ${alerta.tipo_alerta} - Prioridad: ${alerta.nivel_prioridad}`);
					});
				} else {
					log.info(`✅ Control evaluado - Sin alertas generadas`);
				}
			} catch (alertError) {
				log.error('❌ Error evaluando alertas automáticas:', alertError);
				// No fallar la creación del control si falla la evaluación de alertas
			}

			return newControl;
		} catch (error) {
			log.error('ControlService: Error creating control', { error: error.message });
			throw error;
		}
	}

	// Método para actualizar control con validaciones
	async updateControlCompleto(id: string, data: any) {
		log.info(`ControlService: Updating control ${id}`);
		log.debug('Data received', { data });

		try {
			// Verificar que el control existe
			const existingControl = await this.controlRepo.findById(id);

			if (!existingControl) {
				throw new Error(`No se encontró control con ID ${id}`);
			}

			// Si se está cambiando la gestante, verificar que existe
			if (data.gestante_id && data.gestante_id !== existingControl.gestante_id) {
				const gestante = await this.gestanteRepo.findById(data.gestante_id);

				if (!gestante) {
					throw new Error(`No se encontró gestante con ID ${data.gestante_id}`);
				}
			}

			// Actualizar el control
			const updatedControl = await this.controlRepo.update(id, {
				gestante_id: data.gestante_id || existingControl!.gestante_id,
				medico_id: data.medico_id !== undefined ? data.medico_id : existingControl!.medico_id || undefined,
				fecha_control: data.fecha_control ? new Date(data.fecha_control) : existingControl!.fecha_control,
				semanas_gestacion: data.semanas_gestacion !== undefined ? (data.semanas_gestacion ? parseInt(data.semanas_gestacion.toString()) : null) : existingControl!.semanas_gestacion || undefined,
				peso: data.peso !== undefined ? (data.peso ? parseFloat(data.peso.toString()) : null) : existingControl!.peso || undefined,
				presion_sistolica: data.presion_sistolica !== undefined ? (data.presion_sistolica ? parseInt(data.presion_sistolica.toString()) : null) : existingControl!.presion_sistolica || undefined,
				presion_diastolica: data.presion_diastolica !== undefined ? (data.presion_diastolica ? parseInt(data.presion_diastolica.toString()) : null) : existingControl!.presion_diastolica || undefined,
			});

			log.info(`ControlService: Control ${id} updated successfully`);

			// 🚨 EVALUACIÓN AUTOMÁTICA DE ALERTAS
			try {
				log.info(`🔍 Evaluando alertas automáticas para control actualizado ${id}`);
				
				// Preparar datos del control para evaluación
				const controlData = {
					gestante_id: updatedControl.gestante_id,
					presion_sistolica: updatedControl.presion_sistolica,
					presion_diastolica: updatedControl.presion_diastolica,
					peso: updatedControl.peso,
					semanas_gestacion: updatedControl.semanas_gestacion
				};
				
				// Evaluar y crear alertas automáticas
				const alertasGeneradas = await this.autoAlertService.evaluateAndCreateAlert(controlData, []);
				
				if (alertasGeneradas && alertasGeneradas.length > 0) {
					log.info(`✅ ${alertasGeneradas.length} alertas generadas automáticamente`);
					alertasGeneradas.forEach(alerta => {
						log.info(`📊 Alerta: ${alerta.tipo_alerta} - Prioridad: ${alerta.nivel_prioridad}`);
					});
				} else {
					log.info(`✅ Control evaluado - Sin alertas generadas`);
				}
			} catch (alertError) {
				log.error('❌ Error evaluando alertas automáticas:', alertError);
				// No fallar la actualización del control si falla la evaluación de alertas
			}

			return updatedControl;
		} catch (error) {
			log.error(`ControlService: Error updating control ${id}`, { error: error.message });
			throw error;
		}
	}

	// Método para obtener controles por gestante
	async getControlesByGestante(gestanteId: string) {
		log.info(`ControlService: Fetching controls for gestante ${gestanteId}`);
		const controles = await this.controlRepo.findMany({ gestante_id: gestanteId });
		log.info(`ControlService: Found ${controles.length} controls for gestante`);
		return controles;
	}

	// ==================== NUEVOS MÉTODOS CON EVALUACIÓN AUTOMÁTICA ====================

	/**
	 * Crear control prenatal con evaluación automática de alertas
	 * @param data - Datos del control con configuración de evaluación
	 * @returns Control creado con resultado de evaluación y alertas generadas
	 */
	async createControlConEvaluacion(data: CrearControlConEvaluacionDTO): Promise<ControlConEvaluacionDTO> {
		log.info('ControlService: Creating control with automatic alert evaluation');
		log.debug('Data received', { data });

		log.debug('Analyzing mapping inconsistencies', {
			medico_id: data.medico_id,
			medico_id_tipo: typeof data.medico_id
		});
		
		log.debug('Boolean fields', {
			movimientos_fetales: data.movimientos_fetales,
			movimientos_fetales_tipo: typeof data.movimientos_fetales,
			edemas: data.edemas,
			edemas_tipo: typeof data.edemas
		});

		const startTime = Date.now();

		try {
			// Validar que la gestante existe
			const gestante = await prisma.gestantes.findUnique({
				where: { id: data.gestante_id }
			});

			if (!gestante) {
				throw new Error(`No se encontró gestante con ID ${data.gestante_id}`);
			}

			// Obtener historial de controles si se solicita
			let historialControles: any[] = [];
			if (data.incluir_historial) {
				historialControles = await this.controlRepo.findLastForGestante(data.gestante_id, 5);
			}

			// Calcular semanas de gestación automáticamente si no se proporciona o es 0
			let semanasGestacion = data.semanas_gestacion || null;
			
			if (!semanasGestacion || semanasGestacion === 0) {
				semanasGestacion = this.calcularSemanasGestacion(
					gestante.fecha_ultima_menstruacion,
					new Date(data.fecha_control)
				);
				log.info(`Semanas de gestación calculadas automáticamente: ${semanasGestacion}`);
			}

			// Preparar datos para creación con logging detallado
			const controlData = {
				gestante_id: data.gestante_id,
				medico_id: data.medico_id || 'c66fdb18-76f4-4767-95ad-9b4b81fa6add', // Usuario por defecto (admin)
				fecha_control: new Date(data.fecha_control),
				semanas_gestacion: semanasGestacion,
				peso: data.peso || null,
				presion_sistolica: data.presion_sistolica || null,
				presion_diastolica: data.presion_diastolica || null,
				frecuencia_cardiaca: data.frecuencia_cardiaca || null,
				frecuencia_respiratoria: data.frecuencia_respiratoria || null,
				temperatura: data.temperatura || null,
				altura_uterina: data.altura_uterina || null,
				// Convertir booleanos a strings esperados por el schema
				movimientos_fetales: data.movimientos_fetales ? (typeof data.movimientos_fetales === 'string' ? data.movimientos_fetales : 'presentes') : 'ausentes',
				edemas: data.edemas ? (typeof data.edemas === 'string' ? data.edemas : 'presentes') : 'ausentes',
				proteinuria: data.proteinuria || null,
				glucosuria: data.glucosuria || null,
				hallazgos: data.hallazgos || null,
				recomendaciones: data.recomendaciones || null,
				observaciones: data.observaciones || null,
				proximo_control: data.proximo_control ? new Date(data.proximo_control) : null,
				examenes_solicitados: data.examenes_solicitados || null,
				resultados_examenes: data.resultados_examenes || null,
				// Campos MEOWS si están presentes
				meows_score: data.meows_score || null,
				meows_alert_level: data.meows_alert_level || null,
				meows_component_scores: data.meows_component_scores || null,
				meows_triggered_alerts: data.meows_triggered_alerts || null,
				meows_recommendations: data.meows_recommendations || null,
				nivel_conciencia: data.nivel_conciencia || null,
				sangrado_ml: data.sangrado_ml || null,
				sintomas_neurologicos: data.sintomas_neurologicos || false,
				tiene_sepsis: data.tiene_sepsis || false,
			};

			log.debug('Data for creating control', { controlData });

			// Crear el control
			const nuevoControl = await this.controlRepo.create(controlData as any);

			log.info(`ControlService: Control created with ID: ${nuevoControl.id}`);

			// Realizar evaluación automática si está habilitada
			let evaluacion: ResultadoEvaluacionDTO;
			let alertasGeneradas: any[] = [];

			if (data.evaluar_automaticamente !== false) { // Por defecto true
				log.info('ControlService: Performing automatic alert evaluation');

				// Preparar datos para evaluación usando el nuevo AutoAlertService
				const controlEvalData = {
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
						controlEvalData, 
						data.sintomas || []
					);

					// Calcular puntuación de riesgo usando el método existente
					const puntuacionRiesgo = calcularPuntuacionRiesgo(controlEvalData, data.sintomas, historialControles);

					// Generar recomendaciones usando el método existente
					const recomendaciones = generarRecomendaciones(controlEvalData, data.sintomas, puntuacionRiesgo);

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
						factores_riesgo: this.identificarFactoresRiesgo(controlEvalData, data.sintomas),
						recomendaciones: recomendaciones,
						evaluado_en: new Date(),
						version_algoritmo: '2.0.0', // Nueva versión con AutoAlertService
						tiempo_evaluacion_ms: Date.now() - startTime
					};

					log.info(`ControlService: Automatic evaluation completed. Generated ${alertasGeneradas.length} alerts`);

				} catch (alertError) {
					log.error('ControlService: Error in automatic alert evaluation', { error: alertError.message });
					
					// Fallback a evaluación básica
					const puntuacionRiesgo = calcularPuntuacionRiesgo(controlEvalData, data.sintomas, historialControles);
					const recomendaciones = generarRecomendaciones(controlData, data.sintomas, puntuacionRiesgo);

					evaluacion = {
						alerta_detectada: false,
						puntuacion_riesgo: puntuacionRiesgo,
						sintomas_detectados: data.sintomas || [],
						factores_riesgo: this.identificarFactoresRiesgo(controlEvalData, data.sintomas),
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
					created_at: nuevoControl.fecha_creacion // Corregido: usar fecha_creacion consistently
				},
				evaluacion,
				alertas_generadas: alertasGeneradas
			};

		} catch (error) {
			log.error('ControlService: Error creating control with evaluation', { error: error.message });
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
		log.info(`ControlService: Fetching historial for gestante ${gestanteId}`);

		const controles = await prisma.control_prenatal.findMany({
			where: { gestante_id: gestanteId },
			orderBy: { fecha_control: 'asc' }
		});

		log.info(`ControlService: Found ${controles.length} controles in history`);
		return controles;
	}

	// NUEVO: Obtener datos de evolución para gráficas
	async getEvolucionGestante(gestanteId: string) {
		log.info(`ControlService: Calculating evolution for gestante ${gestanteId}`);

		const controles = await prisma.control_prenatal.findMany({
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

		log.info(`ControlService: Evolution calculated with ${evolucion.total_controles} controls`);
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
		log.info(`ControlService: Fetching control ${controlId} with gestante data`);

		const control = await prisma.control_prenatal.findUnique({
			where: { id: controlId }
		});

		if (!control) {
			throw new Error(`Control ${controlId} not found`);
		}

		log.info(`ControlService: Control found for gestante ${(control as any).gestante?.nombre || 'desconocida'}`);
		return control;
	}

	// NUEVO: Calcular próximo control recomendado
	async calcularProximoControl(gestanteId: string) {
		log.info(`ControlService: Calculating next control for gestante ${gestanteId}`);

		const ultimoControl = await prisma.control_prenatal.findFirst({
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

		log.info(`ControlService: Next control recommendation: ${recomendacion}`);
		return {
			recomendacion,
			dias_desde_ultimo: diasDesdeUltimo,
			urgencia,
			ultimo_control: ultimoControl.fecha_control
		};
	}

	// NUEVO: Obtener controles vencidos o próximos a vencer
	async getControlesVencidos() {
		log.info('ControlService: Fetching overdue controls');
		
		// Considerar un control como vencido si tiene más de 30 días desde la fecha esperada
		const fechaLimite = new Date();
		fechaLimite.setDate(fechaLimite.getDate() - 30);
		
		try {
			const controles = await prisma.control_prenatal.findMany({
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
			
			log.info(`ControlService: Found ${controles.length} overdue controls`);
			return controles;
		} catch (error) {
			log.error('ControlService: Error fetching overdue controls', { error: error.message });
			throw error;
		}
	}

	// NUEVO: Obtener controles vencidos por madrina
	async getControlesVencidosByMadrina(madrinaId: string) {
		log.info(`ControlService: Fetching overdue controls for madrina ${madrinaId}`);
		
		// Considerar un control como vencido si tiene más de 30 días desde la fecha esperada
		const fechaLimite = new Date();
		fechaLimite.setDate(fechaLimite.getDate() - 30);
		
		try {
			// Primero obtener las gestantes asignadas a esta madrina
			const gestantesAsignadas = await this.gestanteRepo.findMany({ madrinaId });
			
			const gestanteIds = gestantesAsignadas.map(g => g.id);
			
			const controles = (await Promise.all(gestanteIds.map(id => this.controlRepo.findMany({ gestante_id: id, fecha_lte: fechaLimite })))).flat().sort((a,b)=>a.fecha_control.getTime()-b.fecha_control.getTime());
			
			log.info(`ControlService: Found ${controles.length} overdue controls for madrina ${madrinaId}`);
			return controles;
		} catch (error) {
			log.error('ControlService: Error fetching overdue controls for madrina', { error: error.message });
			throw error;
		}
	}

	// NUEVO: Obtener controles pendientes (no realizados)
	async getControlesPendientes() {
		log.info('ControlService: Fetching pending controls');
		
		try {
			// Obtener controles futuros (pendientes)
			const fechaActual = new Date();
		const controles = await this.controlRepo.findPending(fechaActual);
			
			log.info(`ControlService: Found ${controles.length} pending controls`);
			return controles;
		} catch (error) {
			log.error('ControlService: Error fetching pending controls', { error: error.message });
			throw error;
		}
	}

	// NUEVO: Obtener controles pendientes por madrina
	async getControlesPendientesByMadrina(madrinaId: string) {
		log.info(`ControlService: Fetching pending controls for madrina ${madrinaId}`);
		
		try {
			// Primero obtener las gestantes asignadas a esta madrina
			const gestantesAsignadas = await this.gestanteRepo.findMany({ madrinaId });
			
			const gestanteIds = gestantesAsignadas.map(g => g.id);
			
			// Obtener controles futuros (pendientes)
			const fechaActual = new Date();
			const controles = (await Promise.all(gestanteIds.map(id => this.controlRepo.findMany({ gestante_id: id, fecha_gte: fechaActual })))).flat().sort((a,b)=>a.fecha_control.getTime()-b.fecha_control.getTime());
			
			log.info(`ControlService: Found ${controles.length} pending controls for madrina ${madrinaId}`);
			return controles;
		} catch (error) {
			log.error('ControlService: Error fetching pending controls for madrina', { error: error.message });
			throw error;
		}
	}
}
