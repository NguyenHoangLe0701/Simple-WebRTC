# 📁 CẤU TRÚC DỰ ÁN - Simple WebRTC Chat & Video Call

## 📋 MỤC LỤC
1. [Tổng quan dự án](#tổng-quan-dự-án)
2. [Các chức năng chính](#các-chức-năng-chính)
3. [Chi tiết từng chức năng](#chi-tiết-từng-chức-năng)
4. [Luồng hoạt động Frontend → Backend](#luồng-hoạt-động-frontend--backend)
5. [Cây thư mục đầy đủ](#cây-thư-mục-đầy-đủ)

---

## 🎯 TỔNG QUAN DỰ ÁN

**Tên dự án:** Simple WebRTC - Chat & Video Call Smart Dev  
**Mô tả:** Ứng dụng chat real-time với video call, voice call, code editor, AI assistant  
**Tech Stack:**
- **Frontend:** React 18, Vite, TailwindCSS, Socket.IO (STOMP), WebRTC
- **Backend:** Spring Boot 3.x, WebSocket (STOMP), JWT, MySQL 8.0
- **Database:** MySQL 8.0
- **Containerization:** Docker, Docker Compose

---

## 🚀 CÁC CHỨC NĂNG CHÍNH

### 1. **Authentication & Authorization**
- Đăng nhập / Đăng ký
- JWT Token Authentication
- Role-based Access Control (Admin/User)
- Session Management

### 2. **Real-time Chat**
- Chat trong phòng
- Gửi tin nhắn real-time
- Xóa/Sửa tin nhắn
- Reaction emoji
- Reply to message
- Typing indicator

### 3. **Video & Voice Call**
- Video call (WebRTC)
- Voice call (audio only)
- Screen sharing
- Multi-participant support
- Room approval system

### 4. **Room Management**
- Tạo/Xóa phòng
- Join/Leave room
- Room approval (private rooms)
- Room settings (lock, max participants)

### 5. **Code Editor & Execution**
- Code editor với syntax highlighting
- Execute code (Python, JavaScript, Java)
- File management (save/load)
- Docker-based code execution

### 6. **AI Assistant**
- Gemini AI integration
- Chat với AI trong phòng
- Code suggestions

### 7. **Admin Dashboard**
- User management
- Room management
- Security & Sessions
- Database management
- Analytics & Statistics

---

## 📂 CHI TIẾT TỪNG CHỨC NĂNG

### 1. 🔐 AUTHENTICATION & AUTHORIZATION

#### Frontend
**Files:**
- `frontend/src/pages/Login.jsx` - Trang đăng nhập
- `frontend/src/pages/Register.jsx` - Trang đăng ký
- `frontend/src/pages/ForgotPassword.jsx` - Quên mật khẩu
- `frontend/src/services/api.js` - API service với JWT interceptor

**Luồng:**
1. User nhập thông tin → `Login.jsx` / `Register.jsx`
2. Gọi API qua `api.js` → `POST /api/auth/login` hoặc `/api/auth/register`
3. Nhận JWT token → Lưu vào localStorage/sessionStorage
4. Redirect dựa trên role (Admin → `/admin`, User → `/chat`)

#### Backend
**Files:**
- `backend/src/main/java/.../controller/AuthController.java` - REST endpoints
- `backend/src/main/java/.../service/AuthService.java` - Business logic
- `backend/src/main/java/.../config/JwtAuthenticationFilter.java` - JWT filter
- `backend/src/main/java/.../config/SecurityConfig.java` - Security configuration
- `backend/src/main/java/.../util/JwtUtil.java` - JWT utilities
- `backend/src/main/java/.../entity/User.java` - User entity
- `backend/src/main/java/.../repository/UserRepository.java` - User repository

**Endpoints:**
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Lấy thông tin user hiện tại

---

### 2. 💬 REAL-TIME CHAT

#### Frontend
**Files:**
- `frontend/src/pages/ChatRoom.jsx` - Trang chat chính
- `frontend/src/pages/ProfessionalChatRoom.jsx` - Trang chat professional
- `frontend/src/components/ChatBox.jsx` - Component chat box
- `frontend/src/services/socket.js` - WebSocket service (STOMP)

**Luồng:**
1. User vào phòng → `ChatRoom.jsx` mount
2. Kết nối WebSocket qua `socket.js` → `socketService.connect()`
3. Subscribe to chat: `socketService.subscribeToChat(roomId, callback)`
4. Gửi tin nhắn: `socketService.sendMessage(roomId, message)`
5. Nhận tin nhắn real-time qua WebSocket → Update UI

#### Backend
**Files:**
- `backend/src/main/java/.../controller/ChatController.java` - WebSocket message handler
- `backend/src/main/java/.../model/ChatMessage.java` - Chat message model
- `backend/src/main/java/.../service/ChatService.java` - Chat business logic

**WebSocket Topics:**
- `/app/chat/{roomId}` - Gửi tin nhắn
- `/topic/chat/{roomId}` - Nhận tin nhắn broadcast
- `/app/chat/{roomId}/delete` - Xóa tin nhắn
- `/app/chat/{roomId}/edit` - Sửa tin nhắn
- `/app/chat/{roomId}/reaction` - Thêm reaction

**Message Types:**
- `TEXT` - Tin nhắn text
- `DELETE` - Xóa tin nhắn
- `EDIT` - Sửa tin nhắn
- `REACTION` - Reaction emoji

---

### 3. 📹 VIDEO & VOICE CALL

#### Frontend
**Files:**
- `frontend/src/components/EnhancedVideoCall.jsx` - Component video call chính
- `frontend/src/components/ProfessionalVideoCall.jsx` - Professional video call
- `frontend/src/components/VideoCall.jsx` - Basic video call
- `frontend/src/services/webrtc.service.js` - WebRTC service
- `frontend/src/services/socket.js` - Signaling service

**Luồng Video Call:**
1. User click "Gọi video" → `ChatRoom.jsx` → `setIsVideoCall(true)`
2. Mount `EnhancedVideoCall` với `callType='video'`
3. Request media permission → `getUserMedia({ video: true, audio: true })`
4. Initialize WebRTC → `webrtc.service.js`
5. Join room signaling → `socketService.joinRoomWithSignaling(roomId, user)`
6. Tạo offer/answer → WebRTC signaling qua STOMP
7. Exchange ICE candidates → Establish peer connection
8. Display local & remote streams

**Luồng Voice Call:**
1. User click "Gọi thoại" → `ChatRoom.jsx` → `setIsVoiceCall(true)`
2. Mount `EnhancedVideoCall` với `callType='voice'`
3. Request media permission → `getUserMedia({ video: false, audio: true })`
4. Tương tự video call nhưng không có video track

#### Backend
**Files:**
- `backend/src/main/java/.../controller/WebRTCSignalController.java` - WebRTC signaling handler
- `backend/src/main/java/.../controller/RoomWebSocketController.java` - Room presence

**WebSocket Topics:**
- `/app/signal/{roomId}` - Gửi WebRTC signal (offer, answer, ice-candidate)
- `/topic/signal/{roomId}` - Nhận WebRTC signal broadcast
- `/topic/presence/{roomId}` - Presence updates

**Signal Types:**
- `join` - User join room
- `leave` - User leave room
- `offer` - WebRTC offer
- `answer` - WebRTC answer
- `ice-candidate` - ICE candidate

---

### 4. 🏠 ROOM MANAGEMENT

#### Frontend
**Files:**
- `frontend/src/pages/ChatRoom.jsx` - Chat room page
- `frontend/src/pages/ProfessionalChatRoom.jsx` - Professional room
- `frontend/src/pages/ProfessionalRoomsPage.jsx` - Danh sách phòng
- `frontend/src/components/RoomManager.jsx` - Room manager component
- `frontend/src/components/ProfessionalRoomManager.jsx` - Professional room manager
- `frontend/src/components/RoomApprovalOverlay.jsx` - Approval overlay
- `frontend/src/components/WaitingRoom.jsx` - Waiting room
- `frontend/src/components/ProfessionalWaitingRoom.jsx` - Professional waiting room

**Luồng:**
1. User tạo phòng → `RoomManager.jsx` → API call
2. User join phòng → `ChatRoom.jsx` → Check approval
3. Nếu private room → Hiển thị `RoomApprovalOverlay`
4. Host approve → User vào phòng
5. Real-time presence updates qua WebSocket

#### Backend
**Files:**
- `backend/src/main/java/.../controller/RoomController.java` - REST endpoints
- `backend/src/main/java/.../controller/RoomWebSocketController.java` - WebSocket handlers
- `backend/src/main/java/.../service/RoomService.java` - Room business logic
- `backend/src/main/java/.../service/RoomPresenceService.java` - Presence service
- `backend/src/main/java/.../entity/Room.java` - Room entity
- `backend/src/main/java/.../repository/RoomRepository.java` - Room repository

**REST Endpoints:**
- `GET /api/rooms` - Lấy danh sách phòng
- `POST /api/rooms` - Tạo phòng mới
- `GET /api/rooms/{roomId}/info` - Lấy thông tin phòng
- `POST /api/rooms/{roomId}/join` - Join phòng
- `POST /api/rooms/{roomId}/approve` - Approve user
- `POST /api/rooms/{roomId}/reject` - Reject user
- `DELETE /api/rooms/{roomId}` - Xóa phòng

**WebSocket Endpoints:**
- `/app/room/{roomId}/join` - Join room via WebSocket
- `/app/room/{roomId}/leave` - Leave room
- `/app/room/{roomId}/approve` - Approve user
- `/topic/room/{roomId}` - Room events
- `/topic/presence/{roomId}` - Presence updates

---

### 5. 💻 CODE EDITOR & EXECUTION

#### Frontend
**Files:**
- `frontend/src/components/CodeEditor.jsx` - Code editor component
- `frontend/src/services/codeExecutionService.js` - Code execution service
- `frontend/src/services/FileUploadService.js` - File management

**Luồng:**
1. User mở code editor trong chat room
2. User viết code → `CodeEditor.jsx`
3. User click "Run" → `codeExecutionService.executeCode(code, language)`
4. Gọi API → `POST /api/code/execute`
5. Nhận kết quả → Hiển thị output

#### Backend
**Files:**
- `backend/src/main/java/.../controller/CodeExecutionController.java` - REST endpoints
- `backend/src/main/java/.../service/CodeExecutionService.java` - Code execution logic
- `backend/src/main/java/.../service/DockerCodeExecutionService.java` - Docker execution
- `backend/src/main/java/.../entity/CodeSnippet.java` - Code snippet entity
- `backend/src/main/java/.../repository/CodeSnippetRepository.java` - Code repository

**Endpoints:**
- `POST /api/code/execute` - Execute code
- `POST /api/code/save` - Save code snippet
- `GET /api/code/load/{id}` - Load code snippet
- `GET /api/code/list` - List code snippets

**Supported Languages:**
- Python
- JavaScript
- Java

---

### 6. 🤖 AI ASSISTANT

#### Frontend
**Files:**
- `frontend/src/components/AIAssistant.jsx` - AI assistant component

**Luồng:**
1. User mở AI assistant trong chat room
2. User gửi message → `AIAssistant.jsx`
3. Gọi API → `POST /api/ai/chat`
4. Nhận response từ Gemini AI → Hiển thị

#### Backend
**Files:**
- `backend/src/main/java/.../controller/AIController.java` - AI endpoints
- `backend/src/main/java/.../service/AIService.java` - Gemini AI integration
- `backend/src/main/java/.../dto/GeminiDto.java` - Gemini DTOs

**Endpoints:**
- `POST /api/ai/chat` - Chat với AI
- `POST /api/ai/code-suggest` - Code suggestions

---

### 7. 👨‍💼 ADMIN DASHBOARD

#### Frontend
**Files:**
- `frontend/src/pages/AdminDashboard.jsx` - Admin dashboard chính
- `frontend/src/pages/admin/Users.jsx` - User management
- `frontend/src/pages/admin/Security.jsx` - Security management
- `frontend/src/pages/admin/Settings.jsx` - Settings
- `frontend/src/components/admin/*` - Admin components

**Tabs:**
- Overview - Tổng quan
- Users - Quản lý người dùng
- Rooms - Quản lý phòng
- Analytics - Phân tích
- Security - Bảo mật & Sessions
- Database - Quản lý database
- Settings - Cài đặt

#### Backend
**Files:**
- `backend/src/main/java/.../controller/AdminController.java` - Admin endpoints
- `backend/src/main/java/.../service/UserService.java` - User service
- `backend/src/main/java/.../service/SecurityService.java` - Security service

**Endpoints:**
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/users` - List users
- `PUT /api/admin/users/{id}` - Update user
- `DELETE /api/admin/users/{id}` - Delete user
- `GET /api/admin/security/sessions/active` - Active sessions
- `POST /api/admin/security/sessions/{id}/invalidate` - Force logout

---

## 🔄 LUỒNG HOẠT ĐỘNG FRONTEND → BACKEND

### 1. Authentication Flow

```
Frontend (Login.jsx)
    ↓
api.js → POST /api/auth/login
    ↓
Backend (AuthController.java)
    ↓
AuthService.java → Validate credentials
    ↓
JwtUtil.java → Generate JWT token
    ↓
Response: { token, user }
    ↓
Frontend: Save token → Redirect
```

### 2. Chat Message Flow

```
Frontend (ChatRoom.jsx)
    ↓
socket.js → socketService.sendMessage(roomId, message)
    ↓
STOMP: /app/chat/{roomId}
    ↓
Backend (ChatController.java)
    ↓
Process message → Broadcast to /topic/chat/{roomId}
    ↓
All clients receive message via WebSocket
    ↓
Frontend: Update UI with new message
```

### 3. Video Call Flow

```
Frontend (EnhancedVideoCall.jsx)
    ↓
1. Request media → getUserMedia()
    ↓
2. Initialize WebRTC → webrtc.service.js
    ↓
3. Join room → socketService.joinRoomWithSignaling()
    ↓
STOMP: /app/room/{roomId}/join
    ↓
Backend (RoomWebSocketController.java)
    ↓
4. Create offer → webrtcService.createOffer(userId)
    ↓
STOMP: /app/signal/{roomId} → { type: 'offer', offer }
    ↓
Backend (WebRTCSignalController.java) → Broadcast
    ↓
5. Other user receives offer → Create answer
    ↓
STOMP: /app/signal/{roomId} → { type: 'answer', answer }
    ↓
6. Exchange ICE candidates
    ↓
7. Peer connection established → Video streams
```

### 4. Room Join Flow

```
Frontend (ChatRoom.jsx)
    ↓
Check if room exists → API: GET /api/rooms/{roomId}/info
    ↓
If private room:
    ↓
Show RoomApprovalOverlay → Request approval
    ↓
STOMP: /app/room/{roomId}/join
    ↓
Backend (RoomWebSocketController.java)
    ↓
Check if needs approval → Send to host
    ↓
Host approves → STOMP: /app/room/{roomId}/approve
    ↓
Backend → Add to presence → Broadcast approval
    ↓
User receives approval → Enter room
```

### 5. Code Execution Flow

```
Frontend (CodeEditor.jsx)
    ↓
codeExecutionService.executeCode(code, language)
    ↓
API: POST /api/code/execute
    ↓
Backend (CodeExecutionController.java)
    ↓
DockerCodeExecutionService.java
    ↓
Create Docker container → Execute code
    ↓
Return output/error
    ↓
Frontend: Display result
```

---

## 📁 CÂY THƯ MỤC ĐẦY ĐỦ

```
chat-facetime-smart-dev/
│
├── 📁 frontend/
│   ├── 📄 Dockerfile
│   ├── 📄 package.json
│   ├── 📄 vite.config.js
│   ├── 📄 tailwind.config.js
│   ├── 📄 vercel.json
│   │
│   ├── 📁 public/
│   │   └── 📁 images/
│   │       └── 📁 icons/
│   │           ├── logo-simplewebrtc.svg
│   │           ├── admin-logo.png
│   │           └── ... (other icons)
│   │
│   └── 📁 src/
│       ├── 📄 main.jsx
│       ├── 📄 App.jsx
│       ├── 📄 index.css
│       │
│       ├── 📁 pages/
│       │   ├── 📄 Home.jsx
│       │   ├── 📄 Login.jsx
│       │   ├── 📄 Register.jsx
│       │   ├── 📄 ChatRoom.jsx ⭐ (Main chat room)
│       │   ├── 📄 ProfessionalChatRoom.jsx
│       │   ├── 📄 ProfessionalRoomsPage.jsx
│       │   ├── 📄 AdminDashboard.jsx ⭐ (Admin panel)
│       │   ├── 📄 ForgotPassword.jsx
│       │   ├── 📄 FAQ.jsx
│       │   ├── 📄 Pricing.jsx
│       │   ├── 📄 Contact.jsx
│       │   ├── 📄 Consulting.jsx
│       │   ├── 📄 DocsPage.jsx
│       │   │
│       │   └── 📁 admin/
│       │       ├── 📄 Users.jsx
│       │       ├── 📄 Security.jsx
│       │       ├── 📄 Settings.jsx
│       │       ├── 📄 Overview.jsx
│       │       ├── 📄 Chat.jsx
│       │       ├── 📄 Code.jsx
│       │       └── 📄 Video.jsx
│       │
│       ├── 📁 components/
│       │   ├── 📄 EnhancedVideoCall.jsx ⭐ (Video/Voice call)
│       │   ├── 📄 ProfessionalVideoCall.jsx
│       │   ├── 📄 VideoCall.jsx
│       │   ├── 📄 ChatBox.jsx
│       │   ├── 📄 CodeEditor.jsx ⭐ (Code editor)
│       │   ├── 📄 AIAssistant.jsx ⭐ (AI chat)
│       │   ├── 📄 RoomManager.jsx
│       │   ├── 📄 ProfessionalRoomManager.jsx
│       │   ├── 📄 RoomApprovalOverlay.jsx
│       │   ├── 📄 WaitingRoom.jsx
│       │   ├── 📄 ProfessionalWaitingRoom.jsx
│       │   ├── 📄 Header.jsx
│       │   ├── 📄 Footer.jsx
│       │   ├── 📄 Hero.jsx
│       │   └── 📁 admin/
│       │       ├── 📄 AdminHeader.jsx
│       │       ├── 📄 AdminSidebar.jsx
│       │       ├── 📄 UsersTable.jsx
│       │       └── ...
│       │
│       ├── 📁 services/
│       │   ├── 📄 api.js ⭐ (HTTP client + JWT)
│       │   ├── 📄 socket.js ⭐ (WebSocket/STOMP)
│       │   ├── 📄 webrtc.service.js ⭐ (WebRTC logic)
│       │   ├── 📄 codeExecutionService.js
│       │   ├── 📄 FileUploadService.js
│       │   └── 📄 securityService.js
│       │
│       ├── 📁 routes/
│       │   └── 📄 AppRoutes.jsx ⭐ (React Router)
│       │
│       ├── 📁 layouts/
│       │   ├── 📄 MainLayout.jsx
│       │   └── 📄 AdminLayout.jsx
│       │
│       └── 📁 assets/
│           └── 📁 images/
│
├── 📁 backend/
│   ├── 📄 Dockerfile
│   ├── 📄 pom.xml
│   ├── 📄 mvnw
│   │
│   └── 📁 src/
│       └── 📁 main/
│           ├── 📁 java/
│           │   └── 📁 com/smartchat/chatfacetimesmartdev/
│           │       ├── 📄 ChatfacetimesmartdevApplication.java ⭐ (Main class)
│           │       │
│           │       ├── 📁 config/
│           │       │   ├── 📄 SecurityConfig.java ⭐ (Spring Security)
│           │       │   ├── 📄 WebSocketConfig.java ⭐ (STOMP config)
│           │       │   ├── 📄 JwtAuthenticationFilter.java ⭐ (JWT filter)
│           │       │   ├── 📄 DataInitializer.java
│           │       │   └── 📄 SessionCleanupTask.java
│           │       │
│           │       ├── 📁 controller/ ⭐ (REST + WebSocket)
│           │       │   ├── 📄 AuthController.java (POST /api/auth/*)
│           │       │   ├── 📄 ChatController.java (WebSocket: /app/chat/*)
│           │       │   ├── 📄 RoomController.java (GET/POST /api/rooms/*)
│           │       │   ├── 📄 RoomWebSocketController.java (WebSocket: /app/room/*)
│           │       │   ├── 📄 WebRTCSignalController.java ⭐ (WebSocket: /app/signal/*)
│           │       │   ├── 📄 CodeExecutionController.java (POST /api/code/*)
│           │       │   ├── 📄 AIController.java (POST /api/ai/*)
│           │       │   ├── 📄 AdminController.java (GET/PUT/DELETE /api/admin/*)
│           │       │   └── 📄 HealthController.java
│           │       │
│           │       ├── 📁 service/
│           │       │   ├── 📄 AuthService.java ⭐
│           │       │   ├── 📄 ChatService.java
│           │       │   ├── 📄 RoomService.java ⭐
│           │       │   ├── 📄 RoomPresenceService.java ⭐
│           │       │   ├── 📄 UserService.java
│           │       │   ├── 📄 SecurityService.java
│           │       │   ├── 📄 CodeExecutionService.java
│           │       │   ├── 📄 DockerCodeExecutionService.java
│           │       │   ├── 📄 AIService.java
│           │       │   └── 📄 CustomUserDetailsService.java
│           │       │
│           │       ├── 📁 entity/ ⭐ (JPA Entities)
│           │       │   ├── 📄 User.java
│           │       │   ├── 📄 Room.java
│           │       │   ├── 📄 LoginSession.java
│           │       │   └── 📄 CodeSnippet.java
│           │       │
│           │       ├── 📁 repository/ ⭐ (JPA Repositories)
│           │       │   ├── 📄 UserRepository.java
│           │       │   ├── 📄 RoomRepository.java
│           │       │   ├── 📄 LoginSessionRepository.java
│           │       │   └── 📄 CodeSnippetRepository.java
│           │       │
│           │       ├── 📁 dto/ ⭐ (Data Transfer Objects)
│           │       │   ├── 📄 LoginDto.java
│           │       │   ├── 📄 RegisterDto.java
│           │       │   ├── 📄 RoomDto.java
│           │       │   ├── 📄 RoomCreateDto.java
│           │       │   ├── 📄 RoomJoinDto.java
│           │       │   ├── 📄 ChatMessage.java
│           │       │   ├── 📄 UserPresence.java
│           │       │   └── ...
│           │       │
│           │       ├── 📁 model/ (Domain Models)
│           │       │   ├── 📄 ChatMessage.java
│           │       │   ├── 📄 Message.java
│           │       │   └── 📄 CodeSnippet.java
│           │       │
│           │       └── 📁 util/
│           │           └── 📄 JwtUtil.java ⭐
│           │
│           └── 📁 resources/
│               └── 📄 application.properties ⭐ (Config)
│
├── 📁 docker/
│   └── 📄 docker-compose.yml ⭐ (Docker Compose config)
│
├── 📄 PROJECT_STRUCTURE.md (This file)
├── 📄 README.md
└── 📄 .gitignore

```

---

## 🔑 CÁC FILE QUAN TRỌNG NHẤT

### Frontend Core Files:
1. **`frontend/src/pages/ChatRoom.jsx`** - Trang chat chính, tích hợp tất cả features
2. **`frontend/src/components/EnhancedVideoCall.jsx`** - Video/Voice call component
3. **`frontend/src/services/socket.js`** - WebSocket/STOMP service
4. **`frontend/src/services/webrtc.service.js`** - WebRTC peer connection management
5. **`frontend/src/services/api.js`** - HTTP client với JWT interceptor
6. **`frontend/src/routes/AppRoutes.jsx`** - React Router configuration

### Backend Core Files:
1. **`backend/src/main/java/.../ChatfacetimesmartdevApplication.java`** - Spring Boot main class
2. **`backend/src/main/java/.../config/WebSocketConfig.java`** - STOMP WebSocket configuration
3. **`backend/src/main/java/.../config/SecurityConfig.java`** - Spring Security configuration
4. **`backend/src/main/java/.../controller/WebRTCSignalController.java`** - WebRTC signaling handler
5. **`backend/src/main/java/.../controller/ChatController.java`** - Chat WebSocket handler
6. **`backend/src/main/java/.../service/RoomService.java`** - Room business logic
7. **`backend/src/main/resources/application.properties`** - Application configuration

### Docker Files:
1. **`docker/docker-compose.yml`** - Docker Compose configuration (Backend, Frontend, MySQL)
2. **`frontend/Dockerfile`** - Frontend Docker image
3. **`backend/Dockerfile`** - Backend Docker image

---

## 📊 DATABASE SCHEMA

### Tables:
- **users** - User accounts
- **rooms** - Chat rooms
- **room_approved_users** - Room approval mapping
- **login_sessions** - Active user sessions
- **code_snippets** - Saved code snippets
- **messages** - Chat messages (optional, có thể dùng in-memory)

---

## 🌐 API ENDPOINTS SUMMARY

### Authentication:
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập

### Rooms:
- `GET /api/rooms` - List rooms
- `POST /api/rooms` - Create room
- `GET /api/rooms/{id}/info` - Room info
- `POST /api/rooms/{id}/join` - Join room
- `POST /api/rooms/{id}/approve` - Approve user
- `DELETE /api/rooms/{id}` - Delete room

### Admin:
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/users` - List users
- `PUT /api/admin/users/{id}` - Update user
- `DELETE /api/admin/users/{id}` - Delete user
- `GET /api/admin/security/sessions/active` - Active sessions

### Code Execution:
- `POST /api/code/execute` - Execute code
- `POST /api/code/save` - Save code
- `GET /api/code/load/{id}` - Load code

### AI:
- `POST /api/ai/chat` - Chat with AI

---

## 🔌 WEBSOCKET TOPICS

### Chat:
- `/app/chat/{roomId}` - Send message
- `/topic/chat/{roomId}` - Receive messages
- `/app/chat/{roomId}/delete` - Delete message
- `/app/chat/{roomId}/edit` - Edit message
- `/app/chat/{roomId}/reaction` - Add reaction

### Rooms:
- `/app/room/{roomId}/join` - Join room
- `/app/room/{roomId}/leave` - Leave room
- `/app/room/{roomId}/approve` - Approve user
- `/topic/room/{roomId}` - Room events
- `/topic/presence/{roomId}` - Presence updates

### WebRTC:
- `/app/signal/{roomId}` - Send WebRTC signal
- `/topic/signal/{roomId}` - Receive WebRTC signals

### Typing:
- `/app/room/{roomId}/typing/start` - Start typing
- `/app/room/{roomId}/typing/stop` - Stop typing
- `/topic/room/{roomId}/typing` - Typing events

---

## 🚀 DEPLOYMENT

### Docker Compose:
```bash
cd docker
docker-compose up -d
```

### Services:
- **Backend:** `http://localhost:8080`
- **Frontend:** `http://localhost:3000`
- **MySQL:** `localhost:3307`

### Environment Variables:
- `JWT_SECRET` - JWT secret key
- `SPRING_DATASOURCE_URL` - Database URL
- `GEMINI_API_KEY` - Gemini AI API key

---

## 📝 NOTES

- **WebRTC:** Sử dụng STUN/TURN servers (Google STUN + Metered.ca TURN)
- **Presence:** In-memory presence service (có thể nâng cấp lên Redis)
- **Code Execution:** Docker-based isolation
- **Security:** JWT authentication, role-based access control
- **Real-time:** STOMP over WebSocket cho chat và signaling

---

**Last Updated:** 2024-01-15  
**Version:** 1.0.0

