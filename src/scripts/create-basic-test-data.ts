import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Creando datos básicos de prueba para Madres Digitales...');

  try {
    // Obtener algunos municipios de Bolívar para las pruebas
    const municipios = await prisma.municipio.findMany({
      where: {
        departamento: 'BOLÍVAR'
      },
      take: 3
    });

    if (municipios.length < 3) {
      throw new Error('No hay suficientes municipios en la base de datos. Ejecuta primero el script de creación de municipios.');
    }

    console.log(`📍 Usando municipios: ${municipios.map(m => m.nombre).join(', ')}`);

    // Crear médicos primero
    const hashedPassword = await bcrypt.hash('medico123', 10);
    
    const medicos = [];
    const nombresMedicos = [
      'Dr. Carlos Rodríguez',
      'Dra. María López',
      'Dr. Juan Pérez'
    ];

    for (let i = 0; i < 3; i++) {
      const email = `medico.bolivar${i + 1}@madresdigitales.com`;
      
      // Verificar si ya existe
      const existingMedico = await prisma.usuario.findFirst({
        where: { email }
      });
      
      if (!existingMedico) {
        const medico = await prisma.usuario.create({
          data: {
            email,
            password_hash: hashedPassword,
            nombre: nombresMedicos[i],
            telefono: `300555556${i}`,
            rol: 'medico',
            activo: true,
            municipio_id: municipios[i].id,
          }
        });
        medicos.push(medico);
      } else {
        medicos.push(existingMedico);
      }
    }

    console.log('✅ Médicos creados exitosamente');

    // Crear 4 madrinas (una coordinadora y 3 madrinas)
    const madrinas = [];
    const nombresMadrinas = [
      'Ana Lucía Madrina',
      'Carmen Rosa Madrina',
      'Esperanza Madrina'
    ];

    for (let i = 0; i < 3; i++) {
      const email = `madrina.bolivar${i + 1}@madresdigitales.com`;
      
      // Verificar si ya existe
      const existingMadrina = await prisma.usuario.findFirst({
        where: { email }
      });
      
      if (!existingMadrina) {
        const madrina = await prisma.usuario.create({
          data: {
            email,
            password_hash: hashedPassword,
            nombre: nombresMadrinas[i],
            telefono: `300123456${i + 8}`,
            rol: 'madrina',
            activo: true,
            municipio_id: municipios[i].id,
          }
        });
        madrinas.push(madrina);
      } else {
        madrinas.push(existingMadrina);
      }
    }

    // Crear coordinadora
    const emailCoordinadora = 'coordinadora.bolivar@madresdigitales.com';
    let coordinadora = await prisma.usuario.findFirst({
      where: { email: emailCoordinadora }
    });
    
    if (!coordinadora) {
      coordinadora = await prisma.usuario.create({
        data: {
          email: emailCoordinadora,
          password_hash: hashedPassword,
          nombre: 'María Elena Coordinadora',
          telefono: '3001234567',
          rol: 'coordinador',
          activo: true,
          municipio_id: municipios[0].id,
        }
      });
    }

    console.log('✅ Usuarios creados exitosamente');

    // Crear 10 gestantes distribuidas en los 3 municipios
    const gestantes = [];
    const nombresGestantes = [
      'Alejandra Pérez García',
      'Beatriz Rodríguez López',
      'Carolina Martínez Silva',
      'Diana Fernández Torres',
      'Elena González Ruiz',
      'Fernanda Jiménez Castro',
      'Gabriela Morales Vega',
      'Helena Vargas Díaz',
      'Isabel Herrera Mendoza',
      'Juliana Castillo Romero'
    ];

    const documentos = [
      '1234567890',
      '2345678901',
      '3456789012',
      '4567890123',
      '5678901234',
      '6789012345',
      '7890123456',
      '8901234567',
      '9012345678',
      '0123456789'
    ];

    for (let i = 0; i < 10; i++) {
      const municipioIndex = i % 3; // Distribuir entre los 3 municipios
      const madrinaAsignada = madrinas[municipioIndex];
      const medicoAsignado = medicos[municipioIndex];
      
      // Fechas realistas para embarazos
      const fechaUltimaMenstruacion = new Date();
      fechaUltimaMenstruacion.setDate(fechaUltimaMenstruacion.getDate() - (Math.floor(Math.random() * 200) + 50)); // Entre 7-35 semanas
      
      const fechaNacimiento = new Date();
      fechaNacimiento.setFullYear(fechaNacimiento.getFullYear() - (Math.floor(Math.random() * 15) + 18)); // Entre 18-33 años

      const fechaProbableParto = new Date(fechaUltimaMenstruacion);
      fechaProbableParto.setDate(fechaProbableParto.getDate() + 280); // 40 semanas

      const gestante = await prisma.gestante.create({
        data: {
          documento: documentos[i],
          nombre: nombresGestantes[i],
          telefono: `300987654${i}`,
          direccion: `Calle ${i + 1} #${Math.floor(Math.random() * 50) + 1}-${Math.floor(Math.random() * 100) + 1}`,
          fecha_nacimiento: fechaNacimiento,
          fecha_ultima_menstruacion: fechaUltimaMenstruacion,
          fecha_probable_parto: fechaProbableParto,
          eps: i % 2 === 0 ? 'SURA' : 'Nueva EPS',
          regimen_salud: i % 2 === 0 ? 'Contributivo' : 'Subsidiado',
          activa: true,
          municipio_id: municipios[municipioIndex].id,
          madrina_id: madrinaAsignada.id,
          medico_tratante_id: medicoAsignado.id,
        }
      });
      gestantes.push(gestante);
    }

    console.log('✅ Gestantes creadas exitosamente');

    // Crear algunas IPS
    const ips = [];
    const nombresIPS = [
      'Clínica Madres Digitales Cartagena',
      'Hospital Magangué',
      'IPS Turbaco Salud',
      'Centro Médico Arjona',
      'Clínica María la Baja'
    ];

    for (let i = 0; i < 5; i++) {
      const nuevaIPS = await prisma.iPS.create({
        data: {
          nombre: nombresIPS[i],
          nit: `90000000${i + 1}`,
          telefono: `300777776${i}`,
          direccion: `Carrera ${i + 5} #${Math.floor(Math.random() * 50) + 1}-${Math.floor(Math.random() * 100) + 1}`,
          municipio_id: municipios[i % 3].id,
          nivel: i < 2 ? 'Alta' : 'Media',
          email: `contacto@ips${i + 1}.com`,
          activo: true,
          fecha_creacion: new Date(),
          fecha_actualizacion: new Date()
        }
      });
      ips.push(nuevaIPS);
    }

    console.log('✅ IPS creadas exitosamente');

    // Resumen
    console.log('\n📊 RESUMEN DE DATOS CREADOS:');
    console.log(`👥 Médicos: 3`);
    console.log(`👥 Madrinas: 3`);
    console.log(`👥 Coordinadora: 1`);
    console.log(`🤰 Gestantes: 10 distribuidas en 3 municipios`);
    console.log(`🏥 IPS: 5 instituciones de salud`);
    console.log(`📍 Municipios: ${municipios.map(m => m.nombre).join(', ')}`);

    console.log('\n🎉 ¡Datos de prueba creados exitosamente!');
    console.log('\n🔑 CREDENCIALES PARA PRUEBAS:');
    console.log('Super Admin: wzuccardi@gmail.com / 73102604722');
    console.log('Coordinadora: coordinadora.bolivar@madresdigitales.com / medico123');
    console.log('Médico 1: medico1@madresdigitales.com / medico123');
    console.log('Médico 2: medico2@madresdigitales.com / medico123');
    console.log('Médico 3: medico3@madresdigitales.com / medico123');
    console.log('Madrina 1: madrina1@madresdigitales.com / medico123');
    console.log('Madrina 2: madrina2@madresdigitales.com / medico123');
    console.log('Madrina 3: madrina3@madresdigitales.com / medico123');

  } catch (error) {
    console.error('❌ Error creando datos de prueba:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => {
    console.log('✅ Script completado exitosamente');
    process.exit(0);
  })
  .catch((e) => {
    console.error('❌ Error en el script:', e);
    process.exit(1);
  });