"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function showTestUsers() {
    try {
        console.log('👥 USUARIOS DE PRUEBA CREADOS:\n');
        // Obtener usuarios de prueba (excluyendo los demo originales)
        const usuarios = await prisma.usuario.findMany({
            where: {
                OR: [
                    { email: { contains: 'coordinadora.bolivar' } },
                    { email: { contains: 'madrina1' } },
                    { email: { contains: 'madrina2' } },
                    { email: { contains: 'madrina3' } }
                ]
            }
        });
        for (const usuario of usuarios) {
            let municipioNombre = 'No asignado';
            if (usuario.municipio_id) {
                const municipio = await prisma.municipio.findUnique({
                    where: { id: usuario.municipio_id },
                    select: { nombre: true }
                });
                municipioNombre = municipio?.nombre || 'No asignado';
            }
            console.log(`• ${usuario.nombre}`);
            console.log(`   📧 Email: ${usuario.email}`);
            console.log(`   🔑 Password: madrina123`);
            console.log(`   👤 Rol: ${usuario.rol}`);
            console.log(`   📍 Municipio: ${municipioNombre}`);
            console.log(`   📞 Teléfono: ${usuario.telefono}`);
            console.log('');
        }
        // Mostrar gestantes por municipio
        console.log('🤰 GESTANTES POR MUNICIPIO:\n');
        const gestantesPorMunicipio = await prisma.gestante.groupBy({
            by: ['municipio_id'],
            _count: {
                id: true
            },
            where: {
                municipio_id: {
                    not: null
                }
            }
        });
        for (const grupo of gestantesPorMunicipio) {
            const municipio = await prisma.municipio.findUnique({
                where: { id: grupo.municipio_id },
                select: { nombre: true }
            });
            console.log(`📍 ${municipio?.nombre}: ${grupo._count.id} gestantes`);
        }
        console.log('\n📊 RESUMEN COMPLETO:');
        console.log(`👥 Total usuarios: ${usuarios.length} nuevos usuarios de prueba`);
        console.log(`🤰 Total gestantes: 10 distribuidas en 3 municipios`);
        console.log(`🏥 Total controles: 15 controles prenatales`);
        console.log(`🚨 Total alertas: 8 alertas activas`);
    }
    catch (error) {
        console.error('❌ Error:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
showTestUsers();
