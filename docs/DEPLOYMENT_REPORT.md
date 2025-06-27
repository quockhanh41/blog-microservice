# 📊 Báo Cáo Triển Khai Blog Microservices

## 📋 Thông Tin Dự Án

| Thông tin | Chi tiết |
|-----------|----------|
| **Tên dự án** | Blog Microservices |
| **Kiến trúc** | Microservices |
| **Ngôn ngữ chính** | TypeScript, JavaScript |
| **Ngày báo cáo** | 24/6/2025 |
| **Người thực hiện** | Nguyễn Quốc Khánh - 22127188 |

## 🎯 Mục Tiêu Triển Khai

Triển khai thành công hệ thống Blog Microservices bằng 3 phương pháp khác nhau:
1. **PM2** - Process Manager cho Node.js
2. **Docker Compose** - Containerization
3. **Railway** - Cloud Platform

## 🏗️ Kiến Trúc Hệ Thống

### Các Microservices
- **API Gateway** (Port 8080): Điểm vào duy nhất cho client
- **User Service** (Port 3001): Quản lý người dùng và xác thực
- **Post Service** (Port 3002): Quản lý bài viết
- **Feed Service** (Port 3003): Tạo feed cá nhân hóa
- **Frontend** (Port 3000): Giao diện người dùng

### Infrastructure Components
- **PostgreSQL**: Database cho User và Post services
- **Redis**: Cache cho Feed service
- **Kafka**: Message queue cho event-driven communication
- **Consul**: Service discovery và health checking

---

## 🚀 Phương Pháp 1: Triển Khai với PM2

### 📝 Mô Tả
PM2 là process manager cho Node.js applications, cho phép quản lý và monitor các processes một cách hiệu quả.

### 🔧 Cấu Hình

#### File cấu hình chính
```bash
script/ecosystem.dev.config.js
```

#### Các bước cấu hình:

**Bước 1: Cài đặt dependencies**
```bash
npm install
cd api-gateway && npm install
cd ../user-service && npm install
cd ../post-service && npm install
cd ../feed-service && npm install
cd ../Frontend && npm install
```

**Bước 2: Khởi động infrastructure**
Tôi dùng các dịch vụ infrastructure cloud sau:
redis: cloud.redis.io
Apache Kafka: Confluent Cloud
Postgres: Neon

**Bước 3: Build TypeScript services**
```bash
cd user-service && npm run build
cd ../post-service && npm run build
cd ../feed-service && npm run build
```

**Bước 4: Khởi động với PM2**
```bash
pm2 start script/ecosystem.dev.config.js
```
![alt text]({8CE247F5-DDF5-4688-BC44-980BE682ACC7}.png)
![alt text]({FAD70FD1-F2F9-4D85-9C1C-EE1CF4E786CD}.png)
### 📊 Kết Quả

#### PM2 Status
```bash
pm2 status
```
[![alt text](image.png)]

#### PM2 Monitoring
```bash
pm2 monit
```
![alt text]({59B1C861-F4E6-4EBE-9323-B7CE531E6F00}.png)



![alt text]({8E056854-4B96-45B9-A171-FCDE5941EF91}.png)
![alt text]({2592B049-280E-42D4-949E-1C69EB595289}.png)
#### Application Access
- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:8080
- **Consul UI**: http://localhost:8500

**Hình ảnh**: [Đính kèm screenshots của từng service đang chạy]

### ✅ Ưu Điểm
- Quản lý process dễ dàng
- Auto-restart khi crash
- Built-in monitoring
- Log management tự động
- Cluster mode support

### ❌ Nhược Điểm
- Phụ thuộc vào môi trường local
- Không có isolation hoàn toàn
- Phức tạp khi scale

### 📈 Metrics và Logs
```bash
pm2 logs api-gateway
pm2 logs user-service
pm2 logs post-service
pm2 logs feed-service
```
![alt text]({A87D3B90-0ABB-437A-8538-7A7E7D678E13}.png)
![alt text]({7A5D7E7D-E2A7-4037-B3DE-E17828D485F7}.png)
![alt text]({59FA1A15-C31D-46D8-8BD8-B98AFF7B2ECA}.png)
![alt text]({F5B4E3BE-A54C-453E-8DA7-0C4DE55CCB54}.png)


