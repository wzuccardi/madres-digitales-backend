"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SINTOMAS_EMERGENCIA = exports.SINTOMAS_PREECLAMPSIA = exports.SINTOMAS_TRABAJO_PARTO = exports.SINTOMAS_SEPSIS = exports.SINTOMAS_HEMORRAGIA = exports.UMBRAL_PARTO_MUY_PREMATURO = exports.UMBRAL_PARTO_PREMATURO = exports.UMBRAL_IMC_ALTO = exports.UMBRAL_IMC_BAJO = exports.UMBRAL_GANANCIA_PESO_SEMANAL_ALTA = exports.UMBRAL_TEMPERATURA_BAJA = exports.UMBRAL_TEMPERATURA_MUY_ALTA = exports.UMBRAL_TEMPERATURA_ALTA = exports.UMBRAL_FR_BAJA = exports.UMBRAL_FR_MUY_ALTA = exports.UMBRAL_FR_ALTA = exports.UMBRAL_FC_BAJA = exports.UMBRAL_FC_MUY_ALTA = exports.UMBRAL_FC_ALTA = exports.UMBRAL_TA_DIASTOLICA_BAJA = exports.UMBRAL_TA_SISTOLICA_BAJA = exports.UMBRAL_TA_DIASTOLICA_MUY_ALTA = exports.UMBRAL_TA_SISTOLICA_MUY_ALTA = exports.UMBRAL_TA_DIASTOLICA_ALTA = exports.UMBRAL_TA_SISTOLICA_ALTA = void 0;
exports.evaluarSignosAlarma = evaluarSignosAlarma;
exports.calcularPuntuacionRiesgo = calcularPuntuacionRiesgo;
exports.determinarPrioridadPorPuntuacion = determinarPrioridadPorPuntuacion;
exports.determinarTipoAlerta = determinarTipoAlerta;
exports.generarRecomendaciones = generarRecomendaciones;
// src/utils/alarma_utils.ts
const prisma_enums_1 = require("../types/prisma-enums");
// ==================== CONSTANTES MÉDICAS ====================
// Umbrales de Presión Arterial (mmHg)
exports.UMBRAL_TA_SISTOLICA_ALTA = 140; // Hipertensión
exports.UMBRAL_TA_DIASTOLICA_ALTA = 90; // Hipertensión
exports.UMBRAL_TA_SISTOLICA_MUY_ALTA = 160; // Hipertensión severa
exports.UMBRAL_TA_DIASTOLICA_MUY_ALTA = 110; // Hipertensión severa
exports.UMBRAL_TA_SISTOLICA_BAJA = 90; // Hipotensión
exports.UMBRAL_TA_DIASTOLICA_BAJA = 60; // Hipotensión
// Umbrales de Frecuencia Cardíaca (lpm)
exports.UMBRAL_FC_ALTA = 100; // Taquicardia
exports.UMBRAL_FC_MUY_ALTA = 120; // Taquicardia severa
exports.UMBRAL_FC_BAJA = 60; // Bradicardia
// Umbrales de Frecuencia Respiratoria (rpm)
exports.UMBRAL_FR_ALTA = 24; // Taquipnea
exports.UMBRAL_FR_MUY_ALTA = 30; // Taquipnea severa
exports.UMBRAL_FR_BAJA = 12; // Bradipnea
// Umbrales de Temperatura (°C)
exports.UMBRAL_TEMPERATURA_ALTA = 38.0; // Fiebre
exports.UMBRAL_TEMPERATURA_MUY_ALTA = 39.0; // Fiebre alta
exports.UMBRAL_TEMPERATURA_BAJA = 36.0; // Hipotermia
// Umbrales de Peso y IMC
exports.UMBRAL_GANANCIA_PESO_SEMANAL_ALTA = 1.0; // kg por semana
exports.UMBRAL_IMC_BAJO = 18.5;
exports.UMBRAL_IMC_ALTO = 30.0;
// Umbrales de Semanas de Gestación
exports.UMBRAL_PARTO_PREMATURO = 37; // Semanas
exports.UMBRAL_PARTO_MUY_PREMATURO = 32; // Semanas
// ==================== SÍNTOMAS PREDEFINIDOS ====================
exports.SINTOMAS_HEMORRAGIA = [
    'sangrado_vaginal_abundante',
    'sangrado_vaginal_con_coagulos',
    'hemorragia_vaginal',
    'perdida_sangre_abundante',
    'sangrado_postparto'
];
exports.SINTOMAS_SEPSIS = [
    'escalofrios',
    'malestar_general_severo',
    'confusion_mental',
    'dolor_abdominal_severo',
    'secrecion_vaginal_fetida',
    'dolor_pelvico_intenso'
];
exports.SINTOMAS_TRABAJO_PARTO = [
    'contracciones_regulares',
    'dolor_abdominal_ritmico',
    'presion_pelvica',
    'ruptura_membranas',
    'perdida_liquido_amniotico',
    'dolor_espalda_baja_intenso'
];
exports.SINTOMAS_PREECLAMPSIA = [
    'dolor_cabeza_severo',
    'vision_borrosa',
    'dolor_epigastrico',
    'nauseas_vomitos_severos',
    'edema_facial',
    'edema_manos'
];
exports.SINTOMAS_EMERGENCIA = [
    'ausencia_movimiento_fetal_confirmada',
    'convulsiones',
    'perdida_conciencia',
    'dificultad_respiratoria_severa',
    'dolor_toracico',
    'sangrado_masivo'
];
// ==================== FUNCIÓN PRINCIPAL DE EVALUACIÓN ====================
/**
 * Evalúa signos de alarma obstétrica basado en datos clínicos y síntomas
 * @param control - Datos del control prenatal o datos clínicos
 * @param sintomas - Array de síntomas reportados
 * @param temperatura - Temperatura corporal (opcional si no está en control)
 * @param frecuenciaRespiratoria - Frecuencia respiratoria (opcional si no está en control)
 * @returns Resultado de la evaluación con tipo de alerta, prioridad y mensaje
 */
