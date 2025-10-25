"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const alerta_controller_1 = require("../controllers/alerta.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const router = (0, express_1.Router)();
// Aplicar autenticación a todas las rutas
router.use(auth_middleware_1.authMiddleware);
// Rutas con control de permisos
router.get('/', alerta_controller_1.getAlertasByUser); // Alertas filtradas por permisos del usuario
router.get('/crud', alerta_controller_1.getAlertasByUser); // Alias para compatibilidad con frontend
router.get('/all', role_middleware_1.requireAdmin, alerta_controller_1.getAllAlertas); // Solo administradores ven todas las alertas
router.get('/activas', alerta_controller_1.getAlertasActivas); // Alertas activas filtradas por permisos
router.get('/gestante/:gestanteId', role_middleware_1.requireCoordinador, alerta_controller_1.getAlertasByGestante);
router.get('/:id', alerta_controller_1.getAlertaById); // Validación de permisos dentro del controlador
router.post('/', alerta_controller_1.createAlerta); // Validación de permisos dentro del controlador
router.put('/:id', alerta_controller_1.updateAlerta); // Validación de permisos dentro del controlador
router.delete('/:id', role_middleware_1.requireCoordinador, alerta_controller_1.deleteAlerta);
// Rutas específicas para funcionalidades especiales
router.post('/emergencia', alerta_controller_1.notificarEmergencia); // Endpoint SOS
router.put('/:id/resolver', alerta_controller_1.resolverAlerta); // Resolver alerta con validación de permisos
exports.default = router;
