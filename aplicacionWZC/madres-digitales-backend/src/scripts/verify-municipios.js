// Script de verificación de municipios cargados en PostgreSQL

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

async function verifyMunicipios() {
  const pool = new Pool(dbConfig);
  let client;
  
  try {
    console.log('🔍 VERIFICANDO DATOS DE MUNICIPIOS CARGADOS');
    console.log('='.repeat(50));
    
    client = await pool.connect();
    console.log('✅ Conexión a PostgreSQL establecida');
    
    // 1. Contar total de municipios
    const totalResult = await client.query(
      "SELECT COUNT(*) as total FROM municipios"
    );
    console.log(`📊 Total de municipios en la tabla: ${totalResult.rows[0].total}`);
    
    // 2. Contar municipios por departamento
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
    
    // 3. Verificar municipios de Bolívar específicamente
    const bolivarResult = await client.query(`
      SELECT COUNT(*) as total FROM municipios 
      WHERE departamento = 'BOLÍVAR'
    `);
    console.log(`\n🎯 Municipios de Bolívar cargados: ${bolivarResult.rows[0].total}`);
    
    // 4. Mostrar muestra de municipios con sus códigos DANE
    const sampleResult = await client.query(`
      SELECT codigo_dane, nombre, departamento, activo, 
             TO_CHAR(fecha_creacion, 'DD/MM/YYYY HH:MI:SS') as creado
      FROM municipios 
      WHERE departamento = 'BOLÍVAR'
      ORDER BY codigo_dane ASC 
      LIMIT 10
    `);
    
    console.log('\n🏛️ Muestra de municipios de Bolívar:');
    sampleResult.rows.forEach((m, i) => {
      const estado = m.activo ? '✅' : '❌';
      console.log(`  ${i+1}. ${m.nombre} (${m.codigo_dane}) ${estado} - Creado: ${m.creado}`);
    });
    
    // 5. Verificar si hay códigos DANE nulos
    const nullDaneResult = await client.query(`
      SELECT COUNT(*) as total FROM municipios 
      WHERE codigo_dane IS NULL
    `);
    
    if (nullDaneResult.rows[0].total > 0) {
      console.log(`\n⚠️ Hay ${nullDaneResult.rows[0].total} municipios sin código DANE`);
    } else {
      console.log('\n✅ Todos los municipios tienen código DANE asignado');
    }
    
    // 6. Verificar duplicados por código DANE
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
    
    // 7. Verificar integridad de datos
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
    
    // 8. Listar todos los municipios de Bolívar
    const allBolivarResult = await client.query(`
      SELECT codigo_dane, nombre 
      FROM municipios 
      WHERE departamento = 'BOLÍVAR' 
      ORDER BY nombre ASC
    `);
    
    console.log('\n📋 Lista completa de municipios de Bolívar:');
    allBolivarResult.rows.forEach((m, i) => {
      console.log(`  ${String(i+1).padStart(2, '0')}. ${m.nombre} (${m.codigo_dane})`);
    });
    
    console.log('\n🎉 ¡VERIFICACIÓN COMPLETADA!');
    console.log('='.repeat(50));
    
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
  verifyMunicipios()
    .then(() => {
      console.log('\n✅ Verificación finalizada exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 ERROR EN VERIFICACIÓN:', error);
      process.exit(1);
    });
}

module.exports = { verifyMunicipios };