function evaluarSignosAlarma(control, sintomas, temperatura, frecuenciaRespiratoria) {
    console.log('🔍 Evaluando signos de alarma:', { control, sintomas, temperatura, frecuenciaRespiratoria });
    // Usar temperatura y FR del parámetro si no están en control
    const tempFinal = temperatura ?? control.temperatura;
    const frFinal = frecuenciaRespiratoria ?? control.frecuencia_respiratoria;
    // Recopilar todos los síntomas detectados
    const todosLosSintomas = new Set();
    if (sintomas) {
        sintomas.forEach(s => todosLosSintomas.add(s));
    }
    // Detectar grupos de síntomas
    const tieneSintomasHemorragia = sintomas?.some(s => exports.SINTOMAS_HEMORRAGIA.includes(s)) || false;
    const tieneSintomasSepsis = sintomas?.some(s => exports.SINTOMAS_SEPSIS.includes(s)) || false;
    const tieneSintomasTrabajoParto = sintomas?.some(s => exports.SINTOMAS_TRABAJO_PARTO.includes(s)) || false;
    const tieneSintomasPreeclampsia = sintomas?.some(s => exports.SINTOMAS_PREECLAMPSIA.includes(s)) || false;
    const tieneSintomasEmergencia = sintomas?.some(s => exports.SINTOMAS_EMERGENCIA.includes(s)) || false;
    // ==================== EVALUACIONES CRÍTICAS (PRIORIDAD MÁXIMA) ====================
    // 1. EMERGENCIAS OBSTÉTRICAS INMEDIATAS
    if (tieneSintomasEmergencia) {
        return {
            tipo: prisma_enums_1.AlertaTipo.EMERGENCIA_OBSTETRICA,
            nivelPrioridad: prisma_enums_1.PrioridadNivel.critica,
            mensaje: 'EMERGENCIA OBSTÉTRICA: Síntomas de riesgo vital inmediato detectados.',
            sintomasDetectados: Array.from(todosLosSintomas),
            puntuacion: 100,
            recomendaciones: ['Traslado inmediato a centro hospitalario', 'Activar protocolo de emergencia']
        };
    }
    // 2. AUSENCIA DE MOVIMIENTOS FETALES CONFIRMADA
    if (sintomas?.includes('ausencia_movimiento_fetal_confirmada')) {
        return {
            tipo: prisma_enums_1.AlertaTipo.EMERGENCIA_OBSTETRICA,
            nivelPrioridad: prisma_enums_1.PrioridadNivel.critica,
            mensaje: 'ALERTA CRÍTICA: Ausencia de movimientos fetales confirmada.',
            sintomasDetectados: Array.from(todosLosSintomas),
            puntuacion: 95,
            recomendaciones: ['Evaluación fetal inmediata', 'Monitoreo fetal urgente']
        };
    }
    // 3. SOSPECHA DE SEPSIS MATERNA
    if (tieneSintomasSepsis && tempFinal !== undefined && tempFinal !== null && tempFinal >= exports.UMBRAL_TEMPERATURA_ALTA) {
        const tieneSignosVitalesAlterados = (control?.frecuencia_cardiaca !== undefined && control.frecuencia_cardiaca !== null && control.frecuencia_cardiaca >= exports.UMBRAL_FC_ALTA) ||
            (frFinal !== undefined && frFinal !== null && frFinal >= exports.UMBRAL_FR_ALTA);
        if (tieneSignosVitalesAlterados) {
            return {
                tipo: prisma_enums_1.AlertaTipo.EMERGENCIA_OBSTETRICA,
                nivelPrioridad: prisma_enums_1.PrioridadNivel.critica,
                mensaje: `SEPSIS MATERNA: Fiebre ${tempFinal}°C + signos vitales alterados + síntomas clínicos.`,
                sintomasDetectados: Array.from(todosLosSintomas),
                puntuacion: 90,
                recomendaciones: ['Antibioticoterapia inmediata', 'Hemocultivos', 'Traslado urgente']
            };
        }
        else {
            return {
                tipo: prisma_enums_1.AlertaTipo.RIESGO_ALTO,
                nivelPrioridad: prisma_enums_1.PrioridadNivel.alta,
                mensaje: `SOSPECHA SEPSIS: Fiebre ${tempFinal}°C + síntomas clínicos sugestivos.`,
                sintomasDetectados: Array.from(todosLosSintomas),
                puntuacion: 75,
                recomendaciones: ['Evaluación médica urgente', 'Laboratorios completos']
            };
        }
    }
    // 4. HEMORRAGIA OBSTÉTRICA CON COMPROMISO HEMODINÁMICO
    if (tieneSintomasHemorragia) {
        const tieneHipotension = control?.presion_sistolica !== undefined && control.presion_sistolica !== null &&
            control.presion_sistolica <= exports.UMBRAL_TA_SISTOLICA_BAJA;
        const tieneTaquicardia = control?.frecuencia_cardiaca !== undefined && control.frecuencia_cardiaca !== null &&
            control.frecuencia_cardiaca >= exports.UMBRAL_FC_ALTA;
        if (tieneHipotension || tieneTaquicardia) {
            return {
                tipo: prisma_enums_1.AlertaTipo.EMERGENCIA_OBSTETRICA,
                nivelPrioridad: prisma_enums_1.PrioridadNivel.critica,
                mensaje: 'HEMORRAGIA OBSTÉTRICA SEVERA: Signos de compromiso hemodinámico.',
                sintomasDetectados: Array.from(todosLosSintomas),
                puntuacion: 85,
                recomendaciones: ['Reposición de volumen inmediata', 'Evaluación quirúrgica urgente']
            };
        }
        else {
            return {
                tipo: prisma_enums_1.AlertaTipo.RIESGO_ALTO,
                nivelPrioridad: prisma_enums_1.PrioridadNivel.alta,
                mensaje: 'HEMORRAGIA OBSTÉTRICA: Síntomas de sangrado significativo.',
                sintomasDetectados: Array.from(todosLosSintomas),
                puntuacion: 70,
                recomendaciones: ['Evaluación médica inmediata', 'Monitoreo de signos vitales']
            };
        }
    }
    // Continúa en la siguiente parte del archivo...
    return evaluarSignosAlarmaIntermedio(control, sintomas, tempFinal !== null && tempFinal !== undefined ? tempFinal : undefined, frFinal !== null && frFinal !== undefined ? frFinal : undefined, todosLosSintomas, {
        tieneSintomasPreeclampsia,
        tieneSintomasTrabajoParto
    });
}
// ==================== FUNCIÓN AUXILIAR PARA EVALUACIONES INTERMEDIAS ====================
function evaluarSignosAlarmaIntermedio(control, sintomas, tempFinal, frFinal, todosLosSintomas, flags) {
    // ==================== EVALUACIONES DE PRIORIDAD ALTA ====================
    // 5. PREECLAMPSIA / HIPERTENSIÓN SEVERA
    if (control?.presion_sistolica !== undefined && control?.presion_diastolica !== undefined) {
        const hipertensionSevera = (control.presion_sistolica !== null && control.presion_sistolica !== undefined && control.presion_sistolica >= exports.UMBRAL_TA_SISTOLICA_MUY_ALTA) ||
            (control.presion_diastolica !== null && control.presion_diastolica !== undefined && control.presion_diastolica >= exports.UMBRAL_TA_DIASTOLICA_MUY_ALTA);
        const hipertension = (control.presion_sistolica !== null && control.presion_sistolica !== undefined && control.presion_sistolica >= exports.UMBRAL_TA_SISTOLICA_ALTA) ||
            (control.presion_diastolica !== null && control.presion_diastolica !== undefined && control.presion_diastolica >= exports.UMBRAL_TA_DIASTOLICA_ALTA);
        if (hipertensionSevera && flags.tieneSintomasPreeclampsia) {
            return {
                tipo: prisma_enums_1.AlertaTipo.EMERGENCIA_OBSTETRICA,
                nivelPrioridad: prisma_enums_1.PrioridadNivel.critica,
                mensaje: `PREECLAMPSIA SEVERA: TA ${control.presion_sistolica}/${control.presion_diastolica} + síntomas neurológicos.`,
                sintomasDetectados: Array.from(todosLosSintomas),
                puntuacion: 88,
                recomendaciones: ['Hospitalización inmediata', 'Sulfato de magnesio', 'Evaluación fetal']
            };
        }
        else if (hipertensionSevera) {
            return {
                tipo: prisma_enums_1.AlertaTipo.RIESGO_ALTO,
                nivelPrioridad: prisma_enums_1.PrioridadNivel.alta,
                mensaje: `HIPERTENSIÓN SEVERA: TA ${control.presion_sistolica}/${control.presion_diastolica} mmHg.`,
                sintomasDetectados: Array.from(todosLosSintomas),
                puntuacion: 80,
                recomendaciones: ['Control médico urgente', 'Monitoreo TA frecuente', 'Evaluación proteinuria']
            };
        }
        else if (hipertension && flags.tieneSintomasPreeclampsia) {
            return {
                tipo: prisma_enums_1.AlertaTipo.RIESGO_ALTO,
                nivelPrioridad: prisma_enums_1.PrioridadNivel.alta,
                mensaje: `SOSPECHA PREECLAMPSIA: TA ${control.presion_sistolica}/${control.presion_diastolica} + síntomas.`,
                sintomasDetectados: Array.from(todosLosSintomas),
                puntuacion: 75,
                recomendaciones: ['Evaluación médica en 24h', 'Laboratorios (proteinuria, función renal)']
            };
        }
    }
    // 6. TRABAJO DE PARTO PREMATURO
    if (flags.tieneSintomasTrabajoParto && control?.semanas_gestacion !== undefined) {
        if (control.semanas_gestacion !== null && control.semanas_gestacion !== undefined && control.semanas_gestacion < exports.UMBRAL_PARTO_MUY_PREMATURO) {
            return {
                tipo: prisma_enums_1.AlertaTipo.EMERGENCIA_OBSTETRICA,
                nivelPrioridad: prisma_enums_1.PrioridadNivel.critica,
                mensaje: `TRABAJO DE PARTO MUY PREMATURO: Síntomas a las ${control.semanas_gestacion} semanas.`,
                sintomasDetectados: Array.from(todosLosSintomas),
                puntuacion: 85,
                recomendaciones: ['Hospitalización inmediata', 'Tocolíticos', 'Corticoides para maduración pulmonar']
            };
        }
        else if (control.semanas_gestacion !== null && control.semanas_gestacion !== undefined && control.semanas_gestacion < exports.UMBRAL_PARTO_PREMATURO) {
            return {
                tipo: prisma_enums_1.AlertaTipo.TRABAJO_PARTO,
                nivelPrioridad: prisma_enums_1.PrioridadNivel.alta,
                mensaje: `TRABAJO DE PARTO PREMATURO: Síntomas a las ${control.semanas_gestacion} semanas.`,
                sintomasDetectados: Array.from(todosLosSintomas),
                puntuacion: 70,
                recomendaciones: ['Evaluación obstétrica urgente', 'Monitoreo fetal', 'Reposo']
            };
        }
    }
    // 7. ALTERACIONES SEVERAS DE SIGNOS VITALES
    const taquicardiaSeveera = control?.frecuencia_cardiaca !== undefined &&
        (control.frecuencia_cardiaca !== null && control.frecuencia_cardiaca !== undefined && control.frecuencia_cardiaca >= exports.UMBRAL_FC_MUY_ALTA);
    const taquipneaSevera = frFinal !== undefined && frFinal >= exports.UMBRAL_FR_MUY_ALTA;
    const fiebreAlta = tempFinal !== undefined && tempFinal >= exports.UMBRAL_TEMPERATURA_MUY_ALTA;
    if (taquicardiaSeveera || taquipneaSevera || fiebreAlta) {
        return {
            tipo: prisma_enums_1.AlertaTipo.RIESGO_ALTO,
            nivelPrioridad: prisma_enums_1.PrioridadNivel.alta,
            mensaje: 'ALTERACIÓN SEVERA DE SIGNOS VITALES: Requiere evaluación médica inmediata.',
            sintomasDetectados: Array.from(todosLosSintomas),
            puntuacion: 65,
            recomendaciones: ['Evaluación médica urgente', 'Monitoreo continuo', 'Investigar causa subyacente']
        };
    }
    // Continuar con evaluaciones de prioridad media
    return evaluarSignosAlarmaMedio(control, sintomas, tempFinal, frFinal, todosLosSintomas);
}
// ==================== FUNCIÓN PARA EVALUACIONES DE PRIORIDAD MEDIA ====================
function evaluarSignosAlarmaMedio(control, sintomas, tempFinal, frFinal, todosLosSintomas) {
    // ==================== EVALUACIONES DE PRIORIDAD MEDIA ====================
    // 8. HIPERTENSIÓN LEVE A MODERADA
    if (control?.presion_sistolica !== undefined && control?.presion_diastolica !== undefined) {
        const hipertension = (control.presion_sistolica !== null && control.presion_sistolica >= exports.UMBRAL_TA_SISTOLICA_ALTA) ||
            (control.presion_diastolica !== null && control.presion_diastolica >= exports.UMBRAL_TA_DIASTOLICA_ALTA);
        if (hipertension) {
            return {
                tipo: prisma_enums_1.AlertaTipo.RIESGO_ALTO,
                nivelPrioridad: prisma_enums_1.PrioridadNivel.media,
                mensaje: `HIPERTENSIÓN: TA ${control.presion_sistolica}/${control.presion_diastolica} mmHg.`,
                sintomasDetectados: Array.from(todosLosSintomas),
                puntuacion: 50,
                recomendaciones: ['Control médico en 48-72h', 'Monitoreo TA domiciliario', 'Dieta hiposódica']
            };
        }
    }
    // 9. ALTERACIONES MODERADAS DE SIGNOS VITALES
    const taquicardia = control?.frecuencia_cardiaca !== undefined &&
        (control.frecuencia_cardiaca !== null && control.frecuencia_cardiaca !== undefined && control.frecuencia_cardiaca >= exports.UMBRAL_FC_ALTA);
    const taquipnea = frFinal !== undefined && frFinal >= exports.UMBRAL_FR_ALTA;
    const fiebre = tempFinal !== undefined && tempFinal >= exports.UMBRAL_TEMPERATURA_ALTA;
    if (taquicardia || taquipnea || fiebre) {
        return {
            tipo: prisma_enums_1.AlertaTipo.SINTOMA_ALARMA,
            nivelPrioridad: prisma_enums_1.PrioridadNivel.media,
            mensaje: 'ALTERACIÓN DE SIGNOS VITALES: Monitoreo y seguimiento requerido.',
            sintomasDetectados: Array.from(todosLosSintomas),
            puntuacion: 45,
            recomendaciones: ['Seguimiento en 24-48h', 'Hidratación adecuada', 'Reposo relativo']
        };
    }
    // 10. EDEMAS SIGNIFICATIVOS
    if (control?.edemas === true) {
        todosLosSintomas.add('edemas_detectados');
        return {
            tipo: prisma_enums_1.AlertaTipo.SINTOMA_ALARMA,
            nivelPrioridad: prisma_enums_1.PrioridadNivel.media,
            mensaje: 'EDEMAS DETECTADOS: Requiere evaluación para descartar preeclampsia.',
            sintomasDetectados: Array.from(todosLosSintomas),
            puntuacion: 40,
            recomendaciones: ['Control médico en 48h', 'Examen de orina (proteinuria)', 'Elevación de extremidades']
        };
    }
    // 11. AUSENCIA DE MOVIMIENTOS FETALES (NO CONFIRMADA)
    if (control?.movimientos_fetales === false) {
        todosLosSintomas.add('movimientos_fetales_disminuidos');
        return {
            tipo: prisma_enums_1.AlertaTipo.SINTOMA_ALARMA,
            nivelPrioridad: prisma_enums_1.PrioridadNivel.media,
            mensaje: 'MOVIMIENTOS FETALES DISMINUIDOS: Requiere evaluación fetal.',
            sintomasDetectados: Array.from(todosLosSintomas),
            puntuacion: 55,
            recomendaciones: ['Conteo de movimientos fetales', 'Evaluación obstétrica en 24h', 'Monitoreo fetal']
        };
    }
    // Si no se detecta ninguna alarma específica, retornar null
    return { tipo: null, nivelPrioridad: null, mensaje: null };
}
// ==================== SISTEMA DE PUNTUACIÓN AVANZADO ====================
/**
 * Calcula una puntuación de riesgo basada en múltiples factores
 * @param control - Datos del control prenatal
 * @param sintomas - Array de síntomas reportados
 * @param historialControles - Controles previos para análisis de tendencias
 * @returns Puntuación de riesgo (0-100)
 */
