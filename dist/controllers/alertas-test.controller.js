"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.infoSistema = exports.casosPrueba = exports.evaluarSignosTest = void 0;
const alarma_utils_1 = require("../utils/alarma_utils");
/**
 * Endpoint de prueba para evaluar signos de alarma
 * POST /api/alertas-test/evaluar
 */
const evaluarSignosTest = async (req, res) => {
    try {
        console.log('🧪 AlertasTestController: Evaluating alarm signs...');
        // Extraer datos clínicos del request
        const { presion_sistolica, presion_diastolica, frecuencia_cardiaca, temperatura, semanas_gestacion, movimientos_fetales, edemas, sintomas } = req.body;
        const datosControl = {
            presion_sistolica: presion_sistolica || null,
            presion_diastolica: presion_diastolica || null,
            frecuencia_cardiaca: frecuencia_cardiaca || null,
            temperatura: temperatura || null,
            semanas_gestacion: semanas_gestacion || null,
            movimientos_fetales: movimientos_fetales || null,
            edemas: edemas || null
        };
        // Evaluar signos de alarma
        const startTime = Date.now();
        const resultadoEvaluacion = (0, alarma_utils_1.evaluarSignosAlarma)(datosControl, sintomas || []);
        const puntuacionRiesgo = (0, alarma_utils_1.calcularPuntuacionRiesgo)(datosControl, sintomas || []);
        const tiempoEvaluacion = Date.now() - startTime;
        console.log(`✅ AlertasTestController: Evaluation completed in ${tiempoEvaluacion}ms`);
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
                tiempo_evaluacion_ms: tiempoEvaluacion,
                datos_entrada: datosControl,
                sintomas_entrada: sintomas || []
            }
        });
    }
    catch (error) {
        console.error('❌ AlertasTestController: Error evaluating alarm signs:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor',
            details: error.message
        });
    }
};
exports.evaluarSignosTest = evaluarSignosTest;
/**
 * Endpoint de prueba con datos predefinidos
 * GET /api/alertas-test/casos-prueba
 */
const casosPrueba = async (req, res) => {
    try {
        console.log('🧪 AlertasTestController: Running test cases...');
        const casos = [
            {
                nombre: 'Preeclampsia Severa',
                datos: {
                    presion_sistolica: 170,
                    presion_diastolica: 110,
                    frecuencia_cardiaca: 95,
                    temperatura: 36.8,
                    semanas_gestacion: 34,
                    movimientos_fetales: true,
                    edemas: true
                },
                sintomas: ['dolor_cabeza_severo', 'vision_borrosa', 'dolor_epigastrico']
            },
            {
                nombre: 'Trabajo de Parto Prematuro',
                datos: {
                    presion_sistolica: 120,
                    presion_diastolica: 80,
                    frecuencia_cardiaca: 90,
                    temperatura: 36.5,
                    semanas_gestacion: 30,
                    movimientos_fetales: true,
                    edemas: false
                },
                sintomas: ['contracciones_regulares', 'ruptura_membranas']
            },
            {
                nombre: 'Emergencia Obstétrica',
                datos: {
                    presion_sistolica: 85,
                    presion_diastolica: 55,
                    frecuencia_cardiaca: 125,
                    temperatura: 37.2,
                    semanas_gestacion: 36,
                    movimientos_fetales: false,
                    edemas: false
                },
                sintomas: ['sangrado_vaginal_abundante', 'ausencia_movimiento_fetal_confirmada']
            },
            {
                nombre: 'Signos Vitales Normales',
                datos: {
                    presion_sistolica: 120,
                    presion_diastolica: 80,
                    frecuencia_cardiaca: 85,
                    temperatura: 36.7,
                    semanas_gestacion: 32,
                    movimientos_fetales: true,
                    edemas: false
                },
                sintomas: []
            }
        ];
        const resultados = [];
        for (const caso of casos) {
            const startTime = Date.now();
            const evaluacion = (0, alarma_utils_1.evaluarSignosAlarma)(caso.datos, caso.sintomas);
            const puntuacion = (0, alarma_utils_1.calcularPuntuacionRiesgo)(caso.datos, caso.sintomas);
            const tiempoEvaluacion = Date.now() - startTime;
            resultados.push({
                caso: caso.nombre,
                datos_entrada: caso.datos,
                sintomas_entrada: caso.sintomas,
                resultado: {
                    alerta_detectada: evaluacion.tipo !== null,
                    tipo_alerta: evaluacion.tipo,
                    nivel_prioridad: evaluacion.nivelPrioridad,
                    mensaje: evaluacion.mensaje,
                    puntuacion_riesgo: puntuacion,
                    sintomas_detectados: evaluacion.sintomasDetectados || [],
                    recomendaciones: evaluacion.recomendaciones || [],
                    tiempo_evaluacion_ms: tiempoEvaluacion
                }
            });
        }
        console.log(`✅ AlertasTestController: ${casos.length} test cases completed`);
        res.json({
            success: true,
            data: {
                total_casos: casos.length,
                casos_evaluados: resultados,
                sistema_funcionando: true,
                version_algoritmo: '1.0.0',
                timestamp: new Date()
            }
        });
    }
    catch (error) {
        console.error('❌ AlertasTestController: Error in test cases:', error);
        res.status(500).json({
            success: false,
            error: 'Error en casos de prueba',
            details: error.message
        });
    }
};
exports.casosPrueba = casosPrueba;
/**
 * Endpoint para obtener información del sistema
 * GET /api/alertas-test/info
 */
const infoSistema = async (req, res) => {
    try {
        res.json({
            success: true,
            data: {
                sistema: 'Sistema de Alertas Automáticas',
                version: '1.0.0',
                estado: 'Operacional',
                funcionalidades: [
                    'Evaluación de signos de alarma',
                    'Detección de preeclampsia',
                    'Trabajo de parto prematuro',
                    'Emergencias obstétricas',
                    'Sistema de puntuación de riesgo',
                    'Generación de recomendaciones'
                ],
                umbrales_medicos: {
                    presion_arterial: {
                        sistolica_alta: 140,
                        diastolica_alta: 90,
                        sistolica_muy_alta: 160,
                        diastolica_muy_alta: 110
                    },
                    frecuencia_cardiaca: {
                        alta: 100,
                        muy_alta: 120
                    },
                    temperatura: {
                        alta: 38.0,
                        muy_alta: 39.0
                    },
                    obstetricos: {
                        parto_prematuro: 37,
                        parto_muy_prematuro: 32
                    }
                },
                timestamp: new Date()
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error obteniendo información del sistema'
        });
    }
};
exports.infoSistema = infoSistema;
