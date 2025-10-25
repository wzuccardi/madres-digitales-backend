import { Request, Response } from 'express';
import prisma from '../config/database';
import { importMunicipiosBolivar } from '../scripts/import-municipios-bolivar';

/**
 * Obtener municipios con estadísticas integradas (para super admin)
 */
export const getMunicipiosIntegrados = async (req: Request, res: Response) => {
  try {
    console.log('🏛️ MunicipiosController: Obteniendo municipios integrados con datos reales (optimizado)...');

    const municipios = await prisma.municipio.findMany({
      orderBy: [
        { departamento: 'asc' },
        { nombre: 'asc' },
      ]
    });

    // Obtener todos los datos en paralelo (optimizado)
    const [
      gestantesPorMunicipio,
      gestantesActivasPorMunicipio,
      gestantesRiesgoAltoPorMunicipio,
      medicosPorMunicipio,
      madrinasPorMunicipio,
      ipsPorMunicipio,
      todasGestantes,
      alertasActivas
    ] = await Promise.all([
      // Agrupar gestantes por municipio
      prisma.gestante.groupBy({
        by: ['municipio_id'],
        _count: { id: true },
        where: { municipio_id: { not: null } }
      }),
      // Agrupar gestantes activas por municipio
      prisma.gestante.groupBy({
        by: ['municipio_id'],
        _count: { id: true },
        where: { municipio_id: { not: null }, activa: true }
      }),
      // Agrupar gestantes de alto riesgo por municipio
      prisma.gestante.groupBy({
        by: ['municipio_id'],
        _count: { id: true },
        where: { municipio_id: { not: null }, riesgo_alto: true }
      }),
      // Agrupar médicos por municipio
      prisma.usuario.groupBy({
        by: ['municipio_id'],
        _count: { id: true },
        where: { municipio_id: { not: null }, rol: 'medico' }
      }),
      // Agrupar madrinas por municipio
      prisma.usuario.groupBy({
        by: ['municipio_id'],
        _count: { id: true },
        where: { municipio_id: { not: null }, rol: 'madrina' }
      }),
      // Agrupar IPS por municipio
      prisma.iPS.groupBy({
        by: ['municipio_id'],
        _count: { id: true },
        where: { municipio_id: { not: null } }
      }),
      // Obtener todas las gestantes con su municipio_id
      prisma.gestante.findMany({
        where: { municipio_id: { not: null } },
        select: { id: true, municipio_id: true }
      }),
      // Obtener todas las alertas activas
      prisma.alerta.findMany({
        where: { resuelta: false },
        select: { gestante_id: true }
      })
    ]);

    // Crear mapas para acceso rápido
    const gestantesMap = new Map(gestantesPorMunicipio.map(g => [g.municipio_id!, g._count.id]));
    const gestantesActivasMap = new Map(gestantesActivasPorMunicipio.map(g => [g.municipio_id!, g._count.id]));
    const gestantesRiesgoAltoMap = new Map(gestantesRiesgoAltoPorMunicipio.map(g => [g.municipio_id!, g._count.id]));
    const medicosMap = new Map(medicosPorMunicipio.map(m => [m.municipio_id!, m._count.id]));
    const madrinasMap = new Map(madrinasPorMunicipio.map(m => [m.municipio_id!, m._count.id]));
    const ipsMap = new Map(ipsPorMunicipio.map(i => [i.municipio_id!, i._count.id]));

    // Crear mapa de gestantes por municipio para contar alertas
    const gestantesPorMunicipioMap = new Map<string, string[]>();
    todasGestantes.forEach(g => {
      if (!gestantesPorMunicipioMap.has(g.municipio_id!)) {
        gestantesPorMunicipioMap.set(g.municipio_id!, []);
      }
      gestantesPorMunicipioMap.get(g.municipio_id!)!.push(g.id);
    });

    // Crear set de gestantes con alertas activas
    const gestantesConAlertasActivas = new Set(alertasActivas.map(a => a.gestante_id));

    // Construir respuesta
    const municipiosConEstadisticas = municipios.map(municipio => {
      const gestantesIds = gestantesPorMunicipioMap.get(municipio.id) || [];
      const alertasActivasCount = gestantesIds.filter(id => gestantesConAlertasActivas.has(id)).length;

      return {
        id: municipio.id,
        codigo: municipio.codigo_dane,
        nombre: municipio.nombre,
        departamento: municipio.departamento,
        activo: municipio.activo,
        poblacion: null,
        latitud: municipio.latitud,
        longitud: municipio.longitud,
        fecha_creacion: municipio.fecha_creacion,
        fecha_actualizacion: municipio.fecha_actualizacion,
        estadisticas: {
          gestantes: gestantesMap.get(municipio.id) || 0,
          medicos: medicosMap.get(municipio.id) || 0,
          ips: ipsMap.get(municipio.id) || 0,
          madrinas: madrinasMap.get(municipio.id) || 0,
          gestantes_activas: gestantesActivasMap.get(municipio.id) || 0,
          gestantes_riesgo_alto: gestantesRiesgoAltoMap.get(municipio.id) || 0,
          alertas_activas: alertasActivasCount
        }
      };
    });

    console.log(`✅ MunicipiosController: ${municipiosConEstadisticas.length} municipios integrados con datos reales obtenidos (optimizado)`);

    res.json({
      success: true,
      data: municipiosConEstadisticas,
    });
  } catch (error) {
    console.error('❌ MunicipiosController: Error obteniendo municipios integrados:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Obtener todos los municipios
 */
export const getMunicipios = async (req: Request, res: Response) => {
  try {
    const { activo, departamento, search, page = 1, limit = 50 } = req.query;

    console.log('🏛️ MunicipiosController: Obteniendo municipios...');

    // Construir filtros
    const whereClause: any = {};

    if (activo !== undefined) {
      whereClause.activo = activo === 'true';
    }

    if (departamento) {
      whereClause.departamento = {
        contains: departamento as string,
        mode: 'insensitive',
      };
    }

    if (search) {
      whereClause.OR = [
        {
          nombre: {
            contains: search as string,
            mode: 'insensitive',
          },
        },
        {
          codigo_dane: {
            contains: search as string,
            mode: 'insensitive',
          },
        },
      ];
    }

    // Calcular paginación
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Obtener municipios con paginación
    const [municipios, total] = await Promise.all([
      prisma.municipio.findMany({
        where: whereClause,
        orderBy: [
          { departamento: 'asc' },
          { nombre: 'asc' },
        ],
        skip,
        take: limitNum,
      }),
      prisma.municipio.count({ where: whereClause }),
    ]);

    console.log(`✅ MunicipiosController: ${municipios.length} municipios obtenidos de ${total} total`);

    res.json({
      success: true,
      data: municipios,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('❌ MunicipiosController: Error obteniendo municipios:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Obtener municipio por ID
 */
export const getMunicipio = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    console.log('🏛️ MunicipiosController: Obteniendo municipio:', id);

    const municipio = await prisma.municipio.findUnique({
      where: { id },
      include: {
        gestantes: {
          where: { activa: true },
          select: {
            id: true,
            nombre: true,
            documento: true,
            riesgo_alto: true,
          },
        },
        medicos: {
          where: { activo: true },
          select: {
            id: true,
            nombre: true,
            especialidad: true,
            telefono: true,
          },
        },
        _count: {
          select: {
            gestantes: true,
            medicos: true,
          },
        },
      },
    });

    if (!municipio) {
      return res.status(404).json({
        success: false,
        error: 'Municipio no encontrado',
      });
    }

    console.log(`✅ MunicipiosController: Municipio obtenido: ${municipio.nombre}`);

    res.json({
      success: true,
      data: municipio,
    });
  } catch (error) {
    console.error('❌ MunicipiosController: Error obteniendo municipio:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Activar municipio (solo super_admin o admin)
 */
export const activarMunicipio = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    // Verificar permisos de super admin o admin
    if (user.rol !== 'super_admin' && user.rol !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Solo el super administrador o administrador puede activar municipios',
      });
    }

    console.log('✅ MunicipiosController: Activando municipio:', id);

    const municipio = await prisma.municipio.update({
      where: { id },
      data: {
        activo: true,
        fecha_actualizacion: new Date(),
      },
    });

    console.log(`✅ MunicipiosController: Municipio activado: ${municipio.nombre}`);

    res.json({
      success: true,
      message: `Municipio ${municipio.nombre} activado exitosamente`,
      data: municipio,
    });
  } catch (error) {
    console.error('❌ MunicipiosController: Error activando municipio:', error);
    
    if (error instanceof Error && 'code' in error && error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Municipio no encontrado',
      });
    }

    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Desactivar municipio (solo super_admin o admin)
 */
export const desactivarMunicipio = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    // Verificar permisos de super admin o admin
    if (user.rol !== 'super_admin' && user.rol !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Solo el super administrador o administrador puede desactivar municipios',
      });
    }

    console.log('❌ MunicipiosController: Desactivando municipio:', id);

    // Verificar si el municipio tiene gestantes activas
    const gestantesActivas = await prisma.gestante.count({
      where: {
        municipio_id: id,
        activa: true,
      },
    });

    if (gestantesActivas > 0) {
      return res.status(400).json({
        success: false,
        error: `No se puede desactivar el municipio porque tiene ${gestantesActivas} gestantes activas`,
      });
    }

    const municipio = await prisma.municipio.update({
      where: { id },
      data: {
        activo: false,
        fecha_actualizacion: new Date(),
      },
    });

    console.log(`❌ MunicipiosController: Municipio desactivado: ${municipio.nombre}`);

    res.json({
      success: true,
      message: `Municipio ${municipio.nombre} desactivado exitosamente`,
      data: municipio,
    });
  } catch (error) {
    console.error('❌ MunicipiosController: Error desactivando municipio:', error);
    
    if (error instanceof Error && 'code' in error && error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Municipio no encontrado',
      });
    }

    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Obtener estadísticas de municipios
 */
export const getEstadisticasMunicipios = async (req: Request, res: Response) => {
  try {
    console.log('📊 MunicipiosController: Obteniendo estadísticas...');

    const [
      totalMunicipios,
      municipiosActivos,
      municipiosInactivos,
      estadisticasPorDepartamento,
    ] = await Promise.all([
      prisma.municipio.count(),
      prisma.municipio.count({ where: { activo: true } }),
      prisma.municipio.count({ where: { activo: false } }),
      prisma.municipio.groupBy({
        by: ['departamento'],
        _count: {
          id: true,
        },
        orderBy: {
          _count: {
            id: 'desc',
          },
        },
      }),
    ]);

    // Contar municipios con gestantes activas
    const gestantesConMunicipio = await prisma.gestante.findMany({
      where: { activa: true, municipio_id: { not: null } },
      select: { municipio_id: true },
      distinct: ['municipio_id']
    });
    const municipiosConGestantes = gestantesConMunicipio.length;

    // Contar municipios con madrinas activas
    const madrinasConMunicipio = await prisma.usuario.findMany({
      where: { rol: 'madrina', activo: true, municipio_id: { not: null } },
      select: { municipio_id: true },
      distinct: ['municipio_id']
    });
    const municipiosConMadrinas = madrinasConMunicipio.length;

    // Contar municipios con médicos activos
    const medicosConMunicipio = await prisma.usuario.findMany({
      where: { rol: 'medico', activo: true, municipio_id: { not: null } },
      select: { municipio_id: true },
      distinct: ['municipio_id']
    });
    const municipiosConMedicos = medicosConMunicipio.length;

    const estadisticas = {
      resumen: {
        total: totalMunicipios,
        activos: municipiosActivos,
        inactivos: municipiosInactivos,
        conGestantes: municipiosConGestantes,
        conMadrinas: municipiosConMadrinas,
        conMedicos: municipiosConMedicos,
      },
      porDepartamento: estadisticasPorDepartamento.map((stat: any) => ({
        departamento: stat.departamento,
        cantidad: stat._count.id,
      })),
    };

    console.log('✅ MunicipiosController: Estadísticas obtenidas');

    res.json({
      success: true,
      data: estadisticas,
    });
  } catch (error) {
    console.error('❌ MunicipiosController: Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Buscar municipios por proximidad geográfica
 */
export const buscarMunicipiosCercanos = async (req: Request, res: Response) => {
  try {
    const { latitude, longitude, radius = 50 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: 'Se requieren parámetros latitude y longitude',
      });
    }

    const lat = parseFloat(latitude as string);
    const lon = parseFloat(longitude as string);
    const radiusKm = parseFloat(radius as string);

    console.log(`🔍 MunicipiosController: Buscando municipios cerca de ${lat}, ${lon} en radio de ${radiusKm}km`);

    // Usar función PostGIS para búsqueda optimizada
    const municipiosCercanos = await prisma.$queryRaw`
      SELECT
        id,
        codigo,
        nombre,
        departamento,
        coordenadas,
        activo,
        fecha_creacion,
        fecha_actualizacion,
        distancia_metros
      FROM encontrar_municipios_cercanos(${lat}, ${lon}, ${radiusKm * 1000})
    ` as any[];

    // Formatear respuesta
    const municipiosFormateados = municipiosCercanos.map(municipio => ({
      ...municipio,
      distancia: municipio.distancia_metros / 1000, // Convertir a km
      distanciaFormateada: `${(municipio.distancia_metros / 1000).toFixed(1)} km`,
    }));

    console.log(`✅ MunicipiosController: ${municipiosFormateados.length} municipios cercanos encontrados`);

    res.json({
      success: true,
      data: municipiosFormateados,
    });
  } catch (error) {
    console.error('❌ MunicipiosController: Error buscando municipios cercanos:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Buscar IPS cercanas usando PostGIS
 */
export const buscarIPSCercanas = async (req: Request, res: Response) => {
  try {
    const { latitude, longitude, radius = 50 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: 'Se requieren parámetros latitude y longitude',
      });
    }

    const lat = parseFloat(latitude as string);
    const lon = parseFloat(longitude as string);
    const radiusKm = parseFloat(radius as string);

    console.log(`🏥 MunicipiosController: Buscando IPS cerca de ${lat}, ${lon} en radio de ${radiusKm}km`);

    // Usar función PostGIS para búsqueda optimizada de IPS
    const ipsCercanas = await prisma.$queryRaw`
      SELECT
        id,
        nombre,
        direccion,
        telefono,
        municipio_nombre,
        distancia_metros
      FROM encontrar_ips_cercanas(${lat}, ${lon}, ${radiusKm * 1000})
    ` as any[];

    // Formatear respuesta
    const ipsFormateadas = ipsCercanas.map(ips => ({
      ...ips,
      distancia: ips.distancia_metros / 1000, // Convertir a km
      distanciaFormateada: `${(ips.distancia_metros / 1000).toFixed(1)} km`,
    }));

    console.log(`✅ MunicipiosController: ${ipsFormateadas.length} IPS cercanas encontradas`);

    res.json({
      success: true,
      data: ipsFormateadas,
    });
  } catch (error) {
    console.error('❌ MunicipiosController: Error buscando IPS cercanas:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
    });
  }
};

/**
 * Importar municipios desde archivo Bolivar.txt (solo super_admin)
 */
export const importarMunicipiosBolivar = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    // Verificar permisos de super admin o admin
    if (user.rol !== 'super_admin' && user.rol !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Solo el super administrador o administrador puede importar municipios',
      });
    }

    console.log('📥 MunicipiosController: Iniciando importación de municipios de Bolívar...');

    // Ejecutar importación
    await importMunicipiosBolivar();

    // Obtener estadísticas actualizadas
    const totalMunicipios = await prisma.municipio.count({
      where: {
        departamento: 'BOLÍVAR',
      },
    });

    console.log('✅ MunicipiosController: Importación completada exitosamente');

    res.json({
      success: true,
      message: `Importación de municipios de Bolívar completada exitosamente. Total: ${totalMunicipios} municipios`,
      data: {
        totalMunicipios,
        departamento: 'BOLÍVAR',
      },
    });
  } catch (error) {
    console.error('❌ MunicipiosController: Error importando municipios:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor durante la importación',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Obtener resumen integrado del sistema (para super admin)
 */
export const getResumenIntegrado = async (req: Request, res: Response) => {
  try {
    console.log('📊 MunicipiosController: Obteniendo resumen integrado...');

    console.log('🔍 Ejecutando consultas de conteo...');

    // Ejecutar consultas una por una para identificar cuál falla
    const totalMunicipios = await prisma.municipio.count();
    console.log('✅ totalMunicipios:', totalMunicipios);

    const municipiosActivos = await prisma.municipio.count({ where: { activo: true } });
    console.log('✅ municipiosActivos:', municipiosActivos);

    const totalIPS = await prisma.iPS.count();
    console.log('✅ totalIPS:', totalIPS);

    const ipsActivas = await prisma.iPS.count({ where: { activo: true } });
    console.log('✅ ipsActivas:', ipsActivas);

    const totalMedicos = await prisma.medico.count();
    console.log('✅ totalMedicos:', totalMedicos);

    const medicosActivos = await prisma.medico.count({ where: { activo: true } });
    console.log('✅ medicosActivos:', medicosActivos);

    const totalGestantes = await prisma.gestante.count();
    console.log('✅ totalGestantes:', totalGestantes);

    const gestantesActivas = await prisma.gestante.count({ where: { activa: true } });
    console.log('✅ gestantesActivas:', gestantesActivas);

    const alertasActivas = await prisma.alerta.count({ where: { resuelta: false } });
    console.log('✅ alertasActivas:', alertasActivas);

    const controlesEsteMes = await prisma.controlPrenatal.count({
      where: {
        fecha_control: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }
    });
    console.log('✅ controlesEsteMes:', controlesEsteMes);

    console.log('✅ Todas las consultas de conteo completadas');

    console.log('🔍 Obteniendo distribución por niveles de atención...');
    // Obtener distribución por niveles de atención
    const distribucionNiveles = await prisma.iPS.groupBy({
      by: ['nivel'],
      _count: {
        id: true
      },
      where: { activo: true }
    });
    console.log('✅ Distribución niveles obtenida:', distribucionNiveles);

    console.log('🔍 Obteniendo distribución por especialidades...');
    // Obtener distribución por especialidades
    const distribucionEspecialidades = await prisma.medico.groupBy({
      by: ['especialidad'],
      _count: {
        id: true
      },
      where: {
        activo: true,
        especialidad: { not: null }
      }
    });
    console.log('✅ Distribución especialidades obtenida:', distribucionEspecialidades);

    console.log('🔍 Obteniendo municipios principales...');
    // Obtener los primeros 5 municipios activos
    const municipiosTopActividad = await prisma.municipio.findMany({
      where: { activo: true },
      take: 5,
      orderBy: {
        nombre: 'asc'
      }
    });
    console.log('✅ Municipios principales obtenidos:', municipiosTopActividad.length);

    console.log('🔍 Construyendo resumen...');
    const resumen = {
      total_municipios: totalMunicipios,
      municipios_activos: municipiosActivos,
      total_ips: totalIPS,
      ips_activas: ipsActivas,
      total_medicos: totalMedicos,
      medicos_activos: medicosActivos,
      total_gestantes: totalGestantes,
      gestantes_activas: gestantesActivas,
      alertas_activas: alertasActivas,
      controles_este_mes: controlesEsteMes,
      distribucion_niveles_atencion: distribucionNiveles.reduce((acc, item) => {
        acc[item.nivel] = item._count.id;
        return acc;
      }, {} as Record<string, number>),
      distribucion_especialidades: distribucionEspecialidades.reduce((acc, item) => {
        acc[item.especialidad] = item._count.id;
        return acc;
      }, {} as Record<string, number>),
      municipios_top_actividad: municipiosTopActividad.map(m => ({
        id: m.id,
        codigo: m.codigo_dane,
        nombre: m.nombre,
        departamento: m.departamento,
        activo: m.activo,
        fecha_creacion: m.fecha_creacion,
        fecha_actualizacion: m.fecha_actualizacion,
        estadisticas: {
          gestantes: 0,
          medicos: 0,
          ips: 0,
          madrinas: 0,
          gestantes_activas: 0,
          gestantes_riesgo_alto: 0,
          alertas_activas: 0
        }
      }))
    };

    console.log('✅ MunicipiosController: Resumen integrado obtenido');

    res.json({
      success: true,
      data: resumen,
    });
  } catch (error) {
    console.error('❌ MunicipiosController: Error obteniendo resumen integrado:', error);
    console.error('❌ Detalles del error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      code: (error as any)?.code,
      meta: (error as any)?.meta
    });
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Función auxiliar para calcular distancia usando fórmula de Haversine
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
