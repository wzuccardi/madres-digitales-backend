"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function testConnection() {
    try {
        console.log('🔍 Probando conexión a la base de datos...');
        // Contar municipios
        const municipiosCount = await prisma.municipio.count();
        console.log(`📍 Municipios en BD: ${municipiosCount}`);
        // Contar usuarios
        const usuariosCount = await prisma.usuario.count();
        console.log(`👥 Usuarios en BD: ${usuariosCount}`);
        // Contar gestantes
        const gestantesCount = await prisma.gestante.count();
        console.log(`🤰 Gestantes en BD: ${gestantesCount}`);
        // Contar controles
        const controlesCount = await prisma.controlPrenatal.count();
        console.log(`🏥 Controles en BD: ${controlesCount}`);
        // Contar alertas
        const alertasCount = await prisma.alerta.count();
        console.log(`🚨 Alertas en BD: ${alertasCount}`);
        console.log('✅ Conexión exitosa');
    }
    catch (error) {
        console.error('❌ Error de conexión:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
testConnection();
