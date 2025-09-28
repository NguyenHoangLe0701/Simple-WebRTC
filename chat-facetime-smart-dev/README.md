# Hệ Thống Chat & FaceTime & Code Thông Minh

Hệ thống chat, video call và code editor thông minh dành cho lập trình viên, được xây dựng với Spring Boot (Backend) và React (Frontend).

## 🚀 Tính năng chính

### Backend (Spring Boot)
- ✅ Hệ thống xác thực JWT với Spring Security
- ✅ Quản lý người dùng với MySQL
- ✅ API RESTful cho đăng nhập/đăng ký
- ✅ Admin Dashboard API
- ✅ WebSocket cho real-time communication
- ✅ Validation dữ liệu đầu vào

### Frontend (React)
- ✅ Giao diện đăng nhập/đăng ký chuyên nghiệp
- ✅ Admin Dashboard với đầy đủ chức năng quản lý
- ✅ Validation form phía client
- ✅ Responsive design với Tailwind CSS
- ✅ Quản lý state với React Hooks

## 📋 Yêu cầu hệ thống

- Java 17+
- Node.js 16+
- MySQL 8.0+
- Maven 3.6+

## 🛠️ Cài đặt và chạy

### 1. Cài đặt Backend

```bash
cd chat-facetime-smart-dev/backend

# Cài đặt dependencies
mvn clean install

# Chạy ứng dụng
mvn spring-boot:run
```

Backend sẽ chạy tại: `http://localhost:8080`

### 2. Cài đặt Frontend

```bash
cd chat-facetime-smart-dev/frontend

# Cài đặt dependencies
npm install

# Chạy ứng dụng
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:5173`

### 3. Cấu hình Database

1. Tạo database MySQL:
```sql
CREATE DATABASE smart_chat_db;
```

2. Cập nhật thông tin database trong `application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/smart_chat_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=your_password
```

## 🔐 Tài khoản mặc định

### Admin
- **Username:** admin
- **Password:** 12345

### User thường
- Đăng ký tài khoản mới với validation:
  - Email phải chứa ký tự @
  - Mật khẩu phải có ít nhất 1 chữ hoa và 1 số
  - Username tối thiểu 3 ký tự

## 📁 Cấu trúc dự án

```
chat-facetime-smart-dev/
├── backend/
│   ├── src/main/java/
│   │   ├── config/          # Cấu hình Spring Security, WebSocket
│   │   ├── controller/      # REST Controllers
│   │   ├── dto/            # Data Transfer Objects
│   │   ├── entity/         # JPA Entities
│   │   ├── repository/     # JPA Repositories
│   │   ├── service/        # Business Logic
│   │   └── util/           # Utilities (JWT, etc.)
│   └── src/main/resources/
│       └── application.properties
├── frontend/
│   ├── src/
│   │   ├── components/     # React Components
│   │   ├── pages/          # Page Components
│   │   ├── routes/         # Routing Configuration
│   │   └── services/       # API Services
│   └── package.json
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký
- `GET /api/auth/me` - Lấy thông tin user hiện tại

### Admin
- `GET /api/admin/dashboard` - Thống kê dashboard
- `GET /api/admin/users` - Danh sách users
- `PUT /api/admin/users/{id}/toggle-status` - Bật/tắt user
- `PUT /api/admin/users/{id}/role` - Cập nhật quyền user
- `DELETE /api/admin/users/{id}` - Xóa user

## 🎨 Giao diện Admin Dashboard

### Tính năng chính:
- **Tổng quan:** Thống kê người dùng, hoạt động gần đây
- **Quản lý người dùng:** CRUD operations, phân quyền
- **Quản lý chat:** (Đang phát triển)
- **Quản lý video call:** (Đang phát triển)
- **Quản lý code:** (Đang phát triển)
- **Cài đặt hệ thống:** (Đang phát triển)

## 🚧 Tính năng đang phát triển

- [ ] WebSocket cho real-time chat
- [ ] Video call với WebRTC
- [ ] Code editor tích hợp
- [ ] AI assistant cho lập trình
- [ ] File sharing
- [ ] Screen sharing

## 📝 Ghi chú

- Backend sử dụng JWT cho authentication
- Frontend sử dụng localStorage để lưu token
- Database tự động tạo bảng khi chạy lần đầu
- CORS đã được cấu hình cho development

## 🤝 Đóng góp

1. Fork dự án
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.