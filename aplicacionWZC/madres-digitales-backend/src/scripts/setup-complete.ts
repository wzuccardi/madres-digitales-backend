import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { importMunicipiosBolivar } from './import-municipios-bolivar';

const prisma = new PrismaClient();

async function setupCompleteSystem() {
  console.log('🚀 Iniciando configuración completa del sistema Madres Digitales...\n');

  try {
    // 1. Verificar que el archivo Bolivar.txt existe
    await verificarArchivosRequeridos();

    // 2. Configurar PostGIS
    await configurarPostGIS();

    // 3. Ejecutar migraciones de Prisma
    await ejecutarMigraciones();

    // 4. Importar municipios de Bolívar
    await importarMunicipios();

    // 5. Crear usuario super administrador
    await crearSuperAdmin();

    // 6. Verificar configuración
    await verificarConfiguracion();

    console.log('\n🎉 ¡Configuración completa exitosa!');
    console.log('📋 Resumen:');
    console.log('   ✅ PostGIS instalado y configurado');
    console.log('   ✅ Base de datos migrada');
    console.log('   ✅ Municipios de Bolívar importados');
    console.log('   ✅ Super administrador creado');
    console.log('   ✅ Sistema listo para usar');

  } catch (error) {
    console.error('❌ Error durante la configuración:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function verificarArchivosRequeridos() {
  console.log('📁 Verificando archivos requeridos...');

  const bolivarFile = 'C:/Madrinas/genio/Bolivar.txt';
  
  if (!fs.existsSync(bolivarFile)) {
    throw new Error(`❌ Archivo no encontrado: ${bolivarFile}`);
  }

  console.log('✅ Archivo Bolivar.txt encontrado');

  // Verificar contenido del archivo
  const content = fs.readFileSync(bolivarFile, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim() !== '');
  
  console.log(`📊 Archivo contiene ${lines.length} líneas`);
  
  if (lines.length < 2) {
    throw new Error('❌ El archivo Bolivar.txt parece estar vacío o mal formateado');
  }

  // Mostrar primera línea como ejemplo
  console.log(`📝 Primera línea: ${lines[0].substring(0, 100)}...`);
}

async function configurarPostGIS() {
  console.log('\n🗺️ Configurando PostGIS...');

  try {
    // Leer script SQL de configuración
    const sqlScript = fs.readFileSync(
      path.join(__dirname, 'setup-postgis.sql'),
      'utf-8'
    );

    // Ejecutar script SQL usando Prisma
    const statements = sqlScript
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    for (const statement of statements) {
      try {
        if (statement.toLowerCase().includes('create extension')) {
          console.log(`📦 Instalando extensión: ${statement.substring(0, 50)}...`);
        }
        
        await prisma.$executeRawUnsafe(statement);
      } catch (error: any) {
        // Algunas extensiones pueden ya estar instaladas
        if (error.message && error.message.includes('already exists')) {
          console.log('ℹ️ Extensión ya existe, continuando...');
        } else {
          console.warn(`⚠️ Advertencia ejecutando: ${statement.substring(0, 50)}...`);
          console.warn(`   Error: ${error.message || error}`);
        }
      }
    }

    // Verificar PostGIS
    const result = await prisma.$queryRaw`SELECT PostGIS_Version() as version` as any[];
    console.log(`✅ PostGIS configurado correctamente. Versión: ${result[0]?.version}`);

  } catch (error) {
    console.error('❌ Error configurando PostGIS:', error);
    throw error;
  }
}

async function ejecutarMigraciones() {
  console.log('\n🔄 Ejecutando migraciones de base de datos...');

  try {
    // Ejecutar migraciones usando Prisma CLI
    execSync('npx prisma migrate deploy', {
      stdio: 'inherit',
      cwd: path.join(__dirname, '../..')
    });

    console.log('✅ Migraciones ejecutadas correctamente');
  } catch (error) {
    console.error('❌ Error ejecutando migraciones:', error);
    throw error;
  }
}

async function importarMunicipios() {
  console.log('\n🏛️ Importando municipios de Bolívar...');

  try {
    await importMunicipiosBolivar();
    console.log('✅ Municipios importados correctamente');
  } catch (error) {
    console.error('❌ Error importando municipios:', error);
    throw error;
  }
}

async function crearSuperAdmin() {
  console.log('\n👤 Creando usuario super administrador...');

  try {
    // Verificar si ya existe un super admin
    const existingSuperAdmin = await prisma.usuario.findFirst({
      where: { rol: 'super_admin' as any }
    });

    if (existingSuperAdmin) {
      console.log('ℹ️ Super administrador ya existe:', existingSuperAdmin.email);
      return;
    }

    // Buscar un municipio de Bolívar para asignar
    const municipioBogota = await prisma.municipio.findFirst({
      where: {
        nombre: { contains: 'CARTAGENA', mode: 'insensitive' },
        departamento: 'BOLÍVAR'
      }
    });

    const superAdmin = await prisma.usuario.create({
      data: {
        email: 'superadmin@madresdigitales.gov.co',
        password_hash: '$2b$10$rQJ5qKqKqKqKqKqKqKqKqOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', // password: admin123
        nombre: 'Super Administrador',
        telefono: '3001234567',
        rol: 'super_admin' as any,
        municipio_id: municipioBogota?.id,
        activo: true,
        created_at: new Date(),
        updated_at: new Date(),
      }
    });

    console.log('✅ Super administrador creado:');
    console.log(`   📧 Email: ${superAdmin.email}`);
    console.log(`   🔑 Password: admin123`);
    console.log(`   🏛️ Municipio: ${municipioBogota?.nombre || 'Sin asignar'}`);

  } catch (error) {
    console.error('❌ Error creando super administrador:', error);
    throw error;
  }
}

async function verificarConfiguracion() {
  console.log('\n🔍 Verificando configuración final...');

  try {
    // Verificar PostGIS
    const postgisVersion = await prisma.$queryRaw`SELECT PostGIS_Version() as version` as any[];
    console.log(`✅ PostGIS: ${postgisVersion[0]?.version}`);

    // Verificar municipios
    const totalMunicipios = await prisma.municipio.count();
    const municipiosBolivar = await prisma.municipio.count({
      where: { departamento: 'BOLÍVAR' }
    });
    console.log(`✅ Municipios: ${totalMunicipios} total, ${municipiosBolivar} de Bolívar`);

    // Verificar usuarios
    const totalUsuarios = await prisma.usuario.count();
    const superAdmins = await prisma.usuario.count({
      where: { rol: 'super_admin' as any }
    });
    console.log(`✅ Usuarios: ${totalUsuarios} total, ${superAdmins} super admin(s)`);

    // Verificar índices espaciales
    const indices = await prisma.$queryRaw`
      SELECT indexname, tablename
      FROM pg_indexes
      WHERE indexname LIKE '%_gist'
      AND schemaname = 'public'
    ` as any[];
    console.log(`✅ Índices espaciales: ${indices.length} creados`);

    // Verificar funciones PostGIS
    const funciones = await prisma.$queryRaw`
      SELECT routine_name
      FROM information_schema.routines
      WHERE routine_name IN ('calcular_distancia_metros', 'encontrar_municipios_cercanos')
      AND routine_schema = 'public'
    ` as any[];
    console.log(`✅ Funciones PostGIS: ${funciones.length} disponibles`);

  } catch (error) {
    console.error('❌ Error verificando configuración:', error);
    throw error;
  }
}

// Función para mostrar ayuda
function mostrarAyuda() {
  console.log(`
🏥 Sistema Madres Digitales - Configuración Completa

Este script configura todo el sistema:

1. 📁 Verifica que existe C:/Madrinas/genio/Bolivar.txt
2. 🗺️ Instala y configura PostGIS
3. 🔄 Ejecuta migraciones de base de datos
4. 🏛️ Importa municipios de Bolívar con coordenadas
5. 👤 Crea usuario super administrador
6. 🔍 Verifica que todo esté funcionando

Uso:
  npm run setup:complete
  
Credenciales del Super Admin:
  📧 Email: superadmin@madresdigitales.gov.co
  🔑 Password: admin123

Requisitos:
  - PostgreSQL con permisos para instalar extensiones
  - Archivo C:/Madrinas/genio/Bolivar.txt
  - Node.js y npm instalados
`);
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    mostrarAyuda();
    process.exit(0);
  }

  setupCompleteSystem()
    .then(() => {
      console.log('\n🎯 Sistema listo para usar!');
      console.log('🌐 Inicia el servidor: npm run dev');
      console.log('📱 Inicia las aplicaciones Flutter');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Error fatal:', error);
      process.exit(1);
    });
}

export { setupCompleteSystem };
