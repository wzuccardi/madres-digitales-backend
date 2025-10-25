"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/alertas-test.routes.ts
// Rutas simplificadas para probar el sistema de alertas automáticas
const express_1 = require("express");
const alertas_test_controller_1 = require("../controllers/alertas-test.controller");
const router = (0, express_1.Router)();
/**
 * @route   POST /api/alertas-test/evaluar
 * @desc    Evaluar signos de alarma (endpoint de prueba)
 * @access  Public (para pruebas)
 * @body    {
 *   presion_sistolica?: number,
 *   presion_diastolica?: number,
 *   frecuencia_cardiaca?: number,
 *   temperatura?: number,
 *   semanas_gestacion?: number,
 *   movimientos_fetales?: boolean,
 *   edemas?: boolean,
 *   sintomas?: string[]
 * }
 */
router.post('/evaluar', alertas_test_controller_1.evaluarSignosTest);
/**
 * @route   GET /api/alertas-test/casos-prueba
 * @desc    Ejecutar casos de prueba predefinidos
 * @access  Public (para pruebas)
 */
router.get('/casos-prueba', alertas_test_controller_1.casosPrueba);
/**
 * @route   GET /api/alertas-test/info
 * @desc    Obtener información del sistema de alertas
 * @access  Public (para pruebas)
 */
router.get('/info', alertas_test_controller_1.infoSistema);
exports.default = router;
