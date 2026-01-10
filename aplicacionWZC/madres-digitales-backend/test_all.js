const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listAllGestantes() {
  try {
    console.log('Listando todas las gestantes:');
    
    const gestantes = await prisma.gestantes.findMany({
      where: { activa: true },
      select: { 
        id: true,
        nombre: true,
        documento: true,
        madrina_id: true
      },
      take: 20
    });
    
    console.log('Total gestantes activas:', gestantes.length);
    gestantes.forEach((g, index) => {
      console.log(`${index + 1}. ${g.nombre} (ID: ${g.id}, Madrina: ${g.madrina_id})`);
    });
    
    // Ahora buscar los controles para ver a qué gestantes pertenecen
    console.log('\nListando algunos controles para ver las relaciones:');
    const controles = await prisma.control_prenatal.findMany({
      take: 10,
      select: {
        id: true,
        gestante_id: true,
        fecha_control: true,
        gestante: {
          select: {
            nombre: true,
            madrina_id: true
          }
        }
      }
    });
    
    controles.forEach((c, index) => {
      console.log(`${index + 1}. Control ${c.id} - Gestante: ${c.gestante.nombre} (ID: ${c.gestante_id}) - Madrina: ${c.gestante.madrina_id} - Fecha: ${c.fecha_control}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listAllGestantes();