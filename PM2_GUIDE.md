# PM2 Scripts for Blog Microservices

Tài liệu này mô tả cách sử dụng PM2 để giám sát và quản lý dự án blog-microservices với infrastructure services chạy trên Docker.

## Kiến trúc triển khai

- **Infrastructure Services**: PostgreSQL, Redis, Kafka, Consul chạy trên Docker
- **Microservices**: API Gateway, User Service, Post Service, Feed Service chạy với PM2
- **Frontend**: Next.js application (có thể chạy riêng biệt)

## Cài đặt PM2

```bash
# Cài đặt PM2 globally
npm install -g pm2

# Hoặc sử dụng script có sẵn
npm run pm2:install
```

## Khởi động hệ thống

### Khởi động hoàn chỉnh (Infrastructure + Microservices)

```powershell
# Sử dụng script tự động
.\start-with-pm2.ps1

# Hoặc thực hiện từng bước:
# 1. Start infrastructure
npm run infra:start

# 2. Build services
npm run build:all

# 3. Start microservices
npm run pm2:start
```

### Chỉ khởi động Infrastructure Services

```bash
# Start infrastructure services
npm run infra:start

# Check status
npm run infra:status

# View logs
npm run infra:logs
```

## Build dự án

Trước khi chạy PM2, cần build các TypeScript services:

```bash
# Build tất cả services (bao gồm frontend)
npm run build:all

# Hoặc build từng service riêng lẻ
npm run build:api     # API Gateway
npm run build:user    # User Service
npm run build:post    # Post Service
npm run build:feed    # Feed Service
npm run build:frontend # Frontend
```

## Quản lý PM2 processes

```bash
# Xem danh sách processes
npm run pm2:list

# Xem logs tất cả services
npm run pm2:logs

# Xem logs từng service
npm run pm2:logs:api     # API Gateway
npm run pm2:logs:user    # User Service
npm run pm2:logs:post    # Post Service
npm run pm2:logs:feed    # Feed Service
npm run pm2:logs:frontend # Frontend

# Giám sát real-time
npm run pm2:monit

# Khởi động lại tất cả
npm run pm2:restart

# Reload tất cả (zero-downtime)
npm run pm2:reload

# Dừng tất cả
npm run pm2:stop

# Xóa tất cả processes
npm run pm2:delete
```

## Dừng hệ thống

```powershell
# Dừng tất cả (Infrastructure + Microservices)
.\stop-pm2.ps1

# Hoặc dừng từng phần:
# 1. Stop microservices
npm run pm2:stop

# 2. Stop infrastructure
npm run infra:stop
```

## Kiểm tra trạng thái

```powershell
# Kiểm tra trạng thái tất cả services
.\check-status.ps1

# Hoặc kiểm tra từng phần:
npm run infra:status
npm run pm2:list
```

## Cấu trúc Services

### Infrastructure Services (Docker)
- **PostgreSQL User DB**: Port 5432 - Database cho User Service
- **PostgreSQL Post DB**: Port 5433 - Database cho Post Service  
- **Redis**: Port 6379 - Cache và session storage
- **Kafka**: Port 29092 - Message queue
- **Consul**: Port 8500 - Service discovery
- **Zookeeper**: Port 2181 - Kafka coordinator

### Microservices (PM2)
- **Frontend**: Port 3000 - Next.js React application
- **API Gateway**: Port 8080 - Entry point cho tất cả API calls
- **User Service**: Port 3001 - Quản lý users và authentication
- **Post Service**: Port 3002 - Quản lý blog posts
- **Feed Service**: Port 3003 - Tạo feed từ posts

## Các scripts khởi động

### 1. Khởi động toàn bộ hệ thống (Infrastructure + Backend + Frontend)
```powershell
.\start-with-pm2.ps1
```

### 2. Khởi động chỉ backend services (không có frontend)
```powershell
.\start-backend-pm2.ps1
```

### 3. Khởi động chỉ frontend
```powershell
.\start-frontend-pm2.ps1
```

