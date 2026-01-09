import { Request, Response } from 'express';
import { reportesService, FiltrosReporte } from '../services/reportes.service';
import { log } from '../config/logger';

export class ReportesController {
  
  async generarReporte(req: Request, res: Response) {
    try {
      const { municipioId, madrinaId, fechaInicio, fechaFin } = req.query;
      
      const filtros: FiltrosReporte = {};
      
      if (municipioId && typeof municipioId === 'string') {
        filtros.municipioId = municipioId;
      }
      
      if (madrinaId && typeof madrinaId === 'string') {
        filtros.madrinaId = madrinaId;
      }
      
      if (fechaInicio && typeof fechaInicio === 'string') {
        filtros.fechaInicio = new Date(fechaInicio);
      }
      
      if (fechaFin && typeof fechaFin === 'string') {
        filtros.fechaFin = new Date(fechaFin);
      }

      log.info('Generando reporte con filtros', { filtros });

      const reporte = await reportesService.generarReporteCompleto(filtros);
      
      res.json({
        success: true,
        data: reporte
      });
      
    } catch (error) {
      log.error('Error generando reporte', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  async obtenerMunicipios(req: Request, res: Response) {
    try {
      const municipios = await reportesService.obtenerMunicipios();
      
      res.json({
        success: true,
        data: municipios
      });
      
    } catch (error) {
      log.error('Error obteniendo municipios', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  async obtenerMadrinas(req: Request, res: Response) {
    try {
      const { municipioId } = req.query;
      
      const madrinas = await reportesService.obtenerMadrinas(
        municipioId && typeof municipioId === 'string' ? municipioId : undefined
      );
      
      res.json({
        success: true,
        data: madrinas
      });
      
    } catch (error) {
      log.error('Error obteniendo madrinas', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
}

export const reportesController = new ReportesController();