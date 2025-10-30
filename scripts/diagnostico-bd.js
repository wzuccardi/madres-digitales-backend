#!/usr/bin/env node

/**
 * Script de diagnóstico de la base de datos
 * Verifica el estado de las tablas principales
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('\n🔍 DIAGNÓSTICO DE BASE DE DATOS\n');
  console.log('=' .repeat(50));

  try {
    // Verificar conexión
    console.log('\n📡 Verificando conexión a la base de datos...');
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Conexión exitosa\n');

    // Contar registros en cada tabla
    const tablas = [
      { nombre: 'usuarios', modelo: 'usuarios' },
      { nombre: 'municipios', modelo: 'municipios' },
      { nombre: 'ips', modelo: 'ips' },
      { nombre: 'medicos', modelo: 'medicos' },
      { nombre: 'gestantes', modelo: 'gestantes' },
      { nombre: 'alertas', modelo: 'alertas' },
      { nombre: 'control_prenatal', modelo: 'controlPrenatal' },
      { nombre: 'contenidos', modelo: 'contenidos' },
    ];

    console.log('📊 ESTADO DE LAS TABLAS:\n');
    console.log('Tabla                  | Registros | Estado');
    console.log('-'.repeat(50));

    for (const tabla of tablas) {
      try {
        const count = await prisma[tabla.modelo].count();
        const estado = count === 0 ? '❌ VACÍA' : `✅ ${count} registros`;
        console.log(`${tabla.nombre.padEnd(22)} | ${String(count).padEnd(9)} | ${estado}`);
      } catch (error) {
        console.log(`${tabla.nombre.padEnd(22)} | ERROR    | ⚠️  No existe o error`);
      }
    }

    console.log('\n' + '='.repeat(50));

    // Verificar si hay datos de prueba
    const gestantes = await prisma.gestantes.count();
    const medicos = await prisma.medicos.count();
    const alertas = await prisma.alertas.count();

    console.log('\n📋 RESUMEN:\n');
    if (gestantes === 0 && medicos === 0 && alertas === 0) {
      console.log('⚠️  BASE DE DATOS VACÍA - Necesita seed de datos');
      console.log('\nPara poblar la BD, ejecuta:');
      console.log('  npx ts-node prisma/seed-simple.ts');
      console.log('  o');
      console.log('  npx ts-node prisma/seed-completo.ts');
    } else {
      console.log('✅ Base de datos contiene datos');
      console.log(`   - Gestantes: ${gestantes}`);
      console.log(`   - Médicos: ${medicos}`);
      console.log(`   - Alertas: ${alertas}`);
    }

    console.log('\n' + '='.repeat(50) + '\n');

  } catch (error) {
    console.error('❌ Error al conectar a la base de datos:');
    console.error(error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

