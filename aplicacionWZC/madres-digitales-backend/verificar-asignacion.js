const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Verificando asignación de gestantes...');
    
    // 1. Verificar si la madrina Crepu existe
    const madrina = await prisma.usuarios.findUnique({
      where: { id: 'user_1763791367449_40gzfw' },
      select: { id: true, nombre: true, email: true, rol: true }
    });
    
    console.log('\n👤 Madrina Crepu:');
    if (madrina) {
      console.log(`   ✅ Encontrada: ${madrina.nombre} (${madrina.email}) - Rol: ${madrina.rol}`);
    } else {
      console.log('   ❌ No encontrada');
      return;
    }
    
    // 2. Verificar gestantes asignadas a Crepu
    const gestantesAsignadas = await prisma.gestantes.findMany({
      where: { 
        madrina_id: madrina.id,
        activa: true
      },
      select: {
        id: true,
        nombre: true,
        documento: true,
        telefono: true,
        activa: true
      },
      orderBy: { nombre: 'asc' }
    });
    
    console.log(`\n🤰 Gestantes asignadas a Crepu: ${gestantesAsignadas.length}`);
    if (gestantesAsignadas.length === 0) {
      console.log('   - Ninguna gestante asignada');
    } else {
      gestantesAsignadas.forEach((g, index) => {
        console.log(`   ${index + 1}. ${g.nombre} (ID: ${g.id}) - Doc: ${g.documento || 'N/A'}`);
      });
    }
    
    // 3. Buscar gestantes específicas por nombre
    console.log('\n🔍 Buscando gestantes "Marilyn" y "malinda"...');
    
    const gestantesBuscadas = await prisma.gestantes.findMany({
      where: {
        OR: [
          { nombre: { contains: 'Marilyn', mode: 'insensitive' } },
          { nombre: { contains: 'malinda', mode: 'insensitive' } }
        ],
        activa: true
      },
      select: {
        id: true,
        nombre: true,
        documento: true,
        madrina_id: true,
        activa: true
      }
    });
    
    console.log(`\n📋 Gestantes encontradas: ${gestantesBuscadas.length}`);
    gestantesBuscadas.forEach(g => {
      const asignadaACrepu = g.madrina_id === madrina.id;
      console.log(`   - ${g.nombre} (ID: ${g.id}) - Asignada a Crepu: ${asignadaACrepu ? '✅ Sí' : '❌ No'} - madrina_id: ${g.madrina_id || 'NULL'}`);
    });
    
    // 4. Si encontramos las gestantes pero no están asignadas a Crepu, las asignamos
    if (gestantesBuscadas.length > 0) {
      console.log('\n🔧 Asignando gestantes a Crepu...');
      
      for (const gestante of gestantesBuscadas) {
        if (gestante.madrina_id !== madrina.id) {
          const actualizada = await prisma.gestantes.update({
            where: { id: gestante.id },
            data: { 
              madrina_id: madrina.id,
              activa: true
            }
          });
          
          console.log(`   ✅ Asignada: ${actualizada.nombre} (ID: ${actualizada.id})`);
        }
      }
      
      // Verificar resultado final
      const gestantesFinales = await prisma.gestantes.findMany({
        where: { 
          madrina_id: madrina.id,
          activa: true
        },
        select: { id: true, nombre: true },
        orderBy: { nombre: 'asc' }
      });
      
      console.log(`\n🎉 Total final de gestantes asignadas a Crepu: ${gestantesFinales.length}`);
      gestantesFinales.forEach((g, index) => {
        console.log(`   ${index + 1}. ${g.nombre} (ID: ${g.id})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();