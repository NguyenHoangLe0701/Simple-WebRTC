# 🚀 Hướng dẫn cài đặt và chạy Hệ thống Chat & FaceTime & Code Thông minh

## 📋 Chuẩn bị

### 1. Cài đặt MySQL
- Download và cài đặt MySQL Server 8.0+
- Tạo database:
```sql
CREATE DATABASE smart_chat_db;
```

### 2. Cấu hình Database
Mở file `backend/src/main/resources/application.properties` và cập nhật:
```properties
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

## 🔧 Chạy ứng dụng

### Cách 1: Sử dụng script (Windows)

1. **Chạy Backend:**
   ```bash
   double-click start-backend.bat
   ```

2. **Chạy Frontend:** (mở terminal mới)
   ```bash
   double-click start-frontend.bat
   ```

### Cách 2: Chạy thủ công

1. **Chạy Backend:**
   ```bash
   cd chat-facetime-smart-dev/backend
   mvn spring-boot:run
   ```

2. **Chạy Frontend:** (mở terminal mới)
   ```bash
   cd chat-facetime-smart-dev/frontend
   npm install
   npm run dev
   ```

## 🌐 Truy cập ứng dụng

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8080
- **Admin Dashboard:** http://localhost:5173/admin

## 🔑 Tài khoản test

### Admin Account (Tự động tạo khi chạy lần đầu)
- **Username:** admin
- **Password:** 12345
- **Role:** ADMIN

### User Test Account (Tự động tạo khi chạy lần đầu)
- **Username:** testuser
- **Password:** Test123
- **Email:** test@example.com
- **Role:** USER

## ✨ Tính năng đã hoàn thành

### 🔐 Authentication System
- ✅ Đăng ký với validation mạnh
- ✅ Đăng nhập với JWT
- ✅ Phân quyền Admin/User
- ✅ Middleware bảo mật

### 👥 User Management
- ✅ CRUD operations
- ✅ Role management
- ✅ User status toggle
- ✅ User statistics

### 🎨 Frontend Features
- ✅ Responsive design với Tailwind CSS
- ✅ Form validation
- ✅ Error handling
- ✅ Loading states
- ✅ Professional UI/UX

### 🚀 Admin Dashboard
- ✅ **Tổng quan:** Thống kê người dùng và hoạt động
- ✅ **Quản lý người dùng:** 
  - Xem danh sách users
  - Chỉnh sửa thông tin
  - Thay đổi quyền (Admin/User)
  - Bật/tắt tài khoản
  - Xóa user
- ✅ **Giao diện tabs:** Chat, Video, Code (placeholder)
- ✅ **User detail modal**
- ✅ **Real-time data updates**

## 🔧 API Endpoints

### Authentication
```
POST /api/auth/register - Đăng ký
POST /api/auth/login    - Đăng nhập
GET  /api/auth/me       - Thông tin user hiện tại
```

### Admin Operations
```
GET    /api/admin/dashboard              - Dashboard stats
GET    /api/admin/users                  - Danh sách users
GET    /api/admin/users/{id}            - Thông tin user
PUT    /api/admin/users/{id}/toggle-status - Bật/tắt user
PUT    /api/admin/users/{id}/role        - Cập nhật quyền
DELETE /api/admin/users/{id}            - Xóa user
```

## 🛠️ Validation Rules

### User Registration
- **Username:** Tối thiểu 3 ký tự
- **Email:** Phải có format email hợp lệ (chứa @)
- **Password:** 
  - Tối thiểu 6 ký tự
  - Phải có ít nhất 1 chữ hoa (A-Z)
  - Phải có ít nhất 1 số (0-9)
- **Full Name:** Tối thiểu 2 ký tự

### Admin Login
- Username: `admin` + Password: `12345` → Tự động được role ADMIN

## 🚧 Troubleshooting

### Database Connection Issues
1. Kiểm tra MySQL service đang chạy
2. Verify database `smart_chat_db` đã được tạo
3. Kiểm tra username/password trong `application.properties`

### Frontend Proxy Issues
1. Đảm bảo backend đang chạy ở port 8080
2. Kiểm tra `vite.config.js` có cấu hình proxy đúng

### Build Issues
1. **Backend:** `mvn clean install`
2. **Frontend:** `rm -rf node_modules && npm install`

## 📈 Next Steps

### Planned Features
- [ ] Real-time Chat với WebSocket
- [ ] Video Call với WebRTC
- [ ] Code Editor integration
- [ ] File sharing
- [ ] AI Assistant
- [ ] Screen sharing
- [ ] Notification system

## 🤝 Support

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra console logs
2. Verify database connection
3. Đảm bảo tất cả dependencies đã được cài đặt

---

**Happy Coding! 🎉**