function calcularPuntuacionRiesgo(control, sintomas, historialControles) {
    let puntuacion = 0;
    // Factores de presión arterial
    if (control.presion_sistolica !== undefined && control.presion_diastolica !== undefined) {
        if ((control.presion_sistolica !== null && control.presion_sistolica >= exports.UMBRAL_TA_SISTOLICA_MUY_ALTA) ||
            (control.presion_diastolica !== null && control.presion_diastolica >= exports.UMBRAL_TA_DIASTOLICA_MUY_ALTA)) {
            puntuacion += 25;
        }
        else if ((control.presion_sistolica !== null && control.presion_sistolica >= exports.UMBRAL_TA_SISTOLICA_ALTA) ||
            (control.presion_diastolica !== null && control.presion_diastolica >= exports.UMBRAL_TA_DIASTOLICA_ALTA)) {
            puntuacion += 15;
        }
    }
    // Factores de frecuencia cardíaca
    if (control.frecuencia_cardiaca !== undefined && control.frecuencia_cardiaca !== null) {
        if (control.frecuencia_cardiaca >= exports.UMBRAL_FC_MUY_ALTA) {
            puntuacion += 15;
        }
        else if (control.frecuencia_cardiaca >= exports.UMBRAL_FC_ALTA) {
            puntuacion += 10;
        }
    }
    // Factores de temperatura
    if (control.temperatura !== undefined) {
        if (control.temperatura !== null && control.temperatura !== undefined && control.temperatura >= exports.UMBRAL_TEMPERATURA_MUY_ALTA) {
            puntuacion += 20;
        }
        else if (control.temperatura !== null && control.temperatura !== undefined && control.temperatura >= exports.UMBRAL_TEMPERATURA_ALTA) {
            puntuacion += 10;
        }
    }
    // Factores de síntomas
    if (sintomas) {
        const sintomasEmergencia = sintomas.filter(s => exports.SINTOMAS_EMERGENCIA.includes(s)).length;
        const sintomasHemorragia = sintomas.filter(s => exports.SINTOMAS_HEMORRAGIA.includes(s)).length;
        const sintomasSepsis = sintomas.filter(s => exports.SINTOMAS_SEPSIS.includes(s)).length;
        const sintomasPreeclampsia = sintomas.filter(s => exports.SINTOMAS_PREECLAMPSIA.includes(s)).length;
        puntuacion += sintomasEmergencia * 25;
        puntuacion += sintomasHemorragia * 20;
        puntuacion += sintomasSepsis * 15;
        puntuacion += sintomasPreeclampsia * 10;
    }
    // Factores obstétricos
    if (control.movimientos_fetales === false) {
        puntuacion += 15;
    }
    if (control.edemas === true) {
        puntuacion += 8;
    }
    // Análisis de tendencias (si hay historial)
    if (historialControles && historialControles.length > 0) {
        const tendenciaPuntuacion = analizarTendencias(control, historialControles);
        puntuacion += tendenciaPuntuacion;
    }
    return Math.min(puntuacion, 100); // Máximo 100 puntos
}
/**
 * Analiza tendencias en controles previos
 * @param controlActual - Control actual
 * @param historial - Controles previos
 * @returns Puntuación adicional por tendencias (0-20)
 */
