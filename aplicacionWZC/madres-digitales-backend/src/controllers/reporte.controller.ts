// Controlador para reportes y estadísticas
import { Request, Response } from 'express';
import reporteService from '../services/reporte.service';
import AsignacionRepositoryImpl from '../infrastructure/repositories/asignacion.repository.impl';
import exportPdfService from '../services/export-pdf.service';
import exportExcelService from '../services/export-excel.service';
import cacheService from '../services/cache.service';
import reportesConsolidadosService from '../services/reportes-consolidados.service';
import { BaseController } from './base.controller';
import { getUserForFiltering, hasAdminAccess } from '../utils/auth.utils';

// Interfaz para request autenticado
interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        rol: string;
        email: string;
    };
}

class ReporteController extends BaseController {

    // Validar permisos para ver reportes (alineado con gestante)
    private validarPermisosReportes(req: AuthenticatedRequest): boolean {
        const rol = String(req.user?.rol || '').toLowerCase();
        return hasAdminAccess(rol) || rol === 'madrina' || rol === 'medico';
    }

    // Obtener resumen general
    async getResumenGeneral(req: AuthenticatedRequest, res: Response) {
        try {
            console.log('📊 Controller: Getting resumen general...');

            if (!this.validarPermisosReportes(req)) {
                return res.status(403).json({ success: false, error: 'No tiene permiso para acceder a reportes' });
            }

            const user = await getUserForFiltering(req);
            const rol = String(user.rol || '').toLowerCase();
            let resumen;
            if (rol === 'madrina' || rol === 'medico') {
                resumen = await reporteService.getResumenGeneralFiltrado({ madrina_id: user.id });
            } else if (rol === 'coordinador') {
                const repo = new AsignacionRepositoryImpl();
                const asignaciones = await repo.listarPorCoordinador(user.id);
                const madrinasIds = asignaciones.map((a: any) => a.madrina_id);
                resumen = await reporteService.getResumenGeneralFiltrado({ madrinas_ids: madrinasIds });
            } else {
                resumen = await reporteService.getResumenGeneral();
            }
            this.success(res, resumen, 'Resumen general obtenido exitosamente');
        } catch (error) {
            console.error('❌ Controller: Error getting resumen general:', error);
            this.handleError(res, error, 'Error al obtener resumen general');
        }
    }

