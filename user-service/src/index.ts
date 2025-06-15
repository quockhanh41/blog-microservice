import express from 'express';
import { json } from 'body-parser';
import cors from 'cors';
import userRoutes from './routes';
import { setupKafkaProducer } from './services/kafka';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(json());
app.use(cors());

// Routes
app.use(userRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).send('User service is running');
});

// Initialize Kafka producer
setupKafkaProducer().catch(error => {
  console.error('Failed to set up Kafka producer:', error);
  process.exit(1);
});

app.listen(PORT, () => {
  console.log(`User service running on port ${PORT}`);
});
