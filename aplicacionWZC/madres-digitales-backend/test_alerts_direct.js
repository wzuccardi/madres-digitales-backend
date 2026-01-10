const axios = require('axios');

async function testAlertsAPI() {
  try {
    console.log('🧪 Testing alerts API...');
    // First, login to get token
    console.log('🔑 Logging in...');
    const loginResponse = await axios.post('http://localhost:54112/api/auth/login', {
      email: 'crepu@gmail.com',
      password: 'madrina123'
    });
    
    const token = loginResponse.data.data.accessToken;
    console.log('✅ Login successful, token received');
    
    // Test alerts endpoint
    console.log('📡 Fetching alerts...');
    const alertsResponse = await axios.get('http://localhost:54112/api/alertas', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
    console.log('📊 Response status:', alertsResponse.status);
    console.log('📊 Response headers:', alertsResponse.headers);
    console.log('📊 Response data:', JSON.stringify(alertsResponse.data, null, 2));
    
    // Check if we have alerts
    const alerts = alertsResponse.data.data?.alertas || alertsResponse.data.data || alertsResponse.data;
    console.log('🚨 Number of alerts found:', Array.isArray(alerts) ? alerts.length : 'Not an array');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.status, error.response?.data || error.message);
  }
}

testAlertsAPI();