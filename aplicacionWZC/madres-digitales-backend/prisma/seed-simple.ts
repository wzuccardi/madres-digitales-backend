import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed simple de la base de datos...');

  // 1. Verificar usuarios existentes
  console.log('👥 Verificando usuarios existentes...');
  const usuariosExistentes = await prisma.usuario.findMany();
  console.log(`✅ Encontrados ${usuariosExistentes.length} usuarios`);

  // 2. Verificar municipios existentes
  console.log('📍 Verificando municipios existentes...');
  const municipiosExistentes = await prisma.municipio.findMany();
  console.log(`✅ Encontrados ${municipiosExistentes.length} municipios`);

  // 3. Obtener usuarios para asignar
  const admin = usuariosExistentes.find(u => u.rol === 'admin' || u.rol === 'super_admin');
  const madrina = usuariosExistentes.find(u => u.rol === 'madrina');
  const medico = await prisma.medico.findFirst();

  // 4. Crear gestantes adicionales
  console.log('🤱 Creando gestantes adicionales...');
  
  const gestantesAdicionales = [
    {
      documento: '1234567890',
      tipo_documento: 'cedula',
      nombre: 'María Elena Rodríguez García',
      fecha_nacimiento: new Date('1995-03-15'),
      telefono: '3101234567',
      direccion: 'Calle 12 #34-56, Barrio Centro',
      municipio_id: municipiosExistentes[0]?.id,
      madrina_id: madrina?.id,
      medico_tratante_id: medico?.id,
      eps: 'SURA EPS',
      regimen_salud: 'contributivo',
      fecha_ultima_menstruacion: new Date('2024-06-01'),
      fecha_probable_parto: new Date('2025-03-08'),
      riesgo_alto: false,
      activa: true,
    },
    {
      documento: '2345678901',
      tipo_documento: 'cedula',
      nombre: 'Ana Sofía Martínez López',
      fecha_nacimiento: new Date('1992-08-22'),
      telefono: '3102345678',
      direccion: 'Carrera 45 #67-89, Barrio La Esperanza',
      municipio_id: municipiosExistentes[1]?.id,
      madrina_id: madrina?.id,
      medico_tratante_id: medico?.id,
      eps: 'Nueva EPS',
      regimen_salud: 'subsidiado',
      fecha_ultima_menstruacion: new Date('2024-07-15'),
      fecha_probable_parto: new Date('2025-04-22'),
      riesgo_alto: true,
      activa: true,
    },
    {
      documento: '3456789012',
      tipo_documento: 'cedula',
      nombre: 'Carmen Rosa Pérez Díaz',
      fecha_nacimiento: new Date('1988-12-10'),
      telefono: '3103456789',
      direccion: 'Avenida 78 #90-12, Barrio San José',
      municipio_id: municipiosExistentes[2]?.id,
      madrina_id: madrina?.id,
      medico_tratante_id: medico?.id,
      eps: 'Sanitas EPS',
      regimen_salud: 'contributivo',
      fecha_ultima_menstruacion: new Date('2024-05-20'),
      fecha_probable_parto: new Date('2025-02-26'),
      riesgo_alto: false,
      activa: true,
    },
    {
      documento: '4567890123',
      tipo_documento: 'cedula',
      nombre: 'Laura Patricia Hernández Moreno',
      fecha_nacimiento: new Date('1990-05-18'),
      telefono: '3114567890',
      direccion: 'Calle 8 #23-45, Barrio Boston',
      municipio_id: municipiosExistentes[0]?.id,
      madrina_id: madrina?.id,
      medico_tratante_id: medico?.id,
      eps: 'Coomeva EPS',
      regimen_salud: 'contributivo',
      fecha_ultima_menstruacion: new Date('2024-08-01'),
      fecha_probable_parto: new Date('2025-05-08'),
      riesgo_alto: false,
      activa: true,
    },
    {
      documento: '5678901234',
      tipo_documento: 'cedula',
      nombre: 'Diana Marcela Torres Peña',
      fecha_nacimiento: new Date('1993-11-30'),
      telefono: '3125678901',
      direccion: 'Carrera 15 #89-12, Barrio La Cima',
      municipio_id: municipiosExistentes[3]?.id,
      madrina_id: madrina?.id,
      medico_tratante_id: medico?.id,
      eps: 'SOS EPS',
      regimen_salud: 'subsidiado',
      fecha_ultima_menstruacion: new Date('2024-09-10'),
      fecha_probable_parto: new Date('2025-06-17'),
      riesgo_alto: true,
      activa: true,
    },
  ];

  const gestantesCreadas = [];
  for (const gestante of gestantesAdicionales) {
    // Verificar si ya existe
    const existente = await prisma.gestante.findFirst({
      where: { documento: gestante.documento }
    });

    if (!existente) {
      const gestanteCreada = await prisma.gestante.create({
        data: gestante,
      });
      gestantesCreadas.push(gestanteCreada);
      console.log(`✅ Gestante creada: ${gestanteCreada.nombre}`);
    } else {
      gestantesCreadas.push(existente);
      console.log(`ℹ️ Gestante ya existente: ${existente.nombre}`);
    }
  }

  // 5. Crear controles prenatales para las gestantes
  console.log('🩺 Creando controles prenatales...');
  const todasLasGestantes = await prisma.gestante.findMany({
    where: { activa: true }
  });

  for (const gestante of todasLasGestantes) {
    // Verificar si ya tiene controles
    const controlesExistentes = await prisma.controlPrenatal.count({
      where: { gestante_id: gestante.id }
    });

    if (controlesExistentes === 0) {
      // Crear 2 controles por gestante
      for (let i = 0; i < 2; i++) {
        const fechaControl = new Date();
        fechaControl.setDate(fechaControl.getDate() - (30 * (2 - i))); // Controles cada 30 días hacia atrás

        const control = {
          gestante_id: gestante.id,
          medico_id: medico?.id,
          fecha_control: fechaControl,
          semanas_gestacion: 12 + (i * 4),
          peso: 60 + (i * 2) + Math.random() * 5,
          altura_uterina: 12 + (i * 3),
          presion_sistolica: 110 + Math.floor(Math.random() * 20),
          presion_diastolica: 70 + Math.floor(Math.random() * 15),
          frecuencia_cardiaca: 70 + Math.floor(Math.random() * 20),
          temperatura: 36.5 + Math.random() * 0.8,
          movimientos_fetales: i > 0 ? 'Presentes' : null,
          edemas: Math.random() > 0.8 ? 'Leve' : null,
          proteinuria: Math.random() > 0.9 ? 'Positiva' : null,
          glucosuria: Math.random() > 0.95 ? 'Positiva' : null,
          observaciones: `Control prenatal #${i + 1}. Evolución normal del embarazo.`,
          recomendaciones: 'Continuar con vitaminas prenatales. Próximo control en 4 semanas.',
          proximo_control: new Date(fechaControl.getTime() + (30 * 24 * 60 * 60 * 1000)),
          realizado: true,
        };

        await prisma.controlPrenatal.create({ data: control });
      }
      console.log(`✅ Controles creados para: ${gestante.nombre}`);
    }
  }

  // 6. Crear alertas de ejemplo
  console.log('🚨 Creando alertas...');
  const gestantesConRiesgo = await prisma.gestante.findMany({
    where: { riesgo_alto: true, activa: true }
  });

  for (const gestante of gestantesConRiesgo) {
    const alertasExistentes = await prisma.alerta.count({
      where: { gestante_id: gestante.id }
    });

    if (alertasExistentes === 0) {
      const alerta = {
        gestante_id: gestante.id,
        tipo_alerta: 'HIPERTENSION',
        nivel_prioridad: 'ALTA',
        mensaje: 'Gestante con factores de riesgo requiere seguimiento especial',
        sintomas: ['Presión arterial elevada', 'Riesgo de preeclampsia'],
        madrina_id: madrina?.id,
        medico_asignado_id: medico?.id,
        resuelta: false,
        generado_por_id: admin?.id,
        estado: 'pendiente',
        es_automatica: true,
        score_riesgo: 75,
      };

      await prisma.alerta.create({ data: alerta });
      console.log(`✅ Alerta creada para: ${gestante.nombre}`);
    }
  }

  // 7. Estadísticas finales
  const totalGestantes = await prisma.gestante.count({ where: { activa: true } });
  const totalControles = await prisma.controlPrenatal.count();
  const totalAlertas = await prisma.alerta.count();

  console.log('🎉 Seed simple completado exitosamente!');
  console.log(`📊 Resumen:`);
  console.log(`   - ${municipiosExistentes.length} municipios`);
  console.log(`   - ${usuariosExistentes.length} usuarios`);
  console.log(`   - ${totalGestantes} gestantes activas`);
  console.log(`   - ${totalControles} controles prenatales`);
  console.log(`   - ${totalAlertas} alertas`);
}

main()
  .catch(e => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });