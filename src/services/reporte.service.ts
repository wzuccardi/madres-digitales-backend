// Servicio para reportes y estadísticas
// Todos los datos provienen de la base de datos real
import prisma from '../config/database';
import cacheService from './cache.service';

// Interfaz para filtros de reportes
export interface FiltrosReporte {
    municipio_id?: string;
    riesgo?: 'alto' | 'bajo';
    fecha_inicio?: Date;
    fecha_fin?: Date;
    estado?: string;
    madrina_id?: string;
}

export class ReporteService {
    // Obtener resumen general del sistema
    async getResumenGeneral() {
        console.log('📊 ReporteService: Fetching resumen general...');

        // Verificar caché
        const cacheKey = 'reporte:resumen-general';
        const cached = cacheService.get(cacheKey);
        if (cached) {
            return cached;
        }

        // Obtener totales
        const totalGestantes = await prisma.gestante.count();
        const totalControles = await prisma.controlPrenatal.count();
        const totalAlertasActivas = await prisma.alerta.count({
            where: { resuelta: false }
        });
        const gestantesAltoRiesgo = await prisma.gestante.count({
            where: { riesgo_alto: true }
        });

        // Controles este mes
        const inicioMes = new Date();
        inicioMes.setDate(1);
        inicioMes.setHours(0, 0, 0, 0);

        const controlesEsteMes = await prisma.controlPrenatal.count({
            where: {
                fecha_control: {
                    gte: inicioMes
                }
            }
        });

        // Alertas críticas
        const alertasCriticas = await prisma.alerta.count({
            where: {
                resuelta: false,
                nivel_prioridad: 'critica'
            }
        });

        // Promedio de controles por gestante
        const promedioControles = totalGestantes > 0
            ? parseFloat((totalControles / totalGestantes).toFixed(2))
            : 0;

        const resumen = {
            total_gestantes: totalGestantes,
            total_controles: totalControles,
            total_alertas_activas: totalAlertasActivas,
            gestantes_alto_riesgo: gestantesAltoRiesgo,
            controles_este_mes: controlesEsteMes,
            alertas_criticas: alertasCriticas,
            promedio_controles_por_gestante: promedioControles,
            fecha_generacion: new Date()
        };

        // Guardar en caché (30 minutos)
        cacheService.set(cacheKey, resumen, 30);

        console.log(`📊 ReporteService: Resumen generado:`, resumen);
        return resumen;
    }

    // Obtener estadísticas de gestantes por municipio con filtros
    async getEstadisticasGestantes(filtros?: FiltrosReporte) {
        console.log('📊 ReporteService: Fetching estadísticas de gestantes...', filtros);

        // Generar clave de caché con filtros
        const cacheKey = `reporte:estadisticas-gestantes:${JSON.stringify(filtros || {})}`;
        const cached = cacheService.get(cacheKey);
        if (cached) {
            return cached;
        }

        // Construir where clause con filtros
        let where: any = {};

        if (filtros?.municipio_id) {
            where.municipio_id = filtros.municipio_id;
        }

        if (filtros?.riesgo === 'alto') {
            where.riesgo_alto = true;
        } else if (filtros?.riesgo === 'bajo') {
            where.riesgo_alto = false;
        }

        if (filtros?.madrina_id) {
            where.madrina_id = filtros.madrina_id;
        }

        const gestantes = await prisma.gestante.findMany({
            where,
            select: {
                id: true,
                municipio_id: true,
                riesgo_alto: true
            }
        });

        // Obtener municipios
        const municipios = await prisma.municipio.findMany();

        // Agrupar por municipio
        const estadisticasPorMunicipio = municipios.map(municipio => {
            const gestantesMunicipio = gestantes.filter(g => g.municipio_id === municipio.id);
            const gestantesRiesgo = gestantesMunicipio.filter(g => g.riesgo_alto);

            return {
                municipio_id: municipio.id,
                municipio_nombre: municipio.nombre,
                total_gestantes: gestantesMunicipio.length,
                gestantes_alto_riesgo: gestantesRiesgo.length,
                porcentaje_riesgo: gestantesMunicipio.length > 0
                    ? ((gestantesRiesgo.length / gestantesMunicipio.length) * 100).toFixed(2)
                    : 0
            };
        }).filter(stat => stat.total_gestantes > 0); // Solo municipios con gestantes

        // Guardar en caché (30 minutos)
        cacheService.set(cacheKey, estadisticasPorMunicipio, 30);

        console.log(`📊 ReporteService: ${estadisticasPorMunicipio.length} municipios con gestantes`);
        return estadisticasPorMunicipio;
    }

