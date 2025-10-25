import { Router } from 'express';
import {
	getAllAlertas,
	getAlertaById,
	createAlerta,
	updateAlerta,
	deleteAlerta,
	notificarEmergencia,
	getAlertasByGestante,
	getAlertasActivas,
	resolverAlerta,
	getAlertasByUser
} from '../controllers/alerta.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import {
	requireAdmin,
	requireCoordinador
} from '../middlewares/role.middleware';

const router = Router();

// Aplicar autenticación a todas las rutas
router.use(authMiddleware);

// Rutas con control de permisos
router.get('/', getAlertasByUser); // Alertas filtradas por permisos del usuario
router.get('/crud', getAlertasByUser); // Alias para compatibilidad con frontend
router.get('/all', requireAdmin, getAllAlertas); // Solo administradores ven todas las alertas
router.get('/activas', getAlertasActivas); // Alertas activas filtradas por permisos
router.get('/gestante/:gestanteId', requireCoordinador, getAlertasByGestante);
router.get('/:id', getAlertaById); // Validación de permisos dentro del controlador
router.post('/', createAlerta); // Validación de permisos dentro del controlador
router.put('/:id', updateAlerta); // Validación de permisos dentro del controlador
router.delete('/:id', requireCoordinador, deleteAlerta);

// Rutas específicas para funcionalidades especiales
router.post('/emergencia', notificarEmergencia); // Endpoint SOS
router.put('/:id/resolver', resolverAlerta); // Resolver alerta con validación de permisos

export default router;
