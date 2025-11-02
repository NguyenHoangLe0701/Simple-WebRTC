# Tính năng Realtime - Hướng dẫn sử dụng

## ✅ Các tính năng đã triển khai:

### 1. **Chat Realtime** 💬
- Gửi/nhận tin nhắn realtime qua WebSocket
- Hiển thị typing indicators
- Support emoji, file sharing
- Message threading/reply

### 2. **Video Call & Screen Share** 🎥
- WebRTC video call giữa các participants
- Screen sharing realtime
- Audio/video controls (mute, video on/off)
- Multi-participant support

### 3. **Online Presence** 👥
- Hiển thị trạng thái online/offline của users
- Real-time presence updates
- User list với status indicators

### 4. **Room Approval System** 🔐
- Chủ phòng có quyền chấp nhận/từ chối người vào phòng
- Overlay UI hiển thị yêu cầu tham gia (như hình ảnh mẫu)
- User được thông báo khi chờ duyệt
- Realtime notifications

### 5. **Room Management** 🏠
- Tạo phòng với tên tùy chỉnh
- Đặt phòng public/private
- Quản lý participants
- Room settings (screen share, chat permissions)

## 📋 Cách sử dụng:

### Để tạo phòng và đặt tên:
1. Vào trang Rooms (`/rooms`)
2. Click "Tạo phòng mới"
3. Điền tên phòng, mô tả
4. Chọn Public hoặc Private
5. Click "Tạo phòng"

### Để vào phòng private (cần approval):
1. Click vào phòng private
2. Hệ thống sẽ hiển thị overlay "Lời mời kết bạn"
3. User sẽ thấy trạng thái "Đang chờ duyệt"
4. Chủ phòng sẽ nhận notification về yêu cầu
5. Chủ phòng click nút "Yêu cầu" ở header để xem và duyệt

### Để chủ phòng duyệt/từ chối:
1. Click nút "Yêu cầu" (có icon UserPlus) ở header phòng
2. Overlay sẽ hiển thị danh sách users đang chờ
3. Tab "Đã nhận" - xem các yêu cầu chờ duyệt
4. Click "Chấp nhận" (✓) hoặc "Từ chối" (✗)
5. User sẽ được thông báo realtime về kết quả

### Để chat realtime:
1. Vào phòng đã được approve
2. Gõ tin nhắn ở input box
3. Click Send hoặc Enter
4. Tin nhắn hiển thị realtime cho tất cả users

### Để gọi video:
1. Click nút "Gọi video" ở sidebar hoặc header
2. Cho phép camera và microphone
3. Video call sẽ bắt đầu
4. Có thể share screen bằng nút Monitor

### Để share màn hình:
1. Trong video call, click nút "Share Screen"
2. Chọn màn hình/window muốn share
3. Tất cả participants sẽ thấy màn hình của bạn

## 🔧 Technical Details:

### Backend:
- WebSocket endpoint: `/ws`
- STOMP topics:
  - `/topic/chat/{roomId}` - Chat messages
  - `/topic/presence/{roomId}` - User presence
  - `/topic/room/{roomId}` - Signaling for WebRTC
  - `/topic/room/{roomId}/approval` - Approval notifications
  - `/user/queue/approval-status` - User-specific approval status

### Frontend:
- Socket Service: `src/services/socket.js`
- Main Chat Room: `src/pages/ProfessionalChatRoom.jsx`
- Approval Overlay: `src/components/RoomApprovalOverlay.jsx`
- Video Call: `src/components/ProfessionalVideoCall.jsx`

### API Endpoints:
- `GET /api/rooms/{roomId}/info` - Lấy thông tin phòng
- `POST /api/rooms` - Tạo phòng mới
- `POST /api/rooms/{roomId}/join` - Tham gia phòng
- `POST /api/rooms/{roomId}/approve` - Duyệt user (host only)
- `POST /api/rooms/{roomId}/reject` - Từ chối user (host only)

## 🎨 UI Features:
- Modern gradient design
- Responsive layout
- Real-time status indicators
- Smooth animations
- Overlay modals cho approval system

## ⚠️ Lưu ý:
- Phòng public: Mọi người có thể vào trực tiếp
- Phòng private: Cần được host duyệt
- Host luôn được approve tự động
- Approval notifications là realtime, không cần refresh

