const { PrismaClient } = require('@prisma/client')

async function main() {
  const oldId = process.argv[2]
  const newId = process.argv[3]
  if (!oldId || !newId) {
    console.error('Usage: node scripts/dev_reassign_madrina.js <oldMadrinaId> <newMadrinaId>')
    process.exit(1)
  }
  const prisma = new PrismaClient()
  try {
    const updated = await prisma.gestantes.updateMany({
      where: { madrina_id: oldId },
      data: { madrina_id: newId }
    })
    console.log(`✅ Reassigned gestantes from ${oldId} to ${newId}. Count:`, updated.count)
  } catch (err) {
    console.error('❌ Error reassigning:', err.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
