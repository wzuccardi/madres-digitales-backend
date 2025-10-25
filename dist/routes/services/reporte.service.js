"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReporteService = void 0;
// Servicio para reportes y estadísticas
// Todos los datos provienen de la base de datos real
const database_1 = __importDefault(require("../config/database"));
class ReporteService {
    // Obtener resumen general del sistema
    async getResumenGeneral() {
        console.log('📊 ReporteService: Fetching resumen general...');
        // Obtener totales
        const totalGestantes = await database_1.default.gestante.count();
        const totalControles = await database_1.default.controlPrenatal.count();
        const totalAlertasActivas = await database_1.default.alerta.count({
            where: { resuelta: false }
        });
        const gestantesAltoRiesgo = await database_1.default.gestante.count({
            where: { riesgo_alto: true }
        });
        // Controles este mes
        const inicioMes = new Date();
        inicioMes.setDate(1);
        inicioMes.setHours(0, 0, 0, 0);
        const controlesEsteMes = await database_1.default.controlPrenatal.count({
            where: {
                fecha_control: {
                    gte: inicioMes
                }
            }
        });
        // Alertas críticas
        const alertasCriticas = await database_1.default.alerta.count({
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
        console.log(`📊 ReporteService: Resumen generado:`, resumen);
        return resumen;
    }
    // Obtener estadísticas de gestantes por municipio
    async getEstadisticasGestantes() {
        console.log('📊 ReporteService: Fetching estadísticas de gestantes...');
        const gestantes = await database_1.default.gestante.findMany({
            select: {
                id: true,
                municipio_id: true,
                riesgo_alto: true
            }
        });
        // Obtener municipios
        const municipios = await database_1.default.municipio.findMany();
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
        console.log(`📊 ReporteService: ${estadisticasPorMunicipio.length} municipios con gestantes`);
        return estadisticasPorMunicipio;
    }
    // Obtener estadísticas de controles por período
    async getEstadisticasControles(fechaInicio, fechaFin) {
        console.log('📊 ReporteService: Fetching estadísticas de controles...');
        // Si no se especifican fechas, usar últimos 6 meses
        if (!fechaInicio) {
            fechaInicio = new Date();
            fechaInicio.setMonth(fechaInicio.getMonth() - 6);
        }
        if (!fechaFin) {
            fechaFin = new Date();
        }
        const controles = await database_1.default.controlPrenatal.findMany({
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
        const controlsPorMes = new Map();
        controles.forEach(control => {
            const mes = control.fecha_control.toISOString().substring(0, 7); // YYYY-MM
            controlsPorMes.set(mes, (controlsPorMes.get(mes) || 0) + 1);
        });
        const evolucion = Array.from(controlsPorMes.entries()).map(([mes, cantidad]) => ({
            periodo: mes,
            total_controles: cantidad
        }));
        console.log(`📊 ReporteService: ${evolucion.length} períodos con controles`);
        return {
            fecha_inicio: fechaInicio,
            fecha_fin: fechaFin,
            total_controles: controles.length,
            evolucion
        };
    }
    // Obtener estadísticas de alertas
    async getEstadisticasAlertas() {
        console.log('📊 ReporteService: Fetching estadísticas de alertas...');
        const alertas = await database_1.default.alerta.findMany({
            select: {
                id: true,
                tipo_alerta: true,
                nivel_prioridad: true,
                resuelta: true
            }
        });
        // Distribución por tipo
        const porTipo = new Map();
        alertas.forEach(alerta => {
            porTipo.set(alerta.tipo_alerta, (porTipo.get(alerta.tipo_alerta) || 0) + 1);
        });
        const distribucionPorTipo = Array.from(porTipo.entries()).map(([tipo, cantidad]) => ({
            tipo,
            cantidad,
            porcentaje: ((cantidad / alertas.length) * 100).toFixed(2)
        }));
        // Distribución por prioridad
        const porPrioridad = new Map();
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
        console.log(`📊 ReporteService: ${alertas.length} alertas analizadas`);
        return {
            total_alertas: alertas.length,
            alertas_activas: activas,
            alertas_resueltas: resueltas,
            distribucion_por_tipo: distribucionPorTipo,
            distribucion_por_prioridad: distribucionPorPrioridad
        };
    }
    // Obtener estadísticas de riesgo
    async getEstadisticasRiesgo() {
        console.log('📊 ReporteService: Fetching estadísticas de riesgo...');
        const totalGestantes = await database_1.default.gestante.count();
        const gestantesAltoRiesgo = await database_1.default.gestante.count({
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
        console.log(`📊 ReporteService: Distribución de riesgo calculada`);
        return {
            total_gestantes: totalGestantes,
            distribucion
        };
    }
    // Obtener tendencias temporales
    async getTendencias(meses = 6) {
        console.log(`📊 ReporteService: Fetching tendencias (últimos ${meses} meses)...`);
        const fechaInicio = new Date();
        fechaInicio.setMonth(fechaInicio.getMonth() - meses);
        // Obtener controles por mes
        const controles = await database_1.default.controlPrenatal.findMany({
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
        const alertas = await database_1.default.alerta.findMany({
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
        const tendenciasPorMes = new Map();
        controles.forEach(control => {
            const mes = control.fecha_control.toISOString().substring(0, 7);
            if (!tendenciasPorMes.has(mes)) {
                tendenciasPorMes.set(mes, { controles: 0, alertas: 0 });
            }
            tendenciasPorMes.get(mes).controles++;
        });
        alertas.forEach(alerta => {
            const mes = alerta.created_at.toISOString().substring(0, 7);
            if (!tendenciasPorMes.has(mes)) {
                tendenciasPorMes.set(mes, { controles: 0, alertas: 0 });
            }
            tendenciasPorMes.get(mes).alertas++;
        });
        const tendencias = Array.from(tendenciasPorMes.entries())
            .map(([mes, datos]) => ({
            periodo: mes,
            total_controles: datos.controles,
            total_alertas: datos.alertas
        }))
            .sort((a, b) => a.periodo.localeCompare(b.periodo));
        console.log(`📊 ReporteService: ${tendencias.length} períodos con tendencias`);
        return tendencias;
    }
}
exports.ReporteService = ReporteService;
exports.default = new ReporteService();
