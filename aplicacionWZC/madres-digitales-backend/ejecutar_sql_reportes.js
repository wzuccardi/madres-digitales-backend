const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function ejecutarSQL() {
  try {
    console.log('📝 Ejecutando SQL para agregar campos de reportes...');
    
    const sql = fs.readFileSync('../../agregar_campos_reportes.sql', 'utf8');
    
    // Dividir el SQL en comandos individuales
    const comandos = sql.split(';').filter(cmd => cmd.trim().length > 0);
    
    for (const comando of comandos) {
      if (comando.trim()) {
        console.log('Ejecutando:', comando.trim().substring(0, 50) + '...');
        await prisma.$executeRawUnsafe(comando.trim());
      }
    }
    
    console.log('✅ Todos los comandos SQL ejecutados correctamente');
    
  } catch (error) {
    console.error('❌ Error ejecutando SQL:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

ejecutarSQL();