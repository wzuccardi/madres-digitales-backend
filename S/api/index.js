// Proxy file for Vercel deployment
// This file redirects all requests to the actual API in the subdirectory

const path = require('path');

// Import the actual API from the subdirectory
const app = require('../aplicacionWZC/madres-digitales-backend/api/index.js');

// Export for Vercel
module.exports = app;