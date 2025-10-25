"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🔧 Corrigiendo contraseña para wzuccardi@gmail.com...');
    try {
        // Buscar el usuario
        const user = await prisma.usuario.findUnique({
            where: { email: 'wzuccardi@gmail.com' }
        });
        if (!user) {
            console.log('❌ Usuario wzuccardi@gmail.com no encontrado');
            return;
        }
        console.log('✅ Usuario encontrado:', user.nombre);
        // Generar hash de la nueva contraseña
        const newPassword = '73102604722';
        const saltRounds = 10;
        const hashedPassword = await bcrypt_1.default.hash(newPassword, saltRounds);
        console.log('🔐 Generando nuevo hash de contraseña...');
        // Actualizar la contraseña
        await prisma.usuario.update({
            where: { email: 'wzuccardi@gmail.com' },
            data: {
                password_hash: hashedPassword,
                updated_at: new Date()
            }
        });
        console.log('✅ Contraseña actualizada exitosamente');
        // Verificar que la nueva contraseña funciona
        console.log('🧪 Verificando nueva contraseña...');
        const updatedUser = await prisma.usuario.findUnique({
            where: { email: 'wzuccardi@gmail.com' }
        });
        if (updatedUser) {
            const passwordCorrect = await bcrypt_1.default.compare(newPassword, updatedUser.password_hash);
            console.log(`✅ Verificación: ${passwordCorrect ? 'EXITOSA' : 'FALLIDA'}`);
            if (passwordCorrect) {
                console.log('🎉 ¡Contraseña corregida! Ahora puedes hacer login con:');
                console.log(`   Email: wzuccardi@gmail.com`);
                console.log(`   Password: 73102604722`);
                console.log(`   Rol: ${updatedUser.rol}`);
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
main();
