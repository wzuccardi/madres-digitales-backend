const { PrismaClient } = require('@prisma/client')

async function main() {
  const email = process.argv[2]
  if (!email) {
    console.error('Usage: node scripts/dev_find_user.js <email>')
    process.exit(1)
  }
  const prisma = new PrismaClient()
  try {
    const user = await prisma.usuarios.findUnique({
      where: { email },
      select: { id: true, email: true, rol: true, activo: true, password_hash: true }
    })
    if (!user) {
      console.log('User not found')
    } else {
      const preview = typeof user.password_hash === 'string' ? user.password_hash.substring(0, 12) : null
      console.log('User:', { id: user.id, email: user.email, rol: user.rol, activo: user.activo, hashPreview: preview })
    }
  } catch (err) {
    console.error('Error:', err.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
