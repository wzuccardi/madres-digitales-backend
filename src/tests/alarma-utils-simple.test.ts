// src/tests/alarma-utils-simple.test.ts
// Pruebas unitarias simplificadas para el sistema de evaluación de alertas obstétricas

import { 
  evaluarSignosAlarma, 
  calcularPuntuacionRiesgo, 
  determinarPrioridadPorPuntuacion,
  determinarTipoAlerta,
  generarRecomendaciones,
  DatosControl
} from '../utils/alarma_utils';

describe('Sistema de Evaluación de Alertas Obstétricas - Pruebas Básicas', () => {

  // ==================== PRUEBAS DE EMERGENCIAS CRÍTICAS ====================

  describe('Emergencias Obstétricas Críticas', () => {
    
    test('debe detectar ausencia de movimientos fetales como emergencia crítica', () => {
      const datos: DatosControl = {
        semanas_gestacion: 32,
        presion_sistolica: 120,
        presion_diastolica: 80,
        movimientos_fetales: false
      };
      const sintomas = ['ausencia_movimiento_fetal_confirmada'];

      const resultado = evaluarSignosAlarma(datos, sintomas);

      expect(resultado.tipo).toBe('emergencia_obstetrica');
      expect(resultado.nivelPrioridad).toBe('critica');
      expect(resultado.mensaje).toContain('ALERTA CRÍTICA');
      expect(resultado.puntuacion).toBeGreaterThanOrEqual(95);
    });

    test('debe detectar síntomas de emergencia como críticos', () => {
      const datos: DatosControl = {
        presion_sistolica: 130,
        presion_diastolica: 85
      };
      const sintomas = ['convulsiones', 'perdida_conciencia'];

      const resultado = evaluarSignosAlarma(datos, sintomas);

      expect(resultado.tipo).toBe('emergencia_obstetrica');
      expect(resultado.nivelPrioridad).toBe('critica');
      expect(resultado.puntuacion).toBe(100);
    });

    test('debe detectar hemorragia con compromiso hemodinámico', () => {
      const datos: DatosControl = {
        presion_sistolica: 85, // Hipotensión
        presion_diastolica: 55,
        frecuencia_cardiaca: 115 // Taquicardia compensatoria
      };
      const sintomas = ['sangrado_vaginal_abundante', 'sangrado_vaginal_con_coagulos'];

      const resultado = evaluarSignosAlarma(datos, sintomas);

      expect(resultado.tipo).toBe('emergencia_obstetrica');
      expect(resultado.nivelPrioridad).toBe('critica');
      expect(resultado.mensaje).toContain('HEMORRAGIA OBSTÉTRICA SEVERA');
      expect(resultado.puntuacion).toBeGreaterThanOrEqual(85);
    });
  });

  // ==================== PRUEBAS DE PREECLAMPSIA ====================

  describe('Detección de Preeclampsia', () => {
    
    test('debe detectar preeclampsia severa con síntomas neurológicos', () => {
      const datos: DatosControl = {
        presion_sistolica: 165, // Hipertensión severa
        presion_diastolica: 115,
        semanas_gestacion: 34
      };
      const sintomas = ['dolor_cabeza_severo', 'vision_borrosa', 'dolor_epigastrico'];

      const resultado = evaluarSignosAlarma(datos, sintomas);

      expect(resultado.tipo).toBe('emergencia_obstetrica');
      expect(resultado.nivelPrioridad).toBe('critica');
      expect(resultado.mensaje).toContain('PREECLAMPSIA SEVERA');
      expect(resultado.puntuacion).toBeGreaterThanOrEqual(88);
    });

    test('debe detectar hipertensión severa sin síntomas como riesgo alto', () => {
      const datos: DatosControl = {
        presion_sistolica: 170,
        presion_diastolica: 105,
        semanas_gestacion: 36
      };

      const resultado = evaluarSignosAlarma(datos, []);

      expect(resultado.tipo).toBe('riesgo_alto');
      expect(resultado.nivelPrioridad).toBe('alta');
      expect(resultado.mensaje).toContain('HIPERTENSIÓN SEVERA');
      expect(resultado.puntuacion).toBeGreaterThanOrEqual(80);
    });
  });

  // ==================== PRUEBAS DE TRABAJO DE PARTO PREMATURO ====================

  describe('Trabajo de Parto Prematuro', () => {
    
    test('debe detectar trabajo de parto muy prematuro como emergencia', () => {
      const datos: DatosControl = {
        semanas_gestacion: 30 // Muy prematuro
      };
      const sintomas = ['contracciones_regulares', 'ruptura_membranas'];

      const resultado = evaluarSignosAlarma(datos, sintomas);

      expect(resultado.tipo).toBe('emergencia_obstetrica');
      expect(resultado.nivelPrioridad).toBe('critica');
      expect(resultado.mensaje).toContain('TRABAJO DE PARTO MUY PREMATURO');
      expect(resultado.puntuacion).toBeGreaterThanOrEqual(85);
    });

    test('debe detectar trabajo de parto prematuro como riesgo alto', () => {
      const datos: DatosControl = {
        semanas_gestacion: 35 // Prematuro pero no muy prematuro
      };
      const sintomas = ['contracciones_regulares', 'presion_pelvica'];

      const resultado = evaluarSignosAlarma(datos, sintomas);

      expect(resultado.tipo).toBe('trabajo_parto');
      expect(resultado.nivelPrioridad).toBe('alta');
      expect(resultado.mensaje).toContain('TRABAJO DE PARTO PREMATURO');
      expect(resultado.puntuacion).toBeGreaterThanOrEqual(70);
    });

    test('no debe detectar trabajo de parto a término como emergencia', () => {
      const datos: DatosControl = {
        semanas_gestacion: 39 // A término
      };
      const sintomas = ['contracciones_regulares'];

      const resultado = evaluarSignosAlarma(datos, sintomas);

      // A término, las contracciones son normales
      expect(resultado.tipo).toBeNull();
    });
  });

  // ==================== PRUEBAS DE SIGNOS VITALES ====================

  describe('Alteraciones de Signos Vitales', () => {
    
    test('debe detectar alteraciones severas de signos vitales', () => {
      const datos: DatosControl = {
        frecuencia_cardiaca: 130, // Taquicardia severa
        temperatura: 39.5 // Fiebre alta
      };

      const resultado = evaluarSignosAlarma(datos, [], 39.5, 28);

      expect(resultado.tipo).toBe('riesgo_alto');
      expect(resultado.nivelPrioridad).toBe('alta');
      expect(resultado.mensaje).toContain('ALTERACIÓN SEVERA DE SIGNOS VITALES');
      expect(resultado.puntuacion).toBeGreaterThanOrEqual(65);
    });

    test('debe detectar alteraciones moderadas como prioridad media', () => {
      const datos: DatosControl = {
        presion_sistolica: 145, // Hipertensión leve
        presion_diastolica: 92,
        frecuencia_cardiaca: 105 // Taquicardia leve
      };

      const resultado = evaluarSignosAlarma(datos, []);

      expect(resultado.tipo).toBe('riesgo_alto');
      expect(resultado.nivelPrioridad).toBe('media');
      expect(resultado.puntuacion).toBeGreaterThanOrEqual(50);
    });
  });

  // ==================== PRUEBAS DEL SISTEMA DE PUNTUACIÓN ====================

  describe('Sistema de Puntuación', () => {
    
    test('debe calcular puntuación alta para múltiples factores de riesgo', () => {
      const datos: DatosControl = {
        presion_sistolica: 160,
        presion_diastolica: 100,
        frecuencia_cardiaca: 120,
        temperatura: 38.5,
        movimientos_fetales: false,
        edemas: true
      };
      const sintomas = ['dolor_cabeza_severo', 'vision_borrosa'];

      const puntuacion = calcularPuntuacionRiesgo(datos, sintomas);

      expect(puntuacion).toBeGreaterThanOrEqual(70);
      expect(puntuacion).toBeLessThanOrEqual(100);
    });

    test('debe calcular puntuación baja para signos vitales normales', () => {
      const datos: DatosControl = {
        presion_sistolica: 120,
        presion_diastolica: 80,
        frecuencia_cardiaca: 80,
        temperatura: 36.5,
        movimientos_fetales: true,
        edemas: false
      };

      const puntuacion = calcularPuntuacionRiesgo(datos, []);

      expect(puntuacion).toBeLessThan(30);
    });

    test('debe determinar prioridad correctamente basada en puntuación', () => {
      expect(determinarPrioridadPorPuntuacion(90)).toBe('critica');
      expect(determinarPrioridadPorPuntuacion(70)).toBe('alta');
      expect(determinarPrioridadPorPuntuacion(45)).toBe('media');
      expect(determinarPrioridadPorPuntuacion(20)).toBe('baja');
    });

    test('debe determinar tipo de alerta basado en síntomas', () => {
      expect(determinarTipoAlerta(['convulsiones'])).toBe('emergencia_obstetrica');
      expect(determinarTipoAlerta(['sangrado_vaginal_abundante'])).toBe('emergencia_obstetrica');
      expect(determinarTipoAlerta(['contracciones_regulares'])).toBe('trabajo_parto');
      expect(determinarTipoAlerta(['escalofrios'])).toBe('riesgo_alto');
      expect(determinarTipoAlerta(['dolor_cabeza_severo'])).toBe('riesgo_alto');
    });
  });

  // ==================== PRUEBAS DE RECOMENDACIONES ====================

  describe('Generación de Recomendaciones', () => {
    
    test('debe generar recomendaciones apropiadas para hipertensión', () => {
      const datos: DatosControl = {
        presion_sistolica: 150,
        presion_diastolica: 95
      };

      const recomendaciones = generarRecomendaciones(datos, [], 60);

      expect(recomendaciones).toContain('Control de presión arterial frecuente');
      expect(recomendaciones).toContain('Dieta hiposódica');
      expect(recomendaciones).toContain('Reposo relativo');
    });

    test('debe generar recomendaciones de emergencia para puntuación alta', () => {
      const datos: DatosControl = {
        presion_sistolica: 170,
        presion_diastolica: 110
      };

      const recomendaciones = generarRecomendaciones(datos, [], 85);

      expect(recomendaciones).toContain('Traslado inmediato a centro hospitalario');
      expect(recomendaciones).toContain('Activar protocolo de emergencia');
    });
  });

  // ==================== PRUEBAS DE CASOS LÍMITE ====================

  describe('Casos Límite y Validaciones', () => {
    
    test('debe manejar datos incompletos sin fallar', () => {
      const datos: DatosControl = {
        presion_sistolica: 140
        // Otros campos undefined
      };

      const resultado = evaluarSignosAlarma(datos, []);

      expect(resultado).toBeDefined();
      expect(typeof resultado.puntuacion).toBe('number');
    });

    test('debe manejar síntomas vacíos', () => {
      const datos: DatosControl = {
        presion_sistolica: 120,
        presion_diastolica: 80
      };

      const resultado = evaluarSignosAlarma(datos, []);

      expect(resultado).toBeDefined();
      expect(resultado.sintomasDetectados).toEqual([]);
    });

    test('debe limitar puntuación máxima a 100', () => {
      const datos: DatosControl = {
        presion_sistolica: 200,
        frecuencia_cardiaca: 180,
        temperatura: 41.0,
        movimientos_fetales: false,
        edemas: true
      };
      const sintomas = ['convulsiones', 'sangrado_masivo', 'perdida_conciencia'];

      const puntuacion = calcularPuntuacionRiesgo(datos, sintomas);

      expect(puntuacion).toBeLessThanOrEqual(100);
    });
  });

  // ==================== PRUEBAS DE INTEGRACIÓN ====================

  describe('Pruebas de Integración', () => {
    
    test('debe evaluar caso clínico complejo correctamente', () => {
      // Caso: Gestante de 34 semanas con preeclampsia severa
      const datos: DatosControl = {
        semanas_gestacion: 34,
        presion_sistolica: 170,
        presion_diastolica: 110,
        frecuencia_cardiaca: 95,
        temperatura: 36.8,
        movimientos_fetales: true,
        edemas: true,
        peso: 75.5
      };
      const sintomas = ['dolor_cabeza_severo', 'vision_borrosa', 'dolor_epigastrico', 'edema_facial'];

      const resultado = evaluarSignosAlarma(datos, sintomas);
      const puntuacion = calcularPuntuacionRiesgo(datos, sintomas);
      const recomendaciones = generarRecomendaciones(datos, sintomas, puntuacion);

      // Verificaciones del resultado
      expect(resultado.tipo).toBe('emergencia_obstetrica');
      expect(resultado.nivelPrioridad).toBe('critica');
      expect(resultado.mensaje).toContain('PREECLAMPSIA SEVERA');
      
      // Verificaciones de puntuación
      expect(puntuacion).toBeGreaterThanOrEqual(80);
      
      // Verificaciones de recomendaciones
      expect(recomendaciones).toContain('Hospitalización inmediata');
      expect(recomendaciones).toContain('Sulfato de magnesio');
      expect(recomendaciones).toContain('Evaluación fetal');
    });
  });
});
