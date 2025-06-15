import express from 'express';
import { json } from 'body-parser';
import cors from 'cors';
import feedRoutes from './routes';

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(json());
app.use(cors());

// Routes
app.use(feedRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).send('Feed service is running');
});

app.listen(PORT, () => {
  console.log(`Feed service running on port ${PORT}`);
});
