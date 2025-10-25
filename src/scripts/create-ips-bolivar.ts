import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createIPS() {
  try {
    console.log('🏥 Creando IPS de Bolívar...');

    // Lista de IPS de Bolívar
    const ips = [
      { 
        nombre: 'Clínica Maternidad Bolívar', 
        nit: '900123456-1', 
        codigo_habilitacion: 'IPS001',
        direccion: 'Calle 50 #45-67, Cartagena',
        telefono: '6051234567',
        nivel_atencion: 'terciario',
        servicios: ['Ginecología', 'Obstetricia', 'Pediatría', 'Neonatología'],
        municipio_id: '13001', // Cartagena
        coordenadas: { latitud: 10.3910, longitud: -75.4794 }
      },
      { 
        nombre: 'Hospital Universitario de Cartagena', 
        nit: '900123457-2', 
        codigo_habilitacion: 'IPS002',
        direccion: 'Carrera 30 #30-40, Cartagena',
        telefono: '6051234568',
        nivel_atencion: 'terciario',
        servicios: ['Ginecología', 'Obstetricia', 'Medicina General', 'Urgencias'],
        municipio_id: '13001', // Cartagena
        coordenadas: { latitud: 10.4050, longitud: -75.4850 }
      },
      { 
        nombre: 'IPS Salud Mamona', 
        nit: '900123458-3', 
        codigo_habilitacion: 'IPS003',
        direccion: 'Calle 20 #15-25, Magangué',
        telefono: '6051234569',
        nivel_atencion: 'secundario',
        servicios: ['Medicina General', 'Ginecología', 'Obstetricia'],
        municipio_id: '13470', // Magangué
        coordenadas: { latitud: 9.2470, longitud: -74.7710 }
      },
      { 
        nombre: 'Hospital San Juan de Dios', 
        nit: '900123459-4', 
        codigo_habilitacion: 'IPS004',
        direccion: 'Carrera 15 #10-20, El Carmen de Bolívar',
        telefono: '6051234570',
        nivel_atencion: 'secundario',
        servicios: ['Medicina General', 'Pediatría', 'Urgencias'],
        municipio_id: '13847', // El Carmen de Bolívar
        coordenadas: { latitud: 9.4410, longitud: -74.9410 }
      },
      { 
        nombre: 'IPS María la Baja', 
        nit: '900123460-5', 
        codigo_habilitacion: 'IPS005',
        direccion: 'Calle 10 #5-15, María la Baja',
        telefono: '6051234571',
        nivel_atencion: 'primario',
        servicios: ['Medicina General', 'Consultas externas'],
        municipio_id: '13445', // María la Baja
        coordenadas: { latitud: 9.3170, longitud: -74.8370 }
      },
      { 
        nombre: 'IPS Turbaco', 
        nit: '900123461-6', 
        codigo_habilitacion: 'IPS006',
        direccion: 'Carrera 25 #15-30, Turbaco',
        telefono: '6051234572',
        nivel_atencion: 'secundario',
        servicios: ['Medicina General', 'Ginecología', 'Consultas externas'],
        municipio_id: '13880', // Turbaco
        coordenadas: { latitud: 10.2850, longitud: -75.4450 }
      },
      { 
        nombre: 'IPS Arjona', 
        nit: '900123462-7', 
        codigo_habilitacion: 'IPS007',
        direccion: 'Calle 35 #20-25, Arjona',
        telefono: '6051234573',
        nivel_atencion: 'primario',
        servicios: ['Medicina General', 'Consultas externas'],
        municipio_id: '13073', // Arjona
        coordenadas: { latitud: 10.2750, longitud: -75.3350 }
      },
      { 
        nombre: 'Hospital San Rafael', 
        nit: '900123463-8', 
        codigo_habilitacion: 'IPS008',
        direccion: 'Carrera 10 #5-15, San Juan Nepomuceno',
        telefono: '6051234574',
        nivel_atencion: 'primario',
        servicios: ['Medicina General', 'Consultas externas'],
        municipio_id: '15320', // San Juan Nepomuceno
        coordenadas: { latitud: 9.9370, longitud: -75.0870 }
      },
      { 
        nombre: 'IPS San Jacinto', 
        nit: '900123464-9', 
        codigo_habilitacion: 'IPS009',
        direccion: 'Calle 20 #10-20, San Jacinto',
        telefono: '6051234575',
        nivel_atencion: 'primario',
        servicios: ['Medicina General', 'Consultas externas'],
        municipio_id: '15294', // San Jacinto
        coordenadas: { latitud: 9.8450, longitud: -75.1370 }
      },
      { 
        nombre: 'IPS Mompox', 
        nit: '900123465-0', 
        codigo_habilitacion: 'IPS010',
        direccion: 'Carrera 15 #8-12, Mompox',
        telefono: '6051234576',
        nivel_atencion: 'secundario',
        servicios: ['Medicina General', 'Ginecología', 'Consultas externas'],
        municipio_id: '14720', // Mompox
        coordenadas: { latitud: 9.2370, longitud: -74.4270 }
      }
    ];

    let creadas = 0;
    let yaExisten = 0;

    for (const ipsData of ips) {
      // Verificar si ya existe
      const existing = await prisma.iPS.findFirst({
        where: { nombre: ipsData.nombre }
      });

      if (!existing) {
        // Buscar el municipio por código DANE
        const municipio = await prisma.municipio.findFirst({
          where: { codigo_dane: ipsData.municipio_id }
        });

        if (!municipio) {
          console.log(`⚠️ No se encontró municipio con código DANE ${ipsData.municipio_id}, omitiendo IPS ${ipsData.nombre}`);
          continue;
        }

        // Preparar coordenadas si se proporcionaron
        let coordenadas = null;
        if (ipsData.coordenadas) {
          coordenadas = {
            type: 'Point',
            coordinates: [ipsData.coordenadas.longitud, ipsData.coordenadas.latitud]
          };
        }

        await prisma.iPS.create({
          data: {
            nombre: ipsData.nombre,
            nit: ipsData.nit,
            direccion: ipsData.direccion,
            telefono: ipsData.telefono,
            municipio_id: municipio.id,
            activo: true,
            fecha_creacion: new Date(),
            fecha_actualizacion: new Date()
          }
        });
        console.log(`✅ Creada: ${ipsData.nombre} en ${municipio.nombre}`);
        creadas++;
      } else {
        console.log(`⚠️ Ya existe: ${ipsData.nombre}`);
        yaExisten++;
      }
    }

    console.log('\n📊 Resumen:');
    console.log(`✅ IPS creadas: ${creadas}`);
    console.log(`⚠️ IPS que ya existían: ${yaExisten}`);
    console.log(`📍 Total IPS: ${creadas + yaExisten}`);

  } catch (error) {
    console.error('❌ Error creando IPS:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createIPS()
  .then(() => {
    console.log('✅ Script completado');
    process.exit(0);
  })
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  });