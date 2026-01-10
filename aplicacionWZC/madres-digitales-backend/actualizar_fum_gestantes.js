const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function actualizarFUMGestantes() {
  console.log('=== ACTUALIZANDO FUM DE GESTANTES ===\n');

  try {
    // 1. Obtener gestantes sin FUM pero con controles
    const gestantesSinFUM = await prisma.$queryRaw`
      SELECT DISTINCT
        g.id,
        g.nombre,
        g.documento,
        MIN(c.fecha_control) as primer_control,
        COUNT(c.id) as total_controles
      FROM gestantes g
      INNER JOIN control_prenatal c ON c.gestante_id = g.id
      WHERE g.activa = true
        AND g.fecha_ultima_menstruacion IS NULL
      GROUP BY g.id, g.nombre, g.documento
      ORDER BY total_controles DESC
    `;

    console.log(`📊 Gestantes sin FUM con controles: ${gestantesSinFUM.length}`);

    if (gestantesSinFUM.length === 0) {
      console.log('✅ No hay gestantes sin FUM que requieran actualización');
      return;
    }

    console.log('\n=== GESTANTES A ACTUALIZAR ===');
    gestantesSinFUM.forEach((g, index) => {
      console.log(`${index + 1}. ${g.nombre} (${g.documento}) - ${g.total_controles} controles - Primer control: ${g.primer_control.toISOString().split('T')[0]}`);
    });

    // 2. Para cada gestante, calcular una FUM estimada
    let actualizadas = 0;
    
    for (const gestante of gestantesSinFUM) {
      try {
        // Calcular FUM estimada: primer_control - semanas_promedio_embarazo
        // Asumimos que el primer control fue alrededor de las 12 semanas (promedio)
        const primerControl = new Date(gestante.primer_control);
        const fumEstimada = new Date(primerControl);
        fumEstimada.setDate(fumEstimada.getDate() - (12 * 7)); // Restar 12 semanas

        // Actualizar la gestante
        await prisma.gestantes.update({
          where: { id: gestante.id },
          data: {
            fecha_ultima_menstruacion: fumEstimada
          }
        });

        console.log(`✅ ${gestante.nombre}: FUM estimada = ${fumEstimada.toISOString().split('T')[0]}`);
        actualizadas++;

      } catch (error) {
        console.error(`❌ Error actualizando ${gestante.nombre}:`, error.message);
      }
    }

    console.log(`\n📊 RESUMEN:`);
    console.log(`- Gestantes procesadas: ${gestantesSinFUM.length}`);
    console.log(`- Gestantes actualizadas: ${actualizadas}`);
    console.log(`- Errores: ${gestantesSinFUM.length - actualizadas}`);

    // 3. Verificar el resultado
    const verificacion = await prisma.$queryRaw`
      SELECT 
        COUNT(*) as total_gestantes_activas,
        SUM(CASE WHEN fecha_ultima_menstruacion IS NOT NULL THEN 1 ELSE 0 END) as con_fum,
        SUM(CASE WHEN fecha_ultima_menstruacion IS NULL THEN 1 ELSE 0 END) as sin_fum,
        ROUND(100.0 * SUM(CASE WHEN fecha_ultima_menstruacion IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*), 2) as porcentaje_con_fum
      FROM gestantes
      WHERE activa = true
    `;

    console.log('\n=== ESTADÍSTICAS DESPUÉS DE LA ACTUALIZACIÓN ===');
    console.table(verificacion);

    console.log('\n✅ Actualización completada exitosamente');
    console.log('\n📝 NOTA: Las FUM fueron estimadas restando 12 semanas del primer control.');
    console.log('   Se recomienda que las madrinas verifiquen y corrijan estas fechas cuando sea posible.');

  } catch (error) {
    console.error('❌ Error en la actualización:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script
actualizarFUMGestantes();