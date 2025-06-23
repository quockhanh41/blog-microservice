import express from 'express';
import { json } from 'body-parser';
import cors from 'cors';
import os from 'os';
import postRoutes from './routes';
import { PostService } from './services/postService';
import { KafkaService } from './services/kafkaService';
import { ConsulServiceRegistry } from './services/consulService';
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;
const hostname = os.hostname();

// Initialize services
const postService = new PostService();
const kafkaService = new KafkaService(postService);

// Initialize Consul service registry
const consulHost = process.env.CONSUL_HOST || 'localhost';
const consulPort = parseInt(process.env.CONSUL_PORT || '8500');
const serviceName = 'post-service';
const serviceAddress = process.env.SERVICE_ADDRESS || 'post-service';
const servicePort = parseInt(process.env.PORT || '3002');

const consulRegistry = new ConsulServiceRegistry(
  consulHost,
  consulPort,
  serviceName,
  serviceAddress,
  servicePort,
  hostname // Pass hostname to ConsulServiceRegistry
);

// Middleware
app.use(json());
app.use(cors());

// Routes
app.use(postRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'post-service',
    hostname: hostname,
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down Post Service...');
  await consulRegistry.deregister();
  await kafkaService.disconnect();
  await postService.disconnect();
  process.exit(0);
});

app.listen(PORT, async () => {
  console.log(`🚀 Post service running on port ${PORT}`);
  
  // Register with Consul
  try {
    await consulRegistry.register();
  } catch (error) {
    console.error('Failed to register with Consul:', error);
    console.log('Post service will continue running without Consul registration');
  }
  
  // Connect to Kafka for event listening (non-blocking)
  // This will retry in the background if Kafka is not available
  kafkaService.connect().catch(error => {
    console.error('Failed to connect to Kafka:', error);
    console.log('Post service will continue running without Kafka consumer');
  });
});
