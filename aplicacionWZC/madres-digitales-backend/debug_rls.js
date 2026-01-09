/**
 * Script para debuggear RLS
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debug() {
  console.log('🔍 Debuggeando RLS...\n');
  
  try {
    await prisma.$connect();
    
    // Verificar usuario actual de la conexión
    console.log('📋 Usuario de la conexión:');
    const currentUser = await prisma.$queryRaw`SELECT current_user, session_user`;
    console.log(currentUser);
    
    // Verificar si RLS está activo
    console.log('\n📋 Estado de RLS:');
    const rlsStatus = await prisma.$queryRaw`
      SELECT tablename, rowsecurity
      FROM pg_tables 
      WHERE tablename = 'gestantes'
    `;
    console.log(rlsStatus);
    
    // Verificar políticas
    console.log('\n📋 Políticas activas:');
    const policies = await prisma.$queryRaw`
      SELECT policyname, cmd, qual
      FROM pg_policies 
      WHERE tablename = 'gestantes'
    `;
    console.log(policies);
    
    // Establecer contexto y verificar
    console.log('\n📋 Estableciendo contexto como MADRINA...');
    await prisma.$executeRawUnsafe(`SELECT public.set_app_context('user-madrina-001', 'MADRINA')`);
    
    // Verificar contexto
    console.log('\n📋 Contexto actual:');
    const context = await prisma.$queryRaw`SELECT * FROM public.get_app_context()`;
    console.log(context);
    
    // Probar query con EXPLAIN
    console.log('\n📋 Plan de ejecución de la query:');
    try {
      const plan = await prisma.$queryRawUnsafe(`
        EXPLAIN (FORMAT JSON) 
        SELECT * FROM gestantes WHERE madrina_id = 'user-madrina-001'
      `);
      console.log(JSON.stringify(plan, null, 2));
    } catch (e) {
      console.log('Error en EXPLAIN:', e.message);
    }
    
    // Verificar si el usuario tiene bypass de RLS
    console.log('\n📋 Verificando permisos de bypass RLS:');
    const bypassCheck = await prisma.$queryRaw`
      SELECT rolname, rolbypassrls
      FROM pg_roles
      WHERE rolname = current_user
    `;
    console.log(bypassCheck);
    
    await prisma.$executeRawUnsafe(`SELECT public.clear_app_context()`);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

debug().catch(console.error);
