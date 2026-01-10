import { Request, Response } from 'express';
import { BaseController } from './base.controller';
import { ReporteModel, TIPOS_REPORTE, ResumenGeneralData, EstadisticasMunicipioData, TendenciaData } from '../models/reporte.model';
import reporteService from '../services/reporte.service';

/**
 * Controlador de Reportes - Implementa el patrón MVC
 * Maneja todas las operaciones relacionadas con reportes y estadísticas
 */
export class ReporteController extends BaseController {
  
  /**
   * Obtener lista de reportes disponibles
   */
  public async getListaReportes(req: Request, res: Response): Promise<void> {
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
      this.handleError(res, error, 'Error al obtener lista de reportes');
    }
  }

  /**
   * Obtener resumen general del sistema
   */
  public async getResumenGeneral(req: Request, res: Response): Promise<void> {
    try {
      console.log('📊 Controller: Getting resumen general...');
      
      const resumenData = await reporteService.getResumenGeneral();
      
      // Crear modelo de reporte
      const reporte = new ReporteModel(
        'resumen-general',  // id
        'resumen-general',  // tipo
        'Resumen General del Sistema',  // titulo
        'Resumen general de todas las entidades del sistema',  // descripcion
        resumenData as any,  // datos
        new Date(),
        undefined,
        undefined,
        this.getAuthenticatedUser(req)?.id
      );
      
      this.success(res, reporte.toJSON(), 'Resumen general obtenido exitosamente');
    } catch (error) {
      this.handleError(res, error, 'Error al obtener resumen general');
    }
  }

  /**
   * Obtener estadísticas de gestantes por municipio
   */
  public async getEstadisticasGestantes(req: Request, res: Response): Promise<void> {
    try {
      console.log('📊 Controller: Getting estadísticas de gestantes...');
      
      const estadisticasData = await reporteService.getEstadisticasGestantes();
      
      // Crear modelo de reporte
      const reporte = new ReporteModel(
        'estadisticas-gestantes',  // id
        'estadisticas-gestantes',  // tipo
        'Estadísticas de Gestantes por Municipio',  // titulo
        'Estadísticas detalladas de gestantes agrupadas por municipio',  // descripcion
        estadisticasData as any,  // datos
        new Date(),
        undefined,
        undefined,
        this.getAuthenticatedUser(req)?.id
      );
      
      this.success(res, reporte.toJSON(), 'Estadísticas de gestantes obtenidas exitosamente');
    } catch (error) {
      this.handleError(res, error, 'Error al obtener estadísticas de gestantes');
    }
  }

  /**
   * Obtener estadísticas de controles prenatales
   */
  public async getEstadisticasControles(req: Request, res: Response): Promise<void> {
    try {
      console.log('📊 Controller: Getting estadísticas de controles...');
      
      const { fecha_inicio, fecha_fin } = req.query;
      
      const fechaInicio = fecha_inicio ? new Date(fecha_inicio as string) : undefined;
      const fechaFin = fecha_fin ? new Date(fecha_fin as string) : undefined;
      
      const estadisticasData = await reporteService.getEstadisticasControles(fechaInicio, fechaFin);
      
      // Crear modelo de reporte
      const reporte = new ReporteModel(
        'estadisticas-controles',  // id
        'estadisticas-controles',  // tipo
        'Estadísticas de Controles Prenatales',  // titulo
        `Estadísticas de controles desde ${fechaInicio?.toISOString().split('T')[0]} hasta ${fechaFin?.toISOString().split('T')[0]}`,  // descripcion
        estadisticasData as any,  // datos
        new Date(),
        fechaInicio,
        fechaFin,
        this.getAuthenticatedUser(req)?.id
      );
      
      this.success(res, reporte.toJSON(), 'Estadísticas de controles obtenidas exitosamente');
    } catch (error) {
      this.handleError(res, error, 'Error al obtener estadísticas de controles');
    }
  }

  /**
   * Obtener estadísticas de alertas
   */
  public async getEstadisticasAlertas(req: Request, res: Response): Promise<void> {
    try {
      console.log('📊 Controller: Getting estadísticas de alertas...');
      
      const estadisticasData = await reporteService.getEstadisticasAlertas();
      
      // Crear modelo de reporte
      const reporte = new ReporteModel(
        'estadisticas-alertas',  // id
        'estadisticas-alertas',  // tipo
        'Estadísticas de Alertas del Sistema',  // titulo
        'Estadísticas detalladas de alertas agrupadas por tipo y prioridad',  // descripcion
        estadisticasData as any,  // datos
        new Date(),
        undefined,
        undefined,
        this.getAuthenticatedUser(req)?.id
      );
      
      this.success(res, reporte.toJSON(), 'Estadísticas de alertas obtenidas exitosamente');
    } catch (error) {
      this.handleError(res, error, 'Error al obtener estadísticas de alertas');
    }
  }

  /**
   * Obtener estadísticas de riesgo
   */
  public async getEstadisticasRiesgo(req: Request, res: Response): Promise<void> {
    try {
      console.log('📊 Controller: Getting estadísticas de riesgo...');
      
      const estadisticasData = await reporteService.getEstadisticasRiesgo();
      
      // Crear modelo de reporte
      const reporte = new ReporteModel(
        'estadisticas-riesgo',  // id
        'estadisticas-riesgo',  // tipo
        'Estadísticas de Distribución de Riesgo',  // titulo
        'Distribución de gestantes por nivel de riesgo',  // descripcion
        estadisticasData as any,  // datos
        new Date(),
        undefined,
        undefined,
        this.getAuthenticatedUser(req)?.id
      );
      
      this.success(res, reporte.toJSON(), 'Estadísticas de riesgo obtenidas exitosamente');
    } catch (error) {
      this.handleError(res, error, 'Error al obtener estadísticas de riesgo');
    }
  }

  /**
   * Obtener tendencias temporales
   */
  public async getTendencias(req: Request, res: Response): Promise<void> {
    try {
      console.log('📊 Controller: Getting tendencias...');
      
      const { meses } = req.query;
      const mesesNum = meses ? parseInt(meses as string) : 6;
      
      const tendenciasData = await reporteService.getTendencias(mesesNum);
      
      // Crear modelo de reporte
      const reporte = new ReporteModel(
        'tendencias',  // id
        'tendencias',  // tipo
        'Tendencias Temporales del Sistema',  // titulo
        `Tendencias de los últimos ${mesesNum} meses`,  // descripcion
        tendenciasData as any,  // datos
        new Date(),
        undefined,
        undefined,
        this.getAuthenticatedUser(req)?.id
      );
      
      this.success(res, reporte.toJSON(), 'Tendencias obtenidas exitosamente');
    } catch (error) {
      this.handleError(res, error, 'Error al obtener tendencias');
    }
  }
}

// Exportar las funciones del controlador para compatibilidad con rutas existentes
export const getListaReportes = (req: Request, res: Response) => {
  const controller = new ReporteController();
  return controller.getListaReportes(req, res);
};

export const getResumenGeneral = (req: Request, res: Response) => {
  const controller = new ReporteController();
  return controller.getResumenGeneral(req, res);
};

export const getEstadisticasGestantes = (req: Request, res: Response) => {
  const controller = new ReporteController();
  return controller.getEstadisticasGestantes(req, res);
};

export const getEstadisticasControles = (req: Request, res: Response) => {
  const controller = new ReporteController();
  return controller.getEstadisticasControles(req, res);
};

export const getEstadisticasAlertas = (req: Request, res: Response) => {
  const controller = new ReporteController();
  return controller.getEstadisticasAlertas(req, res);
};

export const getEstadisticasRiesgo = (req: Request, res: Response) => {
  const controller = new ReporteController();
  return controller.getEstadisticasRiesgo(req, res);
};

export const getTendencias = (req: Request, res: Response) => {
  const controller = new ReporteController();
  return controller.getTendencias(req, res);
};