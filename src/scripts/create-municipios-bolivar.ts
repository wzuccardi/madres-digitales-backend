import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createMunicipiosBolivar() {
  try {
    console.log('🏛️ Creando municipios de Bolívar...');

    // Lista de municipios de Bolívar con coordenadas aproximadas
    const municipios = [
      { nombre: 'ACHÍ', codigo_dane: '13001' },
      { nombre: 'ALTOS DEL ROSARIO', codigo_dane: '13030' },
      { nombre: 'ARJONA', codigo_dane: '13073' },
      { nombre: 'ARROZOBLANCO', codigo_dane: '13140' },
      { nombre: 'BARRANCAS', codigo_dane: '13188' },
      { nombre: 'CANTAGALLO', codigo_dane: '13244' },
      { nombre: 'CARTAGENA DE INDIAS', codigo_dane: '13001' },
      { nombre: 'CERETÉ', codigo_dane: '13268' },
      { nombre: 'CHALÁN', codigo_dane: '13573' },
      { nombre: 'CICUCO', codigo_dane: '13600' },
      { nombre: 'CLEMENCIA', codigo_dane: '13647' },
      { nombre: 'CÓRDOBA', codigo_dane: '13720' },
      { nombre: 'COTOS DE AURA', codigo_dane: '13740' },
      { nombre: 'EL CARMEN DE BOLÍVAR', codigo_dane: '13847' },
      { nombre: 'EL GUAMO', codigo_dane: '13880' },
      { nombre: 'EL PEÑÓN', codigo_dane: '13940' },
      { nombre: 'EL PASSO', codigo_dane: '13994' },
      { nombre: 'EL RETÉN', codigo_dane: '14047' },
      { nombre: 'EL ROBLE', codigo_dane: '14094' },
      { nombre: 'GAMBA', codigo_dane: '14140' },
      { nombre: 'HATILLO DE LOBA', codigo_dane: '14247' },
      { nombre: 'MAGANGUÉ', codigo_dane: '13470' },
      { nombre: 'MAHATES', codigo_dane: '14373' },
      { nombre: 'MARGARITA', codigo_dane: '14473' },
      { nombre: 'MARÍA LA BAJA', codigo_dane: '13445' },
      { nombre: 'MOMIL', codigo_dane: '14547' },
      { nombre: 'MONTECRISTO', codigo_dane: '14600' },
      { nombre: 'MORALES', codigo_dane: '14673' },
      { nombre: 'MOMPOX', codigo_dane: '14720' },
      { nombre: 'NOROSÍ', codigo_dane: '14773' },
      { nombre: 'OVEJAS', codigo_dane: '14847' },
      { nombre: 'PINILLOS', codigo_dane: '14947' },
      { nombre: 'REGIDOR', codigo_dane: '14994' },
      { nombre: 'RÍO VIEJO', codigo_dane: '15047' },
      { nombre: 'SAN CRISTÓBAL', codigo_dane: '15107' },
      { nombre: 'SAN ESTANISLAO', codigo_dane: '15140' },
      { nombre: 'SAN FERNANDO', codigo_dane: '15188' },
      { nombre: 'SAN JACINTO DEL CAUCA', codigo_dane: '15247' },
      { nombre: 'SAN JACINTO', codigo_dane: '15294' },
      { nombre: 'SAN JUAN NEPOMUCENO', codigo_dane: '15320' },
      { nombre: 'SAN MARTÍN DE LOBA', codigo_dane: '15373' },
      { nombre: 'SAN PABLO', codigo_dane: '15420' },
      { nombre: 'SAN PEDRO', codigo_dane: '15473' },
      { nombre: 'SANTA ANA', codigo_dane: '15520' },
      { nombre: 'SANTA CATALINA', codigo_dane: '15547' },
      { nombre: 'SANTA ROSA', codigo_dane: '15573' },
      { nombre: 'SANTA ROSA DEL SUR', codigo_dane: '15600' },
      { nombre: 'SIMITÍ', codigo_dane: '15647' },
      { nombre: 'SOPLAVIENTO', codigo_dane: '15673' },
      { nombre: 'SUAN', codigo_dane: '15720' },
      { nombre: 'TALAIGUA NUEVO', codigo_dane: '15740' },
      { nombre: 'TAMALAMEQUE', codigo_dane: '15773' },
      { nombre: 'TURBACO', codigo_dane: '13880' },
      { nombre: 'TURBANÁ', codigo_dane: '15847' },
      { nombre: 'VILLANUEVA', codigo_dane: '15880' },
      { nombre: 'ZAMBRANO', codigo_dane: '15940' }
    ];

    let creados = 0;
    let yaExisten = 0;

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
        creados++;
      } else {
        console.log(`⚠️ Ya existe: ${municipio.nombre}`);
        yaExisten++;
      }
    }

    console.log('\n📊 Resumen:');
    console.log(`✅ Municipios creados: ${creados}`);
    console.log(`⚠️ Municipios que ya existían: ${yaExisten}`);
    console.log(`📍 Total municipios de Bolívar: ${creados + yaExisten}`);

  } catch (error) {
    console.error('❌ Error creando municipios:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createMunicipiosBolivar()
  .then(() => {
    console.log('✅ Script completado');
    process.exit(0);
  })
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  });