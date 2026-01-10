import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export interface FiltrosReporte {
  municipioId?: string;
  madrinaId?: string;
  fechaInicio?: Date;
  fechaFin?: Date;
}

export interface IndicadorReporte {
  nombre: string;
  valor: number;
  total: number;
  porcentaje: number;
  tipo: 'porcentaje' | 'numero';
}

export interface ReporteCompleto {
  indicadores: IndicadorReporte[];
  filtrosAplicados: FiltrosReporte;
  fechaGeneracion: Date;
  totalGestantes: number;
}

export class ReportesService {
  
  async generarReporteCompleto(filtros: FiltrosReporte): Promise<ReporteCompleto> {
    const whereGestantes = this.buildWhereClause(filtros);
    
    const totalGestantes = await prisma.gestantes.count({
      where: whereGestantes
    });

    const indicadores: IndicadorReporte[] = [];

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

  private buildWhereClause(filtros: FiltrosReporte) {
    const where: any = {
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

  private async calcularCaptacionTemprana(whereGestantes: any): Promise<IndicadorReporte> {
    const gestantesConFUM = await prisma.gestantes.findMany({
      where: {
        ...whereGestantes,
        fecha_ultima_menstruacion: { not: null },
        fecha_ingreso_control: { not: null }
      },
      select: {
        fecha_ultima_menstruacion: true,
        fecha_ingreso_control: true
      }
    });

    let captacionTemprana = 0;
    
    gestantesConFUM.forEach(gestante => {
      if (gestante.fecha_ultima_menstruacion && gestante.fecha_ingreso_control) {
        const diffTime = gestante.fecha_ingreso_control.getTime() - gestante.fecha_ultima_menstruacion.getTime();
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

  private async calcularIndicadoresControles(whereGestantes: any): Promise<IndicadorReporte[]> {
    const indicadores: IndicadorReporte[] = [];
    
    // Obtener gestantes con controles
    const gestantesIds = await prisma.gestantes.findMany({
      where: whereGestantes,
      select: { id: true }
    });

    const ids = gestantesIds.map(g => g.id);
    const totalGestantes = ids.length;

    if (totalGestantes === 0) {
      return [];
    }

    // Contar gestantes con cada indicador
    const controles = await prisma.control_prenatal.groupBy({
      by: ['gestante_id'],
      where: {
        gestante_id: { in: ids }
      },
      _max: {
        suministro_micronutrientes: true,
        tamizaje_vih: true,
        tamizaje_hepatitis_b: true,
        tamizaje_sifilis: true,
        consulta_nutricion: true,
        consulta_odontologia: true,
        ecografia_aneuploidias: true,
        ecografia_detalle_anatomico: true
      }
    });

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

    controles.forEach(control => {
      if (control._max.suministro_micronutrientes) contadores.micronutrientes++;
      if (control._max.tamizaje_vih) contadores.vih++;
      if (control._max.tamizaje_hepatitis_b) contadores.hepatitisB++;
      if (control._max.tamizaje_sifilis) contadores.sifilis++;
      if (control._max.consulta_nutricion) contadores.nutricion++;
      if (control._max.consulta_odontologia) contadores.odontologia++;
      if (control._max.ecografia_aneuploidias) contadores.ecografiaAneuploidias++;
      if (control._max.ecografia_detalle_anatomico) contadores.ecografiaAnatomico++;
    });

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

  private async calcularVisitasDomiciliarias(whereGestantes: any): Promise<IndicadorReporte> {
    const gestantesIds = await prisma.gestantes.findMany({
      where: whereGestantes,
      select: { id: true }
    });

    const ids = gestantesIds.map(g => g.id);

    const visitasCount = await prisma.control_prenatal.count({
      where: {
        gestante_id: { in: ids },
        visita_domiciliaria: true
      }
    });

    return {
      nombre: 'Casas visitadas con gestante captada',
      valor: visitasCount,
      total: visitasCount,
      porcentaje: 0,
      tipo: 'numero'
    };
  }

  private async calcularIndicadoresDemograficos(whereGestantes: any): Promise<IndicadorReporte[]> {
    const indicadores: IndicadorReporte[] = [];

    // Gestantes menores de 14 años
    const menores14 = await prisma.gestantes.count({
      where: {
        ...whereGestantes,
        edad: { lt: 14 }
      }
    });

    // Gestantes con discapacidad
    const conDiscapacidad = await prisma.gestantes.count({
      where: {
        ...whereGestantes,
        tiene_discapacidad: true
      }
    });

    // Gestantes migrantes
    const migrantes = await prisma.gestantes.count({
      where: {
        ...whereGestantes,
        es_migrante: true
      }
    });

    // Gestantes de poblaciones étnicas
    const poblacionesEtnicas = await prisma.gestantes.count({
      where: {
        ...whereGestantes,
        poblacion_etnica: { in: ['indigena', 'afro', 'palenquero'] }
      }
    });

    // Gestantes víctimas del conflicto armado
    const victimasConflicto = await prisma.gestantes.count({
      where: {
        ...whereGestantes,
        victima_conflicto_armado: true
      }
    });

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
    return await prisma.municipios.findMany({
      select: {
        id: true,
        nombre: true
      },
      orderBy: {
        nombre: 'asc'
      }
    });
  }

  async obtenerMadrinas(municipioId?: string) {
    const where: any = {
      rol: 'MADRINA',
      activo: true
    };

    if (municipioId) {
      where.municipio_id = municipioId;
    }

    return await prisma.usuarios.findMany({
      where,
      select: {
        id: true,
        nombre: true,
        apellido: true
      },
      orderBy: {
        nombre: 'asc'
      }
    });
  }
}

export const reportesService = new ReportesService();