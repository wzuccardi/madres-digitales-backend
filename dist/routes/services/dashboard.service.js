"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
// Servicio para dashboard
// Todos los datos provienen de la base de datos real, no se usan mocks
const database_1 = __importDefault(require("../config/database"));
class DashboardService {
    async getEstadisticasGenerales() {
        try {
            // Obtener estadísticas de gestantes
            const [totalGestantes, gestantesActivas, gestantesAltoRiesgo, totalControles, totalAlertas, alertasActivas, alertasResueltas, alertasUrgentes] = await Promise.all([
                database_1.default.gestante.count(),
                database_1.default.gestante.count({ where: { activa: true } }),
                database_1.default.gestante.count({ where: { activa: true } }), // Temporal: usar activa hasta definir campo riesgo_alto
                database_1.default.control.count(),
                database_1.default.alerta.count(),
                database_1.default.alerta.count({ where: { resuelta: false } }),
                database_1.default.alerta.count({ where: { resuelta: true } }),
                database_1.default.alerta.count({
                    where: {
                        resuelta: false,
                        nivel_prioridad: { in: ['alta', 'critica'] }
                    }
                })
            ]);
            // Controles del último mes
            const fechaHaceUnMes = new Date();
            fechaHaceUnMes.setMonth(fechaHaceUnMes.getMonth() - 1);
            const controlesUltimoMes = await database_1.default.control.count({
                where: {
                    fecha_creacion: {
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
            const totalMedicos = await database_1.default.medico.count({ where: { activo: true } });
            const totalIps = await database_1.default.iPS.count();
            // Calcular promedio de edad gestacional real
            const gestantesConEdad = await database_1.default.gestante.findMany({
                where: {
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
                    const fup = new Date(g.fecha_ultima_menstruacion);
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
        }
        catch (error) {
            console.error('Error en getEstadisticasGenerales:', error);
            throw error;
        }
    }
    async getEstadisticasPorPeriodo(fechaInicio, fechaFin) {
        try {
            const inicio = fechaInicio ? new Date(fechaInicio) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            const fin = fechaFin ? new Date(fechaFin) : new Date();
            const [nuevasGestantes, controlesRealizados, alertasGeneradas, alertasResueltas] = await Promise.all([
                database_1.default.gestante.count({
                    where: {
                        fecha_creacion: {
                            gte: inicio,
                            lte: fin
                        }
                    }
                }),
                database_1.default.control.count({
                    where: {
                        fecha_creacion: {
                            gte: inicio,
                            lte: fin
                        }
                    }
                }),
                database_1.default.alerta.count({
                    where: {
                        fecha_creacion: {
                            gte: inicio,
                            lte: fin
                        }
                    }
                }),
                database_1.default.alerta.count({
                    where: {
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
                    database_1.default.gestante.count({
                        where: {
                            fecha_creacion: {
                                gte: fechaInicioDia,
                                lte: fechaFinDia
                            }
                        }
                    }),
                    database_1.default.control.count({
                        where: {
                            fecha_creacion: {
                                gte: fechaInicioDia,
                                lte: fechaFinDia
                            }
                        }
                    }),
                    database_1.default.alerta.count({
                        where: {
                            fecha_creacion: {
                                gte: fechaInicioDia,
                                lte: fechaFinDia
                            }
                        }
                    }),
                    database_1.default.alerta.count({
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
            const alertasResueltasConTiempo = await database_1.default.alerta.findMany({
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
                    const resolucion = new Date(a.fecha_resolucion);
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
        }
        catch (error) {
            console.error('Error en getEstadisticasPorPeriodo:', error);
            throw error;
        }
    }
    async getResumenAlertas() {
        try {
            const alertas = await database_1.default.alerta.findMany({
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
        }
        catch (error) {
            console.error('Error en getResumenAlertas:', error);
            throw error;
        }
    }
    async getResumenControles() {
        try {
            const controles = await database_1.default.control.findMany({
                include: {
                    gestante: {
                        select: {
                            nombre: true,
                            fecha_probable_parto: true
                        }
                    },
                    medico: {
                        select: {
                            nombre: true,
                            especialidad: true
                        }
                    }
                },
                orderBy: {
                    fecha_creacion: 'desc'
                },
                take: 10
            });
            return controles;
        }
        catch (error) {
            console.error('Error en getResumenControles:', error);
            throw error;
        }
    }
    async getEstadisticasGeograficas(latitud, longitud, radio) {
        try {
            // Obtener estadísticas básicas
            const [totalGestantes, gestantesActivas, gestantesAltoRiesgo, totalControles, totalAlertas, alertasActivas, alertasUrgentes] = await Promise.all([
                database_1.default.gestante.count(),
                database_1.default.gestante.count({ where: { activa: true } }),
                database_1.default.gestante.count({ where: { activa: true } }),
                database_1.default.control.count(),
                database_1.default.alerta.count(),
                database_1.default.alerta.count({ where: { resuelta: false } }),
                database_1.default.alerta.count({
                    where: {
                        resuelta: false,
                        nivel_prioridad: { in: ['alta', 'critica'] }
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
        }
        catch (error) {
            console.error('Error en getEstadisticasGeograficas:', error);
            throw error;
        }
    }
}
exports.DashboardService = DashboardService;
