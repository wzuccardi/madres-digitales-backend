import { Router } from 'express';
import { 
  getAllUsuarios, 
  getUsuarioById, 
  getUsuariosByRol,
  getUsuariosByMunicipio,
  getMedicos,
  getMadrinas,
  getCoordinadores
} from '../controllers/usuario.controller';

const router = Router();

// Rutas específicas (deben ir antes de las rutas con parámetros)
router.get('/medicos', getMedicos); // Obtener todos los médicos
router.get('/madrinas', getMadrinas); // Obtener todas las madrinas
router.get('/coordinadores', getCoordinadores); // Obtener todos los coordinadores
router.get('/rol/:rol', getUsuariosByRol); // Usuarios por rol
router.get('/municipio/:municipioId', getUsuariosByMunicipio); // Usuarios por municipio

// Rutas básicas
router.get('/', getAllUsuarios);
router.get('/:id', getUsuarioById);

export default router;
