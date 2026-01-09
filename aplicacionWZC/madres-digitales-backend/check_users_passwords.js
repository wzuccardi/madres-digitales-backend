/**
 * Script para verificar usuarios y sus contraseñas
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function checkUsers() {
  console.log('👥 ==========================================');
  console.log('👥 VERIFICANDO USUARIOS Y CONTRASEÑAS');
  console.log('👥 ==========================================\n');
  
  try {
    await prisma.$connect();
    
    // Obtener todos los usuarios
    const usuarios = await prisma.usuarios.findMany({
      select: {
        id: true,
        nombre: true,
        email: true,
        password_hash: true,
        rol: true,
        activo: true
      }
    });
    
    console.log(`📊 Total de usuarios: ${usuarios.length}\n`);
    
    for (const usuario of usuarios) {
      console.log(`👤 ${usuario.nombre}`);
      console.log(`   Email: ${usuario.email}`);
      console.log(`   Rol: ${usuario.rol}`);
      console.log(`   Activo: ${usuario.activo}`);
      console.log(`   ID: ${usuario.id}`);
      console.log(`   Password Hash: ${usuario.password_hash.substring(0, 20)}...`);
      
      // Probar contraseñas comunes
      const passwordsToTest = ['password123', '123456', 'admin', usuario.nombre.toLowerCase()];
      
      for (const password of passwordsToTest) {
        try {
          const isValid = await bcrypt.compare(password, usuario.password_hash);
          if (isValid) {
            console.log(`   ✅ Contraseña encontrada: "${password}"`);
            break;
          }
        } catch (error) {
          // Ignorar errores de bcrypt
        }
      }
      
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers().catch(console.error);