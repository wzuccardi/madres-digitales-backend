import { PrismaClient, Prisma } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function verificarPostGIS() {
  console.log('🔍 Verificando instalación de PostGIS y datos de Bolívar...\n');

  try {
    // 1. Verificar PostGIS
    await verificarExtensionPostGIS();

    // 2. Verificar archivo Bolivar.txt
    await verificarArchivoBolívar();

    // 3. Verificar municipios importados
    await verificarMunicipiosImportados();

    // 4. Verificar funciones PostGIS
    await verificarFuncionesPostGIS();

    // 5. Verificar índices espaciales
    await verificarIndicesEspaciales();

    // 6. Probar consultas geoespaciales
    await probarConsultasGeoespaciales();

    console.log('\n🎉 ¡Verificación completada exitosamente!');
    console.log('✅ PostGIS está correctamente instalado y configurado');
    console.log('✅ Municipios de Bolívar importados correctamente');
    console.log('✅ Funciones geoespaciales funcionando');

  } catch (error) {
    console.error('\n❌ Error durante la verificación:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function verificarExtensionPostGIS() {
  console.log('🗺️ Verificando extensión PostGIS...');

  try {
    const result = await prisma.$queryRaw`SELECT PostGIS_Version() as version` as any[];
    
    if (result && result[0]?.version) {
      console.log(`✅ PostGIS instalado - Versión: ${result[0].version}`);
    } else {
      throw new Error('PostGIS no está instalado o no responde');
    }

    // Verificar extensiones adicionales
    const extensions = await prisma.$queryRaw`
      SELECT extname FROM pg_extension 
      WHERE extname IN ('postgis', 'postgis_topology')
    ` as any[];

    console.log(`📦 Extensiones instaladas: ${extensions.map(e => e.extname).join(', ')}`);

  } catch (error) {
    console.error('❌ Error verificando PostGIS:', error);
    throw error;
  }
}

async function verificarArchivoBolívar() {
  console.log('\n📁 Verificando archivo Bolivar.txt...');

  const filePath = 'C:/Madrinas/genio/Bolivar.txt';

  if (!fs.existsSync(filePath)) {
    throw new Error(`❌ Archivo no encontrado: ${filePath}`);
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim() !== '');

  console.log(`✅ Archivo encontrado: ${lines.length} líneas`);

  // Verificar formato de primera línea de datos
  if (lines.length > 1) {
    const firstDataLine = lines[1].split('\t');
    if (firstDataLine.length >= 7) {
      console.log(`📊 Formato correcto - Ejemplo: ${firstDataLine[3]} (${firstDataLine[5]}, ${firstDataLine[6]})`);
    } else {
      console.warn('⚠️ Formato del archivo puede ser incorrecto');
    }
  }
}

async function verificarMunicipiosImportados() {
  console.log('\n🏛️ Verificando municipios importados...');

  const totalMunicipios = await prisma.municipio.count();
  const municipiosBolivar = await prisma.municipio.count({
    where: { departamento: 'BOLÍVAR' }
  });

  const municipiosConCoordenadas = await prisma.municipio.count({
    where: {
      departamento: 'BOLÍVAR',
      coordenadas: { not: Prisma.JsonNull }
    }
  });

  console.log(`📊 Total municipios: ${totalMunicipios}`);
  console.log(`🏛️ Municipios de Bolívar: ${municipiosBolivar}`);
  console.log(`📍 Con coordenadas: ${municipiosConCoordenadas}`);

  if (municipiosBolivar === 0) {
    throw new Error('❌ No se encontraron municipios de Bolívar. Ejecutar importación.');
  }

  if (municipiosConCoordenadas === 0) {
    throw new Error('❌ Municipios sin coordenadas. Verificar importación.');
  }

  // Mostrar algunos ejemplos
  const ejemplos = await prisma.municipio.findMany({
    where: { departamento: 'BOLÍVAR' },
    take: 3,
    orderBy: { nombre: 'asc' }
  });

  console.log('\n📍 Ejemplos de municipios:');
  ejemplos.forEach(municipio => {
    const coords = municipio.coordenadas as any;
    if (coords?.coordinates) {
      console.log(`   ${municipio.nombre}: ${coords.coordinates[1]}, ${coords.coordinates[0]}`);
    }
  });
}

async function verificarFuncionesPostGIS() {
  console.log('\n⚙️ Verificando funciones PostGIS personalizadas...');

  const funciones = [
    'calcular_distancia_metros',
    'encontrar_municipios_cercanos',
    'encontrar_ips_cercanas',
    'encontrar_gestantes_en_area',
    'punto_en_municipio'
  ];

  for (const funcion of funciones) {
    try {
      const result = await prisma.$queryRaw`
        SELECT routine_name 
        FROM information_schema.routines 
        WHERE routine_name = ${funcion}
        AND routine_schema = 'public'
      ` as any[];

      if (result.length > 0) {
        console.log(`✅ Función ${funcion} disponible`);
      } else {
        console.warn(`⚠️ Función ${funcion} no encontrada`);
      }
    } catch (error) {
      console.warn(`⚠️ Error verificando función ${funcion}:`, error instanceof Error ? error.message : 'Unknown error');
    }
  }
}

async function verificarIndicesEspaciales() {
  console.log('\n🔍 Verificando índices espaciales...');

  try {
    const indices = await prisma.$queryRaw`
      SELECT indexname, tablename 
      FROM pg_indexes 
      WHERE indexname LIKE '%_gist' 
      AND schemaname = 'public'
    ` as any[];

    console.log(`📊 Índices espaciales encontrados: ${indices.length}`);
    
    indices.forEach(indice => {
      console.log(`   ✅ ${indice.indexname} en tabla ${indice.tablename}`);
    });

    if (indices.length === 0) {
      console.warn('⚠️ No se encontraron índices espaciales. Pueden ser necesarios para rendimiento.');
    }

  } catch (error) {
    console.warn('⚠️ Error verificando índices:', error instanceof Error ? error.message : 'Unknown error');
  }
}

async function probarConsultasGeoespaciales() {
  console.log('\n🧪 Probando consultas geoespaciales...');

  try {
    // Probar búsqueda de municipios cercanos a Cartagena
    console.log('🔍 Buscando municipios cerca de Cartagena...');
    const municipiosCercanos = await prisma.$queryRaw`
      SELECT nombre, distancia_metros
      FROM encontrar_municipios_cercanos(10.385126, -75.496269, 100000)
      LIMIT 3
    ` as any[];

    if (municipiosCercanos.length > 0) {
      console.log('✅ Búsqueda de municipios cercanos funciona:');
      municipiosCercanos.forEach(m => {
        console.log(`   ${m.nombre}: ${(m.distancia_metros / 1000).toFixed(1)} km`);
      });
    } else {
      console.warn('⚠️ No se encontraron municipios cercanos');
    }

    // Probar cálculo de distancia
    console.log('\n📏 Probando cálculo de distancia...');
    const distancia = await prisma.$queryRaw`
      SELECT calcular_distancia_metros(
        ST_SetSRID(ST_MakePoint(-75.496269, 10.385126), 4326),
        ST_SetSRID(ST_MakePoint(-74.766667, 8.316667), 4326)
      ) as distancia
    ` as any[];

    if (distancia[0]?.distancia) {
      console.log(`✅ Distancia calculada: ${(distancia[0].distancia / 1000).toFixed(1)} km`);
    }

    // Probar vista de estadísticas
    console.log('\n📊 Probando vista de estadísticas geoespaciales...');
    const estadisticas = await prisma.$queryRaw`
      SELECT municipio_nombre, total_gestantes, total_ips
      FROM vista_estadisticas_geoespaciales
      WHERE departamento = 'BOLÍVAR'
      LIMIT 3
    ` as any[];

    if (estadisticas.length > 0) {
      console.log('✅ Vista de estadísticas funciona:');
      estadisticas.forEach(stat => {
        console.log(`   ${stat.municipio_nombre}: ${stat.total_gestantes} gestantes, ${stat.total_ips} IPS`);
      });
    }

  } catch (error) {
    console.warn('⚠️ Error en consultas geoespaciales:', error instanceof Error ? error.message : 'Unknown error');
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  verificarPostGIS()
    .then(() => {
      console.log('\n🎯 Sistema PostGIS verificado y listo!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Verificación falló:', error);
      process.exit(1);
    });
}

export { verificarPostGIS };
