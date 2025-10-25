"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🔍 Verificando datos en la base de datos...');
    try {
        // Verificar municipios
        const municipios = await prisma.municipio.findMany();
        console.log(`📍 Total municipios: ${municipios.length}`);
        if (municipios.length > 0) {
            console.log('📋 Primeros 5 municipios:');
            municipios.slice(0, 5).forEach((m, i) => {
                console.log(`   ${i + 1}. ${m.nombre} (${m.codigo_dane}) - ${m.departamento}`);
            });
        }
        // Verificar IPS
        const ips = await prisma.iPS.findMany();
        console.log(`🏥 Total IPS: ${ips.length}`);
        if (ips.length > 0) {
            console.log('🏥 Primeras 3 IPS:');
            ips.slice(0, 3).forEach((i, idx) => {
                console.log(`   ${idx + 1}. ${i.nombre} - ${i.direccion}`);
                console.log(`      Coordenadas: ${i.latitud && i.longitud ? `[${i.latitud}, ${i.longitud}]` : 'Sin coordenadas'}`);
            });
        }
        // Verificar usuarios
        const usuarios = await prisma.usuario.findMany();
        console.log(`👥 Total usuarios: ${usuarios.length}`);
        if (usuarios.length > 0) {
            console.log('👤 Usuarios por rol:');
            const rolesCounts = usuarios.reduce((acc, u) => {
                acc[u.rol] = (acc[u.rol] || 0) + 1;
                return acc;
            }, {});
            Object.entries(rolesCounts).forEach(([rol, count]) => {
                console.log(`   ${rol}: ${count}`);
            });
        }
        // Verificar gestantes
        const gestantes = await prisma.gestante.findMany();
        console.log(`🤱 Total gestantes: ${gestantes.length}`);
        // Verificar controles
        const controles = await prisma.controlPrenatal.findMany();
        console.log(`📋 Total controles prenatales: ${controles.length}`);
        // Verificar alertas
        const alertas = await prisma.alerta.findMany();
        console.log(`🚨 Total alertas: ${alertas.length}`);
    }
    catch (error) {
        console.error('❌ Error:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
