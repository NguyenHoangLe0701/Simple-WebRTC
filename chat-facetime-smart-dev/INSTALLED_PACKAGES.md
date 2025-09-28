## Các gói đã cài (frontend)

Phiên bản lấy từ `frontend/package.json`:

Runtime dependencies:
- @stomp/stompjs: ^7.2.0
- axios: ^1.12.2
- emoji-mart: ^5.6.0 (đã thay bằng emoji picker nội bộ để tránh xung đột React 19)
- lucide-react: ^0.544.0
- react: ^19.1.1
- react-dom: ^19.1.1
- react-router-dom: ^7.8.2
- react-virtuoso: ^4.14.0
- sockjs-client: ^1.6.1

Dev dependencies:
- @eslint/js: ^9.33.0
- @types/react: ^19.1.10
- @types/react-dom: ^19.1.7
- @vitejs/plugin-react: ^5.0.0
- autoprefixer: ^10.4.21
- eslint: ^9.33.0
- eslint-plugin-react-hooks: ^5.2.0
- eslint-plugin-react-refresh: ^0.4.20
- globals: ^16.3.0
- postcss: ^8.5.6
- tailwindcss: ^3.4.17
- vite: ^7.1.2

Ghi chú:
- Emoji picker hiện dùng bản nội bộ (không phụ thuộc lib ngoài) để tương thích React 19. Nếu hạ React xuống 18, có thể dùng `@emoji-mart/react`.

