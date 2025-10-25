// Script de verificación de municipios con coordenadas cargados en PostgreSQL

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

async function verifyMunicipiosWithCoordinates() {
  const pool = new Pool(dbConfig);
  let client;
  
  try {
    console.log('🔍 VERIFICANDO DATOS DE MUNICIPIOS CON COORDENADAS');
    console.log('='.repeat(60));
    
    client = await pool.connect();
    console.log('✅ Conexión a PostgreSQL establecida');
    
    // 1. Contar total de municipios
    const totalResult = await client.query(
      "SELECT COUNT(*) as total FROM municipios"
    );
    console.log(`📊 Total de municipios en la tabla: ${totalResult.rows[0].total}`);
    
    // 2. Verificar municipios con coordenadas
    const coordResult = await client.query(`
      SELECT COUNT(*) as total FROM municipios 
      WHERE latitud IS NOT NULL AND longitud IS NOT NULL
    `);
    console.log(`📍 Municipios con coordenadas: ${coordResult.rows[0].total}`);
    
    // 3. Contar municipios por departamento
    const deptoResult = await client.query(`
      SELECT departamento, COUNT(*) as cantidad 
      FROM municipios 
      GROUP BY departamento 
      ORDER BY cantidad DESC
    `);
    
    console.log('\n📈 Municipios por departamento:');
    deptoResult.rows.forEach(row => {
      console.log(`  • ${row.departamento}: ${row.cantidad} municipios`);
    });
    
    // 4. Verificar municipios de Bolívar específicamente
    const bolivarResult = await client.query(`
      SELECT COUNT(*) as total FROM municipios 
      WHERE departamento = 'BOLÍVAR'
    `);
    console.log(`\n🎯 Municipios de Bolívar cargados: ${bolivarResult.rows[0].total}`);
    
    // 5. Verificar municipios de Bolívar con coordenadas
    const bolivarCoordResult = await client.query(`
      SELECT COUNT(*) as total FROM municipios 
      WHERE departamento = 'BOLÍVAR' 
      AND latitud IS NOT NULL AND longitud IS NOT NULL
    `);
    console.log(`📍 Municipios de Bolívar con coordenadas: ${bolivarCoordResult.rows[0].total}`);
    
    // 6. Mostrar muestra de municipios con coordenadas
    const sampleResult = await client.query(`
      SELECT codigo_dane, nombre, departamento, latitud, longitud, es_capital, activo,
             TO_CHAR(fecha_creacion, 'DD/MM/YYYY HH:MI:SS') as creado
      FROM municipios 
      WHERE departamento = 'BOLÍVAR' 
      AND latitud IS NOT NULL AND longitud IS NOT NULL
      ORDER BY nombre ASC 
      LIMIT 10
    `);
    
    console.log('\n🏛️ Muestra de municipios de Bolívar con coordenadas:');
    sampleResult.rows.forEach((m, i) => {
      const estado = m.activo ? '✅' : '❌';
      const capital = m.es_capital ? '👑 CAPITAL' : '';
      console.log(`  ${i+1}. ${m.nombre} (${m.codigo_dane}) ${estado} - Lat: ${m.latitud}, Lon: ${m.longitud} ${capital}`);
    });
    
    // 7. Verificar si hay códigos DANE nulos
    const nullDaneResult = await client.query(`
      SELECT COUNT(*) as total FROM municipios 
      WHERE codigo_dane IS NULL
    `);
    
    if (nullDaneResult.rows[0].total > 0) {
      console.log(`\n⚠️ Hay ${nullDaneResult.rows[0].total} municipios sin código DANE`);
    } else {
      console.log('\n✅ Todos los municipios tienen código DANE asignado');
    }
    
    // 8. Verificar duplicados por código DANE
    const duplicateResult = await client.query(`
      SELECT codigo_dane, COUNT(*) as cantidad 
      FROM municipios 
      WHERE codigo_dane IS NOT NULL
      GROUP BY codigo_dane 
      HAVING COUNT(*) > 1
    `);
    
    if (duplicateResult.rows.length > 0) {
      console.log('\n⚠️ Códigos DANE duplicados:');
      duplicateResult.rows.forEach(row => {
        console.log(`  • ${row.codigo_dane}: ${row.cantidad} registros`);
      });
    } else {
      console.log('\n✅ No hay códigos DANE duplicados');
    }
    
    // 9. Verificar integridad de datos
    const integrityResult = await client.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN nombre IS NULL OR nombre = '' THEN 1 END) as sin_nombre,
        COUNT(CASE WHEN departamento IS NULL OR departamento = '' THEN 1 END) as sin_departamento,
        COUNT(CASE WHEN activo IS NULL THEN 1 END) as sin_estado
      FROM municipios
    `);
    
    const integrity = integrityResult.rows[0];
    console.log('\n🔍 Integridad de datos:');
    console.log(`  • Total registros: ${integrity.total}`);
    console.log(`  • Sin nombre: ${integrity.sin_nombre}`);
    console.log(`  • Sin departamento: ${integrity.sin_departamento}`);
    console.log(`  • Sin estado: ${integrity.sin_estado}`);
    
    if (integrity.sin_nombre === 0 && integrity.sin_departamento === 0 && integrity.sin_estado === 0) {
      console.log('✅ Integridad de datos verificada');
    } else {
      console.log('⚠️ Hay problemas de integridad en los datos');
    }
    
    // 10. Estadísticas geográficas
    const geoStatsResult = await client.query(`
      SELECT 
        COUNT(*) as total,
        MIN(latitud) as sur, MAX(latitud) as norte,
        MIN(longitud) as oeste, MAX(longitud) as este,
        COUNT(CASE WHEN es_capital = true THEN 1 END) as capitales
      FROM municipios 
      WHERE departamento = 'BOLÍVAR' 
      AND latitud IS NOT NULL 
      AND longitud IS NOT NULL
    `);
    
    if (geoStatsResult.rows.length > 0) {
      const stats = geoStatsResult.rows[0];
      console.log('\n📈 Estadísticas geográficas de Bolívar:');
      console.log(`  • Coordenadas: ${stats.sur}° a ${stats.norte}° N, ${stats.oeste}° a ${stats.este}° W`);
      console.log(`  • Municipios con coordenadas: ${stats.total}`);
      console.log(`  • Capitales: ${stats.capitales}`);
    }
    
    // 11. Listar todos los municipios de Bolívar con coordenadas
    const allBolivarResult = await client.query(`
      SELECT codigo_dane, nombre, latitud, longitud, es_capital
      FROM municipios 
      WHERE departamento = 'BOLÍVAR' 
      AND latitud IS NOT NULL AND longitud IS NOT NULL
      ORDER BY nombre ASC
    `);
    
    console.log('\n📋 Lista completa de municipios de Bolívar con coordenadas:');
    allBolivarResult.rows.forEach((m, i) => {
      const capital = m.es_capital ? ' 👑' : '';
      console.log(`  ${String(i+1).padStart(2, '0')}. ${m.nombre} (${m.codigo_dane}) - Lat: ${m.latitud}, Lon: ${m.longitud}${capital}`);
    });
    
    // 12. Verificar estructura de la tabla
    const structure = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'municipios' 
      AND table_schema = 'public'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Estructura actual de la tabla:');
    structure.rows.forEach(col => {
      const nullable = col.is_nullable === 'YES' ? '(nullable)' : '(required)';
      const def = col.column_default ? ` [${col.column_default}]` : '';
      console.log(`  • ${col.column_name}: ${col.data_type} ${nullable}${def}`);
    });
    
    console.log('\n🎉 ¡VERIFICACIÓN CON COORDENADAS COMPLETADA!');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('💥 Error en verificación:', error);
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

// Ejecutar verificación
if (require.main === module) {
  verifyMunicipiosWithCoordinates()
    .then(() => {
      console.log('\n✅ Verificación con coordenadas finalizada exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 ERROR EN VERIFICACIÓN:', error);
      process.exit(1);
    });
}

module.exports = { verifyMunicipiosWithCoordinates };