function analizarTendencias(controlActual, historial) {
    let puntuacionTendencia = 0;
    // Tendencia de presión arterial
    const controlesConTA = historial.filter(c => c.presion_sistolica && c.presion_diastolica);
    if (controlesConTA.length >= 2 && controlActual.presion_sistolica && controlActual.presion_diastolica) {
        const ultimaTA = controlesConTA[controlesConTA.length - 1];
        const incrementoSistolica = controlActual.presion_sistolica - (ultimaTA.presion_sistolica || 0);
        const incrementoDiastolica = controlActual.presion_diastolica - (ultimaTA.presion_diastolica || 0);
        if (incrementoSistolica > 20 || incrementoDiastolica > 10) {
            puntuacionTendencia += 10;
        }
    }
    // Tendencia de peso
    const controlesConPeso = historial.filter(c => c.peso);
    if (controlesConPeso.length >= 1 && controlActual.peso) {
        const ultimoPeso = controlesConPeso[controlesConPeso.length - 1];
        const incrementoPeso = controlActual.peso - (ultimoPeso.peso || 0);
        // Asumiendo controles semanales
        if (incrementoPeso > exports.UMBRAL_GANANCIA_PESO_SEMANAL_ALTA) {
            puntuacionTendencia += 5;
        }
    }
    return puntuacionTendencia;
}
// ==================== FUNCIONES DE UTILIDAD ====================
/**
 * Determina el nivel de prioridad basado en la puntuación
 * @param puntuacion - Puntuación de riesgo (0-100)
 * @returns Nivel de prioridad
 */
