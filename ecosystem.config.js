module.exports = {
  apps: [
    {
      name: 'api-gateway',
      script: './api-gateway/server.js',
      cwd: './api-gateway',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',      env: {
        NODE_ENV: 'development',
        PORT: 8080,
        USER_SERVICE_URL: 'http://localhost:3001',
        POST_SERVICE_URL: 'http://localhost:3002',
        FEED_SERVICE_URL: 'http://localhost:3003',
        CONSUL_HOST: 'localhost',
        CONSUL_PORT: 8500
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 8080,
        USER_SERVICE_URL: 'http://localhost:3001',
        POST_SERVICE_URL: 'http://localhost:3002',
        FEED_SERVICE_URL: 'http://localhost:3003',
        CONSUL_HOST: 'localhost',
        CONSUL_PORT: 8500
      },
      log_file: './logs/api-gateway.log',
      out_file: './logs/api-gateway-out.log',
      error_file: './logs/api-gateway-error.log',
      time: true
    },
    {
      name: 'user-service',
      script: './user-service/dist/index.js',
      cwd: './user-service',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',      env: {
        NODE_ENV: 'development',
        PORT: 3001,
        DATABASE_URL: 'postgresql://postgres@localhost:5432/user_service',
        CONSUL_HOST: 'localhost',
        CONSUL_PORT: 8500,
        KAFKA_BROKERS: 'localhost:29092'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
        DATABASE_URL: 'postgresql://postgres@localhost:5432/user_service',
        CONSUL_HOST: 'localhost',
        CONSUL_PORT: 8500,
        KAFKA_BROKERS: 'localhost:29092'
      },
      log_file: './logs/user-service.log',
      out_file: './logs/user-service-out.log',
      error_file: './logs/user-service-error.log',
      time: true
    },
    {
      name: 'post-service',
      script: './post-service/dist/index.js',
      cwd: './post-service',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',      env: {
        NODE_ENV: 'development',
        PORT: 3002,
        DATABASE_URL: 'postgresql://postgres@localhost:5433/post_service',
        CONSUL_HOST: 'localhost',
        CONSUL_PORT: 8500,
        KAFKA_BROKERS: 'localhost:29092'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3002,
        DATABASE_URL: 'postgresql://postgres@localhost:5433/post_service',
        CONSUL_HOST: 'localhost',
        CONSUL_PORT: 8500,
        KAFKA_BROKERS: 'localhost:29092'
      },
      log_file: './logs/post-service.log',
      out_file: './logs/post-service-out.log',
      error_file: './logs/post-service-error.log',
      time: true
    },
    {
      name: 'feed-service',
      script: './feed-service/dist/index.js',
      cwd: './feed-service',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',      env: {
        NODE_ENV: 'development',
        PORT: 3003,
        REDIS_URL: 'redis://localhost:6379',
        USER_SERVICE_URL: 'http://localhost:3001',
        POST_SERVICE_URL: 'http://localhost:3002',
        CONSUL_HOST: 'localhost',
        CONSUL_PORT: 8500
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3003,
        REDIS_URL: 'redis://localhost:6379',
        USER_SERVICE_URL: 'http://localhost:3001',
        POST_SERVICE_URL: 'http://localhost:3002',
        CONSUL_HOST: 'localhost',
        CONSUL_PORT: 8500
      },
      log_file: './logs/feed-service.log',
      out_file: './logs/feed-service-out.log',
      error_file: './logs/feed-service-error.log',
      time: true    },    {
      name: 'frontend',
      script: 'node',
      args: '.next/standalone/server.js',
      cwd: './Frontend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '2G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        NEXT_PUBLIC_API_URL: 'http://localhost:8080'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        NEXT_PUBLIC_API_URL: 'http://localhost:8080'
      },
      log_file: './logs/frontend.log',
      out_file: './logs/frontend-out.log',
      error_file: './logs/frontend-error.log',
      time: true
    }
  ],

  deploy: {
    production: {
      user: 'node',
      host: 'localhost',
      ref: 'origin/master',
      repo: 'git@github.com:repo.git',
      path: '/var/www/production',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production'
    }
  }
};
