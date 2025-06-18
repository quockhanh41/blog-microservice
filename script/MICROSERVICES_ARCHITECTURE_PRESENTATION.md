# Kiến Trúc Microservices và Các Pattern
## Thuyết Trình Phân Tích Dự Án Blog Platform

---

## 📋 Mục Lục

1. [Tổng Quan Về Kiến Trúc Microservices](#1-tổng-quan-về-kiến-trúc-microservices)
2. [Các Pattern Cơ Bản Trong Microservices](#2-các-pattern-cơ-bản-trong-microservices)
3. [Phân Tích Kiến Trúc Dự Án Blog Platform](#3-phân-tích-kiến-trúc-dự-án-blog-platform)
4. [Các Pattern Được Áp Dụng Trong Dự Án](#4-các-pattern-được-áp-dụng-trong-dự-án)
5. [Chi Tiết Triển Khai Từng Pattern](#5-chi-tiết-triển-khai-từng-pattern)
6. [Lợi Ích và Thách Thức](#6-lợi-ích-và-thách-thức)
7. [Kết Luận và Đề Xuất](#7-kết-luận-và-đề-xuất)

---

## 1. Tổng Quan Về Kiến Trúc Microservices

### 1.1 Định Nghĩa
Microservices là một phương pháp kiến trúc phần mềm trong đó ứng dụng được xây dựng như một tập hợp các dịch vụ nhỏ, độc lập, có thể triển khai riêng biệt và giao tiếp với nhau thông qua các API được định nghĩa rõ ràng.

### 1.2 Đặc Điểm Chính
- **Phân tách theo Business Domain**: Mỗi service tập trung vào một chức năng nghiệp vụ cụ thể
- **Độc lập về Technology Stack**: Mỗi service có thể sử dụng công nghệ phù hợp nhất
- **Decentralized Data Management**: Mỗi service quản lý dữ liệu riêng
- **Fault Isolation**: Lỗi trong một service không ảnh hưởng toàn bộ hệ thống
- **Scalability**: Có thể scale từng service độc lập

### 1.3 So Sánh Với Monolithic
| Monolithic | Microservices |
|------------|---------------|
| Một ứng dụng lớn | Nhiều service nhỏ |
| Shared Database | Database per Service |
| In-process communication | Network communication |
| Single deployment | Independent deployment |
| Technology homogeneity | Technology diversity |

---

## 2. Các Pattern Cơ Bản Trong Microservices

### 2.1 Decomposition Patterns
- **Decompose by Business Capability**
- **Decompose by Subdomain**
- **Self-contained Service**

### 2.2 Integration Patterns
- **API Gateway**
- **Backend for Frontend (BFF)**
- **Service Mesh**

### 2.3 Data Management Patterns
- **Database per Service**
- **Shared Database**
- **CQRS (Command Query Responsibility Segregation)**
- **Event Sourcing**

### 2.4 Communication Patterns
- **Synchronous Communication**
  - Request/Response
  - Remote Procedure Call (RPC)
- **Asynchronous Communication**
  - Message Queue
  - Event-driven Architecture
  - Publish/Subscribe

### 2.5 Reliability Patterns
- **Circuit Breaker**
- **Bulkhead**
- **Timeout**
- **Retry**
- **Health Check**

### 2.6 Security Patterns
- **Access Token**
- **JWT (JSON Web Token)**
- **OAuth 2.0**
- **API Key**

### 2.7 Observability Patterns
- **Log Aggregation**
- **Distributed Tracing**
- **Application Metrics**
- **Health Check API**

### 2.8 Service Discovery Patterns
- **Client-side Discovery**
- **Server-side Discovery**
- **Service Registry**
- **Self-Registration**

---

## 3. Phân Tích Kiến Trúc Dự Án Blog Platform

### 3.1 Tổng Quan Hệ Thống
Dự án Blog Platform được xây dựng với 4 microservices chính:

```
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway   │
│   (Next.js)     │◄──►│  (Express GW)   │
└─────────────────┘    └─────────────────┘
                                │
                    ┌───────────┼───────────┐
                    │           │           │
         ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
         │  User Service   │ │  Post Service   │ │  Feed Service   │
         │  (TypeScript)   │ │  (TypeScript)   │ │  (TypeScript)   │
         └─────────────────┘ └─────────────────┘ └─────────────────┘
                    │           │           │
         ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
         │ PostgreSQL DB   │ │ PostgreSQL DB   │ │   Redis Cache   │
         │   (Users)       │ │    (Posts)      │ │    (Feeds)      │
         └─────────────────┘ └─────────────────┘ └─────────────────┘
                    │           │           │
                    └───────────┼───────────┘
                            ┌─────────────────┐
                            │     Kafka       │
                            │ (Event Stream)  │
                            └─────────────────┘
```

### 3.2 Chức Năng Từng Service

#### User Service
- Quản lý đăng ký, đăng nhập người dùng
- Xác thực JWT
- Quản lý quan hệ follow/unfollow
- Publish events khi user thay đổi thông tin

#### Post Service  
- Tạo, đọc, cập nhật, xóa bài viết
- Cache thông tin user để giảm API calls
- Subscribe events từ User Service để đồng bộ cache

#### Feed Service
- Tạo feed cá nhân hóa cho người dùng
- Cache feed trong Redis
- Aggregate dữ liệu từ Post Service

#### API Gateway
- Single entry point cho clients
- Route requests đến appropriate services
- Load balancing và service discovery
- Authentication middleware

---

## 4. Các Pattern Được Áp Dụng Trong Dự Án

### 4.1 Danh Sách Patterns Được Sử Dụng

✅ **API Gateway Pattern**
✅ **Database per Service Pattern**
✅ **Event-driven Architecture**
✅ **Service Registry Pattern (Consul)**
✅ **Health Check Pattern**
✅ **Asynchronous Messaging (Kafka)**
✅ **Caching Pattern (Redis)**
✅ **Authentication Pattern (JWT)**
✅ **Containerization (Docker)**
✅ **Process Manager (PM2)**

### 4.2 Patterns Chưa Được Áp Dụng

❌ **Circuit Breaker Pattern**
❌ **CQRS Pattern**
❌ **Event Sourcing**
❌ **Saga Pattern**
❌ **Bulkhead Pattern**

---

## 5. Chi Tiết Triển Khai Từng Pattern

### 5.1 API Gateway Pattern

#### Mô Tả
API Gateway là single entry point cho tất cả client requests, đóng vai trò như reverse proxy để route requests đến appropriate microservices.

#### Triển Khai Trong Dự Án

**Công Nghệ**: Express Gateway

**File Cấu Hình**: `api-gateway/config/gateway.config.yml`
```yaml
apiEndpoints:
  users:
    paths: '/users/*'
  posts:
    paths: '/posts/*'
  feed:
    paths: '/feed/*'

serviceEndpoints:
  userService:
    url: 'http://user-service:3001'
  postService:
    url: 'http://post-service:3002'
  feedService:
    url: 'http://feed-service:3003'

pipelines:
  users:
    apiEndpoints:
      - users
    policies:
      - proxy:
          action:
            serviceEndpoint: userService
            changeOrigin: true
            stripPath: true
```

**Lợi Ích**:
- Centralized routing và load balancing
- CORS handling cho frontend
- Authentication middleware tập trung
- Service discovery integration

**Code Example**: `api-gateway/server.js`
```javascript
const gateway = require('express-gateway');

gateway()
  .load(path.join(__dirname, 'config'))
  .run()
  .then((app) => {
    console.log('API Gateway is running on port 8080');
  });
```

### 5.2 Database per Service Pattern

#### Mô Tả
Mỗi microservice có database riêng biệt, đảm bảo loose coupling và data autonomy.

#### Triển Khai Trong Dự Án

**User Service**: PostgreSQL Database
```sql
-- User Service Schema
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE follows (
  follower_id UUID REFERENCES users(id),
  following_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id)
);
```

**Post Service**: PostgreSQL Database
```sql
-- Post Service Schema
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Cache table for user info
CREATE TABLE user_reference (
  user_id UUID PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Feed Service**: Redis Cache
```javascript
// Feed Service Redis Usage
const redis = require('redis');
const client = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379
});

// Cache user feed
await client.setex(`feed:${userId}`, 3600, JSON.stringify(feedData));
```

**Lợi Ích**:
- Service independence
- Technology diversity (PostgreSQL + Redis)
- Independent scaling
- Data isolation

### 5.3 Event-driven Architecture với Kafka

#### Mô Tả
Services giao tiếp thông qua events để đảm bảo loose coupling và eventual consistency.

#### Triển Khai Trong Dự Án

**User Service - Event Producer**:
```typescript
// user-service/src/services/kafka.ts
export class KafkaService {
  async sendUserUpdatedEvent(payload: {
    id: string;
    username: string;
    eventType: 'user.created' | 'user.updated';
  }): Promise<void> {
    await this.producer.send({
      topic: 'user-events',
      messages: [{
        key: payload.id,
        value: JSON.stringify({
          id: payload.id,
          username: payload.username,
          eventType: payload.eventType,
          timestamp: new Date().toISOString()
        })
      }]
    });
  }
}
```

**Post Service - Event Consumer**:
```typescript
// post-service/src/services/kafkaService.ts
export class KafkaService {
  constructor(postService: PostService) {
    this.consumer = this.kafka.consumer({ 
      groupId: 'post-service-group'
    });
  }

  private async handleMessage({ message }: { message: KafkaMessage }): Promise<void> {
    const event: UserUpdatedEvent = JSON.parse(message.value.toString());
    
    if (event.eventType === 'user.updated') {
      await this.postService.updateUserReference(event.id, event.username);
    }
  }
}
```

**Event Flow**:
1. User thay đổi username trong User Service
2. User Service publish `user.updated` event lên Kafka
3. Post Service consume event và update cached user info
4. Feed Service có thể consume event để invalidate cache

**Lợi Ích**:
- Asynchronous communication
- Eventual consistency
- Event replay capability
- Service decoupling

### 5.4 Service Registry Pattern với Consul

#### Mô Tả
Consul được sử dụng làm service registry để quản lý service discovery và health checking.

#### Triển Khai Trong Dự Án

**Service Registration**:
```javascript
// api-gateway/consul-service.js
class ConsulServiceRegistry {
  async register() {
    const registration = {
      ID: this.serviceId,
      Name: this.serviceName,
      Address: this.serviceAddress,
      Port: this.servicePort,
      Tags: ['microservice', 'blog', 'api-gateway'],
      Check: {
        HTTP: `http://${this.serviceAddress}:8081/health`,
        Interval: '10s',
        Timeout: '5s',
        DeregisterCriticalServiceAfter: '30s',
      },
    };

    await axios.put(`${this.consulUrl}/v1/agent/service/register`, registration);
  }
}
```

**Service Discovery**:
```javascript
// Service discovery trong API Gateway
async discoverService(serviceName) {
  const response = await axios.get(
    `${this.consulUrl}/v1/health/service/${serviceName}?passing=true`
  );
  return response.data.map(service => ({
    address: service.Service.Address,
    port: service.Service.Port
  }));
}
```

**Health Check Integration**:
```typescript
// Health check endpoint trong mỗi service
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'user-service',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});
```

**Lợi Ích**:
- Automatic service discovery
- Health monitoring
- Load balancing support
- Service metadata management

### 5.5 Caching Pattern với Redis

#### Mô Tả
Redis được sử dụng trong Feed Service để cache feeds và improve performance.

#### Triển Khai Trong Dự Án

**Feed Caching**:
```javascript
// feed-service/src/services/feedService.js
class FeedService {
  async getUserFeed(userId, page = 1, limit = 20) {
    const cacheKey = `feed:${userId}:${page}:${limit}`;
    
    // Try to get from cache first
    const cachedFeed = await this.redis.get(cacheKey);
    if (cachedFeed) {
      return JSON.parse(cachedFeed);
    }
    
    // Generate feed from Post Service
    const feed = await this.generateFeed(userId, page, limit);
    
    // Cache for 1 hour
    await this.redis.setex(cacheKey, 3600, JSON.stringify(feed));
    
    return feed;
  }

  async invalidateUserFeed(userId) {
    const pattern = `feed:${userId}:*`;
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}
```

**Cache Strategies**:
- **Cache-Aside**: Feed service quản lý cache manually
- **TTL-based Expiration**: Cache expires sau 1 hour
- **Cache Invalidation**: Invalidate khi có new posts

**Lợi Ích**:
- Improved response time
- Reduced database load
- Better user experience
- Scalable read operations

### 5.6 Authentication Pattern với JWT

#### Mô Tả
JWT (JSON Web Token) được sử dụng cho stateless authentication across services.

#### Triển Khai Trong Dự Án

**Token Generation** (User Service):
```typescript
// user-service/src/services/authService.ts
class AuthService {
  generateToken(user: User): string {
    const payload = {
      userId: user.id,
      username: user.username,
      email: user.email
    };
    
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '24h',
      issuer: 'user-service'
    });
  }
}
```

**Token Validation** (API Gateway):
```javascript
// api-gateway middleware
const validateJWT = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
```

**Token Usage** (Frontend):
```typescript
// Frontend API calls
const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});
```

**Lợi Ích**:
- Stateless authentication
- Cross-service authentication
- Scalable authentication
- Security through JWT claims

### 5.7 Health Check Pattern

#### Mô Tả
Mỗi service expose health check endpoint để monitoring và service discovery.

#### Triển Khai Trong Dự Án

**Health Check Implementation**:
```typescript
// Common health check pattern
app.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    service: 'post-service',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    dependencies: {}
  };

  try {
    // Check database connection
    await pool.query('SELECT 1');
    health.dependencies.database = 'connected';
  } catch (error) {
    health.dependencies.database = 'disconnected';
    health.status = 'unhealthy';
  }

  try {
    // Check Kafka connection
    const isKafkaHealthy = await kafkaService.isKafkaAvailable();
    health.dependencies.kafka = isKafkaHealthy ? 'connected' : 'disconnected';
  } catch (error) {
    health.dependencies.kafka = 'disconnected';
  }

  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});
