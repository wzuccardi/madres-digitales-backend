const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function analizarGestantesSinFUM() {
  try {
    console.log('=== ANÁLISIS DE GESTANTES SIN FUM ===\n');

    // 1. Contar gestantes sin FUM
    const totalSinFUM = await prisma.$queryRaw`
      SELECT COUNT(*) as total
      FROM gestantes
      WHERE activa = true
        AND fecha_ultima_menstruacion IS NULL
    `;
    console.log('Total de gestantes activas sin FUM:', totalSinFUM[0].total);

    // 2. Gestantes sin FUM pero con controles (PRIORIDAD ALTA)
    const conControles = await prisma.$queryRaw`
      SELECT 
        g.id,
        g.nombre,
        g.documento,
        g.telefono,
        COUNT(c.id) as total_controles,
        MIN(c.fecha_control) as primer_control,
        MAX(c.fecha_control) as ultimo_control
      FROM gestantes g
      INNER JOIN control_prenatal c ON c.gestante_id = g.id
      WHERE g.activa = true
        AND g.fecha_ultima_menstruacion IS NULL
      GROUP BY g.id, g.nombre, g.documento, g.telefono
      ORDER BY total_controles DESC
      LIMIT 20
    `;

    console.log('\n=== PRIORIDAD ALTA: Gestantes sin FUM pero con controles ===');
    console.log(`Total: ${conControles.length} gestantes\n`);
    if (conControles.length > 0) {
      console.table(conControles);
    } else {
      console.log('✓ No hay gestantes con controles sin FUM');
    }

    // 3. Resumen por municipio
    const porMunicipio = await prisma.$queryRaw`
      SELECT 
        m.nombre as municipio,
        COUNT(g.id) as gestantes_sin_fum,
        SUM(CASE WHEN EXISTS(SELECT 1 FROM control_prenatal WHERE gestante_id = g.id) THEN 1 ELSE 0 END) as con_controles,
        SUM(CASE WHEN NOT EXISTS(SELECT 1 FROM control_prenatal WHERE gestante_id = g.id) THEN 1 ELSE 0 END) as sin_controles
      FROM gestantes g
      LEFT JOIN municipios m ON g.municipio_id = m.id
      WHERE g.activa = true
        AND g.fecha_ultima_menstruacion IS NULL
      GROUP BY m.nombre
      ORDER BY gestantes_sin_fum DESC
      LIMIT 10
    `;

    console.log('\n=== Resumen por Municipio (Top 10) ===');
    if (porMunicipio.length > 0) {
      console.table(porMunicipio);
    }

    // 4. Estadísticas generales
    const estadisticas = await prisma.$queryRaw`
      SELECT 
        COUNT(*) as total_gestantes_activas,
        SUM(CASE WHEN fecha_ultima_menstruacion IS NOT NULL THEN 1 ELSE 0 END) as con_fum,
        SUM(CASE WHEN fecha_ultima_menstruacion IS NULL THEN 1 ELSE 0 END) as sin_fum,
        ROUND(100.0 * SUM(CASE WHEN fecha_ultima_menstruacion IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*), 2) as porcentaje_con_fum
      FROM gestantes
      WHERE activa = true
    `;

    console.log('\n=== Estadísticas Generales ===');
    console.table(estadisticas);

    // 5. Listar primeras 10 gestantes sin FUM
    const listado = await prisma.$queryRaw`
      SELECT 
        g.id,
        g.nombre,
        g.documento,
        g.telefono,
        g.direccion,
        m.nombre as municipio,
        g.fecha_probable_parto,
        g.riesgo_alto,
        (SELECT COUNT(*) FROM control_prenatal WHERE gestante_id = g.id) as total_controles
      FROM gestantes g
      LEFT JOIN municipios m ON g.municipio_id = m.id
      WHERE g.activa = true
        AND g.fecha_ultima_menstruacion IS NULL
      ORDER BY g.fecha_creacion DESC
      LIMIT 10
    `;

    console.log('\n=== Primeras 10 Gestantes sin FUM (más recientes) ===');
    if (listado.length > 0) {
      console.table(listado);
    }

    console.log('\n=== RECOMENDACIONES ===');
    console.log('1. Priorizar gestantes con controles registrados');
    console.log('2. Usar la funcionalidad de edición en la app para agregar FUM');
    console.log('3. Capacitar a las madrinas sobre la importancia de la FUM');
    console.log('4. La FUM es necesaria para calcular correctamente las semanas de gestación');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

analizarGestantesSinFUM();
