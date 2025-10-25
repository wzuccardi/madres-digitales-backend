import prisma from '../config/database';

async function checkWzuccardiRole() {
  try {
    console.log('🔍 Verificando rol del usuario wzuccardi@gmail.com...');
    
    const user = await prisma.usuario.findUnique({
      where: {
        email: 'wzuccardi@gmail.com'
      }
    });

    if (!user) {
      console.log('❌ Usuario no encontrado');
      return;
    }

    console.log('✅ Usuario encontrado:');
    console.log('   - ID:', user.id);
    console.log('   - Email:', user.email);
    console.log('   - Nombre:', user.nombre);
    console.log('   - ROL:', user.rol);
    console.log('   - Activo:', user.activo);
    console.log('   - Creado:', user.created_at);

    if (user.rol !== 'super_admin') {
      console.log('🔄 Actualizando rol a super_admin...');
      
      const updatedUser = await prisma.usuario.update({
        where: {
          email: 'wzuccardi@gmail.com'
        },
        data: {
          rol: 'super_admin'
        }
      });

      console.log('✅ Rol actualizado:');
      console.log('   - Nuevo ROL:', updatedUser.rol);
    } else {
      console.log('✅ El usuario ya tiene rol super_admin');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkWzuccardiRole();