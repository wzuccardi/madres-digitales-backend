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
import { validate } from '../middlewares/validation.middleware';
import { crearAlertaSchema } from '../schemas/alerta.schema';

const router = Router();

// Aplicar autenticación a todas las rutas
router.use(authMiddleware);

// Rutas con control de permisos
router.get('/', getAlertasByUser); // Alertas filtradas por permisos del usuario
router.get('/crud', getAlertasByUser); // Alias para compatibilidad con frontend
router.get('/all', requireAdmin, getAllAlertas); // Solo administradores ven todas las alertas
router.get('/activas', getAlertasActivas); // Alertas activas filtradas por permisos

// Rutas específicas DEBEN ir ANTES de las rutas con parámetros genéricos
router.get('/gestante/:gestanteId', requireCoordinador, getAlertasByGestante);

// Rutas específicas para funcionalidades especiales
router.post('/emergencia', notificarEmergencia); // Endpoint SOS
router.put('/:id/resolver', resolverAlerta); // Resolver alerta con validación de permisos

// Rutas genéricas con :id DEBEN ir AL FINAL para evitar conflictos
router.get('/:id', getAlertaById); // Validación de permisos dentro del controlador
router.post('/', validate(crearAlertaSchema), createAlerta); // Validación de datos + permisos en controlador
router.put('/:id', updateAlerta); // Validación de permisos dentro del controlador
router.delete('/:id', requireCoordinador, deleteAlerta);

export default router;
