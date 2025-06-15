# Prompt cho GPT để tạo Frontend Blog với v0.dev

Tôi cần bạn tạo một frontend cho hệ thống blog microservices với các yêu cầu sau:

## Tổng quan dự án:
- Hệ thống blog với kiến trúc microservices
- API Gateway chạy trên port 8080 (http://localhost:8080)
- Hỗ trợ đăng ký, đăng nhập, tạo bài viết, theo dõi người dùng và xem feed cá nhân
- Sử dụng JWT Authentication

## API Endpoints cần tích hợp:

### 1. User Authentication & Management
```
Base URL: http://localhost:8080

POST /register
Body: { "username": "string", "email": "string", "password": "string" }
Response: { "message": "string", "user": {...}, "token": "string" }

POST /login
Body: { "email": "string", "password": "string" }
Response: { "message": "string", "user": {...}, "token": "string" }

GET /users/{id}
Headers: Authorization: Bearer <token>
Response: { "id": "string", "username": "string" }

GET /users/{id}/following
Headers: Authorization: Bearer <token>
Response: [{ "id": "string", "username": "string" }]

POST /users/{id}/follow
Headers: Authorization: Bearer <token>
Body: { "targetUserId": "string" }
Response: { "message": "string" }
```

### 2. Posts Management
```
POST /posts
Headers: Authorization: Bearer <token>
Body: { "title": "string", "content": "string" }
Response: { "id": "string", "author_id": "string", "username": "string", "title": "string", "content": "string", "created_at": "string" }

GET /posts?user_ids=id1,id2&limit=10&sort=desc
Response: [{ "id": "string", "author_id": "string", "username": "string", "title": "string", "content": "string", "created_at": "string" }]

GET /posts/{id}
Response: { "id": "string", "author_id": "string", "username": "string", "title": "string", "content": "string", "created_at": "string" }
```

### 3. Personalized Feed
```
GET /feed?limit=50
Headers: Authorization: Bearer <token>
Response: [{ "id": "string", "author_id": "string", "username": "string", "title": "string", "content": "string", "created_at": "string" }]
```

## Yêu cầu Frontend:

### 1. Trang chính (Pages):
- **Login/Register Page**: Form đăng nhập và đăng ký
- **Home/Feed Page**: Hiển thị feed cá nhân của người dùng
- **Profile Page**: Hiển thị thông tin cá nhân và bài viết của user
- **Create Post Page**: Form tạo bài viết mới
- **Post Detail Page**: Xem chi tiết bài viết

### 2. Components chính:
- **Header/Navigation**: Logo, menu, user avatar, logout
- **Post Card**: Hiển thị bài viết (title, content, author, date)
- **Post Form**: Form tạo/chỉnh sửa bài viết
- **User Card**: Hiển thị thông tin user với nút follow
- **Feed**: Danh sách các bài viết
- **Auth Forms**: Login và Register forms

### 3. Tính năng cần có:
- Authentication với JWT token storage
- Responsive design cho mobile và desktop
- Loading states và error handling
- Infinite scroll hoặc pagination cho feed
- Real-time updates (optional)
- Search functionality (optional)

### 4. UI/UX Requirements:
- Modern, clean design
- Dark/Light mode toggle
- Smooth animations và transitions
- Accessible (ARIA labels, keyboard navigation)
- Professional color scheme

### 5. Tech Stack gợi ý:
- React 18+ với TypeScript
- State management: Zustand hoặc Context API
- HTTP Client: Axios hoặc Fetch
- Styling: Tailwind CSS
- Routing: React Router
- Form handling: React Hook Form
- Icons: Lucide React

### 6. Authentication Flow:
- Lưu JWT token trong localStorage
- Tự động redirect đến login nếu token expired
- Protected routes cho authenticated users
- Auto-logout khi token hết hạn

### 7. Error Handling:
- Toast notifications cho success/error messages
- Form validation
- Network error handling
- 404 page cho routes không tồn tại

## Ví dụ Data Structures:
```typescript
interface User {
  id: string;
  username: string;
  email?: string;
}

interface Post {
  id: string;
  author_id: string;
  username: string;
  title: string;
  content: string;
  created_at: string;
}

interface AuthResponse {
  message: string;
  user: User;
  token: string;
}
```

Hãy tạo một ứng dụng blog frontend hoàn chỉnh với tất cả các tính năng trên, sử dụng v0.dev để tạo ra một giao diện đẹp, hiện đại và dễ sử dụng.
