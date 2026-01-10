const axios = require('axios');

async function testGestantesAPI() {
  try {
    console.log('🧪 Testing gestantes API for crepu@gmail.com...');
    
    // Login
    console.log('🔑 Logging in...');
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'crepu@gmail.com',
      password: 'madrina123'
    });
    
    console.log('✅ Login response:', JSON.stringify(loginResponse.data, null, 2));
    
    // Buscar el token en la respuesta
    const token = loginResponse.data.token || 
                  loginResponse.data.accessToken || 
                  loginResponse.data.data?.accessToken || 
                  loginResponse.data.data?.token;
    
    console.log('✅ Login successful, token received:', token ? 'YES' : 'NO');
    if (token) {
      console.log('✅ Token preview:', token.substring(0, 50) + '...');
    }
    
    // Test gestantes endpoint
    console.log('📋 Testing /api/gestantes endpoint...');
    const gestantesResponse = await axios.get('http://localhost:3000/api/gestantes?page=1&limit=50', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Cache-Control': 'no-cache'
      }
    });
    
    console.log('✅ Gestantes API response:');
    console.log(`   - Success: ${gestantesResponse.data.success}`);
    console.log(`   - Total gestantes: ${gestantesResponse.data.meta?.total || 0}`);
    console.log(`   - Data length: ${gestantesResponse.data.data?.length || 0}`);
    
    if (gestantesResponse.data.data && gestantesResponse.data.data.length > 0) {
      console.log('\n📋 Gestantes found:');
      gestantesResponse.data.data.forEach((gestante, index) => {
        console.log(`   ${index + 1}. ${gestante.nombre} (${gestante.documento}) - ID: ${gestante.id}`);
        console.log(`      - Madrina ID: ${gestante.madrina_id}`);
        console.log(`      - Activa: ${gestante.activa}`);
      });
    } else {
      console.log('\n⚠️  No gestantes found in the response');
    }
    
    // Test dashboard endpoint
    console.log('\n📊 Testing /api/dashboard/estadisticas endpoint...');
    const dashboardResponse = await axios.get('http://localhost:3000/api/dashboard/estadisticas', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Cache-Control': 'no-cache'
      }
    });
    
    console.log('✅ Dashboard API response:');
    console.log(`   - Total gestantes: ${dashboardResponse.data.total_gestantes || 0}`);
    console.log(`   - Alertas activas: ${dashboardResponse.data.alertas_activas || 0}`);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    console.error('❌ Error details:', error.response?.status, error.response?.statusText);
    console.error('❌ Full error:', error);
  }
}

testGestantesAPI();