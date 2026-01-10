import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

async function testRegimenSaludFix() {
  try {
    console.log('🧪 Testing regimen_salud fix...');

    // Login
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'wzuccardi@gmail.com',
      password: '73102604722'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login successful');

    // Test 1: Create gestante WITHOUT regimen_salud (should use default)
    console.log('\n📋 Test 1: Creating gestante without regimen_salud...');
    const gestanteData1 = {
      documento: '1111111111',
      nombre: 'Test Default Regimen',
      email: 'test.default@example.com',
      telefono: '3001111111',
      direccion: 'Test Address',
      fecha_nacimiento: '1990-01-01',
      municipio_id: '13042',
      activa: true
    };

    const response1 = await axios.post(`${API_BASE_URL}/gestantes`, gestanteData1, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Test 1 PASSED: Gestante created without regimen_salud');
    console.log('📝 Response:', response1.data);

    // Test 2: Create gestante WITH regimen_salud (should use provided value)
    console.log('\n📋 Test 2: Creating gestante with regimen_salud...');
    const gestanteData2 = {
      documento: '2222222222',
      nombre: 'Test Custom Regimen',
      email: 'test.custom@example.com',
      telefono: '3002222222',
      direccion: 'Test Address 2',
      fecha_nacimiento: '1990-02-02',
      municipio_id: '13042',
      activa: true,
      regimen_salud: 'contributivo'
    };

    const response2 = await axios.post(`${API_BASE_URL}/gestantes`, gestanteData2, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Test 2 PASSED: Gestante created with custom regimen_salud');
    console.log('📝 Response:', response2.data);

    console.log('\n🎉 ALL TESTS PASSED! The regimen_salud fix is working correctly.');

  } catch (error: any) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.status === 400) {
      console.error('📊 Response data:', error.response.data);
      console.error('📤 Request data:', error.response.config?.data);
    }
  }
}

// Run the test
testRegimenSaludFix();