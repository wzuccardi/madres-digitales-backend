const axios = require('axios');

// Token from successful login
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXJfMTc2MzI3MTE1OTA5MV9pY2FhYTUiLCJlbWFpbCI6ImNyZXB1QGdtYWlsLmNvbSIsInJvbCI6Ik1BRFJJTkEiLCJpYXQiOjE3NjM0MjkyMTgsImV4cCI6MTc2MzUxNTYxOCwiYXVkIjoibWFkcmVzLWRpZ2l0YWxlcy11c2VycyIsImlzcyI6Im1hZHJlcy1kaWdpdGFsZXMifQ.5USMPjtwCN1ydj3eo9OI32apRfNepFfDnjo6vamSITM';

const API_BASE_URL = 'http://localhost:3000/api';

async function testBothEndpoints() {
  try {
    console.log('🧪 Testing both dashboard and gestantes endpoints...');
    
    // Test dashboard estadisticas
    console.log('\n📊 Testing dashboard estadisticas...');
    const dashboardResponse = await axios.get(`${API_BASE_URL}/dashboard/estadisticas`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Dashboard totalGestantes:', dashboardResponse.data.data.totalGestantes);
    
    // Test gestantes list
    console.log('\n👥 Testing gestantes list...');
    const gestantesResponse = await axios.get(`${API_BASE_URL}/gestantes`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Gestantes count:', gestantesResponse.data.data.length);
    console.log('First gestante:', gestantesResponse.data.data[0]);
    
    // Decode token to see user info
    const jwt = require('jsonwebtoken');
    const decoded = jwt.decode(token);
    console.log('\n👤 Token user info:');
    console.log('User ID:', decoded.id);
    console.log('User role:', decoded.rol);
    console.log('User email:', decoded.email);
    
  } catch (error) {
    console.error('❌ Error testing endpoints:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testBothEndpoints();