/**
 * Script para resetear la contraseña de Crepu
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function resetCrepuPassword() {
  console.log('🔐 Reseteando contraseña de Crepu...\n');
  
  try {
    await prisma.$connect();
    
    // Buscar usuario Crepu
    const crepu = await prisma.usuarios.findUnique({
      where: { email: 'crepu@gmail.com' }
    });
    
    if (!crepu) {
      console.log('❌ Usuario crepu@gmail.com no encontrado');
      return;
    }
    
    console.log(`✅ Usuario encontrado: ${crepu.nombre} (${crepu.rol})`);
    
    // Generar nueva contraseña hasheada
    const newPassword = 'password123';
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Actualizar contraseña
    await prisma.usuarios.update({
      where: { id: crepu.id },
      data: { password_hash: hashedPassword }
    });
    
    console.log(`✅ Contraseña actualizada para ${crepu.nombre}`);
    console.log(`   Nueva contraseña: ${newPassword}`);
    console.log(`   Email: ${crepu.email}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

resetCrepuPassword().catch(console.error);