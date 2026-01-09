#!/usr/bin/env node

/**
 * Script rápido de seed para poblar la BD con datos de prueba
 * Usa los nombres correctos del schema (snake_case)
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Hash simple para desarrollo (NO usar en producción)
const hashedPassword = '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/KFm'; // password123

async function main() {
  console.log('\n🌱 SEED RÁPIDO DE DATOS DE PRUEBA\n');
  console.log('='.repeat(50));

  try {
    // 1. Crear municipios
    console.log('\n📍 Creando municipios...');
    const municipios = await prisma.municipios.createMany({
      data: [
        {
          id: 'mun-001',
          nombre: 'Cartagena',
          departamento: 'Bolívar',
          codigo_dane: '13001',
          poblacion: 1000000,
          activo: true,
        },
        {
          id: 'mun-002',
          nombre: 'Turbaco',
          departamento: 'Bolívar',
          codigo_dane: '13042',
          poblacion: 50000,
          activo: true,
        },
        {
          id: 'mun-003',
          nombre: 'Arjona',
          departamento: 'Bolívar',
          codigo_dane: '13030',
          poblacion: 30000,
          activo: true,
        },
      ],
      skipDuplicates: true,
    });
    console.log(`✅ Municipios creados`);

    // 2. Crear usuarios (super_admin, admin, madrina, médico)
    console.log('\n👥 Creando usuarios...');

    const usuarios = await prisma.usuarios.createMany({
      data: [
        {
          id: 'user-super-admin-001',
          nombre: 'Super Admin WZC',
          email: 'wzuccardi@gmail.com',
          password_hash: hashedPassword,
          rol: 'SUPER_ADMIN',
          municipio_id: 'mun-001',
          activo: true,
        },
        {
          id: 'user-admin-001',
          nombre: 'Admin Sistema',
          email: 'admin@madresdigitales.com',
          password_hash: hashedPassword,
          rol: 'ADMIN',
          municipio_id: 'mun-001',
          activo: true,
        },
        {
          id: 'user-madrina-001',
          nombre: 'María Madrina',
          email: 'madrina@madresdigitales.com',
          password_hash: hashedPassword,
          rol: 'MADRINA',
          municipio_id: 'mun-001',
          activo: true,
        },
        {
          id: 'user-medico-001',
          nombre: 'Dr. Juan Médico',
          email: 'medico@madresdigitales.com',
          password_hash: hashedPassword,
          rol: 'MEDICO',
          municipio_id: 'mun-001',
          activo: true,
        },
      ],
      skipDuplicates: true,
    });
    console.log(`✅ Usuarios creados`);

    // 3. Crear IPS
    console.log('\n🏥 Creando IPS...');
    const ips = await prisma.ips.createMany({
      data: [
        {
          id: 'ips-001',
          nombre: 'Clínica Madres Digitales',
          nit: '900123456-1',
          direccion: 'Calle 50 #25-30, Cartagena',
          telefono: '605-6543210',
          email: 'info@clinicamadresdigitales.com',
          nivel: 'III',
          municipio_id: 'mun-001',
          activo: true,
        },
        {
          id: 'ips-002',
          nombre: 'Hospital Universitario',
          nit: '900987654-2',
          direccion: 'Avenida Pedro de Heredia #30-65',
          telefono: '605-6554321',
          email: 'info@hospitalucartagena.com',
          nivel: 'IV',
          municipio_id: 'mun-001',
          activo: true,
        },
      ],
      skipDuplicates: true,
    });
    console.log(`✅ IPS creadas`);

    // 4. Crear médicos
    console.log('\n🩺 Creando médicos...');
    const medicos = await prisma.medicos.createMany({
      data: [
        {
          id: 'medico-001',
          nombre: 'Dr. Carlos Rodríguez',
          especialidad: 'Ginecología y Obstetricia',
          registro_medico: '123456',
          telefono: '300-1234567',
          email: 'carlos.rodriguez@demo.com',
          ips_id: 'ips-001',
          municipio_id: 'mun-001',
          activo: true,
        },
        {
          id: 'medico-002',
          nombre: 'Dra. Ana García',
          especialidad: 'Medicina General',
          registro_medico: '654321',
          telefono: '300-7654321',
          email: 'ana.garcia@demo.com',
          ips_id: 'ips-002',
          municipio_id: 'mun-001',
          activo: true,
        },
      ],
      skipDuplicates: true,
    });
    console.log(`✅ Médicos creados`);

    // 5. Crear gestantes
    console.log('\n🤱 Creando gestantes...');
    const gestantes = await prisma.gestantes.createMany({
      data: [
        {
          id: 'gestante-001',
          documento: '1234567890',
          tipo_documento: 'cedula',
          nombre: 'María Elena Rodríguez',
          fecha_nacimiento: new Date('1995-03-15'),
          telefono: '3101234567',
          direccion: 'Calle 12 #34-56',
          municipio_id: 'mun-001',
          madrina_id: 'user-madrina-001',
          medico_tratante_id: 'medico-001',
          ips_asignada_id: 'ips-001',
          eps: 'SURA EPS',
          regimen_salud: 'contributivo',
          fecha_ultima_menstruacion: new Date('2024-06-01'),
          fecha_probable_parto: new Date('2025-03-08'),
          riesgo_alto: false,
          activa: true,
        },
        {
          id: 'gestante-002',
          documento: '2345678901',
          tipo_documento: 'cedula',
          nombre: 'Ana Sofía Martínez',
          fecha_nacimiento: new Date('1992-08-22'),
          telefono: '3102345678',
          direccion: 'Carrera 45 #67-89',
          municipio_id: 'mun-001',
          madrina_id: 'user-madrina-001',
          medico_tratante_id: 'medico-002',
          ips_asignada_id: 'ips-002',
          eps: 'Nueva EPS',
          regimen_salud: 'subsidiado',
          fecha_ultima_menstruacion: new Date('2024-07-15'),
          fecha_probable_parto: new Date('2025-04-22'),
          riesgo_alto: true,
          activa: true,
        },
      ],
      skipDuplicates: true,
    });
    console.log(`✅ Gestantes creadas`);

    // 6. Crear controles prenatales
    console.log('\n📋 Creando controles prenatales...');
    await prisma.control_prenatal.createMany({
      data: [
        {
          id: 'control-001',
          gestante_id: 'gestante-001',
          medico_id: 'medico-001',
          fecha_control: new Date('2025-10-20'),
          semanas_gestacion: 28,
          presion_sistolica: 120,
          presion_diastolica: 80,
          frecuencia_cardiaca: 72,
          altura_uterina: 28,
          movimientos_fetales: 'Presentes',
          observaciones: 'Control prenatal de rutina',
        },
        {
          id: 'control-002',
          gestante_id: 'gestante-002',
          medico_id: 'medico-002',
          fecha_control: new Date('2025-10-25'),
          semanas_gestacion: 32,
          presion_sistolica: 125,
          presion_diastolica: 85,
          frecuencia_cardiaca: 75,
          altura_uterina: 32,
          movimientos_fetales: 'Presentes',
          observaciones: 'Control prenatal con seguimiento de riesgo alto',
        },
      ],
      skipDuplicates: true,
    });
    console.log(`✅ Controles creados`);

    // 7. Crear alertas
    console.log('\n🚨 Creando alertas...');
    const alertas = await prisma.alertas.createMany({
      data: [
        {
          id: 'alerta-001',
          gestante_id: 'gestante-001',
          madrina_id: 'user-madrina-001',
          medico_asignado_id: 'medico-001',
          tipo_alerta: 'RECORDATORIO_CONTROL',
          nivel_prioridad: 'MEDIA',
          mensaje: 'Recordatorio: Control prenatal próximo',
          resuelta: false,
          estado: 'pendiente',
          es_automatica: true,
        },
        {
          id: 'alerta-002',
          gestante_id: 'gestante-002',
          madrina_id: 'user-madrina-001',
          medico_asignado_id: 'medico-002',
          tipo_alerta: 'SINTOMAS_PREOCUPANTES',
          nivel_prioridad: 'ALTA',
          mensaje: 'Síntomas preocupantes reportados',
          resuelta: false,
          estado: 'pendiente',
          es_automatica: false,
        },
      ],
      skipDuplicates: true,
    });
    console.log(`✅ Alertas creadas`);

    console.log('\n' + '='.repeat(50));
    console.log('\n✅ SEED COMPLETADO EXITOSAMENTE\n');
    console.log('Datos creados:');
    console.log('  - 3 Municipios');
    console.log('  - 4 Usuarios (super_admin, admin, madrina, médico)');
    console.log('  - 2 IPS');
    console.log('  - 2 Médicos');
    console.log('  - 2 Gestantes');
    console.log('  - 2 Controles');
    console.log('  - 2 Alertas');
    console.log('\n' + '='.repeat(50) + '\n');
    console.log('🔐 CREDENCIALES DE ACCESO:');
    console.log('  Super Admin: wzuccardi@gmail.com / password123');
    console.log('  Admin: admin@madresdigitales.com / password123');
    console.log('  Madrina: madrina@madresdigitales.com / password123');
    console.log('  Médico: medico@madresdigitales.com / password123');
    console.log('\n' + '='.repeat(50) + '\n');

  } catch (error) {
    console.error('❌ Error durante el seed:');
    console.error(error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

