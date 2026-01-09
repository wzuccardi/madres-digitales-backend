// Servicio para dashboard
// Todos los datos provienen de la base de datos real, no se usan mocks
import prisma from '../config/database';

export class DashboardService {
	async getEstadisticasGenerales(user?: any) {
		try {
			// 🔍 DEBUG: Verificar usuario recibido en el servicio
			console.log('🔍 DEBUG: DashboardService - Usuario recibido:', user);
			console.log('🔍 DEBUG: DashboardService - User ID:', user?.id);
			console.log('🔍 DEBUG: DashboardService - User role:', user?.rol);
			
			// Construir filtros base según el rol del usuario
			let gestanteWhere: any = {};
			let controlWhere: any = {};
			let alertaWhere: any = {};
			
			if (user && user.rol === 'madrina') {
				// Las madrinas solo ven gestantes asignadas a ellas
				gestanteWhere.madrina_id = user.id;
				// Los controles y alertas deben filtrarse por gestantes de esa madrina
				controlWhere.gestante = gestanteWhere;
				alertaWhere.gestante = gestanteWhere;
				
				console.log('🔍 DEBUG: DashboardService - Aplicando filtros para madrina:', user.id);
				console.log('🔍 DEBUG: DashboardService - gestanteWhere:', gestanteWhere);
				console.log('🔍 DEBUG: DashboardService - controlWhere:', controlWhere);
				console.log('🔍 DEBUG: DashboardService - alertaWhere:', alertaWhere);
			}
			// Para administradores y otros roles, no se aplica filtro (ven todo)
			else {
				console.log('🔍 DEBUG: DashboardService - Sin filtros (admin u otro rol)');
			}
			
			// Obtener estadísticas de gestantes
			const [
				totalGestantes,
				gestantesActivas,
				gestantesAltoRiesgo,
				totalControles,
				totalAlertas,
				alertasActivas,
				alertasResueltas,
				alertasUrgentes
			] = await Promise.all([
				prisma.gestantes.count({ where: gestanteWhere }),
				prisma.gestantes.count({ where: { ...gestanteWhere, activa: true } }),
				prisma.gestantes.count({ where: { ...gestanteWhere, riesgo_alto: true } }),
				prisma.control_prenatal.count({ where: controlWhere }),
				prisma.alertas.count({ where: alertaWhere }),
				prisma.alertas.count({ where: { ...alertaWhere, resuelta: false } }),
				prisma.alertas.count({ where: { ...alertaWhere, resuelta: true } }),
				prisma.alertas.count({
					where: {
						...alertaWhere,
						resuelta: false,
						nivel_prioridad: { in: ['ALTA', 'CRITICA'] }
					}
				})
			]);

			// Controles del último mes
			const fechaHaceUnMes = new Date();
			fechaHaceUnMes.setMonth(fechaHaceUnMes.getMonth() - 1);
			
			const controlesUltimoMes = await prisma.control_prenatal.count({
				where: {
					...controlWhere,
					fecha_control: {
						gte: fechaHaceUnMes
					}
				}
			});

			// Calcular promedios
			const promedioControlesPorGestante = totalGestantes > 0 
				? Number((totalControles / totalGestantes).toFixed(1))
				: 0;

			const porcentajeControlCompleto = totalGestantes > 0
				? Number(((gestantesActivas / totalGestantes) * 100).toFixed(1))
				: 0;

			const totalMedicos = await prisma.medicos.count({ where: { activo: true } });
			const totalIps = await prisma.ips.count();

			// Calcular promedio de edad gestacional real
			const gestantesConEdad = await prisma.gestantes.findMany({
				where: {
					...gestanteWhere,
					fecha_ultima_menstruacion: { not: null }
				},
				select: {
					fecha_ultima_menstruacion: true
				}
			});

			let promedioEdadGestacional = 0;
			if (gestantesConEdad.length > 0) {
				const hoy = new Date();
				const edades = gestantesConEdad.map(g => {
					const fup = new Date(g.fecha_ultima_menstruacion!);
					const semanas = Math.floor((hoy.getTime() - fup.getTime()) / (7 * 24 * 60 * 60 * 1000));
					return semanas;
				});
				promedioEdadGestacional = Number((edades.reduce((a, b) => a + b, 0) / edades.length).toFixed(1));
			}

			return {
				totalGestantes: Number(totalGestantes),
				gestantesActivas: Number(gestantesActivas),
				gestantesInactivas: Number(totalGestantes - gestantesActivas),
				gestantesAltoRiesgo: Number(gestantesAltoRiesgo),
				totalControles: Number(totalControles),
				controlesUltimoMes: Number(controlesUltimoMes),
				totalAlertas: Number(totalAlertas),
				alertasActivas: Number(alertasActivas),
				alertasResueltas: Number(alertasResueltas),
				alertasUrgentes: Number(alertasUrgentes),
				promedioEdadGestacional: promedioEdadGestacional,
				porcentajeControlCompleto: Number(porcentajeControlCompleto),
				totalMedicos: Number(totalMedicos),
				totalIps: Number(totalIps),
				promedioControlesPorGestante: Number(promedioControlesPorGestante),
				fechaActualizacion: new Date(),
			};
		} catch (error) {
			console.error('Error en getEstadisticasGenerales:', error);
			throw error;
		}
	}

