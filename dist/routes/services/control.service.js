"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ControlService = void 0;
// Servicio para controles prenatales con evaluación automática de alertas
// Todos los datos provienen de la base de datos real, no se usan mocks
const database_1 = __importDefault(require("../config/database"));
const alarma_utils_1 = require("../utils/alarma_utils");
const alerta_service_1 = require("./alerta.service");
class ControlService {
    constructor() {
        this.alertaService = new alerta_service_1.AlertaService();
    }
    // MÉTODO ORIGINAL - SOLO PARA ADMINISTRADORES
    async getAllControles() {
        console.log('🏥 ControlService: Fetching all controles (ADMIN ONLY)...');
        const controles = await database_1.default.control.findMany();
        console.log(`🏥 ControlService: Found ${controles.length} controles`);
        return controles;
    }
    // NUEVO MÉTODO - FILTRADO POR MADRINA (SEGURIDAD)
    async getControlesByMadrina(madrinaId) {
        console.log(`🏥 ControlService: Fetching controles for madrina ${madrinaId}...`);
        // Primero obtenemos los IDs de las gestantes asignadas a esta madrina
        const gestantesAsignadas = await database_1.default.gestante.findMany({
            where: { madrina_id: madrinaId },
            select: { id: true }
        });
        const gestanteIds = gestantesAsignadas.map(g => g.id);
        console.log(`🏥 ControlService: Found ${gestanteIds.length} gestantes for madrina ${madrinaId}`);
        if (gestanteIds.length === 0) {
            console.log(`🏥 ControlService: No gestantes found for madrina ${madrinaId}, returning empty array`);
            return [];
        }
        // Luego obtenemos los controles de esas gestantes
        const controles = await database_1.default.control.findMany({
            where: {
                gestante_id: {
                    in: gestanteIds // FILTRO CRÍTICO DE SEGURIDAD
                }
            },
            orderBy: { fecha_control: 'desc' }
        });
        console.log(`🏥 ControlService: Found ${controles.length} controles for madrina ${madrinaId}`);
        return controles;
    }
    async getControlById(id) {
        return database_1.default.control.findUnique({ where: { id } });
    }
    async createControl(data) {
        return database_1.default.control.create({ data });
    }
    async updateControl(id, data) {
        return database_1.default.control.update({ where: { id }, data });
    }
    async deleteControl(id) {
        return database_1.default.control.delete({ where: { id } });
    }
    // Método para crear control con validaciones
    async createControlCompleto(data) {
        console.log('🏥 ControlService: Creating new control...');
        console.log('   Data received:', data);
        try {
            // Validar que la gestante existe
            const gestante = await database_1.default.gestante.findUnique({
                where: { id: data.gestante_id }
            });
            if (!gestante) {
                throw new Error(`No se encontró gestante con ID ${data.gestante_id}`);
            }
            // Crear el control
            const newControl = await database_1.default.control.create({
                data: {
                    gestante_id: data.gestante_id,
                    medico_id: data.medico_id || 'c66fdb18-76f4-4767-95ad-9b4b81fa6add', // Usuario por defecto (admin)
                    fecha_control: new Date(data.fecha_control),
                    semanas_gestacion: data.semanas_gestacion || null,
                    peso: data.peso || null,
                    presion_sistolica: data.presion_sistolica || null,
                    presion_diastolica: data.presion_diastolica || null,
                }
            });
            console.log(`✅ ControlService: Control created with ID: ${newControl.id}`);
            return newControl;
        }
        catch (error) {
            console.error('❌ ControlService: Error creating control:', error);
            throw error;
        }
    }
    // Método para actualizar control con validaciones
    async updateControlCompleto(id, data) {
        console.log(`🏥 ControlService: Updating control ${id}...`);
        console.log('   Data received:', data);
        try {
            // Verificar que el control existe
            const existingControl = await database_1.default.control.findUnique({
                where: { id }
            });
            if (!existingControl) {
                throw new Error(`No se encontró control con ID ${id}`);
            }
            // Si se está cambiando la gestante, verificar que existe
            if (data.gestante_id && data.gestante_id !== existingControl.gestante_id) {
                const gestante = await database_1.default.gestante.findUnique({
                    where: { id: data.gestante_id }
                });
                if (!gestante) {
                    throw new Error(`No se encontró gestante con ID ${data.gestante_id}`);
                }
            }
            // Actualizar el control
            const updatedControl = await database_1.default.control.update({
                where: { id },
                data: {
                    gestante_id: data.gestante_id || existingControl.gestante_id,
                    medico_id: data.medico_id !== undefined ? data.medico_id : existingControl.medico_id,
                    fecha_control: data.fecha_control ? new Date(data.fecha_control) : existingControl.fecha_control,
                    semanas_gestacion: data.semanas_gestacion !== undefined ? data.semanas_gestacion : existingControl.semanas_gestacion,
                    peso: data.peso !== undefined ? data.peso : existingControl.peso,
                    presion_sistolica: data.presion_sistolica !== undefined ? data.presion_sistolica : existingControl.presion_sistolica,
                    presion_diastolica: data.presion_diastolica !== undefined ? data.presion_diastolica : existingControl.presion_diastolica,
                }
            });
            console.log(`✅ ControlService: Control ${id} updated successfully`);
            return updatedControl;
        }
        catch (error) {
            console.error(`❌ ControlService: Error updating control ${id}:`, error);
            throw error;
        }
    }
    // Método para obtener controles por gestante
    async getControlesByGestante(gestanteId) {
        console.log(`🏥 ControlService: Fetching controls for gestante ${gestanteId}...`);
        const controles = await database_1.default.control.findMany({
            where: { gestante_id: gestanteId },
            orderBy: { fecha_control: 'desc' }
        });
        console.log(`🏥 ControlService: Found ${controles.length} controls for gestante`);
        return controles;
    }
    // ==================== NUEVOS MÉTODOS CON EVALUACIÓN AUTOMÁTICA ====================
    /**
     * Crear control prenatal con evaluación automática de alertas
     * @param data - Datos del control con configuración de evaluación
     * @returns Control creado con resultado de evaluación y alertas generadas
     */
    async createControlConEvaluacion(data) {
        console.log('🏥 ControlService: Creating control with automatic alert evaluation...');
        console.log('   Data received:', data);
        const startTime = Date.now();
        try {
            // Validar que la gestante existe
            const gestante = await database_1.default.gestante.findUnique({
                where: { id: data.gestante_id }
            });
            if (!gestante) {
                throw new Error(`No se encontró gestante con ID ${data.gestante_id}`);
            }
            // Obtener historial de controles si se solicita
            let historialControles = [];
            if (data.incluir_historial) {
                historialControles = await database_1.default.control.findMany({
                    where: { gestante_id: data.gestante_id },
                    orderBy: { fecha_control: 'desc' },
                    take: 5 // Últimos 5 controles
                });
            }
            // Crear el control
            const nuevoControl = await database_1.default.control.create({
                data: {
                    gestante_id: data.gestante_id,
                    medico_id: data.realizado_por_id,
                    fecha_control: new Date(data.fecha_control),
                    semanas_gestacion: data.semanas_gestacion || null,
                    peso: data.peso || null,
                    presion_sistolica: data.presion_sistolica || null,
                    presion_diastolica: data.presion_diastolica || null,
                    frecuencia_cardiaca: data.frecuencia_cardiaca || null,
                    frecuencia_respiratoria: data.frecuencia_respiratoria || null,
                    temperatura: data.temperatura || null,
                    altura_uterina: data.altura_uterina || null,
                    movimientos_fetales: data.movimientos_fetales ? 'si' : 'no',
                    edemas: data.edemas ? 'si' : 'no',
                    recomendaciones: data.recomendaciones || null,
                }
            });
            console.log(`✅ ControlService: Control created with ID: ${nuevoControl.id}`);
            // Realizar evaluación automática si está habilitada
            let evaluacion;
            let alertasGeneradas = [];
            if (data.evaluar_automaticamente !== false) { // Por defecto true
                console.log('🔍 ControlService: Performing automatic alert evaluation...');
                // Preparar datos para evaluación
                const datosControl = {
                    presion_sistolica: nuevoControl.presion_sistolica,
                    presion_diastolica: nuevoControl.presion_diastolica,
                    frecuencia_cardiaca: nuevoControl.frecuencia_cardiaca,
                    frecuencia_respiratoria: nuevoControl.frecuencia_respiratoria,
                    temperatura: nuevoControl.temperatura ? Number(nuevoControl.temperatura) : undefined,
                    peso: nuevoControl.peso ? Number(nuevoControl.peso) : undefined,
                    semanas_gestacion: nuevoControl.semanas_gestacion,
                    altura_uterina: nuevoControl.altura_uterina ? Number(nuevoControl.altura_uterina) : undefined,
                    movimientos_fetales: nuevoControl.movimientos_fetales,
                    edemas: nuevoControl.edemas,
                };
                // Evaluar signos de alarma
                // Convertir valores de string a boolean para compatibilidad
                const datosControlCompat = {
                    ...datosControl,
                    movimientos_fetales: datosControl.movimientos_fetales === 'si',
                    edemas: datosControl.edemas === 'si'
                };
                const resultadoAlarma = (0, alarma_utils_1.evaluarSignosAlarma)(datosControlCompat, data.sintomas);
                // Calcular puntuación de riesgo
                const puntuacionRiesgo = (0, alarma_utils_1.calcularPuntuacionRiesgo)(datosControlCompat, data.sintomas, historialControles);
                // Generar recomendaciones
                const recomendaciones = (0, alarma_utils_1.generarRecomendaciones)(datosControlCompat, data.sintomas, puntuacionRiesgo);
                // Preparar resultado de evaluación
                evaluacion = {
                    alerta_detectada: resultadoAlarma.tipo !== null,
                    tipo_alerta: resultadoAlarma.tipo || undefined,
                    nivel_prioridad: resultadoAlarma.nivelPrioridad || undefined,
                    mensaje: resultadoAlarma.mensaje || undefined,
                    puntuacion_riesgo: puntuacionRiesgo,
                    sintomas_detectados: resultadoAlarma.sintomasDetectados || [],
                    factores_riesgo: this.identificarFactoresRiesgo(datosControl, data.sintomas),
                    recomendaciones: recomendaciones,
                    evaluado_en: new Date(),
                    version_algoritmo: '1.0.0',
                    tiempo_evaluacion_ms: Date.now() - startTime
                };
                // Crear alerta automática si se detectó riesgo
                if (resultadoAlarma.tipo && resultadoAlarma.nivelPrioridad && resultadoAlarma.mensaje) {
                    console.log('🚨 ControlService: Creating automatic alert...');
                    try {
                        const alertaAutomatica = await database_1.default.alerta.create({
                            data: {
                                gestante_id: data.gestante_id,
                                tipo_alerta: resultadoAlarma.tipo,
                                nivel_prioridad: resultadoAlarma.nivelPrioridad,
                                mensaje: resultadoAlarma.mensaje,
                                sintomas: resultadoAlarma.sintomasDetectados || [],
                                // es_automatica: true, // Campo no existe en el esquema actual
                                // control_origen_id: nuevoControl.id, // Campo no existe en el esquema actual
                                generado_por_id: data.realizado_por_id,
                            }
                        });
                        console.log(`🚨 ControlService: Automatic alert created with ID: ${alertaAutomatica.id}`);
                    }
                    catch (alertError) {
                        console.error('❌ ControlService: Error creating automatic alert:', alertError);
                        // No fallar el control por error en alerta
                    }
                }
            }
            else {
                // Evaluación básica sin alertas
                evaluacion = {
                    alerta_detectada: false,
                    puntuacion_riesgo: 0,
                    sintomas_detectados: [],
                    factores_riesgo: [],
                    recomendaciones: [],
                    evaluado_en: new Date(),
                    version_algoritmo: '1.0.0',
                    tiempo_evaluacion_ms: Date.now() - startTime
                };
            }
            return {
                control: {
                    id: nuevoControl.id,
                    gestante_id: nuevoControl.gestante_id,
                    fecha_control: nuevoControl.fecha_control,
                    semanas_gestacion: nuevoControl.semanas_gestacion || undefined,
                    peso: nuevoControl.peso ? Number(nuevoControl.peso) : undefined,
                    presion_sistolica: nuevoControl.presion_sistolica || undefined,
                    presion_diastolica: nuevoControl.presion_diastolica || undefined,
                    frecuencia_cardiaca: nuevoControl.frecuencia_cardiaca || undefined,
                    temperatura: nuevoControl.temperatura ? Number(nuevoControl.temperatura) : undefined,
                    recomendaciones: nuevoControl.recomendaciones || undefined,
                    created_at: nuevoControl.fecha_creacion
                },
                evaluacion,
                alertas_generadas: alertasGeneradas
            };
        }
        catch (error) {
            console.error('❌ ControlService: Error creating control with evaluation:', error);
            throw error;
        }
    }
    /**
     * Identifica factores de riesgo específicos basados en los datos
     * @param datosControl - Datos del control
     * @param sintomas - Síntomas reportados
     * @returns Array de factores de riesgo identificados
     */
    identificarFactoresRiesgo(datosControl, sintomas) {
        const factores = [];
        // Factores de presión arterial
        if (datosControl.presion_sistolica >= 160 || datosControl.presion_diastolica >= 110) {
            factores.push('Hipertensión severa');
        }
        else if (datosControl.presion_sistolica >= 140 || datosControl.presion_diastolica >= 90) {
            factores.push('Hipertensión');
        }
        // Factores de frecuencia cardíaca
        if (datosControl.frecuencia_cardiaca >= 120) {
            factores.push('Taquicardia severa');
        }
        else if (datosControl.frecuencia_cardiaca >= 100) {
            factores.push('Taquicardia');
        }
        // Factores de temperatura
        if (datosControl.temperatura >= 39.0) {
            factores.push('Fiebre alta');
        }
        else if (datosControl.temperatura >= 38.0) {
            factores.push('Fiebre');
        }
        // Factores obstétricos
        if (datosControl.movimientos_fetales === false) {
            factores.push('Movimientos fetales disminuidos');
        }
        if (datosControl.edemas === true) {
            factores.push('Edemas presentes');
        }
        // Factores por síntomas
        if (sintomas) {
            if (sintomas.some(s => s.includes('sangrado') || s.includes('hemorragia'))) {
                factores.push('Síntomas de hemorragia');
            }
            if (sintomas.some(s => s.includes('dolor_cabeza') || s.includes('vision_borrosa'))) {
                factores.push('Síntomas neurológicos');
            }
            if (sintomas.some(s => s.includes('contracciones') || s.includes('trabajo_parto'))) {
                factores.push('Síntomas de trabajo de parto');
            }
        }
        return factores;
    }
    // NUEVO: Obtener historial de controles de una gestante
    async getHistorialControles(gestanteId) {
        console.log(`📊 ControlService: Fetching historial for gestante ${gestanteId}...`);
        const controles = await database_1.default.control.findMany({
            where: { gestante_id: gestanteId },
            orderBy: { fecha_control: 'asc' }
        });
        console.log(`📊 ControlService: Found ${controles.length} controles in history`);
        return controles;
    }
    // NUEVO: Obtener datos de evolución para gráficas
    async getEvolucionGestante(gestanteId) {
        console.log(`📈 ControlService: Calculating evolution for gestante ${gestanteId}...`);
        const controles = await database_1.default.control.findMany({
            where: { gestante_id: gestanteId },
            orderBy: { fecha_control: 'asc' },
            select: {
                id: true,
                fecha_control: true,
                semanas_gestacion: true,
                peso: true,
                presion_sistolica: true,
                presion_diastolica: true,
                frecuencia_cardiaca: true,
                temperatura: true,
                altura_uterina: true,
            }
        });
        // Calcular estadísticas
        const evolucion = {
            total_controles: controles.length,
            primer_control: controles[0]?.fecha_control || null,
            ultimo_control: controles[controles.length - 1]?.fecha_control || null,
            datos: controles.map(c => ({
                fecha: c.fecha_control,
                semanas: c.semanas_gestacion,
                peso: c.peso,
                presion: `${c.presion_sistolica}/${c.presion_diastolica}`,
                frecuencia_cardiaca: c.frecuencia_cardiaca,
                temperatura: c.temperatura,
                altura_uterina: c.altura_uterina,
                imc: c.peso && Number(c.peso) > 0 ? this.calcularIMC(Number(c.peso), 1.60) : null // Altura promedio
            })),
            tendencias: {
                peso: this.calcularTendencia(controles.map(c => Number(c.peso))),
                presion_sistolica: this.calcularTendencia(controles.map(c => Number(c.presion_sistolica))),
                presion_diastolica: this.calcularTendencia(controles.map(c => Number(c.presion_diastolica)))
            }
        };
        console.log(`📈 ControlService: Evolution calculated with ${evolucion.total_controles} controls`);
        return evolucion;
    }
    // NUEVO: Calcular IMC
    calcularIMC(peso, altura) {
        if (!peso || !altura || altura === 0)
            return null;
        return parseFloat((peso / (altura * altura)).toFixed(2));
    }
    // NUEVO: Calcular tendencia (ascendente, descendente, estable)
    calcularTendencia(valores) {
        const valoresValidos = valores.filter(v => v !== null);
        if (valoresValidos.length < 2)
            return 'insuficiente';
        const primero = valoresValidos[0];
        const ultimo = valoresValidos[valoresValidos.length - 1];
        const diferencia = ultimo - primero;
        const porcentaje = (diferencia / primero) * 100;
        if (Math.abs(porcentaje) < 5)
            return 'estable';
        return porcentaje > 0 ? 'ascendente' : 'descendente';
    }
    // NUEVO: Obtener control con datos de gestante
    async getControlConGestante(controlId) {
        console.log(`🔍 ControlService: Fetching control ${controlId} with gestante data...`);
        const control = await database_1.default.control.findUnique({
            where: { id: controlId }
        });
        if (!control) {
            throw new Error(`Control ${controlId} not found`);
        }
        console.log(`✅ ControlService: Control found for gestante ${control.gestante?.nombre || 'desconocida'}`);
        return control;
    }
    // NUEVO: Calcular próximo control recomendado
    async calcularProximoControl(gestanteId) {
        console.log(`📅 ControlService: Calculating next control for gestante ${gestanteId}...`);
        const ultimoControl = await database_1.default.control.findFirst({
            where: { gestante_id: gestanteId },
            orderBy: { fecha_control: 'desc' }
        });
        if (!ultimoControl) {
            return {
                recomendacion: 'Agendar primer control prenatal',
                dias_desde_ultimo: null,
                urgencia: 'alta'
            };
        }
        const diasDesdeUltimo = Math.floor((Date.now() - ultimoControl.fecha_control.getTime()) / (1000 * 60 * 60 * 24));
        let recomendacion = '';
        let urgencia = 'baja';
        if (diasDesdeUltimo > 30) {
            recomendacion = 'Control vencido - Agendar urgente';
            urgencia = 'critica';
        }
        else if (diasDesdeUltimo > 21) {
            recomendacion = 'Próximo control en los próximos 7 días';
            urgencia = 'alta';
        }
        else if (diasDesdeUltimo > 14) {
            recomendacion = 'Próximo control en las próximas 2 semanas';
            urgencia = 'media';
        }
        else {
            recomendacion = 'Control reciente - Próximo en 3-4 semanas';
            urgencia = 'baja';
        }
        console.log(`📅 ControlService: Next control recommendation: ${recomendacion}`);
        return {
            recomendacion,
            dias_desde_ultimo: diasDesdeUltimo,
            urgencia,
            ultimo_control: ultimoControl.fecha_control
        };
    }
    // NUEVO: Obtener controles vencidos o próximos a vencer
    async getControlesVencidos() {
        console.log('⏰ ControlService: Fetching overdue controls');
        // Considerar un control como vencido si tiene más de 30 días desde la fecha esperada
        const fechaLimite = new Date();
        fechaLimite.setDate(fechaLimite.getDate() - 30);
        try {
            const controles = await database_1.default.control.findMany({
                where: {
                    fecha_control: {
                        lt: fechaLimite
                    },
                    realizado: false
                },
                include: {
                    gestante: {
                        select: {
                            id: true,
                            nombre: true,
                            documento: true,
                            fecha_probable_parto: true
                        }
                    },
                    medico: {
                        select: {
                            id: true,
                            nombre: true
                        }
                    }
                },
                orderBy: {
                    fecha_control: 'asc'
                }
            });
            console.log(`⏰ ControlService: Found ${controles.length} overdue controls`);
            return controles;
        }
        catch (error) {
            console.error('❌ ControlService: Error fetching overdue controls:', error);
            throw error;
        }
    }
    // NUEVO: Obtener controles vencidos por madrina
    async getControlesVencidosByMadrina(madrinaId) {
        console.log(`⏰ ControlService: Fetching overdue controls for madrina ${madrinaId}`);
        // Considerar un control como vencido si tiene más de 30 días desde la fecha esperada
        const fechaLimite = new Date();
        fechaLimite.setDate(fechaLimite.getDate() - 30);
        try {
            const controles = await database_1.default.control.findMany({
                where: {
                    fecha_control: {
                        lt: fechaLimite
                    },
                    realizado: false,
                    gestante: {
                        madrina_id: madrinaId
                    }
                },
                include: {
                    gestante: {
                        select: {
                            id: true,
                            nombre: true,
                            documento: true,
                            fecha_probable_parto: true
                        }
                    },
                    medico: {
                        select: {
                            id: true,
                            nombre: true
                        }
                    }
                },
                orderBy: {
                    fecha_control: 'asc'
                }
            });
            console.log(`⏰ ControlService: Found ${controles.length} overdue controls for madrina ${madrinaId}`);
            return controles;
        }
        catch (error) {
            console.error('❌ ControlService: Error fetching overdue controls for madrina:', error);
            throw error;
        }
    }
    // NUEVO: Obtener controles pendientes (no realizados)
    async getControlesPendientes() {
        console.log('📋 ControlService: Fetching pending controls');
        try {
            const controles = await database_1.default.control.findMany({
                where: {
                    realizado: false
                },
                include: {
                    gestante: {
                        select: {
                            id: true,
                            nombre: true,
                            documento: true,
                            fecha_probable_parto: true
                        }
                    },
                    medico: {
                        select: {
                            id: true,
                            nombre: true
                        }
                    }
                },
                orderBy: {
                    fecha_control: 'asc'
                }
            });
            console.log(`📋 ControlService: Found ${controles.length} pending controls`);
            return controles;
        }
        catch (error) {
            console.error('❌ ControlService: Error fetching pending controls:', error);
            throw error;
        }
    }
    // NUEVO: Obtener controles pendientes por madrina
    async getControlesPendientesByMadrina(madrinaId) {
        console.log(`📋 ControlService: Fetching pending controls for madrina ${madrinaId}`);
        try {
            const controles = await database_1.default.control.findMany({
                where: {
                    realizado: false,
                    gestante: {
                        madrina_id: madrinaId
                    }
                },
                include: {
                    gestante: {
                        select: {
                            id: true,
                            nombre: true,
                            documento: true,
                            fecha_probable_parto: true
                        }
                    },
                    medico: {
                        select: {
                            id: true,
                            nombre: true
                        }
                    }
                },
                orderBy: {
                    fecha_control: 'asc'
                }
            });
            console.log(`📋 ControlService: Found ${controles.length} pending controls for madrina ${madrinaId}`);
            return controles;
        }
        catch (error) {
            console.error('❌ ControlService: Error fetching pending controls for madrina:', error);
            throw error;
        }
    }
}
exports.ControlService = ControlService;
