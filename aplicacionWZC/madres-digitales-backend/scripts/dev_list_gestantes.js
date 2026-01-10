const { PrismaClient } = require('@prisma/client')

async function main() {
  const prisma = new PrismaClient()
  try {
    const gestantes = await prisma.gestantes.findMany({
      take: 20,
      orderBy: { nombre: 'asc' },
      select: { id: true, nombre: true, documento: true, madrina_id: true, activa: true }
    })
    console.log('Gestantes (sample):', gestantes)
  } catch (err) {
    console.error('Error listing gestantes:', err.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
