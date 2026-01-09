import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Creando datos de prueba para Madres Digitales...');

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

    // Crear 4 madrinas (una coordinadora y 3 madrinas)
    const hashedPassword = await bcrypt.hash('madrina123', 10);

    // 1. Coordinadora
    const coordinadora = await prisma.usuario.create({
      data: {
        email: 'coordinadora.bolivar@madresdigitales.com',
        password_hash: hashedPassword,
        nombre: 'María Elena Coordinadora',
        telefono: '3001234567',
        rol: 'coordinador',
        activo: true,
        municipio_id: municipios[0].id,
      }
    });

    // 2-4. Tres madrinas
    const madrinas = [];
    const nombresMadrinas = [
      'Ana Lucía Madrina',
      'Carmen Rosa Madrina',
      'Esperanza Madrina'
    ];

    for (let i = 0; i < 3; i++) {
      const madrina = await prisma.usuario.create({
        data: {
          email: `madrina${i + 1}@madresdigitales.com`,
          password_hash: hashedPassword,
          nombre: nombresMadrinas[i],
          telefono: `300123456${i + 8}`,
          rol: 'madrina',
          activo: true,
          municipio_id: municipios[i].id,
        }
      });
      madrinas.push(madrina);
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
        }
      });
      gestantes.push(gestante);
    }

    console.log('✅ Gestantes creadas exitosamente');

    // Crear algunos controles prenatales
    for (let i = 0; i < 15; i++) {
      const gestante = gestantes[Math.floor(Math.random() * gestantes.length)];
      const madrina = madrinas.find(m => m.id === gestante.madrina_id);
      
      const fechaControl = new Date();
      fechaControl.setDate(fechaControl.getDate() - Math.floor(Math.random() * 60)); // Últimos 2 meses

      // Calcular semanas de gestación
      const diffTime = fechaControl.getTime() - (gestante.fecha_ultima_menstruacion?.getTime() || fechaControl.getTime());
      const semanasGestacion = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));

      await prisma.control.create({
        data: {
          gestante_id: gestante.id,
          medico_id: madrina!.id,
          fecha_control: fechaControl,
          semanas_gestacion: Math.max(1, Math.min(42, semanasGestacion)),
          peso: 50 + Math.random() * 40, // Entre 50-90 kg
          presion_sistolica: 90 + Math.floor(Math.random() * 50), // Entre 90-140
          presion_diastolica: 60 + Math.floor(Math.random() * 30), // Entre 60-90
        }
      });
    }

    console.log('✅ Controles prenatales creados exitosamente');

    // Crear algunas alertas
    for (let i = 0; i < 8; i++) {
      const gestante = gestantes[Math.floor(Math.random() * gestantes.length)];
      const tiposAlerta = ['control_vencido', 'riesgo_alto', 'emergencia_obstetrica', 'sos'];
      const nivelesPrioridad = ['baja', 'media', 'alta', 'critica'];

      const alertaData: any = {
        gestante_id: gestante.id,
        tipo_alerta: tiposAlerta[Math.floor(Math.random() * tiposAlerta.length)] as any,
        nivel_prioridad: nivelesPrioridad[Math.floor(Math.random() * nivelesPrioridad.length)] as any,
        mensaje: `Alerta generada para ${gestante.nombre}`,
        fecha_creacion: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Última semana
        resuelta: Math.random() > 0.7, // 30% resueltas
      };

      await prisma.alerta.create({
        data: alertaData
      });
    }

    console.log('✅ Alertas creadas exitosamente');

    // Resumen
    console.log('\n📊 RESUMEN DE DATOS CREADOS:');
    console.log(`👥 Usuarios: 1 coordinadora + 3 madrinas`);
    console.log(`🤰 Gestantes: 10 distribuidas en 3 municipios`);
    console.log(`🏥 Controles: 15 controles prenatales`);
    console.log(`🚨 Alertas: 8 alertas de diferentes tipos`);
    console.log(`📍 Municipios: ${municipios.map(m => m.nombre).join(', ')}`);

    console.log('\n🎉 ¡Datos de prueba creados exitosamente!');
    console.log('\n🔑 CREDENCIALES PARA PRUEBAS:');
    console.log('Coordinadora: coordinadora.bolivar@madresdigitales.com / madrina123');
    console.log('Madrina 1: madrina1@madresdigitales.com / madrina123');
    console.log('Madrina 2: madrina2@madresdigitales.com / madrina123');
    console.log('Madrina 3: madrina3@madresdigitales.com / madrina123');

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