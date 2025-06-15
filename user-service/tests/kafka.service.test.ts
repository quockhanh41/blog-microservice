import { KafkaService } from '../src/services/kafka';

// Mock kafkajs
const mockProducer = {
  connect: jest.fn(),
  disconnect: jest.fn(),
  send: jest.fn(),
};

const mockKafka = {
  producer: jest.fn(() => mockProducer),
};

jest.mock('kafkajs', () => ({
  Kafka: jest.fn(() => mockKafka),
}));

describe('KafkaService', () => {
  let kafkaService: KafkaService;

  beforeEach(() => {
    kafkaService = new KafkaService();
    jest.clearAllMocks();
  });

  describe('connect', () => {
    it('should connect to Kafka successfully', async () => {
      mockProducer.connect.mockResolvedValue(undefined);

      await kafkaService.connect();

      expect(mockProducer.connect).toHaveBeenCalledTimes(1);
    });

    it('should not connect twice', async () => {
      mockProducer.connect.mockResolvedValue(undefined);

      await kafkaService.connect();
      await kafkaService.connect();

      expect(mockProducer.connect).toHaveBeenCalledTimes(1);
    });
  });

  describe('disconnect', () => {
    it('should disconnect from Kafka successfully', async () => {
      mockProducer.connect.mockResolvedValue(undefined);
      mockProducer.disconnect.mockResolvedValue(undefined);

      await kafkaService.connect();
      await kafkaService.disconnect();

      expect(mockProducer.disconnect).toHaveBeenCalledTimes(1);
    });

    it('should not disconnect if not connected', async () => {
      mockProducer.disconnect.mockResolvedValue(undefined);

      await kafkaService.disconnect();

      expect(mockProducer.disconnect).not.toHaveBeenCalled();
    });
  });

  describe('sendUserUpdatedEvent', () => {
    beforeEach(async () => {
      mockProducer.connect.mockResolvedValue(undefined);
      await kafkaService.connect();
    });

    it('should send user updated event successfully', async () => {
      const payload = {
        id: 'user-123',
        username: 'testuser',
        eventType: 'user.updated' as const,
      };

      mockProducer.send.mockResolvedValue(undefined);

      await kafkaService.sendUserUpdatedEvent(payload);

      expect(mockProducer.send).toHaveBeenCalledWith({
        topic: 'user-events',
        messages: [
          {
            key: 'user-123',
            value: JSON.stringify({
              id: 'user-123',
              username: 'testuser',
              eventType: 'user.updated',
              timestamp: expect.any(String),
            }),
          },
        ],
      });
    });

    it('should send user created event successfully', async () => {
      const payload = {
        id: 'user-456',
        username: 'newuser',
        eventType: 'user.created' as const,
      };

      mockProducer.send.mockResolvedValue(undefined);

      await kafkaService.sendUserUpdatedEvent(payload);

      expect(mockProducer.send).toHaveBeenCalledWith({
        topic: 'user-events',
        messages: [
          {
            key: 'user-456',
            value: JSON.stringify({
              id: 'user-456',
              username: 'newuser',
              eventType: 'user.created',
              timestamp: expect.any(String),
            }),
          },
        ],
      });
    });

    it('should throw error if not connected', async () => {
      const kafkaServiceNotConnected = new KafkaService();
      const payload = {
        id: 'user-123',
        username: 'testuser',
        eventType: 'user.updated' as const,
      };

      await expect(kafkaServiceNotConnected.sendUserUpdatedEvent(payload)).rejects.toThrow(
        'Kafka producer not connected'
      );
    });

    it('should handle send errors', async () => {
      const payload = {
        id: 'user-123',
        username: 'testuser',
        eventType: 'user.updated' as const,
      };

      const sendError = new Error('Kafka send error');
      mockProducer.send.mockRejectedValue(sendError);

      await expect(kafkaService.sendUserUpdatedEvent(payload)).rejects.toThrow('Kafka send error');
    });
  });
});
