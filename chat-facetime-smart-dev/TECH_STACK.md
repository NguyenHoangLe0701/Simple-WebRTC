## Công nghệ và kiến trúc triển khai

### Frontend
- Framework: React 19 (Vite)
- Router: react-router-dom
- UI Icons: lucide-react
- State cục bộ: React hooks
- Ảo hóa danh sách: react-virtuoso (mượt khi nhiều tin nhắn)
- WebSocket/STOMP: sockjs-client + @stomp/stompjs
- HTTP client: axios (kèm interceptor token)
- Styling: Tailwind CSS (đã cấu hình sẵn)

### Backend (hiện có trong repo)
- Spring Boot REST + STOMP WebSocket
- Endpoints dùng trong FE:
  - REST: `/api/**` (proxy qua Vite)
  - WebSocket SockJS: `/ws`
  - STOMP app destinations: `/app/...`
  - STOMP topics: `/topic/...`

### Signaling WebRTC (cách hoạt động)
1. Khi người dùng bấm gọi trong `ChatRoom` → mở `VideoCall`.
2. `VideoCall.jsx` xin quyền camera/mic (`getUserMedia`) và tạo `RTCPeerConnection` với danh sách ICE servers (STUN, có thể thêm TURN).
3. Lắng nghe `onicecandidate` để gửi ICE candidates qua STOMP:
   - Publish: `/app/signal/{roomId}` → Backend broadcast tới `/topic/room/{roomId}`.
4. Một bên tạo offer (`createOffer`), setLocalDescription và gửi `offer` qua STOMP.
5. Bên kia nhận offer qua subscribe, setRemoteDescription, tạo `answer`, setLocalDescription và gửi lại `answer`.
6. Hai bên liên tục trao đổi ICE candidates cho tới khi kết nối P2P được thiết lập → hiển thị remote stream.

### Chat realtime
- `socketService` quản lý kết nối SockJS/STOMP (singleton), subscribe/publish:
  - Chat: `/app/chat/{roomId}` ↔ `/topic/chat/{roomId}`
  - Presence: `/app/room/{roomId}/join|leave` ↔ `/topic/presence/{roomId}`
  - Signaling: `/app/signal/{roomId}` ↔ `/topic/room/{roomId}`
- `ChatRoom.jsx`:
  - Render 3 phần: Sidebar (kênh/DM + user card), Main (header, messages), Composer.
  - Tin nhắn ảo hóa bằng `Virtuoso` (itemContent custom bubble trái/phải).
  - Tính năng: reply (trích dẫn), edit/delete bản thân, reactions (👍), emoji picker nhẹ, upload ảnh với preview, drag‑and‑drop, search nhanh.

### Proxy & bảo mật
- Dev proxy Vite:
  - `/api` → `http://localhost:8080`
  - `/ws` → `http://localhost:8080` (ws: true)
- Production khuyến nghị:
  - Reverse proxy (Nginx) chuyển `/ws` đến Spring WebSocket.
  - Bắt buộc HTTPS để `getUserMedia` hoạt động.
  - Thêm TURN (coturn) cho NAT traversal (cấu hình username/password).

### Quy trình triển khai
1. Build frontend: `npm run build` → thư mục `dist/`.
2. Deploy backend Spring Boot (Jar/Container) với cấu hình STOMP.
3. Reverse proxy Nginx:
   - `location / { root dist; try_files $uri /index.html; }`
   - `location /ws { proxy_pass http://backend:8080/ws; proxy_http_version 1.1; proxy_set_header Upgrade $http_upgrade; proxy_set_header Connection "upgrade"; }`
   - `location /api { proxy_pass http://backend:8080; }`
4. Cấu hình TURN nếu cần: thêm vào `RTCPeerConnection.iceServers`.

### Giải thích nhanh code chính
- `src/services/socket.js`:
  - Kết nối SockJS → STOMP, quản lý subscribe và publish theo destination.
  - `joinRoom/leaveRoom`, `sendMessage`, `sendSignal`, `subscribeToChat/Presence/Signaling`.
- `src/pages/ChatRoom.jsx`:
  - Kết nối và subscribe chat/presence theo `roomId`.
  - UI:
    - Sidebar: user card, ô tìm kiếm, danh sách kênh/DM.
    - Header: avatar + menu đăng xuất, nút gọi thoại/video.
    - Messages: bubble trái/phải, reply trích dẫn, reactions, edit/delete.
    - Composer: emoji picker nhẹ, upload ảnh preview, drag‑and‑drop, typing indicator.
- `src/components/VideoCall.jsx`:
  - Tạo peerConnection, addTrack local stream.
  - Subscribe signaling qua STOMP; xử lý offer/answer/ICE; gửi tín hiệu bằng `socketService`.

### Nâng cấp kế tiếp (đã gợi ý)
- Mentions @user, unread/pin, notifications desktop.
- Thread chi tiết, reactions đa emoji, upload file lên backend (S3/MinIO).
- Quyền kênh, DM/kênh riêng tư, mời thành viên.


