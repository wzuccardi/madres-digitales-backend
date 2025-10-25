import { Router } from 'express';
import {
  getAllMedicos,
  getMedicoById,
  createMedico,
  updateMedico,
  deleteMedico,
  getMedicosByIPS,
  getMedicosByEspecialidad
} from '../controllers/medico.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Aplicar autenticación a todas las rutas
router.use(authMiddleware);

// Rutas específicas (deben ir antes de las rutas con parámetros)
router.get('/ips/:ipsId', getMedicosByIPS); // Médicos por IPS
router.get('/especialidad/:especialidad', getMedicosByEspecialidad); // Médicos por especialidad

// Rutas básicas CRUD
router.get('/', getAllMedicos);
router.get('/:id', getMedicoById);
router.post('/', createMedico);
router.put('/:id', updateMedico);
router.delete('/:id', deleteMedico);

export default router;
