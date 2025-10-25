"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function resetPassword() {
    const email = 'wzuccardi@gmail.com';
    const newPassword = 'admin123';
    console.log(`🔐 Reseteando contraseña para: ${email}`);
    const hashedPassword = await bcrypt_1.default.hash(newPassword, 10);
    const user = await prisma.usuario.update({
        where: { email },
        data: { password_hash: hashedPassword }
    });
    console.log(`✅ Contraseña actualizada para: ${user.nombre}`);
    console.log(`📧 Email: ${user.email}`);
    console.log(`🔑 Nueva contraseña: ${newPassword}`);
    await prisma.$disconnect();
}
resetPassword().catch(console.error);