```

**Docker Health Check**:
```dockerfile
# Dockerfile health check
HEALTHCHECK --interval=30s --timeout=5s --retries=3 --start-period=10s \
  CMD curl -f http://localhost:3001/health || exit 1
```

**Consul Health Check Integration**:
```javascript
// Consul health check configuration
Check: {
  HTTP: `http://${this.serviceAddress}:${this.servicePort}/health`,
  Interval: '10s',
  Timeout: '5s',
  DeregisterCriticalServiceAfter: '30s',
}
```

**Lợi Ích**:
- Service availability monitoring
- Automatic service deregistration
- Load balancer integration
- Operational visibility

---

## 6. Lợi Ích và Thách Thức

### 6.1 Lợi Ích Đạt Được

#### 6.1.1 Technical Benefits
- **Independent Deployment**: Mỗi service có thể deploy độc lập
- **Technology Diversity**: TypeScript, PostgreSQL, Redis, Kafka
- **Fault Isolation**: Lỗi trong một service không crash toàn bộ hệ thống
- **Scalability**: Scale từng service theo nhu cầu

#### 6.1.2 Business Benefits
- **Faster Development**: Teams có thể work parallel trên different services
- **Easier Maintenance**: Smaller codebases dễ maintain hơn
- **Better Resource Utilization**: Scale chỉ components cần thiết

### 6.2 Thách Thức Gặp Phải

#### 6.2.1 Complexity
- **Network Communication**: Latency và reliability issues
- **Data Consistency**: Eventual consistency thay vì ACID transactions
- **Service Coordination**: Complex interaction patterns

#### 6.2.2 Operational Challenges
- **Monitoring**: Phải monitor nhiều services
- **Debugging**: Distributed tracing cần thiết
- **Deployment**: Container orchestration complexity

#### 6.2.3 Development Challenges
- **Event Ordering**: Kafka event processing order
- **Error Handling**: Distributed error handling
- **Testing**: Integration testing complexity

---

## 7. Kết Luận và Đề Xuất

### 7.1 Đánh Giá Tổng Quan

Dự án Blog Platform đã successfully implement nhiều key microservices patterns:

✅ **Patterns Implemented Successfully**:
- API Gateway với Express Gateway
- Database per Service với PostgreSQL và Redis
- Event-driven Architecture với Kafka
- Service Registry với Consul
- Caching với Redis
- JWT Authentication
- Health Check monitoring

### 7.2 Đề Xuất Cải Thiện

#### 7.2.1 Short-term Improvements

1. **Implement Circuit Breaker Pattern**
```typescript
// Sử dụng opossum library
const CircuitBreaker = require('opossum');

