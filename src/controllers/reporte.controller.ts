// Controlador para reportes y estadísticas
import { Request, Response } from 'express';
import reporteService from '../services/reporte.service';
import { BaseController } from './base.controller';

class ReporteController extends BaseController {

    // Obtener resumen general
    async getResumenGeneral(req: Request, res: Response) {
        try {
            console.log('📊 Controller: Getting resumen general...');
            const resumen = await reporteService.getResumenGeneral();
            this.success(res, resumen, 'Resumen general obtenido exitosamente');
        } catch (error) {
            console.error('❌ Controller: Error getting resumen general:', error);
            this.handleError(res, error, 'Error al obtener resumen general');
        }
    }

    // Obtener lista de reportes disponibles
    async getListaReportes(req: Request, res: Response) {
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
        } catch (error) {
            console.error('❌ Controller: Error getting lista de reportes:', error);
            this.handleError(res, error, 'Error al obtener lista de reportes');
        }
    }

    // Obtener estadísticas de gestantes
    async getEstadisticasGestantes(req: Request, res: Response) {
        try {
            console.log('📊 Controller: Getting estadísticas de gestantes...');
            const estadisticas = await reporteService.getEstadisticasGestantes();
            this.success(res, estadisticas, 'Estadísticas de gestantes obtenidas exitosamente');
        } catch (error) {
            console.error('❌ Controller: Error getting estadísticas de gestantes:', error);
            this.handleError(res, error, 'Error al obtener estadísticas de gestantes');
        }
    }

    // Obtener estadísticas de controles
    async getEstadisticasControles(req: Request, res: Response) {
        try {
            console.log('📊 Controller: Getting estadísticas de controles...');
            
            const { fecha_inicio, fecha_fin } = req.query;
            
            const fechaInicio = fecha_inicio ? new Date(fecha_inicio as string) : undefined;
            const fechaFin = fecha_fin ? new Date(fecha_fin as string) : undefined;
            
            const estadisticas = await reporteService.getEstadisticasControles(fechaInicio, fechaFin);
            this.success(res, estadisticas, 'Estadísticas de controles obtenidas exitosamente');
        } catch (error) {
            console.error('❌ Controller: Error getting estadísticas de controles:', error);
            this.handleError(res, error, 'Error al obtener estadísticas de controles');
        }
    }

    // Obtener estadísticas de alertas
    async getEstadisticasAlertas(req: Request, res: Response) {
        try {
            console.log('📊 Controller: Getting estadísticas de alertas...');
            const estadisticas = await reporteService.getEstadisticasAlertas();
            this.success(res, estadisticas, 'Estadísticas de alertas obtenidas exitosamente');
        } catch (error) {
            console.error('❌ Controller: Error getting estadísticas de alertas:', error);
            this.handleError(res, error, 'Error al obtener estadísticas de alertas');
        }
    }

    // Obtener estadísticas de riesgo
    async getEstadisticasRiesgo(req: Request, res: Response) {
        try {
            console.log('📊 Controller: Getting estadísticas de riesgo...');
            const estadisticas = await reporteService.getEstadisticasRiesgo();
            this.success(res, estadisticas, 'Estadísticas de riesgo obtenidas exitosamente');
        } catch (error) {
            console.error('❌ Controller: Error getting estadísticas de riesgo:', error);
            this.handleError(res, error, 'Error al obtener estadísticas de riesgo');
        }
    }

    // Obtener tendencias
    async getTendencias(req: Request, res: Response) {
        try {
            console.log('📊 Controller: Getting tendencias...');
            
            const { meses } = req.query;
            const mesesNum = meses ? parseInt(meses as string) : 6;
            
            const tendencias = await reporteService.getTendencias(mesesNum);
            this.success(res, tendencias, 'Tendencias obtenidas exitosamente');
        } catch (error) {
            console.error('❌ Controller: Error getting tendencias:', error);
            this.handleError(res, error, 'Error al obtener tendencias');
        }
    }
}

// Crear instancia y exportar los métodos
const reporteController = new ReporteController();

export const getResumenGeneral = (req: Request, res: Response) => reporteController.getResumenGeneral(req, res);
export const getListaReportes = (req: Request, res: Response) => reporteController.getListaReportes(req, res);
export const getEstadisticasGestantes = (req: Request, res: Response) => reporteController.getEstadisticasGestantes(req, res);
export const getEstadisticasControles = (req: Request, res: Response) => reporteController.getEstadisticasControles(req, res);
export const getEstadisticasAlertas = (req: Request, res: Response) => reporteController.getEstadisticasAlertas(req, res);
export const getEstadisticasRiesgo = (req: Request, res: Response) => reporteController.getEstadisticasRiesgo(req, res);
export const getTendencias = (req: Request, res: Response) => reporteController.getTendencias(req, res);

