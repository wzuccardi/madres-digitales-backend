import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createMunicipios() {
  try {
    console.log('🏛️ Creando municipios de prueba para Bolívar...');

    // Municipios de Bolívar con coordenadas aproximadas
    const municipios = [
      { nombre: 'CARTAGENA DE INDIAS', codigo_dane: '13001', coordenadas: [-75.496269, 10.385126] },
      { nombre: 'MAGANGUÉ', codigo_dane: '13470', coordenadas: [-74.781389, 9.241944] },
      { nombre: 'TURBACO', codigo_dane: '13880', coordenadas: [-75.423056, 10.317222] },
      { nombre: 'ARJONA', codigo_dane: '13073', coordenadas: [-75.421389, 10.273056] },
      { nombre: 'MARIA LA BAJA', codigo_dane: '13445', coordenadas: [-74.923056, 9.594444] }
    ];

    for (const municipio of municipios) {
      // Verificar si ya existe
      const existing = await prisma.municipio.findFirst({
        where: { codigo_dane: municipio.codigo_dane }
      });

      if (!existing) {
        await prisma.municipio.create({
          data: {
            codigo_dane: municipio.codigo_dane,
            nombre: municipio.nombre,
            departamento: 'BOLÍVAR',
            activo: true,
            fecha_creacion: new Date(),
            fecha_actualizacion: new Date()
          }
        });
        console.log(`✅ Creado: ${municipio.nombre}`);
      } else {
        console.log(`⚠️ Ya existe: ${municipio.nombre}`);
      }
    }

    console.log('\n🎉 Municipios creados exitosamente!');

    // Mostrar municipios creados
    const total = await prisma.municipio.count({
      where: { departamento: 'BOLÍVAR' }
    });
    console.log(`📊 Total municipios de Bolívar en BD: ${total}`);

  } catch (error) {
    console.error('❌ Error creando municipios:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createMunicipios()
  .then(() => {
    console.log('✅ Script completado');
    process.exit(0);
  })
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  });