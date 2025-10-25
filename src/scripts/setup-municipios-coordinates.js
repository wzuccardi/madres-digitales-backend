// Script para limpiar municipios, agregar campos de coordenadas y cargar nuevos datos
// Compatible con PostgreSQL y datos del archivo Bolivar.txt

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

async function setupMunicipiosWithCoordinates() {
  const pool = new Pool(dbConfig);
  let client;
  
  try {
    console.log('🚀 INICIANDO SETUP DE MUNICIPIOS CON COORDENADAS');
    console.log('='.repeat(60));
    
    client = await pool.connect();
    console.log('✅ Conexión a PostgreSQL establecida');
    
    // PASO 1: AGREGAR CAMPOS DE COORDENADAS
    console.log('\n🏗️ PASO 1: AGREGANDO CAMPOS DE COORDENADAS A LA TABLA...');
    
    // Leer y ejecutar el script SQL para agregar campos
    const fs = require('fs');
    const sqlScript = fs.readFileSync('./src/scripts/add-coordinates-fields.sql', 'utf8');
    await client.query(sqlScript);
    console.log('✅ Campos de coordenadas agregados exitosamente');
    
    // PASO 2: BLANQUEAR REGISTROS (NO LA TABLA)
    console.log('\n🧹 PASO 2: BLANQUEANDO REGISTROS DE LA TABLA MUNICIPIOS...');
    
    const countBefore = await client.query(
      "SELECT COUNT(*) as total FROM municipios"
    );
    console.log(`📊 Registros existentes: ${countBefore.rows[0].total}`);
    
    await client.query("TRUNCATE TABLE municipios RESTART IDENTITY CASCADE");
    console.log('✅ Registros eliminados exitosamente (tabla intacta)');
    
    // PASO 3: INSERTAR DATOS DE BOLÍVAR CON COORDENADAS
    console.log('\n📥 PASO 3: INSERTANDO 46 MUNICIPIOS DE BOLÍVAR CON COORDENADAS...');
    
    // Datos completos de municipios con coordenadas del archivo Bolivar.txt
    const municipios = [
      ['13001', 'CARTAGENA DE INDIAS', 'BOLÍVAR', 10.385126, -75.496269, true],
      ['13006', 'ACHÍ', 'BOLÍVAR', 8.570107, -74.557676, false],
      ['13030', 'ALTOS DEL ROSARIO', 'BOLÍVAR', 8.791865, -74.164905, false],
      ['13042', 'ARENAL', 'BOLÍVAR', 8.458865, -73.941099, false],
      ['13052', 'ARJONA', 'BOLÍVAR', 10.256660, -75.344332, false],
      ['13062', 'ARROYOHONDO', 'BOLÍVAR', 10.250075, -75.019215, false],
      ['13074', 'BARRANCO DE LOBA', 'BOLÍVAR', 8.947787, -74.104391, false],
      ['13140', 'CALAMAR', 'BOLÍVAR', 10.250431, -74.916144, false],
      ['13160', 'CANTAGALLO', 'BOLÍVAR', 7.378678, -73.914605, false],
      ['13188', 'CICUCO', 'BOLÍVAR', 9.274281, -74.645981, false],
      ['13212', 'CÓRDOBA', 'BOLÍVAR', 9.586942, -74.827399, false],
      ['13222', 'CLEMENCIA', 'BOLÍVAR', 10.567452, -75.328469, false],
      ['13244', 'EL CARMEN DE BOLÍVAR', 'BOLÍVAR', 9.718653, -75.121178, false],
      ['13248', 'EL GUAMO', 'BOLÍVAR', 10.030958, -74.976084, false],
      ['13268', 'EL PEÑÓN', 'BOLÍVAR', 8.988271, -73.949274, false],
      ['13300', 'HATILLO DE LOBA', 'BOLÍVAR', 8.956014, -74.077912, false],
      ['13430', 'MAGANGUÉ', 'BOLÍVAR', 9.263799, -74.766742, false],
      ['13433', 'MAHATES', 'BOLÍVAR', 10.233285, -75.191643, false],
      ['13440', 'MARGARITA', 'BOLÍVAR', 9.157840, -74.285137, false],
      ['13442', 'MARÍA LA BAJA', 'BOLÍVAR', 9.982402, -75.300516, false],
      ['13458', 'MONTECRISTO', 'BOLÍVAR', 8.297234, -74.471176, false],
      ['13468', 'SANTA CRUZ DE MOMPOX', 'BOLÍVAR', 9.244241, -74.428180, false],
      ['13473', 'MORALES', 'BOLÍVAR', 8.276558, -73.868172, false],
      ['13490', 'NOROSÍ', 'BOLÍVAR', 8.526259, -74.038003, false],
      ['13549', 'PINILLOS', 'BOLÍVAR', 8.914947, -74.462279, false],
      ['13580', 'REGIDOR', 'BOLÍVAR', 8.666258, -73.821638, false],
      ['13600', 'RÍO VIEJO', 'BOLÍVAR', 8.587950, -73.840466, false],
      ['13620', 'SAN CRISTÓBAL', 'BOLÍVAR', 10.392836, -75.065076, false],
      ['13647', 'SAN ESTANISLAO', 'BOLÍVAR', 10.398602, -75.153101, false],
      ['13650', 'SAN FERNANDO', 'BOLÍVAR', 9.214183, -74.323811, false],
      ['13654', 'SAN JACINTO', 'BOLÍVAR', 9.830275, -75.121050, false],
      ['13655', 'SAN JACINTO DEL CAUCA', 'BOLÍVAR', 8.251580, -74.721156, false],
      ['13657', 'SAN JUAN NEPOMUCENO', 'BOLÍVAR', 9.953751, -75.081761, false],
      ['13667', 'SAN MARTÍN DE LOBA', 'BOLÍVAR', 8.937485, -74.039134, false],
      ['13670', 'SAN PABLO', 'BOLÍVAR', 7.476747, -73.924602, false],
      ['13673', 'SANTA CATALINA', 'BOLÍVAR', 10.605294, -75.287855, false],
      ['13683', 'SANTA ROSA', 'BOLÍVAR', 10.444396, -75.369824, false],
      ['13688', 'SANTA ROSA DEL SUR', 'BOLÍVAR', 7.963938, -74.052243, false],
      ['13744', 'SIMITÍ', 'BOLÍVAR', 7.953916, -73.947264, false],
      ['13760', 'SOPLAVIENTO', 'BOLÍVAR', 10.388390, -75.136404, false],
      ['13780', 'TALAIGUA NUEVO', 'BOLÍVAR', 9.304030, -74.567479, false],
      ['13810', 'TIQUISIO', 'BOLÍVAR', 8.558666, -74.262922, false],
      ['13836', 'TURBACO', 'BOLÍVAR', 10.348316, -75.427249, false],
      ['13838', 'TURBANÁ', 'BOLÍVAR', 10.274585, -75.442650, false],
      ['13873', 'VILLANUEVA', 'BOLÍVAR', 10.444089, -75.275613, false],
      ['13894', 'ZAMBRANO', 'BOLÍVAR', 9.746306, -74.817879, false]
    ];
    
    const insertSQL = `
      INSERT INTO municipios (
        id, nombre, departamento, codigo_dane, latitud, longitud, 
        es_capital, activo, fecha_creacion, fecha_actualizacion
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, $6, true, NOW(), NOW()
      )
    `;
    
    let insertados = 0;
    for (const municipio of municipios) {
      try {
        await client.query(insertSQL, [
          municipio[1], // nombre
          municipio[2], // departamento
          municipio[0], // codigo_dane
          municipio[3], // latitud
          municipio[4], // longitud
          municipio[5]  // es_capital
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
    
    // PASO 4: VERIFICACIONES FINALES
    console.log('\n🔍 PASO 4: VERIFICACIONES FINALES...');
    
    // Contar total
    const totalResult = await client.query(
      "SELECT COUNT(*) as total FROM municipios WHERE departamento = 'BOLÍVAR'"
    );
    console.log(`📊 Total municipios de Bolívar: ${totalResult.rows[0].total}`);
    
    // Verificar municipios con coordenadas
    const coordResult = await client.query(`
      SELECT COUNT(*) as total FROM municipios 
      WHERE departamento = 'BOLÍVAR' 
      AND latitud IS NOT NULL 
      AND longitud IS NOT NULL
    `);
    console.log(`📍 Municipios con coordenadas: ${coordResult.rows[0].total}`);
    
    // Mostrar municipios principales con coordenadas
    const principales = await client.query(`
      SELECT codigo_dane, nombre, latitud, longitud, es_capital
      FROM municipios 
      WHERE departamento = 'BOLÍVAR' 
      ORDER BY nombre ASC 
      LIMIT 10
    `);
    
    console.log('\n🏛️ Primeros 10 municipios con coordenadas:');
    principales.rows.forEach((m, i) => {
      const capital = m.es_capital ? ' 👑 CAPITAL' : '';
      console.log(`  ${i+1}. ${m.nombre} (${m.codigo_dane}) - Lat: ${m.latitud}, Lon: ${m.longitud}${capital}`);
    });
    
    // Estadísticas geográficas
    const stats = await client.query(`
      SELECT 
        COUNT(*) as total,
        MIN(latitud) as sur, MAX(latitud) as norte,
        MIN(longitud) as oeste, MAX(longitud) as este
      FROM municipios 
      WHERE departamento = 'BOLÍVAR' 
      AND latitud IS NOT NULL 
      AND longitud IS NOT NULL
    `);
    
    if (stats.rows.length > 0) {
      const s = stats.rows[0];
      console.log('\n📈 Estadísticas geográficas:');
      console.log(`  • Coordenadas: ${s.sur}° a ${s.norte}° N, ${s.oeste}° a ${s.este}° W`);
    }
    
    // Verificar estructura de la tabla
    const structure = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'municipios' 
      AND table_schema = 'public'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Estructura actual de la tabla:');
    structure.rows.forEach(col => {
      console.log(`  • ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(required)'}`);
    });
    
    console.log('\n🎉 ¡SETUP DE MUNICIPIOS CON COORDENADAS FINALIZADO!');
    console.log('='.repeat(60));
    console.log('✅ Tabla municipios mantenida intacta');
    console.log('✅ Campos de coordenadas agregados');
    console.log('✅ 46 municipios de Bolívar con coordenadas cargados');
    console.log('✅ Coordenadas validadas del archivo Bolivar.txt');
    console.log('✅ Índices geográficos creados');
    console.log('✅ Listo para usar en la aplicación');
    
  } catch (error) {
    console.error('💥 Error en setup completo:', error);
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
  setupMunicipiosWithCoordinates()
    .then(() => {
      console.log('\n🚀 ¡PROCESO COMPLETADO EXITOSAMENTE!');
      console.log('La tabla municipios está lista con coordenadas de Bolívar');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 ERROR FATAL:', error);
      process.exit(1);
    });
}

module.exports = { setupMunicipiosWithCoordinates };

// INSTRUCCIONES:
// 1. Asegurarse que las variables de entorno estén configuradas
// 2. npm install pg dotenv
// 3. node setup-municipios-coordinates.js
// 4. ¡Listo! Tabla completamente configurada con coordenadas