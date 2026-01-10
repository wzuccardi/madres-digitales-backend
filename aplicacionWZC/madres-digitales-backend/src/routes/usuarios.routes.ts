import { Router } from 'express';
import { 
  getAllUsuarios, 
  getUsuarioById, 
  getUsuariosByRol,
  getUsuariosByMunicipio,
  getMedicos,
  getMadrinas,
  getCoordinadores,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  asignarRol,
  getMiPerfil,
  actualizarMiPerfil
} from '../controllers/usuario.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireAdmin, requireCoordinador } from '../middlewares/role.middleware';

const router = Router();

// Rutas protegidas para perfil propio
router.get('/me/perfil', authMiddleware, getMiPerfil);
router.put('/me/perfil', authMiddleware, actualizarMiPerfil);

// Rutas específicas (deben ir antes de las rutas con parámetros)
router.get('/medicos', getMedicos); // Obtener todos los médicos
router.get('/madrinas', getMadrinas); // Obtener todas las madrinas
router.get('/coordinadores', getCoordinadores); // Obtener todos los coordinadores
router.get('/rol/:rol', getUsuariosByRol); // Usuarios por rol
router.get('/municipio/:municipioId', getUsuariosByMunicipio); // Usuarios por municipio

// Rutas básicas
router.get('/', getAllUsuarios);
router.get('/:id', getUsuarioById);

// CRUD protegido
router.post('/', authMiddleware, requireAdmin(), createUsuario);
router.put('/:id', authMiddleware, updateUsuario); // Ahora permite edición según permisos
router.delete('/:id', authMiddleware, requireAdmin(), deleteUsuario);

// Asignación de roles (solo admin y super_admin)
router.patch('/:id/rol', authMiddleware, requireAdmin(), asignarRol);

export default router;
