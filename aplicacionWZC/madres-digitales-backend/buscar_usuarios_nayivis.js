const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function buscarUsuariosNayivis() {
  try {
    console.log('🔍 Buscando usuarios que contengan "nayivis"...');
    
    // Buscar usuarios que contengan "nayivis" en el email o nombre
    const usuarios = await prisma.usuarios.findMany({
      where: {
        OR: [
          {
            email: {
              contains: 'nayivis',
              mode: 'insensitive'
            }
          },
          {
            nombre: {
              contains: 'nayivis',
              mode: 'insensitive'
            }
          }
        ]
      },
      select: {
        id: true,
        email: true,
        nombre: true,
        rol: true,
        activo: true,
        created_at: true
      }
    });
    
    if (usuarios.length === 0) {
      console.log('❌ No se encontraron usuarios con "nayivis"');
      
      // Mostrar algunos usuarios para referencia
      console.log('📋 Mostrando primeros 10 usuarios en la base de datos:');
      const todosUsuarios = await prisma.usuarios.findMany({
        take: 10,
        select: {
          id: true,
          email: true,
          nombre: true,
          rol: true,
          activo: true
        }
      });
      
      todosUsuarios.forEach((usuario, index) => {
        console.log(`${index + 1}. ${usuario.email} - ${usuario.nombre} (${usuario.rol})`);
      });
      
    } else {
      console.log(`✅ Encontrados ${usuarios.length} usuario(s):`);
      usuarios.forEach((usuario, index) => {
        console.log(`${index + 1}. ID: ${usuario.id}`);
        console.log(`   Email: ${usuario.email}`);
        console.log(`   Nombre: ${usuario.nombre}`);
        console.log(`   Rol: ${usuario.rol}`);
        console.log(`   Activo: ${usuario.activo}`);
        console.log(`   Creado: ${usuario.created_at}`);
        console.log('---');
      });
    }
    
  } catch (error) {
    console.error('❌ Error al buscar usuarios:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar la función
buscarUsuariosNayivis();