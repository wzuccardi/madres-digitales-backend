"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const gestantes_routes_1 = __importDefault(require("./gestantes.routes"));
const controles_routes_1 = __importDefault(require("./controles.routes"));
const alertas_routes_1 = __importDefault(require("./alertas.routes"));
const dashboard_routes_1 = __importDefault(require("./dashboard.routes"));
const contenido_routes_1 = __importDefault(require("./contenido.routes"));
const ips_routes_1 = __importDefault(require("./ips.routes"));
const municipios_routes_1 = __importDefault(require("./municipios.routes"));
const usuarios_routes_1 = __importDefault(require("./usuarios.routes"));
const medicos_routes_1 = __importDefault(require("./medicos.routes"));
const assignment_routes_1 = __importDefault(require("./assignment.routes"));
const smart_alerts_routes_1 = __importDefault(require("./smart-alerts.routes"));
const alertas_automaticas_routes_1 = __importDefault(require("./alertas-automaticas.routes"));
const alertas_test_routes_1 = __importDefault(require("./alertas-test.routes"));
const reportes_routes_new_1 = __importDefault(require("./reportes.routes.new"));
const ips_crud_routes_1 = __importDefault(require("./ips-crud.routes"));
const medico_crud_routes_1 = __importDefault(require("./medico-crud.routes"));
const admin_routes_1 = __importDefault(require("./admin.routes"));
const sync_routes_1 = __importDefault(require("./sync.routes"));
const mensajes_routes_1 = __importDefault(require("./mensajes.routes"));
const geolocalizacion_routes_1 = __importDefault(require("./geolocalizacion.routes"));
const contenido_crud_routes_1 = __importDefault(require("./contenido-crud.routes"));
const websocket_routes_1 = __importDefault(require("./websocket.routes"));
const router = (0, express_1.Router)();
// Rutas de autenticación
router.use('/auth', auth_routes_1.default);
// Rutas del dashboard
router.use('/dashboard', dashboard_routes_1.default);
// Rutas de gestantes
router.use('/gestantes', gestantes_routes_1.default);
// Rutas de controles prenatales (ambas variantes)
router.use('/controles', controles_routes_1.default);
router.use('/controles-prenatales', controles_routes_1.default);
// Rutas de alertas
router.use('/alertas', alertas_routes_1.default);
router.use('/alertas-crud', alertas_routes_1.default); // Alias para compatibilidad con frontend
// Rutas de contenido educativo
router.use('/contenido', contenido_routes_1.default);
// Rutas de IPS (Instituciones Prestadoras de Servicios de Salud)
router.use('/ips', ips_routes_1.default);
// Rutas de médicos
router.use('/medicos', medicos_routes_1.default);
// Rutas de municipios
router.use('/municipios', municipios_routes_1.default);
// Rutas de usuarios
router.use('/usuarios', usuarios_routes_1.default);
// Rutas de asignación automática
router.use('/assignment', assignment_routes_1.default);
// Rutas de alertas inteligentes
router.use('/smart-alerts', smart_alerts_routes_1.default);
// Rutas de alertas automáticas (nuevo sistema)
router.use('/alertas-automaticas', alertas_automaticas_routes_1.default);
// Rutas de prueba para alertas automáticas
router.use('/alertas-test', alertas_test_routes_1.default);
// Rutas de reportes y estadísticas
router.use('/reportes', reportes_routes_new_1.default);
// Rutas CRUD de IPS
router.use('/ips-crud', ips_crud_routes_1.default);
// Rutas CRUD de Médicos
router.use('/medicos-crud', medico_crud_routes_1.default);
// Rutas de administración integrada
router.use('/admin', admin_routes_1.default);
// Rutas de sincronización offline
router.use('/sync', sync_routes_1.default);
// Rutas de mensajería
router.use('/mensajes', mensajes_routes_1.default);
// Rutas de geolocalización
router.use('/geolocalizacion', geolocalizacion_routes_1.default);
// Rutas CRUD de contenido educativo (con upload de videos)
router.use('/contenido-crud', contenido_crud_routes_1.default);
// Rutas de WebSocket para notificaciones en tiempo real
router.use('/websocket', websocket_routes_1.default);
exports.default = router;
