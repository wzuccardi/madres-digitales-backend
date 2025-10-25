"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function checkLatestAlert() {
    try {
        console.log('🔍 Buscando la última alerta SOS...');
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
        console.log('\n🚨 ÚLTIMA ALERTA SOS:');
        console.log(`📋 ID: ${latestAlert.id}`);
        console.log(`📅 Fecha: ${latestAlert.created_at}`);
        console.log(`👤 Gestante ID: ${latestAlert.gestante_id}`);
        console.log(`⚠️ Prioridad: ${latestAlert.nivel_prioridad}`);
        console.log(`🔄 Estado: ${latestAlert.resuelta ? 'Resuelta' : 'Activa'}`);
        if (latestAlert.coordenadas_alerta) {
            console.log(`📍 Coordenadas: ${JSON.stringify(latestAlert.coordenadas_alerta)}`);
        }
        console.log('\n📝 MENSAJE COMPLETO:');
        console.log('='.repeat(100));
        console.log(latestAlert.mensaje);
        console.log('='.repeat(100));
        // Contar total de alertas SOS
        const totalSOS = await prisma.alerta.count({
            where: { tipo_alerta: 'sos' }
        });
        console.log(`\n📊 Total de alertas SOS en el sistema: ${totalSOS}`);
    }
    catch (error) {
        console.error('❌ Error:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
checkLatestAlert();
