const express = require('express');
const gateway = require('express-gateway');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

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

// Enable CORS for health check endpoint
healthApp.use(cors({
  origin: ['http://localhost:6060', 'http://localhost:3000'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id']
}));

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

// Create main Express app for API Gateway with CORS support
const app = express();
const GATEWAY_PORT = 8080;

// Configure CORS for the main gateway
app.use(cors({
  origin: ['http://localhost:6060', 'http://localhost:3000'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// Add logging if morgan is available
if (morgan) {
  app.use(morgan('combined'));
}

// Proxy middleware for each service
app.use('/users', createProxyMiddleware({
  target: 'http://localhost:3001',
  changeOrigin: true,
  pathRewrite: {
    '^/users': '', // Remove /users prefix when forwarding
  },
}));

app.use('/posts', createProxyMiddleware({
  target: 'http://localhost:3002',
  changeOrigin: true,
  pathRewrite: {
    '^/posts': '', // Remove /posts prefix when forwarding
  },
}));

app.use('/feed', createProxyMiddleware({
  target: 'http://localhost:3003',
  changeOrigin: true,
  pathRewrite: {
    '^/feed': '', // Remove /feed prefix when forwarding
  },
}));

// Start the main gateway server
app.listen(GATEWAY_PORT, () => {
  console.log(`API Gateway server started on port ${GATEWAY_PORT}`);
});
