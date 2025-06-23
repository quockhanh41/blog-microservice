import { Kafka, Consumer, KafkaMessage } from 'kafkajs';
import { UserUpdatedEvent } from '../types';
import { PostService } from './postService';
require('dotenv').config();

export class KafkaService {
  private kafka: Kafka;
  private consumer: Consumer;
  private postService: PostService;
  private maxRetries: number = 5;
  private retryDelay: number = 5000; // 5 seconds
  constructor(postService: PostService) {
    // Automatically detect environment and use appropriate Kafka brokers
    let brokers: string;
    let saslOptions = undefined;
    
    if (process.env.DOCKER_ENV) {
      // Running inside Docker
      brokers = process.env.KAFKA_BROKERS || 'kafka:9092';
    } else {
      // Running locally outside Docker or using Confluent Cloud in production
      brokers = process.env.CONFLUENT_BOOTSTRAP_SERVER || process.env.KAFKA_BROKERS || 'localhost:9092';
      
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
      clientId: process.env.KAFKA_CLIENT_ID || 'post-service',
      brokers: brokers.split(','),
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

    this.kafka = new Kafka(kafkaConfig);
    
    this.consumer = this.kafka.consumer({ 
      groupId: process.env.KAFKA_GROUP_ID || 'post-service-group',
      sessionTimeout: 30000,
      heartbeatInterval: 3000
    });
    this.postService = postService;
  }async connect(): Promise<void> {
    let retries = 0;
    
    while (retries < this.maxRetries) {
      try {
        console.log(`Attempting to connect to Kafka (attempt ${retries + 1}/${this.maxRetries})`);
        
        await this.consumer.connect();
        console.log('Kafka consumer connected successfully');
        
        await this.consumer.subscribe({ topic: 'user-events' });
        console.log('Subscribed to user-events topic');
        
        await this.consumer.run({
          eachMessage: this.handleMessage.bind(this),
        });
        
        console.log('Kafka consumer is now listening for user-events');
        return; // Success, exit the retry loop
        
      } catch (error) {
        retries++;
        console.error(`Error connecting to Kafka (attempt ${retries}/${this.maxRetries}):`, error);
        
        if (retries >= this.maxRetries) {
          console.error('Max retries reached. Kafka connection failed.');
          // Don't throw error to prevent app crash, just log it
          return;
        }
        
        console.log(`Retrying in ${this.retryDelay / 1000} seconds...`);
        await this.sleep(this.retryDelay);
      }
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  private async handleMessage({ message }: { message: KafkaMessage }): Promise<void> {
    try {
      if (!message.value) return;
      
      const event: UserUpdatedEvent = JSON.parse(message.value.toString());
      console.log('Received user event:', event);
      
      // Only process user.updated events
      if (event.eventType === 'user.updated') {
        await this.postService.updateUserReference(event.id, event.username);
      }
    } catch (error) {
      console.error('Error processing user event:', error);
    }
  }
  async disconnect(): Promise<void> {
    try {
      await this.consumer.disconnect();
      console.log('Kafka consumer disconnected');
    } catch (error) {
      console.error('Error disconnecting Kafka consumer:', error);
    }
  }

  // Method to check if Kafka is available
  async isKafkaAvailable(): Promise<boolean> {
    try {
      const admin = this.kafka.admin();
      await admin.connect();
      await admin.listTopics();
      await admin.disconnect();
      return true;
    } catch (error) {
      return false;
    }
  }
}
