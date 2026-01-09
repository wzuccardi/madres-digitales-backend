const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verificarYCorregir24Semanas() {
  try {
    console.log('=== VERIFICANDO CONTROLES CON 24 SEMANAS ===\n');

    // Consulta 1: Ver controles con 24 semanas
    const controles24 = await prisma.$queryRaw`
      SELECT 
        c.id,
        c.gestante_id,
        g.nombre as gestante_nombre,
        g.fecha_ultima_menstruacion,
        c.fecha_control,
        c.semanas_gestacion,
        c.fecha_creacion,
        FLOOR(EXTRACT(DAY FROM (c.fecha_control - g.fecha_ultima_menstruacion)) / 7) as semanas_reales_calculadas
      FROM control_prenatal c
      INNER JOIN gestantes g ON c.gestante_id = g.id
      WHERE c.semanas_gestacion = 24
      ORDER BY c.fecha_creacion DESC
      LIMIT 10
    `;

    console.log('Primeros 10 controles con 24 semanas:');
    console.table(controles24);

    // Consulta 2: Contar total
    const total = await prisma.$queryRaw`
      SELECT COUNT(*) as total
      FROM control_prenatal
      WHERE semanas_gestacion = 24
    `;
    console.log('\nTotal de controles con 24 semanas:', total[0].total);

    // Consulta 3: Ver cuántos son correctos vs incorrectos
    const analisis = await prisma.$queryRaw`
      SELECT 
        c.semanas_gestacion,
        FLOOR(EXTRACT(DAY FROM (c.fecha_control - g.fecha_ultima_menstruacion)) / 7) as semanas_calculadas,
        COUNT(*) as cantidad,
        CASE 
          WHEN c.semanas_gestacion = FLOOR(EXTRACT(DAY FROM (c.fecha_control - g.fecha_ultima_menstruacion)) / 7)
          THEN 'CORRECTO' 
          ELSE 'INCORRECTO (hardcodeado)'
        END as estado
      FROM control_prenatal c
      INNER JOIN gestantes g ON c.gestante_id = g.id
      WHERE c.semanas_gestacion = 24
        AND g.fecha_ultima_menstruacion IS NOT NULL
      GROUP BY 
        c.semanas_gestacion,
        FLOOR(EXTRACT(DAY FROM (c.fecha_control - g.fecha_ultima_menstruacion)) / 7),
        estado
      ORDER BY cantidad DESC
    `;

    console.log('\nAnálisis de controles con 24 semanas:');
    console.table(analisis);

    // Consulta 4: Contar cuántos necesitan corrección
    const aCorregir = await prisma.$queryRaw`
      SELECT COUNT(*) as controles_a_corregir
      FROM control_prenatal c
      INNER JOIN gestantes g ON c.gestante_id = g.id
      WHERE c.semanas_gestacion = 24
        AND c.semanas_gestacion != FLOOR(EXTRACT(DAY FROM (c.fecha_control - g.fecha_ultima_menstruacion)) / 7)
        AND g.fecha_ultima_menstruacion IS NOT NULL
    `;

    console.log('\n=== CORRECCIÓN ===');
    console.log('Controles que necesitan corrección:', aCorregir[0].controles_a_corregir);

    if (parseInt(aCorregir[0].controles_a_corregir) > 0) {
      console.log('\nAplicando corrección...');
      
      // Actualizar los controles incorrectos
      const resultado = await prisma.$executeRaw`
        UPDATE control_prenatal c
        SET semanas_gestacion = FLOOR(EXTRACT(DAY FROM (c.fecha_control - g.fecha_ultima_menstruacion)) / 7)
        FROM gestantes g
        WHERE c.gestante_id = g.id
          AND c.semanas_gestacion = 24
          AND c.semanas_gestacion != FLOOR(EXTRACT(DAY FROM (c.fecha_control - g.fecha_ultima_menstruacion)) / 7)
          AND g.fecha_ultima_menstruacion IS NOT NULL
      `;

      console.log(`✓ Se corrigieron ${resultado} controles`);

      // Verificar después de la corrección
      const verificacion = await prisma.$queryRaw`
        SELECT 
          COUNT(*) as total_24_semanas,
          SUM(CASE 
            WHEN c.semanas_gestacion = FLOOR(EXTRACT(DAY FROM (c.fecha_control - g.fecha_ultima_menstruacion)) / 7)
            THEN 1 
            ELSE 0 
          END) as correctos,
          SUM(CASE 
            WHEN c.semanas_gestacion != FLOOR(EXTRACT(DAY FROM (c.fecha_control - g.fecha_ultima_menstruacion)) / 7)
            THEN 1 
            ELSE 0 
          END) as incorrectos
        FROM control_prenatal c
        INNER JOIN gestantes g ON c.gestante_id = g.id
        WHERE c.semanas_gestacion = 24
          AND g.fecha_ultima_menstruacion IS NOT NULL
      `;

      console.log('\n=== VERIFICACIÓN POST-CORRECCIÓN ===');
      console.table(verificacion);
    } else {
      console.log('\n✓ Todos los controles con 24 semanas son correctos. No se necesita corrección.');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarYCorregir24Semanas();
