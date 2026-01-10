const axios = require('axios');

// Token from successful login
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXJfMTc2MzI3MTE1OTA5MV9pY2FhYTUiLCJlbWFpbCI6ImNyZXB1QGdtYWlsLmNvbSIsInJvbCI6Ik1BRFJJTkEiLCJpYXQiOjE3NjM0MjkyMTgsImV4cCI6MTc2MzUxNTYxOCwiYXVkIjoibWFkcmVzLWRpZ2l0YWxlcy11c2VycyIsImlzcyI6Im1hZHJlcy1kaWdpdGFsZXMifQ.5USMPjtwCN1ydj3eo9OI32apRfNepFfDnjo6vamSITM';

const API_BASE_URL = 'http://localhost:3000/api';

async function testDashboard() {
  try {
    console.log('🧪 Testing dashboard estadisticas...');
    
    // Test dashboard estadisticas
    const response = await axios.get(`${API_BASE_URL}/dashboard/estadisticas`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Dashboard estadisticas response:');
    console.log(JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error testing dashboard:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testDashboard();