const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

// First, let's get a valid token by logging in
async function loginAndTestGestante() {
  try {
    console.log('🔑 Attempting to login...');
    
    // Login request
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@madresdigitales.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful, token received');
    console.log('👤 User data:', loginResponse.data.user);
    
    // Test gestante creation with minimal required data
    console.log('\n👶 Testing gestante creation...');
    
    const gestanteData = {
      documento: '12345678',
      nombre: 'Test Gestante',
      tipoDocumento: 'cedula',
      fechaNacimiento: '1990-01-01',
      telefono: '3001234567',
      direccion: 'Calle Test 123',
      municipioId: 1,
      estadoCivil: 'soltera',
      escolaridad: 'secundaria',
      etnia: 'mestiza',
      religion: 'catolica',
      ocupacion: 'empleada',
      tipoVivienda: 'casa',
      servicioAgua: true,
      servicioElectrico: true,
      servicioGas: true,
      servicioInternet: true,
      eps: 'SURA',
      ipsAsignadaId: 1,
      tipoRegimen: 'contributivo',
      fechaUltimaMenstruacion: '2024-01-01',
      gestacionesPrevias: 1,
      partosPrevios: 1,
      cesareasPrevias: 0,
      abortosPrevios: 0,
      hijosVivos: 1,
      hijosMuertos: 0,
      planeado: true,
      acompaniante: 'pareja',
      activo: true
    };
    
    console.log('📤 Sending gestante data:', JSON.stringify(gestanteData, null, 2));
    
    const gestanteResponse = await axios.post(`${API_BASE_URL}/gestantes`, gestanteData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Gestante created successfully!');
    console.log('📋 Response:', gestanteResponse.data);
    
  } catch (error) {
    console.error('❌ Error occurred:');
    
    if (error.response) {
      console.error('❌ Response status:', error.response.status);
      console.error('❌ Response data:', error.response.data);
      console.error('❌ Response headers:', error.response.headers);
    } else if (error.request) {
      console.error('❌ No response received:', error.request);
    } else {
      console.error('❌ Error message:', error.message);
    }
    
    console.error('❌ Full error object:', error);
  }
}

// Run the test
loginAndTestGestante();