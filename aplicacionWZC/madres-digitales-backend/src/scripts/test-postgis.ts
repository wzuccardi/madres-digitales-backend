import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testPostGIS() {
  try {
    console.log('🧪 Probando PostGIS...');

    // Verificar que PostGIS está instalado
    const postgisVersion = await prisma.$queryRaw`SELECT PostGIS_Version() as version`;
    console.log('✅ PostGIS instalado:', postgisVersion);

    // Contar municipios importados
    const totalMunicipios = await prisma.municipio.count();
    console.log(`📊 Total municipios en BD: ${totalMunicipios}`);

    // Obtener algunos municipios con coordenadas
    const municipiosConCoordenadas = await prisma.municipio.findMany({
      take: 5,
      select: {
        nombre: true,
        codigo_dane: true,
        coordenadas: true
      }
    });

    console.log('\n📍 Municipios con coordenadas:');
    municipiosConCoordenadas.forEach(municipio => {
      console.log(`- ${municipio.nombre} (${municipio.codigo_dane}): ${JSON.stringify(municipio.coordenadas)}`);
    });

    // Probar consulta de distancia simple
    console.log('\n🗺️ Probando cálculo de distancia...');
    
    // Cartagena: -75.496269, 10.385126
    // Magangué: -74.766742, 9.263799
    const distancia = await prisma.$queryRaw`
      SELECT ST_Distance(
        ST_GeogFromText('POINT(-75.496269 10.385126)'),
        ST_GeogFromText('POINT(-74.766742 9.263799)')
      ) as distancia_metros
    `;
    
    console.log('📏 Distancia Cartagena-Magangué:', distancia);

    console.log('\n🎉 PostGIS funcionando correctamente!');

  } catch (error) {
    console.error('❌ Error probando PostGIS:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPostGIS();
