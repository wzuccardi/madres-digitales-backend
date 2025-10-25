import { log } from '../config/logger';

export interface VitalSignsEvaluation {
  alertDetected: boolean;
  alertType?: string;
  priority?: string;
  message?: string;
  riskScore?: number;
}

export interface SymptomsEvaluation {
  alertDetected: boolean;
  alertType?: string;
  priority?: string;
  message?: string;
  riskScore?: number;
}

export class AlertRulesEngine {
  constructor() {
    console.log('🧠 AlertRulesEngine initialized');
  }

  /**
   * Evalúa signos vitales y determina si se debe generar una alerta
   */
  evaluateVitalSigns(data: any, sintomas?: string[]): VitalSignsEvaluation[] {
    try {
      console.log('🔍 AlertRulesEngine: Evaluating vital signs');

      let alertDetected = false;
      let alertType = '';
      let priority = 'baja';
      let message = '';
      let riskScore = 0;

      // Evaluar presión arterial
      if (data.presion_sistolica && data.presion_diastolica) {
        const sistolica = Number(data.presion_sistolica);
        const diastolica = Number(data.presion_diastolica);

        if (sistolica >= 160 || diastolica >= 110) {
          alertDetected = true;
          alertType = 'hipertension_severa';
          priority = 'critica';
          message = `Hipertensión severa detectada: ${sistolica}/${diastolica} mmHg`;
          riskScore = 90;
        } else if (sistolica >= 140 || diastolica >= 90) {
          alertDetected = true;
          alertType = 'hipertension';
          priority = 'alta';
          message = `Hipertensión detectada: ${sistolica}/${diastolica} mmHg`;
          riskScore = 70;
        } else if (sistolica < 90 || diastolica < 60) {
          alertDetected = true;
          alertType = 'hipotension';
          priority = 'media';
          message = `Hipotensión detectada: ${sistolica}/${diastolica} mmHg`;
          riskScore = 50;
        }
      }

      // Evaluar frecuencia cardíaca
      if (data.frecuencia_cardiaca) {
        const fc = Number(data.frecuencia_cardiaca);

        if (fc >= 120) {
          alertDetected = true;
          alertType = alertType || 'taquicardia_severa';
          priority = priority === 'critica' ? 'critica' : 'alta';
          message = message || `Taquicardia severa: ${fc} lpm`;
          riskScore = Math.max(riskScore, 75);
        } else if (fc < 50) {
          alertDetected = true;
          alertType = alertType || 'bradicardia';
          priority = priority === 'critica' ? 'critica' : 'media';
          message = message || `Bradicardia: ${fc} lpm`;
          riskScore = Math.max(riskScore, 60);
        }
      }

      // Evaluar temperatura
      if (data.temperatura) {
        const temp = Number(data.temperatura);

        if (temp >= 39.0) {
          alertDetected = true;
          alertType = alertType || 'fiebre_alta';
          priority = priority === 'critica' ? 'critica' : 'alta';
          message = message || `Fiebre alta: ${temp}°C`;
          riskScore = Math.max(riskScore, 70);
        } else if (temp >= 38.0) {
          alertDetected = true;
          alertType = alertType || 'fiebre';
          priority = priority === 'critica' || priority === 'alta' ? priority : 'media';
          message = message || `Fiebre: ${temp}°C`;
          riskScore = Math.max(riskScore, 50);
        }
      }

      // Evaluar peso (ganancia excesiva)
      if (data.peso && data.peso_anterior && data.semanas_gestacion) {
        const pesoActual = Number(data.peso);
        const pesoAnterior = Number(data.peso_anterior);
        const semanas = Number(data.semanas_gestacion);
        const ganancia = pesoActual - pesoAnterior;

        if (ganancia > 2.0 && semanas > 20) {
          alertDetected = true;
          alertType = alertType || 'ganancia_peso_excesiva';
          priority = priority === 'critica' ? 'critica' : 'alta';
          message = message || `Ganancia de peso excesiva: +${ganancia.toFixed(1)} kg`;
          riskScore = Math.max(riskScore, 65);
        }
      }

      console.log(`🔍 AlertRulesEngine: Vital signs evaluation completed. Alert: ${alertDetected}`);

      const vitalSignsResult = {
        alertDetected,
        alertType: alertDetected ? alertType : undefined,
        priority: alertDetected ? priority : undefined,
        message: alertDetected ? message : undefined,
        riskScore: alertDetected ? riskScore : undefined,
        shouldTrigger: alertDetected,
        filter: (fn: any) => [vitalSignsResult].filter(fn)
      };

      // Si hay síntomas, evaluarlos también
      const results = [vitalSignsResult];

      if (sintomas && sintomas.length > 0) {
        const symptomsResult = this.evaluateCriticalSymptoms(sintomas);
        results.push({
          ...symptomsResult,
          shouldTrigger: symptomsResult.alertDetected,
          filter: (fn: any) => [symptomsResult].filter(fn)
        } as any);
      }

      return results;

    } catch (error) {
      console.error('❌ AlertRulesEngine: Error evaluating vital signs:', error);
      log.error('Error evaluando signos vitales', { error: error.message, data });
      return [{
        alertDetected: false,
        shouldTrigger: false,
        filter: (fn: any) => []
      } as any];
    }
  }

