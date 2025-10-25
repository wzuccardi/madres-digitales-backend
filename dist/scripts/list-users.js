"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function listUsers() {
    try {
        console.log('👥 Listando usuarios disponibles...');
        const usuarios = await prisma.usuario.findMany({
            select: {
                id: true,
                email: true,
                nombre: true,
                rol: true,
                activo: true
            },
            orderBy: {
                rol: 'asc'
            }
        });
        console.log(`✅ Encontrados ${usuarios.length} usuarios:`);
        for (const usuario of usuarios) {
            const status = usuario.activo ? '✅' : '❌';
            console.log(`${status} ${usuario.rol.toUpperCase()}: ${usuario.nombre} (${usuario.email})`);
        }
        // Mostrar usuarios admin específicamente
        const admins = usuarios.filter(u => u.rol === 'admin' && u.activo);
        if (admins.length > 0) {
            console.log('\n🔑 USUARIOS ADMIN ACTIVOS:');
            for (const admin of admins) {
                console.log(`   📧 Email: ${admin.email}`);
                console.log(`   👤 Nombre: ${admin.nombre}`);
                console.log(`   🆔 ID: ${admin.id}`);
                console.log('');
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
listUsers();
