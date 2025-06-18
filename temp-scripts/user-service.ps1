$env:PORT = "3001"
$env:DATABASE_URL = "postgresql://postgres@localhost:5432/user_service"
$env:NODE_ENV = "development"
$env:SERVICE_ADDRESS = "localhost"
$env:CONSUL_PORT = "8500"
$env:CONSUL_HOST = "localhost"
$env:KAFKA_BROKERS = "localhost:29092"
node dist/index.js
