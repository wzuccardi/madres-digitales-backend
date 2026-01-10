const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function asignarGestantesCrepu() {
  try {
    console.log('🔧 Asignando gestantes a la madrina Crepu...');
    
    // IDs de las gestantes que deben ser asignadas a Crepu
    const gestantesIds = [
      'gestante_1763612771433_jqobr3', // malinda
      'gestante_1763277531205_ti6w59'  // Marilyn Monroe
    ];
    
    // ID de la madrina Crepu
    const madrinaId = 'user_1763791367449_40gzfw';
    
    // Verificar que la madrina existe
    const madrina = await prisma.usuarios.findUnique({
      where: { id: madrinaId },
      select: { id: true, nombre: true, rol: true }
    });
    
    if (!madrina) {
      console.log('❌ La madrina Crepu no existe');
      return;
    }
    
    console.log(`👤 Madrina encontrada: ${madrina.nombre} (ID: ${madrina.id})`);
    
    // Verificar estado actual de las gestantes
    console.log('\n📋 Verificando estado actual de las gestantes...');
    for (const gestanteId of gestantesIds) {
      const gestante = await prisma.gestantes.findUnique({
        where: { id: gestanteId },
        select: { id: true, nombre: true, madrina_id: true, activa: true }
      });
      
      if (gestante) {
        console.log(`   - ${gestante.nombre} (ID: ${gestante.id}) - madrina_id: ${gestante.madrina_id || 'NULL'} - activa: ${gestante.activa}`);
      } else {
        console.log(`   - Gestante con ID ${gestanteId} no encontrada`);
      }
    }
    
    // Asignar las gestantes a la madrina
    console.log('\n🔧 Asignando gestantes a la madrina Crepu...');
    for (const gestanteId of gestantesIds) {
      const result = await prisma.gestantes.update({
        where: { id: gestanteId },
        data: {
          madrina_id: madrinaId,
          activa: true  // Asegurarse de que esté activa
        }
      });
      
      console.log(`   ✅ Asignada: ${result.nombre} (ID: ${result.id})`);
    }
    
    // Verificar resultado final
    console.log('\n🎉 Verificando resultado final...');
    const gestantesFinales = await prisma.gestantes.findMany({
      where: { madrina_id: madrinaId, activa: true },
      select: { id: true, nombre: true },
      orderBy: { nombre: 'asc' }
    });
    
    console.log(`\n🤰 Total de gestantes asignadas a Crepu: ${gestantesFinales.length}`);
    gestantesFinales.forEach((g, index) => {
      console.log(`   ${index + 1}. ${g.nombre} (ID: ${g.id})`);
    });
    
    console.log('\n✅ ¡Asignación completada con éxito!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

asignarGestantesCrepu();