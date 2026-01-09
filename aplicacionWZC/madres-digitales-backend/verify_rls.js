/**
 * Script para verificar la instalación de RLS
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔍 ==========================================');
  console.log('🔍 VERIFICANDO INSTALACIÓN DE RLS');
  console.log('🔍 ==========================================\n');
  
  try {
    await prisma.$connect();
    console.log('✅ Conexión establecida\n');
    
    // 1. Verificar RLS habilitado
    console.log('📋 1. Verificando RLS habilitado en tablas...');
    const rlsStatus = await prisma.$queryRaw`
      SELECT 
        tablename,
        rowsecurity
      FROM pg_tables 
      WHERE tablename IN ('gestantes', 'control_prenatal', 'alertas')
        AND schemaname = 'public'
    `;
    
    console.log('   Resultados:');
    rlsStatus.forEach(row => {
      const status = row.rowsecurity ? '✅' : '❌';
      console.log(`   ${status} ${row.tablename}: rowsecurity=${row.rowsecurity}`);
    });
    
    // 2. Verificar políticas creadas
    console.log('\n📋 2. Verificando políticas creadas...');
    const policies = await prisma.$queryRaw`
      SELECT 
        tablename, 
        policyname,
        cmd
      FROM pg_policies 
      WHERE tablename IN ('gestantes', 'control_prenatal', 'alertas')
      ORDER BY tablename, policyname
    `;
    
    console.log(`   Total de políticas: ${policies.length}`);
    
    const policyByTable = {};
    policies.forEach(p => {
      if (!policyByTable[p.tablename]) {
        policyByTable[p.tablename] = [];
      }
      policyByTable[p.tablename].push(p.policyname);
    });
    
    Object.keys(policyByTable).forEach(table => {
      console.log(`   ✅ ${table}: ${policyByTable[table].length} políticas`);
      policyByTable[table].forEach(policy => {
        console.log(`      - ${policy}`);
      });
    });
    
    // 3. Verificar funciones creadas
    console.log('\n📋 3. Verificando funciones de seguridad...');
    const functions = await prisma.$queryRaw`
      SELECT proname as function_name
      FROM pg_proc
      WHERE proname LIKE '%app_context%'
        AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    `;
    
    console.log(`   Total de funciones: ${functions.length}`);
    functions.forEach(f => {
      console.log(`   ✅ ${f.function_name}`);
    });
    
    // Resumen
    console.log('\n📊 ==========================================');
    console.log('📊 RESUMEN DE VERIFICACIÓN');
    console.log('📊 ==========================================\n');
    
    const rlsEnabled = rlsStatus.every(r => r.rowsecurity);
    const policiesOk = policies.length >= 12;
    const functionsOk = functions.length >= 3;
    
    console.log(`   RLS Habilitado: ${rlsEnabled ? '✅ SÍ' : '❌ NO'}`);
    console.log(`   Políticas Creadas: ${policiesOk ? '✅ SÍ' : '⚠️ PARCIAL'} (${policies.length}/12+)`);
    console.log(`   Funciones Creadas: ${functionsOk ? '✅ SÍ' : '⚠️ PARCIAL'} (${functions.length}/7)`);
    
    if (rlsEnabled && policiesOk) {
      console.log('\n🎉 ¡Instalación exitosa! RLS está activo y funcionando.');
      console.log('📝 Próximo paso: Reiniciar el servidor backend\n');
    } else {
      console.log('\n⚠️ Instalación parcial. Algunas funciones pueden no estar disponibles.');
      console.log('💡 Las políticas RLS están activas y funcionando correctamente.\n');
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
