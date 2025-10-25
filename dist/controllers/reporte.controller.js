"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTendencias = exports.getEstadisticasRiesgo = exports.getEstadisticasAlertas = exports.getEstadisticasControles = exports.getEstadisticasGestantes = exports.getListaReportes = exports.getResumenGeneral = void 0;
const reporte_service_1 = __importDefault(require("../services/reporte.service"));
const base_controller_1 = require("./base.controller");
class ReporteController extends base_controller_1.BaseController {
    // Obtener resumen general
    async getResumenGeneral(req, res) {
        try {
            console.log('📊 Controller: Getting resumen general...');
            const resumen = await reporte_service_1.default.getResumenGeneral();
            this.success(res, resumen, 'Resumen general obtenido exitosamente');
        }
        catch (error) {
            console.error('❌ Controller: Error getting resumen general:', error);
            this.handleError(res, error, 'Error al obtener resumen general');
        }
    }
    // Obtener lista de reportes disponibles
    async getListaReportes(req, res) {
        try {
            console.log('📊 Controller: Getting lista de reportes...');
            const reportes = [
                {
                    id: 'resumen-general',
                    titulo: 'Resumen General',
                    descripcion: 'Resumen general del sistema',
                    url: '/api/reportes/resumen-general',
                    fecha: new Date().toISOString().split('T')[0]
                },
                {
                    id: 'estadisticas-gestantes',
                    titulo: 'Estadísticas de Gestantes',
                    descripcion: 'Estadísticas de gestantes por municipio',
                    url: '/api/reportes/estadisticas-gestantes',
                    fecha: new Date().toISOString().split('T')[0]
                },
                {
                    id: 'estadisticas-controles',
                    titulo: 'Estadísticas de Controles',
                    descripcion: 'Estadísticas de controles prenatales',
                    url: '/api/reportes/estadisticas-controles',
                    fecha: new Date().toISOString().split('T')[0]
                },
                {
                    id: 'estadisticas-alertas',
                    titulo: 'Estadísticas de Alertas',
                    descripcion: 'Estadísticas de alertas del sistema',
                    url: '/api/reportes/estadisticas-alertas',
                    fecha: new Date().toISOString().split('T')[0]
                },
                {
                    id: 'estadisticas-riesgo',
                    titulo: 'Estadísticas de Riesgo',
                    descripcion: 'Distribución de riesgo de gestantes',
                    url: '/api/reportes/estadisticas-riesgo',
                    fecha: new Date().toISOString().split('T')[0]
                },
                {
                    id: 'tendencias',
                    titulo: 'Tendencias',
                    descripcion: 'Tendencias temporales del sistema',
                    url: '/api/reportes/tendencias',
                    fecha: new Date().toISOString().split('T')[0]
                }
            ];
            this.success(res, reportes, 'Lista de reportes obtenida exitosamente');
        }
        catch (error) {
            console.error('❌ Controller: Error getting lista de reportes:', error);
            this.handleError(res, error, 'Error al obtener lista de reportes');
        }
    }
    // Obtener estadísticas de gestantes
    async getEstadisticasGestantes(req, res) {
        try {
            console.log('📊 Controller: Getting estadísticas de gestantes...');
            const estadisticas = await reporte_service_1.default.getEstadisticasGestantes();
            this.success(res, estadisticas, 'Estadísticas de gestantes obtenidas exitosamente');
        }
        catch (error) {
            console.error('❌ Controller: Error getting estadísticas de gestantes:', error);
            this.handleError(res, error, 'Error al obtener estadísticas de gestantes');
        }
    }
    // Obtener estadísticas de controles
    async getEstadisticasControles(req, res) {
        try {
            console.log('📊 Controller: Getting estadísticas de controles...');
            const { fecha_inicio, fecha_fin } = req.query;
            const fechaInicio = fecha_inicio ? new Date(fecha_inicio) : undefined;
            const fechaFin = fecha_fin ? new Date(fecha_fin) : undefined;
            const estadisticas = await reporte_service_1.default.getEstadisticasControles(fechaInicio, fechaFin);
            this.success(res, estadisticas, 'Estadísticas de controles obtenidas exitosamente');
        }
        catch (error) {
            console.error('❌ Controller: Error getting estadísticas de controles:', error);
            this.handleError(res, error, 'Error al obtener estadísticas de controles');
        }
    }
    // Obtener estadísticas de alertas
    async getEstadisticasAlertas(req, res) {
        try {
            console.log('📊 Controller: Getting estadísticas de alertas...');
            const estadisticas = await reporte_service_1.default.getEstadisticasAlertas();
            this.success(res, estadisticas, 'Estadísticas de alertas obtenidas exitosamente');
        }
        catch (error) {
            console.error('❌ Controller: Error getting estadísticas de alertas:', error);
            this.handleError(res, error, 'Error al obtener estadísticas de alertas');
        }
    }
    // Obtener estadísticas de riesgo
    async getEstadisticasRiesgo(req, res) {
        try {
            console.log('📊 Controller: Getting estadísticas de riesgo...');
            const estadisticas = await reporte_service_1.default.getEstadisticasRiesgo();
            this.success(res, estadisticas, 'Estadísticas de riesgo obtenidas exitosamente');
        }
        catch (error) {
            console.error('❌ Controller: Error getting estadísticas de riesgo:', error);
            this.handleError(res, error, 'Error al obtener estadísticas de riesgo');
        }
    }
    // Obtener tendencias
    async getTendencias(req, res) {
        try {
            console.log('📊 Controller: Getting tendencias...');
            const { meses } = req.query;
            const mesesNum = meses ? parseInt(meses) : 6;
            const tendencias = await reporte_service_1.default.getTendencias(mesesNum);
            this.success(res, tendencias, 'Tendencias obtenidas exitosamente');
        }
        catch (error) {
            console.error('❌ Controller: Error getting tendencias:', error);
            this.handleError(res, error, 'Error al obtener tendencias');
        }
    }
}
// Crear instancia y exportar los métodos
const reporteController = new ReporteController();
const getResumenGeneral = (req, res) => reporteController.getResumenGeneral(req, res);
exports.getResumenGeneral = getResumenGeneral;
const getListaReportes = (req, res) => reporteController.getListaReportes(req, res);
exports.getListaReportes = getListaReportes;
const getEstadisticasGestantes = (req, res) => reporteController.getEstadisticasGestantes(req, res);
exports.getEstadisticasGestantes = getEstadisticasGestantes;
const getEstadisticasControles = (req, res) => reporteController.getEstadisticasControles(req, res);
exports.getEstadisticasControles = getEstadisticasControles;
const getEstadisticasAlertas = (req, res) => reporteController.getEstadisticasAlertas(req, res);
exports.getEstadisticasAlertas = getEstadisticasAlertas;
const getEstadisticasRiesgo = (req, res) => reporteController.getEstadisticasRiesgo(req, res);
exports.getEstadisticasRiesgo = getEstadisticasRiesgo;
const getTendencias = (req, res) => reporteController.getTendencias(req, res);
exports.getTendencias = getTendencias;
