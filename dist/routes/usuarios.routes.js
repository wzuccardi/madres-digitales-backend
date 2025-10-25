"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const usuario_controller_1 = require("../controllers/usuario.controller");
const router = (0, express_1.Router)();
// Rutas específicas (deben ir antes de las rutas con parámetros)
router.get('/medicos', usuario_controller_1.getMedicos); // Obtener todos los médicos
router.get('/madrinas', usuario_controller_1.getMadrinas); // Obtener todas las madrinas
router.get('/coordinadores', usuario_controller_1.getCoordinadores); // Obtener todos los coordinadores
router.get('/rol/:rol', usuario_controller_1.getUsuariosByRol); // Usuarios por rol
router.get('/municipio/:municipioId', usuario_controller_1.getUsuariosByMunicipio); // Usuarios por municipio
// Rutas básicas
router.get('/', usuario_controller_1.getAllUsuarios);
router.get('/:id', usuario_controller_1.getUsuarioById);
exports.default = router;
