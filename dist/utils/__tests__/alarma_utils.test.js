"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Tests para el sistema de evaluación de alertas automáticas
const alarma_utils_1 = require("../alarma_utils");
describe('Sistema de Alertas Automáticas', () => {
    describe('evaluarSignosAlarma', () => {
        it('debe detectar emergencia por ausencia de movimientos fetales', () => {
            const control = {
                presion_sistolica: 120,
                presion_diastolica: 80,
                semanas_gestacion: 30
            };
            const sintomas = ['ausencia_movimiento_fetal_confirmada'];
            const resultado = (0, alarma_utils_1.evaluarSignosAlarma)(control, sintomas);
            expect(resultado.tipo).toBe('emergencia_obstetrica');
            expect(resultado.nivelPrioridad).toBe('critica');
            expect(resultado.mensaje).toContain('Ausencia de movimientos fetales');
            expect(resultado.puntuacion).toBeGreaterThanOrEqual(90);
        });
        it('debe detectar sepsis materna con fiebre y signos vitales alterados', () => {
            const control = {
                presion_sistolica: 110,
                presion_diastolica: 70,
                frecuencia_cardiaca: 125, // Taquicardia
                temperatura: 38.5, // Fiebre
                semanas_gestacion: 28
            };
            const sintomas = ['escalofrios', 'malestar_general_severo'];
            const resultado = (0, alarma_utils_1.evaluarSignosAlarma)(control, sintomas);
            expect(resultado.tipo).toBe('emergencia_obstetrica');
            expect(resultado.nivelPrioridad).toBe('critica');
            expect(resultado.mensaje).toContain('SEPSIS');
            expect(resultado.recomendaciones).toContain('Antibioticoterapia inmediata');
        });
        it('debe detectar hemorragia obstétrica con compromiso hemodinámico', () => {
            const control = {
                presion_sistolica: 85, // Hipotensión
                presion_diastolica: 55,
                frecuencia_cardiaca: 115, // Taquicardia
                semanas_gestacion: 35
            };
            const sintomas = ['sangrado_vaginal_abundante', 'sangrado_vaginal_con_coagulos'];
            const resultado = (0, alarma_utils_1.evaluarSignosAlarma)(control, sintomas);
            expect(resultado.tipo).toBe('emergencia_obstetrica');
            expect(resultado.nivelPrioridad).toBe('critica');
            expect(resultado.mensaje).toContain('HEMORRAGIA');
            expect(resultado.mensaje).toContain('compromiso hemodinámico');
        });
        it('debe detectar preeclampsia severa', () => {
            const control = {
                presion_sistolica: 165, // Hipertensión severa
                presion_diastolica: 115,
                semanas_gestacion: 32
            };
            const sintomas = ['dolor_cabeza_severo', 'vision_borrosa', 'edema_facial'];
            const resultado = (0, alarma_utils_1.evaluarSignosAlarma)(control, sintomas);
            expect(resultado.tipo).toBe('emergencia_obstetrica');
            expect(resultado.nivelPrioridad).toBe('critica');
            expect(resultado.mensaje).toContain('PREECLAMPSIA SEVERA');
            expect(resultado.recomendaciones).toContain('Hospitalización inmediata');
        });
        it('debe detectar trabajo de parto muy prematuro', () => {
            const control = {
                presion_sistolica: 120,
                presion_diastolica: 80,
                semanas_gestacion: 30 // < 32 semanas
            };
            const sintomas = ['contracciones_regulares', 'ruptura_membranas'];
            const resultado = (0, alarma_utils_1.evaluarSignosAlarma)(control, sintomas);
            expect(resultado.tipo).toBe('emergencia_obstetrica');
            expect(resultado.nivelPrioridad).toBe('critica');
            expect(resultado.mensaje).toContain('MUY PREMATURO');
            expect(resultado.recomendaciones).toContain('Corticoides');
        });
        it('debe detectar hipertensión sin síntomas adicionales', () => {
            const control = {
                presion_sistolica: 145,
                presion_diastolica: 95,
                semanas_gestacion: 28
            };
            const resultado = (0, alarma_utils_1.evaluarSignosAlarma)(control);
            expect(resultado.tipo).toBe('riesgo_alto');
            expect(resultado.nivelPrioridad).toBe('alta');
            expect(resultado.mensaje).toContain('HIPERTENSIÓN');
        });
        it('debe detectar taquicardia severa', () => {
            const control = {
                presion_sistolica: 120,
                presion_diastolica: 80,
                frecuencia_cardiaca: 135, // Taquicardia severa
                semanas_gestacion: 30
            };
            const resultado = (0, alarma_utils_1.evaluarSignosAlarma)(control);
            expect(resultado.tipo).toBe('riesgo_alto');
            expect(resultado.nivelPrioridad).toBe('alta');
            expect(resultado.mensaje).toContain('Taquicardia');
        });
        it('debe detectar fiebre alta sin otros síntomas', () => {
            const control = {
                presion_sistolica: 120,
                presion_diastolica: 80,
                temperatura: 39.2, // Fiebre alta
                semanas_gestacion: 25
            };
            const resultado = (0, alarma_utils_1.evaluarSignosAlarma)(control);
            expect(resultado.tipo).toBe('riesgo_alto');
            expect(resultado.nivelPrioridad).toBe('alta');
            expect(resultado.mensaje).toContain('Fiebre');
        });
        it('debe detectar edemas con hipertensión', () => {
            const control = {
                presion_sistolica: 148,
                presion_diastolica: 92,
                edemas: true,
                semanas_gestacion: 34
            };
            const resultado = (0, alarma_utils_1.evaluarSignosAlarma)(control);
            expect(resultado.tipo).toBe('riesgo_alto');
            expect(resultado.nivelPrioridad).toBe('alta');
            expect(resultado.mensaje).toContain('Hipertensión');
        });
        it('no debe generar alerta con valores normales', () => {
            const control = {
                presion_sistolica: 120,
                presion_diastolica: 80,
                frecuencia_cardiaca: 80,
                temperatura: 36.8,
                semanas_gestacion: 30,
                movimientos_fetales: true,
                edemas: false
            };
            const resultado = (0, alarma_utils_1.evaluarSignosAlarma)(control);
            expect(resultado.tipo).toBeNull();
            expect(resultado.nivelPrioridad).toBeNull();
            expect(resultado.mensaje).toBeNull();
        });
        it('debe manejar datos parciales sin errores', () => {
            const control = {
                presion_sistolica: 120,
                // Otros campos undefined
            };
            const resultado = (0, alarma_utils_1.evaluarSignosAlarma)(control);
            expect(resultado).toBeDefined();
            expect(resultado.tipo).toBeDefined();
        });
        it('debe incluir síntomas detectados en el resultado', () => {
            const control = {
                presion_sistolica: 165,
                presion_diastolica: 110,
                semanas_gestacion: 32
            };
            const sintomas = ['dolor_cabeza_severo', 'vision_borrosa'];
            const resultado = (0, alarma_utils_1.evaluarSignosAlarma)(control, sintomas);
            expect(resultado.sintomasDetectados).toBeDefined();
            expect(resultado.sintomasDetectados).toContain('dolor_cabeza_severo');
            expect(resultado.sintomasDetectados).toContain('vision_borrosa');
        });
    });
    describe('calcularPuntuacionRiesgo', () => {
        it('debe calcular puntuación alta para múltiples factores de riesgo', () => {
            const control = {
                presion_sistolica: 165,
                presion_diastolica: 110,
                frecuencia_cardiaca: 125,
                temperatura: 38.5,
                semanas_gestacion: 30
            };
            const sintomas = ['dolor_cabeza_severo', 'vision_borrosa'];
            const puntuacion = (0, alarma_utils_1.calcularPuntuacionRiesgo)(control, sintomas);
            expect(puntuacion).toBeGreaterThan(50);
        });
        it('debe calcular puntuación baja para valores normales', () => {
            const control = {
                presion_sistolica: 120,
                presion_diastolica: 80,
                frecuencia_cardiaca: 80,
                temperatura: 36.8,
                semanas_gestacion: 30
            };
            const puntuacion = (0, alarma_utils_1.calcularPuntuacionRiesgo)(control);
            expect(puntuacion).toBeLessThan(20);
        });
        it('debe considerar historial de controles previos', () => {
            const control = {
                presion_sistolica: 145,
                presion_diastolica: 95,
                semanas_gestacion: 30
            };
            const historial = [
                { presion_sistolica: 142, presion_diastolica: 92 },
                { presion_sistolica: 140, presion_diastolica: 90 }
            ];
            const puntuacion = (0, alarma_utils_1.calcularPuntuacionRiesgo)(control, undefined, historial);
            expect(puntuacion).toBeGreaterThan(0);
        });
    });
    describe('generarRecomendaciones', () => {
        it('debe generar recomendaciones para hipertensión severa', () => {
            const control = {
                presion_sistolica: 165,
                presion_diastolica: 110,
                semanas_gestacion: 32
            };
            const recomendaciones = (0, alarma_utils_1.generarRecomendaciones)(control, undefined, 80);
            expect(recomendaciones).toBeDefined();
            expect(recomendaciones.length).toBeGreaterThan(0);
            expect(recomendaciones.some(r => r.includes('médico') || r.includes('hospital'))).toBe(true);
        });
        it('debe generar recomendaciones para fiebre', () => {
            const control = {
                temperatura: 38.5,
                semanas_gestacion: 28
            };
            const recomendaciones = (0, alarma_utils_1.generarRecomendaciones)(control, undefined, 60);
            expect(recomendaciones).toBeDefined();
            expect(recomendaciones.some(r => r.toLowerCase().includes('fiebre') || r.toLowerCase().includes('temperatura'))).toBe(true);
        });
        it('debe generar recomendaciones generales para puntuación baja', () => {
            const control = {
                presion_sistolica: 120,
                presion_diastolica: 80,
                semanas_gestacion: 30
            };
            const recomendaciones = (0, alarma_utils_1.generarRecomendaciones)(control, undefined, 10);
            expect(recomendaciones).toBeDefined();
            expect(recomendaciones.length).toBeGreaterThan(0);
        });
    });
});
