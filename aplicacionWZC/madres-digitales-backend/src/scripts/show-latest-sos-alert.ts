import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function showLatestSOSAlert() {
  try {
    console.log('🔍 Buscando la última alerta SOS creada...');
    
    // Obtener la última alerta SOS
    const latestAlert = await prisma.alerta.findFirst({
      where: {
        tipo_alerta: 'sos'
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    if (!latestAlert) {
      console.log('❌ No se encontraron alertas SOS');
      return;
    }

    console.log('\n🚨 ÚLTIMA ALERTA SOS ENCONTRADA:');
    console.log(`📋 ID: ${latestAlert.id}`);
    console.log(`📅 Fecha: ${latestAlert.created_at}`);
    console.log(`⚠️ Prioridad: ${latestAlert.nivel_prioridad}`);
    console.log(`🔄 Estado: ${latestAlert.resuelta ? 'Resuelta' : 'Activa'}`);
    console.log(`📍 Coordenadas: ${JSON.stringify(latestAlert.coordenadas_alerta)}`);
    
    console.log('\n📝 MENSAJE COMPLETO:');
    console.log('=' .repeat(100));
    console.log(latestAlert.mensaje);
    console.log('=' .repeat(100));

    // Contar total de alertas SOS
    const totalSOS = await prisma.alerta.count({
      where: {
        tipo_alerta: 'sos'
      }
    });

    console.log(`\n📊 Total de alertas SOS en el sistema: ${totalSOS}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

showLatestSOSAlert();
