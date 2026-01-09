import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testSimple() {
  try {
    console.log('🧪 Verificando municipios importados...');

    // Contar municipios importados
    const totalMunicipios = await prisma.municipio.count();
    console.log(`📊 Total municipios en BD: ${totalMunicipios}`);

    // Obtener algunos municipios
    const municipios = await prisma.municipio.findMany({
      take: 10,
      select: {
        nombre: true,
        codigo_dane: true,
        departamento: true,
        coordenadas: true,
        activo: true
      }
    });

    console.log('\n📍 Municipios importados:');
    municipios.forEach((municipio, index) => {
      console.log(`${index + 1}. ${municipio.nombre} (${municipio.codigo_dane})`);
      console.log(`   Departamento: ${municipio.departamento}`);
      console.log(`   Coordenadas: ${JSON.stringify(municipio.coordenadas)}`);
      console.log(`   Activo: ${municipio.activo ? '✅' : '❌'}`);
      console.log('');
    });

    // Verificar municipios de Bolívar específicamente
    const bolivarCount = await prisma.municipio.count({
      where: {
        departamento: 'BOLÍVAR'
      }
    });
    console.log(`🏛️ Municipios de Bolívar: ${bolivarCount}`);

    console.log('\n🎉 Verificación completada!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSimple();
