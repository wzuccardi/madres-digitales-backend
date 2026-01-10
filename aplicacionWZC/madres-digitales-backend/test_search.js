const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function searchGestantes() {
  try {
    console.log('Buscando todas las gestantes que contengan Marylin o Malinda:');
    
    const gestantes = await prisma.gestantes.findMany({
      where: {
        OR: [
          { nombre: { contains: 'Marylin', mode: 'insensitive' } },
          { nombre: { contains: 'Malinda', mode: 'insensitive' } },
          { nombre: { contains: 'Monroe', mode: 'insensitive' } },
          { nombre: { contains: 'Pinguin', mode: 'insensitive' } }
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
    
    // También buscar por ID si es que existen
    console.log('\nBuscando por IDs específicos:');
    const gestantesById = await prisma.gestantes.findMany({
      where: {
        OR: [
          { id: 'gestante_1763277531205_ti6w59' },
          { id: 'gestante_1763612771433_jqobr3' }
        ]
      },
      select: { 
        id: true,
        nombre: true,
        documento: true,
        madrina_id: true
      }
    });
    
    console.log('Gestantes por ID:', gestantesById);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

searchGestantes();