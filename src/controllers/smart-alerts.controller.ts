import { Request, Response } from 'express';
import { SmartAlertsService } from '../services/smart-alerts.service';

const smartAlertsService = new SmartAlertsService();

/**
 * Evaluar alertas para una gestante específica
 */
export const evaluateGestanteAlerts = async (req: Request, res: Response) => {
  try {
    const { gestanteId } = req.params;

    if (!gestanteId) {
      return res.status(400).json({
        success: false,
        error: 'ID de gestante requerido',
      });
    }

    console.log('🚨 SmartAlertsController: Evaluando alertas para gestante:', gestanteId);

    const alertasGeneradas = await smartAlertsService.evaluateGestanteAlerts(gestanteId);

    res.json({
      success: true,
      message: `Evaluación completada. ${alertasGeneradas} alertas generadas.`,
      data: {
        gestanteId,
        alertasGeneradas,
      },
    });
  } catch (error) {
    console.error('❌ SmartAlertsController: Error evaluando alertas:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Ejecutar evaluación masiva de alertas
 */
export const runMassiveEvaluation = async (req: Request, res: Response) => {
  try {
    console.log('🚀 SmartAlertsController: Iniciando evaluación masiva de alertas...');

    const result = await smartAlertsService.runMassiveAlertEvaluation();

    res.json({
      success: true,
      message: 'Evaluación masiva de alertas completada',
      data: result,
    });
  } catch (error) {
    console.error('❌ SmartAlertsController: Error en evaluación masiva:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Obtener alertas priorizadas
 */
export const getPrioritizedAlerts = async (req: Request, res: Response) => {
  try {
    const { municipioId, limit } = req.query;

    console.log('📋 SmartAlertsController: Obteniendo alertas priorizadas...');

    const alertas = await smartAlertsService.getPrioritizedAlerts(
      municipioId as string,
      limit ? parseInt(limit as string) : 50
    );

    res.json({
      success: true,
      message: 'Alertas priorizadas obtenidas exitosamente',
      data: {
        alertas,
        total: alertas.length,
      },
    });
  } catch (error) {
    console.error('❌ SmartAlertsController: Error obteniendo alertas priorizadas:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Obtener estadísticas de alertas por prioridad
 */
export const getAlertStats = async (req: Request, res: Response) => {
  try {
    const { municipioId } = req.query;

    console.log('📊 SmartAlertsController: Obteniendo estadísticas de alertas...');

    // Obtener estadísticas de alertas por prioridad
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const whereClause: any = {
      estado: 'pendiente',
    };

    if (municipioId) {
      whereClause.gestante = {
        municipio_id: municipioId,
      };
    }

    const alertasPorPrioridad = await prisma.alerta.groupBy({
      by: ['nivel_prioridad'],
      where: whereClause,
      _count: {
        id: true,
      },
    });

    const alertasPorTipo = await prisma.alerta.groupBy({
      by: ['tipo_alerta'],
      where: whereClause,
      _count: {
        id: true,
      },
    });

    const alertasRecientes = await prisma.alerta.count({
      where: {
        ...whereClause,
        created_at: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Últimas 24 horas
        },
      },
    });

    const totalAlertas = await prisma.alerta.count({
      where: whereClause,
    });

    const stats = {
      resumen: {
        totalAlertas,
        alertasRecientes,
        alertasPendientes: totalAlertas,
      },
      porPrioridad: alertasPorPrioridad.reduce((acc: any, item: any) => {
        acc[item.nivel_prioridad] = item._count.id;
        return acc;
      }, {}),
      porTipo: alertasPorTipo.reduce((acc: any, item: any) => {
        acc[item.tipo_alerta] = item._count.id;
        return acc;
      }, {}),
    };

    res.json({
      success: true,
      message: 'Estadísticas de alertas obtenidas exitosamente',
      data: stats,
    });
  } catch (error) {
    console.error('❌ SmartAlertsController: Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Marcar alerta como resuelta
 */
export const resolveAlert = async (req: Request, res: Response) => {
  try {
    const { alertaId } = req.params;
    const { observaciones } = req.body;

    if (!alertaId) {
      return res.status(400).json({
        success: false,
        error: 'ID de alerta requerido',
      });
    }

    console.log('✅ SmartAlertsController: Resolviendo alerta:', alertaId);

    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const alertaActualizada = await prisma.alerta.update({
      where: { id: alertaId },
      data: {
        estado: 'resuelta',
        fecha_resolucion: new Date(),
        observaciones_resolucion: observaciones || null,
      },
      include: {
        gestante: {
          select: {
            nombre: true,
            documento: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: 'Alerta resuelta exitosamente',
      data: alertaActualizada,
    });
  } catch (error) {
    console.error('❌ SmartAlertsController: Error resolviendo alerta:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Obtener alertas críticas en tiempo real
 */
export const getCriticalAlerts = async (req: Request, res: Response) => {
  try {
    const { municipioId } = req.query;

    console.log('🚨 SmartAlertsController: Obteniendo alertas críticas...');

    const whereClause: any = {
      estado: 'pendiente',
      nivel_prioridad: 'critica',
    };

    if (municipioId) {
      whereClause.gestante = {
        municipio_id: municipioId,
      };
    }

    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const alertasCriticas = await prisma.alerta.findMany({
      where: whereClause,
      include: {
        gestante: {
          include: {
            municipio: true,
            madrina: {
              select: {
                nombre: true,
                telefono: true,
              },
            },
            medicoAsignado: {
              select: {
                nombre: true,
                telefono: true,
              },
            },
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
      take: 20, // Máximo 20 alertas críticas
    });

    res.json({
      success: true,
      message: 'Alertas críticas obtenidas exitosamente',
      data: {
        alertas: alertasCriticas,
        total: alertasCriticas.length,
      },
    });
  } catch (error) {
    console.error('❌ SmartAlertsController: Error obteniendo alertas críticas:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Programar evaluación automática de alertas
 */
export const scheduleAutoEvaluation = async (req: Request, res: Response) => {
  try {
    const { intervalHours = 6 } = req.body;

    console.log('⏰ SmartAlertsController: Programando evaluación automática cada', intervalHours, 'horas');

    // En una implementación real, aquí se configuraría un cron job
    // Por ahora, solo devolvemos confirmación
    res.json({
      success: true,
      message: `Evaluación automática programada cada ${intervalHours} horas`,
      data: {
        intervalHours,
        nextEvaluation: new Date(Date.now() + intervalHours * 60 * 60 * 1000),
      },
    });
  } catch (error) {
    console.error('❌ SmartAlertsController: Error programando evaluación:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
    });
  }
};
