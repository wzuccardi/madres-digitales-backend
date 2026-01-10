const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function searchMarylin() {
  try {
    console.log('Buscando Marylin Monroe con diferentes variaciones:');
    
    const gestantes = await prisma.gestantes.findMany({
      where: {
        OR: [
          { nombre: { contains: 'marylin', mode: 'insensitive' } },
          { nombre: { contains: 'monroe', mode: 'insensitive' } },
          { nombre: { contains: 'marilyn', mode: 'insensitive' } },
          { id: 'gestante_1763277531205_ti6w59' }
        ]
      },
      select: { 
        id: true,
        nombre: true,
        documento: true,
        madrina_id: true
      }
    });
    
    console.log('Gestantes encontradas:', gestantes);
    
    // También buscar por el ID específico que mencionaste
    console.log('\nBuscando por ID gestante_1763277531205_ti6w59:');
    const gestanteById = await prisma.gestantes.findUnique({
      where: { id: 'gestante_1763277531205_ti6w59' },
      select: { 
        id: true,
        nombre: true,
        documento: true,
        madrina_id: true
      }
    });
    
    console.log('Gestante por ID:', gestanteById);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

searchMarylin();