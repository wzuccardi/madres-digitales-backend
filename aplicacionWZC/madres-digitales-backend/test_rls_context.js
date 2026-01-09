/**
 * Script para probar el contexto de RLS
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🧪 Probando contexto de RLS...\n');
  
  try {
    await prisma.$connect();
    
    // Test 1: Sin contexto (debe retornar 0)
    console.log('📋 Test 1: Consulta SIN contexto de seguridad');
    const sinContexto = await prisma.control_prenatal.findMany();
    console.log(`   Resultado: ${sinContexto.length} controles`);
    console.log(`   ${sinContexto.length === 0 ? '✅' : '⚠️'} Esperado: 0 (RLS bloqueando sin contexto)\n`);
    
    // Test 2: Con contexto de ADMIN
    console.log('📋 Test 2: Consulta CON contexto de ADMIN');
    await prisma.$executeRawUnsafe(`SELECT public.set_app_context('cmh1dl1ke0000jwml8gwsr8ll', 'SUPER_ADMIN')`);
    const conContextoAdmin = await prisma.control_prenatal.findMany();
    console.log(`   Resultado: ${conContextoAdmin.length} controles`);
    console.log(`   ${conContextoAdmin.length > 0 ? '✅' : '❌'} Esperado: > 0 (Admin ve todo)\n`);
    
    // Limpiar contexto
    await prisma.$executeRawUnsafe(`SELECT public.clear_app_context()`);
    
    // Test 3: Con contexto de MADRINA
    console.log('📋 Test 3: Consulta CON contexto de MADRINA');
    await prisma.$executeRawUnsafe(`SELECT public.set_app_context('cmh6oapie00002xq7gu55ydk3', 'MADRINA')`);
    const conContextoMadrina = await prisma.control_prenatal.findMany();
    console.log(`   Resultado: ${conContextoMadrina.length} controles`);
    console.log(`   ${conContextoMadrina.length >= 0 ? '✅' : '❌'} Esperado: >= 0 (Madrina ve sus controles)\n`);
    
    // Limpiar contexto
    await prisma.$executeRawUnsafe(`SELECT public.clear_app_context()`);
    
    // Test 4: Verificar gestantes de la madrina
    console.log('📋 Test 4: Verificar gestantes de la madrina');
    await prisma.$executeRawUnsafe(`SELECT public.set_app_context('cmh6oapie00002xq7gu55ydk3', 'MADRINA')`);
    const gestantesMadrina = await prisma.gestantes.findMany();
    console.log(`   Resultado: ${gestantesMadrina.length} gestantes`);
    console.log(`   IDs de gestantes:`, gestantesMadrina.map(g => g.id).slice(0, 5));
    
    // Limpiar contexto
    await prisma.$executeRawUnsafe(`SELECT public.clear_app_context()`);
    
    console.log('\n📊 Diagnóstico:');
    if (sinContexto.length === 0 && conContextoAdmin.length > 0) {
      console.log('   ✅ RLS está funcionando correctamente');
      console.log('   💡 El problema puede ser que el middleware no está estableciendo el contexto');
    } else if (sinContexto.length > 0) {
      console.log('   ⚠️ RLS NO está bloqueando consultas sin contexto');
      console.log('   💡 Esto significa que RLS no está activo o las políticas no están aplicándose');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
