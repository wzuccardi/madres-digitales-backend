"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScoringService = void 0;
// src/services/scoring.service.ts
// Servicio especializado para sistema de puntuación de riesgo obstétrico
const database_1 = __importDefault(require("../config/database"));
const alarma_utils_1 = require("../utils/alarma_utils");
// ==================== SERVICIO PRINCIPAL ====================
class ScoringService {
    constructor() {
        // Configuración por defecto basada en evidencia médica
        this.configuracion = {
            pesos_factores: {
                presion_arterial: 25,
                frecuencia_cardiaca: 15,
                temperatura: 20,
                sintomas_emergencia: 30,
                sintomas_hemorragia: 25,
                sintomas_sepsis: 20,
                movimientos_fetales: 15,
                edemas: 8,
                tendencias_historicas: 10
            },
            umbrales_puntuacion: {
                critico: 80,
                alto: 60,
                medio: 30,
                bajo: 0
            },
            factores_multiplicadores: {
                edad_extrema: 1.2, // <18 o >35 años
                embarazo_multiple: 1.3,
                antecedentes_obstetricos: 1.15,
                comorbilidades: 1.25
            }
        };
    }
    /**
     * Evalúa el riesgo completo de una gestante con scoring avanzado
     * @param gestanteId - ID de la gestante
     * @param datosActuales - Datos del control o alerta actual
     * @param sintomas - Síntomas reportados
     * @returns Perfil de riesgo completo
     */
    async evaluarRiesgoCompleto(gestanteId, datosActuales, sintomas) {
        console.log(`📊 ScoringService: Evaluating complete risk for gestante ${gestanteId}...`);
        try {
            // Obtener información completa de la gestante
            const gestante = await database_1.default.gestante.findUnique({
                where: { id: gestanteId },
                include: {
                // Incluir relaciones necesarias si existen en el esquema
                }
            });
            if (!gestante) {
                throw new Error(`Gestante ${gestanteId} no encontrada`);
            }
            // Obtener historial de controles
            const historialControles = await database_1.default.controlPrenatal.findMany({
                where: { gestante_id: gestanteId },
                orderBy: { fecha_control: 'desc' },
                take: 10 // Últimos 10 controles
            });
            // Obtener historial de alertas
            const historialAlertas = await database_1.default.alerta.findMany({
                where: { gestante_id: gestanteId },
                orderBy: { created_at: 'desc' },
                take: 20 // Últimas 20 alertas
            });
            // Convertir datos de Prisma a formato compatible
            const datosCompatibles = {
                presion_sistolica: datosActuales.presion_sistolica,
                presion_diastolica: datosActuales.presion_diastolica,
                frecuencia_cardiaca: datosActuales.frecuencia_cardiaca,
                temperatura: datosActuales.temperatura ? Number(datosActuales.temperatura) : undefined,
                semanas_gestacion: datosActuales.semanas_gestacion,
                movimientos_fetales: datosActuales.movimientos_fetales,
                edemas: datosActuales.edemas
            };
            // Convertir historial de controles también
            const historialCompatible = historialControles.map(control => ({
                presion_sistolica: control.presion_sistolica,
                presion_diastolica: control.presion_diastolica,
                frecuencia_cardiaca: control.frecuencia_cardiaca,
                temperatura: control.temperatura ? Number(control.temperatura) : undefined,
                semanas_gestacion: control.semanas_gestacion,
                movimientos_fetales: control.movimientos_fetales,
                edemas: control.edemas
            }));
            // Calcular puntuación base
            let puntuacionBase = (0, alarma_utils_1.calcularPuntuacionRiesgo)(datosCompatibles, sintomas, historialCompatible);
            // Aplicar factores de riesgo adicionales
            const factoresAdicionales = await this.calcularFactoresAdicionales(gestante, historialControles, historialAlertas);
            puntuacionBase += factoresAdicionales.puntuacion_adicional;
            // Aplicar multiplicadores
            const multiplicadores = this.calcularMultiplicadores(gestante);
            const puntuacionFinal = Math.min(puntuacionBase * multiplicadores, 100);
            // Determinar nivel de riesgo
            const nivelRiesgo = (0, alarma_utils_1.determinarPrioridadPorPuntuacion)(puntuacionFinal);
            // Analizar tendencia
            const tendencia = this.analizarTendenciaRiesgo(historialControles, historialAlertas);
            // Identificar factores de riesgo activos
            const factoresActivos = this.identificarFactoresActivos(datosActuales, sintomas, factoresAdicionales.factores, gestante);
            console.log(`📊 ScoringService: Risk evaluation completed. Score: ${puntuacionFinal}, Level: ${nivelRiesgo}`);
            return {
                gestante_id: gestanteId,
                puntuacion_actual: Math.round(puntuacionFinal),
                nivel_riesgo: nivelRiesgo,
                factores_riesgo_activos: factoresActivos,
                tendencia_riesgo: tendencia,
                ultima_evaluacion: new Date(),
                controles_evaluados: historialControles.length,
                alertas_generadas: historialAlertas.length
            };
        }
        catch (error) {
            console.error(`❌ ScoringService: Error evaluating risk for gestante ${gestanteId}:`, error);
            throw error;
        }
    }
    /**
     * Calcula factores de riesgo adicionales basados en historial
     * @param gestante - Datos de la gestante
     * @param controles - Historial de controles
     * @param alertas - Historial de alertas
     * @returns Factores adicionales y puntuación
     */
    async calcularFactoresAdicionales(gestante, controles, alertas) {
        let puntuacionAdicional = 0;
        const factores = [];
        // Factor: Frecuencia de alertas recientes
        const alertasRecientes = alertas.filter(a => {
            const diasDesdeAlerta = (Date.now() - new Date(a.created_at).getTime()) / (1000 * 60 * 60 * 24);
            return diasDesdeAlerta <= 30; // Últimos 30 días
        });
        if (alertasRecientes.length >= 3) {
            puntuacionAdicional += 15;
            factores.push('Múltiples alertas recientes');
        }
        // Factor: Controles irregulares
        if (controles.length >= 2) {
            const intervalosControles = [];
            for (let i = 1; i < controles.length; i++) {
                const dias = (new Date(controles[i - 1].fecha_control).getTime() -
                    new Date(controles[i].fecha_control).getTime()) / (1000 * 60 * 60 * 24);
                intervalosControles.push(dias);
            }
            const promedioIntervalo = intervalosControles.reduce((a, b) => a + b, 0) / intervalosControles.length;
            if (promedioIntervalo > 35) { // Más de 5 semanas entre controles
                puntuacionAdicional += 8;
                factores.push('Controles prenatales irregulares');
            }
        }
        // Factor: Escalamiento de alertas
        const alertasCriticas = alertas.filter(a => a.nivel_prioridad === 'critica').length;
        if (alertasCriticas >= 2) {
            puntuacionAdicional += 12;
            factores.push('Historial de alertas críticas');
        }
        return { puntuacion_adicional: puntuacionAdicional, factores };
    }
    /**
     * Calcula multiplicadores basados en características de la gestante
     * @param gestante - Datos de la gestante
     * @returns Factor multiplicador
     */
    calcularMultiplicadores(gestante) {
        let multiplicador = 1.0;
        // Edad extrema
        if (gestante.fecha_nacimiento) {
            const edad = this.calcularEdad(gestante.fecha_nacimiento);
            if (edad < 18 || edad > 35) {
                multiplicador *= this.configuracion.factores_multiplicadores.edad_extrema;
            }
        }
        // Otros multiplicadores se pueden agregar aquí basados en campos disponibles
        // como embarazo múltiple, antecedentes, comorbilidades, etc.
        return multiplicador;
    }
    /**
     * Analiza la tendencia de riesgo basada en el historial
     * @param controles - Historial de controles
     * @param alertas - Historial de alertas
     * @returns Tendencia del riesgo
     */
    analizarTendenciaRiesgo(controles, alertas) {
        if (controles.length < 3)
            return 'estable';
        // Calcular puntuaciones de los últimos 3 controles
        const puntuacionesRecientes = controles.slice(0, 3).map(control => {
            const datos = {
                presion_sistolica: control.presion_sistolica,
                presion_diastolica: control.presion_diastolica,
                frecuencia_cardiaca: control.frecuencia_cardiaca,
                temperatura: control.temperatura ? Number(control.temperatura) : undefined,
                movimientos_fetales: control.movimientos_fetales,
                edemas: control.edemas
            };
            return (0, alarma_utils_1.calcularPuntuacionRiesgo)(datos);
        });
        // Analizar tendencia
        const primera = puntuacionesRecientes[2]; // Más antigua
        const ultima = puntuacionesRecientes[0]; // Más reciente
        const diferencia = ultima - primera;
        if (diferencia > 10)
            return 'ascendente';
        if (diferencia < -10)
            return 'descendente';
        return 'estable';
    }
    /**
     * Identifica todos los factores de riesgo activos
     * @param datos - Datos actuales
     * @param sintomas - Síntomas reportados
     * @param factoresHistoricos - Factores del historial
     * @param gestante - Datos de la gestante
     * @returns Array de factores activos
     */
    identificarFactoresActivos(datos, sintomas, factoresHistoricos, gestante) {
        const factores = [];
        // Factores clínicos actuales
        if ((datos.presion_sistolica !== null && datos.presion_sistolica !== undefined && datos.presion_sistolica >= 160) ||
            (datos.presion_diastolica !== null && datos.presion_diastolica !== undefined && datos.presion_diastolica >= 110)) {
            factores.push('Hipertensión severa');
        }
        if (datos.frecuencia_cardiaca !== null && datos.frecuencia_cardiaca !== undefined && datos.frecuencia_cardiaca >= 120) {
            factores.push('Taquicardia severa');
        }
        if (datos.temperatura !== null && datos.temperatura !== undefined && datos.temperatura >= 39.0) {
            factores.push('Fiebre alta');
        }
        if (datos.movimientos_fetales === false) {
            factores.push('Movimientos fetales ausentes');
        }
        // Factores por síntomas
        if (sintomas) {
            if (sintomas.some(s => alarma_utils_1.SINTOMAS_EMERGENCIA.includes(s))) {
                factores.push('Síntomas de emergencia');
            }
            if (sintomas.some(s => alarma_utils_1.SINTOMAS_HEMORRAGIA.includes(s))) {
                factores.push('Síntomas de hemorragia');
            }
            if (sintomas.some(s => alarma_utils_1.SINTOMAS_SEPSIS.includes(s))) {
                factores.push('Síntomas de sepsis');
            }
        }
        // Agregar factores históricos
        if (factoresHistoricos) {
            factores.push(...factoresHistoricos);
        }
        return [...new Set(factores)]; // Eliminar duplicados
    }
    /**
     * Calcula la edad basada en fecha de nacimiento
     * @param fechaNacimiento - Fecha de nacimiento
     * @returns Edad en años
     */
    calcularEdad(fechaNacimiento) {
        const hoy = new Date();
        const nacimiento = new Date(fechaNacimiento);
        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const mes = hoy.getMonth() - nacimiento.getMonth();
        if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
            edad--;
        }
        return edad;
    }
    /**
     * Actualiza la configuración del sistema de scoring
     * @param nuevaConfiguracion - Nueva configuración
     */
    async actualizarConfiguracion(nuevaConfiguracion) {
        this.configuracion = { ...this.configuracion, ...nuevaConfiguracion };
        console.log('📊 ScoringService: Configuration updated');
    }
    /**
     * Obtiene la configuración actual
     * @returns Configuración actual del scoring
     */
    obtenerConfiguracion() {
        return { ...this.configuracion };
    }
}
exports.ScoringService = ScoringService;
