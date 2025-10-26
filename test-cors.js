const axios = require('axios');

// Configuración de prueba
const BACKEND_URL = 'https://madres-digitales-backend.vercel.app';
const FRONTEND_ORIGIN = 'https://madres-digitales-frontend.vercel.app';

async function testCORS() {
  console.log('🧪 Iniciando pruebas CORS...');
  console.log(`🌐 Backend URL: ${BACKEND_URL}`);
  console.log(`🔗 Frontend Origin: ${FRONTEND_ORIGIN}`);
  console.log('');

  try {
    // Test 1: Petición OPTIONS (preflight)
    console.log('📋 Test 1: Petición OPTIONS (preflight)');
    const optionsResponse = await axios.options(`${BACKEND_URL}/api/dashboard/estadisticas`, {
      headers: {
        'Origin': FRONTEND_ORIGIN,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      }
    });
    
    console.log('✅ OPTIONS Response Status:', optionsResponse.status);
    console.log('✅ CORS Headers:', {
      'Access-Control-Allow-Origin': optionsResponse.headers['access-control-allow-origin'],
      'Access-Control-Allow-Methods': optionsResponse.headers['access-control-allow-methods'],
      'Access-Control-Allow-Headers': optionsResponse.headers['access-control-allow-headers']
    });
    console.log('');

    // Test 2: Petición GET real
    console.log('📋 Test 2: Petición GET real');
    const getResponse = await axios.get(`${BACKEND_URL}/api/dashboard/estadisticas`, {
      headers: {
        'Origin': FRONTEND_ORIGIN,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ GET Response Status:', getResponse.status);
    console.log('✅ CORS Headers:', {
      'Access-Control-Allow-Origin': getResponse.headers['access-control-allow-origin']
    });
    console.log('✅ Response Data:', getResponse.data);
    console.log('');

    // Test 3: Petición POST (login)
    console.log('📋 Test 3: Petición POST (login)');
    const postResponse = await axios.post(`${BACKEND_URL}/api/auth/login`, 
      {
        email: 'test@example.com',
        password: 'test123'
      },
      {
        headers: {
          'Origin': FRONTEND_ORIGIN,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ POST Response Status:', postResponse.status);
    console.log('✅ CORS Headers:', {
      'Access-Control-Allow-Origin': postResponse.headers['access-control-allow-origin']
    });
    console.log('✅ Response Data:', postResponse.data);
    console.log('');

    console.log('🎉 Todas las pruebas CORS pasaron exitosamente');

  } catch (error) {
    console.error('❌ Error en las pruebas CORS:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      console.error('Request Error:', error.message);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Ejecutar pruebas
testCORS();