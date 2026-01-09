/**
 * Servicio de Evaluación Automática de Alertas
 * 
 * Sistema de semaforización basado en:
 * - Signos vitales (presión arterial, frecuencia cardíaca, temperatura)
 * - Síntomas de alarma obstétrica
 * - Factores de riesgo acumulados
 * 
 * Niveles de prioridad:
 * - CRITICA (Rojo): Requiere atención inmediata, riesgo de vida
 * - ALTA (Naranja): Requiere atención urgente en 24h
 * - MEDIA (Amarillo): Requiere seguimiento cercano
 * - BAJA (Verde): Seguimiento rutinario
 */

class AlertaAutomaticaService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  /**
   * Evalúa un control prenatal y genera alertas automáticas
   * @param {Object} control - Datos del control prenatal
   * @param {string} gestanteId - ID de la gestante
   * @returns {Promise<Array>} - Array de alertas generadas
   */
  async evaluarControl(control, gestanteId) {
    const alertas = [];
    let puntajeRiesgo = 0;
    const factoresRiesgo = [];

    // Obtener información de la gestante
    const gestante = await this.prisma.gestantes.findUnique({
      where: { id: gestanteId },
      select: {
        id: true,
        nombre: true,
        madrina_id: true,
        riesgo_alto: true,
        fecha_ultima_menstruacion: true,
      }
    });

    if (!gestante) {
      throw new Error('Gestante no encontrada');
    }

    // 1. EVALUACIÓN DE PRESIÓN ARTERIAL
    if (control.presion_sistolica && control.presion_diastolica) {
      const sistolica = parseInt(control.presion_sistolica);
      const diastolica = parseInt(control.presion_diastolica);

      // Hipertensión severa (CRITICA)
      if (sistolica >= 160 || diastolica >= 110) {
        puntajeRiesgo += 10;
        factoresRiesgo.push('Hipertensión severa');
        alertas.push({
          tipo_alerta: 'hipertension_severa',
          nivel_prioridad: 'CRITICA',
          mensaje: `⚠️ EMERGENCIA: Presión arterial crítica ${sistolica}/${diastolica} mmHg. Requiere atención médica INMEDIATA.`,
          sintomas: ['hipertension_severa', 'presion_alta'],
          puntaje_riesgo: 10
        });
      }
      // Hipertensión moderada (ALTA)
      else if (sistolica >= 140 || diastolica >= 90) {
        puntajeRiesgo += 7;
        factoresRiesgo.push('Hipertensión moderada');
        alertas.push({
          tipo_alerta: 'hipertension',
          nivel_prioridad: 'ALTA',
          mensaje: `⚠️ URGENTE: Presión arterial elevada ${sistolica}/${diastolica} mmHg. Requiere evaluación médica en 24 horas.`,
          sintomas: ['hipertension_moderada', 'presion_alta'],
          puntaje_riesgo: 7
        });
      }
      // Pre-hipertensión (MEDIA)
      else if (sistolica >= 130 || diastolica >= 85) {
        puntajeRiesgo += 4;
        factoresRiesgo.push('Pre-hipertensión');
        alertas.push({
          tipo_alerta: 'hipertension',
          nivel_prioridad: 'MEDIA',
          mensaje: `⚠️ ATENCIÓN: Presión arterial en límite superior ${sistolica}/${diastolica} mmHg. Requiere seguimiento cercano.`,
          sintomas: ['prehipertension'],
          puntaje_riesgo: 4
        });
      }
      // Hipotensión (MEDIA)
      else if (sistolica < 90 || diastolica < 60) {
        puntajeRiesgo += 5;
        factoresRiesgo.push('Hipotensión');
        alertas.push({
          tipo_alerta: 'hipotension',
          nivel_prioridad: 'MEDIA',
          mensaje: `⚠️ ATENCIÓN: Presión arterial baja ${sistolica}/${diastolica} mmHg. Evaluar síntomas asociados.`,
          sintomas: ['hipotension'],
          puntaje_riesgo: 5
        });
      }
    }

    // 2. EVALUACIÓN DE FRECUENCIA CARDÍACA
    if (control.frecuencia_cardiaca) {
      const fc = parseInt(control.frecuencia_cardiaca);

      // Taquicardia severa (ALTA)
      if (fc > 120) {
        puntajeRiesgo += 6;
        factoresRiesgo.push('Taquicardia severa');
        alertas.push({
          tipo_alerta: 'taquicardia_severa',
          nivel_prioridad: 'ALTA',
          mensaje: `⚠️ URGENTE: Frecuencia cardíaca muy elevada ${fc} lpm. Requiere evaluación médica.`,
          sintomas: ['taquicardia_severa'],
          puntaje_riesgo: 6
        });
      }
      // Taquicardia moderada (MEDIA)
      else if (fc > 100) {
        puntajeRiesgo += 3;
        factoresRiesgo.push('Taquicardia moderada');
        alertas.push({
          tipo_alerta: 'signos_vitales_anormales',
          nivel_prioridad: 'MEDIA',
          mensaje: `⚠️ ATENCIÓN: Frecuencia cardíaca elevada ${fc} lpm. Monitorear evolución.`,
          sintomas: ['taquicardia'],
          puntaje_riesgo: 3
        });
      }
      // Bradicardia (MEDIA)
      else if (fc < 60) {
        puntajeRiesgo += 4;
        factoresRiesgo.push('Bradicardia');
        alertas.push({
          tipo_alerta: 'bradicardia',
          nivel_prioridad: 'MEDIA',
          mensaje: `⚠️ ATENCIÓN: Frecuencia cardíaca baja ${fc} lpm. Evaluar causa.`,
          sintomas: ['bradicardia'],
          puntaje_riesgo: 4
        });
      }
    }

    // 3. EVALUACIÓN DE TEMPERATURA
    if (control.temperatura) {
      const temp = parseFloat(control.temperatura);

      // Fiebre alta (ALTA)
      if (temp >= 38.5) {
        puntajeRiesgo += 7;
        factoresRiesgo.push('Fiebre alta');
        alertas.push({
          tipo_alerta: 'fiebre_alta',
          nivel_prioridad: 'ALTA',
          mensaje: `⚠️ URGENTE: Fiebre alta ${temp}°C. Riesgo de infección. Requiere evaluación médica.`,
          sintomas: ['fiebre_alta'],
          puntaje_riesgo: 7
        });
      }
      // Fiebre moderada (MEDIA)
      else if (temp >= 37.8) {
        puntajeRiesgo += 4;
        factoresRiesgo.push('Fiebre moderada');
        alertas.push({
          tipo_alerta: 'fiebre',
          nivel_prioridad: 'MEDIA',
          mensaje: `⚠️ ATENCIÓN: Temperatura elevada ${temp}°C. Monitorear evolución.`,
          sintomas: ['fiebre'],
          puntaje_riesgo: 4
        });
      }
      // Hipotermia (MEDIA)
      else if (temp < 36.0) {
        puntajeRiesgo += 5;
        factoresRiesgo.push('Hipotermia');
        alertas.push({
          tipo_alerta: 'signos_vitales_anormales',
          nivel_prioridad: 'MEDIA',
          mensaje: `⚠️ ATENCIÓN: Temperatura baja ${temp}°C. Evaluar causa.`,
          sintomas: ['hipotermia'],
          puntaje_riesgo: 5
        });
      }
    }

    // 4. EVALUACIÓN DE EDEMAS
    if (control.edemas === true || control.edemas === 'presentes') {
      puntajeRiesgo += 5;
      factoresRiesgo.push('Edemas presentes');
      alertas.push({
        tipo_alerta: 'preeclampsia',
        nivel_prioridad: 'MEDIA',
        mensaje: `⚠️ ATENCIÓN: Presencia de edemas. Evaluar preeclampsia.`,
        sintomas: ['edemas'],
        puntaje_riesgo: 5
      });
    }

    // 5. EVALUACIÓN DE MOVIMIENTOS FETALES
    if (control.movimientos_fetales === false || control.movimientos_fetales === 'ausentes') {
      if (control.semanas_gestacion && control.semanas_gestacion >= 20) {
        puntajeRiesgo += 9;
        factoresRiesgo.push('Ausencia de movimientos fetales');
        alertas.push({
          tipo_alerta: 'ausencia_movimientos_fetales',
          nivel_prioridad: 'CRITICA',
          mensaje: `⚠️ EMERGENCIA: Ausencia de movimientos fetales. Requiere evaluación INMEDIATA.`,
          sintomas: ['ausencia_movimientos_fetales'],
          puntaje_riesgo: 9
        });
      }
    }

    // 6. EVALUACIÓN DE SÍNTOMAS DE ALARMA
    if (control.sintomas && Array.isArray(control.sintomas)) {
      const sintomasCriticos = [
        'sangrado_vaginal',
        'dolor_abdominal_severo',
        'ruptura_membranas',
        'contracciones_regulares'
      ];

      const sintomasAltos = [
        'cefalea_severa',
        'vision_borrosa',
        'dolor_epigastrico'
      ];

      control.sintomas.forEach(sintoma => {
        if (sintomasCriticos.includes(sintoma)) {
          puntajeRiesgo += 10;
          factoresRiesgo.push(this._getNombreSintoma(sintoma));
          alertas.push({
            tipo_alerta: 'EMERGENCIA',
            nivel_prioridad: 'CRITICA',
            mensaje: `⚠️ EMERGENCIA: ${this._getNombreSintoma(sintoma)}. Requiere atención INMEDIATA.`,
            sintomas: [sintoma],
            puntaje_riesgo: 10
          });
        } else if (sintomasAltos.includes(sintoma)) {
          puntajeRiesgo += 7;
          factoresRiesgo.push(this._getNombreSintoma(sintoma));
          alertas.push({
            tipo_alerta: 'SINTOMAS_PREOCUPANTES',
            nivel_prioridad: 'ALTA',
            mensaje: `⚠️ URGENTE: ${this._getNombreSintoma(sintoma)}. Requiere evaluación médica en 24 horas.`,
            sintomas: [sintoma],
            puntaje_riesgo: 7
          });
        }
      });
    }

    // 7. EVALUACIÓN COMBINADA - Si hay múltiples factores de riesgo
    if (alertas.length >= 3) {
      // Si hay 3 o más alertas, escalar la prioridad
      const alertaCombinada = {
        tipo_alerta: 'EMERGENCIA',
        nivel_prioridad: 'CRITICA',
        mensaje: `⚠️ EMERGENCIA: Múltiples factores de riesgo detectados (${alertas.length}). Requiere evaluación médica INMEDIATA.`,
        sintomas: ['multiples_factores_riesgo'],
        puntaje_riesgo: puntajeRiesgo
      };
      alertas.unshift(alertaCombinada); // Agregar al inicio
    }

    // 8. GUARDAR ALERTAS EN LA BASE DE DATOS
    const alertasCreadas = [];
    for (const alerta of alertas) {
      try {
        const alertaCreada = await this.prisma.alertas.create({
          data: {
            id: `alerta_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            gestante_id: gestanteId,
            tipo_alerta: alerta.tipo_alerta.toUpperCase(),
            nivel_prioridad: alerta.nivel_prioridad.toUpperCase(),
            mensaje: alerta.mensaje,
            sintomas: alerta.sintomas,
            generado_por_id: gestante.madrina_id,
            es_automatica: true,
            estado: 'pendiente',
            puntaje_riesgo: alerta.puntaje_riesgo
          }
        });
        alertasCreadas.push(alertaCreada);
      } catch (error) {
        console.error('Error creando alerta:', error);
      }
    }

    // 9. ACTUALIZAR ESTADO DE RIESGO DE LA GESTANTE
    if (puntajeRiesgo >= 10) {
      await this.prisma.gestantes.update({
        where: { id: gestanteId },
        data: {
          riesgo_alto: true
        }
      });
    }

    return {
      alertas: alertasCreadas,
      puntajeRiesgo,
      factoresRiesgo,
      resumen: this._generarResumen(alertasCreadas, puntajeRiesgo)
    };
  }

  /**
   * Obtiene el nombre legible de un síntoma
   */
  _getNombreSintoma(sintoma) {
    const nombres = {
      'sangrado_vaginal': 'Sangrado vaginal',
      'dolor_abdominal_severo': 'Dolor abdominal severo',
      'cefalea_severa': 'Cefalea severa',
      'vision_borrosa': 'Visión borrosa',
      'dolor_epigastrico': 'Dolor epigástrico',
      'contracciones_regulares': 'Contracciones regulares',
      'ruptura_membranas': 'Ruptura de membranas',
      'ausencia_movimiento_fetal': 'Ausencia de movimientos fetales'
    };
    return nombres[sintoma] || sintoma;
  }

  /**
   * Genera un resumen del estado de la gestante
   */
  _generarResumen(alertas, puntajeRiesgo) {
    if (puntajeRiesgo >= 10) {
      return {
        nivel: 'CRITICO',
        color: 'rojo',
        accion: 'Requiere atención médica INMEDIATA',
        alertas: alertas.length
      };
    } else if (puntajeRiesgo >= 7) {
      return {
        nivel: 'ALTO',
        color: 'naranja',
        accion: 'Requiere evaluación médica en 24 horas',
        alertas: alertas.length
      };
    } else if (puntajeRiesgo >= 4) {
      return {
        nivel: 'MEDIO',
        color: 'amarillo',
        accion: 'Requiere seguimiento cercano',
        alertas: alertas.length
      };
    } else {
      return {
        nivel: 'BAJO',
        color: 'verde',
        accion: 'Seguimiento rutinario',
        alertas: alertas.length
      };
    }
  }

  /**
   * Obtiene el color de semaforización según el nivel de prioridad
   */
  static getColorSemaforo(nivelPrioridad) {
    const colores = {
      'CRITICA': { hex: '#F44336', nombre: 'Rojo' },
      'ALTA': { hex: '#FF9800', nombre: 'Naranja' },
      'MEDIA': { hex: '#FFC107', nombre: 'Amarillo' },
      'BAJA': { hex: '#4CAF50', nombre: 'Verde' }
    };
    return colores[nivelPrioridad?.toUpperCase()] || colores['BAJA'];
  }
}

module.exports = AlertaAutomaticaService;
