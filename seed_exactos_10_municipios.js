// Script para insertar EXACTAMENTE los 10 municipios solicitados
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// EXACTAMENTE los 10 municipios que me suministraste
const municipiosExactos = [
  {
    id: '13052',
    codigo_dane: '13052',
    nombre: 'ARJONA',
    departamento: 'BOLÍVAR',
    latitud: 10.25666,
    longitud: -75.344332,
    activo: true
  },
  {
    id: '13222',
    codigo_dane: '13222',
    nombre: 'CLEMENCIA',
    departamento: 'BOLÍVAR',
    latitud: 10.567452,
    longitud: -75.328469,
    activo: true
  },
  {
    id: '13244',
    codigo_dane: '13244',
    nombre: 'EL CARMEN DE BOLÍVAR',
    departamento: 'BOLÍVAR',
    latitud: 9.718653,
    longitud: -75.121178,
    activo: true
  },
  {
    id: '13430',
    codigo_dane: '13430',
    nombre: 'MAGANGUÉ',
    departamento: 'BOLÍVAR',
    latitud: 9.263799,
    longitud: -74.766742,
    activo: true
  },
  {
    id: '13433',
    codigo_dane: '13433',
    nombre: 'MAHATES',
    departamento: 'BOLÍVAR',
    latitud: 10.233285,
    longitud: -75.191643,
    activo: true
  },
  {
    id: '13442',
    codigo_dane: '13442',
    nombre: 'MARÍA LA BAJA',
    departamento: 'BOLÍVAR',
    latitud: 9.982402,
    longitud: -75.300516,
    activo: true
  },
  {
    id: '13468',
    codigo_dane: '13468',
    nombre: 'SANTA CRUZ DE MOMPOX',
    departamento: 'BOLÍVAR',
    latitud: 9.244241,
    longitud: -74.42818,
    activo: true
  },
  {
    id: '13657',
    codigo_dane: '13657',
    nombre: 'SAN JUAN NEPOMUCENO',
    departamento: 'BOLÍVAR',
    latitud: 9.953751,
    longitud: -75.081761,
    activo: true
  },
  {
    id: '13673',
    codigo_dane: '13673',
    nombre: 'SANTA CATALINA',
    departamento: 'BOLÍVAR',
    latitud: 10.605294,
    longitud: -75.287855,
    activo: true
  },
  {
    id: '13838',
    codigo_dane: '13838',
    nombre: 'TURBANÁ',
    departamento: 'BOLÍVAR',
    latitud: 10.274585,
    longitud: -75.44265,
    activo: true
  }
];

async function resetExactos10Municipios() {
  try {
    console.log('🧹 Limpiando tabla de municipios...');

    // 1. Eliminar TODOS los municipios
    const deletedCount = await prisma.municipios.deleteMany({});
    console.log(`✅ Eliminados ${deletedCount.count} municipios existentes`);

    // 2. Verificar que la tabla esté vacía
    const countAfterDelete = await prisma.municipios.count();
    console.log(`📊 Municipios en tabla después de limpiar: ${countAfterDelete}`);

    if (countAfterDelete > 0) {
      console.error('❌ ERROR: La tabla no quedó vacía!');
      return;
    }

    // 3. Insertar EXACTAMENTE los 10 municipios solicitados
    console.log('\n🏛️ Insertando los 10 municipios exactos...');
    
    let insertedCount = 0;
    for (const municipio of municipiosExactos) {
      try {
        const resultado = await prisma.municipios.create({
          data: {
            id: municipio.id,
            nombre: municipio.nombre,
            departamento: municipio.departamento,
            codigo_dane: municipio.codigo_dane,
            latitud: municipio.latitud,
            longitud: municipio.longitud,
            activo: municipio.activo,
            fecha_creacion: new Date(),
            fecha_actualizacion: new Date()
          }
        });

        console.log(`✅ ${insertedCount + 1}. ${municipio.nombre} - ${resultado.id}`);
        insertedCount++;
      } catch (error) {
        console.error(`❌ Error con ${municipio.nombre}:`, error.message);
      }
    }

    // 4. Verificar que tenemos exactamente 10
    const totalFinal = await prisma.municipios.count();
    const activosFinal = await prisma.municipios.count({ where: { activo: true } });

    console.log(`\n🎉 Proceso completado!`);
    console.log(`📊 Municipios insertados: ${insertedCount}`);
    console.log(`📊 Total en base de datos: ${totalFinal}`);
    console.log(`📊 Municipios activos: ${activosFinal}`);

    if (totalFinal !== 10) {
      console.error(`❌ ERROR: Se esperaban 10 municipios pero hay ${totalFinal}`);
    } else {
      console.log(`✅ CORRECTO: Exactamente 10 municipios como se solicitó`);
    }

    // 5. Mostrar la lista final
    const municipiosFinales = await prisma.municipios.findMany({
      orderBy: { nombre: 'asc' }
    });

    console.log(`\n📍 Lista final de municipios (${municipiosFinales.length}):`);
    municipiosFinales.forEach((mun, index) => {
      console.log(`${index + 1}. ${mun.nombre} (${mun.codigo_dane}) - Lat: ${mun.latitud}, Lng: ${mun.longitud}`);
    });

  } catch (error) {
    console.error('💥 Error general:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script
resetExactos10Municipios();