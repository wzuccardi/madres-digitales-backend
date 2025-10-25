import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function resetPassword() {
  const email = 'wzuccardi@gmail.com';
  const newPassword = 'admin123';

  console.log(`🔐 Reseteando contraseña para: ${email}`);

  const hashedPassword = await bcrypt.hash(newPassword, 10);

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