    // Obtener estadísticas de controles por período
    async getEstadisticasControles(fechaInicio?: Date, fechaFin?: Date) {
        console.log('📊 ReporteService: Fetching estadísticas de controles...');

        // Generar clave de caché
        const cacheKey = `reporte:estadisticas-controles:${fechaInicio?.toISOString() || 'default'}:${fechaFin?.toISOString() || 'default'}`;
        const cached = cacheService.get(cacheKey);
        if (cached) {
            return cached;
        }

        // Si no se especifican fechas, usar últimos 6 meses
        if (!fechaInicio) {
            fechaInicio = new Date();
            fechaInicio.setMonth(fechaInicio.getMonth() - 6);
        }
        if (!fechaFin) {
            fechaFin = new Date();
        }

        const controles = await prisma.controlPrenatal.findMany({
            where: {
                fecha_control: {
                    gte: fechaInicio,
                    lte: fechaFin
                }
            },
            select: {
                id: true,
                fecha_control: true,
                gestante_id: true
            },
            orderBy: {
                fecha_control: 'asc'
            }
        });

        // Agrupar por mes
        const controlsPorMes = new Map<string, number>();
        controles.forEach(control => {
            const mes = control.fecha_control.toISOString().substring(0, 7); // YYYY-MM
            controlsPorMes.set(mes, (controlsPorMes.get(mes) || 0) + 1);
        });

        const evolucion = Array.from(controlsPorMes.entries()).map(([mes, cantidad]) => ({
            periodo: mes,
            total_controles: cantidad
        }));

        const resultado = {
            fecha_inicio: fechaInicio,
            fecha_fin: fechaFin,
            total_controles: controles.length,
            evolucion
        };

        // Guardar en caché (30 minutos)
        cacheService.set(cacheKey, resultado, 30);

        console.log(`📊 ReporteService: ${evolucion.length} períodos con controles`);
        return resultado;
    }

    // Obtener estadísticas de alertas
    async getEstadisticasAlertas() {
        console.log('📊 ReporteService: Fetching estadísticas de alertas...');

        // Verificar caché
        const cacheKey = 'reporte:estadisticas-alertas';
        const cached = cacheService.get(cacheKey);
        if (cached) {
            return cached;
        }

        const alertas = await prisma.alerta.findMany({
            select: {
                id: true,
                tipo_alerta: true,
                nivel_prioridad: true,
                resuelta: true
            }
        });

        // Distribución por tipo
        const porTipo = new Map<string, number>();
        alertas.forEach(alerta => {
            porTipo.set(alerta.tipo_alerta, (porTipo.get(alerta.tipo_alerta) || 0) + 1);
        });

        const distribucionPorTipo = Array.from(porTipo.entries()).map(([tipo, cantidad]) => ({
            tipo,
            cantidad,
            porcentaje: ((cantidad / alertas.length) * 100).toFixed(2)
        }));

        // Distribución por prioridad
        const porPrioridad = new Map<string, number>();
        alertas.forEach(alerta => {
            porPrioridad.set(alerta.nivel_prioridad, (porPrioridad.get(alerta.nivel_prioridad) || 0) + 1);
        });

        const distribucionPorPrioridad = Array.from(porPrioridad.entries()).map(([prioridad, cantidad]) => ({
            prioridad,
            cantidad,
            porcentaje: ((cantidad / alertas.length) * 100).toFixed(2)
        }));

        // Estado de alertas
        const activas = alertas.filter(a => !a.resuelta).length;
        const resueltas = alertas.filter(a => a.resuelta).length;

        const resultado = {
            total_alertas: alertas.length,
            alertas_activas: activas,
            alertas_resueltas: resueltas,
            distribucion_por_tipo: distribucionPorTipo,
            distribucion_por_prioridad: distribucionPorPrioridad
        };

        // Guardar en caché (30 minutos)
        cacheService.set(cacheKey, resultado, 30);

        console.log(`📊 ReporteService: ${alertas.length} alertas analizadas`);
        return resultado;
    }

