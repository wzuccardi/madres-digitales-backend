import { Router } from 'express';
import authRoutes from './auth.routes';
import gestantesRoutes from './gestantes.routes';
import controlesRoutes from './controles.routes';
import alertasRoutes from './alertas.routes';
import dashboardRoutes from './dashboard.routes';
import contenidoRoutes from './contenido.routes';
import ipsRoutes from './ips.routes';
import municipiosRoutes from './municipios.routes';
import usuariosRoutes from './usuarios.routes';
import medicosRoutes from './medicos.routes';
import assignmentRoutes from './assignment.routes';
import smartAlertsRoutes from './smart-alerts.routes';
import alertasAutomaticasRoutes from './alertas-automaticas.routes';
import alertasTestRoutes from './alertas-test.routes';
import reportesRoutes from './reportes.routes';
import ipsCrudRoutes from './ips-crud.routes';
import medicoCrudRoutes from './medico-crud.routes';
import adminRoutes from './admin.routes';
import syncRoutes from './sync.routes';
import mensajesRoutes from './mensajes.routes';
import geolocalizacionRoutes from './geolocalizacion.routes';
import contenidoCrudRoutes from './contenido-crud.routes';
import websocketRoutes from './websocket.routes';

const router = Router();

// 🔍 DEBUG: Log de todas las rutas registradas
router.use((req, res, next) => {
  console.log('🔍 DEBUG: Ruta solicitada:', req.method, req.path);
  console.log('🔍 DEBUG: Headers:', Object.keys(req.headers));
  next();
});

// Rutas de autenticación
router.use('/auth', authRoutes);

// Rutas del dashboard
router.use('/dashboard', dashboardRoutes);

// Rutas de gestantes
router.use('/gestantes', gestantesRoutes);

// Rutas de controles prenatales (ambas variantes)
router.use('/controles', (req, res, next) => {
  console.log('🔍 DEBUG: Entrando a ruta /controles');
  next();
}, controlesRoutes);
router.use('/controles-prenatales', controlesRoutes);

// Rutas de alertas
router.use('/alertas', alertasRoutes);
router.use('/alertas-crud', alertasRoutes); // Alias para compatibilidad con frontend

// Rutas de contenido educativo
router.use('/contenido', contenidoRoutes);

// Rutas de IPS (Instituciones Prestadoras de Servicios de Salud)
router.use('/ips', ipsRoutes);

// Rutas de médicos
router.use('/medicos', medicosRoutes);

// Rutas de municipios
router.use('/municipios', municipiosRoutes);

// Rutas de usuarios
router.use('/usuarios', usuariosRoutes);

// Rutas de asignación automática
router.use('/assignment', assignmentRoutes);

// Rutas de alertas inteligentes
router.use('/smart-alerts', smartAlertsRoutes);

// Rutas de alertas automáticas (nuevo sistema)
router.use('/alertas-automaticas', alertasAutomaticasRoutes);

// Rutas de prueba para alertas automáticas
router.use('/alertas-test', alertasTestRoutes);

// Rutas de reportes y estadísticas
router.use('/reportes', reportesRoutes);

// Rutas CRUD de IPS
router.use('/ips-crud', ipsCrudRoutes);

// Rutas CRUD de Médicos
router.use('/medicos-crud', medicoCrudRoutes);

// Rutas de administración integrada
router.use('/admin', adminRoutes);

// Rutas de sincronización offline
router.use('/sync', syncRoutes);

// Rutas de mensajería
router.use('/mensajes', mensajesRoutes);

// Rutas de geolocalización
router.use('/geolocalizacion', geolocalizacionRoutes);

// Rutas CRUD de contenido educativo (con upload de videos)
router.use('/contenido-crud', (req, res, next) => {
  console.log('🔍 DEBUG: Entrando a ruta /contenido-crud');
  console.log('🔍 DEBUG: Query params:', req.query);
  next();
}, contenidoCrudRoutes);

// Rutas de WebSocket para notificaciones en tiempo real
router.use('/websocket', websocketRoutes);

export default router;