const options = {
  timeout: 3000,
  errorThresholdPercentage: 50,
  resetTimeout: 30000
};

const breaker = new CircuitBreaker(callUserService, options);
```

2. **Add Distributed Tracing**
```typescript
// OpenTelemetry implementation
import { trace } from '@opentelemetry/api';
import { NodeTracerProvider } from '@opentelemetry/sdk-node';

const provider = new NodeTracerProvider();
provider.register();
```

3. **Implement Rate Limiting**
```javascript
// Express rate limiting
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

#### 7.2.2 Long-term Improvements

1. **CQRS Pattern Implementation**
2. **Event Sourcing cho audit trail**
3. **Saga Pattern cho distributed transactions**
4. **Service Mesh với Istio**
5. **Kubernetes deployment**

### 7.3 Lessons Learned

1. **Start Simple**: Begin với basic patterns trước khi add complexity
2. **Observability First**: Logging và monitoring rất critical
3. **Gradual Migration**: Không nên migrate all-at-once từ monolith
4. **Team Organization**: Conway's Law - Architecture phản ánh team structure
5. **Data Consistency**: Accept eventual consistency, design around it

### 7.4 Key Takeaways

- Microservices không phải silver bullet, cần cân nhắc trade-offs
- Operational complexity tăng significantly với distributed systems
- Cultural change cần thiết để adopt microservices successfully
- Investment trong tooling và infrastructure rất quan trọng
- Team autonomy và responsibility rất critical cho success

---

## 📚 Tài Liệu Tham Khảo

1. **Books**:
   - "Microservices Patterns" by Chris Richardson
   - "Building Microservices" by Sam Newman
   - "Microservices Architecture" by Irakli Nadareishvili

2. **Architecture Patterns**:
   - [microservices.io](https://microservices.io/patterns/)
   - [Martin Fowler's Microservices Articles](https://martinfowler.com/microservices/)

3. **Technology Documentation**:
   - [Express Gateway Docs](https://express-gateway.io/)
   - [Apache Kafka Documentation](https://kafka.apache.org/documentation/)
   - [HashiCorp Consul Docs](https://consul.io/docs)
   - [Redis Documentation](https://redis.io/documentation)

4. **Best Practices**:
   - [12-Factor App Methodology](https://12factor.net/)
   - [Container Best Practices](https://docs.docker.com/develop/dev-best-practices/)

---

*Thuyết trình được chuẩn bị bởi: [Tên người thuyết trình]*  
*Ngày: 17/06/2025*  
*Dự án: Blog Microservices Platform*