    // Obtener estadísticas de riesgo
    async getEstadisticasRiesgo() {
        console.log('📊 ReporteService: Fetching estadísticas de riesgo...');

        // Verificar caché
        const cacheKey = 'reporte:estadisticas-riesgo';
        const cached = cacheService.get(cacheKey);
        if (cached) {
            return cached;
        }

        const totalGestantes = await prisma.gestante.count();
        const gestantesAltoRiesgo = await prisma.gestante.count({
            where: { riesgo_alto: true }
        });
        const gestantesBajoRiesgo = totalGestantes - gestantesAltoRiesgo;

        const distribucion = [
            {
                categoria: 'Alto Riesgo',
                cantidad: gestantesAltoRiesgo,
                porcentaje: ((gestantesAltoRiesgo / totalGestantes) * 100).toFixed(2)
            },
            {
                categoria: 'Bajo Riesgo',
                cantidad: gestantesBajoRiesgo,
                porcentaje: ((gestantesBajoRiesgo / totalGestantes) * 100).toFixed(2)
            }
        ];

        const resultado = {
            total_gestantes: totalGestantes,
            distribucion
        };

        // Guardar en caché (30 minutos)
        cacheService.set(cacheKey, resultado, 30);

        console.log(`📊 ReporteService: Distribución de riesgo calculada`);
        return resultado;
    }

    // Obtener tendencias temporales
    async getTendencias(meses: number = 6) {
        console.log(`📊 ReporteService: Fetching tendencias (últimos ${meses} meses)...`);

        // Verificar caché
        const cacheKey = `reporte:tendencias:${meses}`;
        const cached = cacheService.get(cacheKey);
        if (cached) {
            return cached;
        }

        const fechaInicio = new Date();
        fechaInicio.setMonth(fechaInicio.getMonth() - meses);

        // Obtener controles por mes
        const controles = await prisma.controlPrenatal.findMany({
            where: {
                fecha_control: {
                    gte: fechaInicio
                }
            },
            select: {
                fecha_control: true
            }
        });

        // Obtener alertas por mes
        const alertas = await prisma.alerta.findMany({
            where: {
                created_at: {
                    gte: fechaInicio
                }
            },
            select: {
                created_at: true
            }
        });

        // Agrupar por mes
        const tendenciasPorMes = new Map<string, any>();

        controles.forEach(control => {
            const mes = control.fecha_control.toISOString().substring(0, 7);
            if (!tendenciasPorMes.has(mes)) {
                tendenciasPorMes.set(mes, { controles: 0, alertas: 0 });
            }
            tendenciasPorMes.get(mes)!.controles++;
        });

        alertas.forEach(alerta => {
            const mes = alerta.created_at.toISOString().substring(0, 7);
            if (!tendenciasPorMes.has(mes)) {
                tendenciasPorMes.set(mes, { controles: 0, alertas: 0 });
            }
            tendenciasPorMes.get(mes)!.alertas++;
        });

        const tendencias = Array.from(tendenciasPorMes.entries())
            .map(([mes, datos]) => ({
                periodo: mes,
                total_controles: datos.controles,
                total_alertas: datos.alertas
            }))
            .sort((a, b) => a.periodo.localeCompare(b.periodo));

        // Guardar en caché (30 minutos)
        cacheService.set(cacheKey, tendencias, 30);

        console.log(`📊 ReporteService: ${tendencias.length} períodos con tendencias`);
        return tendencias;
    }
}

export default new ReporteService();

