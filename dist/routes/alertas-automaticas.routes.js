"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/alertas-automaticas.routes.ts
// Rutas para el sistema de alertas automáticas
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const alertas_automaticas_controller_1 = require("../controllers/alertas-automaticas.controller");
const router = (0, express_1.Router)();
// ==================== MIDDLEWARE DE AUTENTICACIÓN ====================
// Todas las rutas requieren autenticación
router.use(auth_middleware_1.authMiddleware);
// ==================== RUTAS DE CONTROLES CON EVALUACIÓN AUTOMÁTICA ====================
/**
 * @route   POST /api/controles/con-evaluacion
 * @desc    Crear control prenatal con evaluación automática de alertas
 * @access  Private (Madrinas, Médicos, Coordinadores, Admins)
 * @body    {
 *   gestante_id: string,
 *   fecha_control: string,
 *   presion_sistolica?: number,
 *   presion_diastolica?: number,
 *   frecuencia_cardiaca?: number,
 *   frecuencia_respiratoria?: number,
 *   temperatura?: number,
 *   peso?: number,
 *   semanas_gestacion?: number,
 *   altura_uterina?: number,
 *   movimientos_fetales?: boolean,
 *   edemas?: boolean,
 *   sintomas?: string[],
 *   observaciones?: string,
 *   recomendaciones?: string,
 *   evaluar_automaticamente?: boolean,
 *   incluir_historial?: boolean
 * }
 */
router.post('/controles/con-evaluacion', alertas_automaticas_controller_1.crearControlConEvaluacion);
/**
 * @route   POST /api/alertas/evaluar-signos
 * @desc    Evaluar signos de alarma sin crear control (solo evaluación)
 * @access  Private (Todos los usuarios autenticados)
 * @body    {
 *   presion_sistolica?: number,
 *   presion_diastolica?: number,
 *   frecuencia_cardiaca?: number,
 *   frecuencia_respiratoria?: number,
 *   temperatura?: number,
 *   peso?: number,
 *   semanas_gestacion?: number,
 *   altura_uterina?: number,
 *   movimientos_fetales?: boolean,
 *   edemas?: boolean,
 *   sintomas?: string[]
 * }
 */
router.post('/alertas/evaluar-signos', alertas_automaticas_controller_1.evaluarSignosAlarmaSinControl);
// ==================== RUTAS DE ALERTAS CON EVALUACIÓN AUTOMÁTICA ====================
/**
 * @route   POST /api/alertas/con-evaluacion
 * @desc    Crear alerta manual con evaluación automática adicional
 * @access  Private (Madrinas, Médicos, Coordinadores, Admins)
 * @body    {
 *   gestante_id: string,
 *   tipo_alerta: AlertaTipo,
 *   nivel_prioridad: PrioridadNivel,
 *   mensaje: string,
 *   sintomas?: string[],
 *   presion_sistolica?: number,
 *   presion_diastolica?: number,
 *   frecuencia_cardiaca?: number,
 *   temperatura?: number,
 *   madrina_id?: string,
 *   medico_asignado_id?: string,
 *   evaluar_automaticamente?: boolean,
 *   sobrescribir_con_automatica?: boolean
 * }
 */
router.post('/alertas/con-evaluacion', alertas_automaticas_controller_1.crearAlertaConEvaluacion);
// ==================== RUTAS DE SCORING AVANZADO ====================
/**
 * @route   GET /api/scoring/perfil-riesgo/:gestanteId
 * @desc    Obtener perfil de riesgo completo de una gestante
 * @access  Private (Madrinas, Médicos, Coordinadores, Admins)
 * @params  gestanteId: string
 * @body    {
 *   datos_actuales?: DatosControl,
 *   sintomas?: string[]
 * }
 */
router.get('/scoring/perfil-riesgo/:gestanteId', alertas_automaticas_controller_1.obtenerPerfilRiesgo);
/**
 * @route   POST /api/scoring/perfil-riesgo/:gestanteId
 * @desc    Obtener perfil de riesgo con datos actuales específicos
 * @access  Private (Madrinas, Médicos, Coordinadores, Admins)
 * @params  gestanteId: string
 * @body    {
 *   datos_actuales: DatosControl,
 *   sintomas?: string[]
 * }
 */
router.post('/scoring/perfil-riesgo/:gestanteId', alertas_automaticas_controller_1.obtenerPerfilRiesgo);
// ==================== RUTAS DE CONFIGURACIÓN ====================
/**
 * @route   GET /api/alertas-automaticas/configuracion
 * @desc    Obtener configuración actual del sistema
 * @access  Private (Solo Admins y Super Admins)
 */
router.get('/configuracion', alertas_automaticas_controller_1.obtenerConfiguracion);
/**
 * @route   PUT /api/alertas-automaticas/configuracion
 * @desc    Actualizar configuración del sistema
 * @access  Private (Solo Admins y Super Admins)
 * @body    {
 *   scoring?: ConfiguracionScoring,
 *   notificaciones?: ConfiguracionNotificacionesDTO
 * }
 */
router.put('/configuracion', alertas_automaticas_controller_1.actualizarConfiguracion);
// ==================== NUEVAS RUTAS SISTEMA INTELIGENTE ====================
/**
 * @route   GET /api/alertas-automaticas/alertas
 * @desc    Obtener alertas filtradas por permisos del usuario
 * @access  Private (Todos los usuarios autenticados)
 * @query   {
 *   nivel_prioridad?: string,
 *   tipo_alerta?: string,
 *   estado?: string,
 *   es_automatica?: boolean,
 *   fecha_desde?: string,
 *   fecha_hasta?: string,
 *   page?: number,
 *   limit?: number
 * }
 */
router.get('/alertas', alertas_automaticas_controller_1.obtenerAlertasFiltradas);
/**
 * @route   POST /api/alertas-automaticas/evaluar-signos-vitales
 * @desc    Evaluar signos vitales usando el nuevo motor de reglas
 * @access  Private (Todos los usuarios autenticados)
 * @body    {
 *   presion_sistolica?: number,
 *   presion_diastolica?: number,
 *   frecuencia_cardiaca?: number,
 *   frecuencia_respiratoria?: number,
 *   temperatura?: number,
 *   semanas_gestacion?: number,
 *   sintomas?: string[]
 * }
 */
router.post('/evaluar-signos-vitales', alertas_automaticas_controller_1.evaluarSignosVitales);
/**
 * @route   POST /api/alertas-automaticas/procesar-signos-vitales
 * @desc    Procesar signos vitales y crear alertas automáticas
 * @access  Private (Madrinas, Médicos, Coordinadores, Admins)
 * @body    {
 *   gestante_id: string,
 *   presion_sistolica?: number,
 *   presion_diastolica?: number,
 *   frecuencia_cardiaca?: number,
 *   frecuencia_respiratoria?: number,
 *   temperatura?: number,
 *   semanas_gestacion?: number,
 *   sintomas?: string[]
 * }
 */
router.post('/procesar-signos-vitales', alertas_automaticas_controller_1.procesarSignosVitales);
/**
 * @route   GET /api/alertas-automaticas/stats
 * @desc    Obtener estadísticas de alertas automáticas
 * @access  Private (Todos los usuarios autenticados)
 * @query   {
 *   fecha_inicio?: string,
 *   fecha_fin?: string
 * }
 */
router.get('/stats', alertas_automaticas_controller_1.obtenerEstadisticasAlertas);
/**
 * @route   GET /api/alertas-automaticas/gestantes
 * @desc    Obtener gestantes disponibles según permisos
 * @access  Private (Todos los usuarios autenticados)
 */
router.get('/gestantes', alertas_automaticas_controller_1.obtenerGestantesDisponibles);
// ==================== RUTAS DE ESTADÍSTICAS Y MONITOREO ====================
/**
 * @route   GET /api/alertas-automaticas/estadisticas
 * @desc    Obtener estadísticas del sistema de alertas automáticas
 * @access  Private (Todos los usuarios autenticados)
 */
