/**
 * Script para asignar madrinas a gestantes que no tienen
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixAssignments() {
  console.log('🔧 Asignando madrinas a gestantes...\n');
  
  try {
    await prisma.$connect();
    
    // Deshabilitar RLS temporalmente para poder hacer las asignaciones
    console.log('📋 Deshabilitando RLS temporalmente...');
    await prisma.$executeRawUnsafe('ALTER TABLE public.gestantes DISABLE ROW LEVEL SECURITY');
    
    // Obtener todas las madrinas
    const madrinas = await prisma.usuarios.findMany({
      where: { rol: 'MADRINA', activo: true }
    });
    
    console.log(`✅ Encontradas ${madrinas.length} madrinas activas\n`);
    
    if (madrinas.length === 0) {
      console.log('❌ No hay madrinas en el sistema. Crea madrinas primero.');
      return;
    }
    
    // Obtener gestantes sin madrina
    const gestantesSinMadrina = await prisma.gestantes.findMany({
      where: {
        OR: [
          { madrina_id: null },
          { madrina_id: '' }
        ]
      }
    });
    
    console.log(`📊 Gestantes sin madrina: ${gestantesSinMadrina.length}\n`);
    
    if (gestantesSinMadrina.length === 0) {
      console.log('✅ Todas las gestantes ya tienen madrina asignada');
      return;
    }
    
    // Asignar madrinas de forma equitativa
    let madrinaIndex = 0;
    let asignadas = 0;
    
    for (const gestante of gestantesSinMadrina) {
      const madrina = madrinas[madrinaIndex];
      
      await prisma.gestantes.update({
        where: { id: gestante.id },
        data: { madrina_id: madrina.id }
      });
      
      console.log(`✅ ${gestante.nombre} → ${madrina.nombre}`);
      asignadas++;
      
      // Rotar entre madrinas
      madrinaIndex = (madrinaIndex + 1) % madrinas.length;
    }
    
    console.log(`\n🎉 ${asignadas} gestantes asignadas exitosamente\n`);
    
    // Mostrar resumen
    console.log('📊 Resumen de asignaciones:\n');
    for (const madrina of madrinas) {
      const count = await prisma.gestantes.count({
        where: { madrina_id: madrina.id }
      });
      console.log(`   ${madrina.nombre}: ${count} gestantes`);
    }
    
    // Rehabilitar RLS
    console.log('\n📋 Rehabilitando RLS...');
    await prisma.$executeRawUnsafe('ALTER TABLE public.gestantes ENABLE ROW LEVEL SECURITY');
    console.log('✅ RLS rehabilitado\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixAssignments().catch(console.error);
