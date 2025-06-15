import { Kafka, Consumer, KafkaMessage } from 'kafkajs';
import { UserUpdatedEvent } from '../types';
import { PostService } from './postService';

export class KafkaService {
  private kafka: Kafka;
  private consumer: Consumer;
  private postService: PostService;

  constructor(postService: PostService) {    this.kafka = new Kafka({
      clientId: 'post-service',
      brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(',')
    });
    
    this.consumer = this.kafka.consumer({ groupId: 'post-service-group' });
    this.postService = postService;
  }

  async connect(): Promise<void> {
    try {
      await this.consumer.connect();
      await this.consumer.subscribe({ topic: 'user.updated' });
      
      await this.consumer.run({
        eachMessage: this.handleMessage.bind(this),
      });
      
      console.log('Kafka consumer connected and listening for user.updated events');
    } catch (error) {
      console.error('Error connecting to Kafka:', error);
    }
  }

  private async handleMessage({ message }: { message: KafkaMessage }): Promise<void> {
    try {
      if (!message.value) return;
      
      const event: UserUpdatedEvent = JSON.parse(message.value.toString());
      console.log('Received user.updated event:', event);
      
      await this.postService.updateUserReference(event.user_id, event.username);
    } catch (error) {
      console.error('Error processing user.updated event:', error);
    }
  }

  async disconnect(): Promise<void> {
    await this.consumer.disconnect();
  }
}
