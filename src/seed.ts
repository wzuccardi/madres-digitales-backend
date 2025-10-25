/// <reference types="node" />

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

const municipiosBolivar = [
  { codigo_dane: '13006', nombre: 'ACHI', activo: false },
  { codigo_dane: '13030', nombre: 'ALTOS DEL ROSARIO', activo: true },
  { codigo_dane: '13042', nombre: 'ARENAL', activo: false },
  { codigo_dane: '13052', nombre: 'ARJONA', activo: true },
  { codigo_dane: '13062', nombre: 'ARROYOHONDO', activo: false },
  { codigo_dane: '13074', nombre: 'BARRANCO DE LOBA', activo: true },
  { codigo_dane: '13188', nombre: 'CICUCO', activo: false },
  { codigo_dane: '13212', nombre: 'CLEMENCIA', activo: true },
  { codigo_dane: '13244', nombre: 'EL CARMEN DE BOLIVAR', activo: true },
  { codigo_dane: '13430', nombre: 'MAGANGUE', activo: true },
  { codigo_dane: '13442', nombre: 'MARIA LA BAJA', activo: true },
  { codigo_dane: '13458', nombre: 'SANTA CRUZ DE MOMPOX', activo: true },
  { codigo_dane: '13688', nombre: 'SANTA ROSA DEL SUR', activo: true },
  { codigo_dane: '13744', nombre: 'SIMITI', activo: true },
  { codigo_dane: '13001', nombre: 'CARTAGENA', activo: false },
];

async function main() {
  // Limpiar datos en orden inverso a las dependencias
  await prisma.controlPrenatal.deleteMany();
  await prisma.alerta.deleteMany();
  await prisma.gestante.deleteMany();
  await prisma.dispositivo.deleteMany();
  await prisma.medico.deleteMany();
  await prisma.iPS.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.municipio.deleteMany();

  // Insertar municipios
  for (const m of municipiosBolivar) {
    const existingMunicipio = await prisma.municipio.findFirst({
      where: { codigo_dane: m.codigo_dane }
    });
    
    if (!existingMunicipio) {
      await prisma.municipio.create({
        data: {
          id: randomUUID(),
          codigo_dane: m.codigo_dane,
          nombre: m.nombre,
          departamento: 'Bolívar',
          activo: m.activo,
        },
      });
    } else {
      await prisma.municipio.update({
        where: { id: existingMunicipio.id },
        data: { activo: m.activo },
      });
    }
  }
  console.log('✅ Municipios insertados correctamente');

  // Obtener ID de ARJONA
  const municipioId = (await prisma.municipio.findFirst({ where: { nombre: 'ARJONA' } }))?.id;
  if (!municipioId) {
    throw new Error('No se encontró el municipio ARJONA');
  }

  // Usuarios de prueba
  const users = [
    {
      email: 'admin@demo.com',
      password: 'admin123',
      nombre: 'Admin Demo',
      rol: 'admin',
    },
    {
      email: 'coordinador@demo.com',
      password: 'coord123',
      nombre: 'Coordinador Demo',
      rol: 'coordinador',
    },
    {
      email: 'medico@demo.com',
      password: 'medico123',
      nombre: 'Medico Demo',
      rol: 'medico',
    },
    {
      email: 'madrina@demo.com',
      password: 'madrina123',
      nombre: 'Madrina Demo',
      rol: 'madrina',
    },
  ];

  for (const u of users) {
    const password_hash = await bcrypt.hash(u.password, 10);
    await prisma.usuario.upsert({
      where: { email: u.email },
      update: {},
      create: {
        id: randomUUID(),
        email: u.email,
        password_hash,
        nombre: u.nombre,
        rol: u.rol,
        municipio_id: municipioId,
      },
    });
  }
  console.log('✅ Usuarios insertados correctamente');

  // IPS de ejemplo
  const ipsId = randomUUID();
  const ipsData = {
    nombre: 'IPS Arjona',
    nit: '900123456',
    direccion: 'Cra 1 #1-01',
    municipio_id: municipioId,
    nivel_atencion: 'primario',
    activa: true,
  };

  const ips = await prisma.iPS.upsert({
    where: { id: ipsId },
    update: {},
    create: {
      id: ipsId,
      nombre: ipsData.nombre,
      nit: ipsData.nit,
      direccion: ipsData.direccion,
      municipio_id: ipsData.municipio_id,
      nivel: ipsData.nivel_atencion,
      activo: ipsData.activa,
    },
  });
  console.log('✅ IPS insertada correctamente');

  // Médico de ejemplo
  const medicoId = randomUUID();
  const medicoData = {
    nombre: 'Dr. Juan Pérez',
    documento: '123456789',
    registro_medico: 'RM123',
    especialidad: 'Ginecología',
    telefono: '3001234567',
    email: 'juan.perez@ipsarjona.com',
    ips_id: ips.id,
    activo: true,
  };

  await prisma.medico.upsert({
    where: { id: medicoId },
    update: {},
    create: {
      id: medicoId,
      ...medicoData,
    },
  });
  console.log('✅ Médico insertado correctamente');

  // Dispositivo de ejemplo
  const dispositivoId = randomUUID();
  const dispositivoData = {
    device_id: 'SN123456',
    device_name: 'Tablet X',
    usuario_id: users[0].email, // Usar el primer usuario como referencia
  };

  await prisma.dispositivo.upsert({
    where: { device_id: dispositivoData.device_id },
    update: {},
    create: {
      id: dispositivoId,
      usuario_id: (await prisma.usuario.findFirst({ where: { email: users[0].email } }))?.id || '',
      device_id: dispositivoData.device_id,
      device_name: dispositivoData.device_name,
    },
  });
  console.log('✅ Dispositivo insertado correctamente');

  // Gestante de ejemplo
  const gestanteId = randomUUID();
  const gestanteData = {
    documento: '100200300',
    tipo_documento: 'cedula',
    nombre: 'Gestante Demo',
    fecha_nacimiento: new Date('1995-05-10'),
    telefono: '3012345678',
    direccion: 'Calle 5',
    municipio_id: municipioId,
    eps: 'EPS Demo',
    regimen_salud: 'subsidiado',
    activa: true,
  };

  await prisma.gestante.upsert({
    where: { id: gestanteId },
    update: {},
    create: {
      id: gestanteId,
      ...gestanteData,
    },
  });
  console.log('✅ Gestante insertada correctamente');

  // Mostrar credenciales
  console.log('\n🔑 Credenciales de prueba disponibles:');
  console.log('Admin: admin@demo.com / admin123');
  console.log('Coordinador: coordinador@demo.com / coord123');
  console.log('Médico: medico@demo.com / medico123');
  console.log('Madrina: madrina@demo.com / madrina123');
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });