const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findUser() {
  try {
    console.log('Buscando usuario con ID user_1763271159091_icaaa5:');
    
    const user = await prisma.usuarios.findUnique({
      where: { id: 'user_1763271159091_icaaa5' },
      select: { 
        id: true,
        nombre: true,
        email: true,
        rol: true
      }
    });
    
    console.log('Usuario encontrado:', user);
    
    // También buscar todas las gestantes asignadas a este usuario
    console.log('\nGestantes asignadas a este usuario:');
    const gestantes = await prisma.gestantes.findMany({
      where: { madrina_id: 'user_1763271159091_icaaa5' },
      select: { 
        id: true,
        nombre: true,
        documento: true
      }
    });
    
    console.log('Gestantes:', gestantes);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

findUser();