---

## 🐳 Phương Pháp 2: Triển Khai với Docker Compose

### 📝 Mô Tả
Docker Compose cho phép định nghĩa và chạy multi-container Docker applications với isolation hoàn toàn.

### 🔧 Cấu Hình

#### File cấu hình chính
```bash
docker-compose.yml
```

#### Các Dockerfile cho từng service:
- `api-gateway/Dockerfile`
- `user-service/Dockerfile`
- `post-service/Dockerfile`
- `feed-service/Dockerfile`
- `Frontend/Dockerfile`

#### Các bước cấu hình:

**Bước 1: Build containers**
```bash
docker-compose build
```

**Bước 2: Khởi động infrastructure và services**
```bash
docker-compose up -d 
```
![alt text]({D32763D0-51CF-427D-8ABF-26FB7A166125}.png)

**Bước 3: Verify deployment**
```bash
docker-compose ps
```

### 📊 Kết Quả

#### Container Status
```bash
docker-compose ps
```
![alt text]({08306161-96C5-4223-9F63-5F1AD4EFE250}.png)

#### Container Logs
```bash
docker-compose logs api-gateway
docker-compose logs user-service
```
![alt text]({6B17E962-1E70-465B-8C2E-82E210A76AF1}.png)

![alt text]({4CDC9930-0F23-4D68-8A84-A98BD462F098}.png)

#### Resource Usage
```bash
docker stats
```
![alt text]({0CF78FBF-1E83-4B14-858E-28EB22440AD3}.png)

#### Application Access
- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:8080
- **Consul UI**: http://localhost:8500

**Hình ảnh**: [Đính kèm screenshots của application running trong containers]

### ✅ Ưu Điểm
- Isolation hoàn toàn
- Consistent environment
- Easy scaling
- Infrastructure as code
- Cross-platform compatibility

### ❌ Nhược Điểm
- Resource overhead
- Learning curve
- Network complexity
- Storage management

---

## ☁️ Phương Pháp 3: Triển Khai trên Railway

### 📝 Mô Tả
Railway là cloud platform cho phép deploy applications dễ dàng với automatic scaling và managed infrastructure.

### 🔧 Cấu Hình

#### Các bước cấu hình:

**Bước 1: Build và push Docker images lên Docker Hub**
```bash
# Build images từ docker-compose
docker-compose build

# Tag images cho Docker Hub
docker tag blog-microservices_user-service quockhanh41/blog-user-service:latest
docker tag blog-microservices_post-service quockhanh41/blog-post-service:latest
docker tag blog-microservices_feed-service quockhanh41/blog-feed-service:latest
docker tag blog-microservices_api-gateway quockhanh41/blog-api-gateway:latest
docker tag blog-microservices_frontend quockhanh41/blog-frontend:latest

# Push lên Docker Hub
docker push quockhanh41/blog-user-service:latest
docker push quockhanh41/blog-post-service:latest
docker push quockhanh41/blog-feed-service:latest
docker push quockhanh41/blog-api-gateway:latest
docker push quockhanh41/blog-frontend:latest
```

![alt text]({9A02489D-186B-4283-B62D-63D39F21B474}.png)

**Bước 2: Tạo Railway project**
1. Truy cập Railway.app
2. Create new project (Empty Project)
3. Không cần connect GitHub repository

![alt text]({1A13ADC4-EAD5-4033-B61A-4C28B6CE6FB7}.png)

**Bước 3: Deploy services theo thứ tự (quan trọng!)**

##### 1. Consul Service (Service Discovery)
- **Deployment Method**: Docker Image
- **Docker Image**: `hashicorp/consul`
- **Port**: 8500
- **Environment Variables**: Không cần

![alt text]({EFCF4C70-D174-4D01-9AC6-1E436BD074BF}.png)

