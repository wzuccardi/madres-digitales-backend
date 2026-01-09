
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed completo de la base de datos...');

  // Limpiar datos existentes (en orden de dependencia)
  console.log('🧹 Limpiando datos existentes...');
  await prisma.alerta.deleteMany();
  await prisma.controlPrenatal.deleteMany();
  await prisma.gestante.deleteMany();
  await prisma.medico.deleteMany();
  await prisma.iPS.deleteMany();

  // 1. Omitir creación de municipios (ya existen en la base de datos)
  console.log('📍 Omitiendo creación de municipios (ya existen en la base de datos)');

  // 2. Omitir creación de usuarios (ya existen en la base de datos)
  console.log('👥 Omitiendo creación de usuarios (ya existen en la base de datos)');

  // 3. Crear IPS
  console.log('🏥 Creando IPS...');
  const ips = [
    {
      id: 'ips-001',
      nombre: 'Clínica Madres Digitales',
      nit: '900123456-1',
      direccion: 'Calle 50 #25-30, Cartagena',
      telefono: '605-6543210',
      email: 'info@clinicamadresdigitales.com',
      nivel: 'III',
      municipio_id: '13001',
      activo: true,
    },
    {
      id: 'ips-002',
      nombre: 'Hospital Universitario de Cartagena',
      nit: '900987654-2',
      direccion: 'Avenida Pedro de Heredia #30-65, Cartagena',
      telefono: '605-6554321',
      email: 'info@hospitalucartagena.com',
      nivel: 'IV',
      municipio_id: '13001',
      activo: true,
    },
    {
      id: 'ips-003',
      nombre: 'Centro de Salud Turbaco',
      nit: '900456789-3',
      direccion: 'Carrera 10 #15-20, Turbaco',
      telefono: '605-6565432',
      email: 'info@saludturbaco.com',
      nivel: 'II',
      municipio_id: '13042',
      activo: true,
    },
  ];

  for (const ip of ips) {
    await prisma.iPS.create({ data: ip });
  }
  console.log(`✅ Creadas ${ips.length} IPS`);

  // 4. Crear médicos
  console.log('🩺 Creando médicos...');
  const medicos = [
    {
      id: 'medico-001',
      nombre: 'Dr. Carlos Rodríguez',
      especialidad: 'Ginecología y Obstetricia',
      registro_medico: '123456',
      telefono: '300-1234567',
      email: 'carlos.rodriguez@demo.com',
      ips_id: 'ips-001',
      municipio_id: '13001',
      activo: true,
    },
    {
      id: 'medico-002',
      nombre: 'Dra. María Fernanda Gómez',
      especialidad: 'Medicina Familiar',
      registro_medico: '234567',
      telefono: '300-2345678',
      email: 'maria.gomez@demo.com',
      ips_id: 'ips-002',
      municipio_id: '13001',
      activo: true,
    },
    {
      id: 'medico-003',
      nombre: 'Dr. Luis Eduardo Pérez',
      especialidad: 'Pediatría',
      registro_medico: '345678',
      telefono: '300-3456789',
      email: 'luis.perez@demo.com',
      ips_id: 'ips-003',
      municipio_id: '13042',
      activo: true,
    },
  ];

  for (const medico of medicos) {
    await prisma.medico.create({ data: medico });
  }
  console.log(`✅ Creados ${medicos.length} médicos`);

  // 5. Crear gestantes
  console.log('🤱 Creando gestantes...');
  const gestantes = [
    {
      id: 'gestante-001',
      documento: '1234567890',
      tipo_documento: 'cedula',
      nombre: 'María Elena Rodríguez García',
      fecha_nacimiento: new Date('1995-03-15'),
      telefono: '3101234567',
      direccion: 'Calle 12 #34-56, Barrio Centro',
      coordenadas: { lat: 10.3910, lng: -75.4794 },
      fecha_ultima_menstruacion: new Date('2024-06-01'),
      fecha_probable_parto: new Date('2025-03-08'),
      eps: 'SURA EPS',
      regimen_salud: 'contributivo',
      municipio_id: '13001',
      medico_tratante_id: 'medico-001',
      ips_asignada_id: 'ips-001',
      activa: true,
      riesgo_alto: false,
    },
    {
      id: 'gestante-002',
      documento: '2345678901',
      tipo_documento: 'cedula',
      nombre: 'Ana Sofía Martínez López',
      fecha_nacimiento: new Date('1992-08-22'),
      telefono: '3102345678',
      direccion: 'Carrera 45 #67-89, Barrio La Esperanza',
      coordenadas: { lat: 10.3950, lng: -75.4850 },
      fecha_ultima_menstruacion: new Date('2024-07-15'),
      fecha_probable_parto: new Date('2025-04-22'),
      eps: 'Nueva EPS',
      regimen_salud: 'subsidiado',
      municipio_id: '13001',
      medico_tratante_id: 'medico-002',
      ips_asignada_id: 'ips-002',
      activa: true,
      riesgo_alto: true,
    },
    {
      id: 'gestante-003',
      documento: '3456789012',
      tipo_documento: 'cedula',
      nombre: 'Carmen Rosa Pérez Díaz',
      fecha_nacimiento: new Date('1988-12-10'),
      telefono: '3103456789',
      direccion: 'Avenida 78 #90-12, Barrio San José',
      coordenadas: { lat: 10.4000, lng: -75.4900 },
      fecha_ultima_menstruacion: new Date('2024-05-20'),
      fecha_probable_parto: new Date('2025-02-26'),
      eps: 'Sanitas EPS',
      regimen_salud: 'contributivo',
      municipio_id: '13001',
      medico_tratante_id: 'medico-003',
      ips_asignada_id: 'ips-003',
      activa: true,
      riesgo_alto: false,
    },
    {
      id: 'gestante-004',
      documento: '4567890123',
      tipo_documento: 'cedula',
      nombre: 'Laura Patricia Hernández Moreno',
      fecha_nacimiento: new Date('1990-05-18'),
      telefono: '3114567890',
      direccion: 'Calle 8 #23-45, Barrio Boston',
      coordenadas: { lat: 10.4050, lng: -75.4950 },
      fecha_ultima_menstruacion: new Date('2024-08-01'),
      fecha_probable_parto: new Date('2025-05-08'),
      eps: 'Coomeva EPS',
      regimen_salud: 'contributivo',
      municipio_id: '13001',
      medico_tratante_id: 'medico-001',
      ips_asignada_id: 'ips-001',
      activa: true,
      riesgo_alto: false,
    },
    {
      id: 'gestante-005',
      documento: '5678901234',
      tipo_documento: 'cedula',
      nombre: 'Diana Marcela Torres Peña',
      fecha_nacimiento: new Date('1993-11-30'),
      telefono: '3125678901',
      direccion: 'Carrera 15 #89-12, Barrio La Cima',
      coordenadas: { lat: 10.4100, lng: -75.5000 },
      fecha_ultima_menstruacion: new Date('2024-09-10'),
      fecha_probable_parto: new Date('2025-06-17'),
      eps: 'SOS EPS',
      regimen_salud: 'subsidiado',
      municipio_id: '13001',
      medico_tratante_id: 'medico-003',
      ips_asignada_id: 'ips-003',
      activa: true,
      riesgo_alto: true,
    },
  ];

  for (const gestante of gestantes) {
    await prisma.gestante.create({ data: gestante });
  }
  console.log(`✅ Creadas ${gestantes.length} gestantes`);

  // 6. Crear controles prenatales
  console.log('🩺 Creando controles prenatales...');
  const controles = [
    // Controles para gestante-001
    {
      id: 'control-001',
      gestante_id: 'gestante-001',
      fecha_control: new Date('2024-06-15'),
      semanas_gestacion: 8,
      peso: 58.5,
      presion_sistolica: 110,
      presion_diastolica: 70,
      frecuencia_cardiaca: 160,
      altura_uterina: null,
      edemas: 'ninguno',
      proteinuria: 'Negativa',
      glucosuria: 'Negativa',
      observaciones: 'Primer control prenatal. Embarazo saludable.',
      recomendaciones: 'Tomar ácido fólico diario. Asistir a controles mensuales.',
      proximo_control: new Date('2024-07-15'),
      realizado: true,
      medico_id: 'medico-001',
    },
    {
      id: 'control-002',
      gestante_id: 'gestante-001',
      fecha_control: new Date('2024-07-15'),
      semanas_gestacion: 12,
      peso: 60.2,
      presion_sistolica: 115,
      presion_diastolica: 75,
      frecuencia_cardiaca: 155,
      altura_uterina: 10,
      edemas: 'ninguno',
      proteinuria: 'Negativa',
      glucosuria: 'Negativa',
      observaciones: 'Segundo control. Evolución normal.',
      recomendaciones: 'Continuar con vitaminas prenatales. Ejercicios moderados.',
      proximo_control: new Date('2024-08-15'),
      realizado: true,
      medico_id: 'medico-001',
    },
    {
      id: 'control-003',
      gestante_id: 'gestante-001',
      fecha_control: new Date('2024-08-15'),
      semanas_gestacion: 16,
      peso: 62.8,
      presion_sistolica: 118,
      presion_diastolica: 78,
      frecuencia_cardiaca: 150,
      altura_uterina: 15,
      edemas: 'leve',
      proteinuria: 'Negativa',
      glucosuria: 'Negativa',
      observaciones: 'Tercer control. Leve edema en tobillos.',
      recomendaciones: 'Elevar piernas al descansar. Reducir consumo de sal.',
      proximo_control: new Date('2024-09-15'),
      realizado: true,
      medico_id: 'medico-001',
    },
    // Controles para gestante-002
    {
      id: 'control-004',
      gestante_id: 'gestante-002',
      fecha_control: new Date('2024-07-15'),
      semanas_gestacion: 8,
      peso: 55.2,
      presion_sistolica: 120,
      presion_diastolica: 80,
      frecuencia_cardiaca: 165,
      altura_uterina: null,
      edemas: 'ninguno',
      proteinuria: 'Negativa',
      glucosuria: 'Negativa',
      observaciones: 'Primer control. Embarazo de alto riesgo por antecedentes.',
      recomendaciones: 'Control estricto de presión arterial. Dieta baja en sodio.',
      proximo_control: new Date('2024-08-15'),
      realizado: true,
      medico_id: 'medico-002',
    },
    {
      id: 'control-005',
      gestante_id: 'gestante-002',
      fecha_control: new Date('2024-08-15'),
      semanas_gestacion: 12,
      peso: 57.8,
      presion_sistolica: 125,
      presion_diastolica: 85,
      frecuencia_cardiaca: 160,
      altura_uterina: 10,
      edemas: 'leve',
      proteinuria: 'Trazas',
      glucosuria: 'Negativa',
      observaciones: 'Segundo control. Presión arterial elevada.',
      recomendaciones: 'Reposo relativo. Control diario de presión en casa.',
      proximo_control: new Date('2024-09-01'),
      realizado: true,
      medico_id: 'medico-002',
    },
    // Controles para gestante-003
    {
      id: 'control-006',
      gestante_id: 'gestante-003',
      fecha_control: new Date('2024-05-20'),
      semanas_gestacion: 12,
      peso: 68.5,
      presion_sistolica: 110,
      presion_diastolica: 70,
      frecuencia_cardiaca: 155,
      altura_uterina: 10,
      edemas: 'ninguno',
      proteinuria: 'Negativa',
      glucosuria: 'Negativa',
      observaciones: 'Primer control. Embarazo saludable.',
      recomendaciones: 'Continuar con suplementos. Ejercicios suaves.',
      proximo_control: new Date('2024-06-20'),
      realizado: true,
      medico_id: 'medico-003',
    },
    {
      id: 'control-007',
      gestante_id: 'gestante-003',
      fecha_control: new Date('2024-06-20'),
      semanas_gestacion: 16,
      peso: 70.2,
      presion_sistolica: 115,
      presion_diastolica: 75,
      frecuencia_cardiaca: 150,
      altura_uterina: 15,
      edemas: 'ninguno',
      proteinuria: 'Negativa',
      glucosuria: 'Negativa',
      observaciones: 'Segundo control. Evolución normal.',
      recomendaciones: 'Preparar para ecografía morfológica.',
      proximo_control: new Date('2024-07-20'),
      realizado: true,
      medico_id: 'medico-003',
    },
    // Controles para gestante-004
    {
      id: 'control-008',
      gestante_id: 'gestante-004',
      fecha_control: new Date('2024-08-01'),
      semanas_gestacion: 8,
      peso: 62.3,
      presion_sistolica: 112,
      presion_diastolica: 72,
      frecuencia_cardiaca: 158,
      altura_uterina: null,
      edemas: 'ninguno',
      proteinuria: 'Negativa',
      glucosuria: 'Negativa',
      observaciones: 'Primer control. Embarazo saludable.',
      recomendaciones: 'Tomar ácido fólico. Asistir a clases de preparación al parto.',
      proximo_control: new Date('2024-09-01'),
      realizado: true,
      medico_id: 'medico-001',
    },
    // Controles para gestante-005
    {
      id: 'control-009',
      gestante_id: 'gestante-005',
      fecha_control: new Date('2024-09-10'),
      semanas_gestacion: 8,
      peso: 65.8,
      presion_sistolica: 118,
      presion_diastolica: 78,
      frecuencia_cardiaca: 162,
      altura_uterina: null,
      edemas: 'ninguno',
      proteinuria: 'Negativa',
      glucosuria: 'Negativa',
      observaciones: 'Primer control. Embarazo de alto riesgo por edad materna.',
      recomendaciones: 'Estudios adicionales. Control estricto.',
      proximo_control: new Date('2024-10-10'),
      realizado: true,
      medico_id: 'medico-003',
    },
  ];

  for (const control of controles) {
    await prisma.controlPrenatal.create({ data: control });
  }
  console.log(`✅ Creados ${controles.length} controles prenatales`);

  // 7. Omitir creación de alertas (para evitar errores de clave foránea)
  console.log('🚨 Omitiendo creación de alertas (para evitar errores de clave foránea)');

  console.log('🎉 Seed completado exitosamente!');
  console.log('📊 Resumen de datos creados:');
  console.log(`   - ${ips.length} IPS`);
  console.log(`   - ${medicos.length} médicos`);
  console.log(`   - ${gestantes.length} gestantes`);
  console.log(`   - ${controles.length} controles prenatales`);
}

main()
  .catch((e) => {
    console.error('❌ Error al ejecutar el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });