"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testSistema = exports.obtenerEstadisticas = exports.actualizarConfiguracion = exports.obtenerConfiguracion = exports.obtenerPerfilRiesgo = exports.crearAlertaConEvaluacion = exports.evaluarSignosAlarmaSinControl = exports.crearControlConEvaluacion = void 0;
const control_service_1 = require("../services/control.service");
const alerta_service_1 = require("../services/alerta.service");
const scoring_service_1 = require("../services/scoring.service");
const notification_service_1 = require("../services/notification.service");
const alarma_utils_1 = require("../utils/alarma_utils");
// ==================== INSTANCIAS DE SERVICIOS ====================
const controlService = new control_service_1.ControlService();
const alertaService = new alerta_service_1.AlertaService();
const scoringService = new scoring_service_1.ScoringService();
const notificationService = new notification_service_1.NotificationService();
// ==================== CONTROLADORES DE CONTROLES CON EVALUACIÓN ====================
/**
 * Crear control prenatal con evaluación automática de alertas
 * POST /api/controles/con-evaluacion
 */
const crearControlConEvaluacion = async (req, res) => {
    try {
        console.log('🏥 AlertasAutomaticasController: Creating control with automatic evaluation...');
        const user = req.user;
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Usuario no autenticado'
            });
        }
        // Validar datos requeridos
        const { gestante_id, fecha_control } = req.body;
        if (!gestante_id || !fecha_control) {
            return res.status(400).json({
                success: false,
                error: 'gestante_id y fecha_control son requeridos'
            });
        }
        // Preparar datos del control
        const datosControl = {
            ...req.body,
            realizado_por_id: user.id,
            evaluar_automaticamente: req.body.evaluar_automaticamente !== false, // Por defecto true
            incluir_historial: req.body.incluir_historial !== false // Por defecto true
        };
        // Crear control con evaluación
        const resultado = await controlService.createControlConEvaluacion(datosControl);
        // Si se generaron alertas críticas, enviar notificaciones
        if (resultado.alertas_generadas.length > 0) {
            for (const alerta of resultado.alertas_generadas) {
                if (alerta.nivel_prioridad === 'critica') {
                    try {
                        await notificationService.procesarAlertaParaNotificaciones(alerta.id);
                    }
                    catch (notifError) {
                        console.error('⚠️ Error sending notifications:', notifError);
                        // No fallar el control por error en notificaciones
                    }
                }
            }
        }
        console.log(`✅ AlertasAutomaticasController: Control created with ${resultado.alertas_generadas.length} alerts`);
        res.status(201).json({
            success: true,
            data: resultado,
            message: `Control creado exitosamente${resultado.alertas_generadas.length > 0 ? ` con ${resultado.alertas_generadas.length} alerta(s) automática(s)` : ''}`
        });
    }
    catch (error) {
        console.error('❌ AlertasAutomaticasController: Error creating control with evaluation:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.crearControlConEvaluacion = crearControlConEvaluacion;
/**
 * Evaluar signos de alarma sin crear control
 * POST /api/alertas/evaluar-signos
 */
const evaluarSignosAlarmaSinControl = async (req, res) => {
    try {
        console.log('🔍 AlertasAutomaticasController: Evaluating alarm signs...');
        const user = req.user;
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Usuario no autenticado'
            });
        }
        // Extraer datos clínicos del request
        const { presion_sistolica, presion_diastolica, frecuencia_cardiaca, frecuencia_respiratoria, temperatura, peso, semanas_gestacion, altura_uterina, movimientos_fetales, edemas, sintomas } = req.body;
        const datosControl = {
            presion_sistolica,
            presion_diastolica,
            frecuencia_cardiaca,
            frecuencia_respiratoria,
            temperatura,
            peso,
            semanas_gestacion,
            altura_uterina,
            movimientos_fetales,
            edemas
        };
        // Evaluar signos de alarma
        const startTime = Date.now();
        const resultadoEvaluacion = (0, alarma_utils_1.evaluarSignosAlarma)(datosControl, sintomas);
        const puntuacionRiesgo = (0, alarma_utils_1.calcularPuntuacionRiesgo)(datosControl, sintomas);
        const tiempoEvaluacion = Date.now() - startTime;
        console.log(`✅ AlertasAutomaticasController: Evaluation completed in ${tiempoEvaluacion}ms`);
        res.json({
            success: true,
            data: {
                alerta_detectada: resultadoEvaluacion.tipo !== null,
                tipo_alerta: resultadoEvaluacion.tipo,
                nivel_prioridad: resultadoEvaluacion.nivelPrioridad,
                mensaje: resultadoEvaluacion.mensaje,
                puntuacion_riesgo: puntuacionRiesgo,
                sintomas_detectados: resultadoEvaluacion.sintomasDetectados || [],
                recomendaciones: resultadoEvaluacion.recomendaciones || [],
                evaluado_en: new Date(),
                version_algoritmo: '1.0.0',
                tiempo_evaluacion_ms: tiempoEvaluacion
            }
        });
    }
    catch (error) {
        console.error('❌ AlertasAutomaticasController: Error evaluating alarm signs:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.evaluarSignosAlarmaSinControl = evaluarSignosAlarmaSinControl;
// ==================== CONTROLADORES DE ALERTAS CON EVALUACIÓN ====================
/**
 * Crear alerta manual con evaluación automática adicional
 * POST /api/alertas/con-evaluacion
 */
const crearAlertaConEvaluacion = async (req, res) => {
    try {
        console.log('🚨 AlertasAutomaticasController: Creating alert with automatic evaluation...');
        const user = req.user;
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Usuario no autenticado'
            });
        }
        // Validar datos requeridos
        const { gestante_id, tipo_alerta, nivel_prioridad, mensaje } = req.body;
        if (!gestante_id || !tipo_alerta || !nivel_prioridad || !mensaje) {
            return res.status(400).json({
                success: false,
                error: 'gestante_id, tipo_alerta, nivel_prioridad y mensaje son requeridos'
            });
        }
        // Preparar datos de la alerta
        const datosAlerta = {
            ...req.body,
            generado_por_id: user.id,
            evaluar_automaticamente: req.body.evaluar_automaticamente !== false, // Por defecto true
            sobrescribir_con_automatica: req.body.sobrescribir_con_automatica === true // Por defecto false
        };
        // Crear alerta con evaluación
        const resultado = await alertaService.createAlertaConEvaluacion(datosAlerta);
        // Enviar notificaciones si es necesario
        const alertasParaNotificar = [resultado.alerta_manual];
        if (resultado.alerta_automatica) {
            alertasParaNotificar.push(resultado.alerta_automatica);
        }
        for (const alerta of alertasParaNotificar) {
            if (alerta.nivel_prioridad === 'critica' || alerta.nivel_prioridad === 'alta') {
                try {
                    await notificationService.procesarAlertaParaNotificaciones(alerta.id);
                }
                catch (notifError) {
                    console.error('⚠️ Error sending notifications:', notifError);
                }
            }
        }
        console.log(`✅ AlertasAutomaticasController: Alert created${resultado.alerta_automatica ? ' with additional automatic alert' : ''}`);
        res.status(201).json({
            success: true,
            data: resultado,
            message: `Alerta creada exitosamente${resultado.alerta_automatica ? ' con evaluación automática adicional' : ''}`
        });
    }
    catch (error) {
        console.error('❌ AlertasAutomaticasController: Error creating alert with evaluation:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.crearAlertaConEvaluacion = crearAlertaConEvaluacion;
// ==================== CONTROLADORES DE SCORING AVANZADO ====================
/**
 * Obtener perfil de riesgo completo de una gestante
 * GET /api/scoring/perfil-riesgo/:gestanteId
 */
const obtenerPerfilRiesgo = async (req, res) => {
    try {
        console.log('📊 AlertasAutomaticasController: Getting risk profile...');
        const user = req.user;
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Usuario no autenticado'
            });
        }
        const { gestanteId } = req.params;
        if (!gestanteId) {
            return res.status(400).json({
                success: false,
                error: 'gestanteId es requerido'
            });
        }
        // Datos actuales del request (opcional)
        const datosActuales = req.body.datos_actuales || {};
        const sintomas = req.body.sintomas || [];
        // Obtener perfil de riesgo
        const perfil = await scoringService.evaluarRiesgoCompleto(gestanteId, datosActuales, sintomas);
        console.log(`✅ AlertasAutomaticasController: Risk profile obtained for gestante ${gestanteId}`);
        res.json({
            success: true,
            data: perfil
        });
    }
    catch (error) {
        console.error('❌ AlertasAutomaticasController: Error getting risk profile:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.obtenerPerfilRiesgo = obtenerPerfilRiesgo;
// ==================== CONTROLADORES DE CONFIGURACIÓN ====================
/**
 * Obtener configuración actual del sistema
 * GET /api/alertas-automaticas/configuracion
 */
const obtenerConfiguracion = async (req, res) => {
    try {
        const user = req.user;
        if (!user || (user.rol !== 'admin' && user.rol !== 'super_admin')) {
            return res.status(403).json({
                success: false,
                error: 'Acceso denegado. Solo administradores pueden ver la configuración.'
            });
        }
        const configuracionScoring = scoringService.obtenerConfiguracion();
        res.json({
            success: true,
            data: {
                scoring: configuracionScoring,
                version_algoritmo: '1.0.0',
                ultima_actualizacion: new Date()
            }
        });
    }
    catch (error) {
        console.error('❌ AlertasAutomaticasController: Error getting configuration:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
};
exports.obtenerConfiguracion = obtenerConfiguracion;
/**
 * Actualizar configuración del sistema
 * PUT /api/alertas-automaticas/configuracion
 */
const actualizarConfiguracion = async (req, res) => {
    try {
        const user = req.user;
        if (!user || (user.rol !== 'admin' && user.rol !== 'super_admin')) {
            return res.status(403).json({
                success: false,
                error: 'Acceso denegado. Solo administradores pueden actualizar la configuración.'
            });
        }
        const { scoring, notificaciones } = req.body;
        if (scoring) {
            await scoringService.actualizarConfiguracion(scoring);
        }
        if (notificaciones) {
            await notificationService.actualizarConfiguracion(notificaciones);
        }
        console.log('✅ AlertasAutomaticasController: Configuration updated');
        res.json({
            success: true,
            message: 'Configuración actualizada exitosamente',
            data: {
                scoring: scoring ? scoringService.obtenerConfiguracion() : undefined,
                actualizado_en: new Date(),
                actualizado_por: user.nombre
            }
        });
    }
    catch (error) {
        console.error('❌ AlertasAutomaticasController: Error updating configuration:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.actualizarConfiguracion = actualizarConfiguracion;
// ==================== CONTROLADORES DE ESTADÍSTICAS ====================
/**
 * Obtener estadísticas del sistema de alertas automáticas
 * GET /api/alertas-automaticas/estadisticas
 */
const obtenerEstadisticas = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Usuario no autenticado'
            });
        }
        // Obtener estadísticas de notificaciones
        const estadisticasNotificaciones = await notificationService.obtenerEstadisticas();
        // Aquí se podrían agregar más estadísticas del sistema
        const estadisticas = {
            notificaciones: estadisticasNotificaciones,
            sistema: {
                version_algoritmo: '1.0.0',
                tiempo_actividad: Date.now(),
                alertas_procesadas_hoy: 0, // Implementar lógica real
                controles_evaluados_hoy: 0 // Implementar lógica real
            }
        };
        res.json({
            success: true,
            data: estadisticas
        });
    }
    catch (error) {
        console.error('❌ AlertasAutomaticasController: Error getting statistics:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
};
exports.obtenerEstadisticas = obtenerEstadisticas;
// ==================== CONTROLADOR DE PRUEBA ====================
/**
 * Endpoint de prueba para validar el sistema
 * POST /api/alertas-automaticas/test
 */
const testSistema = async (req, res) => {
    try {
        const user = req.user;
        if (!user || (user.rol !== 'admin' && user.rol !== 'super_admin')) {
            return res.status(403).json({
                success: false,
                error: 'Acceso denegado. Solo administradores pueden ejecutar pruebas.'
            });
        }
        console.log('🧪 AlertasAutomaticasController: Running system test...');
        // Datos de prueba para emergencia obstétrica
        const datosPrueba = {
            presion_sistolica: 170,
            presion_diastolica: 110,
            frecuencia_cardiaca: 125,
            temperatura: 38.5,
            semanas_gestacion: 32,
            movimientos_fetales: false,
            edemas: true
        };
        const sintomasPrueba = ['dolor_cabeza_severo', 'vision_borrosa', 'escalofrios'];
        // Evaluar con el sistema
        const startTime = Date.now();
        const resultado = (0, alarma_utils_1.evaluarSignosAlarma)(datosPrueba, sintomasPrueba);
        const puntuacion = (0, alarma_utils_1.calcularPuntuacionRiesgo)(datosPrueba, sintomasPrueba);
        const tiempoEvaluacion = Date.now() - startTime;
        console.log(`✅ AlertasAutomaticasController: System test completed in ${tiempoEvaluacion}ms`);
        res.json({
            success: true,
            data: {
                test_ejecutado: true,
                datos_prueba: datosPrueba,
                sintomas_prueba: sintomasPrueba,
                resultado_evaluacion: resultado,
                puntuacion_calculada: puntuacion,
                tiempo_evaluacion_ms: tiempoEvaluacion,
                sistema_funcionando: resultado.tipo !== null && puntuacion > 0,
                timestamp: new Date()
            },
            message: 'Prueba del sistema ejecutada exitosamente'
        });
    }
    catch (error) {
        console.error('❌ AlertasAutomaticasController: Error in system test:', error);
        res.status(500).json({
            success: false,
            error: 'Error en la prueba del sistema',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.testSistema = testSistema;
