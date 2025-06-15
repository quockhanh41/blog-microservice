const express = require('express');
const gateway = require('express-gateway');

// Try to load morgan, but continue if not available
let morgan;
try {
  morgan = require('morgan');
} catch (error) {
  console.warn('Morgan logger not available, continuing without request logging');
}

// Create a separate Express app for health check
const healthApp = express();
const HEALTH_PORT = 8081;

// Configure health check app
if (morgan) {
  healthApp.use(morgan('combined'));
}

// Health check endpoint
healthApp.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    service: 'api-gateway',
    timestamp: new Date().toISOString()
  });
});

// Start the health check server
healthApp.listen(HEALTH_PORT, () => {
  console.log(`Health check server started on port ${HEALTH_PORT}`);
});

// Start the gateway (this will start the Express Gateway based on your config)
const gatewayApp = gateway();
console.log('API Gateway server started successfully');
