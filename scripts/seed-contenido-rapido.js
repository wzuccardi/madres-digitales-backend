#!/usr/bin/env node

/**
 * Script rápido de seed para contenido educativo
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('\n🌱 SEED DE CONTENIDO EDUCATIVO\n');
  console.log('='.repeat(50));

  try {
    console.log('\n📚 Creando contenidos educativos...');
    
    const contenidos = await prisma.contenidos.createMany({
      data: [
        {
          id: 'contenido-001',
          titulo: 'Nutrición en el Embarazo',
          descripcion: 'Guía completa sobre nutrición durante el embarazo',
          categoria: 'NUTRICION',
          tipo: 'ARTICULO',
          url_contenido: 'https://example.com/nutricion-embarazo',
          activo: true,
          destacado: true,
        },
        {
          id: 'contenido-002',
          titulo: 'Ejercicios Seguros en el Embarazo',
          descripcion: 'Rutina de ejercicios recomendados durante el embarazo',
          categoria: 'EJERCICIO',
          tipo: 'VIDEO',
          url_contenido: 'https://example.com/ejercicios-embarazo',
          activo: true,
          destacado: true,
        },
        {
          id: 'contenido-003',
          titulo: 'Cuidado Personal y Higiene',
          descripcion: 'Recomendaciones de higiene y cuidado personal',
          categoria: 'CUIDADO_PERSONAL',
          tipo: 'GUIA',
          url_contenido: 'https://example.com/cuidado-personal',
          activo: true,
          destacado: false,
        },
        {
          id: 'contenido-004',
          titulo: 'Preparación para el Parto',
          descripcion: 'Información sobre el proceso del parto y preparación',
          categoria: 'PREPARACION_PARTO',
          tipo: 'ARTICULO',
          url_contenido: 'https://example.com/preparacion-parto',
          activo: true,
          destacado: true,
        },
        {
          id: 'contenido-005',
          titulo: 'Lactancia Materna',
          descripcion: 'Guía completa sobre lactancia materna',
          categoria: 'LACTANCIA',
          tipo: 'GUIA',
          url_contenido: 'https://example.com/lactancia',
          activo: true,
          destacado: true,
        },
        {
          id: 'contenido-006',
          titulo: 'Salud Mental en el Embarazo',
          descripcion: 'Cuidado de la salud mental durante el embarazo',
          categoria: 'SALUD_MENTAL',
          tipo: 'ARTICULO',
          url_contenido: 'https://example.com/salud-mental',
          activo: true,
          destacado: false,
        },
        {
          id: 'contenido-007',
          titulo: 'Desarrollo Fetal',
          descripcion: 'Información sobre el desarrollo del feto semana a semana',
          categoria: 'DESARROLLO_FETAL',
          tipo: 'INFOGRAFIA',
          url_contenido: 'https://example.com/desarrollo-fetal',
          activo: true,
          destacado: true,
        },
      ],
      skipDuplicates: true,
    });

    console.log(`✅ ${contenidos.count || 7} contenidos creados`);

    console.log('\n' + '='.repeat(50));
    console.log('\n✅ SEED DE CONTENIDO COMPLETADO\n');
    console.log('Categorías creadas:');
    console.log('  - NUTRICION');
    console.log('  - EJERCICIO');
    console.log('  - CUIDADO_PERSONAL');
    console.log('  - PREPARACION_PARTO');
    console.log('  - LACTANCIA');
    console.log('  - SALUD_MENTAL');
    console.log('  - DESARROLLO_FETAL');
    console.log('\n' + '='.repeat(50) + '\n');

  } catch (error) {
    console.error('❌ Error durante el seed:');
    console.error(error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

