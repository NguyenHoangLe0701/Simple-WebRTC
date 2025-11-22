# Self-Hosted TURN Server (Coturn)

⚠️ **Lưu ý**: Thư mục này dành cho việc self-host TURN server bằng Coturn.

## 🎯 Khuyến Nghị

**Nếu bạn không có server riêng**, hãy sử dụng **Metered.ca** (miễn phí, chỉ cần Gmail):
- Xem hướng dẫn: `../TURN_SERVER_SETUP.md`
- Không cần server riêng
- Không cần cấu hình phức tạp
- 500MB/tháng miễn phí

## 🚀 Chỉ Dùng Nếu Bạn Có Server Riêng

Nếu bạn có VPS/server riêng và muốn tự host TURN server:

### 1. Build Docker Image

```bash
docker build -t turnserver .
```

### 2. Chạy Container

```bash
docker run -d \
  --name turnserver \
  -p 3478:3478/tcp \
  -p 3478:3478/udp \
  -p 49152-65535:49152-65535/udp \
  turnserver
```

### 3. Cấu Hình Firewall

Mở các ports sau trên firewall:
- **3478** (TCP/UDP) - TURN/STUN port
- **49152-65535** (UDP) - Relay ports

### 4. Cập Nhật Credentials

1. Sửa file `turnserver.conf`:
   - Thay `your-username:your-secure-password` bằng username/password của bạn
   - Thay `yourdomain.com` bằng domain của bạn

2. Rebuild và restart container

### 5. Cấu Hình Trong WebRTC

Cập nhật `frontend/src/services/webrtc.service.js`:

```javascript
{
  urls: 'turn:your-server-ip:3478',
  username: 'your-username',
  credential: 'your-password'
}
```

## ⚠️ Lưu Ý

- Cần có public IP hoặc domain
- Cần mở firewall ports
- Cần cấu hình SSL nếu dùng TURNS
- Tốn tài nguyên server (bandwidth, CPU)

## ✅ Kết Luận

**Khuyến nghị**: Dùng Metered.ca thay vì self-host, trừ khi:
- Bạn có server riêng
- Cần nhiều bandwidth
- Cần kiểm soát hoàn toàn

