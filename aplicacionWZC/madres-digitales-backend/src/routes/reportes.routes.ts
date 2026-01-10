import { Router } from 'express';
import { reportesController } from '../controllers/reportes.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Generar reporte completo
router.get('/generar', reportesController.generarReporte);

// Obtener municipios para filtros
router.get('/municipios', reportesController.obtenerMunicipios);

// Obtener madrinas para filtros
router.get('/madrinas', reportesController.obtenerMadrinas);

export default router;