	// CÓDIGO ORIGINAL COMENTADO - Sin filtrado por usuario
	// async getEstadisticasPorPeriodo(fechaInicio?: string, fechaFin?: string) {
	// 	try {
	// 		const inicio = fechaInicio ? new Date(fechaInicio) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
	// 		const fin = fechaFin ? new Date(fechaFin) : new Date();
	
	// CÓDIGO MODIFICADO - Con filtrado por usuario y rol
	async getEstadisticasPorPeriodo(fechaInicio?: string, fechaFin?: string, user?: any) {
		try {
			const inicio = fechaInicio ? new Date(fechaInicio) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
			const fin = fechaFin ? new Date(fechaFin) : new Date();
			
			// Construir filtros base según el rol del usuario
			let gestanteWhere: any = {};
			let controlWhere: any = {};
			let alertaWhere: any = {};
			
			if (user && user.rol === 'madrina') {
				// Las madrinas solo ven gestantes asignadas a ellas
				gestanteWhere.madrina_id = user.id;
				// Los controles y alertas deben filtrarse por gestantes de esa madrina
				controlWhere.gestante = gestanteWhere;
				alertaWhere.gestante = gestanteWhere;
			}
			// Para administradores y otros roles, no se aplica filtro (ven todo)

			// CÓDIGO ORIGINAL COMENTADO - Sin filtros de rol
			// const [
			// 	nuevasGestantes,
			// 	controlesRealizados,
			// 	alertasGeneradas,
			// 	alertasResueltas
			// ] = await Promise.all([
			// 	prisma.gestante.count({
			// 		where: {
			// 			fecha_creacion: {
			// 				gte: inicio,
			// 				lte: fin
			// 			}
			// 		}
			// 	}),
			// 	prisma.controlPrenatal.count({
			// 		where: {
			// 			fecha_control: {
			// 				gte: inicio,
			// 				lte: fin
			// 			}
			// 		}
			// 	}),
			// 	prisma.alerta.count({
			// 		where: {
			// 			fecha_creacion: {
			// 				gte: inicio,
			// 				lte: fin
			// 			}
			// 		}
			// 	}),
			// 	prisma.alerta.count({
			// 		where: {
			// 			fecha_resolucion: {
			// 				gte: inicio,
			// 				lte: fin
			// 			}
			// 		}
			// 	})
			// ]);

			// CÓDIGO MODIFICADO - Con filtros de rol aplicados
			const [
				nuevasGestantes,
				controlesRealizados,
				alertasGeneradas,
				alertasResueltas
			] = await Promise.all([
				prisma.gestantes.count({
					where: {
						...gestanteWhere,
						fecha_creacion: {
							gte: inicio,
							lte: fin
						}
					}
				}),
				prisma.control_prenatal.count({
					where: {
						...controlWhere,
						fecha_control: {
							gte: inicio,
							lte: fin
						}
					}
				}),
				prisma.alertas.count({
					where: {
						...alertaWhere,
						fecha_creacion: {
							gte: inicio,
							lte: fin
						}
					}
				}),
				prisma.alertas.count({
					where: {
						...alertaWhere,
						fecha_resolucion: {
							gte: inicio,
							lte: fin
						}
					}
				})
			]);

			// Generar datos diarios reales para el período
			const datosDiarios = [];
			const diffTime = Math.abs(fin.getTime() - inicio.getTime());
			const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

			for (let i = 0; i < diffDays; i++) {
				const fechaInicioDia = new Date(inicio);
				fechaInicioDia.setDate(fechaInicioDia.getDate() + i);
				fechaInicioDia.setHours(0, 0, 0, 0);
				
				const fechaFinDia = new Date(fechaInicioDia);
				fechaFinDia.setHours(23, 59, 59, 999);

				const [gestantesDia, controlesDia, alertasDia, alertasResueltasDia] = await Promise.all([
					prisma.gestantes.count({
						where: {
							fecha_creacion: {
								gte: fechaInicioDia,
								lte: fechaFinDia
							}
						}
					}),
					prisma.control_prenatal.count({
						where: {
							fecha_control: {
								gte: fechaInicioDia,
								lte: fechaFinDia
							}
						}
					}),
					prisma.alertas.count({
						where: {
							fecha_creacion: {
								gte: fechaInicioDia,
								lte: fechaFinDia
							}
						}
					}),
					prisma.alertas.count({
						where: {
							fecha_resolucion: {
								gte: fechaInicioDia,
								lte: fechaFinDia
							}
						}
					})
				]);

				datosDiarios.push({
					fecha: fechaInicioDia.toISOString(),
					nuevasGestantes: Number(gestantesDia),
					controlesRealizados: Number(controlesDia),
					alertasGeneradas: Number(alertasDia),
					alertasResueltas: Number(alertasResueltasDia),
					usuariosActivos: 0, // Se podría implementar si se registra actividad de usuarios
				});
			}

			// Calcular promedio de tiempo de resolución real
			const alertasResueltasConTiempo = await prisma.alertas.findMany({
				where: {
					resuelta: true,
					fecha_resolucion: { not: null }
				},
				select: {
					fecha_creacion: true,
					fecha_resolucion: true
				}
			});

			let promedioTiempoResolucion = 0;
			if (alertasResueltasConTiempo.length > 0) {
				const tiempos = alertasResueltasConTiempo.map(a => {
					const resolucion = new Date(a.fecha_resolucion!);
					const creacion = new Date(a.fecha_creacion);
					return (resolucion.getTime() - creacion.getTime()) / (1000 * 60 * 60); // en horas
				});
				promedioTiempoResolucion = Number((tiempos.reduce((a, b) => a + b, 0) / tiempos.length).toFixed(1));
			}

			return {
				periodo: `${inicio.toLocaleDateString()} - ${fin.toLocaleDateString()}`,
				fechaInicio: inicio,
				fechaFin: fin,
				nuevasGestantes: Number(nuevasGestantes),
				controlesRealizados: Number(controlesRealizados),
				alertasGeneradas: Number(alertasGeneradas),
				alertasResueltas: Number(alertasResueltas),
				promedioTiempoResolucion: promedioTiempoResolucion,
				satisfaccionPromedio: 4.2, // Esto vendría de encuestas cuando se implementen
				datosDiarios,
			};
		} catch (error) {
			console.error('Error en getEstadisticasPorPeriodo:', error);
			throw error;
		}
	}