function determinarPrioridadPorPuntuacion(puntuacion) {
    if (puntuacion >= 80)
        return prisma_enums_1.PrioridadNivel.critica;
    if (puntuacion >= 60)
        return prisma_enums_1.PrioridadNivel.alta;
    if (puntuacion >= 30)
        return prisma_enums_1.PrioridadNivel.media;
    return prisma_enums_1.PrioridadNivel.baja;
}
/**
 * Determina el tipo de alerta basado en síntomas y puntuación
 * @param sintomas - Array de síntomas
 * @param puntuacion - Puntuación de riesgo
 * @returns Tipo de alerta
 */
function determinarTipoAlerta(sintomas, puntuacion) {
    if (sintomas) {
        if (sintomas.some(s => exports.SINTOMAS_EMERGENCIA.includes(s)))
            return prisma_enums_1.AlertaTipo.EMERGENCIA_OBSTETRICA;
        if (sintomas.some(s => exports.SINTOMAS_HEMORRAGIA.includes(s)))
            return prisma_enums_1.AlertaTipo.EMERGENCIA_OBSTETRICA;
        if (sintomas.some(s => exports.SINTOMAS_TRABAJO_PARTO.includes(s)))
            return prisma_enums_1.AlertaTipo.TRABAJO_PARTO;
        if (sintomas.some(s => exports.SINTOMAS_SEPSIS.includes(s)))
            return prisma_enums_1.AlertaTipo.RIESGO_ALTO;
        if (sintomas.some(s => exports.SINTOMAS_PREECLAMPSIA.includes(s)))
            return prisma_enums_1.AlertaTipo.RIESGO_ALTO;
    }
    if (puntuacion !== undefined) {
        if (puntuacion >= 80)
            return prisma_enums_1.AlertaTipo.EMERGENCIA_OBSTETRICA;
        if (puntuacion >= 60)
            return prisma_enums_1.AlertaTipo.RIESGO_ALTO;
        if (puntuacion >= 30)
            return prisma_enums_1.AlertaTipo.SINTOMA_ALARMA;
    }
    return prisma_enums_1.AlertaTipo.SINTOMA_ALARMA;
}
/**
 * Genera recomendaciones específicas basadas en los hallazgos
 * @param control - Datos del control
 * @param sintomas - Síntomas detectados
 * @param puntuacion - Puntuación de riesgo
 * @returns Array de recomendaciones
 */
