# Hướng dẫn sửa lỗi CORS

## Vấn đề hiện tại:
- Lỗi: `Access to XMLHttpRequest at 'https://simple-webrtc-4drq.onrender.com/api/auth/login' from origin 'https://simple-web-rtc-two.vercel.app' has been blocked by CORS policy`
- Backend không trả về CORS headers cho preflight request

## Nguyên nhân có thể:

### 1. **Backend trên Render chưa được deploy code mới** ⚠️ (Khả năng cao nhất)
- Code đã sửa CORS trong `SecurityConfig.java` nhưng chưa được deploy lên Render
- Render cần rebuild và redeploy để nhận code mới

### 2. **Cấu hình Environment Variables trên Render**
- Đảm bảo các biến môi trường đã được set đúng
- Kiểm tra database connection strings

### 3. **Frontend Environment Variables trên Vercel**
- Cần set `VITE_API_URL` trên Vercel:
  - Vào Vercel Dashboard → Project Settings → Environment Variables
  - Thêm: `VITE_API_URL` = `https://simple-webrtc-4drq.onrender.com/api`

## Các bước kiểm tra và sửa:

### Bước 1: Kiểm tra và deploy backend lên Render

1. **Commit và push code mới:**
```bash
git add .
git commit -m "Fix CORS configuration"
git push origin main
```

2. **Kiểm tra trên Render Dashboard:**
   - Vào Render Dashboard → Service `simple-webrtc-4drq`
   - Kiểm tra "Events" để xem có build mới không
   - Nếu không tự động build, click "Manual Deploy" → "Deploy latest commit"

3. **Kiểm tra logs trên Render:**
   - Xem logs để đảm bảo application start thành công
   - Không có lỗi compile hay runtime errors

### Bước 2: Kiểm tra CORS headers

Sau khi deploy, test CORS bằng cách gửi preflight request:

```bash
curl -X OPTIONS https://simple-webrtc-4drq.onrender.com/api/auth/login \
  -H "Origin: https://simple-web-rtc-two.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v
```

Response phải có các headers:
- `Access-Control-Allow-Origin: https://simple-web-rtc-two.vercel.app`
- `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH`
- `Access-Control-Allow-Headers: *`
- `Access-Control-Allow-Credentials: true`

### Bước 3: Cấu hình Frontend trên Vercel

1. **Set Environment Variable:**
   - Vào Vercel Dashboard → Project → Settings → Environment Variables
   - Thêm:
     - Key: `VITE_API_URL`
     - Value: `https://simple-webrtc-4drq.onrender.com/api`
     - Environment: Production, Preview, Development

2. **Redeploy Frontend:**
   - Vào Deployments → Click "Redeploy" để rebuild với env vars mới

### Bước 4: Kiểm tra lại

1. Clear browser cache và cookies
2. Test lại login trên `https://simple-web-rtc-two.vercel.app`
3. Kiểm tra Console và Network tab để xem CORS headers

## Nếu vẫn lỗi:

### Kiểm tra SecurityConfig.java đã đúng chưa:

```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(Arrays.asList(
        "https://simple-web-rtc-two.vercel.app",  // ✅ Đúng domain Vercel
        "http://localhost:5173"
    ));
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
    configuration.setAllowedHeaders(Arrays.asList("*"));
    configuration.setExposedHeaders(Arrays.asList("Authorization", "Content-Type"));
    configuration.setAllowCredentials(true);
    configuration.setMaxAge(3600L);
    
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```

### Kiểm tra trong SecurityFilterChain:

```java
.requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()
```

## Lưu ý quan trọng:

⚠️ **Render có thể mất vài phút để rebuild và restart service**
- Sau khi push code, đợi 2-5 phút để build hoàn tất
- Kiểm tra logs để xác nhận service đã start

⚠️ **Frontend cần rebuild sau khi set env vars**
- Vite cần rebuild để inject `VITE_API_URL` vào code
- Redeploy frontend trên Vercel sau khi set env vars

## Debug:

Mở Browser DevTools → Network tab:
1. Xem request OPTIONS (preflight)
2. Kiểm tra Response Headers có `Access-Control-Allow-Origin` không
3. Nếu không có → Backend chưa deploy code mới hoặc có lỗi

