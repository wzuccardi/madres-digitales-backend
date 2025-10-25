"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboard_controller_1 = require("../controllers/dashboard.controller");
const router = (0, express_1.Router)();
// Rutas del dashboard
router.get('/estadisticas-generales', dashboard_controller_1.getEstadisticasGenerales);
router.get('/estadisticas-periodo', dashboard_controller_1.getEstadisticasPorPeriodo);
router.get('/estadisticas-geograficas', dashboard_controller_1.getEstadisticasGeograficas);
router.get('/resumen-alertas', dashboard_controller_1.getResumenAlertas);
router.get('/resumen-controles', dashboard_controller_1.getResumenControles);
router.get('/estadisticas', dashboard_controller_1.getEstadisticasDashboard);
exports.default = router;
