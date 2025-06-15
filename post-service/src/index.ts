import express from 'express';
import { json } from 'body-parser';
import cors from 'cors';
import postRoutes from './routes';
import { PostService } from './services/postService';
import { KafkaService } from './services/kafkaService';

const app = express();
const PORT = process.env.PORT || 3002;

// Initialize services
const postService = new PostService();
const kafkaService = new KafkaService(postService);

// Middleware
app.use(json());
app.use(cors());

// Routes
app.use(postRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).send('Post service is running');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down Post Service...');
  await kafkaService.disconnect();
  await postService.disconnect();
  process.exit(0);
});

app.listen(PORT, async () => {
  console.log(`Post service running on port ${PORT}`);
  
  // Connect to Kafka for event listening
  try {
    await kafkaService.connect();
  } catch (error) {
    console.error('Failed to connect to Kafka:', error);
  }
});
