const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedData() {
  try {
    console.log('🌱 Iniciando inserción de datos de prueba...');

    // 1. Crear municipios
    const municipios = await prisma.municipios.createMany({
      data: [
        {
          id: 'mun_001',
          nombre: 'Cartagena',
          departamento: 'Bolívar',
          codigo_dane: '13001',
          latitud: 10.3910,
          longitud: -75.4794,
          poblacion: 1028736,
          activo: true
        },
        {
          id: 'mun_002', 
          nombre: 'Turbaco',
          departamento: 'Bolívar',
          codigo_dane: '13836',
          latitud: 10.3397,
          longitud: -75.4236,
          poblacion: 118000,
          activo: true
        }
      ],
      skipDuplicates: true
    });

    // 2. Crear IPS
    const ips = await prisma.ips.createMany({
      data: [
        {
          id: 'ips_001',
          nombre: 'Hospital Universitario del Caribe',
          nit: '800123456-1',
          telefono: '(5) 6698000',
          direccion: 'Calle 29 No. 50-50',
          municipio_id: 'mun_001',
          nivel: 'III',
          email: 'info@huc.gov.co',
          latitud: 10.4037,
          longitud: -75.5154,
          activo: true
        },
        {
          id: 'ips_002',
          nombre: 'Clínica MataSano',
          nit: '800987654-2',
          telefono: '(5) 6421000',
          direccion: 'Avenida Pedro de Heredia',
          municipio_id: 'mun_001',
          nivel: 'II',
          email: 'contacto@matasano.com',
          latitud: 10.3932,
          longitud: -75.4832,
          activo: true
        }
      ],
      skipDuplicates: true
    });

    // 3. Crear médicos
    const medicos = await prisma.medicos.createMany({
      data: [
        {
          id: 'med_001',
          nombre: 'Dr. Carlos Mendoza',
          documento: '12345678',
          telefono: '(5) 3001234567',
          especialidad: 'Ginecología y Obstetricia',
          email: 'carlos.mendoza@huc.gov.co',
          registro_medico: 'RM-12345',
          ips_id: 'ips_001',
          municipio_id: 'mun_001',
          activo: true
        },
        {
          id: 'med_002',
          nombre: 'Dra. María González',
          documento: '87654321',
          telefono: '(5) 3009876543',
          especialidad: 'Medicina Materno Fetal',
          email: 'maria.gonzalez@matasano.com',
          registro_medico: 'RM-54321',
          ips_id: 'ips_002',
          municipio_id: 'mun_001',
          activo: true
        }
      ],
      skipDuplicates: true
    });

    // 4. Crear controles prenatales
    const controles = await prisma.control_prenatal.createMany({
      data: [
        {
          id: 'ctrl_001',
          gestante_id: 'cmh1dudh10001ort4r7212qu4', // ID de gestante existente
          medico_id: 'med_001',
          fecha_control: new Date('2025-01-15'),
          semanas_gestacion: 16,
          peso: 65.5,
          altura_uterina: 16.0,
          presion_sistolica: 120,
          presion_diastolica: 80,
          frecuencia_cardiaca: 72,
          temperatura: 36.5,
          realizado: true,
          recomendaciones: 'Continuar con vitaminas prenatales',
          proximo_control: new Date('2025-02-15')
        },
        {
          id: 'ctrl_002',
          gestante_id: 'cmh1dudh10001ort4r7212qu4',
          medico_id: 'med_001',
          fecha_control: new Date('2025-02-15'),
          semanas_gestacion: 20,
          peso: 67.0,
          altura_uterina: 20.0,
          presion_sistolica: 115,
          presion_diastolica: 75,
          realizado: false,
          recomendaciones: 'Ecografía de control',
          proximo_control: new Date('2025-03-15')
        }
      ],
      skipDuplicates: true
    });

    // 5. Crear contenido educativo (comentado por problemas con enums)
    // const contenidos = await prisma.contenidos.createMany({...});

    console.log('✅ Datos de prueba insertados exitosamente:');
    console.log(`   - ${municipios.count} municipios`);
    console.log(`   - ${ips.count} IPS`);
    console.log(`   - ${medicos.count} médicos`);
    console.log(`   - ${controles.count} controles prenatales`);

  } catch (error) {
    console.error('❌ Error insertando datos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedData();