const express = require("express");
const gateway = require("express-gateway");
const cors = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");
const path = require("path");
const ConsulServiceRegistry = require("./consul-service");

// Try to load morgan, but continue if not available
let morgan;
try {
  morgan = require("morgan");
} catch (error) {
  console.warn(
    "Morgan logger not available, continuing without request logging"
  );
}

// Initialize Consul service registry
const consulHost = process.env.CONSUL_HOST || "localhost";
const consulPort = parseInt(process.env.CONSUL_PORT || "8500");
const serviceName = "api-gateway";
const serviceAddress = process.env.SERVICE_ADDRESS || "api-gateway";
const servicePort = parseInt(process.env.PORT || "8080");

const consulRegistry = new ConsulServiceRegistry(
  consulHost,
  consulPort,
  serviceName,
  serviceAddress,
  servicePort
);

// Create a separate Express app for health check
const healthApp = express();
const HEALTH_PORT = 8081;

// Configure health check app
if (morgan) {
  healthApp.use(morgan("combined"));
}

// Enable CORS for health check endpoint
healthApp.use(
  cors({
    origin: ["http://localhost:6060", "http://localhost:3000"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "x-user-id"],
  })
);

// Health check endpoint
healthApp.get("/health", async (req, res) => {
  try {
    // Check if we can connect to Consul
    const userServices = await consulRegistry.discoverService("user-service");
    const postServices = await consulRegistry.discoverService("post-service");
    const feedServices = await consulRegistry.discoverService("feed-service");

    res.status(200).json({
      status: "healthy",
      service: "api-gateway",
      timestamp: new Date().toISOString(),
      consul: {
        connected: true,
        services: {
          "user-service": userServices.length,
          "post-service": postServices.length,
          "feed-service": feedServices.length,
        },
      },
    });
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      service: "api-gateway",
      timestamp: new Date().toISOString(),
      consul: {
        connected: false,
        error: error.message,
      },
    });
  }
});

// Start the health check server
healthApp.listen(HEALTH_PORT, () => {
  console.log(`Health check server started on port ${HEALTH_PORT}`);
});

// Create main Express app for API Gateway with CORS support
const app = express();
const GATEWAY_PORT = 8080;

// Configure CORS for the main gateway
app.use(
  cors({
    origin: ["http://localhost:6060", "http://localhost:3000"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "x-user-id"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

// Add logging if morgan is available
if (morgan) {
  app.use(morgan("combined"));
}

// Dynamic service discovery middleware
const createConsulProxyMiddleware = (serviceName, pathPrefix) => {
  return createProxyMiddleware({
    target: "http://placeholder", // This will be overridden
    changeOrigin: true,
    pathRewrite: {
      [`^${pathPrefix}`]: "", // Remove prefix when forwarding
    },
    router: async (req) => {
      try {
        const serviceUrl = await consulRegistry.getServiceUrl(serviceName);
        if (!serviceUrl) {
          console.error(`❌ No healthy instances found for ${serviceName}`);
          // Fallback to localhost URLs for development mode
          const fallbackUrls = {
            "user-service": "http://user-service:3001",
            "post-service": "http://post-service:3002",
            "feed-service": "http://feed-service:3003",
          };
          return fallbackUrls[serviceName] || null;
        }
        return serviceUrl;
      } catch (error) {
        console.error(`❌ Error discovering ${serviceName}:`, error.message);
        return null;
      }
    },
    onError: (err, req, res) => {
      console.error(`❌ Proxy error for ${serviceName}:`, err.message);
      res.status(503).json({
        error: "Service temporarily unavailable",
        service: serviceName,
        timestamp: new Date().toISOString(),
      });
    },
    onProxyReq: (proxyReq, req, res) => {
      console.log(`🔀 Proxying ${req.method} ${req.url} to ${serviceName}`);
    },
  });
};

// Proxy middleware for each service using Consul discovery
app.use("/users", createConsulProxyMiddleware("user-service", "/users"));
app.use("/posts", createConsulProxyMiddleware("post-service", "/posts"));
app.use("/feed", createConsulProxyMiddleware("feed-service", "/feed"));

// Admin endpoints for service discovery
app.get("/admin/services", async (req, res) => {
  try {
    const services = {
      "user-service": await consulRegistry.getServiceInstances("user-service"),
      "post-service": await consulRegistry.getServiceInstances("post-service"),
      "feed-service": await consulRegistry.getServiceInstances("feed-service"),
    };

    res.json({
      timestamp: new Date().toISOString(),
      services,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch services",
      message: error.message,
    });
  }
});

app.get("/admin/health", async (req, res) => {
  try {
    const health = {};
    const serviceNames = ["user-service", "post-service", "feed-service"];

    for (const serviceName of serviceNames) {
      const instances = await consulRegistry.getServiceInstances(serviceName);
      health[serviceName] = {
        healthy: instances.length,
        instances: instances.map((instance) => ({
          url: instance.url,
          id: instance.id,
        })),
      };
    }

    res.json({
      timestamp: new Date().toISOString(),
      consul: {
        url: consulRegistry.consulUrl,
        connected: true,
      },
      services: health,
    });
  } catch (error) {
    res.status(503).json({
      error: "Health check failed",
      message: error.message,
      consul: {
        url: consulRegistry.consulUrl,
        connected: false,
      },
    });
  }
});

// Cache management endpoints
app.post("/admin/cache/clear", (req, res) => {
  consulRegistry.clearCache();
  res.json({
    message: "Service discovery cache cleared",
    timestamp: new Date().toISOString(),
  });
});

app.post("/admin/cache/clear/:service", (req, res) => {
  const serviceName = req.params.service;
  consulRegistry.invalidateCache(serviceName);
  res.json({
    message: `Cache cleared for ${serviceName}`,
    timestamp: new Date().toISOString(),
  });
});

// Start the main gateway server
app.listen(GATEWAY_PORT, async () => {
  console.log(`🚀 API Gateway server started on port ${GATEWAY_PORT}`);

  // Register with Consul
  try {
    await consulRegistry.register();
    console.log("✅ API Gateway registered with Consul");

    // Start watching services for changes
    consulRegistry.watchServices();
    console.log("👀 Watching for service changes...");
  } catch (error) {
    console.error("❌ Failed to register with Consul:", error.message);
    console.log("⚠️  API Gateway will continue without Consul integration");
  }
});
