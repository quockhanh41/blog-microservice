import axios from 'axios';

export interface ServiceInfo {
  id: string;
  name: string;
  address: string;
  port: number;
  tags?: string[];
  meta?: Record<string, string>;
}

export interface HealthCheck {
  http?: string;
  interval?: string;
  timeout?: string;
  deregisterCriticalServiceAfter?: string;
}

export class ConsulServiceRegistry {
  private consulUrl: string;
  private serviceId: string;
  private serviceName: string;
  private servicePort: number;
  private serviceAddress: string;

  constructor(
    consulHost: string = 'localhost',
    consulPort: number = 8500,
    serviceName: string,
    serviceAddress: string,
    servicePort: number,
    instanceId: string = ''
  ) {
    this.consulUrl = `http://${consulHost}:${consulPort}`;
    this.serviceName = serviceName;
    this.serviceAddress = serviceAddress;
    this.servicePort = servicePort;
    
    // Use instanceId if provided to create a unique service ID
    const uniqueId = instanceId || Math.random().toString(36).substring(2, 9);
    this.serviceId = `${serviceName}-${serviceAddress}-${servicePort}-${uniqueId}`;
  }

  async register(): Promise<void> {
    const registration = {
      ID: this.serviceId,
      Name: this.serviceName,
      Address: this.serviceAddress,
      Port: this.servicePort,
      Tags: ['microservice', 'blog', this.serviceName],
      Meta: {
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
      },
      Check: {
        HTTP: `http://${this.serviceAddress}:${this.servicePort}/health`,
        Interval: '10s',
        Timeout: '5s',
        DeregisterCriticalServiceAfter: '30s',
      },
    };

    try {
      await axios.put(`${this.consulUrl}/v1/agent/service/register`, registration);
      console.log(`✅ Service ${this.serviceName} registered with Consul`);
      
      // Setup graceful shutdown
      this.setupGracefulShutdown();
    } catch (error) {
      console.error(`❌ Failed to register service ${this.serviceName}:`, error);
      throw error;
    }
  }

  async deregister(): Promise<void> {
    try {
      await axios.put(`${this.consulUrl}/v1/agent/service/deregister/${this.serviceId}`);
      console.log(`✅ Service ${this.serviceName} deregistered from Consul`);
    } catch (error) {
      console.error(`❌ Failed to deregister service ${this.serviceName}:`, error);
    }
  }

  async discoverService(serviceName: string): Promise<ServiceInfo[]> {
    try {
      const response = await axios.get(`${this.consulUrl}/v1/health/service/${serviceName}?passing=true`);
      
      return response.data.map((entry: any) => ({
        id: entry.Service.ID,
        name: entry.Service.Service,
        address: entry.Service.Address,
        port: entry.Service.Port,
        tags: entry.Service.Tags,
        meta: entry.Service.Meta,
      }));
    } catch (error) {
      console.error(`❌ Failed to discover service ${serviceName}:`, error);
      return [];
    }
  }

  async getServiceUrl(serviceName: string): Promise<string | null> {
    const services = await this.discoverService(serviceName);
    
    if (services.length === 0) {
      return null;
    }

    // Simple load balancing - random selection
    const service = services[Math.floor(Math.random() * services.length)];
    return `http://${service.address}:${service.port}`;
  }

  private setupGracefulShutdown(): void {
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n🔄 Received ${signal}. Shutting down gracefully...`);
      await this.deregister();
      process.exit(0);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // nodemon restart
  }
}

export default ConsulServiceRegistry;
