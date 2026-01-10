const jwt = require('jsonwebtoken');

// Token from the test output
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXJfMTc2MzI3MTE1OTA5MV9pY2FhYTUiLCJlbWFpbCI6ImNyZXB1QGdtYWlsLmNvbSIsInJvbCI6Ik1BRFJJTkEiLCJpYXQiOjE3NjM0MjkyMTgsImV4cCI6MTc2MzUxNTYxOCwiYXVkIjoibWFkcmVzLWRpZ2l0YWxlcy11c2VycyIsImlzcyI6Im1hZHJlcy1kaWdpdGFsZXMifQ.5USMPjtwCN1ydj3eo9OI32apRfNepFfDnjo6vamSITM';

console.log('🔍 Decoding token...');

// Decode without verification first to see the payload
try {
  const decoded = jwt.decode(token);
  console.log('📄 Decoded payload:', JSON.stringify(decoded, null, 2));
} catch (error) {
  console.log('❌ Error decoding:', error.message);
}

// Try to verify with different secrets and configurations
const secrets = [
  'dev-secret',
  'your-secret-key',
  process.env.JWT_SECRET,
  process.env.JWT_ACCESS_TOKEN_SECRET
];

const configs = [
  { issuer: 'madres-digitales', audience: 'madres-digitales-users' },
  { issuer: 'madres-digitales' },
  { audience: 'madres-digitales-users' },
  {}
];

console.log('\n🔍 Testing verification with different configurations...');

for (const secret of secrets) {
  if (!secret) continue;
  
  for (const config of configs) {
    try {
      const verified = jwt.verify(token, secret, config);
      console.log(`✅ SUCCESS with secret: "${secret}" and config:`, config);
      console.log('Verified payload:', JSON.stringify(verified, null, 2));
      return;
    } catch (error) {
      console.log(`❌ Failed with secret: "${secret}" and config:`, config, '- Error:', error.message);
    }
  }
}