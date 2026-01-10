const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')

async function main() {
  const email = process.argv[2]
  const password = process.argv[3]
  if (!email || !password) {
    console.error('Usage: node scripts/dev_set_password.js <email> <password>')
    process.exit(1)
  }
  const prisma = new PrismaClient()
  try {
    const hash = await bcrypt.hash(password, 10)
    const user = await prisma.usuarios.upsert({
      where: { email },
      update: { password_hash: hash, activo: true },
      create: {
        id: `user_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,
        email,
        nombre: email.split('@')[0],
        password_hash: hash,
        rol: 'MADRINA',
        activo: true
      },
      select: { id: true, email: true, rol: true }
    })
    console.log('✅ Password updated', user)
  } catch (err) {
    console.error('❌ Error updating password:', err.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
