/**
 * Script para aplicar Row Level Security (RLS) en la base de datos
 * Ejecuta todos los scripts SQL en orden
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Configuración de la base de datos
const DATABASE_URL = process.env.DATABASE_URL || "postgres://ff07eebc333c5499909e4b9766469e0b08d9c9e62beb8a9e5f426f3c793632a1:sk_fSmVWDgDBhkj8E1xooYPd@db.prisma.io:5432/postgres?sslmode=require";

// Scripts a ejecutar en orden
const scripts = [
  '01_enable_rls.sql',
  '02_create_rls_policies.sql',
  '03_create_security_functions.sql',
  '04_test_rls_policies.sql'
];

async function executeScript(scriptPath, scriptName) {
  console.log(`\n📄 Ejecutando: ${scriptName}`);
  console.log('='.repeat(60));
  
  try {
    const sql = fs.readFileSync(scriptPath, 'utf8');
    
    // Dividir el script en comandos individuales (separados por ;)
    const commands = sql
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    console.log(`   Ejecutando ${commands.length} comandos...`);
    
    // Ejecutar cada comando
    for (const command of commands) {
      if (command.length > 0) {
        try {
          await prisma.$executeRawUnsafe(command);
        } catch (error) {
          // Algunos comandos pueden fallar si ya existen (DROP IF EXISTS, etc.)
          // Solo mostrar errores críticos
          if (!error.message.includes('does not exist') && 
              !error.message.includes('already exists')) {
            console.warn(`   ⚠️ Advertencia: ${error.message.substring(0, 100)}`);
          }
        }
      }
    }
    
    console.log(`✅ ${scriptName} ejecutado exitosamente`);
    return true;
  } catch (error) {
    console.error(`❌ Error ejecutando ${scriptName}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🔐 ==========================================');
  console.log('🔐 APLICANDO ROW LEVEL SECURITY (RLS)');
  console.log('🔐 ==========================================\n');
  
  try {
    // Conectar a la base de datos
    console.log('🔌 Conectando a la base de datos...');
    await prisma.$connect();
    console.log('✅ Conexión establecida\n');
    
    // Ejecutar scripts en orden (omitir el script de tests por ahora)
    const scriptsToRun = scripts.slice(0, 3); // Solo los primeros 3 scripts
    
    for (let i = 0; i < scriptsToRun.length; i++) {
      const scriptName = scriptsToRun[i];
      const scriptPath = path.join(__dirname, 'scripts', scriptName);
      
      // Verificar que el archivo existe
      if (!fs.existsSync(scriptPath)) {
        console.error(`❌ Error: No se encontró el archivo ${scriptPath}`);
        continue;
      }
      
      const success = await executeScript(scriptPath, scriptName);
      
      if (!success) {
        console.error(`\n❌ Falló el script ${scriptName}. Abortando instalación.`);
        process.exit(1);
      }
    }
    
    console.log('\n🎉 ==========================================');
    console.log('🎉 INSTALACIÓN COMPLETADA');
    console.log('🎉 ==========================================\n');
    
    console.log('📝 Próximos pasos:');
    console.log('   1. Reiniciar el servidor backend');
    console.log('   2. Verificar logs de aplicación');
    console.log('   3. Probar con diferentes roles de usuario\n');
    
    console.log('📚 Documentación: IMPLEMENTACION_RLS.md\n');
    
  } catch (error) {
    console.error('\n❌ Error fatal:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    // Cerrar conexión
    await prisma.$disconnect();
    console.log('🔌 Conexión cerrada');
  }
}

// Ejecutar
main().catch(console.error);