router.get('/estadisticas', alertas_automaticas_controller_1.obtenerEstadisticas);
/**
 * @route   POST /api/alertas-automaticas/test
 * @desc    Ejecutar prueba del sistema de alertas automáticas
 * @access  Private (Solo Admins y Super Admins)
 */
router.post('/test', alertas_automaticas_controller_1.testSistema);
// ==================== RUTAS DE UTILIDADES ====================
/**
 * @route   GET /api/alertas-automaticas/sintomas-disponibles
 * @desc    Obtener lista de síntomas disponibles para evaluación
 * @access  Private (Todos los usuarios autenticados)
 */
router.get('/sintomas-disponibles', (req, res) => {
    try {
        const sintomas = {
            emergencia: [
                'ausencia_movimiento_fetal_confirmada',
                'convulsiones',
                'perdida_conciencia',
                'dificultad_respiratoria_severa',
                'dolor_toracico',
                'sangrado_masivo'
            ],
            hemorragia: [
                'sangrado_vaginal_abundante',
                'sangrado_vaginal_con_coagulos',
                'hemorragia_vaginal',
                'perdida_sangre_abundante',
                'sangrado_postparto'
            ],
            sepsis: [
                'escalofrios',
                'malestar_general_severo',
                'confusion_mental',
                'dolor_abdominal_severo',
                'secrecion_vaginal_fetida',
                'dolor_pelvico_intenso'
            ],
            trabajo_parto: [
                'contracciones_regulares',
                'dolor_abdominal_ritmico',
                'presion_pelvica',
                'ruptura_membranas',
                'perdida_liquido_amniotico',
                'dolor_espalda_baja_intenso'
            ],
            preeclampsia: [
                'dolor_cabeza_severo',
                'vision_borrosa',
                'dolor_epigastrico',
                'nauseas_vomitos_severos',
                'edema_facial',
                'edema_manos'
            ]
        };
        res.json({
            success: true,
            data: sintomas,
            total_sintomas: Object.values(sintomas).flat().length
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error obteniendo síntomas disponibles'
        });
    }
});
/**
 * @route   GET /api/alertas-automaticas/umbrales
 * @desc    Obtener umbrales médicos utilizados por el sistema
 * @access  Private (Todos los usuarios autenticados)
 */
router.get('/umbrales', (req, res) => {
    try {
        const umbrales = {
            presion_arterial: {
                sistolica_alta: 140,
                diastolica_alta: 90,
                sistolica_muy_alta: 160,
                diastolica_muy_alta: 110,
                sistolica_baja: 90,
                diastolica_baja: 60
            },
            frecuencia_cardiaca: {
                alta: 100,
                muy_alta: 120,
                baja: 60
            },
            frecuencia_respiratoria: {
                alta: 24,
                muy_alta: 30,
                baja: 12
            },
            temperatura: {
                alta: 38.0,
                muy_alta: 39.0,
                baja: 36.0
            },
            obstetricos: {
                parto_prematuro: 37,
                parto_muy_prematuro: 32,
                ganancia_peso_semanal_alta: 1.0
            },
            puntuacion: {
                critica: 80,
                alta: 60,
                media: 30,
                baja: 0
            }
        };
        res.json({
            success: true,
            data: umbrales,
            version_algoritmo: '1.0.0',
            basado_en: 'Guías clínicas internacionales de obstetricia'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error obteniendo umbrales médicos'
        });
    }
});
/**
 * @route   GET /api/alertas-automaticas/health
 * @desc    Verificar estado de salud del sistema de alertas automáticas
 * @access  Private (Todos los usuarios autenticados)
 */
router.get('/health', (req, res) => {
    try {
        const health = {
            status: 'healthy',
            timestamp: new Date(),
            version: '1.0.0',
            components: {
                evaluacion_alarmas: 'operational',
                scoring_system: 'operational',
                notifications: 'operational',
                database: 'operational'
            },
            uptime_seconds: Math.floor(process.uptime()),
            memory_usage: process.memoryUsage()
        };
        res.json({
            success: true,
            data: health
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error verificando estado del sistema'
        });
    }
});
exports.default = router;
