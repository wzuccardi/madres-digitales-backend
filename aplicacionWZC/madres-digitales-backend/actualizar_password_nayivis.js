const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function actualizarPasswordNayivis() {
  try {
    console.log('🔄 Iniciando actualización de contraseña para nayiviscastrotorres@gmail.com...');
    
    // Generar hash de la nueva contraseña
    const nuevaPassword = 'nayivis03';
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(nuevaPassword, saltRounds);
    
    console.log('🔐 Hash generado:', passwordHash);
    
    // Buscar el usuario primero
    const usuarioExistente = await prisma.usuarios.findUnique({
      where: {
        email: 'nayiviscastrotorres@gmail.com'
      },
      select: {
        id: true,
        email: true,
        nombre: true,
        rol: true,
        activo: true
      }
    });
    
    if (!usuarioExistente) {
      console.log('❌ Usuario no encontrado con email: nayiviscastrotorres@gmail.com');
      return;
    }
    
    console.log('👤 Usuario encontrado:', usuarioExistente);
    
    // Actualizar la contraseña
    const usuarioActualizado = await prisma.usuarios.update({
      where: {
        email: 'nayiviscastrotorres@gmail.com'
      },
      data: {
        password_hash: passwordHash
      },
      select: {
        id: true,
        email: true,
        nombre: true,
        rol: true,
        activo: true,
        updated_at: true
      }
    });
    
    console.log('✅ Contraseña actualizada exitosamente!');
    console.log('📋 Datos del usuario actualizado:', usuarioActualizado);
    console.log('🔑 Nueva contraseña:', nuevaPassword);
    
  } catch (error) {
    console.error('❌ Error al actualizar contraseña:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar la función
actualizarPasswordNayivis();