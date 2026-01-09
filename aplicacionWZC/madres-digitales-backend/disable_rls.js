/**
 * Script para deshabilitar RLS
 * El filtrado se hace en el código de la aplicación
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function disableRLS() {
  console.log('🔓 Deshabilitando Row Level Security...\n');
  
  try {
    await prisma.$connect();
    
    // Deshabilitar RLS en gestantes
    console.log('📋 Deshabilitando RLS en gestantes...');
    await prisma.$executeRawUnsafe('ALTER TABLE public.gestantes DISABLE ROW LEVEL SECURITY');
    console.log('✅ RLS deshabilitado en gestantes');
    
    // Deshabilitar RLS en control_prenatal
    console.log('📋 Deshabilitando RLS en control_prenatal...');
    await prisma.$executeRawUnsafe('ALTER TABLE public.control_prenatal DISABLE ROW LEVEL SECURITY');
    console.log('✅ RLS deshabilitado en control_prenatal');
    
    // Deshabilitar RLS en alertas
    console.log('📋 Deshabilitando RLS en alertas...');
    await prisma.$executeRawUnsafe('ALTER TABLE public.alertas DISABLE ROW LEVEL SECURITY');
    console.log('✅ RLS deshabilitado en alertas');
    
    console.log('\n🎉 RLS deshabilitado exitosamente en todas las tablas!');
    console.log('\n📝 El filtrado de seguridad se hace en el código de la aplicación.');
    console.log('✅ Las madrinas solo verán sus gestantes (filtrado en controladores).\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

disableRLS().catch(console.error);
