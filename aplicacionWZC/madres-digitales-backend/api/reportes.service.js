const { PrismaClient } = require('@prisma/client');

class ReportesService {
  constructor() {
    this.prisma = new PrismaClient();
  }

  async generarReporteCompleto(filtros) {
    const whereGestantes = this.buildWhereClause(filtros);
    
    const totalGestantes = await this.prisma.gestantes.count({
      where: whereGestantes
    });

    const indicadores = [];

    // 1. Captación temprana (antes de las 12 semanas)
    const captacionTemprana = await this.calcularCaptacionTemprana(whereGestantes);
    indicadores.push(captacionTemprana);

    // 2-9. Indicadores de controles prenatales
    const indicadoresControles = await this.calcularIndicadoresControles(whereGestantes);
    indicadores.push(...indicadoresControles);

    // 10. Visitas domiciliarias
    const visitasDomiciliarias = await this.calcularVisitasDomiciliarias(whereGestantes);
    indicadores.push(visitasDomiciliarias);

    // 11-15. Indicadores demográficos
    const indicadoresDemograficos = await this.calcularIndicadoresDemograficos(whereGestantes);
    indicadores.push(...indicadoresDemograficos);

    return {
      indicadores,
      filtrosAplicados: filtros,
      fechaGeneracion: new Date(),
      totalGestantes
    };
  }

  buildWhereClause(filtros) {
    const where = {
      activa: true
    };

    if (filtros.municipioId) {
      where.municipio_id = filtros.municipioId;
    }

    if (filtros.madrinaId) {
      where.madrina_id = filtros.madrinaId;
    }

    if (filtros.fechaInicio || filtros.fechaFin) {
      where.fecha_creacion = {};
      if (filtros.fechaInicio) {
        where.fecha_creacion.gte = filtros.fechaInicio;
      }
      if (filtros.fechaFin) {
        where.fecha_creacion.lte = filtros.fechaFin;
      }
    }

    return where;
  }

  async calcularCaptacionTemprana(whereGestantes) {
    // Por ahora usar fecha_creacion como proxy para fecha_ingreso_control
    const gestantesConFUM = await this.prisma.gestantes.findMany({
      where: {
        ...whereGestantes,
        fecha_ultima_menstruacion: { not: null }
      },
      select: {
        fecha_ultima_menstruacion: true,
        fecha_creacion: true
      }
    });

    let captacionTemprana = 0;
    
    gestantesConFUM.forEach(gestante => {
      if (gestante.fecha_ultima_menstruacion && gestante.fecha_creacion) {
        const diffTime = gestante.fecha_creacion.getTime() - gestante.fecha_ultima_menstruacion.getTime();
        const diffWeeks = diffTime / (1000 * 60 * 60 * 24 * 7);
        
        if (diffWeeks <= 12) {
          captacionTemprana++;
        }
      }
    });

    return {
      nombre: 'Captación temprana (≤12 semanas)',
      valor: captacionTemprana,
      total: gestantesConFUM.length,
      porcentaje: gestantesConFUM.length > 0 ? (captacionTemprana / gestantesConFUM.length) * 100 : 0,
      tipo: 'porcentaje'
    };
  }

