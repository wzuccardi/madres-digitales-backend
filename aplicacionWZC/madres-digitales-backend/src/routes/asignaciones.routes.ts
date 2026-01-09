import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/role.middleware';
import { listarAsignacionesMadrinas, asignarMadrina, desasignarMadrina } from '../controllers/asignacion.controller';

const router = Router();

router.use(authMiddleware);

router.get('/madrinas', requireAdmin(), listarAsignacionesMadrinas);
router.post('/madrinas', requireAdmin(), asignarMadrina);
router.delete('/madrinas', requireAdmin(), desasignarMadrina);

export default router;