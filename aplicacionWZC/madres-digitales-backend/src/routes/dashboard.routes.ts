// CÓDIGO ORIGINAL COMENTADO - Sin middleware de autenticación
// import { Router } from 'express';
// import {
// 	getEstadisticasGenerales,
// 	getEstadisticasPorPeriodo,
// 	getResumenAlertas,
// 	getResumenControles,
// 	getEstadisticasGeograficas,
// 	getEstadisticasDashboard
// } from '../controllers/dashboard.controller';

// CÓDIGO MODIFICADO - Con middleware de autenticación
import { Router } from 'express';
import {
	getEstadisticasGenerales,
	getEstadisticasPorPeriodo,
	getResumenAlertas,
	getResumenControles,
	getEstadisticasGeograficas,
	getEstadisticasDashboard
} from '../controllers/dashboard.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// CÓDIGO ORIGINAL COMENTADO - Rutas sin autenticación
// // Rutas del dashboard
// router.get('/estadisticas-generales', getEstadisticasGenerales);
// router.get('/estadisticas-periodo', getEstadisticasPorPeriodo);
// router.get('/estadisticas-geograficas', getEstadisticasGeograficas);
// router.get('/resumen-alertas', getResumenAlertas);
// router.get('/resumen-controles', getResumenControles);
// router.get('/estadisticas', getEstadisticasDashboard);

// CÓDIGO MODIFICADO - Rutas con middleware de autenticación
// Rutas del dashboard - Protegidas con autenticación
router.get('/estadisticas-generales', authMiddleware, getEstadisticasGenerales);
router.get('/estadisticas-periodo', authMiddleware, getEstadisticasPorPeriodo);
router.get('/estadisticas-geograficas', authMiddleware, getEstadisticasGeograficas);
router.get('/resumen-alertas', authMiddleware, getResumenAlertas);
router.get('/resumen-controles', authMiddleware, getResumenControles);
router.get('/estadisticas', authMiddleware, getEstadisticasDashboard);

export default router;
