import express from 'express';
import { json } from 'body-parser';
import cors from 'cors';
import userRoutes from './routes';
import { setupKafkaProducer } from './services/kafka';
import { ConsulServiceRegistry } from './services/consulService';

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Consul service registry
const consulHost = process.env.CONSUL_HOST || 'localhost';
const consulPort = parseInt(process.env.CONSUL_PORT || '8500');
const serviceName = 'user-service';
const serviceAddress = process.env.SERVICE_ADDRESS || 'user-service';
const servicePort = parseInt(process.env.PORT || '3001');

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
app.use(userRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'user-service',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down User Service...');
  await consulRegistry.deregister();
  process.exit(0);
});

// Initialize Kafka producer
setupKafkaProducer().catch(error => {
  console.error('Failed to set up Kafka producer:', error);
  process.exit(1);
});

app.listen(PORT, async () => {
  console.log(`🚀 User service running on port ${PORT}`);
  
  // Register with Consul
  try {
    await consulRegistry.register();
  } catch (error) {
    console.error('Failed to register with Consul:', error);
    console.log('User service will continue running without Consul registration');
  }
});
