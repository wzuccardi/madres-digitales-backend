import { Router } from 'express';
import { getResumenIntegrado } from '../controllers/municipios.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Rutas protegidas para administradores
router.get('/resumen-integrado', authMiddleware, getResumenIntegrado); // Resumen integrado del sistema

export default router;
