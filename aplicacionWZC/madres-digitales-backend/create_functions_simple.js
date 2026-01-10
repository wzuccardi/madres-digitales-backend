/**
 * Script para crear funciones de seguridad de forma simplificada
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('⚙️ Creando funciones de seguridad...\n');
  
  try {
    await prisma.$connect();
    
    // Función 1: set_app_context
    console.log('📋 Creando función set_app_context...');
    await prisma.$executeRawUnsafe(`
      CREATE OR REPLACE FUNCTION public.set_app_context(user_id text, user_rol text)
      RETURNS void AS $$
      BEGIN
        IF user_rol NOT IN ('SUPER_ADMIN', 'ADMIN', 'COORDINADOR', 'MADRINA', 'MEDICO') THEN
          RAISE EXCEPTION 'Rol inválido: %', user_rol;
        END IF;
        PERFORM set_config('app.current_user_id', user_id, false);
        PERFORM set_config('app.current_user_rol', user_rol, false);
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER
    `);
    console.log('✅ Función set_app_context creada');
    
    // Función 2: clear_app_context
    console.log('📋 Creando función clear_app_context...');
    await prisma.$executeRawUnsafe(`
      CREATE OR REPLACE FUNCTION public.clear_app_context()
      RETURNS void AS $$
      BEGIN
        PERFORM set_config('app.current_user_id', '', false);
        PERFORM set_config('app.current_user_rol', '', false);
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER
    `);
    console.log('✅ Función clear_app_context creada');
    
    // Función 3: get_app_context
    console.log('📋 Creando función get_app_context...');
    await prisma.$executeRawUnsafe(`
      CREATE OR REPLACE FUNCTION public.get_app_context()
      RETURNS TABLE(user_id text, user_rol text) AS $$
      BEGIN
        RETURN QUERY SELECT 
          current_setting('app.current_user_id', true) as user_id,
          current_setting('app.current_user_rol', true) as user_rol;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER
    `);
    console.log('✅ Función get_app_context creada');
    
    console.log('\n🎉 Funciones de seguridad creadas exitosamente!\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
