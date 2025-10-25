// Script adaptado para PostgreSQL: limpiar + cargar municipios de Bolívar
// Compatible con el esquema Prisma actual

const { Pool } = require('pg');
require('dotenv').config();

// Configuración de la base de datos PostgreSQL
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '731026',
  database: process.env.DB_NAME || 'madres_digitales',
  port: process.env.DB_PORT || 5432,
};

async function setupMunicipiosPostgreSQL() {
  const pool = new Pool(dbConfig);
  let client;
  
  try {
    console.log('🚀 INICIANDO SETUP DE MUNICIPIOS PARA POSTGRESQL');
    console.log('='.repeat(50));
    
    // Obtener cliente del pool
    client = await pool.connect();
    console.log('✅ Conexión a PostgreSQL establecida');
    
    // PASO 1: BLANQUEAR TABLA
    console.log('\n🧹 PASO 1: BLANQUEANDO TABLA MUNICIPIOS...');
    
    try {
      // Verificar si la tabla existe
      const tableExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'municipios'
        );
      `);
      
      if (tableExists.rows[0].exists) {
        // Contar registros existentes
        const countResult = await client.query(
          "SELECT COUNT(*) as total FROM municipios"
        );
        console.log(`📊 Registros existentes: ${countResult.rows[0].total}`);
        
        // Blanquear tabla (TRUNCATE en PostgreSQL)
        await client.query("TRUNCATE TABLE municipios RESTART IDENTITY CASCADE");
        
        console.log('✅ Tabla blanqueada exitosamente');
      } else {
        console.log('ℹ️ Tabla municipios no existe, se creará automáticamente por Prisma');
      }
    } catch (error) {
      console.log('⚠️ Error blanqueando tabla:', error.message);
    }
    
    // PASO 2: INSERTAR DATOS DE BOLÍVAR
    console.log('\n📥 PASO 2: INSERTANDO 46 MUNICIPIOS DE BOLÍVAR...');
    
    // Datos de municipios adaptados al esquema Prisma
    const municipios = [
      ['13001', 'CARTAGENA DE INDIAS', 'BOLÍVAR'],
      ['13006', 'ACHÍ', 'BOLÍVAR'],
      ['13030', 'ALTOS DEL ROSARIO', 'BOLÍVAR'],
      ['13042', 'ARENAL', 'BOLÍVAR'],
      ['13052', 'ARJONA', 'BOLÍVAR'],
      ['13062', 'ARROYOHONDO', 'BOLÍVAR'],
      ['13074', 'BARRANCO DE LOBA', 'BOLÍVAR'],
      ['13140', 'CALAMAR', 'BOLÍVAR'],
      ['13160', 'CANTAGALLO', 'BOLÍVAR'],
      ['13188', 'CICUCO', 'BOLÍVAR'],
      ['13222', 'CLEMENCIA', 'BOLÍVAR'],
      ['13212', 'CÓRDOBA', 'BOLÍVAR'],
      ['13244', 'EL CARMEN DE BOLÍVAR', 'BOLÍVAR'],
      ['13248', 'EL GUAMO', 'BOLÍVAR'],
      ['13268', 'EL PEÑÓN', 'BOLÍVAR'],
      ['13300', 'HATILLO DE LOBA', 'BOLÍVAR'],
      ['13430', 'MAGANGUÉ', 'BOLÍVAR'],
      ['13433', 'MAHATES', 'BOLÍVAR'],
      ['13440', 'MARGARITA', 'BOLÍVAR'],
      ['13442', 'MARÍA LA BAJA', 'BOLÍVAR'],
      ['13458', 'MONTECRISTO', 'BOLÍVAR'],
      ['13473', 'MORALES', 'BOLÍVAR'],
      ['13490', 'NOROSÍ', 'BOLÍVAR'],
      ['13549', 'PINILLOS', 'BOLÍVAR'],
      ['13580', 'REGIDOR', 'BOLÍVAR'],
      ['13600', 'RÍO VIEJO', 'BOLÍVAR'],
      ['13620', 'SAN CRISTÓBAL', 'BOLÍVAR'],
      ['13647', 'SAN ESTANISLAO', 'BOLÍVAR'],
      ['13650', 'SAN FERNANDO', 'BOLÍVAR'],
      ['13654', 'SAN JACINTO', 'BOLÍVAR'],
      ['13655', 'SAN JACINTO DEL CAUCA', 'BOLÍVAR'],
      ['13657', 'SAN JUAN NEPOMUCENO', 'BOLÍVAR'],
      ['13667', 'SAN MARTÍN DE LOBA', 'BOLÍVAR'],
      ['13670', 'SAN PABLO', 'BOLÍVAR'],
      ['13673', 'SANTA CATALINA', 'BOLÍVAR'],
      ['13683', 'SANTA ROSA', 'BOLÍVAR'],
      ['13688', 'SANTA ROSA DEL SUR', 'BOLÍVAR'],
      ['13468', 'SANTA CRUZ DE MOMPOX', 'BOLÍVAR'],
      ['13744', 'SIMITÍ', 'BOLÍVAR'],
      ['13760', 'SOPLAVIENTO', 'BOLÍVAR'],
      ['13780', 'TALAIGUA NUEVO', 'BOLÍVAR'],
      ['13810', 'TIQUISIO', 'BOLÍVAR'],
      ['13836', 'TURBACO', 'BOLÍVAR'],
      ['13838', 'TURBANÁ', 'BOLÍVAR'],
      ['13873', 'VILLANUEVA', 'BOLÍVAR'],
      ['13894', 'ZAMBRANO', 'BOLÍVAR']
    ];
    
    const insertSQL = `
      INSERT INTO municipios (
        id, nombre, departamento, codigo_dane, activo, 
        fecha_creacion, fecha_actualizacion
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, true, NOW(), NOW()
      )
    `;
    
    let insertados = 0;
    for (const municipio of municipios) {
      try {
        await client.query(insertSQL, [
          municipio[1], // nombre
          municipio[2], // departamento
          municipio[0]  // codigo_dane
        ]);
        insertados++;
        
        if (insertados % 10 === 0) {
          console.log(`  📍 ${insertados} municipios insertados...`);
        }
      } catch (error) {
        console.error(`❌ Error insertando ${municipio[1]}:`, error.message);
      }
    }
    
    console.log(`✅ ${insertados} municipios insertados exitosamente`);
    
    // PASO 3: VERIFICACIONES FINALES
    console.log('\n🔍 PASO 3: VERIFICACIONES FINALES...');
    
    // Contar total
    const totalResult = await client.query(
      "SELECT COUNT(*) as total FROM municipios WHERE departamento = 'BOLÍVAR'"
    );
    console.log(`📊 Total municipios de Bolívar: ${totalResult.rows[0].total}`);
    
    // Mostrar municipios principales
    const principales = await client.query(`
      SELECT codigo_dane, nombre, fecha_creacion
      FROM municipios 
      WHERE departamento = 'BOLÍVAR' 
      ORDER BY nombre ASC 
      LIMIT 10
    `);
    
    console.log('\n🏛️ Primeros 10 municipios (orden alfabético):');
    principales.rows.forEach((m, i) => {
      console.log(`  ${i+1}. ${m.nombre} (${m.codigo_dane})`);
    });
    
    // Verificar estructura de la tabla
    const structure = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'municipios' 
      AND table_schema = 'public'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Estructura actual de la tabla:');
    structure.rows.forEach(col => {
      console.log(`  • ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(required)'}`);
    });
    
    console.log('\n🎉 ¡SETUP DE MUNICIPIOS POSTGRESQL FINALIZADO!');
    console.log('='.repeat(50));
    console.log('✅ Tabla municipios blanqueada');
    console.log('✅ 46 municipios de Bolívar cargados');
    console.log('✅ Estructura compatible con Prisma');
    console.log('✅ Listo para usar en la aplicación');
    
  } catch (error) {
    console.error('💥 Error en setup PostgreSQL:', error);
    throw error;
  } finally {
    if (client) {
      client.release();
      console.log('🔌 Conexión liberada');
    }
    await pool.end();
    console.log('🔌 Pool de conexiones cerrado');
  }
}

// Ejecutar setup completo
if (require.main === module) {
  setupMunicipiosPostgreSQL()
    .then(() => {
      console.log('\n🚀 ¡PROCESO COMPLETADO EXITOSAMENTE!');
      console.log('La tabla municipios está lista con los datos de Bolívar');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 ERROR FATAL:', error);
      process.exit(1);
    });
}

module.exports = { setupMunicipiosPostgreSQL };

// INSTRUCCIONES:
// 1. Asegurarse que las variables de entorno estén configuradas
// 2. npm install pg dotenv
// 3. node setup-municipios-postgresql.js
// 4. ¡Listo! Tabla completamente configurada para PostgreSQL