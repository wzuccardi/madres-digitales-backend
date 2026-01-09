const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function buscarUsuario() {
  try {
    console.log('🔍 Buscando usuarios con "maura" en el email o nombre...\n');
    
    // Buscar por email
    const usuariosPorEmail = await prisma.usuarios.findMany({
      where: {
        OR: [
          { email: { contains: 'maura', mode: 'insensitive' } },
          { nombre: { contains: 'maura', mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        email: true,
        nombre: true,
        rol: true,
        activo: true,
        documento: true
      }
    });
    
    if (usuariosPorEmail.length > 0) {
      console.log('✅ Usuarios encontrados:');
      usuariosPorEmail.forEach(u => {
        console.log(`\nID: ${u.id}`);
        console.log(`Email: ${u.email}`);
        console.log(`Nombre: ${u.nombre}`);
        console.log(`Documento: ${u.documento || 'N/A'}`);
        console.log(`Rol: ${u.rol}`);
        console.log(`Activo: ${u.activo}`);
      });
    } else {
      console.log('❌ No se encontraron usuarios con "maura"');
      
      // Listar todos los usuarios
      console.log('\n📋 Listando todos los usuarios:');
      const todosUsuarios = await prisma.usuarios.findMany({
        select: {
          email: true,
          nombre: true,
          rol: true
        },
        orderBy: {
          nombre: 'asc'
        }
      });
      
      todosUsuarios.forEach(u => {
        console.log(`- ${u.nombre} (${u.email}) - ${u.rol}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

buscarUsuario();
