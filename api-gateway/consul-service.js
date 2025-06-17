const axios = require('axios');

class ConsulServiceRegistry {
  constructor(consulHost = 'localhost', consulPort = 8500, serviceName, serviceAddress, servicePort) {
    this.consulUrl = `http://${consulHost}:${consulPort}`;
    this.serviceName = serviceName;
    this.serviceAddress = serviceAddress;
    this.servicePort = servicePort;
    this.serviceId = `${serviceName}-${serviceAddress}-${servicePort}`;
    this.serviceCache = new Map();
    this.cacheTimeout = 30000; // 30 seconds cache
  }

  async register() {
    const registration = {
      ID: this.serviceId,
      Name: this.serviceName,
      Address: this.serviceAddress,
      Port: this.servicePort,
      Tags: ['microservice', 'blog', 'api-gateway'],
      Meta: {
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
      },
      Check: {
        HTTP: `http://${this.serviceAddress}:8081/health`, // Health check port
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
      console.error(`❌ Failed to register service ${this.serviceName}:`, error.message);
      throw error;
    }
  }

  async deregister() {
    try {
      await axios.put(`${this.consulUrl}/v1/agent/service/deregister/${this.serviceId}`);
      console.log(`✅ Service ${this.serviceName} deregistered from Consul`);
    } catch (error) {
      console.error(`❌ Failed to deregister service ${this.serviceName}:`, error.message);
    }
  }

  async discoverService(serviceName) {
    // Check cache first
    const cached = this.serviceCache.get(serviceName);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.services;
    }

    try {
      const response = await axios.get(`${this.consulUrl}/v1/health/service/${serviceName}?passing=true`);
      
      const services = response.data.map(entry => ({
        id: entry.Service.ID,
        name: entry.Service.Service,
        address: entry.Service.Address,
        port: entry.Service.Port,
        tags: entry.Service.Tags,
        meta: entry.Service.Meta,
      }));

      // Cache the result
      this.serviceCache.set(serviceName, {
        services,
        timestamp: Date.now()
      });

      return services;
    } catch (error) {
      console.error(`❌ Failed to discover service ${serviceName}:`, error.message);
      
      // Return cached data if available, even if expired
      const cached = this.serviceCache.get(serviceName);
      if (cached) {
        console.warn(`⚠️  Using cached data for ${serviceName}`);
        return cached.services;
      }
      
      return [];
    }
  }

  async getServiceUrl(serviceName) {
    const services = await this.discoverService(serviceName);
    
    if (services.length === 0) {
      return null;
    }

    // Simple load balancing - random selection
    const service = services[Math.floor(Math.random() * services.length)];
    const url = `http://${service.address}:${service.port}`;
    
    console.log(`🔀 Selected ${serviceName} instance: ${url}`);
    return url;
  }

  // Get all healthy instances for a service (for advanced load balancing)
  async getServiceInstances(serviceName) {
    const services = await this.discoverService(serviceName);
    return services.map(service => ({
      url: `http://${service.address}:${service.port}`,
      id: service.id,
      meta: service.meta
    }));
  }

  // Clear cache for a specific service
  invalidateCache(serviceName) {
    this.serviceCache.delete(serviceName);
  }

  // Clear all cache
  clearCache() {
    this.serviceCache.clear();
  }

  setupGracefulShutdown() {
    const gracefulShutdown = async (signal) => {
      console.log(`\n🔄 API Gateway received ${signal}. Shutting down gracefully...`);
      await this.deregister();
      process.exit(0);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // nodemon restart
  }

  // Watch for service changes and invalidate cache
  async watchServices() {
    const services = ['user-service', 'post-service', 'feed-service'];
    
    setInterval(async () => {
      for (const service of services) {
        try {
          // This will refresh the cache
          await this.discoverService(service);
        } catch (error) {
          console.error(`Error watching service ${service}:`, error.message);
        }
      }
    }, 30000); // Check every 30 seconds
  }
}

module.exports = ConsulServiceRegistry;
