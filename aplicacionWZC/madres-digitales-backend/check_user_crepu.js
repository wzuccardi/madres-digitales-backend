/**
 * Script para verificar si existe crepu@gmail.com en producción
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCrepuUser() {
  console.log('🔍 ==========================================');
  console.log('🔍 VERIFICANDO USUARIO: crepu@gmail.com');
  console.log('🔍 ==========================================\n');
  
  try {
    await prisma.$connect();
    
    // Buscar usuario por email
    console.log('📧 Buscando por email: crepu@gmail.com');
    const userByEmail = await prisma.usuarios.findUnique({
      where: { email: 'crepu@gmail.com' }
    });
    
    if (userByEmail) {
      console.log('✅ USUARIO ENCONTRADO por email:');
      console.log(`   ID: ${userByEmail.id}`);
      console.log(`   Nombre: ${userByEmail.nombre}`);
      console.log(`   Email: ${userByEmail.email}`);
      console.log(`   Rol: ${userByEmail.rol}`);
      console.log(`   Activo: ${userByEmail.activo}`);
      console.log(`   Fecha creación: ${userByEmail.fecha_creacion}`);
    } else {
      console.log('❌ NO ENCONTRADO por email: crepu@gmail.com');
    }
    
    // Buscar usuarios con nombre similar a "crepu"
    console.log('\n🔍 Buscando usuarios con nombre similar a "crepu":');
    const usersByName = await prisma.usuarios.findMany({
      where: {
        nombre: {
          contains: 'crepu',
          mode: 'insensitive'
        }
      }
    });
    
    if (usersByName.length > 0) {
      console.log(`✅ ENCONTRADOS ${usersByName.length} usuarios con nombre similar:`);
      usersByName.forEach(user => {
        console.log(`   - ID: ${user.id}`);
        console.log(`     Nombre: ${user.nombre}`);
        console.log(`     Email: ${user.email}`);
        console.log(`     Rol: ${user.rol}`);
        console.log(`     Activo: ${user.activo}`);
        console.log('');
      });
    } else {
      console.log('❌ NO ENCONTRADOS usuarios con nombre similar a "crepu"');
    }
    
    // Listar todas las madrinas
    console.log('\n👩‍⚕️ TODAS LAS MADRINAS EN LA BASE DE DATOS:');
    const madrinas = await prisma.usuarios.findMany({
      where: { rol: 'MADRINA' },
      select: {
        id: true,
        nombre: true,
        email: true,
        activo: true,
        fecha_creacion: true
      }
    });
    
    console.log(`\n📊 Total de madrinas: ${madrinas.length}\n`);
    madrinas.forEach((madrina, index) => {
      console.log(`${index + 1}. ${madrina.nombre}`);
      console.log(`   Email: ${madrina.email}`);
      console.log(`   ID: ${madrina.id}`);
      console.log(`   Activo: ${madrina.activo}`);
      console.log(`   Creado: ${madrina.fecha_creacion}`);
      console.log('');
    });
    
    // Verificar si hay gestantes asignadas a "Crepu"
    console.log('\n🤰 GESTANTES ASIGNADAS A USUARIOS CON NOMBRE "CREPU":');
    for (const user of usersByName) {
      const gestantesCount = await prisma.gestantes.count({
        where: { madrina_id: user.id }
      });
      console.log(`   ${user.nombre} (${user.email}): ${gestantesCount} gestantes`);
    }
    
    console.log('\n🔍 ==========================================');
    console.log('✅ VERIFICACIÓN COMPLETADA');
    console.log('🔍 ==========================================\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkCrepuUser().catch(console.error);