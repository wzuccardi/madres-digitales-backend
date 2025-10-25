import { PrismaClient } from '@prisma/client';
import { AlertRulesEngine } from './alert-rules-engine.service';
import { log } from '../config/logger';

export class AutoAlertService {
  private prisma: PrismaClient;
  private alertRulesEngine: AlertRulesEngine;

  constructor(prisma: PrismaClient, alertRulesEngine: AlertRulesEngine) {
    this.prisma = prisma;
    this.alertRulesEngine = alertRulesEngine;
    console.log('🤖 AutoAlertService initialized');
  }

  /**
   * Evalúa signos vitales y crea alertas automáticas si es necesario
   */
  async evaluateAndCreateAlert(controlData: any, sintomas: string[] = []): Promise<any[]> {
    try {
      console.log('🔍 AutoAlertService: Evaluating control data for automatic alerts');
      
      const alertasGeneradas: any[] = [];

      // Evaluar signos vitales usando el AlertRulesEngine
      const evaluacionSignos = this.alertRulesEngine.evaluateVitalSigns(controlData, sintomas);
      
      // Procesar cada evaluación que requiera alerta
      for (const evaluacion of evaluacionSignos) {
        if (evaluacion.alertDetected) {
          const alertaData = {
            gestante_id: controlData.gestante_id,
            tipo_alerta: evaluacion.alertType || 'signos_vitales_anormales',
            nivel_prioridad: evaluacion.priority || 'media',
            mensaje: evaluacion.message || 'Signos vitales fuera de rango normal',
            sintomas: sintomas,
            es_automatica: true,
            score_riesgo: evaluacion.riskScore || 50,
          estado: 'pendiente',
          resuelta: false,
          fecha_creacion: new Date(),
          fecha_actualizacion: new Date()
        };

        // Crear la alerta en la base de datos
        const nuevaAlerta = await this.prisma.alerta.create({
          data: alertaData,
          include: {
            gestante: {
              select: {
                id: true,
                nombre: true,
                municipio: {
                  select: { id: true, nombre: true }
                }
              }
            }
          }
        });

          alertasGeneradas.push(nuevaAlerta);
          
          console.log(`✅ AutoAlertService: Alerta automática creada con ID ${nuevaAlerta.id}`);
          log.info('Alerta automática creada', { 
            alertaId: nuevaAlerta.id, 
            gestanteId: controlData.gestante_id,
            tipo: alertaData.tipo_alerta,
            prioridad: alertaData.nivel_prioridad
          });
        }
      }

      // Evaluar síntomas críticos si se proporcionaron
      if (sintomas.length > 0) {
        const evaluacionSintomas = this.alertRulesEngine.evaluateCriticalSymptoms(sintomas);
        
        if (evaluacionSintomas.alertDetected) {
          const alertaSintomas = {
            gestante_id: controlData.gestante_id,
            tipo_alerta: evaluacionSintomas.alertType || 'sintomas_criticos',
            nivel_prioridad: evaluacionSintomas.priority || 'alta',
            mensaje: evaluacionSintomas.message || 'Síntomas críticos detectados',
            sintomas: sintomas,
            es_automatica: true,
            score_riesgo: evaluacionSintomas.riskScore || 75,
            estado: 'pendiente',
            resuelta: false,
            fecha_creacion: new Date(),
            fecha_actualizacion: new Date()
          };

          const alertaSintomasCreada = await this.prisma.alerta.create({
            data: alertaSintomas,
            include: {
              gestante: {
                select: {
                  id: true,
                  nombre: true,
                  municipio: {
                    select: { id: true, nombre: true }
                  }
                }
              }
            }
          });

          alertasGeneradas.push(alertaSintomasCreada);
          
          console.log(`✅ AutoAlertService: Alerta de síntomas creada con ID ${alertaSintomasCreada.id}`);
        }
      }

      console.log(`✅ AutoAlertService: Evaluación completada. ${alertasGeneradas.length} alertas generadas`);
      return alertasGeneradas;

    } catch (error) {
      console.error('❌ AutoAlertService: Error evaluating and creating alerts:', error);
      log.error('Error en evaluación automática de alertas', { error: error.message, controlData });
      throw error;
    }
  }

