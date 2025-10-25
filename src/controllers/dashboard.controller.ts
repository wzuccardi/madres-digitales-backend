// Controlador para dashboard
// Todos los datos provienen de la base de datos real, no se usan mocks
import { Request, Response } from 'express';
import { DashboardService } from '../services/dashboard.service';

const dashboardService = new DashboardService();

export const getEstadisticasGenerales = async (req: Request, res: Response) => {
	try {
		const estadisticas = await dashboardService.getEstadisticasGenerales();
		res.json(estadisticas);
	} catch (error) {
		console.error('Error al obtener estadísticas generales:', error);
		res.status(500).json({ error: 'Error al obtener estadísticas generales' });
	}
};

export const getEstadisticasPorPeriodo = async (req: Request, res: Response) => {
	try {
		const { fechaInicio, fechaFin } = req.query;
		const estadisticas = await dashboardService.getEstadisticasPorPeriodo(
			fechaInicio as string,
			fechaFin as string
		);
		res.json(estadisticas);
	} catch (error) {
		console.error('Error al obtener estadísticas por período:', error);
		res.status(500).json({ error: 'Error al obtener estadísticas por período' });
	}
};

export const getResumenAlertas = async (req: Request, res: Response) => {
	try {
		const resumen = await dashboardService.getResumenAlertas();
		res.json(resumen);
	} catch (error) {
		console.error('Error al obtener resumen de alertas:', error);
		res.status(500).json({ error: 'Error al obtener resumen de alertas' });
	}
};

export const getResumenControles = async (req: Request, res: Response) => {
	try {
		const resumen = await dashboardService.getResumenControles();
		res.json(resumen);
	} catch (error) {
		console.error('Error al obtener resumen de controles:', error);
		res.status(500).json({ error: 'Error al obtener resumen de controles' });
	}
};

export const getEstadisticasGeograficas = async (req: Request, res: Response) => {
	try {
		const { latitud, longitud, radio } = req.query;
		const estadisticas = await dashboardService.getEstadisticasGeograficas(
			latitud as string,
			longitud as string,
			radio as string
		);
		res.json(estadisticas);
	} catch (error) {
		console.error('Error al obtener estadísticas geográficas:', error);
		res.status(500).json({ error: 'Error al obtener estadísticas geográficas' });
	}
};

export const getEstadisticasDashboard = async (req: Request, res: Response) => {
	try {
		const { municipio_id, fecha_inicio, fecha_fin } = req.query;
		
		let estadisticas;
		if (municipio_id) {
			// Estadísticas por municipio
			estadisticas = await dashboardService.getEstadisticasGenerales();
		} else if (fecha_inicio && fecha_fin) {
			// Estadísticas por período
			estadisticas = await dashboardService.getEstadisticasPorPeriodo(
				fecha_inicio as string,
				fecha_fin as string
			);
		} else {
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
	} catch (error) {
		console.error('Error al obtener estadísticas del dashboard:', error);
		res.status(500).json({ error: 'Error al obtener estadísticas del dashboard' });
	}
};
