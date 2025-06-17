import axios, { AxiosInstance } from 'axios';

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

export class ConsulClient {
  private consulUrl: string;
  private client: AxiosInstance;

  constructor(host: string = 'localhost', port: number = 8500) {
    this.consulUrl = `http://${host}:${port}`;
    this.client = axios.create({
      baseURL: this.consulUrl,
      timeout: 10000,
    });
  }

  /**
   * Register a service with Consul
   */
  async registerService(service: ServiceInfo, healthCheck?: HealthCheck): Promise<void> {
    const registration = {
      ID: service.id,
      Name: service.name,
      Address: service.address,
      Port: service.port,
      Tags: service.tags || [],
      Meta: service.meta || {},
      Check: healthCheck ? {
        HTTP: healthCheck.http,
        Interval: healthCheck.interval || '10s',
        Timeout: healthCheck.timeout || '5s',
        DeregisterCriticalServiceAfter: healthCheck.deregisterCriticalServiceAfter || '30s',
      } : undefined,
    };

    try {
      await this.client.put('/v1/agent/service/register', registration);
      console.log(`Service ${service.name} registered successfully with Consul`);
    } catch (error) {
      console.error(`Failed to register service ${service.name}:`, error);
      throw error;
    }
  }

  /**
   * Deregister a service from Consul
   */
  async deregisterService(serviceId: string): Promise<void> {
    try {
      await this.client.put(`/v1/agent/service/deregister/${serviceId}`);
      console.log(`Service ${serviceId} deregistered successfully from Consul`);
    } catch (error) {
      console.error(`Failed to deregister service ${serviceId}:`, error);
      throw error;
    }
  }

  /**
   * Discover services by name
   */
  async discoverService(serviceName: string): Promise<ServiceInfo[]> {
    try {
      const response = await this.client.get(`/v1/health/service/${serviceName}?passing=true`);
      
      return response.data.map((entry: any) => ({
        id: entry.Service.ID,
        name: entry.Service.Service,
        address: entry.Service.Address,
        port: entry.Service.Port,
        tags: entry.Service.Tags,
        meta: entry.Service.Meta,
      }));
    } catch (error) {
      console.error(`Failed to discover service ${serviceName}:`, error);
      return [];
    }
  }

  /**
   * Get a healthy instance of a service (load balancing)
   */
  async getServiceInstance(serviceName: string): Promise<ServiceInfo | null> {
    const services = await this.discoverService(serviceName);
    
    if (services.length === 0) {
      return null;
    }

    // Simple round-robin selection
    const randomIndex = Math.floor(Math.random() * services.length);
    return services[randomIndex];
  }

  /**
   * Watch for service changes
   */
  async watchService(serviceName: string, callback: (services: ServiceInfo[]) => void): Promise<void> {
    const poll = async () => {
      try {
        const services = await this.discoverService(serviceName);
        callback(services);
      } catch (error) {
        console.error(`Error watching service ${serviceName}:`, error);
      }
    };

    // Poll every 30 seconds
    setInterval(poll, 30000);
    
    // Initial call
    await poll();
  }

  /**
   * Store key-value data
   */
  async putKV(key: string, value: string): Promise<void> {
    try {
      await this.client.put(`/v1/kv/${key}`, value);
    } catch (error) {
      console.error(`Failed to store KV ${key}:`, error);
      throw error;
    }
  }

  /**
   * Get key-value data
   */
  async getKV(key: string): Promise<string | null> {
    try {
      const response = await this.client.get(`/v1/kv/${key}`);
      
      if (response.data && response.data.length > 0) {
        return Buffer.from(response.data[0].Value, 'base64').toString('utf-8');
      }
      
      return null;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      console.error(`Failed to get KV ${key}:`, error);
      throw error;
    }
  }

  /**
   * Delete key-value data
   */
  async deleteKV(key: string): Promise<void> {
    try {
      await this.client.delete(`/v1/kv/${key}`);
    } catch (error) {
      console.error(`Failed to delete KV ${key}:`, error);
      throw error;
    }
  }

  /**
   * Get service health status
   */
  async getServiceHealth(serviceName: string): Promise<any[]> {
    try {
      const response = await this.client.get(`/v1/health/service/${serviceName}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get health for service ${serviceName}:`, error);
      return [];
    }
  }
}

export default ConsulClient;
