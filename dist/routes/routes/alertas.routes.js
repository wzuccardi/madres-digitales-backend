"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const alerta_controller_1 = require("../controllers/alerta.controller");
const router = (0, express_1.Router)();
// Rutas básicas CRUD
router.get('/', alerta_controller_1.getAllAlertas);
router.get('-crud', alerta_controller_1.getAllAlertas); // Alias para compatibilidad con frontend
router.get('/activas', alerta_controller_1.getAlertasActivas); // Debe ir antes de /:id
router.get('/gestante/:gestanteId', alerta_controller_1.getAlertasByGestante);
router.get('/:id', alerta_controller_1.getAlertaById);
router.post('/', alerta_controller_1.createAlerta);
router.put('/:id', alerta_controller_1.updateAlerta);
router.delete('/:id', alerta_controller_1.deleteAlerta);
// Rutas específicas para funcionalidades especiales
router.post('/emergencia', alerta_controller_1.notificarEmergencia); // Endpoint SOS
router.put('/:id/resolver', alerta_controller_1.resolverAlerta); // Resolver alerta
exports.default = router;
