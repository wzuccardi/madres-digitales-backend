"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const alerta_service_1 = require("../services/alerta.service");
const prisma = new client_1.PrismaClient();
async function createNewSOSAlert() {
    try {
        console.log('🚨 Creando nueva alerta SOS con información descriptiva...');
        // Obtener una gestante de prueba
        const gestante = await prisma.gestante.findFirst();
        if (!gestante) {
            console.log('❌ No se encontraron gestantes de prueba');
            return;
        }
        console.log(`📋 Gestante seleccionada: ${gestante.nombre} (${gestante.id})`);
        // Crear instancia del servicio de alertas
        const alertaService = new alerta_service_1.AlertaService();
        // Coordenadas de prueba (Cartagena)
        const coordenadas = [-75.5171328, 10.4562688];
        console.log('🔄 Creando alerta SOS...');
        // Crear la alerta SOS
        const alertaSOS = await alertaService.notificarEmergencia(gestante.id, coordenadas);
        console.log('\n🎉 ¡Alerta SOS creada exitosamente!');
        console.log(`📋 ID de la alerta: ${alertaSOS.id}`);
        console.log(`🚨 Tipo: ${alertaSOS.tipo_alerta}`);
        console.log(`⚠️ Prioridad: ${alertaSOS.nivel_prioridad}`);
        console.log(`📅 Fecha: ${alertaSOS.created_at}`);
        // Mostrar el mensaje completo
        console.log('\n📝 MENSAJE DESCRIPTIVO COMPLETO:');
        console.log('='.repeat(100));
        console.log(alertaSOS.mensaje);
        console.log('='.repeat(100));
    }
    catch (error) {
        console.error('❌ Error creando alerta SOS:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
createNewSOSAlert();
