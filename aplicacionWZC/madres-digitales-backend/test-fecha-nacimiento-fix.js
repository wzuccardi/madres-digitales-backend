#!/usr/bin/env node

/**
 * Script para probar la corrección del problema de fecha_nacimiento vs fechaNacimiento
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000'; // Ajustar según tu configuración

async function testFechaNacimientoFix() {
  console.log('🧪 INICIANDO PRUEBA DE CORRECCIÓN fecha_nacimiento\n');

  // Test case 1: Enviando fechaNacimiento (camelCase - formato del frontend)
  console.log('📋 TEST 1: Enviando fechaNacimiento (camelCase)...');
  try {
    const testData1 = {
      nombre: 'Test Gestante 1',
      documento: '1234567890',
      tipo_documento: 'cedula',
      fechaNacimiento: '1995-05-15', // camelCase
      telefono: '3001234567',
      direccion: 'Calle Test 123',
      regimen_salud: 'subsidiado',
      municipio_id: '13052'
    };

    const response1 = await axios.post(`${BASE_URL}/api/gestantes`, testData1);
    console.log('✅ TEST 1 EXITOSO: Respuesta:', response1.status);
    console.log('   ID creado:', response1.data.gestante?.id);
  } catch (error) {
    console.log('❌ TEST 1 FALLÓ:', error.response?.data?.error || error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test case 2: Enviando fecha_nacimiento (snake_case - formato esperado)
  console.log('📋 TEST 2: Enviando fecha_nacimiento (snake_case)...');
  try {
    const testData2 = {
      nombre: 'Test Gestante 2',
      documento: '0987654321',
      tipo_documento: 'cedula',
      fecha_nacimiento: '1992-08-22', // snake_case
      telefono: '3009876543',
      direccion: 'Calle Test 456',
      regimen_salud: 'subsidiado',
      municipio_id: '13052'
    };

    const response2 = await axios.post(`${BASE_URL}/api/gestantes`, testData2);
    console.log('✅ TEST 2 EXITOSO: Respuesta:', response2.status);
    console.log('   ID creado:', response2.data.gestante?.id);
  } catch (error) {
    console.log('❌ TEST 2 FALLÓ:', error.response?.data?.error || error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test case 3: Enviando sin fecha (debe fallar)
  console.log('📋 TEST 3: Enviando sin fecha (debe fallar)...');
  try {
    const testData3 = {
      nombre: 'Test Gestante 3',
      documento: '5678901234',
      tipo_documento: 'cedula',
      // Sin fecha_nacimiento ni fechaNacimiento
      telefono: '3005678901',
      direccion: 'Calle Test 789',
      regimen_salud: 'subsidiado',
      municipio_id: '13052'
    };

    const response3 = await axios.post(`${BASE_URL}/api/gestantes`, testData3);
    console.log('❌ TEST 3 FALLÓ: Debería haber rechazado la solicitud sin fecha');
  } catch (error) {
    console.log('✅ TEST 3 EXITOSO: Rechazó correctamente -', error.response?.data?.error || error.message);
  }

  console.log('\n🎯 PRUEBAS COMPLETADAS');
  console.log('\n💡 RESULTADOS ESPERADOS:');
  console.log('- TEST 1: Debería funcionar con fechaNacimiento (camelCase)');
  console.log('- TEST 2: Debería funcionar con fecha_nacimiento (snake_case)');
  console.log('- TEST 3: Debería fallar sin fecha');
}

// Ejecutar prueba
testFechaNacimientoFix()
  .then(() => {
    console.log('\n✅ Prueba de corrección completada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error en prueba de corrección:', error);
    process.exit(1);
  });