    // Obtener lista de reportes disponibles
    async getListaReportes(req: AuthenticatedRequest, res: Response) {
        try {
            console.log('📊 Controller: Getting lista de reportes...');
            if (!this.validarPermisosReportes(req)) {
                return res.status(403).json({
                    success: false,
                    error: 'No tiene permisos para acceder a reportes'
                });
            }
            
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
                    error: 'No tiene permiso para acceder a reportes'
                });
            }

            // Obtener filtros de query parameters
            const filtros: any = {
                municipio_id: req.query.municipio_id as string,
                riesgo: req.query.riesgo as 'alto' | 'bajo',
                madrina_id: req.query.madrina_id as string
            };

            const user = await getUserForFiltering(req);
            const rol = String(user.rol || '').toLowerCase();
            if (rol === 'madrina' || rol === 'medico') {
                filtros.madrina_id = user.id;
            } else if (rol === 'coordinador') {
                const repo = new AsignacionRepositoryImpl();
                const asignaciones = await repo.listarPorCoordinador(user.id);
                const madrinasIds = asignaciones.map((a: any) => a.madrina_id);
                filtros.madrina_ids = madrinasIds;
            }

            console.log('📊 Controller: Filtros aplicados:', filtros);
            const estadisticas = await reporteService.getEstadisticasGestantes(filtros);
            this.success(res, estadisticas, 'Estadísticas de gestantes obtenidas exitosamente');
        } catch (error) {
            console.error('❌ Controller: Error getting estadísticas de gestantes:', error);
            this.handleError(res, error, 'Error al obtener estadísticas de gestantes');
        }
    }

    // Obtener estadísticas de controles
    async getEstadisticasControles(req: AuthenticatedRequest, res: Response) {
        try {
            console.log('📊 Controller: Getting estadísticas de controles...');
            console.log('📊 DEBUG: Usuario:', req.user?.email, 'Rol:', req.user?.rol);
            if (!this.validarPermisosReportes(req)) {
                return res.status(403).json({
                    success: false,
                    error: 'No tiene permiso para acceder a reportes'
                });
            }
            
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
    async getEstadisticasAlertas(req: AuthenticatedRequest, res: Response) {
        try {
            console.log('📊 Controller: Getting estadísticas de alertas...');
            console.log('📊 DEBUG: Usuario:', req.user?.email, 'Rol:', req.user?.rol);
            if (!this.validarPermisosReportes(req)) {
                return res.status(403).json({
                    success: false,
                    error: 'No tiene permiso para acceder a reportes'
                });
            }
            const estadisticas = await reporteService.getEstadisticasAlertas();
            this.success(res, estadisticas, 'Estadísticas de alertas obtenidas exitosamente');
        } catch (error) {
            console.error('❌ Controller: Error getting estadísticas de alertas:', error);
            this.handleError(res, error, 'Error al obtener estadísticas de alertas');
        }
    }

    // Obtener estadísticas de riesgo
    async getEstadisticasRiesgo(req: AuthenticatedRequest, res: Response) {
        try {
            console.log('📊 Controller: Getting estadísticas de riesgo...');
            console.log('📊 DEBUG: Usuario:', req.user?.email, 'Rol:', req.user?.rol);
            if (!this.validarPermisosReportes(req)) {
                return res.status(403).json({
                    success: false,
                    error: 'No tiene permiso para acceder a reportes'
                });
            }
            const estadisticas = await reporteService.getEstadisticasRiesgo();
            this.success(res, estadisticas, 'Estadísticas de riesgo obtenidas exitosamente');
        } catch (error) {
            console.error('❌ Controller: Error getting estadísticas de riesgo:', error);
            this.handleError(res, error, 'Error al obtener estadísticas de riesgo');
        }
    }

    // Obtener tendencias
    async getTendencias(req: AuthenticatedRequest, res: Response) {
        try {
            console.log('📊 Controller: Getting tendencias...');
            console.log('📊 DEBUG: Usuario:', req.user?.email, 'Rol:', req.user?.rol);
            if (!this.validarPermisosReportes(req)) {
                return res.status(403).json({
                    success: false,
                    error: 'No tiene permiso para acceder a reportes'
                });
            }
            
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
    async getResumenGeneralPDF(req: AuthenticatedRequest, res: Response) {
        try {
            console.log('📊 Controller: Downloading resumen general as PDF...');
            console.log('📊 DEBUG: Usuario:', req.user?.email, 'Rol:', req.user?.rol);
            if (!this.validarPermisosReportes(req)) {
                return res.status(403).json({ error: 'No tiene permiso para acceder a reportes' });
            }
            const resumen = await reporteService.getResumenGeneral();
            const buffer = exportPdfService.generateResumenGeneralPDF(resumen);
            exportPdfService.sendPDF(res, buffer, 'resumen-general.pdf');
        } catch (error) {
            console.error('❌ Controller: Error downloading resumen general PDF:', error);
            this.handleError(res, error, 'Error al descargar resumen general');
        }
    }

    // Descargar estadísticas de gestantes como PDF
    async getEstadisticasGestantesPDF(req: AuthenticatedRequest, res: Response) {
        try {
            console.log('📊 Controller: Downloading estadísticas gestantes as PDF...');
            console.log('📊 DEBUG: Usuario:', req.user?.email, 'Rol:', req.user?.rol);
            if (!this.validarPermisosReportes(req)) {
                return res.status(403).json({ error: 'No tiene permiso para acceder a reportes' });
            }
            const estadisticas = await reporteService.getEstadisticasGestantes();
            const buffer = exportPdfService.generateEstadisticasGestantesPDF(estadisticas);
            exportPdfService.sendPDF(res, buffer, 'estadisticas-gestantes.pdf');
        } catch (error) {
            console.error('❌ Controller: Error downloading estadísticas gestantes PDF:', error);
            this.handleError(res, error, 'Error al descargar estadísticas gestantes');
        }
    }

    // Descargar estadísticas de alertas como PDF
    async getEstadisticasAlertasPDF(req: AuthenticatedRequest, res: Response) {
        try {
            console.log('📊 Controller: Downloading estadísticas alertas as PDF...');
            console.log('📊 DEBUG: Usuario:', req.user?.email, 'Rol:', req.user?.rol);
            if (!this.validarPermisosReportes(req)) {
                return res.status(403).json({ error: 'No tiene permiso para acceder a reportes' });
            }
            const estadisticas = await reporteService.getEstadisticasAlertas();
            const buffer = exportPdfService.generateEstadisticasAlertasPDF(estadisticas);
            exportPdfService.sendPDF(res, buffer, 'estadisticas-alertas.pdf');
        } catch (error) {
            console.error('❌ Controller: Error downloading estadísticas alertas PDF:', error);
            this.handleError(res, error, 'Error al descargar estadísticas alertas');
        }
    }

    // Descargar estadísticas de controles como PDF
    async getEstadisticasControlesPDF(req: AuthenticatedRequest, res: Response) {
        try {
            console.log('📊 Controller: Downloading estadísticas controles as PDF...');
            console.log('📊 DEBUG: Usuario:', req.user?.email, 'Rol:', req.user?.rol);
            if (!this.validarPermisosReportes(req)) {
                return res.status(403).json({ error: 'No tiene permiso para acceder a reportes' });
            }
            const { fecha_inicio, fecha_fin } = req.query;
            const fechaInicio = fecha_inicio ? new Date(fecha_inicio as string) : undefined;
            const fechaFin = fecha_fin ? new Date(fecha_fin as string) : undefined;
            const estadisticas = await reporteService.getEstadisticasControles(fechaInicio, fechaFin);
            const buffer = exportPdfService.generateEstadisticasControlesPDF(estadisticas);
            exportPdfService.sendPDF(res, buffer, 'estadisticas-controles.pdf');
        } catch (error) {
            console.error('❌ Controller: Error downloading estadísticas controles PDF:', error);
            this.handleError(res, error, 'Error al descargar estadísticas controles');
        }
    }

    // Descargar estadísticas de riesgo como PDF
    async getEstadisticasRiesgoPDF(req: AuthenticatedRequest, res: Response) {
        try {
            console.log('📊 Controller: Downloading estadísticas riesgo as PDF...');
            console.log('📊 DEBUG: Usuario:', req.user?.email, 'Rol:', req.user?.rol);
            if (!this.validarPermisosReportes(req)) {
                return res.status(403).json({ error: 'No tiene permiso para acceder a reportes' });
            }
            const estadisticas = await reporteService.getEstadisticasRiesgo();
            const buffer = exportPdfService.generateEstadisticasRiesgoPDF(estadisticas);
            exportPdfService.sendPDF(res, buffer, 'estadisticas-riesgo.pdf');
        } catch (error) {
            console.error('❌ Controller: Error downloading estadísticas riesgo PDF:', error);
            this.handleError(res, error, 'Error al descargar estadísticas riesgo');
        }
    }

    // Descargar tendencias como PDF
    async getTendenciasPDF(req: AuthenticatedRequest, res: Response) {
        try {
            console.log('📊 Controller: Downloading tendencias as PDF...');
            console.log('📊 DEBUG: Usuario:', req.user?.email, 'Rol:', req.user?.rol);
            if (!this.validarPermisosReportes(req)) {
                return res.status(403).json({ error: 'No tiene permiso para acceder a reportes' });
            }
            const { meses } = req.query;
            const mesesNum = meses ? parseInt(meses as string) : 6;
            const tendencias = await reporteService.getTendencias(mesesNum);
            const buffer = exportPdfService.generateTendenciasPDF(tendencias);
            exportPdfService.sendPDF(res, buffer, 'tendencias.pdf');
        } catch (error) {
            console.error('❌ Controller: Error downloading tendencias PDF:', error);
            this.handleError(res, error, 'Error al descargar tendencias');
        }
    }

    // ========== DESCARGAS EXCEL ==========

    // Descargar resumen general como Excel
    async getResumenGeneralExcel(req: AuthenticatedRequest, res: Response) {
        try {
            console.log('📊 Controller: Downloading resumen general as Excel...');
            console.log('📊 DEBUG: Usuario:', req.user?.email, 'Rol:', req.user?.rol);
            if (!this.validarPermisosReportes(req)) {
                return res.status(403).json({ error: 'No tiene permiso para acceder a reportes' });
            }
            const resumen = await reporteService.getResumenGeneral();
            const buffer = exportExcelService.generateResumenGeneralExcel(resumen);
            exportExcelService.sendExcel(res, buffer, 'resumen-general.xlsx');
        } catch (error) {
            console.error('❌ Controller: Error downloading resumen general Excel:', error);
            this.handleError(res, error, 'Error al descargar resumen general');
        }
    }

    // Descargar estadísticas de gestantes como Excel
    async getEstadisticasGestantesExcel(req: AuthenticatedRequest, res: Response) {
        try {
            console.log('📊 Controller: Downloading estadísticas gestantes as Excel...');
            console.log('📊 DEBUG: Usuario:', req.user?.email, 'Rol:', req.user?.rol);
            if (!this.validarPermisosReportes(req)) {
                return res.status(403).json({ error: 'No tiene permiso para acceder a reportes' });
            }
            const estadisticas = await reporteService.getEstadisticasGestantes();
            const buffer = exportExcelService.generateEstadisticasGestantesExcel(estadisticas);
            exportExcelService.sendExcel(res, buffer, 'estadisticas-gestantes.xlsx');
        } catch (error) {
            console.error('❌ Controller: Error downloading estadísticas gestantes Excel:', error);
            this.handleError(res, error, 'Error al descargar estadísticas gestantes');
        }
    }

    // Descargar estadísticas de controles como Excel
    async getEstadisticasControlesExcel(req: AuthenticatedRequest, res: Response) {
        try {
            console.log('📊 Controller: Downloading estadísticas controles as Excel...');
            console.log('📊 DEBUG: Usuario:', req.user?.email, 'Rol:', req.user?.rol);
            if (!this.validarPermisosReportes(req)) {
                return res.status(403).json({ error: 'No tiene permiso para acceder a reportes' });
            }
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
    async getEstadisticasAlertasExcel(req: AuthenticatedRequest, res: Response) {
        try {
            console.log('📊 Controller: Downloading estadísticas alertas as Excel...');
            console.log('📊 DEBUG: Usuario:', req.user?.email, 'Rol:', req.user?.rol);
            if (!this.validarPermisosReportes(req)) {
                return res.status(403).json({ error: 'No tiene permiso para acceder a reportes' });
            }
            const estadisticas = await reporteService.getEstadisticasAlertas();
            const buffer = exportExcelService.generateEstadisticasAlertasExcel(estadisticas);
            exportExcelService.sendExcel(res, buffer, 'estadisticas-alertas.xlsx');
        } catch (error) {
            console.error('❌ Controller: Error downloading estadísticas alertas Excel:', error);
            this.handleError(res, error, 'Error al descargar estadísticas alertas');
        }
    }

    // Descargar estadísticas de riesgo como Excel
    async getEstadisticasRiesgoExcel(req: AuthenticatedRequest, res: Response) {
        try {
            console.log('📊 Controller: Downloading estadísticas riesgo as Excel...');
            console.log('📊 DEBUG: Usuario:', req.user?.email, 'Rol:', req.user?.rol);
            if (!this.validarPermisosReportes(req)) {
                return res.status(403).json({ error: 'No tiene permisos para acceder a reportes' });
            }
            const estadisticas = await reporteService.getEstadisticasRiesgo();
            const buffer = exportExcelService.generateEstadisticasRiesgoExcel(estadisticas);
            exportExcelService.sendExcel(res, buffer, 'estadisticas-riesgo.xlsx');
        } catch (error) {
            console.error('❌ Controller: Error downloading estadísticas riesgo Excel:', error);
            this.handleError(res, error, 'Error al descargar estadísticas riesgo');
        }
    }

    // Descargar tendencias como Excel
    async getTendenciasExcel(req: AuthenticatedRequest, res: Response) {
        try {
            console.log('📊 Controller: Downloading tendencias as Excel...');
            console.log('📊 DEBUG: Usuario:', req.user?.email, 'Rol:', req.user?.rol);
            if (!this.validarPermisosReportes(req)) {
                return res.status(403).json({ error: 'No tiene permisos para acceder a reportes' });
            }
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
                    error: 'No tiene permiso para acceder a reportes'
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
                    error: 'No tiene permiso para acceder a reportes'
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
                    error: 'No tiene permiso para acceder a reportes'
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
                    error: 'No tiene permiso para acceder a reportes'
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
            const user = await getUserForFiltering(req);
            const rolLower = String(user.rol || '').toLowerCase();
            if (!hasAdminAccess(rolLower)) {
                console.warn(`⚠️  Controller: Usuario ${req.user?.email} sin permisos para ver caché`);
                return res.status(403).json({
                    success: false,
                    error: 'No tiene permiso para ver estadísticas del caché'
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
            const user = await getUserForFiltering(req);
            const rolLower = String(user.rol || '').toLowerCase();
            if (!hasAdminAccess(rolLower)) {
                console.warn(`⚠️  Controller: Usuario ${req.user?.email} sin permisos para limpiar caché`);
                return res.status(403).json({
                    success: false,
                    error: 'No tiene permiso para limpiar el caché'
                });
            }

            const deleted = cacheService.clearExpired();
            this.success(res, { deleted }, `${deleted} items expirados eliminados del caché`);
        } catch (error) {
            console.error('❌ Controller: Error clearing expired cache:', error);
            this.handleError(res, error, 'Error al limpiar caché expirado');
        }
    }

    // ========== EXPORTAR REPORTES (PDF/EXCEL) ==========

    // Exportar reportes en diferentes formatos
    async exportarReporte(req: AuthenticatedRequest, res: Response) {
        try {
            const { tipo, formato } = req.params;
            const { fechaInicio, fechaFin, municipioId, madrinaId } = req.query;

            console.log(`📊 Controller: Exportando reporte ${tipo} en formato ${formato}...`);

            // Validar permisos
            if (!this.validarPermisosReportes(req)) {
                return res.status(403).json({
                    success: false,
                    error: 'No tiene permiso para exportar reportes'
                });
            }

            // Validar parámetros
            if (!tipo || !formato) {
                return res.status(400).json({
                    success: false,
                    error: 'Tipo y formato son requeridos'
                });
            }

            if (!['pdf', 'excel'].includes(formato as string)) {
                return res.status(400).json({
                    success: false,
                    error: 'Formato debe ser pdf o excel'
                });
            }

            // Obtener datos según el tipo de reporte
            let datos;
            switch (tipo) {
                case 'resumen-general':
                    datos = await this.obtenerDatosResumenGeneral({ fechaInicio, fechaFin, municipioId, madrinaId });
                    break;
                default:
                    return res.status(400).json({
                        success: false,
                        error: 'Tipo de reporte no válido'
                    });
            }

            // Generar archivo según formato
            if (formato === 'pdf') {
                const pdfBuffer = await exportPdfService.generateReportPDF(tipo as string, datos);
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename="reporte_${tipo}_${new Date().toISOString().split('T')[0]}.pdf"`);
                res.send(pdfBuffer);
            } else {
                const excelBuffer = await exportExcelService.generateReportExcel(tipo as string, datos);
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                res.setHeader('Content-Disposition', `attachment; filename="reporte_${tipo}_${new Date().toISOString().split('T')[0]}.xlsx"`);
                res.send(excelBuffer);
            }

        } catch (error) {
            console.error('Error exportando reporte:', error);
            res.status(500).json({
                success: false,
                error: `Error generando reporte: ${(error as Error).message}`
            });
        }
    }

    // Función auxiliar para obtener datos del resumen general
    private async obtenerDatosResumenGeneral(filtros: any) {
        try {
            const prisma = (await import('../config/database')).default;
            const whereGestantes: any = { activa: true };
            const whereControles: any = {};
            const whereAlertas: any = {};

            // Aplicar filtros de fecha
            if (filtros.fechaInicio && filtros.fechaFin) {
                const fechaInicio = new Date(filtros.fechaInicio);
                const fechaFin = new Date(filtros.fechaFin);
                
                whereControles.fecha_control = {
                    gte: fechaInicio,
                    lte: fechaFin
                };
                
                whereAlertas.fecha_creacion = {
                    gte: fechaInicio,
                    lte: fechaFin
                };
            }

            // Aplicar filtros de municipio y madrina
            if (filtros.municipioId) {
                whereGestantes.municipio_id = filtros.municipioId;
                whereControles.gestante = { municipio_id: filtros.municipioId };
                whereAlertas.gestante = { municipio_id: filtros.municipioId };
            }

            if (filtros.madrinaId) {
                whereGestantes.madrina_id = filtros.madrinaId;
                whereControles.gestante = { 
                    ...whereControles.gestante,
                    madrina_id: filtros.madrinaId 
                };
                whereAlertas.gestante = { 
                    ...whereAlertas.gestante,
                    madrina_id: filtros.madrinaId 
                };
            }

            // Obtener estadísticas de gestantes
            const totalGestantes = await prisma.gestantes.count({ where: whereGestantes });
            const gestantesAltoRiesgo = await prisma.gestantes.count({ 
                where: { ...whereGestantes, riesgo_alto: true } 
            });
            const gestantesSinFUM = await prisma.gestantes.count({ 
                where: { ...whereGestantes, fecha_ultima_menstruacion: null } 
            });

            // Obtener estadísticas de controles
            const totalControles = await prisma.control_prenatal.count({ where: whereControles });
            
            // Obtener estadísticas de alertas
            const totalAlertas = await prisma.alertas.count({ where: whereAlertas });
            const alertasActivas = await prisma.alertas.count({ 
                where: { ...whereAlertas, estado: 'activa' } 
            });

            // Obtener distribución por municipio
            const gestantesPorMunicipio = await prisma.gestantes.groupBy({
                by: ['municipio_id'],
                where: whereGestantes,
                _count: { id: true },
                orderBy: { _count: { id: 'desc' } }
            });

            // Obtener nombres de municipios
            const municipiosIds = gestantesPorMunicipio.map(g => g.municipio_id).filter(Boolean);
            const municipios = await prisma.municipios.findMany({
                where: { id: { in: municipiosIds } },
                select: { id: true, nombre: true }
            });

            const municipiosMap = municipios.reduce((acc, m) => {
                acc[m.id] = m.nombre;
                return acc;
            }, {} as Record<string, string>);

            // Formatear distribución por municipio
            const distribucionMunicipios = gestantesPorMunicipio.map(g => ({
                municipio: municipiosMap[g.municipio_id || ''] || 'Sin municipio',
                total: g._count.id
            }));

            return {
                total_gestantes: totalGestantes,
                gestantes_alto_riesgo: gestantesAltoRiesgo,
                gestantes_sin_fum: gestantesSinFUM,
                total_controles: totalControles,
                total_alertas: totalAlertas,
                alertas_activas: alertasActivas,
                distribucion_municipios: distribucionMunicipios,
                fecha_generacion: new Date().toISOString(),
                filtros_aplicados: {
                    fecha_inicio: filtros.fechaInicio,
                    fecha_fin: filtros.fechaFin,
                    municipio_id: filtros.municipioId,
                    madrina_id: filtros.madrinaId
                }
            };
        } catch (error) {
            console.error('Error obteniendo datos de resumen general:', error);
            throw new Error(`Error obteniendo datos: ${(error as Error).message}`);
        }
    }
    }

    // Limpiar todo el caché
    async clearAllCache(req: AuthenticatedRequest, res: Response) {
        try {
            console.log('🗑️  Controller: Clearing all cache...');

            // Validar permisos (solo super_admin)
            const user = await getUserForFiltering(req);
            const rolLower = String(user.rol || '').toLowerCase();
            if (rolLower !== 'super_admin') {
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
export const getEstadisticasControlesPDF = (req: Request, res: Response) => reporteController.getEstadisticasControlesPDF(req, res);
export const getEstadisticasAlertasPDF = (req: Request, res: Response) => reporteController.getEstadisticasAlertasPDF(req, res);
export const getEstadisticasRiesgoPDF = (req: Request, res: Response) => reporteController.getEstadisticasRiesgoPDF(req, res);
export const getTendenciasPDF = (req: Request, res: Response) => reporteController.getTendenciasPDF(req, res);

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

// Exportación genérica de reportes
export const exportarReporte = (req: Request, res: Response) => reporteController.exportarReporte(req, res);

