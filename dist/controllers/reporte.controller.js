"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTendencias = exports.getEstadisticasRiesgo = exports.getEstadisticasAlertas = exports.getEstadisticasControles = exports.getEstadisticasGestantes = exports.getResumenGeneral = void 0;
const reporte_service_1 = __importDefault(require("../services/reporte.service"));
// Obtener resumen general
const getResumenGeneral = async (req, res) => {
    try {
        console.log('📊 Controller: Getting resumen general...');
        const resumen = await reporte_service_1.default.getResumenGeneral();
        res.json(resumen);
    }
    catch (error) {
        console.error('❌ Controller: Error getting resumen general:', error);
        res.status(500).json({
            error: 'Error al obtener resumen general',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};
exports.getResumenGeneral = getResumenGeneral;
// Obtener estadísticas de gestantes
const getEstadisticasGestantes = async (req, res) => {
    try {
        console.log('📊 Controller: Getting estadísticas de gestantes...');
        const estadisticas = await reporte_service_1.default.getEstadisticasGestantes();
        res.json(estadisticas);
    }
    catch (error) {
        console.error('❌ Controller: Error getting estadísticas de gestantes:', error);
        res.status(500).json({
            error: 'Error al obtener estadísticas de gestantes',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};
exports.getEstadisticasGestantes = getEstadisticasGestantes;
// Obtener estadísticas de controles
const getEstadisticasControles = async (req, res) => {
    try {
        console.log('📊 Controller: Getting estadísticas de controles...');
        const { fecha_inicio, fecha_fin } = req.query;
        const fechaInicio = fecha_inicio ? new Date(fecha_inicio) : undefined;
        const fechaFin = fecha_fin ? new Date(fecha_fin) : undefined;
        const estadisticas = await reporte_service_1.default.getEstadisticasControles(fechaInicio, fechaFin);
        res.json(estadisticas);
    }
    catch (error) {
        console.error('❌ Controller: Error getting estadísticas de controles:', error);
        res.status(500).json({
            error: 'Error al obtener estadísticas de controles',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};
exports.getEstadisticasControles = getEstadisticasControles;
// Obtener estadísticas de alertas
const getEstadisticasAlertas = async (req, res) => {
    try {
        console.log('📊 Controller: Getting estadísticas de alertas...');
        const estadisticas = await reporte_service_1.default.getEstadisticasAlertas();
        res.json(estadisticas);
    }
    catch (error) {
        console.error('❌ Controller: Error getting estadísticas de alertas:', error);
        res.status(500).json({
            error: 'Error al obtener estadísticas de alertas',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};
exports.getEstadisticasAlertas = getEstadisticasAlertas;
// Obtener estadísticas de riesgo
const getEstadisticasRiesgo = async (req, res) => {
    try {
        console.log('📊 Controller: Getting estadísticas de riesgo...');
        const estadisticas = await reporte_service_1.default.getEstadisticasRiesgo();
        res.json(estadisticas);
    }
    catch (error) {
        console.error('❌ Controller: Error getting estadísticas de riesgo:', error);
        res.status(500).json({
            error: 'Error al obtener estadísticas de riesgo',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};
exports.getEstadisticasRiesgo = getEstadisticasRiesgo;
// Obtener tendencias
const getTendencias = async (req, res) => {
    try {
        console.log('📊 Controller: Getting tendencias...');
        const { meses } = req.query;
        const mesesNum = meses ? parseInt(meses) : 6;
        const tendencias = await reporte_service_1.default.getTendencias(mesesNum);
        res.json(tendencias);
    }
    catch (error) {
        console.error('❌ Controller: Error getting tendencias:', error);
        res.status(500).json({
            error: 'Error al obtener tendencias',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};
exports.getTendencias = getTendencias;
