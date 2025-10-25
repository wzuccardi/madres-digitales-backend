// Controlador para reportes y estadísticas
import { Request, Response } from 'express';
import reporteService from '../services/reporte.service';

// Obtener resumen general
export const getResumenGeneral = async (req: Request, res: Response) => {
    try {
        console.log('📊 Controller: Getting resumen general...');
        const resumen = await reporteService.getResumenGeneral();
        res.json(resumen);
    } catch (error) {
        console.error('❌ Controller: Error getting resumen general:', error);
        res.status(500).json({
            error: 'Error al obtener resumen general',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};

// Obtener lista de reportes disponibles
export const getListaReportes = async (req: Request, res: Response) => {
    try {
        console.log('📊 Controller: Getting lista de reportes...');
        
        const reportes = [
            {
                id: 'resumen-general',
                titulo: 'Resumen General',
                descripcion: 'Resumen general del sistema',
                url: 'http://localhost:54112/api/reportes/resumen-general',
                fecha: new Date().toISOString().split('T')[0]
            },
            {
                id: 'estadisticas-gestantes',
                titulo: 'Estadísticas de Gestantes',
                descripcion: 'Estadísticas de gestantes por municipio',
                url: 'http://localhost:54112/api/reportes/estadisticas-gestantes',
                fecha: new Date().toISOString().split('T')[0]
            },
            {
                id: 'estadisticas-controles',
                titulo: 'Estadísticas de Controles',
                descripcion: 'Estadísticas de controles prenatales',
                url: 'http://localhost:54112/api/reportes/estadisticas-controles',
                fecha: new Date().toISOString().split('T')[0]
            },
            {
                id: 'estadisticas-alertas',
                titulo: 'Estadísticas de Alertas',
                descripcion: 'Estadísticas de alertas del sistema',
                url: 'http://localhost:54112/api/reportes/estadisticas-alertas',
                fecha: new Date().toISOString().split('T')[0]
            },
            {
                id: 'estadisticas-riesgo',
                titulo: 'Estadísticas de Riesgo',
                descripcion: 'Distribución de riesgo de gestantes',
                url: 'http://localhost:54112/api/reportes/estadisticas-riesgo',
                fecha: new Date().toISOString().split('T')[0]
            },
            {
                id: 'tendencias',
                titulo: 'Tendencias',
                descripcion: 'Tendencias temporales del sistema',
                url: 'http://localhost:54112/api/reportes/tendencias',
                fecha: new Date().toISOString().split('T')[0]
            }
        ];
        
        res.json(reportes);
    } catch (error) {
        console.error('❌ Controller: Error getting lista de reportes:', error);
        res.status(500).json({
            error: 'Error al obtener lista de reportes',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};

// Obtener estadísticas de gestantes
export const getEstadisticasGestantes = async (req: Request, res: Response) => {
    try {
        console.log('📊 Controller: Getting estadísticas de gestantes...');
        const estadisticas = await reporteService.getEstadisticasGestantes();
        res.json(estadisticas);
    } catch (error) {
        console.error('❌ Controller: Error getting estadísticas de gestantes:', error);
        res.status(500).json({
            error: 'Error al obtener estadísticas de gestantes',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};

// Obtener estadísticas de controles
export const getEstadisticasControles = async (req: Request, res: Response) => {
    try {
        console.log('📊 Controller: Getting estadísticas de controles...');
        
        const { fecha_inicio, fecha_fin } = req.query;
        
        const fechaInicio = fecha_inicio ? new Date(fecha_inicio as string) : undefined;
        const fechaFin = fecha_fin ? new Date(fecha_fin as string) : undefined;
        
        const estadisticas = await reporteService.getEstadisticasControles(fechaInicio, fechaFin);
        res.json(estadisticas);
    } catch (error) {
        console.error('❌ Controller: Error getting estadísticas de controles:', error);
        res.status(500).json({
            error: 'Error al obtener estadísticas de controles',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};

// Obtener estadísticas de alertas
export const getEstadisticasAlertas = async (req: Request, res: Response) => {
    try {
        console.log('📊 Controller: Getting estadísticas de alertas...');
        const estadisticas = await reporteService.getEstadisticasAlertas();
        res.json(estadisticas);
    } catch (error) {
        console.error('❌ Controller: Error getting estadísticas de alertas:', error);
        res.status(500).json({
            error: 'Error al obtener estadísticas de alertas',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};

// Obtener estadísticas de riesgo
export const getEstadisticasRiesgo = async (req: Request, res: Response) => {
    try {
        console.log('📊 Controller: Getting estadísticas de riesgo...');
        const estadisticas = await reporteService.getEstadisticasRiesgo();
        res.json(estadisticas);
    } catch (error) {
        console.error('❌ Controller: Error getting estadísticas de riesgo:', error);
        res.status(500).json({
            error: 'Error al obtener estadísticas de riesgo',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};

// Obtener tendencias
export const getTendencias = async (req: Request, res: Response) => {
    try {
        console.log('📊 Controller: Getting tendencias...');
        
        const { meses } = req.query;
        const mesesNum = meses ? parseInt(meses as string) : 6;
        
        const tendencias = await reporteService.getTendencias(mesesNum);
        res.json(tendencias);
    } catch (error) {
        console.error('❌ Controller: Error getting tendencias:', error);
        res.status(500).json({
            error: 'Error al obtener tendencias',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};

