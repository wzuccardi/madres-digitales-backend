import { Router } from 'express';
import {
	getAllIPS,
	getIPSById,
	createIPS,
	updateIPS,
	deleteIPS,
	getIPSCercanas,
	getIPSByMunicipio,
	getIPSByNivel
} from '../controllers/ips.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Aplicar autenticación a todas las rutas
router.use(authMiddleware);

// Rutas específicas (deben ir antes de las rutas con parámetros)
router.get('/cercanas', getIPSCercanas); // Buscar IPS cercanas
router.get('/municipio/:municipioId', getIPSByMunicipio); // IPS por municipio
router.get('/nivel/:nivel', getIPSByNivel); // IPS por nivel de atención

// Rutas básicas CRUD
router.get('/', getAllIPS);
router.get('/:id', getIPSById);
router.post('/', createIPS);
router.put('/:id', updateIPS);
router.delete('/:id', deleteIPS);

export default router;
