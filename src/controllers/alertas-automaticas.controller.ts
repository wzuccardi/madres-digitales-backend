// src/controllers/alertas-automaticas.controller.ts
// Controlador para el sistema de alertas automáticas
import { Request, Response } from 'express';
import { ControlService } from '../services/control.service';
import { AlertaService } from '../services/alerta.service';
import { ScoringService } from '../services/scoring.service';
import { NotificationService } from '../services/notification.service';
import { AutoAlertService } from '../services/auto-alert.service';
import { AlertRulesEngine } from '../services/alert-rules-engine.service';
import { PermissionService } from '../services/permission.service';
import { evaluarSignosAlarma, calcularPuntuacionRiesgo } from '../utils/alarma_utils';
import { CrearControlConEvaluacionDTO, CrearAlertaManualDTO } from '../types/alerta-automatica.dto';
import prisma from '../config/database';

// ==================== INSTANCIAS DE SERVICIOS ====================

const controlService = new ControlService();
const alertaService = new AlertaService();
const scoringService = new ScoringService();
const notificationService = new NotificationService();
const alertRulesEngine = new AlertRulesEngine();
const autoAlertService = new AutoAlertService(prisma, alertRulesEngine);
const permissionService = new PermissionService();

// ==================== CONTROLADORES DE CONTROLES CON EVALUACIÓN ====================

/**
 * Crear control prenatal con evaluación automática de alertas
 * POST /api/controles/con-evaluacion
 */
