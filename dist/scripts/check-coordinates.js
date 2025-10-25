"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function checkCoordinates() {
    try {
        console.log('🔍 Verificando coordenadas en alertas...');
        const alertas = await prisma.alerta.findMany({
            where: {
                tipo_alerta: 'sos'
            },
            orderBy: {
                created_at: 'desc'
            },
            take: 3
        });
        console.log(`✅ Encontradas ${alertas.length} alertas SOS`);
        for (const alerta of alertas) {
            console.log(`\n🚨 ALERTA ID: ${alerta.id}`);
            console.log(`📅 Fecha: ${alerta.created_at}`);
            if (alerta.coordenadas_alerta) {
                console.log(`📍 Coordenadas completas: ${JSON.stringify(alerta.coordenadas_alerta, null, 2)}`);
                // Extraer coordenadas específicas
                const coords = alerta.coordenadas_alerta;
                if (coords.coordinates && Array.isArray(coords.coordinates)) {
                    const [lng, lat] = coords.coordinates;
                    console.log(`📍 Latitud: ${lat}`);
                    console.log(`📍 Longitud: ${lng}`);
                    console.log(`📍 Formato para UI: ${lat}, ${lng}`);
                }
            }
            else {
                console.log('❌ Sin coordenadas');
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
checkCoordinates();
