"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🔍 Verificando usuarios super admin...');
    try {
        // Buscar todos los usuarios super admin
        const superAdmins = await prisma.usuario.findMany({
            where: { rol: 'super_admin' },
            select: {
                id: true,
                email: true,
                nombre: true,
                rol: true,
                activo: true,
                created_at: true
            }
        });
        console.log(`👑 Total super admins: ${superAdmins.length}`);
        if (superAdmins.length > 0) {
            console.log('👑 Super admins encontrados:');
            superAdmins.forEach((user, idx) => {
                console.log(`   ${idx + 1}. ${user.email} - ${user.nombre}`);
                console.log(`      ID: ${user.id}`);
                console.log(`      Activo: ${user.activo}`);
                console.log(`      Creado: ${user.created_at}`);
                console.log('');
            });
        }
        // Buscar específicamente el usuario wzuccardi@gmail.com
        console.log('🔍 Buscando usuario wzuccardi@gmail.com...');
        const wzuccardiUser = await prisma.usuario.findUnique({
            where: { email: 'wzuccardi@gmail.com' }
        });
        if (wzuccardiUser) {
            console.log('✅ Usuario wzuccardi@gmail.com encontrado:');
            console.log(`   ID: ${wzuccardiUser.id}`);
            console.log(`   Nombre: ${wzuccardiUser.nombre}`);
            console.log(`   Email: ${wzuccardiUser.email}`);
            console.log(`   Rol: ${wzuccardiUser.rol}`);
            console.log(`   Activo: ${wzuccardiUser.activo}`);
            console.log(`   Creado: ${wzuccardiUser.created_at}`);
            // Verificar la contraseña
            console.log('🔐 Verificando contraseña...');
            const passwordCorrect = await bcrypt_1.default.compare('73102604722', wzuccardiUser.password_hash);
            console.log(`   Contraseña correcta: ${passwordCorrect}`);
        }
        else {
            console.log('❌ Usuario wzuccardi@gmail.com NO encontrado');
            console.log('🔧 Necesitamos crear este usuario...');
        }
        // Buscar todos los usuarios admin para comparar
        console.log('\n📋 Todos los usuarios admin y super_admin:');
        const allAdmins = await prisma.usuario.findMany({
            where: {
                OR: [
                    { rol: 'admin' },
                    { rol: 'super_admin' }
                ]
            },
            select: {
                email: true,
                nombre: true,
                rol: true,
                activo: true
            }
        });
        allAdmins.forEach((user, idx) => {
            console.log(`   ${idx + 1}. ${user.email} - ${user.rol} - Activo: ${user.activo}`);
        });
    }
    catch (error) {
        console.error('❌ Error:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
