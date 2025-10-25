import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createMedicos() {
  try {
    console.log('👨‍⚕️ Creando médicos de Bolívar...');

    // Lista de médicos de Bolívar
    const medicos = [
      { 
        nombre: 'Dr. Carlos Alberto Martínez', 
        email: 'carlos.martinez@maternidadbolivar.com',
        telefono: '3001234567',
        especialidad: 'Ginecología y Obstetricia',
        registro_medico: 'RM-12345',
        municipio_id: '13001', // Cartagena
        ips_asignada_id: null, // Se asignará después
        password: 'medico123'
      },
      { 
        nombre: 'Dra. María Fernanda López', 
        email: 'maria.lopez@hospitaluniversitario.com',
        telefono: '3001234568',
        especialidad: 'Ginecología y Obstetricia',
        registro_medico: 'RM-12346',
        municipio_id: '13001', // Cartagena
        ips_asignada_id: null, // Se asignará después
        password: 'medico123'
      },
      { 
        nombre: 'Dr. José Miguel Rodríguez', 
        email: 'jose.rodriguez@saludmamona.com',
        telefono: '3001234569',
        especialidad: 'Medicina Familiar',
        registro_medico: 'RM-12347',
        municipio_id: '13470', // Magangué
        ips_asignada_id: null, // Se asignará después
        password: 'medico123'
      },
      { 
        nombre: 'Dra. Ana María Castro', 
        email: 'ana.castro@hospitalsanjuandedios.com',
        telefono: '3001234570',
        especialidad: 'Pediatría',
        registro_medico: 'RM-12348',
        municipio_id: '13847', // El Carmen de Bolívar
        ips_asignada_id: null, // Se asignará después
        password: 'medico123'
      },
      { 
        nombre: 'Dr. Luis Eduardo Silva', 
        email: 'luis.silva@ipsmariabaja.com',
        telefono: '3001234571',
        especialidad: 'Medicina General',
        registro_medico: 'RM-12349',
        municipio_id: '13445', // María la Baja
        ips_asignada_id: null, // Se asignará después
        password: 'medico123'
      },
      { 
        nombre: 'Dra. Patricia Gómez', 
        email: 'patricia.gomez@ipsturbaco.com',
        telefono: '3001234572',
        especialidad: 'Ginecología',
        registro_medico: 'RM-12350',
        municipio_id: '13880', // Turbaco
        ips_asignada_id: null, // Se asignará después
        password: 'medico123'
      },
      { 
        nombre: 'Dr. Ricardo Hernández', 
        email: 'ricardo.hernandez@ipsarjona.com',
        telefono: '3001234573',
        especialidad: 'Medicina Familiar',
        registro_medico: 'RM-12351',
        municipio_id: '13073', // Arjona
        ips_asignada_id: null, // Se asignará después
        password: 'medico123'
      },
      { 
        nombre: 'Dra. Sofía Martínez', 
        email: 'sofia.martinez@hospitalsanrafael.com',
        telefono: '3001234574',
        especialidad: 'Obstetricia',
        registro_medico: 'RM-12352',
        municipio_id: '15320', // San Juan Nepomuceno
        ips_asignada_id: null, // Se asignará después
        password: 'medico123'
      },
      { 
        nombre: 'Dr. Andrés Felipe Torres', 
        email: 'andres.torres@ipssanjacinto.com',
        telefono: '3001234575',
        especialidad: 'Medicina General',
        registro_medico: 'RM-12353',
        municipio_id: '15294', // San Jacinto
        ips_asignada_id: null, // Se asignará después
        password: 'medico123'
      },
      { 
        nombre: 'Dra. Laura Daniela Vargas', 
        email: 'laura.vargas@ipsmompox.com',
        telefono: '3001234576',
        especialidad: 'Ginecología y Obstetricia',
        registro_medico: 'RM-12354',
        municipio_id: '14720', // Mompox
        ips_asignada_id: null, // Se asignará después
        password: 'medico123'
      }
    ];

    // Obtener las IPS para asignarlas a los médicos
    const ips = await prisma.iPS.findMany({
      select: { id: true, nombre: true, municipio_id: true }
    });

    // Crear un mapa de municipios a IPS
    const municipioToIPS = new Map();
    ips.forEach(ip => {
      if (!municipioToIPS.has(ip.municipio_id)) {
        municipioToIPS.set(ip.municipio_id, ip.id);
      }
    });

    let creados = 0;
    let yaExisten = 0;

    for (const medico of medicos) {
      // Verificar si ya existe
      const existing = await prisma.usuario.findFirst({
        where: { email: medico.email }
      });

      if (!existing) {
        // Buscar el municipio por código DANE
        const municipio = await prisma.municipio.findFirst({
          where: { codigo_dane: medico.municipio_id }
        });

        if (!municipio) {
          console.log(`⚠️ No se encontró municipio con código DANE ${medico.municipio_id}, omitiendo médico ${medico.nombre}`);
          continue;
        }

        // Asignar IPS si existe para ese municipio
        const ipsId = municipioToIPS.get(municipio.id);

        // Encriptar contraseña
        const hashedPassword = await bcrypt.hash(medico.password, 10);

        await prisma.usuario.create({
          data: {
            nombre: medico.nombre,
            email: medico.email,
            password_hash: hashedPassword,
            telefono: medico.telefono,
            rol: 'medico',
            municipio_id: municipio.id,
            activo: true,
            fecha_creacion: new Date(),
            fecha_actualizacion: new Date()
          }
        });

        // Crear el registro en la tabla Medico
        const usuario = await prisma.usuario.findFirst({
          where: { email: medico.email },
          select: { id: true }
        });

        if (usuario) {
          await prisma.medico.create({
            data: {
              id: usuario.id,
              nombre: medico.nombre,
              especialidad: medico.especialidad,
              registro_medico: medico.registro_medico,
              activo: true,
              fecha_creacion: new Date(),
              fecha_actualizacion: new Date()
            }
          });
        }

        console.log(`✅ Creado: ${medico.nombre} en ${municipio.nombre}`);
        creados++;
      } else {
        console.log(`⚠️ Ya existe: ${medico.nombre}`);
        yaExisten++;
      }
    }

    console.log('\n📊 Resumen:');
    console.log(`✅ Médicos creados: ${creados}`);
    console.log(`⚠️ Médicos que ya existían: ${yaExisten}`);
    console.log(`📍 Total médicos: ${creados + yaExisten}`);

  } catch (error) {
    console.error('❌ Error creando médicos:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createMedicos()
  .then(() => {
    console.log('✅ Script completado');
    process.exit(0);
  })
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  });