  async calcularIndicadoresControles(whereGestantes) {
    const indicadores = [];
    
    // Obtener gestantes con controles
    const gestantesIds = await this.prisma.gestantes.findMany({
      where: whereGestantes,
      select: { id: true }
    });

    const ids = gestantesIds.map(g => g.id);
    const totalGestantes = ids.length;

    if (totalGestantes === 0) {
      return [];
    }

    // Contar gestantes con cada indicador usando consultas SQL directas
    const contadores = {
      micronutrientes: 0,
      vih: 0,
      hepatitisB: 0,
      sifilis: 0,
      nutricion: 0,
      odontologia: 0,
      ecografiaAneuploidias: 0,
      ecografiaAnatomico: 0
    };

    // Como los campos pueden no existir aún, usar consultas más seguras
    try {
      const resultados = await this.prisma.$queryRaw`
        SELECT 
          COUNT(DISTINCT CASE WHEN suministro_micronutrientes = true THEN gestante_id END) as micronutrientes,
          COUNT(DISTINCT CASE WHEN tamizaje_vih = true THEN gestante_id END) as vih,
          COUNT(DISTINCT CASE WHEN tamizaje_hepatitis_b = true THEN gestante_id END) as hepatitis_b,
          COUNT(DISTINCT CASE WHEN tamizaje_sifilis = true THEN gestante_id END) as sifilis,
          COUNT(DISTINCT CASE WHEN consulta_nutricion = true THEN gestante_id END) as nutricion,
          COUNT(DISTINCT CASE WHEN consulta_odontologia = true THEN gestante_id END) as odontologia,
          COUNT(DISTINCT CASE WHEN ecografia_aneuploidias = true THEN gestante_id END) as ecografia_aneuploidias,
          COUNT(DISTINCT CASE WHEN ecografia_detalle_anatomico = true THEN gestante_id END) as ecografia_anatomico
        FROM control_prenatal 
        WHERE gestante_id = ANY(${ids})
      `;

      if (resultados && resultados[0]) {
        const r = resultados[0];
        contadores.micronutrientes = parseInt(r.micronutrientes) || 0;
        contadores.vih = parseInt(r.vih) || 0;
        contadores.hepatitisB = parseInt(r.hepatitis_b) || 0;
        contadores.sifilis = parseInt(r.sifilis) || 0;
        contadores.nutricion = parseInt(r.nutricion) || 0;
        contadores.odontologia = parseInt(r.odontologia) || 0;
        contadores.ecografiaAneuploidias = parseInt(r.ecografia_aneuploidias) || 0;
        contadores.ecografiaAnatomico = parseInt(r.ecografia_anatomico) || 0;
      }
    } catch (error) {
      console.log('⚠️ Campos de reportes no existen aún, devolviendo valores por defecto');
      // Los contadores ya están inicializados en 0
    }

    indicadores.push(
      {
        nombre: 'Suministro de micronutrientes',
        valor: contadores.micronutrientes,
        total: totalGestantes,
        porcentaje: (contadores.micronutrientes / totalGestantes) * 100,
        tipo: 'porcentaje'
      },
      {
        nombre: 'Tamizaje para VIH',
        valor: contadores.vih,
        total: totalGestantes,
        porcentaje: (contadores.vih / totalGestantes) * 100,
        tipo: 'porcentaje'
      },
      {
        nombre: 'Tamizaje para Hepatitis B',
        valor: contadores.hepatitisB,
        total: totalGestantes,
        porcentaje: (contadores.hepatitisB / totalGestantes) * 100,
        tipo: 'porcentaje'
      },
      {
        nombre: 'Tamizaje para Sífilis',
        valor: contadores.sifilis,
        total: totalGestantes,
        porcentaje: (contadores.sifilis / totalGestantes) * 100,
        tipo: 'porcentaje'
      },
      {
        nombre: 'Consulta por nutrición',
        valor: contadores.nutricion,
        total: totalGestantes,
        porcentaje: (contadores.nutricion / totalGestantes) * 100,
        tipo: 'porcentaje'
      },
      {
        nombre: 'Consulta por odontología',
        valor: contadores.odontologia,
        total: totalGestantes,
        porcentaje: (contadores.odontologia / totalGestantes) * 100,
        tipo: 'porcentaje'
      },
      {
        nombre: 'Ecografía de tamizaje de aneuploidías',
        valor: contadores.ecografiaAneuploidias,
        total: totalGestantes,
        porcentaje: (contadores.ecografiaAneuploidias / totalGestantes) * 100,
        tipo: 'porcentaje'
      },
      {
        nombre: 'Ecografía de detalle anatómico',
        valor: contadores.ecografiaAnatomico,
        total: totalGestantes,
        porcentaje: (contadores.ecografiaAnatomico / totalGestantes) * 100,
        tipo: 'porcentaje'
      }
    );

    return indicadores;
  }

  async calcularVisitasDomiciliarias(whereGestantes) {
    const gestantesIds = await this.prisma.gestantes.findMany({
      where: whereGestantes,
      select: { id: true }
    });

    const ids = gestantesIds.map(g => g.id);
    let visitasCount = 0;

    try {
      const resultado = await this.prisma.$queryRaw`
        SELECT COUNT(DISTINCT gestante_id) as visitas
        FROM control_prenatal 
        WHERE gestante_id = ANY(${ids}) AND visita_domiciliaria = true
      `;
      
      if (resultado && resultado[0]) {
        visitasCount = parseInt(resultado[0].visitas) || 0;
      }
    } catch (error) {
      console.log('⚠️ Campo visita_domiciliaria no existe aún');
    }

    return {
      nombre: 'Casas visitadas con gestante captada',
      valor: visitasCount,
      total: visitasCount,
      porcentaje: 0,
      tipo: 'numero'
    };
  }

  async calcularIndicadoresDemograficos(whereGestantes) {
    const indicadores = [];

    let menores14 = 0;
    let conDiscapacidad = 0;
    let migrantes = 0;
    let poblacionesEtnicas = 0;
    let victimasConflicto = 0;

    try {
      // Gestantes menores de 14 años
      menores14 = await this.prisma.gestantes.count({
        where: {
          ...whereGestantes,
          edad: { lt: 14 }
        }
      });
    } catch (error) {
      // Campo edad no existe, calcular desde fecha_nacimiento
      const gestantesConFecha = await this.prisma.gestantes.findMany({
        where: whereGestantes,
        select: { fecha_nacimiento: true }
      });

      menores14 = gestantesConFecha.filter(g => {
        if (!g.fecha_nacimiento) return false;
        const edad = new Date().getFullYear() - g.fecha_nacimiento.getFullYear();
        return edad < 14;
      }).length;
    }

    try {
      // Gestantes con discapacidad
      conDiscapacidad = await this.prisma.gestantes.count({
        where: {
          ...whereGestantes,
          tiene_discapacidad: true
        }
      });
    } catch (error) {
      console.log('⚠️ Campo tiene_discapacidad no existe aún');
    }

    try {
      // Gestantes migrantes
      migrantes = await this.prisma.gestantes.count({
        where: {
          ...whereGestantes,
          es_migrante: true
        }
      });
    } catch (error) {
      console.log('⚠️ Campo es_migrante no existe aún');
    }

    try {
      // Gestantes de poblaciones étnicas
      poblacionesEtnicas = await this.prisma.gestantes.count({
        where: {
          ...whereGestantes,
          poblacion_etnica: { in: ['indigena', 'afro', 'palenquero'] }
        }
      });
    } catch (error) {
      console.log('⚠️ Campo poblacion_etnica no existe aún');
    }

    try {
      // Gestantes víctimas del conflicto armado
      victimasConflicto = await this.prisma.gestantes.count({
        where: {
          ...whereGestantes,
          victima_conflicto_armado: true
        }
      });
    } catch (error) {
      console.log('⚠️ Campo victima_conflicto_armado no existe aún');
    }

    indicadores.push(
      {
        nombre: 'Gestantes menores de 14 años',
        valor: menores14,
        total: menores14,
        porcentaje: 0,
        tipo: 'numero'
      },
      {
        nombre: 'Gestantes con discapacidad',
        valor: conDiscapacidad,
        total: conDiscapacidad,
        porcentaje: 0,
        tipo: 'numero'
      },
      {
        nombre: 'Gestantes migrantes',
        valor: migrantes,
        total: migrantes,
        porcentaje: 0,
        tipo: 'numero'
      },
      {
        nombre: 'Gestantes de poblaciones étnicas',
        valor: poblacionesEtnicas,
        total: poblacionesEtnicas,
        porcentaje: 0,
        tipo: 'numero'
      },
      {
        nombre: 'Gestantes víctimas del conflicto armado',
        valor: victimasConflicto,
        total: victimasConflicto,
        porcentaje: 0,
        tipo: 'numero'
      }
    );

    return indicadores;
  }

  async obtenerMunicipios() {
    return await this.prisma.municipios.findMany({
      select: {
        id: true,
        nombre: true
      },
      orderBy: {
        nombre: 'asc'
      }
    });
  }

  async obtenerMadrinas(municipioId) {
    const where = {
      rol: 'MADRINA',
      activo: true
    };

    if (municipioId) {
      where.municipio_id = municipioId;
    }

    return await this.prisma.usuarios.findMany({
      where,
      select: {
        id: true,
        nombre: true,
        email: true
      },
      orderBy: {
        nombre: 'asc'
      }
    });
  }
}

module.exports = ReportesService;