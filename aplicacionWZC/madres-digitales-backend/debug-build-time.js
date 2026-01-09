#!/usr/bin/env node

/**
 * SCRIPT DE DIAGNÓSTICO PARA TIEMPO DE BUILD EN VERCEL
 * Ejecutar: node debug-build-time.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 INICIANDO DIAGNÓSTICO DE TIEMPO DE BUILD');
console.log('='.repeat(60));

function medirTiempo(label, comando) {
  console.log(`\n⏱️  Midiendo: ${label}`);
  const inicio = Date.now();
  
  try {
    execSync(comando, { stdio: 'inherit' });
    const duracion = Date.now() - inicio;
    console.log(`✅ ${label}: ${duracion}ms (${(duracion/1000).toFixed(2)}s)`);
    return duracion;
  } catch (error) {
    const duracion = Date.now() - inicio;
    console.log(`❌ ${label}: FALLÓ después de ${duracion}ms`);
    console.log('Error:', error.message);
    return duracion;
  }
}

function analizarArchivo(rutaArchivo) {
  try {
    const stats = fs.statSync(rutaArchivo);
    const contenido = fs.readFileSync(rutaArchivo, 'utf8');
    
    console.log(`\n📊 Análisis de ${rutaArchivo}:`);
    console.log(`   - Tamaño: ${(stats.size / 1024).toFixed(2)} KB`);
    console.log(`   - Líneas: ${contenido.split('\n').length}`);
    console.log(`   - Caracteres: ${contenido.length}`);
    
    // Contener líneas de código vs comentarios/vacíos
    const lineas = contenido.split('\n');
    const lineasCodigo = lineas.filter(linea => 
      linea.trim() !== '' && !linea.trim().startsWith('//')
    ).length;
    
    console.log(`   - Líneas de código: ${lineasCodigo}`);
    console.log(`   - Densidad de código: ${((lineasCodigo/lineas.length)*100).toFixed(1)}%`);
    
    return {
      tamaño: stats.size,
      lineas: lineas.length,
      lineasCodigo: lineasCodigo
    };
  } catch (error) {
    console.log(`❌ Error analizando ${rutaArchivo}: ${error.message}`);
    return null;
  }
}

// 1. Analizar archivos clave
console.log('\n📋 ANÁLISIS DE ARCHIVOS CLAVE');

const analisisIndex = analizarArchivo('./api/index.js');
const analisisPackage = analizarArchivo('./package.json');
const analisisSchema = analizarArchivo('./prisma/schema.prisma');

// 2. Medir tiempo de instalación de dependencias
console.log('\n📦 MEDICIÓN DE TIEMPO DE INSTALACIÓN');
const tiempoInstall = medirTiempo(
  'Instalación de dependencias (npm install)',
  'npm install --no-audit --no-fund'
);

// 3. Medir tiempo de generación de Prisma
console.log('\n🔧 MEDICIÓN DE TIEMPO DE PRISMA');
const tiempoPrisma = medirTiempo(
  'Generación de Prisma Client',
  'npx prisma generate --schema=prisma/schema.prisma'
);

// 4. Medir tiempo de build si existe
console.log('\n🏗️  MEDICIÓN DE TIEMPO DE BUILD');
const tiempoBuild = medirTiempo(
  'Build del proyecto',
  'npm run build'
);

// 5. Resumen y diagnóstico
console.log('\n' + '='.repeat(60));
console.log('📊 RESUMEN DE TIEMPOS');
console.log('='.repeat(60));

const tiempos = {
  'Instalación': tiempoInstall,
  'Prisma Generate': tiempoPrisma,
  'Build': tiempoBuild
};

let totalTiempo = 0;
Object.entries(tiempos).forEach(([paso, tiempo]) => {
  if (tiempo > 0) {
    console.log(`${paso.padEnd(20)}: ${tiempo.toString().padStart(8)}ms (${(tiempo/1000).toFixed(2)}s)`);
    totalTiempo += tiempo;
  }
});

console.log('-'.repeat(60));
console.log(`TOTAL${''.padEnd(14)}: ${totalTiempo.toString().padStart(8)}ms (${(totalTiempo/1000).toFixed(2)}s)`);

// 6. Diagnóstico y recomendaciones
console.log('\n🔍 DIAGNÓSTICO Y RECOMENDACIONES');
console.log('='.repeat(60));

if (analisisIndex && analisisIndex.tamaño > 100 * 1024) { // > 100KB
  console.log('⚠️  PROBLEMA DETECTADO: api/index.js es demasiado grande');
  console.log(`   - Tamaño actual: ${(analisisIndex.tamaño/1024).toFixed(2)} KB`);
  console.log('   - Recomendación: Dividir en módulos más pequeños');
}

if (analisisSchema && analisisSchema.lineas > 300) {
  console.log('⚠️  PROBLEMA DETECTADO: schema.prisma es muy complejo');
  console.log(`   - Líneas: ${analisisSchema.lineas}`);
  console.log('   - Recomendación: Optimizar relaciones y modelos');
}

if (tiempoPrisma > 30000) { // > 30 segundos
  console.log('⚠️  PROBLEMA DETECTADO: Generación de Prisma muy lenta');
  console.log(`   - Tiempo: ${(tiempoPrisma/1000).toFixed(2)}s`);
  console.log('   - Recomendación: Simplificar schema o usar cache');
}

if (totalTiempo > 1800000) { // > 30 minutos
  console.log('⚠️  PROBLEMA CRÍTICO: Tiempo total excede límites razonables');
  console.log(`   - Tiempo total: ${(totalTiempo/1000/60).toFixed(2)} minutos`);
  console.log('   - Riesgo alto de timeout en Vercel (45 min)');
}

console.log('\n✅ Diagnóstico completado');
console.log('📝 Guarda este output para referencia futura');