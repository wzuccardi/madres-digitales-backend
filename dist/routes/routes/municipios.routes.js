"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const municipios_controller_1 = require("../controllers/municipios.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Rutas públicas
router.get('/', municipios_controller_1.getMunicipios); // Obtener municipios con filtros
router.get('/integrados', auth_middleware_1.authenticateToken, municipios_controller_1.getMunicipiosIntegrados); // Obtener municipios con estadísticas integradas
router.get('/stats', municipios_controller_1.getEstadisticasMunicipios); // Estadísticas generales
router.get('/cercanos', municipios_controller_1.buscarMunicipiosCercanos); // Buscar municipios cercanos
router.get('/ips-cercanas', municipios_controller_1.buscarIPSCercanas); // Buscar IPS cercanas
router.get('/:id', municipios_controller_1.getMunicipio); // Obtener municipio por ID
// Rutas protegidas para SUPER ADMINISTRADOR
router.post('/import/bolivar', auth_middleware_1.authenticateToken, municipios_controller_1.importarMunicipiosBolivar); // Importar municipios de Bolívar
router.post('/:id/activar', auth_middleware_1.authenticateToken, municipios_controller_1.activarMunicipio); // Activar municipio
router.post('/:id/desactivar', auth_middleware_1.authenticateToken, municipios_controller_1.desactivarMunicipio); // Desactivar municipio
exports.default = router;
