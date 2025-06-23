module.exports = {
  apps: [
    {
      name: 'consul',
      script: 'consul',
      args: 'agent -dev -ui -client=0.0.0.0',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development'
      },
      log_file: './logs/consul.log',
      out_file: './logs/consul-out.log',
      error_file: './logs/consul-error.log',
      time: true
    },
    {
      name: 'api-gateway',
      script: './api-gateway/server.js',
      cwd: './api-gateway',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development'
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
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development'
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
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development'
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
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development'
      },
      log_file: './logs/feed-service.log',
      out_file: './logs/feed-service-out.log',
      error_file: './logs/feed-service-error.log',
      time: true
    },
    {
      name: 'frontend-dev',
      script: 'cmd',
      args: '/c npm run dev',
      cwd: './Frontend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '2G',
      env: {
        NODE_ENV: 'development'
      },
      log_file: './logs/frontend-dev.log',
      out_file: './logs/frontend-dev-out.log',
      error_file: './logs/frontend-dev-error.log',
      time: true
    }
  ]
};
