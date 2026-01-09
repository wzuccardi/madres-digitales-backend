const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')

async function main() {
  const email = process.argv[2]
  const password = process.argv[3]
  const nombre = process.argv[4] || 'Usuario'
  const rol = process.argv[5] || 'MADRINA'
  if (!email || !password) {
    console.error('Usage: node scripts/dev_create_user.js <email> <password> [nombre] [rolFront]')
    process.exit(1)
  }
  const prisma = new PrismaClient()
  try {
    const exists = await prisma.usuarios.findUnique({ where: { email }, select: { id: true } })
    if (exists) {
      console.log('User already exists:', exists)
      process.exit(0)
    }
    const hash = await bcrypt.hash(password, 10)
    const nuevo = await prisma.usuarios.create({
      data: {
        id: `user_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,
        email,
        nombre,
        password_hash: hash,
        rol: rol.toUpperCase(),
        activo: true,
      },
      select: { id: true, email: true, rol: true }
    })
    console.log('✅ User created', nuevo)
  } catch (err) {
    console.error('❌ Error creating user:', err.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
