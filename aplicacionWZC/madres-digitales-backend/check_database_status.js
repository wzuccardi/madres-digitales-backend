/**
 * Script para verificar el estado de la base de datos
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabase() {
  console.log('🗄️ ==========================================');
  console.log('🗄️ ESTADO DE LA BASE DE DATOS');
  console.log('🗄️ ==========================================\n');
  
  try {
    await prisma.$connect();
    console.log('✅ Conexión establecida con PostgreSQL\n');
    
    // Verificar tablas principales
    console.log('📊 CONTEO DE REGISTROS:\n');
    
    const usuarios = await prisma.usuarios.count();
    console.log(`   👥 Usuarios: ${usuarios}`);
    
    const gestantes = await prisma.gestantes.count();
    console.log(`   🤰 Gestantes: ${gestantes}`);
    
    const controles = await prisma.control_prenatal.count();
    console.log(`   🏥 Controles prenatales: ${controles}`);
    
    const alertas = await prisma.alertas.count();
    console.log(`   🚨 Alertas: ${alertas}`);
    
    const municipios = await prisma.municipios.count();
    console.log(`   🏘️ Municipios: ${municipios}`);
    
    const ips = await prisma.ips.count();
    console.log(`   🏥 IPS: ${ips}`);
    
    const medicos = await prisma.medicos.count();
    console.log(`   👨‍⚕️ Médicos: ${medicos}`);
    
    // Verificar usuarios por rol
    console.log('\n👥 USUARIOS POR ROL:\n');
    const rolesCounts = await prisma.usuarios.groupBy({
      by: ['rol'],
      _count: {
        id: true
      }
    });
    
    rolesCounts.forEach(role => {
      console.log(`   ${role.rol}: ${role._count.id} usuarios`);
    });
    
    // Verificar gestantes con/sin madrina
    console.log('\n🤰 GESTANTES POR ASIGNACIÓN:\n');
    const gestantesConMadrina = await prisma.gestantes.count({
      where: {
        madrina_id: {
          not: null
        }
      }
    });
    
    const gestantesSinMadrina = await prisma.gestantes.count({
      where: {
        OR: [
          { madrina_id: null },
          { madrina_id: '' }
        ]
      }
    });
    
    console.log(`   Con madrina asignada: ${gestantesConMadrina}`);
    console.log(`   Sin madrina asignada: ${gestantesSinMadrina}`);
    
    // Verificar algunas madrinas y sus gestantes
    console.log('\n👩‍⚕️ MADRINAS Y SUS GESTANTES:\n');
    const madrinas = await prisma.usuarios.findMany({
      where: { rol: 'MADRINA' },
      take: 5
    });
    
    for (const madrina of madrinas) {
      const gestantesCount = await prisma.gestantes.count({
        where: { madrina_id: madrina.id }
      });
      console.log(`   ${madrina.nombre}: ${gestantesCount} gestantes`);
    }
    
    console.log('\n🗄️ ==========================================');
    console.log('✅ VERIFICACIÓN COMPLETADA');
    console.log('🗄️ ==========================================\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase().catch(console.error);