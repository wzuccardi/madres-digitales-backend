// Test file to verify the structure works
console.log('Testing structure...');
console.log('Current directory:', __dirname);
console.log('Files in current directory:', require('fs').readdirSync(__dirname));

try {
  const app = require('./api/index.js');
  console.log('✅ API proxy loaded successfully');
  console.log('App type:', typeof app);
} catch (error) {
  console.log('❌ Error loading API proxy:', error.message);
}

try {
  const realApp = require('./aplicacionWZC/madres-digitales-backend/api/index.js');
  console.log('✅ Real API loaded successfully');
  console.log('Real app type:', typeof realApp);
} catch (error) {
  console.log('❌ Error loading real API:', error.message);
}