/**
 * Script para probar el dashboard con una madrina
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

async function testMadrinaDashboard() {
  console.log('🧪 Probando dashboard con madrina...\n');
  
  try {
    // Login con madrina Crepu
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email: 'crepu@gmail.com',
      password: 'madrina123'
    });
    
    console.log('✅ Respuesta de login:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success && response.data.data.token) {
      console.log('\n🔐 Probando dashboard con token de madrina...\n');
      
      const dashboardResponse = await axios.get(`${API_BASE}/dashboard/estadisticas`, {
        headers: {
          'Authorization': `Bearer ${response.data.data.token}`
        }
      });
      
      console.log('📊 Respuesta del dashboard para madrina:', JSON.stringify(dashboardResponse.data, null, 2));
      
      // También probar endpoint de gestantes
      console.log('\n👥 Probando endpoint de gestantes...\n');
      
      const gestantesResponse = await axios.get(`${API_BASE}/gestantes`, {
        headers: {
          'Authorization': `Bearer ${response.data.data.token}`
        }
      });
      
      console.log('📊 Respuesta completa de gestantes:', JSON.stringify(gestantesResponse.data, null, 2));
      
      const gestantes = Array.isArray(gestantesResponse.data) ? gestantesResponse.data : gestantesResponse.data.data || [];
      console.log(`📊 Gestantes visibles para madrina: ${gestantes.length}`);
      
      if (gestantes.length > 0) {
        console.log('   Primeras 3 gestantes:');
        gestantes.slice(0, 3).forEach((g, i) => {
          console.log(`   ${i+1}. ${g.nombre} (madrina_id: ${g.madrina_id})`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testMadrinaDashboard().catch(console.error);