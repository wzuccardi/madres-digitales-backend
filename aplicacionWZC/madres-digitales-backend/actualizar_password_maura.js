const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function actualizarPassword() {
  try {
    console.log('🔐 Actualizando contraseña para maurapfr0306@gmail.com...');
    
    // Generar hash de la nueva contraseña
    const nuevaPassword = '1049932839';
    const passwordHash = await bcrypt.hash(nuevaPassword, 10);
    
    console.log('Hash generado:', passwordHash);
    
    // Actualizar en la base de datos
    const resultado = await prisma.usuarios.update({
      where: {
        email: 'maurapfr0306@gmail.com'
      },
      data: {
        password_hash: passwordHash
      }
    });
    
    console.log('✅ Contraseña actualizada exitosamente');
    console.log('Usuario:', resultado.email);
    console.log('Nombre:', resultado.nombre);
    console.log('Rol:', resultado.rol);
    console.log('Activo:', resultado.activo);
    
  } catch (error) {
    console.error('❌ Error al actualizar contraseña:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

actualizarPassword();