  /**
   * Evalúa patrones de riesgo basados en historial de controles
   */
  async evaluateRiskPatterns(gestanteId: string): Promise<any[]> {
    try {
      console.log(`📊 AutoAlertService: Evaluating risk patterns for gestante ${gestanteId}`);
      
      // Obtener últimos controles de la gestante
      const controles = await this.prisma.control.findMany({
        where: { gestante_id: gestanteId },
        orderBy: { fecha_control: 'desc' },
        take: 5
      });

      if (controles.length < 2) {
        console.log('📊 AutoAlertService: Insufficient data for pattern analysis');
        return [];
      }

      const alertasPatrones: any[] = [];

      // Evaluar tendencia de presión arterial
      const tendenciaPresion = this.evaluarTendenciaPresion(controles);
      if (tendenciaPresion.alertDetected) {
        const alertaTendencia = {
          gestante_id: gestanteId,
          tipo_alerta: 'tendencia_hipertension',
          nivel_prioridad: 'alta',
          mensaje: tendenciaPresion.message,
          sintomas: [],
          es_automatica: true,
          score_riesgo: 80,
          estado: 'pendiente',
          resuelta: false,
          fecha_creacion: new Date(),
          fecha_actualizacion: new Date()
        };

        const alertaCreada = await this.prisma.alerta.create({
          data: alertaTendencia
        });

        alertasPatrones.push(alertaCreada);
      }

      console.log(`✅ AutoAlertService: Pattern evaluation completed. ${alertasPatrones.length} pattern alerts generated`);
      return alertasPatrones;

    } catch (error) {
      console.error('❌ AutoAlertService: Error evaluating risk patterns:', error);
      log.error('Error evaluando patrones de riesgo', { error: error.message, gestanteId });
      return [];
    }
  }

  /**
   * Procesa signos vitales y genera alertas automáticas
   */
  async processVitalSigns(gestanteId: string, vitalSigns: any, sintomas: string[] = []): Promise<void> {
    try {
      console.log(`🔍 AutoAlertService: Processing vital signs for gestante ${gestanteId}`);
      
      const controlData = {
        gestante_id: gestanteId,
        ...vitalSigns
      };

      await this.evaluateAndCreateAlert(controlData, sintomas);
      
      console.log(`✅ AutoAlertService: Vital signs processed for gestante ${gestanteId}`);
    } catch (error) {
      console.error('❌ AutoAlertService: Error processing vital signs:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de alertas automáticas
   */
  async getAutoAlertStats(fechaInicio?: Date, fechaFin?: Date): Promise<any> {
    try {
      console.log('📊 AutoAlertService: Getting auto alert statistics');
      
      const whereClause: any = {
        es_automatica: true
      };

      if (fechaInicio && fechaFin) {
        whereClause.fecha_creacion = {
          gte: fechaInicio,
          lte: fechaFin
        };
      }

      const totalAlertas = await this.prisma.alerta.count({
        where: whereClause
      });

      const alertasPorPrioridad = await this.prisma.alerta.groupBy({
        by: ['nivel_prioridad'],
        where: whereClause,
        _count: {
          id: true
        }
      });

      const alertasPorTipo = await this.prisma.alerta.groupBy({
        by: ['tipo_alerta'],
        where: whereClause,
        _count: {
          id: true
        }
      });

      const stats = {
        total_alertas: totalAlertas,
        por_prioridad: alertasPorPrioridad.reduce((acc, item) => {
          acc[item.nivel_prioridad] = item._count.id;
          return acc;
        }, {} as any),
        por_tipo: alertasPorTipo.reduce((acc, item) => {
          acc[item.tipo_alerta] = item._count.id;
          return acc;
        }, {} as any)
      };

      console.log('✅ AutoAlertService: Statistics generated');
      return stats;
    } catch (error) {
      console.error('❌ AutoAlertService: Error getting statistics:', error);
      throw error;
    }
  }

  private evaluarTendenciaPresion(controles: any[]): { alertDetected: boolean; message: string } {
    const controlesConPresion = controles.filter(c => 
      c.presion_sistolica && c.presion_diastolica
    );

    if (controlesConPresion.length < 3) {
      return { alertDetected: false, message: '' };
    }

    // Verificar tendencia ascendente
    let aumentosSistolica = 0;
    for (let i = 1; i < controlesConPresion.length; i++) {
      if (controlesConPresion[i].presion_sistolica > controlesConPresion[i - 1].presion_sistolica) {
        aumentosSistolica++;
      }
    }

    if (aumentosSistolica >= controlesConPresion.length - 1) {
      return {
        alertDetected: true,
        message: 'Tendencia ascendente sostenida en presión arterial - Riesgo de preeclampsia'
      };
    }

    return { alertDetected: false, message: '' };
  }
}