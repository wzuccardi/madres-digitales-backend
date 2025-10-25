import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testDetailedSOSAlert() {
  try {
    console.log('🚨 Testing detailed SOS Alert...');

    // Obtener una gestante de prueba simple
    const gestante = await prisma.gestante.findFirst();

    if (!gestante) {
      console.log('❌ No se encontraron gestantes de prueba');
      return;
    }

    console.log(`📋 Gestante encontrada: ${gestante.nombre} (${gestante.id})`);

    // Crear alerta SOS con coordenadas de prueba
    const coordenadas: [number, number] = [-75.5171328, 10.4562688];

    // Simular la creación de la alerta SOS
    const alertaService = await import('../services/alerta.service');
    const alertaServiceInstance = new alertaService.AlertaService();

    const alertaSOS = await alertaServiceInstance.notificarEmergencia(gestante.id, coordenadas);

    console.log('\n🎉 ¡Alerta SOS creada exitosamente!');
    console.log(`📋 ID de la alerta: ${alertaSOS.id}`);
    console.log(`🚨 Tipo: ${alertaSOS.tipo_alerta}`);
    console.log(`⚠️ Prioridad: ${alertaSOS.nivel_prioridad}`);

    // Mostrar el mensaje completo
    console.log('\n📝 MENSAJE COMPLETO DE LA ALERTA:');
    console.log('=' .repeat(80));
    console.log(alertaSOS.mensaje);
    console.log('=' .repeat(80));

    // Obtener la alerta creada
    const alertaCompleta = await prisma.alerta.findUnique({
      where: { id: alertaSOS.id }
    });

    if (alertaCompleta) {
      console.log('\n✅ Verificación de datos de la alerta:');
      console.log(`📍 Coordenadas: ${JSON.stringify(alertaCompleta.coordenadas_alerta)}`);
      console.log(`📅 Fecha creación: ${alertaCompleta.created_at}`);
      console.log(`🔄 Estado: ${alertaCompleta.resuelta ? 'Resuelta' : 'Activa'}`);
    }

  } catch (error) {
    console.error('❌ Error testing detailed SOS alert:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDetailedSOSAlert();
