import { Router } from 'express';
import {
  getMunicipios,
  getMunicipio,
  getMunicipiosIntegrados,
  getResumenIntegrado,
  activarMunicipio,
  desactivarMunicipio,
  getEstadisticasMunicipios,
  buscarMunicipiosCercanos,
  buscarIPSCercanas,
  importarMunicipiosBolivar,
} from '../controllers/municipios.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Rutas públicas
router.get('/', getMunicipios); // Obtener municipios con filtros
router.get('/integrados', authMiddleware, getMunicipiosIntegrados); // Obtener municipios con estadísticas integradas
router.get('/stats', getEstadisticasMunicipios); // Estadísticas generales
router.get('/cercanos', buscarMunicipiosCercanos); // Buscar municipios cercanos
router.get('/ips-cercanas', buscarIPSCercanas); // Buscar IPS cercanas
router.get('/:id', getMunicipio); // Obtener municipio por ID

// Rutas protegidas para SUPER ADMINISTRADOR
router.post('/import/bolivar', authMiddleware, importarMunicipiosBolivar); // Importar municipios de Bolívar
router.post('/:id/activar', authMiddleware, activarMunicipio); // Activar municipio
router.post('/:id/desactivar', authMiddleware, desactivarMunicipio); // Desactivar municipio

export default router;
