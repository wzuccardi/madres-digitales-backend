import { PrismaClient, IpsNivel } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🏥 Iniciando seed de IPS y Médicos...');

  // Obtener municipios
  const municipios = await prisma.municipio.findMany({ take: 5 });
  
  if (municipios.length === 0) {
    console.error('❌ No hay municipios en la base de datos');
    return;
  }

  // Crear IPS
  console.log('🏥 Creando IPS...');
  const ipsData = [
    {
      codigo_habilitacion: 'IPS001',
      nombre: 'Hospital San José',
      nit: '900123456',
      direccion: 'Calle 10 #20-30',
      telefono: '3001234567',
      nivel_atencion: IpsNivel.terciario,
      municipio_id: municipios[0].id,
      activa: true,
    },
    {
      codigo_habilitacion: 'IPS002',
      nombre: 'Centro de Salud María Auxiliadora',
      nit: '900234567',
      direccion: 'Carrera 5 #15-20',
      telefono: '3002345678',
      nivel_atencion: IpsNivel.secundario,
      municipio_id: municipios[1].id,
      activa: true,
    },
    {
      codigo_habilitacion: 'IPS003',
      nombre: 'Clínica del Norte',
      nit: '900345678',
      direccion: 'Avenida 8 #25-40',
      telefono: '3003456789',
      nivel_atencion: IpsNivel.terciario,
      municipio_id: municipios[2].id,
      activa: true,
    },
    {
      codigo_habilitacion: 'IPS004',
      nombre: 'Puesto de Salud El Carmen',
      nit: '900456789',
      direccion: 'Calle 3 #10-15',
      telefono: '3004567890',
      nivel_atencion: IpsNivel.primario,
      municipio_id: municipios[3].id,
      activa: true,
    },
    {
      codigo_habilitacion: 'IPS005',
      nombre: 'Hospital Regional',
      nit: '900567890',
      direccion: 'Carrera 12 #30-50',
      telefono: '3005678901',
      nivel_atencion: IpsNivel.secundario,
      municipio_id: municipios[4].id,
      activa: true,
    },
  ];

  const ipsCreadas = [];
  for (const ips of ipsData) {
    const existente = await prisma.ips.findFirst({
      where: { codigo_habilitacion: ips.codigo_habilitacion }
    });
    
    if (!existente) {
      const ipsCreada = await prisma.ips.create({ data: ips });
      ipsCreadas.push(ipsCreada);
    } else {
      ipsCreadas.push(existente);
    }
  }
  console.log(`✅ ${ipsCreadas.length} IPS creadas`);

  // Crear Médicos
  console.log('👨‍⚕️ Creando médicos...');
  const medicosData = [
    {
      nombre: 'Dr. Carlos Rodríguez',
      documento: '12345678',
      registro_medico: 'RM001',
      especialidad: 'Ginecología',
      telefono: '3101234567',
      email: 'carlos.rodriguez@hospital.com',
      ips_id: ipsCreadas[0].id,
      activo: true,
    },
    {
      nombre: 'Dra. María González',
      documento: '23456789',
      registro_medico: 'RM002',
      especialidad: 'Obstetricia',
      telefono: '3102345678',
      email: 'maria.gonzalez@clinica.com',
      ips_id: ipsCreadas[1].id,
      activo: true,
    },
    {
      nombre: 'Dr. Juan Pérez',
      documento: '34567890',
      registro_medico: 'RM003',
      especialidad: 'Medicina General',
      telefono: '3103456789',
      email: 'juan.perez@centro.com',
      ips_id: ipsCreadas[2].id,
      activo: true,
    },
    {
      nombre: 'Dra. Ana Martínez',
      documento: '45678901',
      registro_medico: 'RM004',
      especialidad: 'Ginecología',
      telefono: '3104567890',
      email: 'ana.martinez@hospital.com',
      ips_id: ipsCreadas[3].id,
      activo: true,
    },
    {
      nombre: 'Dr. Luis Sánchez',
      documento: '56789012',
      registro_medico: 'RM005',
      especialidad: 'Pediatría',
      telefono: '3105678901',
      email: 'luis.sanchez@clinica.com',
      ips_id: ipsCreadas[4].id,
      activo: true,
    },
  ];

  let medicosCreados = 0;
  for (const medico of medicosData) {
    const existente = await prisma.medico.findFirst({
      where: { documento: medico.documento }
    });
    
    if (!existente) {
      await prisma.medico.create({ data: medico });
      medicosCreados++;
    }
  }
  console.log(`✅ ${medicosCreados} médicos creados`);

  console.log('🎉 Seed de IPS y Médicos completado!');
  console.log('📊 Resumen:');
  console.log(`   - ${ipsCreadas.length} IPS`);
  console.log(`   - ${medicosCreados} médicos`);

  await prisma.$disconnect();
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  });

