// Health check endpoint for Vercel
module.exports = (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    message: 'Madres Digitales API - Health Check'
  });
};