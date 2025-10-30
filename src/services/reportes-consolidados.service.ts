// Servicio para reportes consolidados (mensuales, anuales, etc.)
import prisma from '../config/database';
import cacheService from './cache.service';

export class ReportesConsolidadosService {
    
    /**
     * Obtener reporte mensual consolidado
     * Incluye: gestantes, controles, alertas, riesgo
     */
    async getReporteMensual(mes: number, anio: number) {
        console.log(`📅 ReportesConsolidados: Fetching reporte mensual ${mes}/${anio}...`);

        const cacheKey = `reporte:mensual:${anio}-${mes}`;
        const cached = cacheService.get(cacheKey);
        if (cached) {
            console.log('✅ ReportesConsolidados: Datos obtenidos del caché');
            return cached;
        }

        // Calcular rango de fechas
        const fechaInicio = new Date(anio, mes - 1, 1);
        const fechaFin = new Date(anio, mes, 0, 23, 59, 59);

        // Gestantes activas en el mes
        const gestantesActivas = await prisma.gestante.count({
            where: {
                fecha_registro: { lte: fechaFin }
            }
        });

        // Gestantes nuevas en el mes
        const gestantesNuevas = await prisma.gestante.count({
            where: {
                fecha_registro: {
                    gte: fechaInicio,
                    lte: fechaFin
                }
            }
        });

        // Controles realizados
        const controlesRealizados = await prisma.controlPrenatal.count({
            where: {
                fecha_control: {
                    gte: fechaInicio,
                    lte: fechaFin
                }
            }
        });

        // Alertas generadas
        const alertasGeneradas = await prisma.alerta.count({
            where: {
                fecha_creacion: {
                    gte: fechaInicio,
                    lte: fechaFin
                }
            }
        });

        // Alertas resueltas
        const alertasResueltas = await prisma.alerta.count({
            where: {
                fecha_creacion: {
                    gte: fechaInicio,
                    lte: fechaFin
                },
                resuelta: true
            }
        });

        // Gestantes con alto riesgo
        const gestantesAltoRiesgo = await prisma.gestante.count({
            where: { riesgo_alto: true }
        });

        // Promedio de controles
        const promedioControles = gestantesActivas > 0
            ? parseFloat((controlesRealizados / gestantesActivas).toFixed(2))
            : 0;

        // Tasa de resolución de alertas
        const tasaResolucion = alertasGeneradas > 0
            ? parseFloat(((alertasResueltas / alertasGeneradas) * 100).toFixed(2))
            : 0;

        const reporte = {
            periodo: `${mes}/${anio}`,
            fecha_inicio: fechaInicio.toISOString().split('T')[0],
            fecha_fin: fechaFin.toISOString().split('T')[0],
            gestantes: {
                activas: gestantesActivas,
                nuevas: gestantesNuevas,
                alto_riesgo: gestantesAltoRiesgo
            },
            controles: {
                realizados: controlesRealizados,
                promedio_por_gestante: promedioControles
            },
            alertas: {
                generadas: alertasGeneradas,
                resueltas: alertasResueltas,
                pendientes: alertasGeneradas - alertasResueltas,
                tasa_resolucion: tasaResolucion
            },
            fecha_generacion: new Date()
        };

        // Guardar en caché (60 minutos para reportes mensuales)
        cacheService.set(cacheKey, reporte, 60);

        console.log(`📅 ReportesConsolidados: Reporte mensual generado`);
        return reporte;
    }