##### 2. User Service
- **Deployment Method**: Docker Image
- **Docker Image**: `quockhanh41/blog-microservices-user-service`
- **Port**: 3001
- **Environment Variables**:
```env
DATABASE_URL=postgresql://[railway-postgres-url]
JWT_SECRET=your-secret-key
CONSUL_HOST=[consul-service-internal-url]
CONSUL_PORT=8500
```

![alt text]({F68E6165-CD5A-4CB2-89CF-45FB860B6FD8}.png)

##### 3. Post Service
- **Deployment Method**: Docker Image
- **Docker Image**: `quockhanh41/blog-microservices-post-service`
- **Port**: 3002
- **Environment Variables**:
```env
DATABASE_URL=postgresql://[railway-postgres-url]
JWT_SECRET=your-secret-key
CONSUL_HOST=[consul-service-internal-url]
CONSUL_PORT=8500
KAFKA_BROKERS=[kafka-broker-url]
```

![alt text]({D79B45FE-D884-44E2-A56B-EDEB55BBC44D}.png)

##### 4. Feed Service
- **Deployment Method**: Docker Image
- **Docker Image**: `quockhanh41/blog-microservices-feed-service`
- **Port**: 3003
- **Environment Variables**:
```env
REDIS_URL=redis://[railway-redis-url]
CONSUL_HOST=[consul-service-internal-url]
CONSUL_PORT=8500
USER_SERVICE_URL=[user-service-internal-url]
POST_SERVICE_URL=[post-service-internal-url]
```

![alt text]({070D1C7C-2579-4C99-B7A9-293A8D0F6F15}.png)

##### 5. API Gateway
- **Deployment Method**: Docker Image
- **Docker Image**: `quockhanh41/blog-microservices-api-gateway`
- **Port**: 8080
- **Environment Variables**:
```env
CONSUL_HOST=[consul-service-internal-url]
CONSUL_PORT=8500
USER_SERVICE_URL=[user-service-internal-url]
POST_SERVICE_URL=[post-service-internal-url]
FEED_SERVICE_URL=[feed-service-internal-url]
```

![alt text]({009F7872-5246-452A-A820-52A8C89B5040}.png)

##### 6. Frontend
- **Deployment Method**: Docker Image
- **Docker Image**: `quockhanh41/blog-microservices-frontend`
- **Port**: 3000
- **Environment Variables**:
```env
NEXT_PUBLIC_API_URL=[api-gateway-public-url]
```

![alt text]({893C23D7-804C-4983-BED0-DB18F9BAE1E1}.png)

**Bước 4: Configure managed databases**

##### PostgreSQL Database
- Service: NEON PostgreSQL
- Connection URL: Sử dụng cho User Service và Post Service

##### Redis Database
- Service: Redis Cloud
- Connection URL: Sử dụng cho Feed Service

**Bước 5: Cấu hình Service Dependencies và Networking**

Sau khi mỗi service được deploy, sử dụng thông tin của service đó để cấu hình cho các service tiếp theo:

1. **Consul URL**: Lấy internal URL của Consul service
2. **Database URLs**: Từ Redis Cloud và NEON
3. **Service Internal URLs**: Sử dụng Railway private networking

**Bước 6: Environment Variables tổng hợp**
```env
# Infrastructure Services
CONSUL_HOST=consul-production.railway.internal
CONSUL_PORT=8500
DATABASE_URL=
REDIS_URL=

# Service Internal URLs (Railway Private Network)
USER_SERVICE_URL=https://user-service-production.railway.internal:3001
POST_SERVICE_URL=https://post-service-production.railway.internal:3002
FEED_SERVICE_URL=https://feed-service-production.railway.internal:3003
API_GATEWAY_URL=https://api-gateway-production.railway.internal:8080

# Public URLs (for Frontend)
NEXT_PUBLIC_API_URL=https://api-gateway-production.up.railway.app

# Authentication
JWT_SECRET=your-secret-key

# External Services 
KAFKA_BROKERS=your-kafka-broker-url
```


### 📊 Kết Quả

