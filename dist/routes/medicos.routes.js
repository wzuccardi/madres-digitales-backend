"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const medico_controller_1 = require("../controllers/medico.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Aplicar autenticación a todas las rutas
router.use(auth_middleware_1.authMiddleware);
// Rutas específicas (deben ir antes de las rutas con parámetros)
router.get('/ips/:ipsId', medico_controller_1.getMedicosByIPS); // Médicos por IPS
router.get('/especialidad/:especialidad', medico_controller_1.getMedicosByEspecialidad); // Médicos por especialidad
// Rutas básicas CRUD
router.get('/', medico_controller_1.getAllMedicos);
router.get('/:id', medico_controller_1.getMedicoById);
router.post('/', medico_controller_1.createMedico);
router.put('/:id', medico_controller_1.updateMedico);
router.delete('/:id', medico_controller_1.deleteMedico);
exports.default = router;
