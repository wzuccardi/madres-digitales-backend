import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function diagnosticTablasControles() {
  console.log('🔍 DIAGNÓSTICO DE TABLAS DE CONTROLES');
  console.log('=====================================\n');

  try {
    // 1. Verificar si existe la tabla controles (incorrecta)
    console.log('1. 🔍 Verificando tabla "controles" (incorrecta)...');
    try {
      const controlesCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM information_schema.tables WHERE table_name = 'controles'`;
      console.log(`   📊 Tabla "controles" existe: ${controlesCount[0]?.count > 0 ? 'SÍ' : 'NO'}`);
      
      if (controlesCount[0]?.count > 0) {
        const controlesData = await prisma.$queryRaw`SELECT COUNT(*) as count FROM controles`;
        console.log(`   📊 Registros en "controles": ${controlesData[0]?.count || 0}`);
      }
    } catch (error) {
      console.log(`   ❌ Error verificando tabla "controles": ${error}`);
    }

    // 2. Verificar si existe la tabla control_prenatal (correcta)
    console.log('\n2. ✅ Verificando tabla "control_prenatal" (correcta)...');
    try {
      const controlPrenatalCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM information_schema.tables WHERE table_name = 'control_prenatal'`;
      console.log(`   📊 Tabla "control_prenatal" existe: ${controlPrenatalCount[0]?.count > 0 ? 'SÍ' : 'NO'}`);
      
      if (controlPrenatalCount[0]?.count > 0) {
        const controlPrenatalData = await prisma.$queryRaw`SELECT COUNT(*) as count FROM control_prenatal`;
        console.log(`   📊 Registros en "control_prenatal": ${controlPrenatalData[0]?.count || 0}`);
      }
    } catch (error) {
      console.log(`   ❌ Error verificando tabla "control_prenatal": ${error}`);
    }

    // 3. Verificar qué tabla está usando el modelo Prisma
    console.log('\n3. 🔍 Verificando configuración del modelo Prisma...');
    try {
      // Intentar usar controlPrenatal (debería funcionar si está en el schema)
      const controlPrenatalTest = await (prisma as any).controlPrenatal?.findFirst?.();
      console.log(`   ✅ prisma.controlPrenatal funciona: ${controlPrenatalTest !== undefined ? 'SÍ' : 'NO'}`);
    } catch (error) {
      console.log(`   ❌ prisma.controlPrenatal error: ${error}`);
    }

    try {
      // Intentar usar controles (no debería funcionar si no está en el schema)
      const controlesTest = await (prisma as any).controles?.findFirst?.();
      console.log(`   ⚠️  prisma.controles funciona: ${controlesTest !== undefined ? 'SÍ (PROBLEMA)' : 'NO'}`);
    } catch (error) {
      console.log(`   ✅ prisma.controles error (esperado): ${error}`);
    }

    // 4. Verificar referencias en el código
    console.log('\n4. 📋 Resumen del diagnóstico:');
    console.log('   - La migración 20251021235348 crea la tabla "control_prenatal" correctamente');
    console.log('   - El schema.prisma actual NO contiene el modelo "control_prenatal"');
    console.log('   - El código hace referencia a "controlPrenatal" pero el modelo no existe');
    console.log('   - Si existe tabla "controles", debe ser eliminada');

  } catch (error) {
    console.error('❌ Error general en diagnóstico:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar diagnóstico
diagnosticTablasControles()
  .then(() => {
    console.log('\n✅ Diagnóstico completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error en diagnóstico:', error);
    process.exit(1);
  });