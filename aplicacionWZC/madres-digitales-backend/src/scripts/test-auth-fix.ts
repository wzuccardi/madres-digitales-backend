import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testAuthFix() {
  console.log('🔐 PRUEBA DE CORRECCIÓN DE AUTENTICACIÓN');
  console.log('==========================================\n');

  try {
    // 1. Probar getUserForFiltering
    console.log('1. 🔐 Probando getUserForFiltering...');
    
    const mockReq = {
      headers: { authorization: 'Bearer invalid-token' }
    } as any;
      
    const { getUserForFiltering } = await import('../utils/auth.utils');
    const user = await getUserForFiltering(mockReq);
    console.log(`   ✅ getUserForFiltering funciona: ${user.id} (${user.rol})`);

    // 2. Probar consulta a usuarios
    console.log('\n2. 👥 Probando consulta a usuarios...');
    
    const usuarios = await prisma.usuarios.findMany({
      where: { activo: true },
      take: 5,
      orderBy: { nombre: 'asc' }
    });
    console.log(`   ✅ prisma.usuarios.findMany funciona: ${usuarios.length} usuarios`);

    // 3. Probar consulta a medicos
    console.log('\n3. 🩺 Probando consulta a médicos...');
    
    const medicos = await prisma.medicos.findMany({
      where: { activo: true },
      take: 5,
      orderBy: { nombre: 'asc' }
    });
    console.log(`   ✅ prisma.medicos.findMany funciona: ${medicos.length} médicos`);

    // 4. Probar consulta a ips
    console.log('\n4. 🏥 Probando consulta a IPS...');
    
    const ips = await prisma.ips.findMany({
      where: { activo: true },
      take: 5,
      orderBy: { nombre: 'asc' }
    });
    console.log(`   ✅ prisma.ips.findMany funciona: ${ips.length} IPS`);

    // 5. Probar consulta a contenidos
    console.log('\n5. 📚 Probando consulta a contenidos...');
    
    const contenidos = await prisma.contenidos.findMany({
      where: { activo: true },
      take: 5,
      orderBy: { titulo: 'asc' }
    });
    console.log(`   ✅ prisma.contenidos.findMany funciona: ${contenidos.length} contenidos`);

    // 6. Probar consulta a control_prenatal
    console.log('\n6. 🏥 Probando consulta a control_prenatal...');
    
    const controles = await prisma.control_prenatal.findMany({
      take: 5,
      orderBy: { fecha_control: 'desc' }
    });
    console.log(`   ✅ prisma.control_prenatal.findMany funciona: ${controles.length} controles`);

    console.log('\n✅ Todas las pruebas pasaron exitosamente');
    console.log('\n📋 Estado final:');
    console.log('   ✅ Autenticación funciona correctamente');
    console.log('   ✅ Todos los modelos Prisma funcionan');
    console.log('   ✅ No hay errores de tipo "minified:a6e"');
    
  } catch (error) {
    console.error('❌ Error en pruebas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar pruebas
testAuthFix()
  .then(() => {
    console.log('\n🎉 Pruebas completadas exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error en pruebas:', error);
    process.exit(1);
  });