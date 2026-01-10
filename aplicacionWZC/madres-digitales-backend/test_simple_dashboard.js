/**
 * Script simple para probar el dashboard
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

async function testLogin() {
  console.log('🧪 Probando login...\n');
  
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email: 'wzuccardi@gmail.com',
      password: '73102604722'
    });
    
    console.log('✅ Respuesta de login:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success && response.data.data.token) {
      console.log('\n🔐 Probando dashboard con token...\n');
      
      const dashboardResponse = await axios.get(`${API_BASE}/dashboard/estadisticas`, {
        headers: {
          'Authorization': `Bearer ${response.data.data.token}`
        }
      });
      
      console.log('📊 Respuesta del dashboard:', JSON.stringify(dashboardResponse.data, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testLogin().catch(console.error);