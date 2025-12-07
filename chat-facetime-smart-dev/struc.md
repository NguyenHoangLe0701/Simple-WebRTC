# Hướng dẫn Tích hợp Lịch sử Tin nhắn

Phần này mô tả các bước cần thiết để thêm tính năng lưu và truy xuất lịch sử tin nhắn cho từng người dùng vào dự án.

## 1. Cập nhật Backend (Spring Boot)

Mục tiêu là tạo một cơ sở để lưu trữ mọi tin nhắn được gửi đi và cung cấp một API để truy xuất chúng.

### Bước 1: Tạo Bảng `chat_messages` trong Database

Bạn không cần tạo bảng thủ công. JPA với cấu hình `spring.jpa.hibernate.ddl-auto=update` trong file `application.properties` sẽ tự động tạo bảng khi bạn định nghĩa Entity dưới đây.

### Bước 2: Tạo `ChatMessage` Entity

Tạo một file mới `ChatMessage.java` trong thư mục `chat-facetime-smart-dev/backend/src/main/java/com/example/chatfacetimesmartdev/entity/` để định nghĩa cấu trúc của một tin nhắn.

**File cần tạo:** `backend/src/main/java/com/example/chatfacetimesmartdev/entity/ChatMessage.java`

```java
package com.example.chatfacetimesmartdev.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
@Data
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @ManyToOne
    @JoinColumn(name = "recipient_id", nullable = false)
    private User recipient;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @PrePersist
    protected void onCreate() {
        this.timestamp = LocalDateTime.now();
    }
}
package com.example.chatfacetimesmartdev.repository;

import com.example.chatfacetimesmartdev.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    @Query("SELECT m FROM ChatMessage m WHERE (m.sender.id = :userId1 AND m.recipient.id = :userId2) OR (m.sender.id = :userId2 AND m.recipient.id = :userId1) ORDER BY m.timestamp ASC")
    List<ChatMessage> findChatHistory(@Param("userId1") Long userId1, @Param("userId2") Long userId2);
}
package com.example.chatfacetimesmartdev.service;

// Interface
public interface MessageService {
    ChatMessage saveMessage(ChatMessage chatMessage);
    List<ChatMessage> getChatHistory(Long userId1, Long userId2);
}
package com.example.chatfacetimesmartdev.service.impl;

// Implementation
// Inject ChatMessageRepository và UserRepository
// Implement phương thức saveMessage và getChatHistory
package com.example.chatfacetimesmartdev.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.List;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    // Inject MessageService

    @GetMapping("/history/{userId1}/{userId2}")
    public ResponseEntity<List<ChatMessage>> getChatHistory(@PathVariable Long userId1, @PathVariable Long userId2) {
        // Gọi service để lấy lịch sử tin nhắn
        // Trả về danh sách tin nhắn
        return ResponseEntity.ok(messageService.getChatHistory(userId1, userId2));
    }
}
// Thêm hàm mới
export const getChatHistory = async (userId1, userId2, token) => {
  const response = await fetch(`/api/messages/history/${userId1}/`, {
    headers: {
      'Authorization': `Bearer `
    }
  });
  if (!response.ok) {
    throw new Error('Failed to fetch chat history');
  }
  return response.json();
};
import React, { useEffect, useState } from 'react';
import { getChatHistory } from '../services/apiService';

const ChatRoom = ({ currentUser, selectedUser }) => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (selectedUser) {
      const fetchHistory = async () => {
        try {
          const token = localStorage.getItem('token'); // Lấy token từ localStorage
          const history = await getChatHistory(currentUser.id, selectedUser.id, token);
          setMessages(history);
        } catch (error) {
          console.error("Error fetching chat history:", error);
        }
      };
      fetchHistory();
    }
  }, [currentUser, selectedUser]); // Effect này sẽ chạy lại khi selectedUser thay đổi

  // ... logic nhận tin nhắn mới từ WebSocket
  // Khi có tin nhắn mới, thêm nó vào state `messages`
  // ví dụ: setMessages(prevMessages => [...prevMessages, newMessage]);

  return (
    // JSX để render danh sách tin nhắn từ state `messages`
  );
};
# Dự án: chat-facetime-smart-dev

Tập tin này mô tả đầy đủ cấu trúc file và thư mục của dự án (toàn bộ workspace), kèm mô tả ngắn cho từng mục. Nội dung được tạo dựa trên việc quét toàn bộ thư mục `frontend/`, `backend/`, `docker/` và các file ở root.

---

## Root (thư mục gốc)

- `CORS_FIX_GUIDE.md` — Hướng dẫn cấu hình CORS.
- `REALTIME_FEATURES.md` — Mô tả tính năng realtime của dự án.
- `docker/` — Thư mục chứa cấu hình docker-compose và biến môi trường cho môi trường deploy.
- `frontend/` — Ứng dụng frontend (React + Vite).
- `backend/` — Ứng dụng backend (Spring Boot / Maven).

---

## Thư mục `docker/`

- `docker-compose.yml` — Compose file để chạy các service (frontend/backend/db...).
- `.env` — Biến môi trường dùng cho docker-compose (file hiện mở trong editor).

---

## Thư mục `backend/` (Spring Boot)

Mô tả: ứng dụng backend Java (Maven). Bao gồm mã nguồn trong `src/`, cấu hình Maven, script wrapper, Dockerfile và các file cấu hình.

- `.gitattributes` — Git attributes.
- `.gitignore` — Các file/đường dẫn bị bỏ qua bởi Git.
- `.env.cloud` — Biến môi trường dùng cho môi trường cloud (file riêng trong repo).
- `Dockerfile` — Dockerfile để build image backend.
- `HELP.md` — Ghi chú/huớng dẫn cho backend.
- `mvnw`, `mvnw.cmd` — Maven wrapper scripts.
- `pom.xml` — Maven build configuration (dependencies, plugins, ...).
- `.mvn/wrapper/maven-wrapper.properties` — cấu hình Maven wrapper.

### Thư mục `backend/src`

- `main/resources/application.properties` — cấu hình Spring Boot.
- `main/resources/.env` — biến môi trường nội bộ cho backend (được lưu trong resources).

### Java source: `backend/src/main/java/com/smartchat/chatfacetimesmartdev/`

- `ChatfacetimesmartdevApplication.java` — entry point của ứng dụng Spring Boot.

Thư mục `config/`:
- `DataInitializer.java` — (init dữ liệu mẫu lúc khởi động).
- `JwtAuthenticationFilter.java` — filter JWT cho authentication.
- `SecurityConfig.java` — cấu hình Spring Security.
- `WebSocketConfig.java` — cấu hình WebSocket / STOMP.

Thư mục `controller/`:
- `AdminController.java` — API dành cho admin.
- `AuthController.java` — API cho đăng nhập/đăng ký.
- `ChatController.java` — API chat (REST).
- `RoomController.java` — API quản lý phòng.
- `RoomWebSocketController.java` — Controller xử lý tin nhắn WebSocket cho room.

Thư mục `dto/` (Data Transfer Objects):
- `AuthResponseDto.java` — DTO phản hồi auth.
- `LoginDto.java` — DTO login.
- `RegisterDto.java` — DTO register.
- `RoomApprovalDto.java` — DTO phê duyệt phòng.
- `RoomCreateDto.java` — DTO tạo phòng.
- `RoomDto.java` — DTO phòng.
- `RoomJoinDto.java` — DTO tham gia phòng.
- `UserPresence.java` — thông tin presence của user.

Thư mục `entity/`:
- `Room.java` — Entity JPA cho Room.
- `User.java` — Entity JPA cho User.

Thư mục `model/` (mô hình dữ liệu dùng trong runtime):
- `ChatMessage.java` — model tin nhắn chat.
- `CodeSnippet.java` — model đoạn code (code sharing feature).
- `Message.java` — model chung cho message.
- `User.java` — model user (không trùng với entity, dùng ở tầng model).

Thư mục `repository/`:
- `CodeSnippetRepository.java` — repository JPA cho code snippets.
- `MessageRepository.java` — repository tin nhắn.
- `RoomRepository.java` — repository phòng.
- `UserRepository.java` — repository user.

Thư mục `service/`:
- `AIService.java` — service tích hợp AI (nếu có).
- `AuthService.java` — logic xác thực.
- `ChatService.java` — logic chat.
- `CustomUserDetailsService.java` — tích hợp Spring Security UserDetailsService.
- `InMemoryPresenceService.java` — implementation của presence lưu trong memory.
- `PresenceService.java` — interface cho presence.
- `RoomPresenceService.java` — quản lý presence theo room.
- `RoomService.java` — logic quản lý room.
- `UserService.java` — logic user.

Thư mục `util/`:
- `JwtUtil.java` — helper cho JWT.

### Test

- `src/test/java/com/smartchat/chatfacetimesmartdev/ChatfacetimesmartdevApplicationTests.java` — test unit cơ bản.

### Thư mục build/output (target/)

Trong repo có thư mục `target/` (kết quả build Maven). Nội dung chứa `classes/`, `generated-sources/`, `test-classes/` v.v. Các file trong `target/` là artifacts do build tạo ra (không cần edit trực tiếp):

- `target/classes/application.properties`
- `target/classes/com/...` — các class đã biên dịch tuân theo cấu trúc package. (Chi tiết: có nhiều file .class, copy của cấu trúc source.)

> Ghi chú: `target/` là output build; nó được liệt kê để tính đầy đủ cấu trúc nhưng thường bị ignore trong VCS.

---

## Thư mục `frontend/` (React + Vite)

Mô tả: Ứng dụng frontend viết bằng React (JSX), cấu hình bằng Vite. Sử dụng Tailwind CSS.

- `.gitignore` — các file bỏ qua cho frontend.
- `Dockerfile` — (nếu có) Dockerfile để build frontend. (Có một `Dockerfile` trên root frontend folder theo attachments.)
- `package.json` — mô tả package, scripts, dependencies.
- `package-lock.json` — lockfile npm.
- `vite.config.js` — cấu hình Vite.
- `postcss.config.js` — cấu hình PostCSS.
- `tailwind.config.js` — cấu hình Tailwind.
- `vercel.json` — cấu hình deploy trên Vercel (nếu dùng).
- `eslint.config.js` — cấu hình eslint.
- `index.html` — entry HTML của ứng dụng.

### Thư mục `frontend/public/`

- `public/images/` — chứa assets tĩnh dùng cho frontend (icons, vite.svg, ...).

### Thư mục `frontend/src/`

- `main.jsx` — điểm khởi chạy React (mount app vào DOM).
- `index.css` — CSS global (Tailwind imports...).
- `App.jsx` — component App chính.
- `App.css` — style cho App (tùy chỉnh).

Thư mục `assets/`:
- `assets/images/` — chứa ảnh minh hoạ, icons, ví dụ: `github/`, `icons/`.

Thư mục `components/` (các component UI, reusable):
- `AIAssistant.jsx` — component trợ lý AI.
- `ChatBox.jsx` — component hộp chat.
- `CodeEditor.jsx` — component chỉnh sửa code (có thể dùng cho share code realtime).
- `ContentDocs.jsx`, `DocContent.jsx`, `HeaderDocs.jsx`, `SidebarDocs.jsx` — component liên quan docs.
- `EnhancedVideoCall.jsx`, `VideoCall.jsx`, `ProfessionalVideoCall.jsx` — component cuộc gọi video / WebRTC.
- `Features.jsx`, `Footer.jsx`, `Header.jsx`, `Hero.jsx` — các phần UI public.
- `ProfessionalRoomManager.jsx`, `ProfessionalWaitingRoom.jsx`, `RoomManager.jsx`, `WaitingRoom.jsx` — quản lý phòng và chờ.
- `RoomApprovalOverlay.jsx` — overlay phê duyệt phòng.
- `RoomManager.jsx` — quản lý các phòng chat.
- `Sidebar.jsx` — sidebar site.
- `admin/` — subfolder chứa component cho admin:
  - `AdminHeader.jsx`, `AdminSidebar.jsx`, `SidebarLink.jsx`, `StatCard.jsx`, `StatsCards.jsx`, `UsersTable.jsx`.

Thư mục `layouts/`:
- `AdminLayout.jsx` — layout cho admin.
- `MainLayout.jsx` — layout mặc định.

Thư mục `pages/` (các route/page chính):
- `Home.jsx`, `HomePage.jsx`, `Login.jsx`, `Register.jsx`, `ForgotPassword.jsx`, `ChatRoom.jsx`, `ProfessionalChatRoom.jsx`, `ProfessionalRoomsPage.jsx`, `Pricing.jsx`, `Contact.jsx`, `Consulting.jsx`, `DocsPage.jsx`, `FAQ.jsx`.
- `admin/` pages: `Chat.jsx`, `Code.jsx`, `Overview.jsx`, `Settings.jsx`, `Users.jsx`, `Video.jsx`.

Thư mục `routes/`:
- `AppRoutes.jsx` — định nghĩa các route của ứng dụng.

Thư mục `services/`:
- `api.js` — wrapper HTTP API (fetch/axios) gọi backend.
- `socket.js` — wrapper/khởi tạo socket (WebSocket / Socket.IO) dùng cho realtime.

Thư mục `css/`:
- `main.css` — các style chính (có thể chứa Tailwind base/utility overrides).

---

## Những file/cấu trúc khác (tóm tắt)

- `frontend/Dockerfile` — nếu có, file build image frontend.
- `backend/target/` — kết quả build của Maven (nhiều file .class, resources copy).

---

## Mô tả ngắn về các thành phần chính và vai trò

- Frontend: React app chịu trách nhiệm giao diện, gọi backend API và kết nối real-time (WebSocket) hoặc WebRTC cho video call.
- Backend: Spring Boot cung cấp REST API, WebSocket/STOMP endpoints, authentication (JWT), room management, persistence (thông qua repositories).
- Docker: docker-compose để chạy toàn bộ stack cục bộ hoặc trong môi trường dev/prod.

---

## Lưu ý quan trọng

- File `target/` là output build; nội dung có thể khác giữa các lần build. Nếu bạn muốn một danh sách chính xác tuyệt đối của từng file trong `target/`, hãy chạy `mvn clean package` rồi quét lại.
- Tôi đã liệt kê theo cấu trúc thư mục và tên file chính xác như có trong repository tại thời điểm quét. Nếu cần, tôi có thể bổ sung mô tả chi tiết cho từng file nguồn (ví dụ nội dung các controller, dịch vụ cụ thể) bằng cách mở và đọc file tương ứng.

---

Tôi đã tạo file `struc.md` này dựa trên quét repository. Nếu bạn muốn tôi mở rộng mô tả (ví dụ: mô tả từng endpoint REST, từng phương thức public quan trọng, hoặc nội dung file `application.properties`), cho biết phạm vi chi tiết bạn muốn (ví dụ: "mô tả từng controller" hoặc "mô tả từng component React").
