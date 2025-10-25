"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function testAPICoordinates() {
    console.log('🔍 Iniciando prueba...');
    try {
        const alertas = await prisma.alerta.findMany({
            where: { tipo_alerta: 'sos' },
            orderBy: { created_at: 'desc' },
            take: 1
        });
        console.log(`✅ Encontradas ${alertas.length} alertas SOS`);
        if (alertas.length > 0) {
            const alerta = alertas[0];
            console.log(`📋 ID: ${alerta.id}`);
            console.log(`📍 Coordenadas: ${JSON.stringify(alerta.coordenadas_alerta)}`);
            if (alerta.coordenadas_alerta) {
                const coords = alerta.coordenadas_alerta;
                if (coords.coordinates) {
                    const [lng, lat] = coords.coordinates;
                    console.log(`✅ Formato UI: ${lat}, ${lng}`);
                }
            }
        }
    }
    catch (error) {
        console.error('❌ Error:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
testAPICoordinates();
