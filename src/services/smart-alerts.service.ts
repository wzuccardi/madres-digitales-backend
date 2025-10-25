import { PrismaClient } from '@prisma/client';
import { AlertaTipo, PrioridadNivel } from '../types/prisma-enums';

const prisma = new PrismaClient();

export class SmartAlertsService {
  /**
   * Evaluar y generar alertas automáticas para una gestante
   */
  async evaluateGestanteAlerts(gestanteId: string): Promise<number> {
    try {
      console.log('🚨 SmartAlertsService: Evaluando alertas para gestante:', gestanteId);

      const gestante = await prisma.gestante.findUnique({
        where: { id: gestanteId },
        include: {
          controles: {
            orderBy: { fecha_control: 'desc' },
            take: 3, // Últimos 3 controles
          },
          alertas: {
            where: {
              estado: 'pendiente',
              created_at: {
                gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Últimas 24 horas
              },
            },
          },
          madrina: true,
          medico_tratante: true,
          municipio: true,
        },
      }) as any;

      if (!gestante) {
        console.log('❌ SmartAlertsService: Gestante no encontrada');
        return 0;
      }

      let alertasGeneradas = 0;

      // 1. Evaluar alertas por factores de riesgo
      if (gestante.riesgo_alto) {
        const alertasRiesgo = await this.evaluateRiskFactorAlerts(gestante);
        alertasGeneradas += alertasRiesgo;
      }

      // 2. Evaluar alertas por controles prenatales
      const alertasControles = await this.evaluateControlAlerts(gestante);
      alertasGeneradas += alertasControles;

      // 3. Evaluar alertas por proximidad geográfica
      const alertasProximidad = await this.evaluateProximityAlerts(gestante);
      alertasGeneradas += alertasProximidad;

      // 4. Evaluar alertas por fechas importantes
      const alertasFechas = await this.evaluateDateAlerts(gestante);
      alertasGeneradas += alertasFechas;

      console.log('✅ SmartAlertsService: Alertas generadas para gestante:', alertasGeneradas);
      return alertasGeneradas;
    } catch (error) {
      console.error('❌ SmartAlertsService: Error evaluando alertas:', error);
      return 0;
    }
  }

  /**
   * Evaluar alertas por factores de riesgo
   */
  private async evaluateRiskFactorAlerts(gestante: any): Promise<number> {
    let alertas = 0;

    try {
      const factoresRiesgo = gestante.factores_riesgo as string[] || [];

      // Alertas por factores de riesgo específicos
      const alertasRiesgoAlto = [
        {
          factor: 'hipertension',
          mensaje: 'Gestante con hipertensión requiere seguimiento médico urgente',
          prioridad: 'critica' as PrioridadNivel,
        },
        {
          factor: 'diabetes',
          mensaje: 'Gestante con diabetes requiere control glucémico estricto',
          prioridad: 'alta' as PrioridadNivel,
        },
        {
          factor: 'preeclampsia',
          mensaje: 'Riesgo de preeclampsia - monitoreo continuo requerido',
          prioridad: 'critica' as PrioridadNivel,
        },
        {
          factor: 'embarazo_multiple',
          mensaje: 'Embarazo múltiple requiere controles más frecuentes',
          prioridad: 'alta' as PrioridadNivel,
        },
      ];

      for (const alertaConfig of alertasRiesgoAlto) {
        if (factoresRiesgo.includes(alertaConfig.factor)) {
          // Verificar si ya existe una alerta similar reciente
          const alertaExistente = await prisma.alerta.findFirst({
            where: {
              gestante_id: gestante.id,
              mensaje: {
                contains: alertaConfig.factor,
              },
              estado: 'pendiente',
              created_at: {
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Última semana
              },
            },
          });

          if (!alertaExistente) {
            await this.createAlert({
              gestanteId: gestante.id,
              tipo: 'emergencia' as AlertaTipo,
              prioridad: alertaConfig.prioridad,
              mensaje: alertaConfig.mensaje,
              sintomas: [alertaConfig.factor],
              madrinaId: gestante.madrina_id,
              medicoId: gestante.medico_asignado_id,
              coordenadas: gestante.coordenadas,
            });
            alertas++;
          }
        }
      }

      return alertas;
    } catch (error) {
      console.error('❌ SmartAlertsService: Error evaluando factores de riesgo:', error);
      return 0;
    }
  }

