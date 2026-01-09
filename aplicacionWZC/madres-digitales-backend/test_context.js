/**
 * Script para probar el contexto de RLS
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testContext() {
  console.log('🧪 Probando contexto de RLS...\n');
  
  try {
    await prisma.$connect();
    
    // Test 1: Sin contexto (debe retornar 0)
    console.log('📋 Test 1: Sin contexto');
    const sinContexto = await prisma.gestantes.findMany();
    console.log(`   Resultado: ${sinContexto.length} gestantes (esperado: 0)`);
    
    // Test 2: Como ADMIN (debe retornar todas)
    console.log('\n📋 Test 2: Como ADMIN');
    await prisma.$executeRawUnsafe(`SELECT public.set_app_context('admin_test', 'ADMIN')`);
    const comoAdmin = await prisma.gestantes.findMany();
    console.log(`   Resultado: ${comoAdmin.length} gestantes (esperado: todas)`);
    await prisma.$executeRawUnsafe(`SELECT public.clear_app_context()`);
    
    // Test 3: Como MADRINA (debe retornar solo las asignadas)
    console.log('\n📋 Test 3: Como MADRINA');
    
    // Primero, obtener una madrina real de la BD
    await prisma.$executeRawUnsafe(`SELECT public.set_app_context('admin_test', 'ADMIN')`);
    const madrinaEjemplo = await prisma.usuarios.findFirst({
      where: { rol: 'MADRINA' }
    });
    await prisma.$executeRawUnsafe(`SELECT public.clear_app_context()`);
    
    if (madrinaEjemplo) {
      console.log(`   Usando madrina: ${madrinaEjemplo.id} (${madrinaEjemplo.nombre})`);
      await prisma.$executeRawUnsafe(`SELECT public.set_app_context($1, 'MADRINA')`, madrinaEjemplo.id);
      const comoMadrina = await prisma.gestantes.findMany();
      console.log(`   Resultado: ${comoMadrina.length} gestantes (esperado: solo las asignadas a esta madrina)`);
      
      if (comoMadrina.length > 0) {
        console.log(`   ✅ Gestantes visibles:`);
        comoMadrina.forEach(g => {
          console.log(`      - ${g.nombre} (madrina_id: ${g.madrina_id})`);
        });
      }
      
      await prisma.$executeRawUnsafe(`SELECT public.clear_app_context()`);
    } else {
      console.log('   ⚠️ No se encontró ninguna madrina en la BD');
    }
    
    // Test 4: Verificar controles
    console.log('\n📋 Test 4: Controles prenatales');
    
    if (madrinaEjemplo) {
      await prisma.$executeRawUnsafe(`SELECT public.set_app_context($1, 'MADRINA')`, madrinaEjemplo.id);
      const controles = await prisma.control_prenatal.findMany();
      console.log(`   Resultado: ${controles.length} controles (esperado: solo de sus gestantes)`);
      await prisma.$executeRawUnsafe(`SELECT public.clear_app_context()`);
    }
    
    console.log('\n✅ Tests completados\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testContext().catch(console.error);
