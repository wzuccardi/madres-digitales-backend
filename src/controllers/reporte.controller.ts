// Controlador para reportes y estadísticas
import { Request, Response } from 'express';
import reporteService from '../services/reporte.service';
import exportPdfService from '../services/export-pdf.service';
import exportExcelService from '../services/export-excel.service';
import cacheService from '../services/cache.service';
import reportesConsolidadosService from '../services/reportes-consolidados.service';
import { BaseController } from './base.controller';

// Interfaz para request autenticado
interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        rol: string;
        email: string;
    };
}

class ReporteController extends BaseController {

    // Validar permisos para ver reportes
    private validarPermisosReportes(req: AuthenticatedRequest): boolean {
        const rolesPermitidos = ['ADMIN', 'SUPER_ADMIN', 'COORDINADOR'];
        const userRol = req.user?.rol?.toUpperCase();
        return rolesPermitidos.includes(userRol || '');
    }

    // Obtener resumen general
    async getResumenGeneral(req: AuthenticatedRequest, res: Response) {
        try {
            console.log('📊 Controller: Getting resumen general...');

            // Validar permisos
            if (!this.validarPermisosReportes(req)) {
                console.warn(`⚠️  Controller: Usuario ${req.user?.email} sin permisos para reportes`);
                return res.status(403).json({
                    success: false,
                    error: 'No tiene permisos para acceder a reportes'
                });
            }

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

    // Obtener estadísticas de gestantes con filtros
    async getEstadisticasGestantes(req: AuthenticatedRequest, res: Response) {
        try {
            console.log('📊 Controller: Getting estadísticas de gestantes...');

            // Validar permisos
            if (!this.validarPermisosReportes(req)) {
                console.warn(`⚠️  Controller: Usuario ${req.user?.email} sin permisos para reportes`);
                return res.status(403).json({
                    success: false,
                    error: 'No tiene permisos para acceder a reportes'
                });
            }

            // Obtener filtros de query parameters
            const filtros = {
                municipio_id: req.query.municipio_id as string,
                riesgo: req.query.riesgo as 'alto' | 'bajo',
                madrina_id: req.query.madrina_id as string
            };

            console.log('📊 Controller: Filtros aplicados:', filtros);
            const estadisticas = await reporteService.getEstadisticasGestantes(filtros);
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

    // ========== DESCARGAS PDF ==========

    // Descargar resumen general como PDF
    async getResumenGeneralPDF(req: Request, res: Response) {
        try {
            console.log('📊 Controller: Downloading resumen general as PDF...');
            const resumen = await reporteService.getResumenGeneral();
            const buffer = exportPdfService.generateResumenGeneralPDF(resumen);
            exportPdfService.sendPDF(res, buffer, 'resumen-general.pdf');
        } catch (error) {
            console.error('❌ Controller: Error downloading resumen general PDF:', error);
            this.handleError(res, error, 'Error al descargar resumen general');
        }
    }

    // Descargar estadísticas de gestantes como PDF
    async getEstadisticasGestantesPDF(req: Request, res: Response) {
        try {
            console.log('📊 Controller: Downloading estadísticas gestantes as PDF...');
            const estadisticas = await reporteService.getEstadisticasGestantes();
            const buffer = exportPdfService.generateEstadisticasGestantesPDF(estadisticas);
            exportPdfService.sendPDF(res, buffer, 'estadisticas-gestantes.pdf');
        } catch (error) {
            console.error('❌ Controller: Error downloading estadísticas gestantes PDF:', error);
            this.handleError(res, error, 'Error al descargar estadísticas gestantes');
        }
    }

    // Descargar estadísticas de alertas como PDF
    async getEstadisticasAlertasPDF(req: Request, res: Response) {
        try {
            console.log('📊 Controller: Downloading estadísticas alertas as PDF...');
            const estadisticas = await reporteService.getEstadisticasAlertas();
            const buffer = exportPdfService.generateEstadisticasAlertasPDF(estadisticas);
            exportPdfService.sendPDF(res, buffer, 'estadisticas-alertas.pdf');
        } catch (error) {
            console.error('❌ Controller: Error downloading estadísticas alertas PDF:', error);
            this.handleError(res, error, 'Error al descargar estadísticas alertas');
        }
    }

    // ========== DESCARGAS EXCEL ==========

    // Descargar resumen general como Excel
    async getResumenGeneralExcel(req: Request, res: Response) {
        try {
            console.log('📊 Controller: Downloading resumen general as Excel...');
            const resumen = await reporteService.getResumenGeneral();
            const buffer = exportExcelService.generateResumenGeneralExcel(resumen);
            exportExcelService.sendExcel(res, buffer, 'resumen-general.xlsx');
        } catch (error) {
            console.error('❌ Controller: Error downloading resumen general Excel:', error);
            this.handleError(res, error, 'Error al descargar resumen general');
        }
    }

    // Descargar estadísticas de gestantes como Excel
    async getEstadisticasGestantesExcel(req: Request, res: Response) {
        try {
            console.log('📊 Controller: Downloading estadísticas gestantes as Excel...');
            const estadisticas = await reporteService.getEstadisticasGestantes();
            const buffer = exportExcelService.generateEstadisticasGestantesExcel(estadisticas);
            exportExcelService.sendExcel(res, buffer, 'estadisticas-gestantes.xlsx');
        } catch (error) {
            console.error('❌ Controller: Error downloading estadísticas gestantes Excel:', error);
            this.handleError(res, error, 'Error al descargar estadísticas gestantes');
        }
    }

    // Descargar estadísticas de controles como Excel
    async getEstadisticasControlesExcel(req: Request, res: Response) {
        try {
            console.log('📊 Controller: Downloading estadísticas controles as Excel...');
            const { fecha_inicio, fecha_fin } = req.query;
            const fechaInicio = fecha_inicio ? new Date(fecha_inicio as string) : undefined;
            const fechaFin = fecha_fin ? new Date(fecha_fin as string) : undefined;
            const estadisticas = await reporteService.getEstadisticasControles(fechaInicio, fechaFin);
            const buffer = exportExcelService.generateEstadisticasControlesExcel(estadisticas);
            exportExcelService.sendExcel(res, buffer, 'estadisticas-controles.xlsx');
        } catch (error) {
            console.error('❌ Controller: Error downloading estadísticas controles Excel:', error);
            this.handleError(res, error, 'Error al descargar estadísticas controles');
        }
    }

    // Descargar estadísticas de alertas como Excel
    async getEstadisticasAlertasExcel(req: Request, res: Response) {
        try {
            console.log('📊 Controller: Downloading estadísticas alertas as Excel...');
            const estadisticas = await reporteService.getEstadisticasAlertas();
            const buffer = exportExcelService.generateEstadisticasAlertasExcel(estadisticas);
            exportExcelService.sendExcel(res, buffer, 'estadisticas-alertas.xlsx');
        } catch (error) {
            console.error('❌ Controller: Error downloading estadísticas alertas Excel:', error);
            this.handleError(res, error, 'Error al descargar estadísticas alertas');
        }
    }

    // Descargar estadísticas de riesgo como Excel
    async getEstadisticasRiesgoExcel(req: Request, res: Response) {
        try {
            console.log('📊 Controller: Downloading estadísticas riesgo as Excel...');
            const estadisticas = await reporteService.getEstadisticasRiesgo();
            const buffer = exportExcelService.generateEstadisticasRiesgoExcel(estadisticas);
            exportExcelService.sendExcel(res, buffer, 'estadisticas-riesgo.xlsx');
        } catch (error) {
            console.error('❌ Controller: Error downloading estadísticas riesgo Excel:', error);
            this.handleError(res, error, 'Error al descargar estadísticas riesgo');
        }
    }

    // Descargar tendencias como Excel
    async getTendenciasExcel(req: Request, res: Response) {
        try {
            console.log('📊 Controller: Downloading tendencias as Excel...');
            const { meses } = req.query;
            const mesesNum = meses ? parseInt(meses as string) : 6;
            const tendencias = await reporteService.getTendencias(mesesNum);
            const buffer = exportExcelService.generateTendenciasExcel(tendencias);
            exportExcelService.sendExcel(res, buffer, 'tendencias.xlsx');
        } catch (error) {
            console.error('❌ Controller: Error downloading tendencias Excel:', error);
            this.handleError(res, error, 'Error al descargar tendencias');
        }
    }

    // ========== FASE 3: REPORTES CONSOLIDADOS ==========

    // Obtener reporte mensual consolidado
    async getReporteMensual(req: AuthenticatedRequest, res: Response) {
        try {
            console.log('📅 Controller: Getting reporte mensual...');

            // Validar permisos
            if (!this.validarPermisosReportes(req)) {
                return res.status(403).json({
                    success: false,
                    error: 'No tiene permisos para acceder a reportes'
                });
            }

            const { mes, anio } = req.query;
            const mesNum = mes ? parseInt(mes as string) : new Date().getMonth() + 1;
            const anioNum = anio ? parseInt(anio as string) : new Date().getFullYear();

            const reporte = await reportesConsolidadosService.getReporteMensual(mesNum, anioNum);
            this.success(res, reporte, 'Reporte mensual obtenido exitosamente');
        } catch (error) {
            console.error('❌ Controller: Error getting reporte mensual:', error);
            this.handleError(res, error, 'Error al obtener reporte mensual');
        }
    }

    // Obtener reporte anual consolidado
    async getReporteAnual(req: AuthenticatedRequest, res: Response) {
        try {
            console.log('📊 Controller: Getting reporte anual...');

            // Validar permisos
            if (!this.validarPermisosReportes(req)) {
                return res.status(403).json({
                    success: false,
                    error: 'No tiene permisos para acceder a reportes'
                });
            }

            const { anio } = req.query;
            const anioNum = anio ? parseInt(anio as string) : new Date().getFullYear();

            const reporte = await reportesConsolidadosService.getReporteAnual(anioNum);
            this.success(res, reporte, 'Reporte anual obtenido exitosamente');
        } catch (error) {
            console.error('❌ Controller: Error getting reporte anual:', error);
            this.handleError(res, error, 'Error al obtener reporte anual');
        }
    }

    // Obtener reporte por municipio
    async getReportePorMunicipio(req: AuthenticatedRequest, res: Response) {
        try {
            console.log('🏘️  Controller: Getting reporte por municipio...');

            // Validar permisos
            if (!this.validarPermisosReportes(req)) {
                return res.status(403).json({
                    success: false,
                    error: 'No tiene permisos para acceder a reportes'
                });
            }

            const { municipio_id, mes, anio } = req.query;
            if (!municipio_id) {
                return res.status(400).json({
                    success: false,
                    error: 'municipio_id es requerido'
                });
            }

            const mesNum = mes ? parseInt(mes as string) : undefined;
            const anioNum = anio ? parseInt(anio as string) : undefined;

            const reporte = await reportesConsolidadosService.getReportePorMunicipio(
                municipio_id as string,
                mesNum,
                anioNum
            );
            this.success(res, reporte, 'Reporte por municipio obtenido exitosamente');
        } catch (error) {
            console.error('❌ Controller: Error getting reporte por municipio:', error);
            this.handleError(res, error, 'Error al obtener reporte por municipio');
        }
    }

    // Obtener comparativa entre períodos
    async getComparativa(req: AuthenticatedRequest, res: Response) {
        try {
            console.log('📊 Controller: Getting comparativa...');

            // Validar permisos
            if (!this.validarPermisosReportes(req)) {
                return res.status(403).json({
                    success: false,
                    error: 'No tiene permisos para acceder a reportes'
                });
            }

            const { mes1, anio1, mes2, anio2 } = req.query;
            if (!mes1 || !anio1 || !mes2 || !anio2) {
                return res.status(400).json({
                    success: false,
                    error: 'mes1, anio1, mes2, anio2 son requeridos'
                });
            }

            const comparativa = await reportesConsolidadosService.getComparativa(
                parseInt(mes1 as string),
                parseInt(anio1 as string),
                parseInt(mes2 as string),
                parseInt(anio2 as string)
            );
            this.success(res, comparativa, 'Comparativa obtenida exitosamente');
        } catch (error) {
            console.error('❌ Controller: Error getting comparativa:', error);
            this.handleError(res, error, 'Error al obtener comparativa');
        }
    }

    // ========== CACHÉ ==========

    // Obtener estadísticas del caché
    async getCacheEstadisticas(req: AuthenticatedRequest, res: Response) {
        try {
            console.log('💾 Controller: Getting cache statistics...');

            // Validar permisos (solo admin y super_admin)
            const rolesPermitidos = ['ADMIN', 'SUPER_ADMIN'];
            const userRol = req.user?.rol?.toUpperCase();

            if (!rolesPermitidos.includes(userRol || '')) {
                console.warn(`⚠️  Controller: Usuario ${req.user?.email} sin permisos para ver caché`);
                return res.status(403).json({
                    success: false,
                    error: 'No tiene permisos para ver estadísticas del caché'
                });
            }

            const estadisticas = cacheService.getEstadisticas();
            this.success(res, estadisticas, 'Estadísticas del caché obtenidas exitosamente');
        } catch (error) {
            console.error('❌ Controller: Error getting cache statistics:', error);
            this.handleError(res, error, 'Error al obtener estadísticas del caché');
        }
    }

    // Limpiar caché expirado
    async clearExpiredCache(req: AuthenticatedRequest, res: Response) {
        try {
            console.log('🧹 Controller: Clearing expired cache...');

            // Validar permisos (solo admin y super_admin)
            const rolesPermitidos = ['ADMIN', 'SUPER_ADMIN'];
            const userRol = req.user?.rol?.toUpperCase();

            if (!rolesPermitidos.includes(userRol || '')) {
                console.warn(`⚠️  Controller: Usuario ${req.user?.email} sin permisos para limpiar caché`);
                return res.status(403).json({
                    success: false,
                    error: 'No tiene permisos para limpiar el caché'
                });
            }

            const deleted = cacheService.clearExpired();
            this.success(res, { deleted }, `${deleted} items expirados eliminados del caché`);
        } catch (error) {
            console.error('❌ Controller: Error clearing expired cache:', error);
            this.handleError(res, error, 'Error al limpiar caché expirado');
        }
    }

    // Limpiar todo el caché
    async clearAllCache(req: AuthenticatedRequest, res: Response) {
        try {
            console.log('🗑️  Controller: Clearing all cache...');

            // Validar permisos (solo super_admin)
            const userRol = req.user?.rol?.toUpperCase();

            if (userRol !== 'SUPER_ADMIN') {
                console.warn(`⚠️  Controller: Usuario ${req.user?.email} sin permisos para limpiar todo el caché`);
                return res.status(403).json({
                    success: false,
                    error: 'Solo super_admin puede limpiar todo el caché'
                });
            }

            cacheService.clear();
            this.success(res, {}, 'Caché limpiado completamente');
        } catch (error) {
            console.error('❌ Controller: Error clearing all cache:', error);
            this.handleError(res, error, 'Error al limpiar caché');
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

// Exportaciones PDF
export const getResumenGeneralPDF = (req: Request, res: Response) => reporteController.getResumenGeneralPDF(req, res);
export const getEstadisticasGestantesPDF = (req: Request, res: Response) => reporteController.getEstadisticasGestantesPDF(req, res);
export const getEstadisticasAlertasPDF = (req: Request, res: Response) => reporteController.getEstadisticasAlertasPDF(req, res);

// Exportaciones Excel
export const getResumenGeneralExcel = (req: Request, res: Response) => reporteController.getResumenGeneralExcel(req, res);
export const getEstadisticasGestantesExcel = (req: Request, res: Response) => reporteController.getEstadisticasGestantesExcel(req, res);
export const getEstadisticasControlesExcel = (req: Request, res: Response) => reporteController.getEstadisticasControlesExcel(req, res);
export const getEstadisticasAlertasExcel = (req: Request, res: Response) => reporteController.getEstadisticasAlertasExcel(req, res);
export const getEstadisticasRiesgoExcel = (req: Request, res: Response) => reporteController.getEstadisticasRiesgoExcel(req, res);
export const getTendenciasExcel = (req: Request, res: Response) => reporteController.getTendenciasExcel(req, res);

// Exportaciones Caché
export const getCacheEstadisticas = (req: Request, res: Response) => reporteController.getCacheEstadisticas(req, res);
export const clearExpiredCache = (req: Request, res: Response) => reporteController.clearExpiredCache(req, res);
export const clearAllCache = (req: Request, res: Response) => reporteController.clearAllCache(req, res);

// Exportaciones Fase 3: Reportes Consolidados
export const getReporteMensual = (req: Request, res: Response) => reporteController.getReporteMensual(req, res);
export const getReporteAnual = (req: Request, res: Response) => reporteController.getReporteAnual(req, res);
export const getReportePorMunicipio = (req: Request, res: Response) => reporteController.getReportePorMunicipio(req, res);
export const getComparativa = (req: Request, res: Response) => reporteController.getComparativa(req, res);