function generarRecomendaciones(control, sintomas, puntuacion) {
    const recomendaciones = [];
    // Recomendaciones por signos vitales
    if (control.presion_sistolica !== null && control.presion_sistolica !== undefined && control.presion_sistolica >= exports.UMBRAL_TA_SISTOLICA_ALTA) {
        recomendaciones.push('Control de presión arterial frecuente');
        recomendaciones.push('Dieta hiposódica');
        recomendaciones.push('Reposo relativo');
    }
    if (control.temperatura && control.temperatura >= exports.UMBRAL_TEMPERATURA_ALTA) {
        recomendaciones.push('Hidratación abundante');
        recomendaciones.push('Medidas físicas para control de temperatura');
        recomendaciones.push('Investigar foco infeccioso');
    }
    // Recomendaciones por síntomas
    if (sintomas) {
        if (sintomas.some(s => exports.SINTOMAS_PREECLAMPSIA.includes(s))) {
            recomendaciones.push('Examen de orina (proteinuria)');
            recomendaciones.push('Laboratorios: función renal y hepática');
        }
        if (sintomas.some(s => exports.SINTOMAS_TRABAJO_PARTO.includes(s))) {
            recomendaciones.push('Reposo absoluto');
            recomendaciones.push('Hidratación adecuada');
            recomendaciones.push('Monitoreo de contracciones');
        }
    }
    // Recomendaciones por puntuación
    if (puntuacion !== undefined) {
        if (puntuacion >= 80) {
            recomendaciones.push('Traslado inmediato a centro hospitalario');
            recomendaciones.push('Activar protocolo de emergencia');
        }
        else if (puntuacion >= 60) {
            recomendaciones.push('Evaluación médica urgente en 24 horas');
            recomendaciones.push('Monitoreo continuo de signos vitales');
        }
    }
    return recomendaciones;
}