### 4. Khởi động frontend ở development mode (hot reload)
```powershell
cd Frontend
npm run dev
```

## Environment Variables

Các environment variables được cấu hình trong `ecosystem.config.js`:
- Database connections point to localhost với correct ports
- Service URLs point to localhost
- Consul và Kafka endpoints configured for local development

## Log Files

### PM2 Logs
Tất cả PM2 logs được lưu trong thư mục `./logs/`:
- `{service-name}.log` - Combined logs
- `{service-name}-out.log` - Standard output
- `{service-name}-error.log` - Error logs

### Docker Logs
```bash
# View infrastructure logs
npm run infra:logs

# View specific service logs
docker logs blog-postgres-user
docker logs blog-redis
docker logs blog-kafka
```

## Monitoring

### PM2 Monitoring
- Memory usage monitoring
- CPU usage tracking
- Automatic restart on crashes
- Load balancing (có thể config nhiều instances)
- Log rotation
- Real-time monitoring dashboard

### Docker Monitoring
- Health checks cho tất cả infrastructure services
- Automatic restart policies
- Volume persistence cho data

## Troubleshooting

### Common Issues

1. **Docker not running**
   ```
   Error: Cannot connect to the Docker daemon
   Solution: Start Docker Desktop
   ```

2. **Infrastructure services not ready**
   ```
   Error: Connection refused to database/redis
   Solution: Wait for health checks to pass or restart infrastructure
   ```

3. **Service build failures**
   ```
   Error: TypeScript compilation errors
   Solution: Fix TypeScript errors and run npm run build:all
   ```

4. **Port conflicts**
   ```
   Error: Port already in use
   Solution: Check and kill processes using required ports
   ```

### Debug Commands

```bash
# Check infrastructure health
.\check-status.ps1

# Check specific service logs
docker logs blog-postgres-user
pm2 logs user-service

# Check port usage
netstat -an | findstr :5432
netstat -an | findstr :3001

# Restart specific service
pm2 restart user-service
docker-compose -f docker-compose.infrastructure.yml restart postgres-user
```

### Performance Tuning

1. **PM2 Configuration**
   - Adjust max_memory_restart based on your system
   - Enable clustering for high-traffic services
   - Configure log rotation

2. **Docker Resources**
   - Increase Docker memory limits if needed
   - Use volumes for data persistence
   - Monitor container resource usage

3. **Database Optimization**
   - Configure PostgreSQL connection pooling
   - Set appropriate Redis memory limits
   - Monitor database performance

## Troubleshooting Frontend PM2

### Frontend không start được với PM2

**Nguyên nhân phổ biến:**
1. Frontend chưa được build
2. Dependencies chưa được install
3. PM2 config không đúng cho Next.js
4. Port conflict

**Các bước debug:**

1. **Chạy debug tool:**
```powershell
.\debug-frontend-pm2.ps1
```

2. **Kiểm tra và cài đặt dependencies:**
```powershell
cd Frontend
npm install
npm run build
```

3. **Test thủ công:**
```powershell
# Test Next.js trực tiếp
cd Frontend
npm run dev

# Test production build
npm run build
npm start
```

4. **Các cách start Frontend với PM2:**

**Method 1: Sử dụng ecosystem config chính**
```powershell
pm2 start ecosystem.config.js --only frontend
```

**Method 2: Sử dụng config riêng cho frontend**
```powershell
# Development mode (với hot reload)
npm run pm2:start:frontend-dev

# Production mode
npm run pm2:start:frontend-prod
```

**Method 3: Manual PM2 start**
```powershell
pm2 start "npm start" --name frontend --cwd ./Frontend
```

**Method 4: Direct next command**
```powershell
pm2 start ./Frontend/node_modules/.bin/next --name frontend -- start -p 3000
```

5. **Kiểm tra logs nếu lỗi:**
```powershell
pm2 logs frontend
pm2 logs frontend-dev
pm2 logs frontend-prod
```