export const crearControlConEvaluacion = async (req: Request, res: Response) => {
  try {
    console.log('🏥 AlertasAutomaticasController: Creating control with automatic evaluation...');

    const user = (req as any).user;
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
    const datosControl: CrearControlConEvaluacionDTO = {
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
          } catch (notifError) {
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

  } catch (error) {
    console.error('❌ AlertasAutomaticasController: Error creating control with evaluation:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Evaluar signos de alarma sin crear control
 * POST /api/alertas/evaluar-signos
 */
export const evaluarSignosAlarmaSinControl = async (req: Request, res: Response) => {
  try {
    console.log('🔍 AlertasAutomaticasController: Evaluating alarm signs...');

    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
    }

    // Extraer datos clínicos del request
    const {
      presion_sistolica,
      presion_diastolica,
      frecuencia_cardiaca,
      frecuencia_respiratoria,
      temperatura,
      peso,
      semanas_gestacion,
      altura_uterina,
      movimientos_fetales,
      edemas,
      sintomas
    } = req.body;

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
    const resultadoEvaluacion = evaluarSignosAlarma(datosControl, sintomas);
    const puntuacionRiesgo = calcularPuntuacionRiesgo(datosControl, sintomas);
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

  } catch (error) {
    console.error('❌ AlertasAutomaticasController: Error evaluating alarm signs:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// ==================== CONTROLADORES DE ALERTAS CON EVALUACIÓN ====================

/**
 * Crear alerta manual con evaluación automática adicional
 * POST /api/alertas/con-evaluacion
 */
export const crearAlertaConEvaluacion = async (req: Request, res: Response) => {
  try {
    console.log('🚨 AlertasAutomaticasController: Creating alert with automatic evaluation...');

    const user = (req as any).user;
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
    const datosAlerta: CrearAlertaManualDTO = {
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
        } catch (notifError) {
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

  } catch (error) {
    console.error('❌ AlertasAutomaticasController: Error creating alert with evaluation:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// ==================== CONTROLADORES DE SCORING AVANZADO ====================

/**
 * Obtener perfil de riesgo completo de una gestante
 * GET /api/scoring/perfil-riesgo/:gestanteId
 */
export const obtenerPerfilRiesgo = async (req: Request, res: Response) => {
  try {
    console.log('📊 AlertasAutomaticasController: Getting risk profile...');

    const user = (req as any).user;
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

  } catch (error) {
    console.error('❌ AlertasAutomaticasController: Error getting risk profile:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// ==================== CONTROLADORES DE CONFIGURACIÓN ====================

/**
 * Obtener configuración actual del sistema
 * GET /api/alertas-automaticas/configuracion
 */
export const obtenerConfiguracion = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
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

  } catch (error) {
    console.error('❌ AlertasAutomaticasController: Error getting configuration:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

/**
 * Actualizar configuración del sistema
 * PUT /api/alertas-automaticas/configuracion
 */
export const actualizarConfiguracion = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
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

  } catch (error) {
    console.error('❌ AlertasAutomaticasController: Error updating configuration:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// ==================== CONTROLADORES DE ESTADÍSTICAS ====================

/**
 * Obtener estadísticas del sistema de alertas automáticas
 * GET /api/alertas-automaticas/estadisticas
 */
export const obtenerEstadisticas = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
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

  } catch (error) {
    console.error('❌ AlertasAutomaticasController: Error getting statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// ==================== NUEVOS CONTROLADORES SISTEMA INTELIGENTE ====================

/**
 * Obtener alertas filtradas por permisos del usuario
 * GET /api/alertas-automaticas/alertas
 */
export const obtenerAlertasFiltradas = async (req: Request, res: Response) => {
  try {
    console.log('🔍 AlertasAutomaticasController: Getting filtered alerts...');

    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
    }

    // Obtener filtros de consulta
    const { 
      nivel_prioridad, 
      tipo_alerta, 
      estado, 
      es_automatica,
      fecha_desde,
      fecha_hasta,
      page = 1,
      limit = 20
    } = req.query;

    // Construir filtro WHERE basado en permisos
    const whereFilter = await permissionService.getAlertasWhereFilter(user.id);

    // Agregar filtros adicionales
    if (nivel_prioridad) {
      whereFilter.nivel_prioridad = nivel_prioridad;
    }
    if (tipo_alerta) {
      whereFilter.tipo_alerta = tipo_alerta;
    }
    if (estado) {
      whereFilter.estado = estado;
    }
    if (es_automatica !== undefined) {
      whereFilter.es_automatica = es_automatica === 'true';
    }
    if (fecha_desde || fecha_hasta) {
      whereFilter.fecha_creacion = {};
      if (fecha_desde) {
        whereFilter.fecha_creacion.gte = new Date(fecha_desde as string);
      }
      if (fecha_hasta) {
        whereFilter.fecha_creacion.lte = new Date(fecha_hasta as string);
      }
    }

    // Obtener alertas con paginación
    const skip = (Number(page) - 1) * Number(limit);
    const [alertas, total] = await Promise.all([
      prisma.alerta.findMany({
        where: whereFilter,
        include: {
          gestante: {
            select: {
              id: true,
              nombre: true,
              documento: true
            }
          },
          madrina: {
            select: {
              id: true,
              nombre: true
            }
          }
        },
        orderBy: [
          { nivel_prioridad: 'desc' },
          { fecha_creacion: 'desc' }
        ],
        skip,
        take: Number(limit)
      }),
      prisma.alerta.count({ where: whereFilter })
    ]);

    console.log(`✅ AlertasAutomaticasController: Found ${alertas.length} filtered alerts`);

    res.json({
      success: true,
      data: {
        alertas,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });

  } catch (error) {
    console.error('❌ AlertasAutomaticasController: Error getting filtered alerts:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Evaluar signos vitales usando el nuevo motor de reglas
 * POST /api/alertas-automaticas/evaluar-signos-vitales
 */
export const evaluarSignosVitales = async (req: Request, res: Response) => {
  try {
    console.log('🔍 AlertasAutomaticasController: Evaluating vital signs with new engine...');

    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
    }

    const {
      presion_sistolica,
      presion_diastolica,
      frecuencia_cardiaca,
      frecuencia_respiratoria,
      temperatura,
      semanas_gestacion,
      sintomas = []
    } = req.body;

    const vitalSigns = {
      presion_sistolica,
      presion_diastolica,
      frecuencia_cardiaca,
      frecuencia_respiratoria,
      temperatura,
      semanas_gestacion
    };

    // Evaluar usando el nuevo motor de reglas
    const startTime = Date.now();
    const results = alertRulesEngine.evaluateVitalSigns(vitalSigns, sintomas);
    const evaluationTime = Date.now() - startTime;

    // Determinar la alerta de mayor prioridad
    const maxPriority = alertRulesEngine.getMaxPriority(results);
    const maxScore = alertRulesEngine.getMaxScore(results);

    console.log(`✅ AlertasAutomaticasController: Vital signs evaluation completed in ${evaluationTime}ms`);

    res.json({
      success: true,
      data: {
        alertas_detectadas: results.filter(r => r.alertDetected),
        prioridad_maxima: maxPriority,
        score_maximo: maxScore,
        total_alertas: results.filter(r => r.alertDetected).length,
        evaluado_en: new Date(),
        tiempo_evaluacion_ms: evaluationTime,
        version_motor: '2.0.0'
      }
    });

  } catch (error) {
    console.error('❌ AlertasAutomaticasController: Error evaluating vital signs:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Procesar signos vitales y crear alertas automáticas
 * POST /api/alertas-automaticas/procesar-signos-vitales
 */
export const procesarSignosVitales = async (req: Request, res: Response) => {
  try {
    console.log('🚨 AlertasAutomaticasController: Processing vital signs for automatic alerts...');

    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
    }

    const {
      gestante_id,
      presion_sistolica,
      presion_diastolica,
      frecuencia_cardiaca,
      frecuencia_respiratoria,
      temperatura,
      semanas_gestacion,
      sintomas = []
    } = req.body;

    if (!gestante_id) {
      return res.status(400).json({
        success: false,
        error: 'gestante_id es requerido'
      });
    }

    // Verificar permisos
    const canAccess = await permissionService.canAccessGestante(user.id, gestante_id);
    if (!canAccess) {
      return res.status(403).json({
        success: false,
        error: 'No tiene permisos para acceder a esta gestante'
      });
    }

    const vitalSigns = {
      presion_sistolica,
      presion_diastolica,
      frecuencia_cardiaca,
      frecuencia_respiratoria,
      temperatura,
      semanas_gestacion
    };

    // Procesar signos vitales y crear alertas automáticas
    await autoAlertService.processVitalSigns(gestante_id, vitalSigns, sintomas);

    console.log(`✅ AlertasAutomaticasController: Vital signs processed for gestante ${gestante_id}`);

    res.json({
      success: true,
      message: 'Signos vitales procesados exitosamente',
      data: {
        gestante_id,
        procesado_en: new Date(),
        procesado_por: user.id
      }
    });

  } catch (error) {
    console.error('❌ AlertasAutomaticasController: Error processing vital signs:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Obtener estadísticas de alertas automáticas
 * GET /api/alertas-automaticas/stats
 */
export const obtenerEstadisticasAlertas = async (req: Request, res: Response) => {
  try {
    console.log('📊 AlertasAutomaticasController: Getting auto-alert statistics...');

    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
    }

    const { fecha_inicio, fecha_fin } = req.query;

    let fechaInicio: Date | undefined;
    let fechaFin: Date | undefined;

    if (fecha_inicio) {
      fechaInicio = new Date(fecha_inicio as string);
    }
    if (fecha_fin) {
      fechaFin = new Date(fecha_fin as string);
    }

    // Obtener estadísticas
    const stats = await autoAlertService.getAutoAlertStats(fechaInicio, fechaFin);

    console.log(`✅ AlertasAutomaticasController: Auto-alert statistics retrieved`);

    res.json({
      success: true,
      data: {
        ...stats,
        periodo: {
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin
        },
        generado_en: new Date()
      }
    });

  } catch (error) {
    console.error('❌ AlertasAutomaticasController: Error getting auto-alert statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Obtener gestantes disponibles según permisos
 * GET /api/alertas-automaticas/gestantes
 */
export const obtenerGestantesDisponibles = async (req: Request, res: Response) => {
  try {
    console.log('👥 AlertasAutomaticasController: Getting available gestantes...');

    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
    }

    // Obtener gestantes según permisos
    const gestantes = await permissionService.getGestantesByMunicipioPermission(user.id);

    console.log(`✅ AlertasAutomaticasController: Found ${gestantes.length} available gestantes`);

    res.json({
      success: true,
      data: {
        gestantes,
        total: gestantes.length
      }
    });

  } catch (error) {
    console.error('❌ AlertasAutomaticasController: Error getting available gestantes:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// ==================== CONTROLADOR DE PRUEBA ====================

/**
 * Endpoint de prueba para validar el sistema
 * POST /api/alertas-automaticas/test
 */
export const testSistema = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
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
    const resultado = evaluarSignosAlarma(datosPrueba, sintomasPrueba);
    const puntuacion = calcularPuntuacionRiesgo(datosPrueba, sintomasPrueba);
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

  } catch (error) {
    console.error('❌ AlertasAutomaticasController: Error in system test:', error);
    res.status(500).json({
      success: false,
      error: 'Error en la prueba del sistema',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