  /**
   * Evalúa síntomas críticos
   */
  evaluateCriticalSymptoms(sintomas: string[]): SymptomsEvaluation {
    try {
      console.log('🔍 AlertRulesEngine: Evaluating critical symptoms');

      let alertDetected = false;
      let alertType = '';
      let priority = 'baja';
      let message = '';
      let riskScore = 0;

      // Síntomas críticos que requieren atención inmediata
      const sintomasCriticos = {
        'hemorragia': { priority: 'critica', score: 95, type: 'hemorragia' },
        'sangrado_vaginal': { priority: 'critica', score: 90, type: 'hemorragia' },
        'dolor_cabeza_severo': { priority: 'alta', score: 80, type: 'preeclampsia' },
        'vision_borrosa': { priority: 'alta', score: 75, type: 'preeclampsia' },
        'dolor_epigastrico': { priority: 'alta', score: 70, type: 'preeclampsia' },
        'contracciones_frecuentes': { priority: 'alta', score: 85, type: 'parto_prematuro' },
        'ausencia_movimientos_fetales': { priority: 'critica', score: 95, type: 'sufrimiento_fetal' },
        'fiebre_alta': { priority: 'alta', score: 75, type: 'sepsis' },
        'escalofrios': { priority: 'media', score: 60, type: 'infeccion' },
        'nauseas_vomitos_severos': { priority: 'media', score: 55, type: 'hiperemesis' }
      };

      for (const sintoma of sintomas) {
        const sintomaKey = sintoma.toLowerCase().replace(/\s+/g, '_');

        if (sintomasCriticos[sintomaKey]) {
          const config = sintomasCriticos[sintomaKey];
          alertDetected = true;

          // Usar la prioridad más alta encontrada
          if (config.priority === 'critica' ||
            (config.priority === 'alta' && priority !== 'critica') ||
            (config.priority === 'media' && priority === 'baja')) {
            priority = config.priority;
            alertType = config.type;
            riskScore = Math.max(riskScore, config.score);
          }
        }
      }

      if (alertDetected) {
        message = `Síntomas críticos detectados: ${sintomas.join(', ')}`;

        // Evaluar combinaciones peligrosas
        if (sintomas.some(s => s.includes('dolor_cabeza')) &&
          sintomas.some(s => s.includes('vision_borrosa'))) {
          priority = 'critica';
          alertType = 'preeclampsia_severa';
          message = 'Posible preeclampsia severa: cefalea + visión borrosa';
          riskScore = 95;
        }

        if (sintomas.some(s => s.includes('fiebre')) &&
          sintomas.some(s => s.includes('escalofrios'))) {
          priority = 'alta';
          alertType = 'sepsis_materna';
          message = 'Posible sepsis materna: fiebre + escalofríos';
          riskScore = Math.max(riskScore, 85);
        }
      }

      console.log(`🔍 AlertRulesEngine: Symptoms evaluation completed. Alert: ${alertDetected}`);

      return {
        alertDetected,
        alertType: alertDetected ? alertType : undefined,
        priority: alertDetected ? priority : undefined,
        message: alertDetected ? message : undefined,
        riskScore: alertDetected ? riskScore : undefined
      };

    } catch (error) {
      console.error('❌ AlertRulesEngine: Error evaluating symptoms:', error);
      log.error('Error evaluando síntomas', { error: error.message, sintomas });
      return { alertDetected: false };
    }
  }

  /**
   * Evalúa movimientos fetales
   */
  evaluateFetalMovement(data: any): VitalSignsEvaluation {
    try {
      if (data.movimientos_fetales === false || data.movimientos_fetales === 'no') {
        return {
          alertDetected: true,
          alertType: 'ausencia_movimientos_fetales',
          priority: 'critica',
          message: 'Ausencia de movimientos fetales reportada',
          riskScore: 95
        };
      }

      return { alertDetected: false };
    } catch (error) {
      console.error('❌ AlertRulesEngine: Error evaluating fetal movement:', error);
      return { alertDetected: false };
    }
  }

  /**
   * Evalúa signos de sepsis
   */
  evaluateSepsis(data: any): VitalSignsEvaluation {
    try {
      const temp = data.temperatura ? Number(data.temperatura) : null;
      const fc = data.frecuencia_cardiaca ? Number(data.frecuencia_cardiaca) : null;
      const fr = data.frecuencia_respiratoria ? Number(data.frecuencia_respiratoria) : null;

      let criteriosSepsis = 0;

      if (temp && (temp >= 38.0 || temp <= 36.0)) criteriosSepsis++;
      if (fc && fc >= 90) criteriosSepsis++;
      if (fr && fr >= 20) criteriosSepsis++;

      if (criteriosSepsis >= 2) {
        return {
          alertDetected: true,
          alertType: 'sepsis_materna',
          priority: 'critica',
          message: `Posible sepsis materna: ${criteriosSepsis} criterios cumplidos`,
          riskScore: 90
        };
      }

      return { alertDetected: false };
    } catch (error) {
      console.error('❌ AlertRulesEngine: Error evaluating sepsis:', error);
      return { alertDetected: false };
    }
  }

  /**
   * Obtiene la prioridad máxima de los resultados de evaluación
   */
  getMaxPriority(results: VitalSignsEvaluation[]): string {
    const priorities = ['critica', 'alta', 'media', 'baja'];

    for (const priority of priorities) {
      if (results.some(r => r.priority === priority)) {
        return priority;
      }
    }

    return 'baja';
  }

  /**
   * Obtiene el score máximo de los resultados de evaluación
   */
  getMaxScore(results: VitalSignsEvaluation[]): number {
    return Math.max(...results.map(r => r.riskScore || 0));
  }
}