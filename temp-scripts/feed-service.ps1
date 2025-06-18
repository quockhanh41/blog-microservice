$env:CONSUL_HOST = "localhost"
$env:USER_SERVICE_URL = "http://localhost:3001"
$env:REDIS_URL = "redis://localhost:6379"
$env:CONSUL_PORT = "8500"
$env:NODE_ENV = "development"
$env:PORT = "3003"
$env:POST_SERVICE_URL = "http://localhost:3002"
$env:SERVICE_ADDRESS = "localhost"
node dist/index.js
