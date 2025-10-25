import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('👤 Creando usuario administrador...');

    // Verificar si ya existe un super_admin
    const existingAdmin = await prisma.usuario.findFirst({
      where: {
        rol: 'super_admin'
      }
    });

    if (existingAdmin) {
      console.log('✅ Ya existe un super administrador:', existingAdmin.email);
      console.log('📧 Email:', existingAdmin.email);
      console.log('🔑 Rol:', existingAdmin.rol);
      return;
    }

    // Crear usuario super administrador (wzuccardi)
    const password = '73102604722';
    const hashedPassword = await bcrypt.hash(password, 10);

    const adminUser = await prisma.usuario.create({
      data: {
        email: 'wzuccardi@gmail.com',
        password_hash: hashedPassword,
        nombre: 'Wilson Zuccardi',
        telefono: '3001234567',
        rol: 'super_admin',
        activo: true
      }
    });

    console.log('✅ Usuario super administrador creado exitosamente!');
    console.log('📧 Email:', adminUser.email);
    console.log('🔑 Password:', password);
    console.log('👤 Nombre:', adminUser.nombre);
    console.log('🎭 Rol:', adminUser.rol);

    // Crear algunos usuarios adicionales para pruebas
    const coordinadorPassword = 'coord123';
    const coordinadorHash = await bcrypt.hash(coordinadorPassword, 10);

    const coordinador = await prisma.usuario.create({
      data: {
        email: 'coordinador@madresdigitales.com',
        password_hash: coordinadorHash,
        nombre: 'María Coordinadora',
        telefono: '3007654321',
        rol: 'coordinador',
        activo: true
      }
    });

    console.log('\n✅ Usuario coordinador creado:');
    console.log('📧 Email:', coordinador.email);
    console.log('🔑 Password:', coordinadorPassword);

    const medicoPassword = 'medico123';
    const medicoHash = await bcrypt.hash(medicoPassword, 10);

    const medico = await prisma.usuario.create({
      data: {
        email: 'medico@madresdigitales.com',
        password_hash: medicoHash,
        nombre: 'Dr. Carlos Médico',
        telefono: '3009876543',
        rol: 'medico',
        activo: true
      }
    });

    console.log('\n✅ Usuario médico creado:');
    console.log('📧 Email:', medico.email);
    console.log('🔑 Password:', medicoPassword);

    console.log('\n🎉 Usuarios de prueba creados exitosamente!');
    // Crear usuario madrina demo
    const madrinaPassword = 'madrina123';
    const madrinaHash = await bcrypt.hash(madrinaPassword, 10);

    const madrina = await prisma.usuario.create({
      data: {
        email: 'madrina@madresdigitales.com',
        password_hash: madrinaHash,
        nombre: 'Ana Madrina',
        telefono: '3005555555',
        rol: 'madrina',
        activo: true
      }
    });

    console.log('\n✅ Usuario madrina creado:');
    console.log('📧 Email:', madrina.email);
    console.log('🔑 Password:', madrinaPassword);

    // Crear usuario admin demo
    const adminDemoPassword = 'admin123';
    const adminDemoHash = await bcrypt.hash(adminDemoPassword, 10);

    const adminDemo = await prisma.usuario.create({
      data: {
        email: 'admin@madresdigitales.com',
        password_hash: adminDemoHash,
        nombre: 'Admin Demo',
        telefono: '3004444444',
        rol: 'admin',
        activo: true
      }
    });

    console.log('\n✅ Usuario admin demo creado:');
    console.log('📧 Email:', adminDemo.email);
    console.log('🔑 Password:', adminDemoPassword);

    console.log('\n🎉 Usuarios de prueba creados exitosamente!');
    console.log('\n📋 Resumen de credenciales:');
    console.log('1. 🔥 Super Admin (Wilson): wzuccardi@gmail.com / 73102604722');
    console.log('2. 👥 Coordinador: coordinador@madresdigitales.com / coord123');
    console.log('3. 👨‍⚕️ Médico: medico@madresdigitales.com / medico123');
    console.log('4. 👩‍👧‍👦 Madrina: madrina@madresdigitales.com / madrina123');
    console.log('5. ⚙️ Admin: admin@madresdigitales.com / admin123');

  } catch (error) {
    console.error('❌ Error creando usuarios:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
