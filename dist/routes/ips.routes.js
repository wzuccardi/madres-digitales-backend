"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ips_controller_1 = require("../controllers/ips.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Aplicar autenticación a todas las rutas
router.use(auth_middleware_1.authMiddleware);
// Rutas específicas (deben ir antes de las rutas con parámetros)
router.get('/cercanas', ips_controller_1.getIPSCercanas); // Buscar IPS cercanas
router.get('/municipio/:municipioId', ips_controller_1.getIPSByMunicipio); // IPS por municipio
router.get('/nivel/:nivel', ips_controller_1.getIPSByNivel); // IPS por nivel de atención
// Rutas básicas CRUD
router.get('/', ips_controller_1.getAllIPS);
router.get('/:id', ips_controller_1.getIPSById);
router.post('/', ips_controller_1.createIPS);
router.put('/:id', ips_controller_1.updateIPS);
router.delete('/:id', ips_controller_1.deleteIPS);
exports.default = router;
