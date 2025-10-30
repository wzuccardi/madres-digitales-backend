import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

// Función simple para hashear contraseña
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function seedDatosPrueba() {
  try {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║          POBLANDO BASE DE DATOS CON DATOS DE PRUEBA             ║');
    console.log('║                  Madres Digitales                              ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    // 1. CREAR USUARIOS (ADMIN, COORDINADOR, MADRINAS)
    console.log('👤 Creando Usuarios...');

    const passwordHash = hashPassword('password123');

    const admin = await prisma.usuarios.create({
      data: {
        id: 'usr_admin_001',
        nombre: 'Administrador Sistema',
        email: 'admin@madresdigitales.com',
        password_hash: passwordHash,
        rol: 'ADMIN',
        documento: '1000000001',
        tipo_documento: 'cedula',
        activo: true,
      },
    });
    console.log(`✅ Admin creado: ${admin.nombre}`);

    const coordinador = await prisma.usuarios.create({
      data: {
        id: 'usr_coord_001',
        nombre: 'Coordinador Regional',
        email: 'coordinador@madresdigitales.com',
        password_hash: passwordHash,
        rol: 'COORDINADOR',
        documento: '1000000002',
        tipo_documento: 'cedula',
        activo: true,
      },
    });
    console.log(`✅ Coordinador creado: ${coordinador.nombre}`);

    const madrina1 = await prisma.usuarios.create({
      data: {
        id: 'usr_madrina_001',
        nombre: 'María Rodríguez García',
        email: 'maria.rodriguez@madresdigitales.com',
        password_hash: passwordHash,
        rol: 'MADRINA',
        documento: '1000000003',
        tipo_documento: 'cedula',
        activo: true,
      },
    });
    console.log(`✅ Madrina 1 creada: ${madrina1.nombre}`);

    const madrina2 = await prisma.usuarios.create({
      data: {
        id: 'usr_madrina_002',
        nombre: 'Carmen López Martínez',
        email: 'carmen.lopez@madresdigitales.com',
        password_hash: passwordHash,
        rol: 'MADRINA',
        documento: '1000000004',
        tipo_documento: 'cedula',
        activo: true,
      },
    });
    console.log(`✅ Madrina 2 creada: ${madrina2.nombre}`);

    const medico = await prisma.usuarios.create({
      data: {
        id: 'usr_medico_001',
        nombre: 'Dr. Juan Pérez',
        email: 'juan.perez@madresdigitales.com',
        password_hash: passwordHash,
        rol: 'MEDICO',
        documento: '1000000005',
        tipo_documento: 'cedula',
        activo: true,
      },
    });
    console.log(`✅ Médico creado: ${medico.nombre}`);

    // 2. CREAR GESTANTES
    console.log('\n🤰 Creando Gestantes...');

    const gestante1 = await prisma.gestantes.create({
      data: {
        id: 'gest_001',
        nombre: 'Ana María Sánchez',
        documento: '1234567890',
        tipo_documento: 'cedula',
        fecha_nacimiento: new Date('1995-05-15'),
        telefono: '3001234567',
        direccion: 'Calle 10 No. 20-30',
        municipio_id: 'mun_001',
        madrina_id: madrina1.id,
        medico_tratante_id: 'med_001',
        ips_asignada_id: 'ips_001',
        regimen_salud: 'Contributivo',
        activa: true,
        riesgo_alto: false,
      },
    });
    console.log(`✅ Gestante 1 creada: ${gestante1.nombre} (Asignada a ${madrina1.nombre})`);

    const gestante2 = await prisma.gestantes.create({
      data: {
        id: 'gest_002',
        nombre: 'Sofía Martínez Gómez',
        documento: '0987654321',
        tipo_documento: 'cedula',
        fecha_nacimiento: new Date('1998-08-22'),
        telefono: '3009876543',
        direccion: 'Avenida 5 No. 15-40',
        municipio_id: 'mun_001',
        madrina_id: madrina2.id,
        medico_tratante_id: 'med_002',
        ips_asignada_id: 'ips_002',
        regimen_salud: 'Subsidiado',
        activa: true,
        riesgo_alto: false,
      },
    });
    console.log(`✅ Gestante 2 creada: ${gestante2.nombre} (Asignada a ${madrina2.nombre})`);

    const gestante3 = await prisma.gestantes.create({
      data: {
        id: 'gest_003',
        nombre: 'Daniela Fernández López',
        documento: '1122334455',
        tipo_documento: 'cedula',
        fecha_nacimiento: new Date('1996-03-10'),
        telefono: '3005555555',
        direccion: 'Carrera 8 No. 25-50',
        municipio_id: 'mun_002',
        madrina_id: null,
        medico_tratante_id: 'med_001',
        ips_asignada_id: 'ips_001',
        regimen_salud: 'Contributivo',
        activa: true,
        riesgo_alto: true,
      },
    });
    console.log(`✅ Gestante 3 creada: ${gestante3.nombre} (SIN MADRINA ASIGNADA - RIESGO ALTO)`);

    // 3. CREAR ALERTAS
    console.log('\n🚨 Creando Alertas...');

    const alerta1 = await prisma.alertas.create({
      data: {
        id: 'alerta_001',
        gestante_id: gestante1.id,
        madrina_id: madrina1.id,
        tipo_alerta: 'CONTROL_VENCIDO',
        nivel_prioridad: 'MEDIA',
        mensaje: 'Control prenatal vencido',
        estado: 'pendiente',
        es_automatica: true,
        score_riesgo: 30,
      },
    });
    console.log(`✅ Alerta 1 creada: ${alerta1.tipo_alerta}`);

    const alerta2 = await prisma.alertas.create({
      data: {
        id: 'alerta_002',
        gestante_id: gestante3.id,
        madrina_id: null,
        medico_asignado_id: 'med_001',
        tipo_alerta: 'SINTOMAS_PREOCUPANTES',
        nivel_prioridad: 'CRITICA',
        mensaje: 'Síntomas preocupantes reportados',
        estado: 'pendiente',
        es_automatica: false,
        score_riesgo: 85,
      },
    });
    console.log(`✅ Alerta 2 creada: ${alerta2.tipo_alerta} (CRÍTICA)`);

    // 4. RESUMEN
    console.log('\n📊 RESUMEN DE DATOS CREADOS');
    console.log('─'.repeat(70));
    console.log(`✅ Usuarios: 5 (1 Admin, 1 Coordinador, 2 Madrinas, 1 Médico)`);
    console.log(`✅ Gestantes: 3 (2 con Madrina asignada, 1 sin asignar)`);
    console.log(`✅ Alertas: 2`);
    console.log(`✅ Controles Prenatales: 2 (ya existentes)`);

    console.log('\n📋 ASIGNACIONES');
    console.log('─'.repeat(70));
    console.log(`👩 ${madrina1.nombre}: 1 gestante (${gestante1.nombre})`);
    console.log(`👩 ${madrina2.nombre}: 1 gestante (${gestante2.nombre})`);
    console.log(`❌ ${gestante3.nombre}: SIN MADRINA (RIESGO ALTO)`);

    console.log('\n🔐 CREDENCIALES DE PRUEBA');
    console.log('─'.repeat(70));
    console.log(`Email: admin@madresdigitales.com`);
    console.log(`Contraseña: password123`);
    console.log(`\nEmail: maria.rodriguez@madresdigitales.com`);
    console.log(`Contraseña: password123`);
    console.log(`\nEmail: carmen.lopez@madresdigitales.com`);
    console.log(`Contraseña: password123`);

    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║                  DATOS CREADOS EXITOSAMENTE                    ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

  } catch (error) {
    console.error('❌ Error al crear datos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDatosPrueba();

