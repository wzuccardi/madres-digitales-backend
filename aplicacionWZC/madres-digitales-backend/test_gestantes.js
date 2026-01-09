const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testGestantes() {
  try {
    console.log('Buscando gestantes asignadas a la madrina:', 'user_1763791367449_40gzfw');
    
    const gestantesAsignadas = await prisma.gestantes.findMany({
      where: { 
        madrina_id: 'user_1763791367449_40gzfw',
        activa: true 
      },
      select: { 
        id: true,
        nombre: true,
        documento: true,
        madrina_id: true
      }
    });
    
    console.log('Gestantes asignadas encontradas:', gestantesAsignadas);
    console.log('Total:', gestantesAsignadas.length);
    
    // También buscar las gestantes que deberían estar asignadas
    console.log('\nBuscando gestantes de Marylin Monroe y Malinda Pinguin:');
    const gestantesEspecificas = await prisma.gestantes.findMany({
      where: {
        OR: [
          { nombre: { contains: 'Marylin' } },
          { nombre: { contains: 'Malinda' } }
        ]
      },
      select: { 
        id: true,
        nombre: true,
        documento: true,
        madrina_id: true
      }
    });
    
    console.log('Gestantes específicas:', gestantesEspecificas);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testGestantes();