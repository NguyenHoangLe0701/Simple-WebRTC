# Hệ Thống Chat & FaceTime & Code Thông Minh cho Lập Trình Viên
**Realtime chat, video call và collaborative code editor dành cho lập trình viên** — xây dựng bằng **React + Tailwind (Frontend)** và **Spring Boot (Backend)**, sử dụng **WebSocket (signaling)** và **WebRTC** cho media P2P. Hỗ trợ mở rộng AI (OpenRouter), Monaco editor, Docker, và cơ chế tính phí (Stripe).

---

## Short description (EN)
Realtime chat & video call platform with collaborative code editor for developers — built with React, WebRTC, WebSocket (Spring Boot), and Tailwind. Ideal for pair-programming, quick video help, and code sharing.

---

## Tính năng chính (Features)
- Đăng ký / đăng nhập (JWT)
- Chat thời gian thực (WebSocket / STOMP)
- Gọi video/audio P2P (WebRTC; signaling qua WebSocket)
- Collaborative code editor (Monaco) — share / sync code trong room
- Dashboard admin: quản lý user, xem ai đang online
- Tích hợp AI hỗ trợ dev (OpenRouter / LLM) — code suggestion, tóm tắt
- Hỗ trợ deploy bằng Docker / docker-compose
- (Mở rộng) Thanh toán / subscription (Stripe) và TURN server cho NAT

---

## Công nghệ (Tech stack)
- Frontend: React, Vite, Tailwind CSS, react-router-dom, monaco-editor
- Backend: Spring Boot, Spring WebSocket (STOMP/SockJS), Spring Data JPA, Spring Security (JWT)
- DB: PostgreSQL hoặc MySQL
- Realtime / Media: WebSocket (signaling) + WebRTC, STUN/TURN (coturn)
- DevOps: Docker, docker-compose
- AI: OpenRouter (proxy từ backend)

---

## Cấu trúc thư mục gợi ý
