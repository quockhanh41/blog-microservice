import { Kafka, Producer } from 'kafkajs';

export class KafkaService {
  private producer: Producer;
  private isConnected: boolean = false;

  constructor(
    private clientId: string = 'user-service',
    private brokers: string[] = (process.env.KAFKA_BROKERS || 'localhost:9092').split(',')
  ) {
    const kafka = new Kafka({
      clientId: this.clientId,
      brokers: this.brokers,
    });
    this.producer = kafka.producer();
  }

  async connect(): Promise<void> {
    if (!this.isConnected) {
      await this.producer.connect();
      this.isConnected = true;
      console.log('Kafka producer connected');
      
      // Handle graceful shutdown
      process.on('SIGTERM', async () => {
        await this.disconnect();
        process.exit(0);
      });
    }
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
