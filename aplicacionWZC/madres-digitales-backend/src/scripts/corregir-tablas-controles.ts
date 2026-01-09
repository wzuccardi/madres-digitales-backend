import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function corregirTablasControles() {
  console.log('🔧 CORRECCIÓN DE TABLAS DE CONTROLES');
  console.log('===================================\n');

  try {
    // 1. Eliminar tabla controles si existe
    console.log('1. 🗑️  Verificando y eliminando tabla "controles"...');
    try {
      const controlesExists = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'controles'
        ) as exists
      `;
      
      if (controlesExists[0]?.exists) {
        console.log('   ⚠️  Tabla "controles" existe, eliminándola...');
        await prisma.$executeRaw`DROP TABLE IF EXISTS controles CASCADE`;
        console.log('   ✅ Tabla "controles" eliminada exitosamente');
      } else {
        console.log('   ✅ Tabla "controles" no existe (correcto)');
      }
    } catch (error) {
      console.log(`   ❌ Error eliminando tabla "controles": ${error}`);
    }

    // 2. Verificar que control_prenatal existe y tiene datos
    console.log('\n2. ✅ Verificando tabla "control_prenatal"...');
    try {
      const controlPrenatalExists = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'control_prenatal'
        ) as exists
      `;
      
      if (controlPrenatalExists[0]?.exists) {
        const count = await prisma.$queryRaw`SELECT COUNT(*) as count FROM control_prenatal`;
        console.log(`   ✅ Tabla "control_prenatal" existe con ${count[0]?.count || 0} registros`);
      } else {
        console.log('   ❌ Tabla "control_prenatal" no existe - ERROR CRÍTICO');
      }
    } catch (error) {
      console.log(`   ❌ Error verificando tabla "control_prenatal": ${error}`);
    }

    // 3. Probar acceso a través del modelo Prisma
    console.log('\n3. 🔍 Probando acceso al modelo Prisma...');
    try {
      const count = await prisma.control_prenatal.count();
      console.log(`   ✅ prisma.control_prenatal.count() funciona: ${count} registros`);
    } catch (error) {
      console.log(`   ❌ Error accediendo a prisma.control_prenatal: ${error}`);
      console.log('   💡 Es posible que necesites ejecutar: npx prisma generate');
    }

    console.log('\n✅ Corrección completada');
    console.log('\n📋 Próximos pasos recomendados:');
    console.log('   1. Ejecutar: npx prisma generate');
    console.log('   2. Reiniciar el servidor backend');
    console.log('   3. Verificar que los endpoints de controles funcionen');

  } catch (error) {
    console.error('❌ Error general en corrección:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar corrección
corregirTablasControles()
  .then(() => {
    console.log('\n✅ Proceso de corrección completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error en corrección:', error);
    process.exit(1);
  });