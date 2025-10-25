import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const municipios = [
  { nombre: 'CARTAGENA DE INDIAS', codigo_dane: '13001', departamento: 'Bolívar', longitud: -75.496269, latitud: 10.385126 },
  { nombre: 'ACHÍ', codigo_dane: '13006', departamento: 'Bolívar', longitud: -74.557676, latitud: 8.570107 },
  { nombre: 'ALTOS DEL ROSARIO', codigo_dane: '13030', departamento: 'Bolívar', longitud: -74.164905, latitud: 8.791865 },
  { nombre: 'ARENAL', codigo_dane: '13042', departamento: 'Bolívar', longitud: -73.941099, latitud: 8.458865 },
  { nombre: 'ARJONA', codigo_dane: '13052', departamento: 'Bolívar', longitud: -75.344332, latitud: 10.25666 },
  { nombre: 'ARROYOHONDO', codigo_dane: '13062', departamento: 'Bolívar', longitud: -75.019215, latitud: 10.250075 },
  { nombre: 'BARRANCO DE LOBA', codigo_dane: '13074', departamento: 'Bolívar', longitud: -74.104391, latitud: 8.947787 },
  { nombre: 'CALAMAR', codigo_dane: '13140', departamento: 'Bolívar', longitud: -74.916144, latitud: 10.250431 },
  { nombre: 'CANTAGALLO', codigo_dane: '13160', departamento: 'Bolívar', longitud: -73.914605, latitud: 7.378678 },
  { nombre: 'CICUCO', codigo_dane: '13188', departamento: 'Bolívar', longitud: -74.645981, latitud: 9.274281 },
  { nombre: 'CÓRDOBA', codigo_dane: '13212', departamento: 'Bolívar', longitud: -74.827399, latitud: 9.586942 },
  { nombre: 'CLEMENCIA', codigo_dane: '13222', departamento: 'Bolívar', longitud: -75.328469, latitud: 10.567452 },
  { nombre: 'EL CARMEN DE BOLÍVAR', codigo_dane: '13244', departamento: 'Bolívar', longitud: -75.121178, latitud: 9.718653 },
  { nombre: 'EL GUAMO', codigo_dane: '13248', departamento: 'Bolívar', longitud: -74.976084, latitud: 10.030958 },
  { nombre: 'EL PEÑÓN', codigo_dane: '13268', departamento: 'Bolívar', longitud: -73.949274, latitud: 8.988271 },
  { nombre: 'HATILLO DE LOBA', codigo_dane: '13300', departamento: 'Bolívar', longitud: -74.077912, latitud: 8.956014 },
  { nombre: 'MAGANGUÉ', codigo_dane: '13430', departamento: 'Bolívar', longitud: -74.766742, latitud: 9.263799 },
  { nombre: 'MAHATES', codigo_dane: '13433', departamento: 'Bolívar', longitud: -75.191643, latitud: 10.233285 },
  { nombre: 'MARGARITA', codigo_dane: '13440', departamento: 'Bolívar', longitud: -74.285137, latitud: 9.15784 },
  { nombre: 'MARÍA LA BAJA', codigo_dane: '13442', departamento: 'Bolívar', longitud: -75.300516, latitud: 9.982402 },
  { nombre: 'MONTECRISTO', codigo_dane: '13458', departamento: 'Bolívar', longitud: -74.471176, latitud: 8.297234 },
  { nombre: 'SANTA CRUZ DE MOMPOX', codigo_dane: '13468', departamento: 'Bolívar', longitud: -74.42818, latitud: 9.244241 },
  { nombre: 'MORALES', codigo_dane: '13473', departamento: 'Bolívar', longitud: -73.868172, latitud: 8.276558 },
  { nombre: 'NOROSÍ', codigo_dane: '13490', departamento: 'Bolívar', longitud: -74.038003, latitud: 8.526259 },
  { nombre: 'PINILLOS', codigo_dane: '13549', departamento: 'Bolívar', longitud: -74.462279, latitud: 8.914947 },
  { nombre: 'REGIDOR', codigo_dane: '13580', departamento: 'Bolívar', longitud: -73.821638, latitud: 8.666258 },
  { nombre: 'RÍO VIEJO', codigo_dane: '13600', departamento: 'Bolívar', longitud: -73.840466, latitud: 8.58795 },
  { nombre: 'SAN CRISTÓBAL', codigo_dane: '13620', departamento: 'Bolívar', longitud: -75.065076, latitud: 10.392836 },
  { nombre: 'SAN ESTANISLAO', codigo_dane: '13647', departamento: 'Bolívar', longitud: -75.153101, latitud: 10.398602 },
  { nombre: 'SAN FERNANDO', codigo_dane: '13650', departamento: 'Bolívar', longitud: -74.323811, latitud: 9.214183 },
  { nombre: 'SAN JACINTO', codigo_dane: '13654', departamento: 'Bolívar', longitud: -75.12105, latitud: 9.830275 },
  { nombre: 'SAN JACINTO DEL CAUCA', codigo_dane: '13655', departamento: 'Bolívar', longitud: -74.721156, latitud: 8.25158 },
  { nombre: 'SAN JUAN NEPOMUCENO', codigo_dane: '13657', departamento: 'Bolívar', longitud: -75.081761, latitud: 9.953751 },
  { nombre: 'SAN MARTÍN DE LOBA', codigo_dane: '13667', departamento: 'Bolívar', longitud: -74.039134, latitud: 8.937485 },
  { nombre: 'SAN PABLO', codigo_dane: '13670', departamento: 'Bolívar', longitud: -73.924602, latitud: 7.476747 },
  { nombre: 'SANTA CATALINA', codigo_dane: '13673', departamento: 'Bolívar', longitud: -75.287855, latitud: 10.605294 },
  { nombre: 'SANTA ROSA', codigo_dane: '13683', departamento: 'Bolívar', longitud: -75.369824, latitud: 10.444396 },
  { nombre: 'SANTA ROSA DEL SUR', codigo_dane: '13688', departamento: 'Bolívar', longitud: -74.052243, latitud: 7.963938 },
  { nombre: 'SIMITÍ', codigo_dane: '13744', departamento: 'Bolívar', longitud: -73.947264, latitud: 7.953916 },
  { nombre: 'SOPLAVIENTO', codigo_dane: '13760', departamento: 'Bolívar', longitud: -75.136404, latitud: 10.38839 },
  { nombre: 'TALAIGUA NUEVO', codigo_dane: '13780', departamento: 'Bolívar', longitud: -74.567479, latitud: 9.30403 },
  { nombre: 'TIQUISIO', codigo_dane: '13810', departamento: 'Bolívar', longitud: -74.262922, latitud: 8.558666 },
  { nombre: 'TURBACO', codigo_dane: '13836', departamento: 'Bolívar', longitud: -75.427249, latitud: 10.348316 },
  { nombre: 'TURBANÁ', codigo_dane: '13838', departamento: 'Bolívar', longitud: -75.44265, latitud: 10.274585 },
  { nombre: 'VILLANUEVA', codigo_dane: '13873', departamento: 'Bolívar', longitud: -75.275613, latitud: 10.444089 },
  { nombre: 'ZAMBRANO', codigo_dane: '13894', departamento: 'Bolívar', longitud: -74.817879, latitud: 9.746306 },
];

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // 1. Crear municipios
  console.log('📍 Creando municipios...');
  const municipiosCreados = [];
  for (const municipio of municipios) {
    // Verificar si ya existe
    const existente = await prisma.municipio.findFirst({
      where: { codigo_dane: municipio.codigo_dane }
    });

    if (!existente) {
      const municipioCreado = await prisma.municipio.create({
        data: {
          codigo_dane: municipio.codigo_dane,
          nombre: municipio.nombre,
          departamento: municipio.departamento,
          latitud: municipio.latitud,
          longitud: municipio.longitud,
          activo: true,
        },
      });
      municipiosCreados.push(municipioCreado);
    } else {
      municipiosCreados.push(existente);
    }
  }
  console.log(`✅ ${municipiosCreados.length} municipios creados`);

  // 2. Crear usuarios (madrinas, coordinadores, médicos, admin)
  console.log('👥 Creando usuarios...');
  const passwordHash = await bcrypt.hash('123456', 10);

  const usuarios = [
    {
      email: 'superadmin@demo.com',
      password_hash: await bcrypt.hash('superadmin123', 10),
      nombre: 'Super Administrador Master',
      documento: '11111111',
      telefono: '3000000000',
      rol: 'super_admin' as const,
      municipio_id: municipiosCreados[0].id,
    },
    {
      email: 'admin@demo.com',
      password_hash: await bcrypt.hash('admin123', 10),
      nombre: 'Administrador Sistema',
      documento: '12345678',
      telefono: '3001234567',
      rol: 'admin' as const,
      municipio_id: municipiosCreados[0].id,
    },
    {
      email: 'coordinador@demo.com',
      password_hash: await bcrypt.hash('coord123', 10),
      nombre: 'María Coordinadora',
      documento: '23456789',
      telefono: '3002345678',
      rol: 'coordinador' as const,
      municipio_id: municipiosCreados[0].id,
    },
    {
      email: 'medico@demo.com',
      password_hash: await bcrypt.hash('medico123', 10),
      nombre: 'Dr. Carlos Médico',
      documento: '34567890',
      telefono: '3003456789',
      rol: 'medico' as const,
      municipio_id: municipiosCreados[0].id,
    },
    {
      email: 'madrina@demo.com',
      password_hash: await bcrypt.hash('madrina123', 10),
      nombre: 'Ana Madrina Comunitaria',
      documento: '45678901',
      telefono: '3004567890',
      rol: 'madrina' as const,
      municipio_id: municipiosCreados[0].id,
    },
  ];

  const usuariosCreados = [];
  for (const usuario of usuarios) {
    const usuarioCreado = await prisma.usuario.upsert({
      where: { email: usuario.email },
      update: {},
      create: usuario,
    });
    usuariosCreados.push(usuarioCreado);
  }
  console.log(`✅ ${usuariosCreados.length} usuarios creados`);

  // 3. Crear gestantes
  console.log('🤱 Creando gestantes...');
  const madrina = usuariosCreados.find(u => u.rol === 'madrina');
  const medico = usuariosCreados.find(u => u.rol === 'medico');

  const gestantes = [
    {
      documento: '1234567890',
      tipo_documento: 'cedula' as const,
      nombre: 'María Elena Rodríguez García',
      fecha_nacimiento: new Date('1995-03-15'),
      telefono: '3101234567',
      direccion: 'Calle 12 #34-56, Barrio Centro',
      municipio_id: municipiosCreados[0].id,
      madrina_id: madrina?.id,
      medico_tratante_id: medico?.id,
      eps: 'SURA EPS',
      regimen_salud: 'contributivo' as const,
      fecha_ultima_menstruacion: new Date('2024-06-01'),
      fecha_probable_parto: new Date('2025-03-08'),
      riesgo_alto: false,
      activa: true,
    },
    {
      documento: '2345678901',
      tipo_documento: 'cedula' as const,
      nombre: 'Ana Sofía Martínez López',
      fecha_nacimiento: new Date('1992-08-22'),
      telefono: '3102345678',
      direccion: 'Carrera 45 #67-89, Barrio La Esperanza',
      municipio_id: municipiosCreados[1].id,
      madrina_id: madrina?.id,
      medico_tratante_id: medico?.id,
      eps: 'Nueva EPS',
      regimen_salud: 'subsidiado' as const,
      fecha_ultima_menstruacion: new Date('2024-07-15'),
      fecha_probable_parto: new Date('2025-04-22'),
      riesgo_alto: true,
      activa: true,
    },
    {
      documento: '3456789012',
      tipo_documento: 'cedula' as const,
      nombre: 'Carmen Rosa Pérez Díaz',
      fecha_nacimiento: new Date('1988-12-10'),
      telefono: '3103456789',
      direccion: 'Avenida 78 #90-12, Barrio San José',
      municipio_id: municipiosCreados[2].id,
      madrina_id: madrina?.id,
      medico_tratante_id: medico?.id,
      eps: 'Sanitas EPS',
      regimen_salud: 'contributivo' as const,
      fecha_ultima_menstruacion: new Date('2024-05-20'),
      fecha_probable_parto: new Date('2025-02-26'),
      riesgo_alto: false,
      activa: true,
    },
  ];

  const gestantesCreadas = [];
  for (const gestante of gestantes) {
    // Verificar si ya existe
    const existente = await prisma.gestante.findFirst({
      where: { documento: gestante.documento }
    });

    if (!existente) {
      const gestanteCreada = await prisma.gestante.create({
        data: gestante,
      });
      gestantesCreadas.push(gestanteCreada);
    } else {
      gestantesCreadas.push(existente);
    }
  }
  console.log(`✅ ${gestantesCreadas.length} gestantes creadas`);

  // 4. Crear controles prenatales
  console.log('🩺 Creando controles prenatales...');
  const controles = [];

  for (let i = 0; i < gestantesCreadas.length; i++) {
    const gestante = gestantesCreadas[i];

    // Crear 2-3 controles por gestante
    const numControles = Math.floor(Math.random() * 2) + 2; // 2 o 3 controles

    for (let j = 0; j < numControles; j++) {
      const fechaControl = new Date();
      fechaControl.setDate(fechaControl.getDate() - (30 * (numControles - j))); // Controles cada 30 días hacia atrás

      const control = {
        gestante_id: gestante.id,
        realizado_por_id: medico?.id || usuariosCreados[0].id,
        fecha_control: fechaControl,
        semanas_gestacion: 12 + (j * 4), // Incrementar semanas
        peso: 60 + (j * 2) + Math.random() * 5, // Peso progresivo
        altura_uterina: 12 + (j * 3),
        presion_sistolica: 110 + Math.floor(Math.random() * 20),
        presion_diastolica: 70 + Math.floor(Math.random() * 15),
        frecuencia_cardiaca: 70 + Math.floor(Math.random() * 20),
        temperatura: 36.5 + Math.random() * 0.8,
        movimientos_fetales: j > 1 ? 'Presentes' : null,
        edemas: Math.random() > 0.8 ? 'Leve' : null,
        proteinuria: Math.random() > 0.9 ? 'Positiva' : null,
        glucosuria: Math.random() > 0.95 ? 'Positiva' : null,
        observaciones: `Control prenatal #${j + 1}. Evolución normal del embarazo.`,
        recomendaciones: 'Continuar con vitaminas prenatales. Próximo control en 4 semanas.',
        proximo_control: new Date(fechaControl.getTime() + (30 * 24 * 60 * 60 * 1000)), // 30 días después
        realizado: true,
      };

      controles.push(control);
    }
  }

  const controlesCreados = [];
  for (const control of controles) {
    const controlCreado = await prisma.controlPrenatal.create({
      data: control,
    });
    controlesCreados.push(controlCreado);
  }
  console.log(`✅ ${controlesCreados.length} controles prenatales creados`);

  // 5. Crear alertas
  console.log('🚨 Creando alertas...');
  const alertas = [
    {
      gestante_id: gestantesCreadas[1].id, // Ana Sofía (alto riesgo)
      tipo_alerta: 'riesgo_alto' as const,
      nivel_prioridad: 'alta' as const,
      mensaje: 'Gestante con hipertensión arterial requiere seguimiento especial',
      sintomas: ['Dolor de cabeza', 'Visión borrosa', 'Presión arterial elevada'],
      madrina_id: madrina?.id,
      medico_asignado_id: medico?.id,
      resuelta: false,
      generado_por_id: madrina?.id,
    },
    {
      gestante_id: gestantesCreadas[0].id, // María Elena
      tipo_alerta: 'control_vencido' as const,
      nivel_prioridad: 'media' as const,
      mensaje: 'Control prenatal vencido hace 5 días',
      madrina_id: madrina?.id,
      resuelta: false,
      generado_por_id: madrina?.id,
    },
    {
      gestante_id: gestantesCreadas[2].id, // Carmen Rosa
      tipo_alerta: 'sintoma_alarma' as const,
      nivel_prioridad: 'critica' as const,
      mensaje: 'Sangrado vaginal reportado por la gestante',
      sintomas: ['Sangrado vaginal', 'Dolor abdominal'],
      madrina_id: madrina?.id,
      medico_asignado_id: medico?.id,
      resuelta: true,
      resuelto_por_id: medico?.id,
      fecha_resolucion: new Date(),
      tiempo_respuesta: 45, // minutos
      generado_por_id: madrina?.id,
    },
  ];

  const alertasCreadas = [];
  for (const alerta of alertas) {
    const alertaCreada = await prisma.alerta.create({
      data: alerta,
    });
    alertasCreadas.push(alertaCreada);
  }
  console.log(`✅ ${alertasCreadas.length} alertas creadas`);

  console.log('🎉 Seed completado exitosamente!');
  console.log(`📊 Resumen:`);
  console.log(`   - ${municipiosCreados.length} municipios`);
  console.log(`   - ${usuariosCreados.length} usuarios`);
  console.log(`   - ${gestantesCreadas.length} gestantes`);
  console.log(`   - ${controlesCreados.length} controles prenatales`);
  console.log(`   - ${alertasCreadas.length} alertas`);
}

main()
  .catch(e => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
