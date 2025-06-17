import express from 'express';
import { json } from 'body-parser';
import cors from 'cors';
import feedRoutes from './routes';
import { ConsulServiceRegistry } from './services/consulService';

const app = express();
const PORT = process.env.PORT || 3003;

// Initialize Consul service registry
const consulHost = process.env.CONSUL_HOST || 'localhost';
const consulPort = parseInt(process.env.CONSUL_PORT || '8500');
const serviceName = 'feed-service';
const serviceAddress = process.env.SERVICE_ADDRESS || 'feed-service';
const servicePort = parseInt(process.env.PORT || '3003');

const consulRegistry = new ConsulServiceRegistry(
  consulHost,
  consulPort,
  serviceName,
  serviceAddress,
  servicePort
);

// Middleware
app.use(json());
app.use(cors());

// Routes
app.use(feedRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'feed-service',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down Feed Service...');
  await consulRegistry.deregister();
  process.exit(0);
});

app.listen(PORT, async () => {
  console.log(`🚀 Feed service running on port ${PORT}`);
  
  // Register with Consul
  try {
    await consulRegistry.register();
  } catch (error) {
    console.error('Failed to register with Consul:', error);
    console.log('Feed service will continue running without Consul registration');
  }
});
