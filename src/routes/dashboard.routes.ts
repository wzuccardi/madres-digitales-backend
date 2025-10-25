import { Router } from 'express';
import {
	getEstadisticasGenerales,
	getEstadisticasPorPeriodo,
	getResumenAlertas,
	getResumenControles,
	getEstadisticasGeograficas,
	getEstadisticasDashboard
} from '../controllers/dashboard.controller';

const router = Router();

// Rutas del dashboard
router.get('/estadisticas-generales', getEstadisticasGenerales);
router.get('/estadisticas-periodo', getEstadisticasPorPeriodo);
router.get('/estadisticas-geograficas', getEstadisticasGeograficas);
router.get('/resumen-alertas', getResumenAlertas);
router.get('/resumen-controles', getResumenControles);
router.get('/estadisticas', getEstadisticasDashboard);

export default router;