#### ⚠️ Lưu Ý Quan Trọng
**Về Railway Deployment**: 
- Dự án này được deploy sử dụng gói **Railway Standard** để demo
- Gói này có **thời hạn 1 tháng** kể từ ngày triển khai (24/6/2025)
- **Nếu không thể truy cập các URLs bên dưới**, có nghĩa là gói đã hết hạn
- Đây là hạn chế về chi phí, không phải lỗi kỹ thuật trong quá trình deployment
- Mong thầy thông cảm cho việc này! 🙏

#### Deployment Status
**Trạng thái**: ✅ Thành công triển khai tất cả services
**Ngày deploy**: 24/6/2025
**Thời hạn**: ~24/7/2025 (1 tháng)

#### Service URLs
- **Frontend**: https://frontend-production-5d92.up.railway.app/
- **API Gateway**: https://api-gateway-production-db6a.up.railway.app/
- **Consul UI**: https://consul-production-b80f.up.railway.app/ui/
**Internal Services** (accessible via Railway private network):
- **User Service**: https://user-service-production.railway.internal:3001
- **Post Service**: https://post-service-production.railway.internal:3002
- **Feed Service**: https://feed-service-production.railway.internal:3003


### ✅ Ưu Điểm
- Zero configuration deployment với pre-built Docker images
- Automatic scaling và managed infrastructure
- Built-in monitoring và health checks
- Easy collaboration với team
- Automatic HTTPS cho public endpoints
- Private networking giữa các services
- Managed databases (PostgreSQL, Redis)

### ❌ Nhược Điểm
- Cost cho production usage
- Cần quản lý Docker images trên Docker Hub
- Limited customization compared to self-hosted
- Vendor lock-in với Railway platform
- Phụ thuộc vào Docker Hub availability

### 🔍 Deployment Process Flow
1. **Infrastructure First**: Consul cho service discovery
2. **Core Services**: User và Post services với database connections
3. **Dependent Services**: Feed service phụ thuộc vào User/Post services
4. **Gateway Layer**: API Gateway routing tất cả requests
5. **Frontend**: Client application connect qua API Gateway

### 📊 Service Dependencies Chart
```
Consul (Service Discovery)
    ↓
User Service ← PostgreSQL
    ↓
Post Service ← PostgreSQL ← Kafka
    ↓
Feed Service ← Redis ← User/Post Services
    ↓
API Gateway ← All Services
    ↓
Frontend ← API Gateway
```

### 🔍 Health Monitoring
**Hình ảnh**: [Đính kèm screenshots Railway health monitoring]

---

## 📊 So Sánh Các Phương Pháp

| Tiêu chí | PM2 | Docker Compose | Railway |
|----------|-----|----------------|---------|
| **Độ phức tạp setup** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| **Isolation** | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Scalability** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Cost** | ⭐⭐⭐⭐⭐ (Free) | ⭐⭐⭐⭐⭐ (Free) | ⭐⭐⭐ (Paid) |
| **Monitoring** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Production Ready** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

## 🎯 Kết Luận

### Khuyến Nghị Sử Dụng

#### Development Environment
- **PM2**: Phù hợp cho development và testing local
- **Docker Compose**: Phù hợp cho development team và staging

#### Production Environment
- **Railway**: Phù hợp cho production với budget và cần managed infrastructure
- **Docker Compose**: Phù hợp cho production self-hosted với full control

### Bài Học Kinh Nghiệm

1. **PM2**:
   - Cần cài đặt và cấu hình infrastructure dependencies manually
   - Tốt cho rapid development và debugging
   - Require system-level dependencies

2. **Docker Compose**:
   - Cần hiểu về Docker và containerization
   - Excellent cho reproducible environments
   - Resource overhead cần được consider

3. **Railway**:
   - Sử dụng pre-built Docker images từ Docker Hub
   - Deploy theo thứ tự dependencies (Consul → Services → Gateway → Frontend)
   - Automatic scaling và managed services
   - Cần quản lý thông tin service URLs cho inter-service communication


---

**Ngày hoàn thành**: [24/6/2025]  
**Tài liệu được tạo bởi**: [Nguyễn Quốc Khánh - 22127188]  
**Version**: 1.0
