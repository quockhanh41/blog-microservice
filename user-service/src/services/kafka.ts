import { Kafka, Producer } from 'kafkajs';
require('dotenv').config();

export class KafkaService {
  private producer: Producer;
  private isConnected: boolean = false;

  constructor(
    private clientId: string = process.env.KAFKA_CLIENT_ID || 'user-service'
  ) {
    // Automatically detect environment and use appropriate Kafka brokers
    let brokers: string[];
    let saslOptions = undefined;
    
    if (process.env.DOCKER_ENV) {
      // Running inside Docker
      brokers = (process.env.KAFKA_BROKERS || 'kafka:9092').split(',');
    } else {
      // Running locally outside Docker or using Confluent Cloud in production
      brokers = (process.env.CONFLUENT_BOOTSTRAP_SERVER || process.env.KAFKA_BROKERS || 'localhost:9092').split(',');
      
      // Configure SASL authentication for Confluent Cloud if API keys are available
      if (process.env.CONFLUENT_API_KEY && process.env.CONFLUENT_API_SECRET) {
        saslOptions = {
          mechanism: 'plain',
          username: process.env.CONFLUENT_API_KEY,
          password: process.env.CONFLUENT_API_SECRET
        };
      }
    }
    
    console.log('Kafka brokers:', brokers);
    console.log('Node environment:', process.env.NODE_ENV);
    console.log('Docker environment:', process.env.DOCKER_ENV);

    const kafkaConfig: any = {
      clientId: this.clientId,
      brokers: brokers,
      connectionTimeout: 10000, // 10 seconds
      requestTimeout: 30000, // 30 seconds
      retry: {
        initialRetryTime: 1000,
        retries: 3
      }
    };

    // Add SASL authentication if configured (for Confluent Cloud)
    if (saslOptions) {
      kafkaConfig.ssl = true;
      kafkaConfig.sasl = saslOptions;
    }

    const kafka = new Kafka(kafkaConfig);
    this.producer = kafka.producer();
  }

  async connect(): Promise<void> {
    if (this.isConnected) {
      return;
    }
    
    const maxRetries = 5;
    const retryDelay = 5000; // 5 seconds
    let retries = 0;
    
    while (retries < maxRetries) {
      try {
        console.log(`Attempting to connect to Kafka (attempt ${retries + 1}/${maxRetries})`);
        
        await this.producer.connect();
        this.isConnected = true;
        console.log('Kafka producer connected successfully');
        
        // Handle graceful shutdown
        process.on('SIGTERM', async () => {
          await this.disconnect();
          process.exit(0);
        });
        
        return; // Success, exit the retry loop
        
      } catch (error) {
        retries++;
        console.error(`Error connecting to Kafka (attempt ${retries}/${maxRetries}):`, error);
        
        if (retries >= maxRetries) {
          console.error('Max retries reached. Kafka connection failed.');
          throw new Error('Failed to connect to Kafka after multiple attempts');
        }
        
        console.log(`Retrying in ${retryDelay / 1000} seconds...`);
        await this.sleep(retryDelay);
      }
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.producer.disconnect();
      this.isConnected = false;
      console.log('Kafka producer disconnected');
    }
  }

  async sendUserUpdatedEvent(payload: {
    id: string;
    username: string;
    eventType: 'user.created' | 'user.updated';
  }): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Kafka producer not connected');
    }
    
    try {
      await this.producer.send({
        topic: 'user-events',
        messages: [
          {
            key: payload.id,
            value: JSON.stringify({
              id: payload.id,
              username: payload.username,
              eventType: payload.eventType,
              timestamp: new Date().toISOString()
            })
          }
        ]
      });
      
      console.log(`Event ${payload.eventType} sent for user ${payload.id}`);
    } catch (error) {
      console.error('Error sending Kafka event:', error);
      throw error;
    }
  }

  // Method to check if Kafka is available
  async isKafkaAvailable(): Promise<boolean> {
    try {
      const admin = new Kafka({
        clientId: this.clientId,
        brokers: (process.env.CONFLUENT_BOOTSTRAP_SERVER || process.env.KAFKA_BROKERS || 'localhost:9092').split(',')
      }).admin();
      
      await admin.connect();
      await admin.listTopics();
      await admin.disconnect();
      return true;
    } catch (error) {
      console.error('Kafka availability check failed:', error);
      return false;
    }
  }
}

// Singleton instance
const kafkaService = new KafkaService();

// Initialize Kafka producer
export const setupKafkaProducer = async (): Promise<void> => {
  await kafkaService.connect();
};

// Send user.updated event
export const sendUserUpdatedEvent = async (payload: {
  id: string;
  username: string;
  eventType: 'user.created' | 'user.updated';
}): Promise<void> => {
  await kafkaService.sendUserUpdatedEvent(payload);
};
