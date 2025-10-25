"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const municipios_controller_1 = require("../controllers/municipios.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Rutas protegidas para administradores
router.get('/resumen-integrado', auth_middleware_1.authMiddleware, municipios_controller_1.getResumenIntegrado); // Resumen integrado del sistema
exports.default = router;