  /**
   * Evaluar alertas por controles prenatales
   */
  private async evaluateControlAlerts(gestante: any): Promise<number> {
    let alertas = 0;

    try {
      const ultimoControl = gestante.controles[0];
      const hoy = new Date();

      // Alerta por falta de controles
      if (!ultimoControl) {
        // No tiene controles registrados
        await this.createAlert({
          gestanteId: gestante.id,
          tipo: 'seguimiento' as AlertaTipo,
          prioridad: 'alta' as PrioridadNivel,
          mensaje: 'Gestante sin controles prenatales registrados',
          sintomas: ['sin_controles'],
          madrinaId: gestante.madrina_id,
          medicoId: gestante.medico_asignado_id,
          coordenadas: gestante.coordenadas,
        });
        alertas++;
      } else {
        // Verificar si el último control es muy antiguo
        const diasSinControl = Math.floor(
          (hoy.getTime() - ultimoControl.fecha_control.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diasSinControl > 30) {
          await this.createAlert({
            gestanteId: gestante.id,
            tipo: 'seguimiento' as AlertaTipo,
            prioridad: 'media' as PrioridadNivel,
            mensaje: `Gestante sin control prenatal hace ${diasSinControl} días`,
            sintomas: ['control_vencido'],
            madrinaId: gestante.madrina_id,
            medicoId: gestante.medico_asignado_id,
            coordenadas: gestante.coordenadas,
          });
          alertas++;
        }

        // Evaluar valores anormales en el último control
        if (ultimoControl.presion_sistolica && ultimoControl.presion_sistolica > 140) {
          await this.createAlert({
            gestanteId: gestante.id,
            tipo: 'emergencia' as AlertaTipo,
            prioridad: 'critica' as PrioridadNivel,
            mensaje: `Presión arterial elevada: ${ultimoControl.presion_sistolica}/${ultimoControl.presion_diastolica}`,
            sintomas: ['hipertension'],
            madrinaId: gestante.madrina_id,
            medicoId: gestante.medico_asignado_id,
            coordenadas: gestante.coordenadas,
          });
          alertas++;
        }

        if (ultimoControl.temperatura && ultimoControl.temperatura > 38) {
          await this.createAlert({
            gestanteId: gestante.id,
            tipo: 'urgencia' as AlertaTipo,
            prioridad: 'alta' as PrioridadNivel,
            mensaje: `Fiebre detectada: ${ultimoControl.temperatura}°C`,
            sintomas: ['fiebre'],
            madrinaId: gestante.madrina_id,
            medicoId: gestante.medico_asignado_id,
            coordenadas: gestante.coordenadas,
          });
          alertas++;
        }
      }

      return alertas;
    } catch (error) {
      console.error('❌ SmartAlertsService: Error evaluando controles:', error);
      return 0;
    }
  }

  /**
   * Evaluar alertas por proximidad geográfica
   */
  private async evaluateProximityAlerts(gestante: any): Promise<number> {
    let alertas = 0;

    try {
      // Si la gestante no tiene madrina asignada
      if (!gestante.madrina_id) {
        await this.createAlert({
          gestanteId: gestante.id,
          tipo: 'sistema' as AlertaTipo,
          prioridad: 'media' as PrioridadNivel,
          mensaje: 'Gestante sin madrina asignada',
          sintomas: ['sin_madrina'],
          coordenadas: gestante.coordenadas,
        });
        alertas++;
      }

      // Si la gestante no tiene médico asignado
      if (!gestante.medico_asignado_id) {
        await this.createAlert({
          gestanteId: gestante.id,
          tipo: 'sistema' as AlertaTipo,
          prioridad: 'media' as PrioridadNivel,
          mensaje: 'Gestante sin médico asignado',
          sintomas: ['sin_medico'],
          coordenadas: gestante.coordenadas,
        });
        alertas++;
      }

      return alertas;
    } catch (error) {
      console.error('❌ SmartAlertsService: Error evaluando proximidad:', error);
      return 0;
    }
  }

  /**
   * Evaluar alertas por fechas importantes
   */
  private async evaluateDateAlerts(gestante: any): Promise<number> {
    let alertas = 0;

    try {
      const hoy = new Date();

      // Alerta por fecha probable de parto cercana
      if (gestante.fecha_probable_parto) {
        const diasParaParto = Math.floor(
          (gestante.fecha_probable_parto.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diasParaParto <= 30 && diasParaParto > 0) {
          await this.createAlert({
            gestanteId: gestante.id,
            tipo: 'recordatorio' as AlertaTipo,
            prioridad: 'alta' as PrioridadNivel,
            mensaje: `Fecha probable de parto en ${diasParaParto} días`,
            sintomas: ['parto_cercano'],
            madrinaId: gestante.madrina_id,
            medicoId: gestante.medico_asignado_id,
            coordenadas: gestante.coordenadas,
          });
          alertas++;
        } else if (diasParaParto <= 0) {
          await this.createAlert({
            gestanteId: gestante.id,
            tipo: 'emergencia' as AlertaTipo,
            prioridad: 'critica' as PrioridadNivel,
            mensaje: 'Fecha probable de parto vencida - verificar estado',
            sintomas: ['parto_vencido'],
            madrinaId: gestante.madrina_id,
            medicoId: gestante.medico_asignado_id,
            coordenadas: gestante.coordenadas,
          });
          alertas++;
        }
      }

      return alertas;
    } catch (error) {
      console.error('❌ SmartAlertsService: Error evaluando fechas:', error);
      return 0;
    }
  }

  /**
   * Crear una nueva alerta
   */
  private async createAlert(alertData: {
    gestanteId: string;
    tipo: AlertaTipo;
    prioridad: PrioridadNivel;
    mensaje: string;
    sintomas: string[];
    madrinaId?: string | null;
    medicoId?: string | null;
    coordenadas?: any;
  }) {
    try {
      await prisma.alerta.create({
        data: {
          gestante_id: alertData.gestanteId,
          tipo_alerta: alertData.tipo,
          nivel_prioridad: alertData.prioridad,
          mensaje: alertData.mensaje,
          sintomas: alertData.sintomas,
          madrina_id: alertData.madrinaId,
          medico_asignado_id: alertData.medicoId,
          coordenadas_alerta: alertData.coordenadas,
          estado: 'pendiente',
        },
      });

      console.log('🚨 SmartAlertsService: Alerta creada:', alertData.mensaje);
    } catch (error) {
      console.error('❌ SmartAlertsService: Error creando alerta:', error);
    }
  }

  /**
   * Ejecutar evaluación masiva de alertas para todas las gestantes activas
   */
  async runMassiveAlertEvaluation(): Promise<{ gestantesEvaluadas: number; alertasGeneradas: number }> {
    try {
      console.log('🚀 SmartAlertsService: Iniciando evaluación masiva de alertas...');

      const gestantesActivas = await prisma.gestante.findMany({
        where: { activa: true },
        select: { id: true },
      });

      console.log('📊 SmartAlertsService: Gestantes activas a evaluar:', gestantesActivas.length);

      let totalAlertas = 0;
      for (const gestante of gestantesActivas) {
        const alertas = await this.evaluateGestanteAlerts(gestante.id);
        totalAlertas += alertas;
      }

      console.log('✅ SmartAlertsService: Evaluación masiva completada');
      console.log('👥 Gestantes evaluadas:', gestantesActivas.length);
      console.log('🚨 Alertas generadas:', totalAlertas);

      return {
        gestantesEvaluadas: gestantesActivas.length,
        alertasGeneradas: totalAlertas,
      };
    } catch (error) {
      console.error('❌ SmartAlertsService: Error en evaluación masiva:', error);
      return { gestantesEvaluadas: 0, alertasGeneradas: 0 };
    }
  }

  /**
   * Obtener alertas priorizadas por ubicación y riesgo
   */
  async getPrioritizedAlerts(municipioId?: string, limit: number = 50) {
    try {
      const whereClause: any = {
        estado: 'pendiente',
      };

      if (municipioId) {
        whereClause.gestante = {
          municipio_id: municipioId,
        };
      }

      const alertas = await prisma.alerta.findMany({
        where: whereClause,
        include: {
          gestante: {
            include: {
              municipio: true,
              madrina: true,
              medico_tratante: true,
            },
          },
        },
        orderBy: [
          { nivel_prioridad: 'desc' }, // Prioridad más alta primero
          { created_at: 'desc' }, // Más recientes primero
        ],
        take: limit,
      }) as any;

      return alertas.map(alerta => ({
        ...alerta,
        prioridadNumerica: this.getPriorityScore(alerta.nivel_prioridad),
        distanciaEstimada: this.calculateEstimatedDistance(alerta),
      }));
    } catch (error) {
      console.error('❌ SmartAlertsService: Error obteniendo alertas priorizadas:', error);
      return [];
    }
  }

  /**
   * Obtener puntuación numérica de prioridad
   */
  private getPriorityScore(prioridad: PrioridadNivel): number {
    const scores = {
      critica: 4,
      alta: 3,
      media: 2,
      baja: 1,
    };
    return scores[prioridad] || 0;
  }

  /**
   * Calcular distancia estimada (placeholder - requiere implementación con PostGIS)
   */
  private calculateEstimatedDistance(alerta: any): string {
    // Placeholder - en una implementación real usaríamos PostGIS
    return 'N/A';
  }
}
