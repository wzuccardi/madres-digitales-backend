// src/controllers/meows-dashboard.controller.ts
// Controlador para dashboard de análisis MEOWS

import { Request, Response } from 'express';
import prisma from '../config/database';

/**
 * Obtener estadísticas generales de MEOWS
 * GET /api/meows/dashboard/stats
 */
export const getMEOWSStats = async (req: Request, res: Response) => {
  try {
    const { fecha_inicio, fecha_fin, municipio_id } = req.query;

    const whereClause: any = {
      meows_score: { not: null },
    };

    if (fecha_inicio || fecha_fin) {
      whereClause.fecha_control = {};
      if (fecha_inicio) whereClause.fecha_control.gte = new Date(fecha_inicio as string);
      if (fecha_fin) whereClause.fecha_control.lte = new Date(fecha_fin as string);
    }

    if (municipio_id) {
      whereClause.gestante = {
        municipio_id: municipio_id as string,
      };
    }

    // Estadísticas generales
    const [
      totalControles,
      promedioScore,
      alertasAmarillas,
      alertasRojas,
      distribucionScores,
      tendenciaSemanal,
    ] = await Promise.all([
      // Total de controles con MEOWS
      prisma.control_prenatal.count({ where: whereClause }),

      // Promedio de score
      prisma.control_prenatal.aggregate({
        where: whereClause,
        _avg: { meows_score: true },
      }),

      // Alertas amarillas
      prisma.control_prenatal.count({
        where: {
          ...whereClause,
          meows_alert_level: 'AlertLevel.yellow',
        },
      }),

      // Alertas rojas
      prisma.control_prenatal.count({
        where: {
          ...whereClause,
          meows_alert_level: 'AlertLevel.red',
        },
      }),

      // Distribución de scores
      prisma.control_prenatal.groupBy({
        by: ['meows_score'],
        where: whereClause,
        _count: { id: true },
        orderBy: { meows_score: 'asc' },
      }),

      // Tendencia semanal
      prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('week', fecha_control) as semana,
          COUNT(*) as total_controles,
          AVG(meows_score) as promedio_score,
          COUNT(CASE WHEN meows_alert_level = 'AlertLevel.yellow' THEN 1 END) as alertas_amarillas,
          COUNT(CASE WHEN meows_alert_level = 'AlertLevel.red' THEN 1 END) as alertas_rojas
        FROM control_prenatal
        WHERE meows_score IS NOT NULL
          ${fecha_inicio ? `AND fecha_control >= ${fecha_inicio}::timestamp` : ''}
          ${fecha_fin ? `AND fecha_control <= ${fecha_fin}::timestamp` : ''}
        GROUP BY semana
        ORDER BY semana DESC
        LIMIT 12
      `,
    ]);

    res.json({
      success: true,
      data: {
        resumen: {
          total_controles: totalControles,
          promedio_score: promedioScore._avg.meows_score || 0,
          alertas_amarillas: alertasAmarillas,
          alertas_rojas: alertasRojas,
          porcentaje_alertas: totalControles > 0 
            ? ((alertasAmarillas + alertasRojas) / totalControles * 100).toFixed(2)
            : 0,
        },
        distribucion_scores: distribucionScores.map(d => ({
          score: d.meows_score,
          cantidad: d._count.id,
        })),
        tendencia_semanal: tendenciaSemanal,
        periodo: {
          fecha_inicio,
          fecha_fin,
        },
      },
    });
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas MEOWS:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo estadísticas MEOWS',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Obtener controles con alertas críticas
 * GET /api/meows/dashboard/critical-alerts
 */
export const getCriticalAlerts = async (req: Request, res: Response) => {
  try {
    const { limit = 20, offset = 0 } = req.query;

    const controles = await prisma.control_prenatal.findMany({
      where: {
        OR: [
          { meows_alert_level: 'AlertLevel.red' },
          { meows_score: { gte: 5 } },
        ],
      },
      include: {
        gestante: {
          select: {
            id: true,
            nombre: true,
            documento: true,
            telefono: true,
            municipio_id: true,
          },
        },
        medico: {
          select: {
            id: true,
            nombre: true,
            telefono: true,
          },
        },
      },
      orderBy: [
        { meows_score: 'desc' },
        { fecha_control: 'desc' },
      ],
      take: Number(limit),
      skip: Number(offset),
    });

    const total = await prisma.control_prenatal.count({
      where: {
        OR: [
          { meows_alert_level: 'AlertLevel.red' },
          { meows_score: { gte: 5 } },
        ],
      },
    });

    res.json({
      success: true,
      data: {
        controles,
        pagination: {
          total,
          limit: Number(limit),
          offset: Number(offset),
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    console.error('❌ Error obteniendo alertas críticas:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo alertas críticas',
    });
  }
};

/**
 * Obtener tendencia de MEOWS para una gestante específica
 * GET /api/meows/dashboard/gestante/:gestanteId/trend
 */
export const getGestanteMEOWSTrend = async (req: Request, res: Response) => {
  try {
    const { gestanteId } = req.params;

    const controles = await prisma.control_prenatal.findMany({
      where: {
        gestante_id: gestanteId,
        meows_score: { not: null },
      },
      select: {
        id: true,
        fecha_control: true,
        meows_score: true,
        meows_alert_level: true,
        meows_triggered_alerts: true,
        presion_sistolica: true,
        presion_diastolica: true,
        frecuencia_cardiaca: true,
        frecuencia_respiratoria: true,
        temperatura: true,
        semanas_gestacion: true,
      },
      orderBy: { fecha_control: 'asc' },
    });

    // Calcular tendencia
    const scores = controles.map(c => c.meows_score || 0);
    const tendencia = scores.length > 1 
      ? scores[scores.length - 1] - scores[0]
      : 0;

    res.json({
      success: true,
      data: {
        gestante_id: gestanteId,
        total_controles: controles.length,
        controles,
        analisis: {
          score_promedio: scores.reduce((a, b) => a + b, 0) / scores.length,
          score_minimo: Math.min(...scores),
          score_maximo: Math.max(...scores),
          tendencia: tendencia > 0 ? 'empeorando' : tendencia < 0 ? 'mejorando' : 'estable',
          cambio_score: tendencia,
        },
      },
    });
  } catch (error) {
    console.error('❌ Error obteniendo tendencia MEOWS:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo tendencia MEOWS',
    });
  }
};

/**
 * Obtener ranking de gestantes por riesgo MEOWS
 * GET /api/meows/dashboard/risk-ranking
 */
export const getRiskRanking = async (req: Request, res: Response) => {
  try {
    const { municipio_id, limit = 50 } = req.query;

    const whereClause: any = {
      activa: true,
    };

    if (municipio_id) {
      whereClause.municipio_id = municipio_id as string;
    }

    // Obtener gestantes con su último control MEOWS
    const gestantes = await prisma.gestantes.findMany({
      where: whereClause,
      include: {
        control_prenatal: {
          where: {
            meows_score: { not: null },
          },
          orderBy: { fecha_control: 'desc' },
          take: 1,
          select: {
            id: true,
            fecha_control: true,
            meows_score: true,
            meows_alert_level: true,
            meows_triggered_alerts: true,
          },
        },
        madrina: {
          select: {
            id: true,
            nombre: true,
            telefono: true,
          },
        },
      },
    });

    // Filtrar solo las que tienen controles MEOWS y ordenar por score
    const ranking = gestantes
      .filter(g => g.control_prenatal.length > 0)
      .map(g => ({
        gestante: {
          id: g.id,
          nombre: g.nombre,
          documento: g.documento,
          telefono: g.telefono,
          municipio_id: g.municipio_id,
        },
        madrina: g.madrina,
        ultimo_control: g.control_prenatal[0],
        riesgo_alto: g.riesgo_alto,
      }))
      .sort((a, b) => (b.ultimo_control.meows_score || 0) - (a.ultimo_control.meows_score || 0))
      .slice(0, Number(limit));

    res.json({
      success: true,
      data: {
        ranking,
        total: ranking.length,
      },
    });
  } catch (error) {
    console.error('❌ Error obteniendo ranking de riesgo:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo ranking de riesgo',
    });
  }
};

/**
 * Obtener alertas MEOWS más comunes
 * GET /api/meows/dashboard/common-alerts
 */
export const getCommonAlerts = async (req: Request, res: Response) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;

    const whereClause: any = {
      meows_triggered_alerts: { not: null },
    };

    if (fecha_inicio || fecha_fin) {
      whereClause.fecha_control = {};
      if (fecha_inicio) whereClause.fecha_control.gte = new Date(fecha_inicio as string);
      if (fecha_fin) whereClause.fecha_control.lte = new Date(fecha_fin as string);
    }

    const controles = await prisma.control_prenatal.findMany({
      where: whereClause,
      select: {
        meows_triggered_alerts: true,
      },
    });

    // Contar frecuencia de cada alerta
    const alertCounts: Record<string, number> = {};
    
    controles.forEach(control => {
      const alerts = control.meows_triggered_alerts as string[] || [];
      alerts.forEach(alert => {
        alertCounts[alert] = (alertCounts[alert] || 0) + 1;
      });
    });

    // Ordenar por frecuencia
    const sortedAlerts = Object.entries(alertCounts)
      .map(([alert, count]) => ({ alert, count }))
      .sort((a, b) => b.count - a.count);

    res.json({
      success: true,
      data: {
        alertas_comunes: sortedAlerts,
        total_controles: controles.length,
      },
    });
  } catch (error) {
    console.error('❌ Error obteniendo alertas comunes:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo alertas comunes',
    });
  }
};
