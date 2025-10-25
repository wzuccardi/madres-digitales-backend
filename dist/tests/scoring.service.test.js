"use strict";
// src/tests/scoring.service.test.ts
// Pruebas unitarias para el servicio de scoring avanzado
Object.defineProperty(exports, "__esModule", { value: true });
const scoring_service_1 = require("../services/scoring.service");
// Mock de Prisma para las pruebas
jest.mock('../config/database', () => ({
    gestante: {
        findUnique: jest.fn(),
    },
    controlPrenatal: {
        findMany: jest.fn(),
    },
    alerta: {
        findMany: jest.fn(),
    },
}));
describe('ScoringService', () => {
    let scoringService;
    beforeEach(() => {
        scoringService = new scoring_service_1.ScoringService();
        jest.clearAllMocks();
    });
    // ==================== PRUEBAS DE CONFIGURACIÓN ====================
    describe('Configuración del Sistema', () => {
        test('debe inicializar con configuración por defecto', () => {
            const config = scoringService.obtenerConfiguracion();
            expect(config.pesos_factores.presion_arterial).toBe(25);
            expect(config.pesos_factores.sintomas_emergencia).toBe(30);
            expect(config.umbrales_puntuacion.critico).toBe(80);
            expect(config.umbrales_puntuacion.alto).toBe(60);
        });
        test('debe actualizar configuración correctamente', async () => {
            const nuevaConfig = {
                umbrales_puntuacion: {
                    critico: 85,
                    alto: 65,
                    medio: 35,
                    bajo: 0
                }
            };
            await scoringService.actualizarConfiguracion(nuevaConfig);
            const config = scoringService.obtenerConfiguracion();
            expect(config.umbrales_puntuacion.critico).toBe(85);
            expect(config.umbrales_puntuacion.alto).toBe(65);
        });
    });
    // ==================== PRUEBAS DE EVALUACIÓN DE RIESGO ====================
    describe('Evaluación de Riesgo Completo', () => {
        beforeEach(() => {
            // Mock de datos de gestante
            const mockGestante = {
                id: 'gestante-123',
                nombre: 'María Test',
                fecha_nacimiento: new Date('1990-05-15'),
                semanas_gestacion: 32
            };
            // Mock de controles previos
            const mockControles = [
                {
                    id: 'control-1',
                    fecha_control: new Date('2024-01-15'),
                    presion_sistolica: 130,
                    presion_diastolica: 85,
                    frecuencia_cardiaca: 90,
                    temperatura: 36.5,
                    movimientos_fetales: true,
                    edemas: false
                },
                {
                    id: 'control-2',
                    fecha_control: new Date('2024-01-01'),
                    presion_sistolica: 125,
                    presion_diastolica: 80,
                    frecuencia_cardiaca: 85,
                    temperatura: 36.8,
                    movimientos_fetales: true,
                    edemas: false
                }
            ];
            // Mock de alertas previas
            const mockAlertas = [
                {
                    id: 'alerta-1',
                    created_at: new Date('2024-01-10'),
                    nivel_prioridad: 'media',
                    tipo_alerta: 'sintoma_alarma'
                }
            ];
            require('../config/database').gestante.findUnique.mockResolvedValue(mockGestante);
            require('../config/database').controlPrenatal.findMany.mockResolvedValue(mockControles);
            require('../config/database').alerta.findMany.mockResolvedValue(mockAlertas);
        });
        test('debe evaluar riesgo completo para gestante con datos normales', async () => {
            const datosActuales = {
                presion_sistolica: 120,
                presion_diastolica: 80,
                frecuencia_cardiaca: 85,
                temperatura: 36.7,
                movimientos_fetales: true,
                edemas: false,
                semanas_gestacion: 32
            };
            const perfil = await scoringService.evaluarRiesgoCompleto('gestante-123', datosActuales, []);
            expect(perfil.gestante_id).toBe('gestante-123');
            expect(perfil.nivel_riesgo).toBe('baja');
            expect(perfil.puntuacion_actual).toBeLessThan(30);
            expect(perfil.tendencia_riesgo).toBe('estable');
            expect(perfil.controles_evaluados).toBe(2);
            expect(perfil.alertas_generadas).toBe(1);
        });
        test('debe evaluar riesgo alto para gestante con hipertensión severa', async () => {
            const datosActuales = {
                presion_sistolica: 170,
                presion_diastolica: 110,
                frecuencia_cardiaca: 95,
                temperatura: 36.8,
                movimientos_fetales: true,
                edemas: true,
                semanas_gestacion: 32
            };
            const sintomas = ['dolor_cabeza_severo', 'vision_borrosa'];
            const perfil = await scoringService.evaluarRiesgoCompleto('gestante-123', datosActuales, sintomas);
            expect(perfil.nivel_riesgo).toBe('critica');
            expect(perfil.puntuacion_actual).toBeGreaterThanOrEqual(80);
            expect(perfil.factores_riesgo_activos).toContain('Hipertensión severa');
            expect(perfil.factores_riesgo_activos).toContain('Síntomas neurológicos');
        });
        test('debe detectar tendencia ascendente en el riesgo', async () => {
            // Mock de controles con tendencia ascendente
            const controlesAscendentes = [
                {
                    presion_sistolica: 150, // Más reciente - peor
                    presion_diastolica: 95,
                    frecuencia_cardiaca: 100,
                    fecha_control: new Date('2024-01-15')
                },
                {
                    presion_sistolica: 140, // Intermedio
                    presion_diastolica: 90,
                    frecuencia_cardiaca: 95,
                    fecha_control: new Date('2024-01-08')
                },
                {
                    presion_sistolica: 130, // Más antiguo - mejor
                    presion_diastolica: 85,
                    frecuencia_cardiaca: 90,
                    fecha_control: new Date('2024-01-01')
                }
            ];
            require('../config/database').controlPrenatal.findMany.mockResolvedValue(controlesAscendentes);
            const datosActuales = {
                presion_sistolica: 155,
                presion_diastolica: 98,
                frecuencia_cardiaca: 105
            };
            const perfil = await scoringService.evaluarRiesgoCompleto('gestante-123', datosActuales, []);
            expect(perfil.tendencia_riesgo).toBe('ascendente');
        });
        test('debe aplicar multiplicadores por edad extrema', async () => {
            // Mock de gestante joven (17 años)
            const gestanteJoven = {
                id: 'gestante-joven',
                fecha_nacimiento: new Date('2007-01-01'), // 17 años
                semanas_gestacion: 28
            };
            require('../config/database').gestante.findUnique.mockResolvedValue(gestanteJoven);
            const datosActuales = {
                presion_sistolica: 145,
                presion_diastolica: 90,
                frecuencia_cardiaca: 90
            };
            const perfil = await scoringService.evaluarRiesgoCompleto('gestante-joven', datosActuales, []);
            // La puntuación debe ser mayor debido al multiplicador por edad
            expect(perfil.puntuacion_actual).toBeGreaterThan(50);
            expect(perfil.factores_riesgo_activos.length).toBeGreaterThan(0);
        });
    });
    // ==================== PRUEBAS DE FACTORES ADICIONALES ====================
    describe('Cálculo de Factores Adicionales', () => {
        test('debe detectar múltiples alertas recientes como factor de riesgo', async () => {
            // Mock de múltiples alertas recientes
            const alertasRecientes = [
                { created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) }, // 5 días atrás
                { created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) }, // 10 días atrás
                { created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) }, // 15 días atrás
            ];
            require('../config/database').alerta.findMany.mockResolvedValue(alertasRecientes);
            const datosActuales = {
                presion_sistolica: 130,
                presion_diastolica: 85
            };
            const perfil = await scoringService.evaluarRiesgoCompleto('gestante-123', datosActuales, []);
            expect(perfil.factores_riesgo_activos).toContain('Múltiples alertas recientes');
            expect(perfil.puntuacion_actual).toBeGreaterThan(15); // Puntuación adicional por alertas
        });
        test('debe detectar controles irregulares como factor de riesgo', async () => {
            // Mock de controles con intervalos irregulares (más de 5 semanas)
            const controlesIrregulares = [
                { fecha_control: new Date('2024-01-15') },
                { fecha_control: new Date('2023-11-30') }, // 6+ semanas antes
                { fecha_control: new Date('2023-10-15') }, // 6+ semanas antes
            ];
            require('../config/database').controlPrenatal.findMany.mockResolvedValue(controlesIrregulares);
            const datosActuales = {
                presion_sistolica: 125,
                presion_diastolica: 80
            };
            const perfil = await scoringService.evaluarRiesgoCompleto('gestante-123', datosActuales, []);
            expect(perfil.factores_riesgo_activos).toContain('Controles prenatales irregulares');
        });
        test('debe detectar historial de alertas críticas', async () => {
            const alertasCriticas = [
                { nivel_prioridad: 'critica', created_at: new Date('2024-01-10') },
                { nivel_prioridad: 'critica', created_at: new Date('2024-01-05') },
                { nivel_prioridad: 'alta', created_at: new Date('2024-01-01') }
            ];
            require('../config/database').alerta.findMany.mockResolvedValue(alertasCriticas);
            const datosActuales = {
                presion_sistolica: 130,
                presion_diastolica: 85
            };
            const perfil = await scoringService.evaluarRiesgoCompleto('gestante-123', datosActuales, []);
            expect(perfil.factores_riesgo_activos).toContain('Historial de alertas críticas');
        });
    });
    // ==================== PRUEBAS DE ANÁLISIS DE TENDENCIAS ====================
    describe('Análisis de Tendencias', () => {
        test('debe detectar tendencia descendente', async () => {
            const controlesDescendentes = [
                {
                    presion_sistolica: 125, // Más reciente - mejor
                    presion_diastolica: 80,
                    fecha_control: new Date('2024-01-15')
                },
                {
                    presion_sistolica: 135, // Intermedio
                    presion_diastolica: 85,
                    fecha_control: new Date('2024-01-08')
                },
                {
                    presion_sistolica: 150, // Más antiguo - peor
                    presion_diastolica: 95,
                    fecha_control: new Date('2024-01-01')
                }
            ];
            require('../config/database').controlPrenatal.findMany.mockResolvedValue(controlesDescendentes);
            const datosActuales = {
                presion_sistolica: 120,
                presion_diastolica: 78
            };
            const perfil = await scoringService.evaluarRiesgoCompleto('gestante-123', datosActuales, []);
            expect(perfil.tendencia_riesgo).toBe('descendente');
        });
        test('debe detectar tendencia estable', async () => {
            const controlesEstables = [
                { presion_sistolica: 125, presion_diastolica: 80 },
                { presion_sistolica: 128, presion_diastolica: 82 },
                { presion_sistolica: 123, presion_diastolica: 79 }
            ];
            require('../config/database').controlPrenatal.findMany.mockResolvedValue(controlesEstables);
            const datosActuales = {
                presion_sistolica: 126,
                presion_diastolica: 81
            };
            const perfil = await scoringService.evaluarRiesgoCompleto('gestante-123', datosActuales, []);
            expect(perfil.tendencia_riesgo).toBe('estable');
        });
    });
    // ==================== PRUEBAS DE CASOS LÍMITE ====================
    describe('Casos Límite', () => {
        test('debe manejar gestante sin historial de controles', async () => {
            require('../config/database').controlPrenatal.findMany.mockResolvedValue([]);
            require('../config/database').alerta.findMany.mockResolvedValue([]);
            const datosActuales = {
                presion_sistolica: 140,
                presion_diastolica: 90
            };
            const perfil = await scoringService.evaluarRiesgoCompleto('gestante-123', datosActuales, []);
            expect(perfil.controles_evaluados).toBe(0);
            expect(perfil.alertas_generadas).toBe(0);
            expect(perfil.tendencia_riesgo).toBe('estable');
            expect(perfil.puntuacion_actual).toBeGreaterThan(0);
        });
        test('debe manejar gestante no encontrada', async () => {
            require('../config/database').gestante.findUnique.mockResolvedValue(null);
            const datosActuales = {
                presion_sistolica: 120,
                presion_diastolica: 80
            };
            await expect(scoringService.evaluarRiesgoCompleto('gestante-inexistente', datosActuales, [])).rejects.toThrow('Gestante gestante-inexistente no encontrada');
        });
        test('debe manejar errores de base de datos', async () => {
            require('../config/database').gestante.findUnique.mockRejectedValue(new Error('Database error'));
            const datosActuales = {
                presion_sistolica: 120,
                presion_diastolica: 80
            };
            await expect(scoringService.evaluarRiesgoCompleto('gestante-123', datosActuales, [])).rejects.toThrow('Database error');
        });
    });
    // ==================== PRUEBAS DE INTEGRACIÓN ====================
    describe('Integración Completa', () => {
        test('debe evaluar caso clínico complejo con múltiples factores', async () => {
            // Gestante de 17 años con historial de alertas y controles irregulares
            const gestanteCompleja = {
                id: 'gestante-compleja',
                fecha_nacimiento: new Date('2007-03-15'), // 17 años
                semanas_gestacion: 34
            };
            const controlesIrregulares = [
                {
                    fecha_control: new Date('2024-01-15'),
                    presion_sistolica: 145,
                    presion_diastolica: 92,
                    frecuencia_cardiaca: 95
                },
                {
                    fecha_control: new Date('2023-11-20'), // 8 semanas antes
                    presion_sistolica: 135,
                    presion_diastolica: 88,
                    frecuencia_cardiaca: 90
                }
            ];
            const alertasMultiples = [
                { created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), nivel_prioridad: 'critica' },
                { created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), nivel_prioridad: 'alta' },
                { created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), nivel_prioridad: 'critica' }
            ];
            require('../config/database').gestante.findUnique.mockResolvedValue(gestanteCompleja);
            require('../config/database').controlPrenatal.findMany.mockResolvedValue(controlesIrregulares);
            require('../config/database').alerta.findMany.mockResolvedValue(alertasMultiples);
            const datosActuales = {
                presion_sistolica: 155,
                presion_diastolica: 98,
                frecuencia_cardiaca: 105,
                temperatura: 37.2,
                edemas: true,
                movimientos_fetales: true,
                semanas_gestacion: 34
            };
            const sintomas = ['dolor_cabeza_severo', 'edema_facial'];
            const perfil = await scoringService.evaluarRiesgoCompleto('gestante-compleja', datosActuales, sintomas);
            // Verificaciones del perfil completo
            expect(perfil.nivel_riesgo).toBe('critica');
            expect(perfil.puntuacion_actual).toBeGreaterThanOrEqual(80);
            expect(perfil.tendencia_riesgo).toBe('ascendente');
            // Verificar factores de riesgo múltiples
            expect(perfil.factores_riesgo_activos).toContain('Hipertensión');
            expect(perfil.factores_riesgo_activos).toContain('Múltiples alertas recientes');
            expect(perfil.factores_riesgo_activos).toContain('Controles prenatales irregulares');
            expect(perfil.factores_riesgo_activos).toContain('Historial de alertas críticas');
            expect(perfil.factores_riesgo_activos).toContain('Síntomas neurológicos');
            // Verificar que se aplicaron multiplicadores
            expect(perfil.puntuacion_actual).toBeGreaterThan(70); // Puntuación alta por múltiples factores
        });
    });
});