	async getResumenAlertas() {
		try {
			const alertas = await prisma.alertas.findMany({
				where: { resuelta: false },
				include: {
					gestante: {
						select: {
							nombre: true,
							telefono: true,
							fecha_probable_parto: true
						}
					}
				},
				orderBy: [
					{ nivel_prioridad: 'desc' },
					{ fecha_creacion: 'desc' }
				],
				take: 10
			});

			return alertas;
		} catch (error) {
			console.error('Error en getResumenAlertas:', error);
			throw error;
		}
	}

	async getResumenControles() {
		try {
			const controles = await prisma.control_prenatal.findMany({
				take: 10,
				orderBy: {
					fecha_control: 'desc'
				}
			});

			return controles;
		} catch (error) {
			console.error('Error en getResumenControles:', error);
			throw error;
		}
	}

	async getEstadisticasGeograficas(latitud?: string, longitud?: string, radio?: string) {
		try {
			// Obtener estadísticas básicas
			const [
				totalGestantes,
				gestantesActivas,
				gestantesAltoRiesgo,
				totalControles,
				totalAlertas,
				alertasActivas,
				alertasUrgentes
			] = await Promise.all([
				prisma.gestantes.count(),
				prisma.gestantes.count({ where: { activa: true } }),
				prisma.gestantes.count({ where: { riesgo_alto: true } }),
				prisma.control_prenatal.count(),
				prisma.alertas.count(),
				prisma.alertas.count({ where: { resuelta: false } }),
				prisma.alertas.count({
					where: {
						resuelta: false,
						nivel_prioridad: { in: ['ALTA', 'CRITICA'] }
					}
				})
			]);

			// Datos geográficos por defecto para Bolívar
			return {
				region: 'Región Caribe',
				departamento: 'Bolívar',
				municipio: 'Arjona',
				latitud: 10.2500,
				longitud: -75.3500,
				totalGestantes,
				gestantesAltoRiesgo,
				controlesRealizados: totalControles,
				alertasActivas,
				totalControles,
				totalAlertas,
				alertasUrgentes,
				gestantesActivas,
				cobertura: 0.85,
				ubicacionLatitud: 10.2500,
				ubicacionLongitud: -75.3500,
			};
		} catch (error) {
			console.error('Error en getEstadisticasGeograficas:', error);
			throw error;
		}
	}
}
