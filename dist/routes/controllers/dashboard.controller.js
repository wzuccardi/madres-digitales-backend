"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEstadisticasDashboard = exports.getEstadisticasGeograficas = exports.getResumenControles = exports.getResumenAlertas = exports.getEstadisticasPorPeriodo = exports.getEstadisticasGenerales = void 0;
const dashboard_service_1 = require("../services/dashboard.service");
const dashboardService = new dashboard_service_1.DashboardService();
const getEstadisticasGenerales = async (req, res) => {
    try {
        const estadisticas = await dashboardService.getEstadisticasGenerales();
        res.json(estadisticas);
    }
    catch (error) {
        console.error('Error al obtener estadísticas generales:', error);
        res.status(500).json({ error: 'Error al obtener estadísticas generales' });
    }
};
exports.getEstadisticasGenerales = getEstadisticasGenerales;
const getEstadisticasPorPeriodo = async (req, res) => {
    try {
        const { fechaInicio, fechaFin } = req.query;
        const estadisticas = await dashboardService.getEstadisticasPorPeriodo(fechaInicio, fechaFin);
        res.json(estadisticas);
    }
    catch (error) {
        console.error('Error al obtener estadísticas por período:', error);
        res.status(500).json({ error: 'Error al obtener estadísticas por período' });
    }
};
exports.getEstadisticasPorPeriodo = getEstadisticasPorPeriodo;
const getResumenAlertas = async (req, res) => {
    try {
        const resumen = await dashboardService.getResumenAlertas();
        res.json(resumen);
    }
    catch (error) {
        console.error('Error al obtener resumen de alertas:', error);
        res.status(500).json({ error: 'Error al obtener resumen de alertas' });
    }
};
exports.getResumenAlertas = getResumenAlertas;
const getResumenControles = async (req, res) => {
    try {
        const resumen = await dashboardService.getResumenControles();
        res.json(resumen);
    }
    catch (error) {
        console.error('Error al obtener resumen de controles:', error);
        res.status(500).json({ error: 'Error al obtener resumen de controles' });
    }
};
exports.getResumenControles = getResumenControles;
const getEstadisticasGeograficas = async (req, res) => {
    try {
        const { latitud, longitud, radio } = req.query;
        const estadisticas = await dashboardService.getEstadisticasGeograficas(latitud, longitud, radio);
        res.json(estadisticas);
    }
    catch (error) {
        console.error('Error al obtener estadísticas geográficas:', error);
        res.status(500).json({ error: 'Error al obtener estadísticas geográficas' });
    }
};
exports.getEstadisticasGeograficas = getEstadisticasGeograficas;
const getEstadisticasDashboard = async (req, res) => {
    try {
        const { municipio_id, fecha_inicio, fecha_fin } = req.query;
        let estadisticas;
        if (municipio_id) {
            // Estadísticas por municipio
            estadisticas = await dashboardService.getEstadisticasGenerales();
        }
        else if (fecha_inicio && fecha_fin) {
            // Estadísticas por período
            estadisticas = await dashboardService.getEstadisticasPorPeriodo(fecha_inicio, fecha_fin);
        }
        else {
            // Estadísticas generales
            estadisticas = await dashboardService.getEstadisticasGenerales();
        }
        // Formatear respuesta para el frontend
        const respuesta = {
            total_gestantes: estadisticas.totalGestantes,
            controles_realizados: estadisticas.totalControles,
            alertas_activas: estadisticas.alertasActivas,
            gestantes_activas: estadisticas.gestantesActivas,
            gestantes_alto_riesgo: estadisticas.gestantesAltoRiesgo,
            promedio_edad_gestacional: estadisticas.promedioEdadGestacional,
            porcentaje_control_completo: estadisticas.porcentajeControlCompleto,
            total_medicos: estadisticas.totalMedicos,
            total_ips: estadisticas.totalIps,
            promedio_controles_por_gestante: estadisticas.promedioControlesPorGestante,
            controles_ultimo_mes: estadisticas.controlesUltimoMes,
            alertas_resueltas: estadisticas.alertasResueltas,
            alertas_urgentes: estadisticas.alertasUrgentes,
            fecha_actualizacion: estadisticas.fechaActualizacion,
        };
        res.json(respuesta);
    }
    catch (error) {
        console.error('Error al obtener estadísticas del dashboard:', error);
        res.status(500).json({ error: 'Error al obtener estadísticas del dashboard' });
    }
};
exports.getEstadisticasDashboard = getEstadisticasDashboard;