    /**
     * Obtener reporte anual consolidado
     */
    async getReporteAnual(anio: number) {
        console.log(`📊 ReportesConsolidados: Fetching reporte anual ${anio}...`);

        const cacheKey = `reporte:anual:${anio}`;
        const cached = cacheService.get(cacheKey);
        if (cached) {
            console.log('✅ ReportesConsolidados: Datos obtenidos del caché');
            return cached;
        }

        const fechaInicio = new Date(anio, 0, 1);
        const fechaFin = new Date(anio, 11, 31, 23, 59, 59);

        // Totales anuales
        const totalGestantes = await prisma.gestante.count({
            where: {
                fecha_registro: { lte: fechaFin }
            }
        });

        const totalControles = await prisma.controlPrenatal.count({
            where: {
                fecha_control: {
                    gte: fechaInicio,
                    lte: fechaFin
                }
            }
        });

        const totalAlertas = await prisma.alerta.count({
            where: {
                fecha_creacion: {
                    gte: fechaInicio,
                    lte: fechaFin
                }
            }
        });

        // Reportes mensuales
        const meses = [];
        for (let mes = 1; mes <= 12; mes++) {
            const reporteMensual = await this.getReporteMensual(mes, anio);
            meses.push(reporteMensual);
        }

        const reporte = {
            anio,
            fecha_inicio: fechaInicio.toISOString().split('T')[0],
            fecha_fin: fechaFin.toISOString().split('T')[0],
            totales: {
                gestantes: totalGestantes,
                controles: totalControles,
                alertas: totalAlertas
            },
            meses,
            fecha_generacion: new Date()
        };

        // Guardar en caché (120 minutos para reportes anuales)
        cacheService.set(cacheKey, reporte, 120);

        console.log(`📊 ReportesConsolidados: Reporte anual generado`);
        return reporte;
    }

    /**
     * Obtener reporte por municipio consolidado
     */
    async getReportePorMunicipio(municipioId: string, mes?: number, anio?: number) {
        console.log(`🏘️  ReportesConsolidados: Fetching reporte por municipio ${municipioId}...`);

        const periodo = mes && anio ? `${mes}/${anio}` : 'general';
        const cacheKey = `reporte:municipio:${municipioId}:${periodo}`;
        const cached = cacheService.get(cacheKey);
        if (cached) {
            console.log('✅ ReportesConsolidados: Datos obtenidos del caché');
            return cached;
        }

        // Filtro de fechas
        let whereClause: any = { municipio_id: municipioId };
        if (mes && anio) {
            const fechaInicio = new Date(anio, mes - 1, 1);
            const fechaFin = new Date(anio, mes, 0, 23, 59, 59);
            whereClause.fecha_registro = {
                gte: fechaInicio,
                lte: fechaFin
            };
        }

        // Gestantes en municipio
        const gestantes = await prisma.gestante.count({ where: whereClause });
        const gestantesAltoRiesgo = await prisma.gestante.count({
            where: {
                ...whereClause,
                riesgo_alto: true
            }
        });

        const reporte = {
            municipio_id: municipioId,
            periodo,
            gestantes: {
                total: gestantes,
                alto_riesgo: gestantesAltoRiesgo,
                porcentaje_riesgo: gestantes > 0
                    ? parseFloat(((gestantesAltoRiesgo / gestantes) * 100).toFixed(2))
                    : 0
            },
            fecha_generacion: new Date()
        };

        // Guardar en caché (60 minutos)
        cacheService.set(cacheKey, reporte, 60);

        console.log(`🏘️  ReportesConsolidados: Reporte por municipio generado`);
        return reporte;
    }

    /**
     * Obtener comparativa entre períodos
     */
    async getComparativa(mes1: number, anio1: number, mes2: number, anio2: number) {
        console.log(`📊 ReportesConsolidados: Fetching comparativa ${mes1}/${anio1} vs ${mes2}/${anio2}...`);

        const reporte1 = await this.getReporteMensual(mes1, anio1);
        const reporte2 = await this.getReporteMensual(mes2, anio2);

        const comparativa = {
            periodo_1: reporte1.periodo,
            periodo_2: reporte2.periodo,
            gestantes: {
                periodo_1: reporte1.gestantes.activas,
                periodo_2: reporte2.gestantes.activas,
                variacion: reporte2.gestantes.activas - reporte1.gestantes.activas,
                porcentaje_variacion: reporte1.gestantes.activas > 0
                    ? parseFloat((((reporte2.gestantes.activas - reporte1.gestantes.activas) / reporte1.gestantes.activas) * 100).toFixed(2))
                    : 0
            },
            controles: {
                periodo_1: reporte1.controles.realizados,
                periodo_2: reporte2.controles.realizados,
                variacion: reporte2.controles.realizados - reporte1.controles.realizados
            },
            alertas: {
                periodo_1: reporte1.alertas.generadas,
                periodo_2: reporte2.alertas.generadas,
                variacion: reporte2.alertas.generadas - reporte1.alertas.generadas
            },
            fecha_generacion: new Date()
        };

        console.log(`📊 ReportesConsolidados: Comparativa generada`);
        return comparativa;
    }
}

export default new ReportesConsolidadosService();

