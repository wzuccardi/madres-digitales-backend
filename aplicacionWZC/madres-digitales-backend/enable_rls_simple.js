/**
 * Script simple para habilitar RLS
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔒 Habilitando Row Level Security...\n');
  
  try {
    await prisma.$connect();
    
    // Habilitar RLS en gestantes
    console.log('📋 Habilitando RLS en gestantes...');
    await prisma.$executeRawUnsafe('ALTER TABLE public.gestantes ENABLE ROW LEVEL SECURITY');
    console.log('✅ RLS habilitado en gestantes');
    
    // Habilitar RLS en control_prenatal
    console.log('📋 Habilitando RLS en control_prenatal...');
    await prisma.$executeRawUnsafe('ALTER TABLE public.control_prenatal ENABLE ROW LEVEL SECURITY');
    console.log('✅ RLS habilitado en control_prenatal');
    
    // Habilitar RLS en alertas
    console.log('📋 Habilitando RLS en alertas...');
    await prisma.$executeRawUnsafe('ALTER TABLE public.alertas ENABLE ROW LEVEL SECURITY');
    console.log('✅ RLS habilitado en alertas');
    
    console.log('\n🎉 RLS habilitado exitosamente en todas las tablas!\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
